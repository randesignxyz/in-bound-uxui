import { ActionType, ProTable } from '@ant-design/pro-components';
import { EyeOutlined, ReloadOutlined } from '@ant-design/icons';
import type { Dayjs } from 'dayjs';
import { useNavigate } from '@umijs/max';
import { Button, Card, DatePicker, Input, Select, Space, Tag, Tooltip } from 'antd';
import { useRef, useState } from 'react';
import { RequestActions } from '@/services/apiGateway';
import DrawerBatchReturnItems from './DrawerBatchReturnItems';
import { MY_REQUESTS_TO_RETURN_STATUS_OPTIONS } from './data';
import type {
  MyRequestToReturnItem,
  RequestDetailData,
  TableViewSearchReturnsParam,
} from './data';
import { SparePartReturnAPI } from './service';

const mapStatusToApiValue = (status: string) => {
  if (status === 'Approved') return 'APPROVED';
  if (status === 'Rejected') return 'REJECTED';
  if (status === 'Completed') return 'COMPLETED';
  if (status === 'Pending') return 'PENDING';
  return '';
};

const buildAdvanceSearch = (
  statusFilter: string,
  returnDateRange?: [Dayjs, Dayjs],
  managerDecisionDateRange?: [Dayjs, Dayjs]
): TableViewSearchReturnsParam => {
  const status = mapStatusToApiValue(statusFilter);

  const baseSearch: TableViewSearchReturnsParam = { status };

  if (returnDateRange) {
    baseSearch.returnDateFrom = returnDateRange[0].startOf('day').toISOString();
    baseSearch.returnDateTo = returnDateRange[1].endOf('day').toISOString();
  }

  if (managerDecisionDateRange && status === 'APPROVED') {
    baseSearch.approvedDateFrom = managerDecisionDateRange[0].startOf('day').toISOString();
    baseSearch.approvedDateTo = managerDecisionDateRange[1].endOf('day').toISOString();
  }

  if (managerDecisionDateRange && status === 'REJECTED') {
    baseSearch.rejectedDateFrom = managerDecisionDateRange[0].startOf('day').toISOString();
    baseSearch.rejectedDateTo = managerDecisionDateRange[1].endOf('day').toISOString();
  }

  return baseSearch;
};

