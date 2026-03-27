import { CheckCircleFilled } from '@ant-design/icons';
import { Descriptions, Modal, Tag, Typography } from 'antd';
import type { GoodsReceipt } from '../workflow';

const { Text, Title } = Typography;

export interface SupervisorApprovalSuccessData {
  approvedBy: string;
  approvedDate: string;
  grNumber: string;
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
      onOk={onClose}
      okText="OK"
      cancelButtonProps={{ style: { display: 'none' } }}
      width={620}
      centered
      destroyOnClose
    >
      <div style={{ textAlign: 'center', padding: '8px 0 24px' }}>
        <CheckCircleFilled style={{ fontSize: 72, color: '#52c41a', marginBottom: 16 }} />
        <Title level={4} style={{ margin: 0 }}>
          Approval Successful
        </Title>
        <Text type="secondary" style={{ display: 'block', marginTop: 8 }}>
          Inbound receiving {data.receivingNumber || data.grNumber} has been approved
          {data.approvedGrNumber ? ` as ${data.approvedGrNumber}` : ''} and is ready to post to SAP.
        </Text>
      </div>

      <Descriptions bordered size="small" column={2}>
        <Descriptions.Item label="Receiving Number">
          {data.receivingNumber || data.grNumber}
        </Descriptions.Item>
        <Descriptions.Item label="GR Ready Number">
          {data.approvedGrNumber || data.grNumber}
        </Descriptions.Item>
        <Descriptions.Item label="PO Reference">{poReferenceSummary}</Descriptions.Item>
        <Descriptions.Item label="Supplier">{supplierSummary}</Descriptions.Item>
        <Descriptions.Item label="Receipt Type">
          <Tag color={data.receiptType === 'Planned' ? 'blue' : 'orange'}>{data.receiptType}</Tag>
        </Descriptions.Item>
        <Descriptions.Item label="Approved By">{data.approvedBy}</Descriptions.Item>
        <Descriptions.Item label="Approved Date">{data.approvedDate}</Descriptions.Item>
        <Descriptions.Item label="Receiver Warehouse" span={2}>
          {data.receiverWarehouseName}
        </Descriptions.Item>
        <Descriptions.Item label="PO List" span={2}>
          {poReferences.map((reference) => `${reference.poNumber} (${reference.supplier})`).join(', ')}
        </Descriptions.Item>
        <Descriptions.Item label="Supervisor Note" span={2}>
          {data.note?.trim() ? data.note : <Text type="secondary">No additional note.</Text>}
        </Descriptions.Item>
      </Descriptions>
    </Modal>
  );
}
