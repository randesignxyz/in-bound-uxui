import { useEffect, useMemo, useState } from 'react';
import {
  Alert,
  Button,
  Descriptions,
  Empty,
  Form,
  Input,
  Modal,
  Select,
  Space,
  Table,
  Tag,
  Upload,
  message,
} from 'antd';
import type { UploadFile, UploadProps } from 'antd';
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
  InboxOutlined,
} from '@ant-design/icons';
import {
  applyUploadedSupportingDocs,
  hasIncompleteAppFilesUpload,
  normalizeUploadFileList,
  previewSupportingUploadFile,
  stageSupportingDocBeforeUpload,
  supportingDocsToUploadFiles,
  uploadPendingSupportingDocs,
} from '../supportingDocs';
import { FullscreenModal } from './FullscreenModal';
import { SupportingDocsList } from './SupportingDocsList';

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
  documentChecklist: GoodsReceipt['documentChecklist'];
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
  const [uploadedFiles, setUploadedFiles] = useState<UploadFile[]>([]);
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
    setUploadedFiles(supportingDocsToUploadFiles(receipt.documentChecklist.supportingDocs || []));
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

  const handleUploadChange: UploadProps['onChange'] = (info) => {
    setUploadedFiles(normalizeUploadFileList(info.fileList, 10, 'QC'));
  };

  const removeFile = (uid: string) => {
    setUploadedFiles((prev) => prev.filter((file) => file.uid !== uid));
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
    if (hasIncompleteAppFilesUpload(uploadedFiles)) {
      message.error('Remove failed files before submitting.');
      return;
    }
    setIsSubmitting(true);
    try {
      const supportingDocs = await uploadPendingSupportingDocs(uploadedFiles, 'QC');
      setUploadedFiles((prev) => applyUploadedSupportingDocs(prev, supportingDocs));
      const outcome = deriveOutcome(items);
      const shouldClose = await onSubmit({
        items,
        ...outcome,
        documentChecklist: {
          ...receipt.documentChecklist,
          supportingDocs,
        },
      });
      if (shouldClose) {
        onClose();
      }
    } catch (error: any) {
      message.error(error?.message || 'Failed to prepare supporting documents.');
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
                <Upload
                  multiple
                  beforeUpload={stageSupportingDocBeforeUpload}
                  fileList={uploadedFiles}
                  showUploadList={false}
                  onChange={handleUploadChange}
                  onRemove={(file) => {
                    removeFile(file.uid);
                    return true;
                  }}
                  onPreview={(file) => previewSupportingUploadFile(file)}
                  accept=".pdf,.doc,.docx,image/*"
                  listType="text"
                >
                  <Button icon={<InboxOutlined />}>Upload QC Photos / PDF / Notes</Button>
                </Upload>
                <div style={{ fontSize: 12, color: '#999', marginTop: 6, marginBottom: 12 }}>
                  QC files stay local until you submit the review.
                </div>
                <SupportingDocsList
                  files={uploadedFiles}
                  fallbackSource="QC"
                  onRemoveFile={removeFile}
                />
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
    </>
  );
}
