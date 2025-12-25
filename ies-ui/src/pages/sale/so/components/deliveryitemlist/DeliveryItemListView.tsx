import { Delivery } from '@/services/sale/data';
import ProTable from '@ant-design/pro-table';
import { uniqueId } from 'lodash';
import { Card } from 'antd';
import { useEffect, useState } from 'react';
import { DeliverySoItemEntry } from '../../reducer';
import styles from './style.less';
import { formatDate, formatDateTime } from '@/pages/utils';
import moment from 'moment';

interface Props {
  deliveries?: Delivery[];
}

const DeliveryListItemView: React.FC<Props> = ({ deliveries }) => {
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
          deliveryDate: dlv.deliveryDate,
          shippingAddressId: dlv.shippingAddressId,
          shippingAddressCode: dlv.associatedTo?.shippingAddress?.address,
        } as DeliverySoItemEntry),
      ),
    )|| [];
    const sortedItems = [...items].sort((a, b) => {
      if (!a.deliveryDate && !b.deliveryDate) return 0;
      if (!a.deliveryDate) return 1;  // no date last
      if (!b.deliveryDate) return -1;

      return (
        moment(a.deliveryDate).valueOf() -
        moment(b.deliveryDate).valueOf()
      );
    });
    setItemList(sortedItems);
  }, []);

  return (
    <Card size="small" title="Delivery Info">
      <ProTable<DeliverySoItemEntry>
        columns={[
          {
            title: 'Delivery Date',
            render: (_, r) =>
              r.main && r.deliveryDate ? (
                <span style={{ display: 'inline-flex', gap: 8 }}>
                  <span>{moment(r.deliveryDate).format('YYYY-MM-DD')}</span>
                  <span>{moment(r.deliveryDate).format('HH:mm:ss')}</span>
                </span>
              ) : '-',
          },
          { title: 'Shipping Address', render: (_, r) => (r.main && r.shippingAddressCode) || '-' },
          { title: 'Item Code', dataIndex: 'itemCode' },
          { title: 'Description', dataIndex: 'description' },
          { title: 'Type', dataIndex: 'type' },
          { title: 'Qunatity', dataIndex: 'qty' },
          { title: 'UoM', dataIndex: 'uomName' },
          { title: 'Remarks', dataIndex: 'remarks' },
        ]}
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
        rowKey={'key'}
        key={'key'}
        search={false}
      />
    </Card>
  );
};

export default DeliveryListItemView;
