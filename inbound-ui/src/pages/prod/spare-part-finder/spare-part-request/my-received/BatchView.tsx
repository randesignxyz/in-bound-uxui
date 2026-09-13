import { EyeOutlined, PrinterOutlined } from '@ant-design/icons';
import { ProTable } from '@ant-design/pro-components';
import type { ActionType } from '@ant-design/pro-components';
import { Button, Progress, Tag, Tooltip } from 'antd';
import type { SortOrder } from 'antd/es/table/interface';
import type { MyReceivedItem } from '../data';

interface BatchViewProps {
  actionRef: React.RefObject<ActionType | undefined>;
  requestData: (
    pagination: { current?: number; pageSize?: number },
    sort?: Record<string, SortOrder>,
  ) => Promise<{ data: MyReceivedItem[]; total: number; success: boolean }>;
}

const BatchView: React.FC<BatchViewProps> = ({ actionRef, requestData }) => {
  return (
    <ProTable<MyReceivedItem>
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
          dataIndex: 'view',
          width: 48,
          align: 'center',
          render: (_, r) => (
            <Tooltip title="View details">
              <Button
                type="text"
                size="small"
                icon={<EyeOutlined style={{ color: r.status === 'completed' ? '#52c41a' : '#faad14' }} />}
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
          width: 120,
        },
        {
          title: 'Request date',
          dataIndex: 'requestDate',
          width: 190,
        },
        {
          title: 'Fulfillment Progress',
          dataIndex: 'fulfillment',
          width: 220,
          render: (_, r) => {
            const total = r.requestItems || 0;
            const received = r.receivedItems || 0;
            const pct = total > 0 ? Math.round((received / total) * 100) : 0;
            const color = r.status === 'completed' ? '#52c41a' : '#faad14';
            return (
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, marginBottom: 2 }}>
                  <span style={{ color, fontWeight: 500 }}>
                    {received}/{total} RECEIVED
                  </span>
                  <span style={{ color: '#999' }}>{pct}%</span>
                </div>
                <Progress
                  percent={pct}
                  size="small"
                  showInfo={false}
                  strokeColor={color}
                  trailColor="#f0f0f0"
                />
              </div>
            );
          },
        },
        {
          title: 'Received Items',
          dataIndex: 'receivedItems',
          width: 130,
          align: 'center',
          sorter: true,
        },
        {
          title: 'Status',
          dataIndex: 'status',
          width: 120,
          align: 'center',
          render: (_, r) => {
            if (r.status === 'completed') return <Tag color="success">Completed</Tag>;
            return <Tag color="warning">Partial</Tag>;
          },
        },
        {
          title: 'Action',
          dataIndex: 'action',
          width: 140,
          align: 'center',
          render: (_, r) => (
            <div style={{ position: 'relative', width: '100%', minHeight: 32 }}>
              <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
                <Button
                  type="primary"
                  size="small"
                  style={{ backgroundColor: '#faad14', borderRadius: 6 }}
                  onClick={() => {
                    // TODO: wire detail view
                  }}
                >
                  see detail
                </Button>
              </div>
              <div style={{ position: 'absolute', right: 0, top: '50%', transform: 'translateY(-50%)' }}>
                <Tooltip title="Print">
                  <Button
                    type="text"
                    size="small"
                    icon={<PrinterOutlined />}
                    onClick={() => {
                      // TODO: wire print
                    }}
                  />
                </Tooltip>
              </div>
            </div>
          ),
        },
      ]}
      request={async (params, sort) => requestData(params, sort)}
    />
  );
};

export default BatchView;