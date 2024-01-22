import { formatDate, formatDateTime } from '@/pages/utils';
import { Paging } from '@/services/API';
import { VisitScheduleItem } from '@/services/crm/data';
import { CloseCircleOutlined, ScheduleOutlined } from '@ant-design/icons';
import { Button, Descriptions, List, Radio, Space, Tag } from 'antd';
import { useState } from 'react';
import { history, useAccess } from 'umi';
import { CrmPaths } from '../..';

//TODO: Support paging

const CustomerVisitListView: React.FC<{
  data?: Paging<VisitScheduleItem>;
  onCancel?: (data: VisitScheduleItem) => void;
  fetchData?: (status: string) => Promise<void>;
}> = ({ data, fetchData, onCancel }) => {
  const access = useAccess();
  const [status, setStatus] = useState('PENDING');
  return (
    <List<VisitScheduleItem>
      header={
        <Radio.Group
          value={status}
          onChange={async (e) => {
            await fetchData?.(e.target.value);
            setStatus(e.target.value);
          }}
        >
          <Radio.Button value="PENDING">Pending</Radio.Button>
          <Radio.Button value="COMPLETED">Completed</Radio.Button>
          <Radio.Button value="CANCELED">Canceled</Radio.Button>
        </Radio.Group>
      }
      itemLayout="horizontal"
      dataSource={data?.items}
      renderItem={(item) => (
        <List.Item
          extra={
            access.createEditVisitSchedule &&
            item.status == 'PENDING' && [
              <Button
                key="b1"
                onClick={() => onCancel?.(item)}
                type="link"
                icon={<CloseCircleOutlined />}
              />,
            ]
          }
        >
          <List.Item.Meta
            title={
              <Space>
                <ScheduleOutlined />{' '}
                <a onClick={() => history.push(CrmPaths.visitSchedule + `/detail/${item.id}`)}>
                  {formatDate(item.scheduleDate)}
                </a>
                {item?.scheduleType == 'Planned' && <Tag>{item?.scheduleType}</Tag>}
              </Space>
            }
            description={
              <Descriptions size="small">
                <Descriptions.Item label="Address">{item.address.name}</Descriptions.Item>
                <Descriptions.Item label="Status">{item.status}</Descriptions.Item>
                <Descriptions.Item label="Completed Date">
                  {formatDateTime(item.completedDate)}
                </Descriptions.Item>
              </Descriptions>
            }
          />
        </List.Item>
      )}
    />
  );
};
export default CustomerVisitListView;
