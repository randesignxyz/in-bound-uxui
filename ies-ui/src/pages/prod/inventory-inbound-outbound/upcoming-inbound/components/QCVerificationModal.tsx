import { useEffect, useMemo, useState } from 'react';
import {
  Alert,
  Button,
  Descriptions,
  Empty,
  Form,
  Input,
  List,
  Modal,
  Select,
  Space,
  Table,
  Tag,
  Typography,
} from 'antd';
import type { ColumnsType } from 'antd/es/table';
import type { GoodsReceipt, GRItem, InboundProcessState, QcDecision } from '../workflow';
import {
  getGoodsReceiptSourceColor,
  getPOLinkStatusColor,
  getReceiptPOReferences,
  goodsReceiptSourceLabel,
  poLinkStatusLabel,
  summarizePOReferences,
  summarizeSuppliers,
} from '../workflow';
import {
  EyeOutlined,
  FileExcelOutlined,
  FileImageOutlined,
  FilePdfOutlined,
  FileTextOutlined,
} from '@ant-design/icons';
import { FullscreenModal } from './FullscreenModal';

const { Text } = Typography;
const { TextArea } = Input;

type EditableQCItem = GRItem & {
  index: number;
};

interface QCVerificationSubmitPayload {
  items: GRItem[];
  processState: InboundProcessState;
  qcResult: GoodsReceipt['qcResult'];
  exceptionReason?: string;
  stepTitle: string;
}

interface QCVerificationModalProps {
  open: boolean;
  receipt: GoodsReceipt;
  onClose: () => void;
  onSubmit: (payload: QCVerificationSubmitPayload) => Promise<boolean> | boolean;
}

function summarizeQcRouting(items: GRItem[]) {
  const passedItems = items.filter((item) => item.qcDecision === 'Pass');
  const correctionItems = items.filter(
    (item) => item.qcDecision === 'Reject' || item.qcDecision === 'On-Hold',
  );

  if (passedItems.length > 0 && correctionItems.length > 0) {
    return {
      type: 'warning' as const,
      message:
        'Mixed QC result: passed items and received quantities will move to supervisor review, while rejected or on-hold items will return to warehouse correction.',
    };
  }

  if (correctionItems.length > 0) {
    return {
      type: 'warning' as const,
      message:
        'All reviewed items will return to warehouse correction after this QC submission.',
    };
  }

  return {
    type: 'success' as const,
    message:
      'All reviewed items and received quantities will move to supervisor review after this QC submission.',
  };
}

function deriveOutcome(items: GRItem[]): Pick<QCVerificationSubmitPayload, 'processState' | 'qcResult' | 'exceptionReason' | 'stepTitle'> {
  const passedCount = items.filter((item) => item.qcDecision === 'Pass').length;
  const rejected = items.filter((item) => item.qcDecision === 'Reject');
  if (rejected.length > 0) {
    return {
      processState: 'CORRECTION_REQUIRED',
      qcResult: 'Rejected',
      exceptionReason: rejected
        .map((item) => `${item.code}: ${item.qcRemark?.trim() || 'Rejected during QC'}`)
        .join('; '),
      stepTitle:
        passedCount > 0
          ? 'QC forwarded passed item(s) to supervisor and returned rejected item(s) for correction'
          : 'QC rejected item(s) and returned receipt to warehouse for correction',
    };
  }

  const onHold = items.filter((item) => item.qcDecision === 'On-Hold');
  if (onHold.length > 0) {
    return {
      processState: 'CORRECTION_REQUIRED',
      qcResult: 'On Hold',
      exceptionReason: onHold
        .map((item) => `${item.code}: ${item.qcRemark?.trim() || 'Marked on hold during QC'}`)
        .join('; '),
      stepTitle:
        passedCount > 0
          ? 'QC forwarded passed item(s) to supervisor and returned on-hold item(s) for correction'
          : 'QC placed item(s) on hold and returned receipt to warehouse for correction',
    };
  }

  return {
    processState: 'PENDING_SUPERVISOR_REVIEW',
    qcResult: 'Pass',
    exceptionReason: '',
    stepTitle: 'QC approved and forwarded to warehouse supervisor',
  };
}

