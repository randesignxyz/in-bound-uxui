import TableView, { colLink, TableViewSearchParams } from '@/components/DataCrud/TableView';
import { formatDateTime } from '@/pages/utils';
import { MultiRequest } from '@/services/apiGateway';
import { LookupData } from '@/services/data';
import {
  LoadingDock,
  QRCode,
  Queue,
  QueueListItem,
  SaveQueue,
  TransportSource,
} from '@/services/delivery/data';
import { DeliveryParams } from '@/services/delivery/delivery-params';
import { LoadingServiceParams } from '@/services/delivery/loading-bay-service-params';
import { LoadingParams } from '@/services/delivery/loading-params';
import { ReqQueuetParams } from '@/services/delivery/queue-params';
import { DeliveryServiceAPI } from '@/services/delivery/services';
import { simpleRequestActions } from '@/services/model';
import { ActionType } from '@ant-design/pro-table';
import { Checkbox, message, Modal, Rate, Spin } from 'antd';
import { useRef, useState } from 'react';
import QueueEntryModal from './EntryForm';

export default () => {
  const [state, setSate] = useState<{
    visible?: { name: 'modal'; type: 'ADD' | 'Edit'; payload?: Queue };
    initData?: {
      transportSourceList?: TransportSource[];
      loadingDockList?: LoadingDock[];
      qrCodeList?: QRCode[];
      warehouses: LookupData[];
    };
  }>({});
  const requestActions = simpleRequestActions();
  const services = DeliveryServiceAPI(requestActions);
  const actionRef = useRef<ActionType>();
  const onRequestHandler = async (params: TableViewSearchParams<{}>) => {
    try {
      return await services.listQueue(params);
    } catch (error: any) {
      message.error(error.message);
      return Promise.reject();
    }
  };

  const onOpenEntryHandler = async (data: QueueListItem) => {
    const initData = await MultiRequest<{
      transportSourceList: TransportSource[];
      loadingDockList: LoadingDock[];
      qrCodeList: QRCode[];
      queue: Queue;
      warehouses: LookupData[];
    }>([
      ReqQueuetParams.listAllQRCode(),
      DeliveryParams.listAllTranSource(),
      LoadingServiceParams.listAllLoadingDock(),
      ReqQueuetParams.fetchQueue(data.id),
      LoadingParams.listWarehouse.queryParams
    ])(requestActions);

    setSate((v) => ({
      ...v,
      visible: { type: 'Edit', name: 'modal', payload: initData.queue },
      initData: {
        transportSourceList: initData.transportSourceList,
        loadingDockList: initData.loadingDockList,
        qrCodeList: initData.qrCodeList,
        warehouses: initData.warehouses
      },
    }));
  };

  const onAddHandler = async () => {
    try {
      const initData = await MultiRequest<{
        transportSourceList: TransportSource[];
        qrCodeList: QRCode[];
        loadingDockList: LoadingDock[];
        warehouses: LookupData[];
      }>([
        ReqQueuetParams.listAllQRCode(),
        DeliveryParams.listAllTranSource(),
        LoadingServiceParams.listAllLoadingDock(),
        LoadingParams.listWarehouse.queryParams
      ])(requestActions);

      setSate((v) => ({
        ...v,
        visible: { name: 'modal', type: 'ADD' },
        initData: {
          transportSourceList: initData.transportSourceList,
          loadingDockList: initData.loadingDockList,
          qrCodeList: initData.qrCodeList,
          warehouses: initData.warehouses
        },
      }));
    } catch (error) {
      message.error('Failed to load data.');
    }
  };

  const onSaveHandler = (data: SaveQueue) => {
    Modal.confirm({
      title: 'Save Queue Setting.',
      content: 'Are you sure?',
      onOk: async () => {
        try {
          await services.saveQueue({ ...data, id: state.visible?.payload?.id || 0 });
          setSate((v) => ({ ...v, visible: undefined }));
          message.success('Saved successfully.');
          actionRef.current?.reloadAndRest?.();
        } catch (error: any) {
          message.error(error.message || 'Failed to queue.');
        }
      },
    });
  };

  return (
    <Spin spinning={requestActions.request?.loading}>
      <TableView<QueueListItem, { searchValue?: string }>
        columns={[
          {
            title: 'Name',
            render: colLink(
              (r) => onOpenEntryHandler(r),
              (r) => r.name,
            ),
          },
          { title: 'Format', width: 100, dataIndex: 'format' },
          { title: 'Reset Num', width: 100, align: 'right', dataIndex: 'resetNum' },
          { title: 'priority', width: 150, render: (_, r) => <Rate disabled value={r.priority} /> },
          {
            title: 'Daily Reset',
            width: 100,
            align: 'center',
            render: (_, r) => <Checkbox checked={r.dailyReset || false} />,
          },
          {
            title: 'Over.Assigned',
            width: 100,
            align: 'center',
            render: (_, r) => <Checkbox checked={r.overwriteAssigned || false} />,
          },
          {
            title: 'Owned Truck Loading',
            width: 100,
            align: 'center',
            render: (_, r) => <Checkbox checked={r.ownedTruckLoading || false} />,
          },


          { title: 'Warehouse', width: 100, render: (_, r) => r.warehouse?.code },
          { title: 'Created By', width: 200, dataIndex: 'createdBy' },
          { title: 'Description', width: 200, dataIndex: 'description' },
          {
            title: 'Created Date',
            width: 200,
            align: 'right',
            render: (_, r) => formatDateTime(r.createdDate),
          },
        ]}
        tableProps={{
          actionRef: actionRef,
        }}
        actionHandlers={{
          onAdd: onAddHandler,
          onRequest: (criteria, pagination, sort) =>
            onRequestHandler({
              criteria: {
                ...criteria,
                sort,
              },
              pagination,
            }),
        }}
      />
      <QueueEntryModal
        init={{ ...state.initData }}
        open={state.visible?.name === 'modal'}
        onCancel={() => setSate((v) => ({ ...v, visible: undefined }))}
        data={
          state.visible?.payload &&
          ({
            name: state.visible?.payload.name,
            format: state.visible?.payload.format,
            resetNum: state.visible?.payload.resetNum,
            qrCodeId: state.visible?.payload.qrCode.id,
            transportSourceIds: state.visible?.payload.transportSources.map((it) => it.id),
            loadingDockIds: state.visible?.payload.loadingDocks.map((it) => it.id),
            dailyReset: state.visible?.payload.dailyReset,
            overwriteAssigned: state.visible?.payload.overwriteAssigned,
            warehouseId: state.visible.payload.warehouseId,
            description: state.visible?.payload.description,
            ownedTruckLoading: state.visible.payload.ownedTruckLoading,
            priority: state.visible?.payload?.priority,
          } as SaveQueue)
        }
        onSave={onSaveHandler}
      />
    </Spin>
  );
};
