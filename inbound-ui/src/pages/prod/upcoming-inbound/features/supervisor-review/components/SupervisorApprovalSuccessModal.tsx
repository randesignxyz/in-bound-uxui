import React from 'react';
import { CheckOutlined, InboxOutlined, UserOutlined } from '@ant-design/icons';

import { Button, Modal, Tag, Typography } from 'antd';
import type { GoodsReceipt } from '../../../core/workflow';


const { Text, Title } = Typography;

export interface SupervisorApprovalSuccessData {
  approvedBy: string;
  approvedDate: string;
  approvedGrNumber?: string;
  receivingNumber?: string;
  note?: string;
  poNumber: string;
  poReferences: GoodsReceipt['poReferences'];
  receiptType: GoodsReceipt['receiptType'];
  receiverWarehouseName: string;
  supplier: string;
  supplierNames: string[];
}

interface SupervisorApprovalSuccessModalProps {
  data: SupervisorApprovalSuccessData | null;
  onClose: () => void;
  open: boolean;
}

export function SupervisorApprovalSuccessModal({
  data,
  onClose,
  open,
}: SupervisorApprovalSuccessModalProps) {
  if (!data) return null;

  const poReferences =
    data.poReferences?.length > 0
      ? data.poReferences
      : [{ poNumber: data.poNumber, supplier: data.supplier }];
  const supplierNames = data.supplierNames?.length > 0 ? data.supplierNames : [data.supplier];
  const poReferenceSummary =
    poReferences.length === 1 ? poReferences[0].poNumber : `${poReferences.length} POs`;
  const supplierSummary =
    supplierNames.length === 1 ? supplierNames[0] : `${supplierNames.length} suppliers`;

  return (
    <Modal
      title={null}
      open={open}
      onCancel={onClose}
      footer={null}
      width={640}
      centered
      destroyOnClose
      bodyStyle={{ padding: 0 }}
      modalRender={(node) => (
        <div style={{ borderRadius: 12, overflow: 'hidden' }}>{node}</div>
      )}
    >
      {/* Success Result Header */}
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '30px 40px 16px', textAlign: 'center' }}>
        <div
          style={{
            width: 64,
            height: 64,
            backgroundColor: '#52c41a',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: 16,
            boxShadow: '0 10px 15px -3px rgba(82, 196, 26, 0.2)',
          }}
        >
          <CheckOutlined style={{ fontSize: 32, color: '#ffffff', fontWeight: 700 }} />
        </div>
        <Title level={3} style={{ margin: '0 0 4px', fontWeight: 600, color: '#1b1c1c' }}>
          Approval Successful
        </Title>
        <Text style={{ color: '#5f5e5e', fontSize: 14, display: 'block', maxWidth: 440, margin: 0 }}>
          Inbound receiving <Text strong style={{ color: '#1b1c1c' }}>{data.receivingNumber || '-'}</Text> has been approved and is ready to post to SAP.
        </Text>
      </div>

      {/* Grid Content */}
      <div style={{ padding: '0 40px 24px' }}>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(2, 1fr)',
            columnGap: 40,
            rowGap: 16,
            maxWidth: 540,
            margin: '0 auto',
          }}
        >
          {/* IR Number */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            <span style={{ fontSize: 11, color: '#5f5e5e', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 500 }}>IR Number</span>
            <span style={{ fontSize: 16, fontWeight: 600, color: '#1b1c1c', fontFamily: 'monospace' }}>{data.receivingNumber || '-'}</span>
          </div>

          {/* SAP GR Number */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            <span style={{ fontSize: 11, color: '#5f5e5e', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 500 }}>SAP GR Number</span>
            {data.approvedGrNumber ? (
              <span style={{ fontSize: 16, fontWeight: 600, color: '#1b1c1c', fontFamily: 'monospace' }}>{data.approvedGrNumber}</span>
            ) : (
              <span style={{ fontSize: 14, color: '#8c8c8c', fontStyle: 'italic' }}>Waiting SAP GR</span>
            )}
          </div>

          {/* PO Reference */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            <span style={{ fontSize: 11, color: '#5f5e5e', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 500 }}>PO Reference</span>
            <span style={{ fontSize: 16, fontWeight: 600, color: '#1b1c1c', fontFamily: 'monospace' }}>{poReferenceSummary}</span>
          </div>

          {/* Supplier */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            <span style={{ fontSize: 11, color: '#5f5e5e', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 500 }}>Supplier</span>
            <span style={{ fontSize: 14, color: '#1b1c1c', fontWeight: 600 }}>{supplierSummary}</span>
          </div>

          {/* Receipt Type */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            <span style={{ fontSize: 11, color: '#5f5e5e', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 500 }}>Receipt Type</span>
            <div style={{ display: 'flex', marginTop: 2 }}>
              <Tag color={data.receiptType === 'Planned' ? 'blue' : 'orange'} style={{ margin: 0, fontWeight: 600 }}>
                {data.receiptType}
              </Tag>
            </div>
          </div>

          {/* Approved By */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            <span style={{ fontSize: 11, color: '#5f5e5e', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 500 }}>Approved By</span>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <UserOutlined style={{ fontSize: 14, color: '#5f5e5e' }} />
              <span style={{ fontSize: 14, color: '#1b1c1c' }}>{data.approvedBy}</span>
            </div>
          </div>

          {/* Approved Date */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            <span style={{ fontSize: 11, color: '#5f5e5e', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 500 }}>Approved Date</span>
            <span style={{ fontSize: 14, color: '#1b1c1c', fontFamily: 'monospace' }}>{data.approvedDate}</span>
          </div>

          {/* Warehouse */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            <span style={{ fontSize: 11, color: '#5f5e5e', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 500 }}>Warehouse</span>
            <span style={{ fontSize: 14, color: '#1b1c1c', fontWeight: 700 }}>{data.receiverWarehouseName}</span>
          </div>

          {/* PO List - Full Width */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4, gridColumn: 'span 2', paddingTop: 12, borderTop: '1px solid #f0f0f0' }}>
            <span style={{ fontSize: 11, color: '#5f5e5e', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 500 }}>PO List</span>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 2 }}>
              <InboxOutlined style={{ fontSize: 14, color: '#1677ff' }} />
              <span style={{ fontSize: 14, color: '#1b1c1c' }}>
                {poReferences.map((ref) => `${ref.poNumber} (${ref.supplier})`).join(', ')}
              </span>
            </div>
          </div>

          {/* Supervisor Note - Full Width */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4, gridColumn: 'span 2', backgroundColor: '#f5f5f5', padding: 12, borderRadius: 8, marginTop: 4 }}>
            <span style={{ fontSize: 11, color: '#5f5e5e', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 500, marginBottom: 4 }}>Supervisor Note</span>
            {data.note?.trim() ? (
              <span style={{ fontSize: 14, color: '#4c4635', fontStyle: 'italic' }}>{data.note}</span>
            ) : (
              <span style={{ fontSize: 14, color: '#8c8c8c', fontStyle: 'italic' }}>No additional notes provided for this transaction.</span>
            )}
          </div>
        </div>
      </div>

      {/* Footer Actions */}
      <div style={{ padding: '16px 40px 20px', display: 'flex', justifyContent: 'flex-end', alignItems: 'center' }}>
        <Button
          type="primary"
          onClick={onClose}
          style={{
            height: 32,
            paddingInline: 24,
            borderRadius: 8,
            fontWeight: 600,
            fontSize: 14,
            boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
          }}
        >
          OK
        </Button>
      </div>

    </Modal>
  );
}
