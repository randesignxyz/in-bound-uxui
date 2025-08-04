import { Delivery } from '@/services/sale/data';
import ProTable from '@ant-design/pro-table';
import { uniqueId } from 'lodash';
import { Card } from 'antd';
import { useEffect, useState } from 'react';
import { DeliverySoItemEntry } from '../../reducer';
import styles from './style.less';
import { formatDate } from '@/pages/utils';

interface Props {
  indirectCustomer?: boolean;
  deliveries?: Delivery[];
}

const DeliveryListItemView: React.FC<Props> = ({ indirectCustomer, deliveries }) => {
  const [itemList, setItemList] = useState<DeliverySoItemEntry[]>([]);
  useEffect(() => {
    const items = deliveries?.flatMap((dlv) =>
      dlv.itemList.map(
        (it, index) =>
        ({
          key: uniqueId(),
          id: it.id,
          itemId: it.itemId,
          itemCode: it.itemCode,
          description: it.itemDesc,
          uomId: it.uomId,
          uomName: it.associatedTo?.uom.code,
          qty: it.qty,
          type: it.type,
          main: index === 0,
          shippedQty: it.shippedQty,
          deliveryDate: dlv.deliveryDate,
          shippingAddressId: dlv.shippingAddressId,
          shippingAddressCode: dlv.shippingAddress,
          remarks: it.remarks
        } as DeliverySoItemEntry),
      ),
    );

    setItemList(items || []);
  }, []);

  return (
    <Card size="small" title="Delivery Info">
      <ProTable<DeliverySoItemEntry>
        columns={[
          {
            title: 'Delivery Date',
            render: (_, r) => (r.main && formatDate(r.deliveryDate)) || '-',
          },
          { title: 'Shipping Address', render: (_, r) => (r.main && r.shippingAddressCode) || '-' },
          { title: 'Item Code', dataIndex: 'itemCode' },
          { title: 'Description', dataIndex: 'description' },
          { title: 'Type', dataIndex: 'type' },
          { title: 'Qunatity', dataIndex: 'qty' },
          { title: 'Shipped Qty', dataIndex: 'shippedQty', hideInTable: !indirectCustomer },
          { title: 'UoM', dataIndex: 'uomName' },
          {
            title: 'Remarks',
            dataIndex: 'remarks',
            render: (text) => (
              <div style={{ maxWidth: 300, whiteSpace: 'normal', wordBreak: 'break-word' }}>
                {text}
              </div>
            ),
          }]}
        pagination={false}
        bordered={false}
        style={{ margin: 0 }}
        rowClassName={(r) =>
          (r.qty < 0 && styles.mainLineItemError) ||
          (r.main && styles.mainLineItem) ||
          (r.qty < 0 && !r.main && styles.subLineItemError) ||
          (!r.main && styles.subLineItem)
        }
        dataSource={itemList}
        options={{
          density: false,
          reload: false,
          setting: false,
        }}
        rowKey={'id'}
        search={false}
      />
    </Card>
  );
};

export default DeliveryListItemView;
