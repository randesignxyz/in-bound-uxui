import { formatDateTime } from '@/pages/utils';
import { Activity } from '@/services/process-workflow/data';
import { FieldTimeOutlined } from '@ant-design/icons';
import ProList from '@ant-design/pro-list';
import Paragraph from 'antd/lib/typography/Paragraph';
import moment from 'moment';

const ActivityView: React.FC<{
  activityList: Activity[];
}> = ({ activityList }) => {
  return (
    <ProList<Activity>
      dataSource={activityList}
      metas = {{
        avatar: {render: () => <FieldTimeOutlined />},
        title: {dataIndex: 'taskName'},
        subTitle: {render: (_,r )=> `${r.action} by ${r.actionBy} ${moment(moment(r.actionDate)).fromNow()}`},
        description: {dataIndex: 'comment',
          render: (_,r )=> <Paragraph ellipsis={{ rows: 2, expandable: true, symbol: 'more' }} style={{ whiteSpace: 'pre-line' }}>{r.comment}</Paragraph>
        },
        extra: {dataIndex: 'actionDate', render: (_:any,r:any)=>  formatDateTime(moment(r.actionDate)) }
      }}
    />
  );
};

export default ActivityView;
