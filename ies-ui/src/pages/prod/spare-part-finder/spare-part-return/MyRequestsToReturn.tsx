import { ActionType, ProTable } from '@ant-design/pro-components';
import { EyeOutlined, ReloadOutlined } from '@ant-design/icons';
import { Button, Card, Select, Space, Tag, Tooltip } from 'antd';
import { useRef, useState } from 'react';
import { useNavigate } from '@umijs/max';
import DrawerBatchReturnItems from './DrawerBatchReturnItems';
import { RequestActions } from '@/services/apiGateway';
import type {
  MyRequestToReturnItem,
  RequestDetailData,
  TableViewSearchReturnsParam,
} from './data';
import { MY_REQUESTS_TO_RETURN_STATUS_OPTIONS } from './data';
import { SparePartReturnAPI } from './service';

export default function MyRequestsToReturn() {
  const actionRef = useRef<ActionType>();
  const [statusFilter, setStatusFilter] = useState<string>('Status');
  const [detailOpen, setDetailOpen] = useState(false);
  const [detailData, setDetailData] = useState<RequestDetailData | null>(null);
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
    setDetailOpen(true);
  };

  const fetchReturnPages = async (params: { current?: number; pageSize?: number }) => {
    const result = await SparePartReturnAPI(requestAction).fetch_batch_spare_parts_return({
      pagination: {
        current: params.current,
        pageSize: params.pageSize,
      },
      criteria: {
        searchValue: '',
        advanceSearch: {
          status: statusFilter !== 'Status' ? statusFilter : '',
        } satisfies TableViewSearchReturnsParam,
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
          <Select
            value={statusFilter}
            style={{ width: 125 }}
            onChange={(value) => {
              setStatusFilter(value);
              actionRef.current?.reloadAndRest?.();
            }}
            options={[...MY_REQUESTS_TO_RETURN_STATUS_OPTIONS]}
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
                render: (value, r) => (
                <a onClick={() => navigate(`/prod/spare-part-request/view/${r.id}`, { state: { id: r.id } })}>
                  {value}
                </a>
              ),
            },
            {
              key: 'return_date',
              title: 'Return Date',
              dataIndex: 'return_date',
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
              render: (_, r) =>
              r.status === 'Pending' ? (
                <Tag color="processing" bordered={false}
                 style={{ width: '100%'}}
                >
                  Pending

                </Tag>
              ) : r.status === 'Rejected' ? (
                <Tag color="error" bordered={false}
                 style={{ width: '100%'}}
                >
                  Rejected
                </Tag>
              ) : r.status === 'Completed' ? (
                <Tag color="success" bordered={false}
                 style={{ width: '100%'}}
                >
                  Completed
                </Tag>
              ) : r.status === 'Approved' ? (
                <Tag color="warning" bordered={false}
                 style={{ width: '100%'}}
                >
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
        onClose={() => {
          setDetailOpen(false);
          setDetailData(null);
        }}
      />
    </>
  );
}
