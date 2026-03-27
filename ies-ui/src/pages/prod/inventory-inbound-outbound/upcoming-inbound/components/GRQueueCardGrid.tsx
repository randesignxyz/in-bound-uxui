import { Badge, Button, Card, Col, Row, Space, Tag, Typography } from 'antd';
import {
  CalendarOutlined,
  ClockCircleOutlined,
  EyeOutlined,
  InboxOutlined,
} from '@ant-design/icons';
import {
  getGoodsReceiptSourceColor,
  getPOLinkStatusColor,
  getReceiptPOReferences,
  goodsReceiptSourceLabel,
  officialStateLabel,
  poLinkStatusLabel,
  summarizePOReferences,
  summarizeSuppliers,
  type GoodsReceipt,
  type LegacyGRStatus,
} from '../workflow';

interface GRQueueCardGridProps {
  receipts: GoodsReceipt[];
  onViewDetails: (receipt: GoodsReceipt) => void;
}

const statusColor: Record<LegacyGRStatus, string> = {
  Draft: 'default',
  'Pending Approval': 'gold',
  Approved: 'green',
  Posted: 'blue',
  'Correction Required': 'red',
};

export function GRQueueCardGrid({ receipts, onViewDetails }: GRQueueCardGridProps) {
  if (receipts.length === 0) {
    return (
      <div style={{ textAlign: 'center', padding: 32, color: '#8c8c8c', fontSize: 14 }}>
        No inbound receiving records found.
      </div>
    );
  }

  return (
    <Row gutter={[12, 12]}>
      {receipts.map((receipt) => (
        <Col xs={24} xl={12} key={receipt.grNumber}>
          <Card size="small" hoverable style={{ border: '1px solid #f0f0f0' }} bodyStyle={{ padding: 16 }}>
            <Space direction="vertical" size="small" style={{ width: '100%' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <Typography.Link
                  onClick={() => onViewDetails(receipt)}
                  style={{ fontSize: 14, fontWeight: 600 }}
                >
                  {receipt.grNumber}
                </Typography.Link>
                <Tag color={statusColor[receipt.status]}>{receipt.status}</Tag>
              </div>
              {getReceiptPOReferences(receipt).length > 0 ? (
                <Typography.Text type="secondary" style={{ fontSize: 12 }}>
                  {`${summarizePOReferences(receipt)} • ${summarizeSuppliers(receipt)}`}
                </Typography.Text>
              ) : (
                <Space size={6} wrap>
                  <Typography.Text type="secondary" style={{ fontSize: 12 }}>
                    -
                  </Typography.Text>
                  <Typography.Text type="secondary" style={{ fontSize: 12 }}>
                    {summarizeSuppliers(receipt)}
                  </Typography.Text>
                </Space>
              )}
              <Space size={4} wrap>
                <Tag color={getGoodsReceiptSourceColor(receipt.receiptSourceType)}>
                  {goodsReceiptSourceLabel[receipt.receiptSourceType]}
                </Tag>
                <Tag color={getPOLinkStatusColor(receipt.poLinkStatus)}>
                  {poLinkStatusLabel[receipt.poLinkStatus]}
                </Tag>
              </Space>
              <Space size="middle" style={{ fontSize: 11, color: '#8c8c8c' }}>
                <Space size={4}>
                  <CalendarOutlined style={{ fontSize: 12 }} />
                  {receipt.expectedDate || receipt.actualReceiptDate || 'Unplanned'}
                </Space>
                <Space size={4}>
                  <ClockCircleOutlined style={{ fontSize: 12 }} />
                  {receipt.expectedTime || 'No ETA'}
                </Space>
                <Space size={4}>
                  <InboxOutlined style={{ fontSize: 12 }} />
                  {receipt.items.length} item{receipt.items.length !== 1 ? 's' : ''}
                </Space>
              </Space>
              <Space size={4} wrap>
                {receipt.items.slice(0, 3).map((item) => (
                  <Tag key={item.code} style={{ fontSize: 10 }}>
                    {item.code}
                  </Tag>
                ))}
                {receipt.items.length > 3 && <Tag style={{ fontSize: 10 }}>+{receipt.items.length - 3}</Tag>}
              </Space>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Space align="center" size={8}>
                  <Badge
                    status={receipt.processState === 'QC_PENDING' ? 'warning' : 'processing'}
                  />
                  <Typography.Text style={{ fontSize: 12 }}>
                    {officialStateLabel[receipt.processState]}
                  </Typography.Text>
                </Space>
                <Button size="small" icon={<EyeOutlined />} onClick={() => onViewDetails(receipt)}>
                  View Detail
                </Button>
              </div>
            </Space>
          </Card>
        </Col>
      ))}
    </Row>
  );
}