export default function MyRequestsToReturn() {
  const actionRef = useRef<ActionType>();
  const [statusFilter, setStatusFilter] = useState<string>('Status');
  const [searchValue, setSearchValue] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [returnDateRange, setReturnDateRange] = useState<[Dayjs, Dayjs] | undefined>();
  const [managerDecisionDateRange, setManagerDecisionDateRange] = useState<
    [Dayjs, Dayjs] | undefined
  >();
  const [detailOpen, setDetailOpen] = useState(false);
  const [detailData, setDetailData] = useState<RequestDetailData | null>(null);
  const [detailReturnId, setDetailReturnId] = useState<number | null>(null);
  const navigate = useNavigate();

  const requestAction: RequestActions = {
    start: (serviceName) => console.log(`Loading: ${serviceName}`),
    end: (status, reason) => console.log(status, reason),
  };

  const onDetailHandler = (record: MyRequestToReturnItem) => {
    const data: RequestDetailData = {
      no: record.id,
      request_id: record.return_id,
      total_items: record.total_items,
      request_date: record.return_date,
      status: record.status,
      remarks: record.remarks,
      items: [],
      activities: [],
    };
    setDetailData(data);
    setDetailReturnId(record.id);
    setDetailOpen(true);
  };

  const fetchReturnPages = async (params: { current?: number; pageSize?: number }) => {
    setCurrentPage(params.current ?? 1);
    setPageSize(params.pageSize ?? 10);

    const result = await SparePartReturnAPI(requestAction).fetch_batch_spare_parts_return({
      pagination: {
        current: params.current,
        pageSize: params.pageSize,
      },
      criteria: {
        searchValue,
        advanceSearch: buildAdvanceSearch(
          statusFilter,
          returnDateRange,
          managerDecisionDateRange
        ),
      },
    });

    return {
      data: result.items,
      success: true,
      total: result.total ?? result.items.length,
    };
  };

  return (
    <>
      <Card size="small" style={{ marginBottom: 10 }}>
        <Space wrap size="middle">
          <Input.Search
            placeholder="Search return request..."
            allowClear
            onSearch={(value: string) => {
              setSearchValue(value);
              actionRef.current?.reloadAndRest?.();
            }}
            style={{ width: 250 }}
          />
          <Select
            value={statusFilter}
            style={{ width: 125 }}
            onChange={(value) => {
              setStatusFilter(value);
              if (value !== 'Approved' && value !== 'Rejected') {
                setManagerDecisionDateRange(undefined);
              }
              actionRef.current?.reloadAndRest?.();
            }}
            options={[...MY_REQUESTS_TO_RETURN_STATUS_OPTIONS]}
          />
          <DatePicker.RangePicker
            placeholder={['Return Date From', 'Return Date To']}
            onChange={(dates) => {
              setReturnDateRange(dates ? ([dates[0], dates[1]] as [Dayjs, Dayjs]) : undefined);
              actionRef.current?.reloadAndRest?.();
            }}
          />
          <DatePicker.RangePicker
            placeholder={['Status(Approved/Rejected) Date From', 'Status(Approved/Rejected) Date To']}
            onChange={(dates) => {
              setManagerDecisionDateRange(
                dates ? ([dates[0], dates[1]] as [Dayjs, Dayjs]) : undefined
              );
              actionRef.current?.reloadAndRest?.();
            }}
            disabled={statusFilter !== 'Approved' && statusFilter !== 'Rejected'}
          />
          
        </Space>
      </Card>

      <Card size="small">
        <ProTable<MyRequestToReturnItem>
          actionRef={actionRef}
          rowKey="id"
          size="small"
          bordered
          search={false}
          options={false}
          pagination={{
            defaultPageSize: 10,
            showSizeChanger: true,
            pageSizeOptions: [10, 20, 50],
          }}
          request={fetchReturnPages}
          toolBarRender={() => [
            <Space key="toolbar" size="small">
              <Button
                icon={<ReloadOutlined />}
                onClick={() => actionRef.current?.reloadAndRest?.()}
              >
                Refresh
              </Button>
            </Space>,
          ]}
          columns={[
            {
                key: 'id',
                title: '',
                width: 48,
                 render: (_, __, index) => (
                  <span style={{ fontWeight: 'bold' }}>
                    {(currentPage - 1) * pageSize + index + 1}
                  </span>
                 )
            },
            {
              title: '',
              width: 48,
              render: (_, record) => (
                <Space size={1}>
                  <Tooltip title="View Details">
                    <Button
                      icon={<EyeOutlined style={{ color: '#999' }} />}
                      type="text"
                      size="small"
                      onClick={() => onDetailHandler(record)}
                    />
                  </Tooltip>
                </Space>
              ),
            },
            {
              key: 'return_id',
              title: 'Return Id',
              dataIndex: 'return_id',
              render: (value) => (
                <a>{value}</a>
              ),
            },
            {
              key: 'return_date',
              title: 'Return Date',
              dataIndex: 'return_date',
            },
            {
                key : 'manager_decide_date',
                title: 'Manager Decide Date',
                dataIndex: 'manager_decide_date',
            },
            {
              key: 'total_items',
              title: 'Total Items',
              dataIndex: 'total_items',
            },
            {
              key: 'status',
              title: 'Status',
              dataIndex: 'status',
              render: (_, record) =>
                record.status === 'Pending' ? (
                  <Tag color="processing" bordered={false}>
                    Pending
                  </Tag>
                ) : record.status === 'Rejected' ? (
                  <Tag color="error" bordered={false}>
                    Rejected
                  </Tag>
                ) : record.status === 'Completed' ? (
                  <Tag color="success" bordered={false}>
                    Completed
                  </Tag>
                ) : record.status === 'Approved' ? (
                  <Tag color="warning" bordered={false}>
                    Approved
                  </Tag>
                ) : (
                  ''
                ),
            },
            {
              key: 'remarks',
              title: 'Remarks',
              dataIndex: 'remarks',
              ellipsis: true,
            },
          ]}
        />
      </Card>

      <DrawerBatchReturnItems
        open={detailOpen}
        data={detailData}
        returnId={detailReturnId}
        onClose={() => {
          setDetailOpen(false);
          setDetailData(null);
          setDetailReturnId(null);
        }}
      />
    </>
  );
}
