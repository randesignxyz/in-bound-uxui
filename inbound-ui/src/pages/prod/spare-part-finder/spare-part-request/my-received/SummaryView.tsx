import { EyeOutlined } from '@ant-design/icons';
import { ProTable } from '@ant-design/pro-components';
import type { ActionType } from '@ant-design/pro-components';
import { Button, Tag, Tooltip } from 'antd';
import type { SortOrder } from 'antd/es/table/interface';
import type { MyReceivedItem } from '../data';

interface SummaryViewProps {
  actionRef: React.RefObject<ActionType | undefined>;
  requestData: (
    pagination: { current?: number; pageSize?: number },
    sort?: Record<string, SortOrder>,
  ) => Promise<{ data: MyReceivedItem[]; total: number; success: boolean }>;
}

const SummaryView: React.FC<SummaryViewProps> = ({ actionRef, requestData }) => {
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
          dataIndex: 'action',
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
          width: 130,
        },
        {
          title: 'Request date',
          dataIndex: 'requestDate',
          width: 200,
        },
        {
          title: 'Pick up Date',
          dataIndex: 'pickUpDate',
          width: 200,
        },
        {
          title: 'Request Items',
          dataIndex: 'requestItems',
          width: 130,
          align: 'center',
          sorter: true,
        },
        {
          title: 'Received Items',
          dataIndex: 'receivedItems',
          width: 140,
          align: 'center',
          sorter: true,
        },
        {
          title: 'Remain Items',
          dataIndex: 'remainItems',
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
      ]}
      request={async (params, sort) => requestData(params, sort)}
    />
  );
};

export default SummaryView;