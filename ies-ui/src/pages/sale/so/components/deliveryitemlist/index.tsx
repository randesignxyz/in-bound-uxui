import { formatDate } from '@/pages/utils';
import { AddressInfo } from '@/services/crm/data';
import { DeleteOutlined, EditOutlined, SisternodeOutlined } from '@ant-design/icons';
import ProTable from '@ant-design/pro-table';
import { Button, Card, Space } from 'antd';
import { useState } from 'react';
import { DeliveryEntry, DeliverySoItemEntry } from '../../reducer';
import { DeliveryInfo } from '../SoEntryForm';
import DeliveryItemListEntry from './DeliveryItemListEntry';
import styles from './style.less';

interface Props {
  data?: {
    defaultDelivery?: DeliveryInfo;
    addressList?: AddressInfo[];
    itemList?: DeliveryEntry[];
  };
  actionHandlers?: {
    onSave?: (delivey: DeliveryEntry) => void;
    delete?: (key: string) => void;
  };
}

const DeliveryItemList: React.FC<Props> = ({ data, actionHandlers }) => {
  const [visible, setVisible] = useState<{ visible: boolean; data?: DeliveryEntry }>({
    visible: false,
  });
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
          { title: 'UoM', dataIndex: 'uomName' },
          { title: 'Remarks', dataIndex: 'remarks' },
          {
            render: (_, r) => (
              <Space size={0}>
                {r.default && (
                  <Button
                    type="link"
                    title="Slipte delivery"
                    onClick={() => setVisible({ visible: true })}
                    icon={<SisternodeOutlined />}
                  />
                )}
                {r.main && !r.default && (
                  <Button
                    size="small"
                    type="link"
                    icon={<EditOutlined />}
                    onClick={() => {
                      setVisible({
                        visible: true,
                        data: data?.itemList?.find((it) => it.key === r.mainKey),
                      });
                    }}
                  />
                )}
                {r.main && !r.default && r.mainKey && (
                  <Button
                    size="small"
                    type="link"
                    icon={<DeleteOutlined />}
                    onClick={() => {
                      r.mainKey && actionHandlers?.delete?.(r.mainKey);
                    }}
                  />
                )}
              </Space>
            ),
          },
        ]}
        pagination={false}
        rowClassName={(r) =>
          (r.qty < 0 && styles.mainLineItemError) ||
          (r.main && styles.mainLineItem) ||
          (r.qty < 0 && !r.main && styles.subLineItemError) ||
          (!r.main && styles.subLineItem)
        }
        dataSource={data?.itemList?.flatMap((it) =>
          it.itemList
            .map(
              (i, index) =>
                ({
                  deliveryDate: it.deliveryDate || data.defaultDelivery?.deliveryDate,
                  shippingAddressId: it.shippingAddressId || data.defaultDelivery?.address?.id,
                  shippingAddressCode:
                    it.shippingAddressCode || data.defaultDelivery?.address?.address,
                  itemId: i.itemId,
                  itemCode: i.itemCode,
                  description: i.itemDesc,
                  uomId: i.uomId,
                  uomName: i.uomName,
                  type: i.type,
                  key: i.key,
                  qty: i.qty,
                  main: index === 0,
                  mainKey: it.key,
                  default: index === 0 && it.default,
                } as DeliverySoItemEntry),
            )
            .filter((it) => it.qty !== 0),
        )}
        options={{
          density: false,
          reload: false,
          setting: false,
        }}
        rowKey="key"
        search={false}
      />

      <DeliveryItemListEntry
        data={{
          addressList: data?.addressList,
          default: data?.itemList?.find((it) => it.default),
          currentDelivery: visible.data,
        }}
        actionHandlers={{
          onSaveHandlers: (data) => {
            actionHandlers?.onSave?.(data);
            setVisible({ visible: false });
          },
        }}
        open={visible.visible}
        onCancel={() => setVisible({ visible: false })}
      />
    </Card>
  );
};

export default DeliveryItemList;
