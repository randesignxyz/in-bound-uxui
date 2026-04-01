import { getUploadFileObjectUrlV2, type RequestActions } from '@/services/apiGateway';
import { DownOutlined, EyeOutlined, RightOutlined } from '@ant-design/icons';
import { ProColumns, ProTable } from '@ant-design/pro-components';
import { useAccess } from '@umijs/max';
import {
  Button,
  Descriptions,
  Drawer,
  Image,
  Space,
  Steps,
  Table,
  Tag,
  Timeline,
  Typography,
  message,
} from 'antd';
import { useEffect, useMemo, useState } from 'react';
import SparePartImage from '../spare-part-request/SparePartImage';
import type {
  RequestDetailActivityItem,
  RequestDetailData,
  RequestDetailLineItem,
  ReturnStatus,
} from './data';
import { SparePartReturnAPI } from './service';

const { Title } = Typography;
const ATTACHMENT_CARD_SIZE = 56;
const STATUS_STEPS = ['Pending', 'Approved', 'Receiving', 'Completed'];

interface ReturnItem {
  id: string | number;
  itemId?: number;
  imageId?: string;
  image?: string;
  productId: string;
  partName?: string;
  name: string;
  uom?: string;
  usedQty: number;
  qtyToReturn: number;
  receivedQty?: number;
  goodQty?: number;
  damagedQty?: number;
  itemRemark?: string;
  images?: string[];
}

interface FetchReturnDetailResponseItem {
  no?: number;
  return_item_id?: number;
  imageId?: string;
  image_id?: string;
  image?: string;
  product_id?: string;
  request_id?: string;
  item_name?: string;
  uom?: string;
  quantity_to_return?: number;
  used_quantity?: number;
  total?: number;
  received_qty?: number;
  good_qty?: number;
  damaged_qty?: number;
  remark?: string;
  images?: string[];
}
interface FetchReturnDetailResponseActivity {
  label?: string;
  description?: string;
  date?: string;
  dot?: string;
  messages?: string;
  items?: RequestDetailActivityItem[] | null;
}

interface FetchReturnDetailResponse {
  no?: number;
  request_id?: string;
  total_items?: number;
  request_date?: string;
  status?: string;
  state?: string;
  remarks?: string;
  items?: FetchReturnDetailResponseItem[];
  activities?: FetchReturnDetailResponseActivity[];
}

interface DrawerBatchReturnItemsProps {
  open: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  data: RequestDetailData | null;
  returnId?: number | null;
}

const STATUS_STEP_MAP: Record<ReturnStatus, number> = {
  Pending: 0,
  Approved: 1,
  Rejected: 1,
  Receiving: 2,
  Completed: 3,
  'Partially Returned': 3,
};

const statusColorMap: Record<ReturnStatus, string> = {
  Pending: 'processing',
  Approved: 'warning',
  Rejected: 'error',
  Receiving: 'processing',
  Completed: 'success',
  'Partially Returned': 'processing',
};

const statusLabelMap: Record<ReturnStatus, string> = {
  Pending: 'Pending',
  Approved: 'Approved',
  Rejected: 'Rejected',
  Receiving: 'Receiving',
  Completed: 'Completed',
  'Partially Returned': 'Partially Returned',
};

const formatDateTime = (date?: string) => {
  if (!date) return '-';
  return new Date(date).toLocaleString();
};

const getStepStatus = (
  effectiveStatus: ReturnStatus,
  stepIndex: number,
  currentStep: number,
): 'finish' | 'process' | 'wait' | 'error' => {
  if (effectiveStatus === 'Rejected' && stepIndex === 1) return 'error';
  if (stepIndex < currentStep) return 'finish';
  if (stepIndex === currentStep) return 'process';
  return 'wait';
};

const mapApiValueToStatus = (value?: string): ReturnStatus => {
  switch ((value ?? '').toUpperCase()) {
    case 'APPROVED':
      return 'Approved';
    case 'REJECTED':
      return 'Rejected';
    case 'COMPLETE':
    case 'COMPLETED':
      return 'Completed';
    case 'RECEIVING':
      return 'Receiving';
    case 'PARTIAL_RETURN':
    case 'PARTIALLY_RETURNED':
      return 'Partially Returned';
    default:
      return 'Pending';
  }
};

