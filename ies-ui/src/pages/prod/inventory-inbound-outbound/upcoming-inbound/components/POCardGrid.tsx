import { Card, Row, Col, Tag, Button, Checkbox, Space, Typography } from 'antd';
import { ClockCircleOutlined, InboxOutlined, EyeOutlined } from '@ant-design/icons';
import type { PurchaseOrder } from '../workflow';

interface POCardGridProps {
  purchaseOrders: PurchaseOrder[];
  onViewDetails: (po: PurchaseOrder) => void;
  selectedPONumbers: string[];
  onToggleSelection: (po: PurchaseOrder, checked?: boolean) => void;
}

const poStatusColor: Record<PurchaseOrder['status'], string> = {
  Expected: 'gold',
  Partial: 'blue',
  'Fully Received': 'success',
};

export function POCardGrid({
  purchaseOrders,
  onViewDetails,
  selectedPONumbers,
  onToggleSelection,
}: POCardGridProps) {
  if (purchaseOrders.length === 0) {
    return (
      <div style={{ textAlign: 'center', padding: 32, color: '#8c8c8c', fontSize: 14 }}>
        No purchase orders found.
      </div>
    );
  }

  return (
    <Row gutter={[12, 12]}>
      {purchaseOrders.map((po) => {
        const selected = selectedPONumbers.includes(po.poNumber);

        return (
          <Col xs={24} xl={12} key={po.poNumber}>
            <Card
              size="small"
              hoverable
              style={{
                border: selected ? '1px solid #1677ff' : '1px solid #f0f0f0',
                boxShadow: selected ? '0 0 0 1px rgba(22,119,255,0.12)' : undefined,
              }}
              bodyStyle={{ padding: 16 }}
            >
              <Space direction="vertical" size="small" style={{ width: '100%' }}>
                <div
                  style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}
                >
                  <Space align="start">
                    <Checkbox
                      checked={selected}
                      onChange={(event) => onToggleSelection(po, event.target.checked)}
                      onClick={(event) => event.stopPropagation()}
                    />
                    <Typography.Link
                      onClick={() => onViewDetails(po)}
                      style={{ fontSize: 14, fontWeight: 600 }}
                    >
                      {po.poNumber}
                    </Typography.Link>
                  </Space>
                  <Tag color={poStatusColor[po.status]}>{po.status}</Tag>
                </div>
                <Typography.Text type="secondary" style={{ fontSize: 12 }}>
                  {po.supplier}
                </Typography.Text>
                <Space size="middle" style={{ fontSize: 11, color: '#8c8c8c' }}>
                  <Space size={4}>
                    <ClockCircleOutlined style={{ fontSize: 12 }} />
                    {po.expectedDate || 'Unplanned'} {po.expectedTime}
                  </Space>
                  <Space size={4}>
                    <InboxOutlined style={{ fontSize: 12 }} />
                    {po.totalItems} item{po.totalItems !== 1 ? 's' : ''} ·{' '}
                    {po.totalQty.toLocaleString()}
                  </Space>
                </Space>
                <Space size={4} wrap>
                  {po.items.slice(0, 3).map((item) => (
                    <Tag key={item.code} style={{ fontSize: 10 }}>
                      {item.code}
                    </Tag>
                  ))}
                  {po.items.length > 3 && (
                    <Tag style={{ fontSize: 10 }}>+{po.items.length - 3}</Tag>
                  )}
                </Space>
                <Space>
                  <Button size="small" icon={<EyeOutlined />} onClick={() => onViewDetails(po)}>
                    View Details
                  </Button>
                  <Button
                    size="small"
                    type={selected ? 'primary' : 'default'}
                    onClick={() => onToggleSelection(po)}
                  >
                    {selected ? 'Selected' : 'Select'}
                  </Button>
                </Space>
              </Space>
            </Card>
          </Col>
        );
      })}
    </Row>
  );
}
