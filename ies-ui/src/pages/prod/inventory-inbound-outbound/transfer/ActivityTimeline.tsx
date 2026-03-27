import { Empty, Timeline } from 'antd';
import moment from 'moment';

type ActivityTimelineItem = {
  id?: number;
  activities_name: string;
  action: string;
  remark?: string;
  actionBy?: string;
  actionDate?: string | moment.Moment;
};

interface ActivityTimelineProps {
  activities?: ActivityTimelineItem[];
}

const formatRelativeTime = (value?: string | moment.Moment) => {
  if (!value) return '';

  const date = moment(value);
  const relative = date.fromNow();

  return relative.startsWith('in ') ? `${relative.slice(3)} from now` : relative;
};

export default function ActivityTimeline({ activities }: ActivityTimelineProps) {
  if (!activities?.length) {
    return <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="No activities yet" />;
  }

  const latestIndex = activities.length - 1;

  return (
    <Timeline
      items={activities.map((activity, index) => ({
        color: index === latestIndex ? 'orange' : 'green',
        children: (
          <div>
            <div style={{ fontWeight: 600 }}>{activity.activities_name}</div>
            <div style={{ fontSize: 12, color: '#666' }}>
              {activity.action}
              {activity.actionBy ? ` by ${activity.actionBy}` : ''}
            </div>
            {activity.remark && activity.remark !== '-' && (
              <div style={{ fontSize: 12, color: '#666', marginTop: 2 }}>{activity.remark}</div>
            )}
            {activity.actionDate && (
              <div style={{ fontSize: 11, color: '#999', marginTop: 2 }}>
                {moment(activity.actionDate).format('YYYY-MM-DD HH:mm:ss')}
                {' • '}
                {formatRelativeTime(activity.actionDate)}
              </div>
            )}
          </div>
        ),
      }))}
    />
  );
}
