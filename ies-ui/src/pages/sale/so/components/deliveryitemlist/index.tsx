import { formatDate, formatDateTime } from '@/pages/utils';
import { AddressInfo } from '@/services/crm/data';
import { DeleteOutlined, EditOutlined, SisternodeOutlined } from '@ant-design/icons';
import ProTable from '@ant-design/pro-table';
import { Button, Card, Space } from 'antd';
import { useState } from 'react';
import { DeliveryEntry, DeliverySoItemEntry } from '../../reducer';
import { DeliveryInfo } from '../SoEntryForm';
import DeliveryItemListEntry from './DeliveryItemListEntry';
import styles from './style.less';
import moment from 'moment';
import PopconfirmMe from '@/pages/expense/delivery/components/PopconfirmMe';

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
          {
            render: (_, r) => (
              <>
                <Space size={0}>
                  {(!r?.status?.toLocaleLowerCase() ||
                    !r?.so_status?.toLocaleLowerCase() ||
                    r?.so_status.toLocaleLowerCase() != 'posted' ||
                    r?.status.toLocaleLowerCase() == 'pending'
                    // ||(r?.so_status.toLocaleLowerCase() === 'posted' && moment(r.deliveryDate).format('YYYY-MM-DD') === '2099-12-31')
                  )
                    && (
                      <>
                        {r.default && (
                          <Button
                            type="link"
                            title="Split delivery"
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
                              console.log('r', r)
                              console.log('data', data)
                              setVisible({
                                visible: true,
                                data: data?.itemList?.find((it) => it.key === r.mainKey),
                              });
                            }}
                          />
                        )}

                        {data?.defaultDelivery?.status?.toLocaleLowerCase() != 'posted' && (
                          <>
                            {r.main && !r.default && r.mainKey && (
                              <PopconfirmMe placement="leftBottom" title='Deleting Plan' description='Are you sure to delete?' onConfirm={() => { r.mainKey && actionHandlers?.delete?.(r.mainKey) }} >
                                <Button danger icon={<DeleteOutlined />} type="link" size="small" /*onClick={_ => {onDelete(record)}}*/ />
                              </PopconfirmMe>
                            )}
                          </>
                        )}
                      </>
                    )}

                  {/* {r.default && (
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
                )} */}
                </Space>
              </>
            ),
          },
        ]}
        pagination={false}
        rowClassName={(r) => {
          const isTBC =
            r.selectedDeliveryDate &&
            moment(r.selectedDeliveryDate).format('YYYY-MM-DD') === '2099-12-31';

          if (isTBC) return styles.tbcLineItem;

          if (r.qty < 0 && r.main) return styles.mainLineItemError;
          if (r.main) return styles.mainLineItem;
          if (r.qty < 0 && !r.main) return styles.subLineItemError;
          return styles.subLineItem;
        }}
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
                status: it.status,
                so_status: data.defaultDelivery?.status,
                selectedDeliveryDate: it.deliveryDate

              } as DeliverySoItemEntry),
            )
            .filter((it) => it.qty !== 0),
        )?.slice()
          ?.sort((a, b) => {
            if (!a.deliveryDate && !b.deliveryDate) return 0;
            if (!a.deliveryDate) return 1;
            if (!b.deliveryDate) return -1;

            return (
              moment(a.deliveryDate).valueOf() -
              moment(b.deliveryDate).valueOf()
            );
          })
        }
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
          so_status: data?.defaultDelivery?.status
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
