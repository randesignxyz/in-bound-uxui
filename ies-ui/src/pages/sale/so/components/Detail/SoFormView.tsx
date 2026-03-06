import { SoDetail } from '@/services/sale/data';
import { DollarCircleOutlined, EnvironmentOutlined, PaperClipOutlined } from '@ant-design/icons';
import { Space, Tabs } from 'antd';
import AttachmentsView from './AttachementsView';
import DeliveryListItemView from './DeliveryItemListView';
import OrderFormView from './OrderFormView';
import OrderLineItems from './OrderLineItems';
import ItemByCompany from './ItemByCompany';

const SoFormView = ({ data, onRefreshSo }: { data?: SoDetail; onRefreshSo?: (id: number) => void }) => {
  return (
    <Tabs>
      <Tabs.TabPane
        tab={
          <Space size={2}>
            <DollarCircleOutlined /> <span>Purchase Order</span>
          </Space>
        }
        key="saleOrder"
      >
        <OrderLineItems data={data} />
      </Tabs.TabPane>
      <Tabs.TabPane
        tab={
          <Space size={2}>
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
          soNum={data?.soNo}
          docEntry={data?.docEntry}
          soStatus={data?.status}
          onSyncSuccess={() => {
            if (data?.id) {
              onRefreshSo?.(data.id);
            }
          }}
        />
      </Tabs.TabPane>
      <Tabs.TabPane
        tab={
          <Space size={2}>
            <DollarCircleOutlined /> <span>Item By Company</span>
          </Space>
        }
        key="itemByCompany"
      >
        <ItemByCompany data={data} />
      </Tabs.TabPane>
      <Tabs.TabPane
        tab={
          <Space size={2}>
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
