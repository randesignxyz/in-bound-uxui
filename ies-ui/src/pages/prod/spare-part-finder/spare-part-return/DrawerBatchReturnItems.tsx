import {
  Button,
  Descriptions,
  Drawer,
  Space,
  Steps,
  Table,
  Tag,
  Timeline,
  Typography,
} from 'antd';
import type { ColumnsType } from 'antd/es/table';
import type { RequestDetailActivity, RequestDetailData, RequestDetailLineItem } from './data';
import { MOCK_REQUEST_DETAIL } from './data';
import { useAccess } from '@umijs/max';

const { Title, Text } = Typography;

const STATUS_STEPS = ['Requested', 'Approved', 'Warehouse', 'Completed'] as const;

function statusToCurrentStep(status: RequestDetailData['status']): number {
  switch (status) {
    case 'Pending':
      return 0;
    case 'Approved':
      return 1;
    case 'Completed':
      return 3;
    case 'Rejected':
      return 0;
    default:
      return 0;
  }
}

export interface DrawerBatchReturnItemsProps {
  open: boolean;
  data?: RequestDetailData | null;
  onClose?: () => void;
}

export default function DrawerBatchReturnItems({
  open,
  data: propData,
  onClose,
}: DrawerBatchReturnItemsProps) {
  const data = propData ?? MOCK_REQUEST_DETAIL;
  const currentStep = statusToCurrentStep(data.status);
  const access = useAccess();
  const columns: ColumnsType<RequestDetailLineItem> = [
    { title: 'No', dataIndex: 'no', key: 'no', width: 56 },
    {
      title: 'Image',
      dataIndex: 'image',
      key: 'image',
      width: 72,
      render: (src: string) => (
        <div
          style={{
            width: 40,
            height: 40,
            borderRadius: '50%',
            overflow: 'hidden',
            backgroundColor: '#f0f0f0',
          }}
        >
          <img
            src={src || 'https://via.placeholder.com/40?text=No'}
            alt=""
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
          />
        </div>
      ),
    },
    {
      title: 'Product ID',
      dataIndex: 'product_id',
      key: 'product_id',
      render: (v: string) => <a style={{ color: '#1890ff' }}>{v}</a>,
    },
    {
      title: 'Request ID',
      dataIndex: 'request_id',
      key: 'request_id',
      render: (v: string) => <a style={{ color: '#1890ff' }}>{v}</a>,
    },
    {
      title: 'Item Name',
      dataIndex: 'item_name',
      key: 'item_name',
      ellipsis: true,
    },
     {
      title: 'UoM',
      dataIndex: 'uom',
      key: 'uom',
      ellipsis: true,
    },
    {
      title: 'QTY to Return',
      dataIndex: 'quantity_to_return',
      key: 'quantity_to_return',
      align: 'right',
    },
    {
      title: 'QTY Used',
      dataIndex: 'used_quantity',
      key: 'used_quantity',
      align: 'right',
    },
    {
      title: 'Total',
      dataIndex: 'total',
      key: 'total',
      align: 'right',
    },
  ];

  return (
    <Drawer
    title={
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span>Batch Return as Details</span>
          {/* <Button type="link" style={{ color: '#d4a574' }}>
            Edit Info
          </Button> */}
        </div>
      }

      
      width="50%"
      placement="right"
      onClose={onClose}
      open={open}
      styles={{
        body: { padding: 16, backgroundColor: '#fafafa' },
        header: { borderBottom: '1px solid #f0f0f0' },
      }}
    >
           {
          access.canSpfApprover && data.status === 'Pending' && (
            <div style={{ marginBottom: 24, textAlign: 'right' }}>
              <Space>
                <Button
                  danger
                  onClick={() => {
                    console.log("helo")
                  }}
                >
                  Reject
                </Button>
                <Button
                  type="primary"
                  onClick={() => {
                    
                  }}
                >
                  Approve
                </Button>
              </Space>
            </div>
          )
        }
      <Descriptions
        column={3}
        size="small"
        style={{ marginBottom: 24 }}
        labelStyle={{ textAlign: 'center', fontWeight: 'bolder' }}
        contentStyle={{ textAlign: 'center' }}
      >
        <Descriptions.Item label="No">{data.no}</Descriptions.Item>
        <Descriptions.Item label="Request ID">{data.request_id}</Descriptions.Item>
        <Descriptions.Item label="Total Items">{data.total_items}</Descriptions.Item>
        <Descriptions.Item label="Request Date">{data.request_date}</Descriptions.Item>
        <Descriptions.Item label="Status">
          <Tag color="processing" bordered={false}>
            {data.status}
          </Tag>
        </Descriptions.Item>
      </Descriptions>

      {/* Status Timeline */}
      <Title level={5} style={{ marginBottom: 16 }}>
        Status Timeline
      </Title>
      <Steps
        current={currentStep}
        size="small"
        style={{ marginBottom: 32 }}
        items={STATUS_STEPS.map((title, index) => ({
          title,
          status:
            index < currentStep
              ? 'finish'
              : index === currentStep
                ? 'process'
                : 'wait',
        }))}
      />

      {/* Items Table */}
      <Title level={5} style={{ marginBottom: 16 }}>
        Items
      </Title>
      <Table<RequestDetailLineItem>
        size="small"
        rowKey="no"
        pagination={false}
        columns={columns}
        dataSource={data.items}
        scroll={{ x: 700 }}
        style={{ marginBottom: 32 }}
      />

      {/* Recent Activities */}
      <Title level={5} style={{ marginBottom: 16 }}>
        Recent Activities
      </Title>
      <Timeline
        style={{ marginBottom: 32 }}
        items={data.activities.map((a: RequestDetailActivity) => ({
          color: a.dot === 'pending' ? 'gray' : 'blue',
          children: (
            <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 8 }}>
              <div>
                <Text strong>{a.label}</Text>
                <br />
                <Text type="secondary">{a.description}</Text>
              </div>
              {a.date && <Text type="secondary">{a.date}</Text>}
            </div>
          ),
        }))}
      />

      {/* Message */}
      <Title level={5} style={{ marginBottom: 8 }}>
        Message
      </Title>
      <Text type="secondary" style={{ display: 'block', marginBottom: 24 }}>
        {data.remarks ?? '—'}
      </Text>
    </Drawer>
  );
}
