import { useEffect, useState } from 'react';
import { Alert, Button, Descriptions, Empty, Input, Space, Table, Tag, message } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import type { GoodsReceipt, GRItem } from '../workflow';
import {
  getGoodsReceiptSourceColor,
  getPOLinkStatusColor,
  getReceiptPOReferences,
  goodsReceiptSourceLabel,
  poLinkStatusLabel,
  summarizePOReferences,
  summarizeSuppliers,
} from '../workflow';
import { FullscreenModal } from './FullscreenModal';
import { SupportingDocsList } from './SupportingDocsList';

const { TextArea } = Input;

interface SupervisorReviewModalProps {
  open: boolean;
  receipt: GoodsReceipt;
  onClose: () => void;
  onSubmit: (payload: { action: 'approve' | 'reject'; note?: string }) => Promise<boolean> | boolean;
}

export function SupervisorReviewModal({
  open,
  receipt,
  onClose,
  onSubmit,
}: SupervisorReviewModalProps) {
  const [note, setNote] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!open) return;
    setNote('');
  }, [open, receipt.grNumber]);

  const columns: ColumnsType<GRItem> = [
    {
      title: 'Item',
      dataIndex: 'code',
      key: 'code',
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
      title: 'Received Qty',
      dataIndex: 'receiveQty',
      key: 'receiveQty',
      width: 120,
      align: 'right',
      render: (value: number) => value.toLocaleString(),
    },
    {
      title: 'UoM',
      dataIndex: 'uom',
      key: 'uom',
      width: 90,
    },
    {
      title: 'Product Date',
      dataIndex: 'productDate',
      key: 'productDate',
      width: 130,
      render: (value: string) => value || '-',
    },
    {
      title: 'Batch Number',
      dataIndex: 'batchNumber',
      key: 'batchNumber',
      width: 180,
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
      title: 'Receipt Remark',
      key: 'missingRemark',
      width: 180,
      render: (_value, record) => record.missingRemark?.trim() || '-',
    },
    {
      title: 'QC Decision',
      key: 'qcDecision',
      width: 140,
      render: (_value, record) => (
        <Tag color={record.qcDecision === 'Reject' ? 'red' : record.qcDecision === 'On-Hold' ? 'gold' : 'green'}>
          {record.qcDecision || 'Pass'}
        </Tag>
      ),
    },
    {
      title: 'QC Remark',
      key: 'qcRemark',
      render: (_value, record) => record.qcRemark?.trim() || '-',
    },
  ];

  return (
    <FullscreenModal
      title="Supervisor Review Inbound Receiving"
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
                    ? 'Temporary inbound receiving is approved operationally, but still waiting for SAP PO link.'
                    : `Temporary inbound receiving linked to ${receipt.linkedPoNumber}.`
                }
              />
          )}
          <Descriptions column={3} size="small" style={{ marginTop: 10, marginBottom: 24 }}>
          <Descriptions.Item label="Receiving Number">{receipt.receivingNumber || receipt.grNumber}</Descriptions.Item>
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
          <Descriptions.Item label="Receiver">{receipt.createdBy}</Descriptions.Item>
          <Descriptions.Item label="QC Reviewed By">{receipt.approvedBy || 'qam.inspector'}</Descriptions.Item>
          <Descriptions.Item label="Temp Ref">{receipt.tempReferenceNo || '-'}</Descriptions.Item>
          <Descriptions.Item label="Expected Date">
            {receipt.expectedDate || 'N/A'}
            {receipt.expectedTime ? ` ${receipt.expectedTime}` : ''}
          </Descriptions.Item>
          <Descriptions.Item label="QC Result">
            <Tag color={receipt.qcResult === 'Pass' ? 'green' : 'gold'}>{receipt.qcResult}</Tag>
          </Descriptions.Item>
          <Descriptions.Item label="Documents">
            {receipt.documentChecklist.supportingDocs.length}
          </Descriptions.Item>
          <Descriptions.Item label="PO List" span={3}>
            {getReceiptPOReferences(receipt).length > 0
              ? getReceiptPOReferences(receipt)
                  .map((reference) => `${reference.poNumber} (${reference.supplier})`)
                  .join(', ')
              : <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="No SAP PO linked yet" />}
          </Descriptions.Item>
        </Descriptions>

        <div style={{ marginBottom: 24 }}>
          <div style={{ fontWeight: 600, marginBottom: 12 }}>Receipt Items</div>
          <Table
            size="small"
            rowKey={(row) => `${row.poNumber}-${row.code}-${row.batchNumber || 'row'}`}
            columns={columns}
            dataSource={receipt.items}
            pagination={false}
            scroll={{ x: 1380 }}
          />
        </div>

        <div style={{ marginBottom: 24 }}>
          <div style={{ fontWeight: 600, marginBottom: 10 }}>Documents For Review</div>
          <SupportingDocsList docs={receipt.documentChecklist.supportingDocs} />
        </div>

          <div style={{ marginBottom: 8 }}>
            <div style={{ fontWeight: 600, marginBottom: 8 }}>Supervisor Note</div>
            <TextArea
              rows={4}
              placeholder="Optional approval note for the warehouse team"
              value={note}
              onChange={(event) => setNote(event.target.value)}
            />
          </div>
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
            <Button
              danger
              disabled={isSubmitting}
              loading={isSubmitting}
              onClick={async () => {
                const trimmedNote = note.trim();
                if (!trimmedNote) {
                  message.error('Please add a note before rejecting this inbound receiving.');
                  return;
                }
                setIsSubmitting(true);
                try {
                  await onSubmit({ action: 'reject', note: trimmedNote });
                } finally {
                  setIsSubmitting(false);
                }
              }}
            >
              Reject Receiving
            </Button>
            <Button
              type="primary"
              disabled={isSubmitting}
              loading={isSubmitting}
              onClick={async () => {
                setIsSubmitting(true);
                try {
                  await onSubmit({ action: 'approve', note: note.trim() || undefined });
                } finally {
                  setIsSubmitting(false);
                }
              }}
            >
              Approve As GR Ready
            </Button>
          </Space>
        </div>
      </div>

    </FullscreenModal>
  );
}
