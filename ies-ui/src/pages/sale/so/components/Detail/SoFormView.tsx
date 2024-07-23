import { SoDetail } from '@/services/sale/data';
import { DollarCircleOutlined, EnvironmentOutlined, PaperClipOutlined } from '@ant-design/icons';
import { Space, Tabs } from 'antd';
import AttachmentsView from './AttachementsView';
import DeliveryListItemView from './DeliveryItemListView';
import OrderFormView from './OrderFormView';
import OrderLineItems from './OrderLineItems';

const SoFormView = ({ data }: { data?: SoDetail; }) => {
  return (
    <Tabs>
      <Tabs.TabPane
        tab={
          <Space size={0}>
            <DollarCircleOutlined /> <span>Sale Order</span>
          </Space>
        }
        key="saleOrder"
      >
        <OrderLineItems data={data} />
      </Tabs.TabPane>
      <Tabs.TabPane
        tab={
          <Space size={0}>
            <EnvironmentOutlined /> <span>Delivery</span>
          </Space>
        }
        key="delivery"
      >
        <DeliveryListItemView
          indirectCustomer={
            data?.associatedTo.customer.code?.startsWith('L') && data.status === 'Closed'
          }
          deliveries={data?.deliveries}
        />
      </Tabs.TabPane>
      <Tabs.TabPane
        tab={
          <Space size={0}>
            <PaperClipOutlined /> <span>Attachment</span>
          </Space>
        }
        key="attachments"
      > 
        <AttachmentsView attachments={data?.associatedTo.attachments || []} />
      </Tabs.TabPane>
    </Tabs>
  );
};
export default SoFormView;
