import { formatDateTime } from '@/pages/utils';
import { Activity } from '@/services/process-workflow/data';
import { FieldTimeOutlined } from '@ant-design/icons';
import ProList from '@ant-design/pro-list';
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
        description: {dataIndex: 'comment'},
        extra: {render: (_,r)=>  formatDateTime(moment(r.actionDate)) }
      }}
    />
  );
};

export default ActivityView;
