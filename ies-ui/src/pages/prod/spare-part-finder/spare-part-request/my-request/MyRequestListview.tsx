import { EyeOutlined, SearchOutlined } from '@ant-design/icons';
import { ProTable } from '@ant-design/pro-components';
import type { ActionType } from '@ant-design/pro-components';
import { useAccess } from '@umijs/max';
import { useRef, useState } from 'react';
import { Button, Card, DatePicker, Input, Select, Space, Tag, Tooltip, Typography } from 'antd';
import type { SortOrder } from 'antd/es/table/interface';
import dayjs from 'dayjs';
import type {
  MyRequestItem,
  MyRequestSearch,
  RequestPriority,
  RequestStatus,
  SparePartType,
} from '../data';
import type { SparePartRequestServiceReturn } from '../service';

const { RangePicker } = DatePicker;

const priorityFilterOptions: { label: string; value: 'ALL' | RequestPriority }[] = [
  { label: 'All', value: 'ALL' },
  { label: 'Pending', value: 'low' },
  { label: 'High', value: 'high' },
  { label: 'Normal', value: 'normal' },
];

const typeOptions: { label: string; value: 'ALL' | SparePartType }[] = [
  { label: 'All', value: 'ALL' },
  { label: 'MRO-W', value: 'MRO-W' },
  { label: 'MRO-S', value: 'MRO-S' },
  { label: 'MRO-G', value: 'MRO-G' },
];

const priorityColorMap: Record<RequestPriority, string> = {
  urgent: '#f5222d',
  high: '#fa8c16',
  normal: '#52c41a',
  low: '#1890ff',
};

const priorityLabelMap: Record<RequestPriority, string> = {
  urgent: 'Urgent',
  high: 'High',
  normal: 'Normal',
  low: 'Low',
};

const statusColorMap: Record<RequestStatus, string> = {
  pending: 'default',
  approved: 'warning',
  rejected: 'error',
  'in-progress': 'processing',
  partial: 'gold',
};

const statusLabelMap: Record<RequestStatus, string> = {
  pending: 'Pending',
  approved: 'Approved',
  rejected: 'Rejected',
  'in-progress': 'In Progress',
  partial: 'Partial',
};

interface MyRequestListviewProps {
  services: SparePartRequestServiceReturn;
}

const MyRequestListview: React.FC<MyRequestListviewProps> = ({ services }) => {
  const access = useAccess();
  const actionRef = useRef<ActionType>();

  const [searchValue, setSearchValue] = useState<string>();
  const [filters, setFilters] = useState<{
    priority: 'ALL' | RequestPriority;
    type: 'ALL' | SparePartType;
    dateRange?: [string, string];
  }>({
    priority: 'ALL',
    type: 'ALL',
  });

  const requestData = async (
    pagination: { current?: number; pageSize?: number },
    sort?: Record<string, SortOrder>,
  ) => {
    const params = {
      criteria: {
        searchValue,
        advanceSearch: {
          searchValue,
          priority: filters.priority,
          type: filters.type,
          dateRange: filters.dateRange,
          sort,
        } as MyRequestSearch,
        sort,
      },
      pagination,
    };

    const rs = await services.myRequestsPage(params);
    return {
      data: rs.items || [],
      total: rs.total || 0,
      success: true,
    };
  };

  const formatDate = (dateStr: string) => {
    const d = dayjs(dateStr);
    return d.format('YYYY-MMM-DD, h:mm A');
  };

  return (
    <>
      {!access.canSpfRequester && !access.canSpfApprover ? (
        <Card>
          <Typography.Text type="danger">
            You do not have permission to access My Requests.
          </Typography.Text>
        </Card>
      ) : (
        <>
      <Card size="small" style={{ marginBottom: 10 }}>
        <Space wrap size="middle">
          <Input.Search
            allowClear
            style={{ width: 300 }}
            placeholder="Search Spare Part name, SKU"
            onSearch={(v) => {
              setSearchValue(v);
              actionRef.current?.reloadAndRest?.();
            }}
            enterButton={<SearchOutlined />}
          />

          <Button.Group>
            {priorityFilterOptions.map((it) => (
              <Button
                key={it.value}
                type={filters.priority === it.value ? 'primary' : 'default'}
                onClick={() => {
                  setFilters((prev) => ({ ...prev, priority: it.value }));
                  actionRef.current?.reloadAndRest?.();
                }}
              >
                {it.label}
              </Button>
            ))}
          </Button.Group>

          <Select
            allowClear
            placeholder="Type"
            style={{ minWidth: 120 }}
            options={typeOptions.filter((o) => o.value !== 'ALL')}
            onChange={(v) => {
              setFilters((prev) => ({ ...prev, type: v || 'ALL' }));
              actionRef.current?.reloadAndRest?.();
            }}
          />

          <RangePicker
            placeholder={['Filter Date', 'End date']}
            onChange={(dates) => {
              if (dates && dates[0] && dates[1]) {
                setFilters((prev) => ({
                  ...prev,
                  dateRange: [dates[0]!.toISOString(), dates[1]!.toISOString()],
                }));
              } else {
                setFilters((prev) => ({ ...prev, dateRange: undefined }));
              }
              actionRef.current?.reloadAndRest?.();
            }}
          />
        </Space>
      </Card>

      <Card size="small">
        <ProTable<MyRequestItem>
          actionRef={actionRef}
          size="small"
          rowKey="id"
          search={false}
          options={false}
          bordered
          pagination={{
            defaultPageSize: 10,
            showSizeChanger: true,
            pageSizeOptions: [10, 20, 50],
            showTotal: (total, range) => `${range[0]}-${range[1]} of ${total} items`,
          }}
          columns={[
            {
              title: '',
              dataIndex: 'action',
              width: 48,
              align: 'center',
              render: (_, r) => (
                <Tooltip title="View details">
                  <Button
                    type="text"
                    size="small"
                    icon={<EyeOutlined style={{ color: '#999' }} />}
                    onClick={() => {
                      // TODO: wire detail view
                    }}
                  />
                </Tooltip>
              ),
            },
            {
              title: 'Request ID',
              dataIndex: 'requestId',
              width: 130,
            },
            {
              title: 'Priority',
              dataIndex: 'priority',
              width: 100,
              render: (_, r) => (
                <span style={{ color: priorityColorMap[r.priority], fontWeight: 500 }}>
                  {priorityLabelMap[r.priority]}
                </span>
              ),
            },
            {
              title: 'Request date',
              dataIndex: 'requestDate',
              width: 200,
              render: (_, r) => formatDate(r.requestDate),
            },
            {
              title: 'Total Items',
              dataIndex: 'totalItems',
              width: 110,
              align: 'center',
              sorter: true,
            },
            {
              title: 'Received Items',
              dataIndex: 'receivedItems',
              width: 130,
              align: 'center',
              sorter: true,
            },
            {
              title: 'Request Status',
              dataIndex: 'requestStatus',
              width: 140,
              align: 'center',
              render: (_, r) => (
                <Tag
                  color={statusColorMap[r.requestStatus]}
                  style={{ minWidth: 80, textAlign: 'center' }}
                >
                  {statusLabelMap[r.requestStatus]}
                </Tag>
              ),
            },
            {
              title: 'Remark',
              dataIndex: 'remark',
              ellipsis: true,
            },
          ]}
          request={async (params, sort) => requestData(params, sort)}
        />
      </Card>
        </>
      )}
    </>
  );
};

export default MyRequestListview;
