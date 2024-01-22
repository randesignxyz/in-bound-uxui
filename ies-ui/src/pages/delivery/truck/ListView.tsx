import TableView, { colLink, TableViewSearchParams } from '@/components/DataCrud/TableView';
import { formatDateTime } from '@/pages/utils';
import { MultiRequest } from '@/services/apiGateway';
import {
  Company,
  LoadingCapacityListItem,
  SaveTruck,
  Truck,
  TruckListItem,
} from '@/services/delivery/data';
import { DeliveryParams } from '@/services/delivery/delivery-params';
import { LoadingServiceParams } from '@/services/delivery/loading-bay-service-params';
import { DeliveryServiceAPI } from '@/services/delivery/services';
import { simpleRequestActions } from '@/services/model';
import { CheckOutlined } from '@ant-design/icons';
import { ActionType } from '@ant-design/pro-table';
import { message, Modal, Spin } from 'antd';
import { useRef, useState } from 'react';
import TruckEntryModal from './EntryForm';

export default () => {
  const [state, setSate] = useState<{
    visible?: { name: 'modal'; type: 'ADD' | 'Edit'; payload?: Truck };
    initData?: {
      companyList: Company[];
      loadingCapacityList: LoadingCapacityListItem[];
    };
  }>();
  const actionRef = useRef<ActionType>();
  const requestActions = simpleRequestActions();
  const services = DeliveryServiceAPI(requestActions);

  const onRequestHandler = async (params: TableViewSearchParams<{}>) => {
    try {
      return await services.listTruck(params);
    } catch (error: any) {
      message.error(error.message);
      return Promise.reject();
    }
  };

  const onOpenEntryHandler = async (data: TruckListItem) => {
    const initData = await MultiRequest<{
      companyList: Company[];
      truck: Truck;
      loadingCapacityList: LoadingCapacityListItem[];
    }>([
      DeliveryParams.listAllCompany(),
      DeliveryParams.fetchTruck(data.id),
      LoadingServiceParams.listLoadingCapacity(),
    ])(requestActions);

    setSate((v) => ({
      ...v,
      visible: { type: 'Edit', name: 'modal', payload: initData.truck },
      initData: {
        companyList: initData.companyList,
        loadingCapacityList: initData.loadingCapacityList,
      },
    }));
  };

  const onAddHandler = async () => {
    const initData = await MultiRequest<{
      companyList: Company[];
      loadingCapacityList: LoadingCapacityListItem[];
    }>([DeliveryParams.listAllCompany(), LoadingServiceParams.listLoadingCapacity()])(
      requestActions,
    );
    setSate((v) => ({
      ...v,
      visible: { name: 'modal', type: 'ADD' },
      initData: {
        companyList: initData.companyList,
        loadingCapacityList: initData.loadingCapacityList,
      },
    }));
  };

  const onSaveHandler = (data: SaveTruck) => {
    Modal.confirm({
      title: 'Save Truck.',
      content: 'Are you sure?',
      onOk: async () => {
        try {
          await services.saveTruck({ ...data, id: state?.visible?.payload?.id });
          setSate((v) => ({ ...v, visible: undefined }));
          actionRef.current?.reloadAndRest?.();
          message.success('Saved successfully.');
        } catch (error: any) {
          message.error(error.message || 'Failed to truck.');
        }
      },
    });
  };

  return (
    <Spin spinning={requestActions.request?.loading}>
      <TableView<TruckListItem, { searchValue?: string }>
        columns={[
          {
            title: 'Name',
            render: colLink(
              (r) => onOpenEntryHandler(r),
              (r) => r.name,
            ),
          },
          { title: 'Code', dataIndex: 'code' },
          { title: 'License Plate', dataIndex: 'licensePlate' },
          { title: 'Loading Capacity', render: (_, r) => r.loadingCapacity?.name },
          { title: 'Side Door', render: (_, r) => r.isSideDoor && <CheckOutlined size={5} /> },
          { title: 'Company', render: (_, r) => r.company.name },
          { title: 'Description', dataIndex: 'description' },
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
              criteria: {
                ...criteria,
                sort,
              },
              pagination,
            }),
        }}
      />
      <TruckEntryModal
        companyList={state?.initData?.companyList || []}
        loadingCapacityList={state?.initData?.loadingCapacityList || []}
        open={state?.visible?.name === 'modal'}
        onCancel={() => setSate((v) => ({ ...v, visible: undefined }))}
        data={state?.visible?.payload}
        onSave={onSaveHandler}
      />
    </Spin>
  );
};