const getStepStatusFromApi = (status?: string, state?: string): ReturnStatus => {
  const normalizedStatus = (status ?? '').toUpperCase();
  if (normalizedStatus === 'PARTIAL_RETURN' || normalizedStatus === 'PARTIALLY_RETURNED') {
    return 'Receiving';
  }

  return mapApiValueToStatus(status || state);
};

const mapFetchedItemToRow = (item: RequestDetailLineItem, index: number): ReturnItem => ({
  id: item.return_item_id ?? item.no ?? index + 1,
  itemId: item.return_item_id,
  imageId: item.imageId,
  image: item.image,
  productId: item.product_id,
  partName: item.item_name,
  name: item.item_name,
  uom: item.uom,
  usedQty: item.used_quantity ?? 0,
  qtyToReturn: item.quantity_to_return ?? 0,
  receivedQty: item.received_qty,
  goodQty: item.good_qty,
  damagedQty: item.damaged_qty,
  itemRemark: item.remark,
  images: item.images,
});

const mapFallbackItemToRow = (item: RequestDetailLineItem, index: number): ReturnItem => ({
  id: item.return_item_id ?? item.no ?? index + 1,
  itemId: item.return_item_id,
  imageId: item.imageId,
  image: item.image,
  productId: item.product_id,
  partName: item.item_name,
  name: item.item_name,
  uom: item.uom,
  usedQty: item.used_quantity ?? 0,
  qtyToReturn: item.quantity_to_return ?? 0,
  receivedQty: item.received_qty,
  goodQty: item.good_qty,
  damagedQty: item.damaged_qty,
  itemRemark: item.remark,
  images: item.images,
});

const mapResponseToDetailData = (
  item: FetchReturnDetailResponse,
  returnId: number,
): RequestDetailData => ({
  no: item.no ?? returnId,
  request_id: item.request_id ?? '',
  total_items: item.total_items ?? 0,
  request_date: item.request_date ?? '',
  status: mapApiValueToStatus(item.status || item.state),
  remarks: item.remarks ?? '',
  items: (item.items ?? []).map((line, index) => ({
    no: line.no ?? index + 1,
    return_item_id: line.return_item_id,
    imageId: line.imageId ?? line.image_id,
    image: line.image,
    product_id: line.product_id ?? '',
    request_id: line.request_id ?? '',
    item_name: line.item_name ?? '',
    uom: line.uom,
    quantity_to_return: line.quantity_to_return ?? 0,
    used_quantity: line.used_quantity ?? 0,
    total: line.total ?? 0,
    received_qty: line.received_qty,
    good_qty: line.good_qty,
    damaged_qty: line.damaged_qty,
    remark: line.remark,
    images: line.images,
  })),
  activities: (item.activities ?? []).map((activity) => ({
    label: activity.label ?? '',
    description: activity.description ?? '',
    date: activity.date,
    dot: activity.dot,
    messages: activity.messages,
    items: activity.items ?? null,
  })),
});

const getTimelineColor = (dot?: string, label?: string) => {
  switch ((dot ?? '').toLowerCase()) {
    case 'approved':
      return 'blue';
    case 'rejected':
      return 'red';
    case 'completed':
      return 'green';
    case 'warehouse':
      return 'blue';
    case 'pending':
      return 'gray';
    default:
      return (label ?? '').toLowerCase() === 'rejected' ? 'red' : 'blue';
  }
};

