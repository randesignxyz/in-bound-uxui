import { Delivery, LogSyncDetail } from '@/services/sale/data';
import ProTable from '@ant-design/pro-table';
import { uniqueId } from 'lodash';
import { Button, Card, message } from 'antd';
import { useEffect, useState } from 'react';
import { DeliverySoItemEntry } from '../../reducer';
import styles from './style.less';
import { formatDate, formatDateTime } from '@/pages/utils';
import moment from 'moment';
import { CloudDownloadOutlined } from '@ant-design/icons';
import { Model } from '../../model';
import { AllocateServiceAPI } from '@/pages/delivery/allocate/service';
import { simpleRequestActions } from '@/services/model';

interface Props {
  indirectCustomer?: boolean;
  deliveries?: Delivery[];
  soNum: string
  docEntry?: any
  soStatus?: string
  onSyncSuccess?: () => void
  logSync?: LogSyncDetail[]
}

const DeliveryListItemView: React.FC<Props> = ({ indirectCustomer, deliveries, soNum, docEntry, soStatus, onSyncSuccess, logSync }) => {
  const [itemList, setItemList] = useState<DeliverySoItemEntry[]>([]);
  const { actions, modals } = Model();
  const requestActions = simpleRequestActions();
  const [syncLoading, setSyncLoading] = useState(false);
  const [onSuccess, setOnSuccess] = useState(false)
  const [syncPhase, setSyncPhase] = useState<'idle' | 'waitingRefresh'>('idle');

  useEffect(() => {
    const items =
      deliveries?.flatMap((dlv) =>
        dlv.itemList.map((it, index) => {
          return {
            key: uniqueId(),
            id: it.id,
            itemId: it.itemId,
            itemCode: it.itemCode,
            description: it.itemDesc,
            uomId: it.uomId,
            uomName: it.associatedTo?.uom.code,

            type: it.type,
            qty: it.qty,

            main: index === 0,
            shippedQty: it.shippedQty,
            deliveryDate: dlv.deliveryDate,
            shippingAddressId: dlv.shippingAddressId,
            shippingAddressCode: dlv.shippingAddress,
          };
        }),
      ) || []

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
  }, [deliveries]);

  const syncSAP = async () => {
    try {
      setSyncLoading(true);
      console.log('logSync', logSync)
      const data = deliveries?.map(d => ({
        deliveryId: d.id,
        shipDate: d.deliveryDate
      }));
      const items = logSync?.flatMap(log =>
      ({
        docNum: log.soNo,
        company: log.system
      })
        // delivery.itemList.map(item => ({
        //   docNum: item.soNo,
        //   company: item.company
        // }))
      );

      // remove duplicates (IMPORTANT)
      const uniqueItems = Array.from(
        new Map(items?.map(i => [`${i.docNum}_${i.company}`, i])).values()
      );

      const payload = {
        items: uniqueItems
      };

      // FIRST RUN (old data)
      // await actions.syncSOFromSAP(payload, data);
      await actions.syncSOFromSAP(
        uniqueItems,
        data
      );
      // await AllocateServiceAPI(requestActions).syncAllocateBySO([docEntry]);

      // now wait for refreshed data
      setSyncPhase('waitingRefresh');

      // parent reload deliveries
      onSyncSuccess?.();

    } catch (e) {
      const error = e as { error: string; message: string };
      message.error(error.message);
    } finally {
      setSyncLoading(false);
    }
  };

  useEffect(() => {
    if (syncPhase !== 'waitingRefresh') return;
    if (!deliveries) return;

    const secondSync = async () => {
      try {
        setSyncLoading(true);

        const data = deliveries.map(d => ({
          deliveryId: d.id,
          shipDate: d.deliveryDate
        }));
        // const items = deliveries?.flatMap(delivery =>
        //   delivery.itemList.map(item => ({
        //     docNum: item.soNo,
        //     company: item.company
        //   }))
        // );
        const items = logSync?.flatMap(log =>
        ({
          docNum: log.soNo,
          company: log.system
        })
          // delivery.itemList.map(item => ({
          //   docNum: item.soNo,
          //   company: item.company
          // }))
        );

        // remove duplicates (IMPORTANT)
        const uniqueItems = Array.from(
          new Map(items?.map(i => [`${i.docNum}_${i.company}`, i])).values()
        );
        console.log('datadata',data)
        // SECOND RUN (new refreshed data)
        await actions.updateBacktoSAP(data);
        await AllocateServiceAPI(requestActions).syncAllocateBySO([docEntry]);

        message.success('Sync Success')
      } catch (e) {
        const error = e as { error: string; message: string };
        message.error(error.message);
      } finally {
        setSyncLoading(false);
        setSyncPhase('idle'); // reset
      }
    };

    secondSync();
  }, [deliveries, syncPhase]);

  // useEffect(() => {
  //   if (!deliveries) {
  //     setItemList([]);
  //     return;
  //   }

  //   const rows: DeliverySoItemEntry[] = [];

  //   deliveries.forEach((dlv) => {
  //     // group main types per itemCode per deliveryDate
  //     const mainTypeMap = new Map<string, DeliverySoItemEntry>();

  //     dlv.itemList.forEach((it) => {
  //       const isSTD = it.type === 'STD';
  //       const isTDO = it.type === 'TDO';
  //       const isTDP = it.type === 'TDP';
  //       const isMainType = isSTD || isTDO || isTDP;

  //       const groupKey = `${dlv.deliveryDate}_${it.itemCode}`;

  //       if (isMainType) {
  //         if (!mainTypeMap.has(groupKey)) {
  //           mainTypeMap.set(groupKey, {
  //             key: uniqueId(),
  //             id: it.id,
  //             itemId: it.itemId,
  //             itemCode: it.itemCode,
  //             description: it.itemDesc,
  //             uomId: it.uomId,
  //             uomName: it.associatedTo?.uom.code,

  //             type: '',
  //             STD: null,
  //             TDO: null,
  //             TDP: null,
  //             qty: 0,

  //             shippedQty: it.shippedQty,
  //             deliveryDate: dlv.deliveryDate,
  //             shippingAddressId: dlv.shippingAddressId,
  //             shippingAddressCode: dlv.shippingAddress,
  //             main: true,
  //           } as unknown as DeliverySoItemEntry);
  //         }

  //         const row = mainTypeMap.get(groupKey)!;

  //         if (isSTD) row.STD = (row.STD || 0) + it.qty;
  //         if (isTDO) row.TDO = (row.TDO || 0) + it.qty;
  //         if (isTDP) row.TDP = (row.TDP || 0) + it.qty;

  //         row.qty =
  //           (row.STD || 0) +
  //           (row.TDO || 0) +
  //           (row.TDP || 0);
  //       } else {
  //         // FOC / TDL / other types → separate row
  //         rows.push({
  //           key: uniqueId(),
  //           id: it.id,
  //           itemId: it.itemId,
  //           itemCode: it.itemCode,
  //           description: it.itemDesc,
  //           uomId: it.uomId,
  //           uomName: it.associatedTo?.uom.code,

  //           type: it.type,
  //           STD: null,
  //           TDO: null,
  //           TDP: null,
  //           qty: it.qty,

  //           shippedQty: it.shippedQty,
  //           deliveryDate: dlv.deliveryDate,
  //           shippingAddressId: dlv.shippingAddressId,
  //           shippingAddressCode: dlv.shippingAddress,
  //           main: true,
  //         } as unknown as DeliverySoItemEntry);
  //       }
  //     });

  //     rows.push(...mainTypeMap.values());
  //   });

  //   // sort by delivery date
  //   rows.sort((a, b) => {
  //     // 1) delivery date
  //     if (a.deliveryDate && b.deliveryDate) {
  //       const d =
  //         moment(a.deliveryDate).valueOf() -
  //         moment(b.deliveryDate).valueOf();
  //       if (d !== 0) return d;
  //     }

  //     // 2) item code
  //     if (a.itemCode !== b.itemCode) {
  //       return (a.itemCode || '').localeCompare(b.itemCode || '');
  //     }

  //     // 3) main row first (type === '')
  //     if (!a.type && b.type) return -1;
  //     if (a.type && !b.type) return 1;

  //     return 0;
  //   });


  //   setItemList(rows);
  // }, [deliveries]);


  return (
    <Card size="small" title="Delivery Info"
      extra={
        soStatus !== 'Pending' && soStatus !== 'Failed'
          ? [
            <Button
              type="link"
              icon={<CloudDownloadOutlined />}
              key="sync"
              loading={syncLoading}
              onClick={async () => {
                syncSAP()
              }}
            >
              Sync Plan from SAP
            </Button>,
          ]
          : undefined
      }
    >
      <ProTable<DeliverySoItemEntry>
        loading={syncLoading}
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
          // { title: 'STD', dataIndex: 'STD' },
          // { title: 'TDO', dataIndex: 'TDO' },
          // { title: 'TDP', dataIndex: 'TDP' },
          // { title: 'SPO', dataIndex: 'SPO' },
          { title: 'Qty', dataIndex: 'qty' },
          { title: 'Shipped Qty', dataIndex: 'shippedQty', hideInTable: !indirectCustomer },
          { title: 'UoM', dataIndex: 'uomName' },
          { title: 'Remarks', dataIndex: 'remarks' },
        ]}
        pagination={false}
        bordered={false}
        style={{ margin: 0 }}
        rowClassName={(r) => {
          const isTBC =
            r.deliveryDate &&
            moment(r.deliveryDate).format('YYYY-MM-DD') === '2099-12-31';

          if (isTBC) return styles.tbcLineItem;

          if (r.qty < 0 && r.main) return styles.mainLineItemError;
          if (r.main) return styles.mainLineItem;
          if (r.qty < 0 && !r.main) return styles.subLineItemError;
          return styles.subLineItem;
        }}
        dataSource={itemList}
        options={{
          density: false,
          reload: false,
          setting: false,
        }}
        rowKey={'id'}
        search={false}
      />
    </Card >
  );
};

export default DeliveryListItemView;
