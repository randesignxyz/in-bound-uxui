import TableView, { colLink, TableViewSearchParams } from '@/components/DataCrud/TableView';
import { Paging } from '@/services/API';
import { MultiRequest, singleRequest } from '@/services/apiGateway';
import { LoadingDock, Officer, OfficerItem, SaveOfficer } from '@/services/delivery/data';
import { DeliveryParams } from '@/services/delivery/delivery-params';
import { LoadingServiceParams } from '@/services/delivery/loading-bay-service-params';
import { simpleRequestActions } from '@/services/model';
import { ActionType } from '@ant-design/pro-table';
import { message, Modal, Spin } from 'antd';
import { useRef, useState } from 'react';
import OfficerEntryModal from './EntryForm';
import { PageContainer } from '@ant-design/pro-components';

export default () => {
  const requestActions = simpleRequestActions();
  const actionRef = useRef<ActionType>();
  const [state, setSate] = useState<{
    visible?: { name: 'modal'; type: 'ADD' | 'Edit'; payload?: Officer };
    loadingDockList?: LoadingDock[];
  }>({});

  const onRequestHandler = async (params: TableViewSearchParams<{}>) => {
    try {
      return (await singleRequest<OfficerItem>(DeliveryParams.listOfficer(params))(
        requestActions,
      )) as Paging<OfficerItem>;
    } catch (error: any) {
      message.error(error.message);
      return Promise.reject();
    }
  };

  const onOpenEntryHandler = async (data: OfficerItem) => {
    const initData = await MultiRequest<{
      loadingDockList: LoadingDock[];
      officer: Officer;
    }>([LoadingServiceParams.listAllLoadingDock(), DeliveryParams.fetchOfficer(data.id)])(
      requestActions,
    );

    setSate((v) => ({
      ...v,
      visible: { type: 'Edit', name: 'modal', payload: initData.officer },
      loadingDockList: initData.loadingDockList,
    }));
  };

  const onAddHandler = async () => {
    const loadingDockList = (await singleRequest(LoadingServiceParams.listAllLoadingDock())(
      requestActions,
    )) as LoadingDock[];
    setSate((v) => ({
      ...v,
      visible: { type: 'ADD', name: 'modal' },
      loadingDockList: loadingDockList,
    }));
  };

  const onSaveHandler = (data: SaveOfficer) => {
    Modal.confirm({
      title: 'Save Queue Setting.',
      content: 'Are you sure?',
      onOk: async () => {
        try {
          await singleRequest(DeliveryParams.saveOfficer(data))(requestActions);
          setSate((v) => ({ ...v, visible: undefined }));
          message.success('Saved successfully.');
          actionRef.current?.reloadAndRest?.();
        } catch (error: any) {
          message.error(error.message || 'Failed to queue.');
        }
      },
    });
  };

  return (<PageContainer onBack={() => history.back()} title="Officers">
    <Spin spinning={!!requestActions.request?.loading}>
      <TableView<OfficerItem, { searchValue?: string }>
        columns={[
          {
            title: 'Name',
            width: 150,
            render: colLink(
              (r) => onOpenEntryHandler(r),
              (r) => r.name,
            ),
          },
          { title: 'User Name', width: 150, dataIndex: 'userName' },
          { title: "Warehouses", render: (_, r) => r.warehouses.map(it => it.name).join(", ") },
          { title: "Default Loading Docks", render: (_, r) => r.loadingDocks.map(it => it.name).join(", ") },
          { title: 'Description', dataIndex: 'description' },
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

      <OfficerEntryModal
        open={state.visible?.name === 'modal'}
        data={state.visible?.payload}
        loadingDockList={state.loadingDockList || []}
        onCancel={() => setSate((v) => ({ ...v, visible: undefined }))}
        onSave={onSaveHandler}
      />
    </Spin>
  </PageContainer>
  );
};