export function QCVerificationModal({
  open,
  receipt,
  onClose,
  onSubmit,
}: QCVerificationModalProps) {
  const [items, setItems] = useState<GRItem[]>(receipt.items);
  const [errors, setErrors] = useState<Record<string, boolean>>({});
  const [remarkEditorIndex, setRemarkEditorIndex] = useState<number | null>(null);
  const [draftRemark, setDraftRemark] = useState('');
  const [selectedDocument, setSelectedDocument] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!open) return;
    setItems(
      receipt.items.map((item) => ({
        ...item,
        qcDecision: item.qcDecision,
        qcRemark: item.qcRemark || '',
      })),
    );
    setErrors({});
    setRemarkEditorIndex(null);
    setDraftRemark('');
    setSelectedDocument(null);
  }, [open, receipt]);

  const batchSummary = useMemo(() => {
    const uniqueBatch = Array.from(
      new Set(receipt.items.map((item) => item.batchNumber).filter(Boolean)),
    );
    return uniqueBatch.length > 0 ? uniqueBatch.join(', ') : 'N/A';
  }, [receipt.items]);

  const routingSummary = useMemo(() => summarizeQcRouting(items), [items]);

  const updateItem = (index: number, field: 'qcDecision' | 'qcRemark', value: string) => {
    setItems((prev) =>
      prev.map((item, itemIndex) => (itemIndex === index ? { ...item, [field]: value } : item)),
    );
    setErrors((prev) => ({
      ...prev,
      [`decision-${index}`]: false,
      [`remark-${index}`]: false,
    }));
  };

  const openRemarkEditor = (index: number) => {
    setRemarkEditorIndex(index);
    setDraftRemark(items[index]?.qcRemark || '');
  };

  const handleSaveRemark = () => {
    if (remarkEditorIndex === null) return;
    updateItem(remarkEditorIndex, 'qcRemark', draftRemark);
    setRemarkEditorIndex(null);
    setDraftRemark('');
  };

  const validate = () => {
    const nextErrors: Record<string, boolean> = {};

    items.forEach((item, index) => {
      if (!item.qcDecision) {
        nextErrors[`decision-${index}`] = true;
      }
      if (
        (item.qcDecision === 'On-Hold' || item.qcDecision === 'Reject') &&
        !item.qcRemark?.trim()
      ) {
        nextErrors[`remark-${index}`] = true;
      }
    });

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    setIsSubmitting(true);
    try {
      const outcome = deriveOutcome(items);
      const shouldClose = await onSubmit({
        items,
        ...outcome,
      });
      if (shouldClose) {
        onClose();
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const columns: ColumnsType<EditableQCItem> = [
    {
      title: 'Item',
      dataIndex: 'code',
      key: 'code',
      width: 180,
      render: (_value, record) => (
        <div>
          <div style={{ fontWeight: 500 }}>{record.code}</div>
          <div style={{ fontSize: 12, color: '#666' }}>{record.name}</div>
        </div>
      ),
    },
    {
      title: 'PO',
      dataIndex: 'poNumber',
      key: 'poNumber',
      width: 120,
      render: (value: string) => <Tag>{value}</Tag>,
    },
    {
      title: 'Supplier',
      dataIndex: 'supplier',
      key: 'supplier',
      width: 160,
      ellipsis: true,
    },
    {
      title: 'PO Qty',
      dataIndex: 'poQty',
      key: 'poQty',
      width: 90,
      align: 'right',
      render: (value: number) => value.toLocaleString(),
    },
    {
      title: 'Received Qty',
      dataIndex: 'receiveQty',
      key: 'receiveQty',
      width: 110,
      align: 'right',
      render: (value: number) => value.toLocaleString(),
    },
    {
      title: 'UoM',
      dataIndex: 'uom',
      key: 'uom',
      width: 80,
    },
    {
      title: 'Product Date',
      dataIndex: 'productDate',
      key: 'productDate',
      width: 130,
      render: (value: string) => value || '-',
    },
    {
      title: 'Expiry',
      dataIndex: 'expiryDate',
      key: 'expiryDate',
      width: 130,
    },
    {
      title: 'Receipt Status',
      key: 'receiptStatus',
      width: 130,
      render: (_value, record) => {
        if (record.isMissing) return <Tag color="error">Missing</Tag>;
        if (record.receiveQty < record.poQty) return <Tag color="warning">Short</Tag>;
        return <Tag color="success">Matched</Tag>;
      },
    },
    {
      title: 'Remark',
      key: 'remark',
      width: 160,
      render: (_value, record) => (
        <Button
          type={errors[`remark-${record.index}`] ? 'primary' : 'default'}
          danger={errors[`remark-${record.index}`]}
          onClick={() => openRemarkEditor(record.index)}
        >
          {record.qcRemark?.trim() ? 'View / Edit Remark' : 'Add Remark'}
        </Button>
      ),
    },
    {
      title: 'Decision',
      key: 'decision',
      width: 160,
      render: (_value, record) => (
        <Select<QcDecision>
          style={{ width: '100%' }}
          placeholder="Select decision"
          value={record.qcDecision}
          onChange={(value) => updateItem(record.index, 'qcDecision', value)}
          status={errors[`decision-${record.index}`] ? 'error' : undefined}
          options={[
            { value: 'Pass', label: 'Pass' },
            { value: 'On-Hold', label: 'On-Hold' },
            { value: 'Reject', label: 'Reject' },
          ]}
        />
      ),
    },
  ];

  const getDocumentIcon = (fileName: string) => {
    const lowerName = fileName.toLowerCase();
    if (lowerName.endsWith('.xlsx') || lowerName.endsWith('.xls')) {
      return <FileExcelOutlined style={{ color: '#52c41a', fontSize: 18 }} />;
    }
    if (lowerName.endsWith('.pdf')) {
      return <FilePdfOutlined style={{ color: '#ff4d4f', fontSize: 18 }} />;
    }
    if (
      lowerName.endsWith('.jpg') ||
      lowerName.endsWith('.jpeg') ||
      lowerName.endsWith('.png') ||
      lowerName.endsWith('.webp')
    ) {
      return <FileImageOutlined style={{ color: '#1677ff', fontSize: 18 }} />;
    }
    return <FileTextOutlined style={{ color: '#8c8c8c', fontSize: 18 }} />;
  };

  return (
    <>
      <FullscreenModal
        title="Check And Verify Inbound Receiving"
        open={open}
        onCancel={onClose}
        footer={null}
        destroyOnClose
      >
        <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
          <div style={{ flex: 1, overflowY: 'auto', padding: '24px 24px 0' }}>
            {receipt.receiptSourceType === 'TEMP_NO_PO' && (
              <Alert
                type={receipt.poLinkStatus === 'WAITING_PO' ? 'warning' : 'success'}
                showIcon
                style={{ marginBottom: 20 }}
                message={
                  receipt.poLinkStatus === 'WAITING_PO'
                    ? 'Temporary inbound receiving is still waiting for SAP PO link.'
                    : `Temporary inbound receiving linked to ${receipt.linkedPoNumber}.`
                }
              />
            )}
            <Alert
              type={routingSummary.type}
              showIcon
              style={{ marginBottom: 20 }}
              message={routingSummary.message}
            />
            <Descriptions column={3} size="small" style={{ marginTop: 10, marginBottom: 28 }}>
            <Descriptions.Item label="PO Reference">{summarizePOReferences(receipt)}</Descriptions.Item>
            <Descriptions.Item label="Supplier">{summarizeSuppliers(receipt)}</Descriptions.Item>
            <Descriptions.Item label="Receipt Type">
              <Tag color={receipt.receiptType === 'Planned' ? 'blue' : 'orange'}>
                {receipt.receiptType}
              </Tag>
            </Descriptions.Item>
            <Descriptions.Item label="Source">
              <Tag color={getGoodsReceiptSourceColor(receipt.receiptSourceType)}>
                {goodsReceiptSourceLabel[receipt.receiptSourceType]}
              </Tag>
            </Descriptions.Item>
            <Descriptions.Item label="PO Link">
              <Tag color={getPOLinkStatusColor(receipt.poLinkStatus)}>
                {poLinkStatusLabel[receipt.poLinkStatus]}
              </Tag>
            </Descriptions.Item>
            <Descriptions.Item label="Temp Ref">
              {receipt.tempReferenceNo || '-'}
            </Descriptions.Item>
            <Descriptions.Item label="PO List" span={2}>
              {getReceiptPOReferences(receipt).length > 0
                ? getReceiptPOReferences(receipt)
                    .map((reference) => `${reference.poNumber} (${reference.supplier})`)
                    .join(', ')
                : <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="No SAP PO linked yet" />}
            </Descriptions.Item>
            <Descriptions.Item label="Expected Date">
              {receipt.expectedDate || 'N/A'}
              {receipt.expectedTime ? ` ${receipt.expectedTime}` : ''}
            </Descriptions.Item>
            <Descriptions.Item label="Batch Number">{batchSummary}</Descriptions.Item>
            <Descriptions.Item label="Receiver">{receipt.createdBy}</Descriptions.Item>
          </Descriptions>
          <div style={{ marginBottom: 24 }}>
            <h4 style={{ marginBottom: 12 }}>Item Receipt Review</h4>
            <Table
              size="small"
              columns={columns}
              dataSource={items.map((item, index) => ({
                ...item,
                index,
                key: `${item.poNumber}-${item.code}-${index}`,
              }))}
              pagination={false}
              scroll={{ x: 1460 }}
              tableLayout="auto"
            />
          </div>

            <Form layout="vertical" style={{ marginBottom: 24 }}>
              <Form.Item label="Supporting Documents">
                {receipt.documentChecklist.supportingDocs.length > 0 ? (
                  <List
                    bordered
                    size="small"
                    dataSource={receipt.documentChecklist.supportingDocs}
                    renderItem={(doc) => (
                      <List.Item
                        actions={[
                          <Button
                            key={`view-${doc}`}
                            type="link"
                            icon={<EyeOutlined />}
                            onClick={() => setSelectedDocument(doc)}
                          >
                            View
                          </Button>,
                        ]}
                      >
                        <List.Item.Meta
                          avatar={getDocumentIcon(doc)}
                          title={<Text>{doc}</Text>}
                        />
                      </List.Item>
                    )}
                  />
                ) : (
                  <Text type="secondary">No supporting documents attached.</Text>
                )}
              </Form.Item>
            </Form>
          </div>

          <div
            style={{
              textAlign: 'right',
              borderTop: '1px solid #f0f0f0',
              padding: '16px 24px',
              background: '#fff',
            }}
          >
            <Space>
              <Button onClick={onClose} disabled={isSubmitting}>
                Cancel
              </Button>
              <Button type="primary" onClick={handleSubmit} disabled={isSubmitting} loading={isSubmitting}>
                Submit QC Review
              </Button>
            </Space>
          </div>
        </div>
      </FullscreenModal>

      <Modal
        title="QC Remark"
        open={remarkEditorIndex !== null}
        onCancel={() => setRemarkEditorIndex(null)}
        onOk={handleSaveRemark}
        width={640}
        destroyOnClose
      >
        <TextArea
          rows={10}
          placeholder="Add inspection note or reason for this item"
          value={draftRemark}
          onChange={(event) => setDraftRemark(event.target.value)}
        />
      </Modal>

      <Modal
        title={selectedDocument || 'Document Preview'}
        open={selectedDocument !== null}
        onCancel={() => setSelectedDocument(null)}
        footer={null}
        width={720}
        destroyOnClose
      >
        {selectedDocument && (
          <div style={{ paddingTop: 8 }}>
            <Space align="start" size={12} style={{ marginBottom: 16 }}>
              {getDocumentIcon(selectedDocument)}
              <div>
                <div style={{ fontWeight: 600 }}>{selectedDocument}</div>
                <Text type="secondary">
                  QC review attachment preview.
                </Text>
              </div>
            </Space>

            <div
              style={{
                minHeight: 260,
                border: '1px solid #f0f0f0',
                borderRadius: 8,
                background: '#fafafa',
                padding: 16,
              }}
            >
              <div style={{ fontWeight: 600, marginBottom: 8 }}>Preview</div>
              <Text type="secondary">
                Attachment preview is not yet connected to a real file viewer. Wire this dialog to
                backend document storage when the document endpoint is ready.
              </Text>
            </div>
          </div>
        )}
      </Modal>
    </>
  );
}
