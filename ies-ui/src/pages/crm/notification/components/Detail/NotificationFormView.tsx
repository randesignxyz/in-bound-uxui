import DescriptionDisplay, { DescriptionDisplayDataItem } from '@/components/Descriptions';
import { NotificationLess } from '@/services/crm/data';
import { Card } from 'antd';

interface Props {
  notification?: NotificationLess;
}
// const layout1 = {
//   labelCol: { span: 10 },
//   wrapperCol: { span: 14 },
// };

const NotificationFormView: React.FC<Props> = ({ notification }) => {
  const displayItems: (DescriptionDisplayDataItem | undefined)[] = [
    { label: 'Title', value: notification?.title },
    { label: 'Message', value: notification?.body },
    { label: 'Status', value: notification?.status },
    { label: 'Created Date', value: notification?.createdDate },
  ];
  return (
    <div>
      <Card size="small" title="General">
        <DescriptionDisplay data={displayItems} />
      </Card>
    </div>
  );
};

export default NotificationFormView;
