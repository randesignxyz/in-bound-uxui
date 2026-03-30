import {
  Button,
  Descriptions,
  Drawer,
  message,
  Spin,
  Space,
  Steps,
  Table,
  Tag,
  Timeline,
  Typography,
} from 'antd';
import type { ColumnsType } from 'antd/es/table';
import type { RequestDetailActivity, RequestDetailData, RequestDetailLineItem } from './data';
import { useAccess } from '@umijs/max';
import { useEffect, useState } from 'react';
import { SparePartReturnAPI } from './service';
import { RequestActions } from '@/services/apiGateway';
import SparePartImage from '../spare-part-request/SparePartImage';

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
  returnId?: number | null;
  onClose?: () => void;
}

export default function DrawerBatchReturnItems({
  open,
  data: propData,
  returnId,
  onClose,
}: DrawerBatchReturnItemsProps) {
  const [loading, setLoading] = useState(false);
  const [fetchedData, setFetchedData] = useState<RequestDetailData | null>(null);
  const access = useAccess();

  const requestAction: RequestActions = {
    start: (serviceName) => console.log(`Loading: ${serviceName}`),
    end: (status, reason) => console.log(status, reason),
  };

  useEffect(() => {
    if (!open || !returnId) {
      setFetchedData(null);
      return;
    }
    setLoading(true);
    SparePartReturnAPI(requestAction)
      .fetch_spare_part_by_return_id(returnId)
      .then((res: any) => {
        const item = Array.isArray(res) ? res[0] : res;
        if (item) {
          const mapped: RequestDetailData = {
            no: item.no ?? returnId,
            request_id: item.request_id ?? '',
            total_items: item.total_items ?? 0,
            request_date: item.request_date ?? '',
            status:
              item.state === 'APPROVED'
                ? 'Approved'
                : item.state === 'REJECTED'
                  ? 'Rejected'
                  : item.state === 'COMPLETED'
                    ? 'Completed'
                    : 'Pending',
            remarks: item.remarks ?? '',
            items: (item.items ?? []).map((i: any) => ({
              no: i.no,
              image: i.image ?? undefined,
              product_id: i.product_id,
              request_id: i.request_id,
              item_name: i.item_name,
              uom: i.uom,
              quantity_to_return: i.quantity_to_return,
              used_quantity: i.used_quantity,
              total: i.total,
            })),
            activities: (item.activities ?? []).map((a: any) => ({
              label: a.label,
              description: a.description,
              date: a.date,
              dot: a.dot === 'pending' ? 'pending' : 'default',
            })),
          };
          setFetchedData(mapped);
        }
      })
      .finally(() => setLoading(false));
  }, [open, returnId]);

  const data: RequestDetailData | null = fetchedData ?? propData ?? null;
  const currentStep = data ? statusToCurrentStep(data.status) : 0;
  const columns: ColumnsType<RequestDetailLineItem> = [
    { title: 'No', dataIndex: 'no', key: 'no', width: 56 },
    {
      title: 'Image',
      dataIndex: 'image',
      key: 'image',
      width: 80,
      render: (_, record) => (
          <SparePartImage
          imageId={record.image}
          src={record.item_name}
          alt={record.product_id || record.request_id}
      />
      )
    },
    {
      title: 'Product ID',
      dataIndex: 'product_id',
      key: 'product_id',
      width: 'auto',
      align: 'left',
      render: (v: string) => <a style={{ color: '#1890ff' }}>{v}</a>,
    },
    {
      title: 'Request ID',
      dataIndex: 'request_id',
      key: 'request_id',
      width: 'auto',
      align: 'left',
      render: (v: string) => <a style={{ color: '#1890ff' }}>{v}</a>,
    },
    {
      title: 'Item Name',
      dataIndex: 'item_name',
      key: 'item_name',
      width: 'auto',
      align: 'left',
    },
     {
      title: 'UoM',
      dataIndex: 'uom',
      key: 'uom',
      width: 'auto',
      align: 'left',
    },
    {
      title: 'QTY to Return',
      dataIndex: 'quantity_to_return',
      key: 'quantity_to_return',
      align: 'left',
      width: 'auto',
    },
    {
      title: 'QTY Used',
      dataIndex: 'used_quantity',
      key: 'used_quantity',
      align: 'left',
      width: 'auto',
    },
    {
      title: 'Total',
      dataIndex: 'total',
      key: 'total',
      align: 'left',
      width: 'auto',
    },
  ];
  const handleApproved = () => {
    if (!returnId) return;
    const service = SparePartReturnAPI(requestAction);
    service.warehouse_approve_spare_part_return(returnId, 'APPROVE').then((res: any) => {
      if (res) {
        message.success('Approved successfully');
        onClose?.();
      }
    });
  };
  const handleRejected = () => {
    if (!returnId) return;
    const service = SparePartReturnAPI(requestAction);
    service.warehouse_approve_spare_part_return(returnId, 'REJECT').then((res: any) => {
      if (res) {
        message.success('Rejected successfully');
        onClose?.();
      }
    });
  };
  return (
    <Drawer
    title={
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span>Batch Return as Details</span>
        </div>
      }

      
      width="60%"
      placement="right"
      onClose={onClose}
      open={open}
      styles={{
        body: { padding: 16, backgroundColor: '#fafafa' },
        header: { borderBottom: '1px solid #f0f0f0' },
      }}
    >
      <Spin spinning={loading}>
        {data && (
          <>
            {access.canSpfApprover && data.status === 'Pending' && (
              <div style={{ marginBottom: 24, textAlign: 'right' }}>
                <Space>
                  <Button
                    danger
                    onClick={handleRejected}
                  >
                    Reject
                  </Button>
                  <Button
                    type="primary"
                    onClick={handleApproved}
                  >
                    Approve
                  </Button>
                </Space>
              </div>
            )}

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
                {data.status === 'Pending' ? (
                  <Tag color="processing" bordered={false}>Pending</Tag>
                ) : data.status === 'Approved' ? (
                  <Tag color="warning" bordered={false}>Approved</Tag>
                ) : data.status === 'Rejected' ? (
                  <Tag color="error" bordered={false}>Rejected</Tag>
                ) : data.status === 'Completed' ? (
                  <Tag color="success" bordered={false}>Completed</Tag>
                ) : null}
              </Descriptions.Item>
            </Descriptions>

            {/* Message */}
            <Title level={5} style={{ marginBottom: 8 }}>
              Message
            </Title>
            <Text type="secondary" style={{ display: 'block', marginBottom: 24 }}>
              {data.remarks ?? '—'}
            </Text>

            {/* Status Timeline */}
            <Title level={5} style={{ marginBottom: 16 }}>
              Status Timeline
            </Title>
           <Steps
          current={currentStep}
          size="small"
          style={{ marginBottom: 32 }}
          status={data.status === 'Rejected' ? 'error' : undefined} 
          items={STATUS_STEPS.map((title, index) => ({
            title,
            status:
              data.status === 'Rejected' && index === 0
                ? 'error'                      
                : index < currentStep
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
          </>
        )}
      </Spin>

    </Drawer>
  );
}
