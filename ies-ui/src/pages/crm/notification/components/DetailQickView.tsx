import DescriptionDisplay from '@/components/Descriptions';
import { NotificationLess } from '@/services/crm/data';
import { Button, Card, Col, Drawer, DrawerProps, Row } from 'antd';

interface Props extends DrawerProps {
  notification?: NotificationLess;
  onSentNotification?: (id: number) => void;
}

const DetailQuickView: React.FC<Props> = ({ notification, onSentNotification, ...props }) => {
  return (
    <Drawer {...props}>
      <Card size="small" title="General">
        <DescriptionDisplay
          column={2}
          data={[
            { label: 'Subject', value: notification?.title },
            { label: 'Status', value: notification?.status },
            { label: 'Message', value: notification?.body },
          ]}
        />
        <Row>
          <Col>
            <Button
              type="primary"
              // icon={<EyeOutlined />}
              onClick={async () => {
                if (notification && onSentNotification) onSentNotification(notification?.id);
              }}
            >
              {notification?.status.toLowerCase() == 'pending' ? 'Send Now' : 'Re-Send'}
            </Button>
          </Col>
        </Row>
      </Card>
      {/* <Card style={{ marginTop: '10px' }} size="small" title="Order Amount">
        <DescriptionDisplay
          column={1}
          data={[
            { label: 'Amount', value: formatter.format(soDetail?.amount || 0) },
            { label: 'Discount Amount', value: formatter.format(soDetail?.discountAmount || 0) },
            { label: 'VAT Amount', value: formatter.format(soDetail?.vatAmount || 0) },
            { label: 'Total Amount', value: formatter.format(soDetail?.totalAmount || 0) },
          ]}
        />
      </Card> */}
    </Drawer>
  );
};

export default DetailQuickView;
