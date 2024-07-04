import TableView, { colLink, TableViewSearchParams } from '@/components/DataCrud/TableView';
import { formatDateTime } from '@/pages/utils';
import { MultiRequest } from '@/services/apiGateway';
import { Company, Driver, DriverListItem, SaveDriver, Truck } from '@/services/delivery/data';
import { DeliveryParams } from '@/services/delivery/delivery-params';
import { DeliveryServiceAPI } from '@/services/delivery/services';
import { simpleRequestActions } from '@/services/model';
import { ActionType } from '@ant-design/pro-table';
import { Checkbox, message, Modal, Spin } from 'antd';
import { useRef, useState } from 'react';
import TruckEntryModal from './EntryForm';

export default () => {
  const [state, setSate] = useState<{
    visible?: { name: 'modal'; type: 'ADD' | 'Edit'; payload?: Driver };
    initData?: {
      companyList: Company[];
      truckList: Truck[];
    };
  }>({});

  const requestActions = simpleRequestActions();
  const services = DeliveryServiceAPI(requestActions);
  const actionRef = useRef<ActionType>();
  const onRequestHandler = async (params: TableViewSearchParams<{ searchValue?: string }>) => {
    try {
      return await services.listDriver(params);
    } catch (error: any) {
      message.error(error.message);
      return Promise.reject();
    }
  };

  const onEditHandler = async (data: DriverListItem) => {
    const initData = await MultiRequest<{
      companyList: Company[];
      truckList: Truck[];
      driver: Driver;
    }>([
      DeliveryParams.listAllCompany(),
      DeliveryParams.listAllTruck(),
      DeliveryParams.fetchDriver(data.id),
    ])(requestActions);

    setSate((v) => ({
      ...v,
      visible: { type: 'Edit', name: 'modal', payload: initData.driver },
      initData: {
        companyList: initData.companyList,
        truckList: initData.truckList,
      },
    }));
  };

  const onAddHandler = async () => {
    const initData = await MultiRequest<{
      companyList: Company[];
      truckList: Truck[];
    }>([DeliveryParams.listAllCompany(), DeliveryParams.listAllTruck()])(requestActions);

    setSate((v) => ({
      ...v,
      visible: { name: 'modal', type: 'ADD' },
      initData: {
        companyList: initData.companyList,
        truckList: initData.truckList,
      },
    }));
  };

  const onSaveHandler = (data: SaveDriver) => {
    Modal.confirm({
      title: 'Save Driver.',
      content: 'Are you sure?',
      onOk: async () => {
        try {
          await services.saveDriver({ ...data, id: state.visible?.payload?.id });
          setSate((v) => ({ ...v, visible: undefined }));
          actionRef.current?.reloadAndRest?.();
          message.success('Saved successfully.');
        } catch (error: any) {
          message.error(error.message || 'Failed to driver.');
        }
      },
    });
  };

  return (
    <Spin spinning={requestActions.request?.loading}>
      <TableView<DriverListItem, { searchValue?: string }>
        columns={[
          {
            title: 'Name',
            render: colLink(
              (r) => onEditHandler(r),
              (r) => [r.firstName, r.lastName].join(' '),
            ),
          },
          { title: 'Company', render: (_, r) => r.company?.name },
          { title: 'ID Card', dataIndex: 'idCard' },
          { title: 'Driver License', dataIndex: 'driverLicense' },
          { title: 'Driver License Type', dataIndex: 'driverLicenseType' },
          { title: 'Delivery Tracking', render: (_, r) => <Checkbox checked={r.deliveryTracking == undefined ? true : r.deliveryTracking} /> },
          { title: 'Driver License Expired Date', dataIndex: 'driverLicenseExpiredDate' },
          { title: 'Created By', dataIndex: 'createdBy' },
          {
            title: 'Created Date',
            width: 150,
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
              criteria,
              pagination,
              // sort
            }),
        }}
      />
      <TruckEntryModal
        companyList={state.initData?.companyList || []}
        truckList={state.initData?.truckList || []}
        open={state.visible?.name === 'modal'}
        onCancel={() => setSate((v) => ({ ...v, visible: undefined }))}
        data={state.visible?.payload}
        onSave={onSaveHandler}
      />
    </Spin>
  );
};