export default function DrawerBatchReturnItems({
  open,
  onClose,
  onSuccess,
  data,
  returnId,
}: DrawerBatchReturnItemsProps) {
  const access = useAccess();
  const [loading, setLoading] = useState(false);
  const [fetchedData, setFetchedData] = useState<RequestDetailData | null>(null);
  const [stepStatus, setStepStatus] = useState<ReturnStatus>('Pending');
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewImage, setPreviewImage] = useState('');
  const [previewTitle, setPreviewTitle] = useState('');
  const [expandedActivities, setExpandedActivities] = useState<string[]>([]);
  const toggleActivity = (key: string) => {
    setExpandedActivities((prev) =>
      prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key],
    );
  };

  const requestAction: RequestActions = {
    start: (name) => console.log(`Loading: ${name}`),
    end: (status) => console.log(status),
  };

  const effectiveStatus: ReturnStatus = fetchedData?.status ?? data?.status ?? 'Pending';
  const currentStep = STATUS_STEP_MAP[stepStatus];

  const tableItems = useMemo<ReturnItem[]>(() => {
    if (fetchedData?.items?.length) {
      return fetchedData.items.map(mapFetchedItemToRow);
    }

    return (data?.items ?? []).map(mapFallbackItemToRow);
  }, [data?.items, fetchedData?.items]);

  const fetchDetail = async () => {
    if (!returnId) return;

    setLoading(true);
    try {
      const response = await SparePartReturnAPI(requestAction).fetch_spare_part_by_return_id(
        returnId,
      );
      const item = (Array.isArray(response) ? response[0] : response) as
        | FetchReturnDetailResponse
        | undefined;

      if (item) {
        setFetchedData(mapResponseToDetailData(item, returnId));
        setStepStatus(getStepStatusFromApi(item.status, item.state));
      }
    } catch (error) {
      console.error('Failed to fetch return detail', error);
      message.error('Failed to load return details');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (open && returnId) {
      void fetchDetail();
      return;
    }

    setFetchedData(null);
    setStepStatus(data?.status ?? 'Pending');
  }, [open, returnId]);

  const handleDecision = async (action: 'APPROVE' | 'REJECT') => {
    if (!returnId) return;

    setLoading(true);
    try {
      await SparePartReturnAPI(requestAction).warehouse_approve_spare_part_return(returnId, action);
      message.success(action === 'APPROVE' ? 'Approved successfully' : 'Rejected successfully');
      onSuccess?.();
      onClose();
    } catch (error) {
      console.error(`Failed to ${action.toLowerCase()} return request`, error);
      message.error(
        action === 'APPROVE'
          ? 'Failed to approve return request'
          : 'Failed to reject return request',
      );
    } finally {
      setLoading(false);
    }
  };

  const handlePreviewImage = async (fileId: string, title: string) => {
    try {
      const imageUrl = await getUploadFileObjectUrlV2()(fileId);
      setPreviewImage(imageUrl);
      setPreviewTitle(title);
      setPreviewOpen(true);
    } catch (error) {
      console.error('Failed to preview returned image', error);
      message.error('Failed to preview image');
    }
  };

  const columnsReturn: ProColumns<ReturnItem>[] = [
    { title: 'No', dataIndex: 'id', key: 'number_id' },
    {
      title: 'Image',
      dataIndex: 'image',
      key: 'image_key',
      width: 80,
      align: 'center',
      render: (_, record) => (
        <SparePartImage
          imageId={record.imageId}
          src={record.image}
          alt={record.partName || record.productId}
          size={48}
        />
      ),
    },
    {
      title: 'Product ID',
      dataIndex: 'productId',
      key: 'product_id',
      render: (_, record) => <Typography.Link>{record.productId}</Typography.Link>,
    },
    { title: 'Name', dataIndex: 'name', key: 'name_product', ellipsis: true },
    { title: 'UoM', dataIndex: 'uom', key: 'uom' },
    { title: 'Used QTY', dataIndex: 'usedQty', key: 'used_key', align: 'center' },
    {
      title: 'QTY to Return',
      dataIndex: 'qtyToReturn',
      key: 'qty_key_return',
      align: 'center',
      render: (_, record) => {
        const received = record.receivedQty ?? 0;
        const showReceivedTag = ['Receiving', 'Partially Returned', 'Completed'].includes(
          effectiveStatus,
        );

        return (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <span style={{ fontWeight: 600, color: '#d4a574', fontSize: 16 }}>
              {record.qtyToReturn}
            </span>
            {showReceivedTag && (
              <Tag
                color={received >= record.qtyToReturn ? 'success' : 'processing'}
                style={{ fontSize: 10, marginTop: 4 }}
              >
                {received} / {record.qtyToReturn} Received
              </Tag>
            )}
          </div>
        );
      },
    },
    {
      title: 'Good',
      key: 'good_amount',
      width: 90,
      render: (_, record) => (
        <span style={{ fontWeight: 600, color: '#52c41a' }}>{record.goodQty ?? '-'}</span>
      ),
    },
    {
      title: 'Damaged',
      key: 'damaged_amount',
      width: 90,
      render: (_, record) => (
        <span style={{ fontWeight: 600, color: record.damagedQty ? '#ff4d4f' : '#8c8c8c' }}>
          {record.damagedQty ?? '-'}
        </span>
      ),
    },
    {
      title: 'Remarks',
      key: 'messages',
      width: 180,
      render: (_, record) => (
        <Typography.Text type="secondary">{record.itemRemark || '-'}</Typography.Text>
      ),
    },
    {
      title: 'Attachments',
      key: 'broken_image',
      align: 'center',
      width: 260,
      render: (_, record) => {
        if (!record.images?.length) {
          return <Typography.Text type="secondary">-</Typography.Text>;
        }

        return (
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', justifyContent: 'center' }}>
            {record.images.map((fileId, index) => (
              <div
                key={fileId}
                style={{
                  position: 'relative',
                  width: ATTACHMENT_CARD_SIZE,
                  height: ATTACHMENT_CARD_SIZE,
                  borderRadius: 8,
                  overflow: 'hidden',
                  border: '1px solid #d9d9d9',
                  background: '#fafafa',
                  cursor: 'pointer',
                }}
                onClick={() => void handlePreviewImage(fileId, `${record.name} ${index + 1}`)}
              >
                <SparePartImage imageId={fileId} alt={record.name} size={ATTACHMENT_CARD_SIZE} />
                <div
                  style={{
                    position: 'absolute',
                    inset: 0,
                    background: 'rgba(0,0,0,0.45)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    opacity: 0,
                    transition: 'opacity 0.2s',
                  }}
                  onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.opacity = '1')}
                  onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.opacity = '0')}
                >
                  <EyeOutlined
                    style={{ color: '#fff', fontSize: 14 }}
                    onClick={() => void handlePreviewImage(fileId, `${record.name} ${index + 1}`)}
                  />
                </div>
              </div>
            ))}
          </div>
        );
      },
    },
  ];

  return (
    <Drawer
      title={<span style={{ fontSize: 16, letterSpacing: '0.5px' }}>Return Request Details</span>}
      width="100%"
      open={open}
      onClose={onClose}
      styles={{ body: { backgroundColor: '#fafafa', padding: '24px' } }}
      footer={
        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
          <Button onClick={onClose}>Close</Button>
        </div>
      }
    >
      {access.canSpfApprover && effectiveStatus === 'Pending' && (
        <div style={{ marginBottom: 24, textAlign: 'right' }}>
          <Space>
            <Button danger loading={loading} onClick={() => void handleDecision('REJECT')}>
              Reject
            </Button>
            <Button type="primary" loading={loading} onClick={() => void handleDecision('APPROVE')}>
              Approve
            </Button>
          </Space>
        </div>
      )}

      <div style={{ marginBottom: 24 }}>
        <Descriptions
          column={3}
          size="small"
          labelStyle={{
            fontWeight: 600,
            color: '#595959',
            textTransform: 'uppercase',
            letterSpacing: '0.5px',
            fontSize: 12,
          }}
          contentStyle={{ fontWeight: 500, color: '#262626' }}
        >
          <Descriptions.Item label="No">{fetchedData?.no ?? data?.no ?? '-'}</Descriptions.Item>
          <Descriptions.Item label="Return ID">
            {fetchedData?.request_id ?? data?.request_id ?? '-'}
          </Descriptions.Item>
          <Descriptions.Item label="Total Items">
            {fetchedData?.total_items ?? data?.total_items ?? 0}
          </Descriptions.Item>
          <Descriptions.Item label="Return Date">
            {formatDateTime(fetchedData?.request_date ?? data?.request_date)}
          </Descriptions.Item>
          <Descriptions.Item label="Status">
            <Tag color={statusColorMap[effectiveStatus]} bordered={false}>
              {statusLabelMap[effectiveStatus]}
            </Tag>
          </Descriptions.Item>
          <Descriptions.Item label="Remarks">
            {fetchedData?.remarks || data?.remarks || '-'}
          </Descriptions.Item>
        </Descriptions>
      </div>

      <div>
        <Title level={5} style={{ marginBottom: 16 }}>
          Status Timeline
        </Title>
        <Steps
          current={currentStep}
          size="default"
          items={STATUS_STEPS.map((title, index) => ({
            title: <span style={{ fontSize: 13, fontWeight: 500 }}>{title}</span>,
            description:
              index === 1 && effectiveStatus === 'Rejected' ? (
                <span style={{ fontSize: 12, color: '#8c8c8c' }}>Rejected</span>
              ) : undefined,
            status: getStepStatus(stepStatus, index, currentStep),
          }))}
        />
      </div>

      <div>
        <Title level={5} style={{ marginBottom: 16, marginTop: 24 }}>
          Return Items
        </Title>
        <ProTable<ReturnItem>
          columns={columnsReturn}
          dataSource={tableItems}
          loading={loading}
          rowKey="id"
          pagination={false}
          search={false}
          options={false}
          tableLayout="auto"
          style={{ backgroundColor: 'transparent' }}
          rowClassName={() => 'custom-row'}
        />
      </div>
      <Title level={5} style={{ marginBottom: 16 }}>
        Recent Activities
      </Title>
      <Timeline
        style={{ marginBottom: 24 }}
        items={(fetchedData?.activities ?? []).map((activity) => {
            const activityKey = `${activity.label ?? ''}-${activity.date ?? ''}`;
            const isExpanded = expandedActivities.includes(activityKey);
            const activityItems = activity.items ?? [];
            const hasItems = activityItems.length > 0;

            return {
              color: getTimelineColor(activity.dot, activity.label),
              children: (
                <div>
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      flexWrap: 'wrap',
                      gap: 8,
                      cursor: hasItems ? 'pointer' : undefined,
                    }}
                    onClick={hasItems ? () => toggleActivity(activityKey) : undefined}
                    role={hasItems ? 'button' : undefined}
                    aria-expanded={hasItems ? isExpanded : undefined}
                  >
                    <div>
                      <Typography.Text strong>
                        {hasItems && (
                          <span style={{ marginRight: 6, color: '#8c8c8c' }}>
                            {isExpanded ? <DownOutlined /> : <RightOutlined />}
                          </span>
                        )}
                        {activity.label}
                      </Typography.Text>
                      <br />
                      <Typography.Text type="secondary">{activity.description}</Typography.Text>
                    </div>
                    {activity.date && (
                      <Typography.Text type="secondary">{activity.date}</Typography.Text>
                    )}
                  </div>

                  {activity.messages && (
                    <Typography.Text type="secondary" style={{ display: 'block', marginTop: 6 }}>
                      {activity.messages}
                    </Typography.Text>
                  )}

                  {isExpanded && hasItems && (
                    <div style={{ marginTop: 8 }}>
                      <Table<RequestDetailActivityItem>
                        size="small"
                        rowKey="itemId"
                        pagination={false}
                        dataSource={activityItems}
                        columns={[
                          { title: 'Product ID', dataIndex: 'itemId' },
                          { title: 'Item Name', dataIndex: 'itemName', ellipsis: true },
                          { title: 'UoM', dataIndex: 'uom' },
                          { title: 'QTY Confirmed', dataIndex: 'qty_confirm', align: 'center' },
                          { title: 'Good', dataIndex: 'good_qty', align: 'center' },
                          { title: 'Damaged', dataIndex: 'damaged_qty', align: 'center' },
                          {
                            title: 'Message',
                            dataIndex: 'damage_message',
                            render: (_, record) => record.damage_message || record.remark || '-',
                          },
                          { title: 'From Warehouse', dataIndex: 'fromWarehouse' },
                          { title: 'To Warehouse', dataIndex: 'toWarehouse' },
                          { title: 'Business Unit', dataIndex: 'business_unit' },
                        ]}
                      />
                    </div>
                  )}
                </div>
              ),
            };
          })}
      />

      {previewImage && (
        <Image
          preview={{
            visible: previewOpen,
            onVisibleChange: (visible) => setPreviewOpen(visible),
            afterOpenChange: (visible) => {
              if (!visible) {
                setPreviewImage('');
                setPreviewTitle('');
              }
            },
          }}
          src={previewImage}
          alt={previewTitle}
          style={{ display: 'none' }}
        />
      )}
    </Drawer>
  );
}
