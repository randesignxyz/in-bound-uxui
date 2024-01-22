import { formatter } from '@/pages/utils';
import { CheckoutListItem } from '@/services/delivery/data';
import { ProCard } from '@ant-design/pro-components';
import { Card, Tag } from 'antd';
import PaymentListView from './payment-list-view';

export interface Props {
  data: CheckoutListItem;
}

const SettlementItemView: React.FC<Props> = ({ data }) => {
  return (
    <ProCard
      size="small"
      style={{ marginBottom: 10 }}
      key={`customer:${data.id}`}
      title={`${data.customerCode}-${data.customerName}`}
      subTitle={`${data.shipToCode}`}
    >
      <Card size="small" bordered={false}>
        {data.invoices.map((item) => (
          <Tag>
            {' '}
            Invoice Num: {item.invoiceNum}, {formatter.format(item.invoiceAmount)}{' '}
          </Tag>
        ))}
      </Card>

      <PaymentListView data = {data.cashCollections} />
    </ProCard>
  );
};

export default SettlementItemView