import TableView, { colLink, TableViewSearchParams } from '@/components/DataCrud/TableView';
import { formatDateTime, toReadable } from '@/pages/utils';
import { Paging } from '@/services/API';
import { singleRequest } from '@/services/apiGateway';
import { LoadingBay, LoadingBayListItem } from '@/services/delivery/data';
import { LoadingServiceParams } from '@/services/delivery/loading-bay-service-params';
import { simpleRequestActions } from '@/services/model';
import { ActionType } from '@ant-design/pro-table';
import { message, Modal, Rate, Spin } from 'antd';
import { useRef, useState } from 'react';
import LoadingBayEntryModal from './entry-form';
import { PageContainer } from '@ant-design/pro-components';

export default () => {
  const requestActions = simpleRequestActions();
  const actionRef = useRef<ActionType>();
  const [state, setSate] = useState<{
    visible?: { name: 'modal'; type: 'ADD' | 'Edit'; payload?: LoadingBay };
  }>({});

  const onOpenEntryHandler = async (data: LoadingBayListItem) => {
    const rs = (await singleRequest(LoadingServiceParams.fetchLoadingBay(data.id))(
      requestActions,
    )) as LoadingBay;
    setSate((v) => ({ ...v, visible: { type: 'Edit', name: 'modal', payload: rs } }));
  };

  const onCloseHandler = () => setSate({});

  const onRequestHandler = async (params: TableViewSearchParams<{}>) => {
    try {
      return (await singleRequest<LoadingBayListItem>(LoadingServiceParams.listLoadingBay(params))(
        requestActions,
      )) as Paging<LoadingBayListItem>;
    } catch (error: any) {
      message.error(error.message);
      return Promise.reject();
    }
  };

  const onSaveHandler = (data: LoadingBay) => {
    Modal.confirm({
      title: 'Save Loading Bay.',
      content: 'Are you sure?',
      onOk: async () => {
        try {
          await singleRequest(
            LoadingServiceParams.saveLoadingBay({ ...data, id: state.visible?.payload?.id || 0 }),
          )(requestActions);
          setSate((v) => ({ ...v, visible: undefined }));
          message.success('Loading bay is saved successfully.');
          actionRef.current?.reloadAndRest?.();
        } catch (error: any) {
          message.error(error.message || 'Failed to save loading bay.');
        }
      },
    });
  };

  return (
    <PageContainer onBack={() => history.back()} title="Loading Bays">
      <Spin spinning={!!requestActions.request?.loading}>
        <TableView<LoadingBayListItem, { searchValue?: string }>
          columns={[
            {
              title: 'Code',
              render: colLink(
                (r) => onOpenEntryHandler(r),
                (r) => r.code,
              ),
            },
            { title: 'Name', dataIndex: 'name' },
            { title: 'Status', render: (_, r) => toReadable(r.status) },
            { title: 'Warehouse', render: (_, r) => r.warehouse?.code },
            { title: 'Priority', render: (_, r) => <Rate value={r.priority} disabled /> },
            { title: 'Description', dataIndex: 'description' },
            { title: 'Created By', dataIndex: 'createdBy' },
            { title: 'Created Date', render: (_, r) => formatDateTime(r.createdDate) },
          ]}
          tableProps={{
            actionRef: actionRef,
          }}
          actionHandlers={{
            onAdd: () => {
              setSate((v) => ({ ...v, visible: { name: 'modal', type: 'ADD' } }));
            },
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

        <LoadingBayEntryModal
          title="Loading Bay"
          onCancel={onCloseHandler}
          open={state.visible?.name == 'modal'}
          data={state.visible?.payload}
          onSave={onSaveHandler}
        />
      </Spin>
    </PageContainer>
  );
};
