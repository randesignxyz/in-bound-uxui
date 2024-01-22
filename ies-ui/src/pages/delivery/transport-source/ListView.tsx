import TableView, { colLink, TableViewSearchParams } from '@/components/DataCrud/TableView';
import { formatDateTime } from '@/pages/utils';
import { TransportSource, TransportSourceListItem } from '@/services/delivery/data';
import { DeliveryServiceAPI } from '@/services/delivery/services';
import { simpleRequestActions } from '@/services/model';
import { Checkbox, message, Modal, Spin } from 'antd';
import { useRef, useState } from 'react';
import TranporSourceEntryModal from './EntryForm';
import { ActionType } from '@ant-design/pro-components';

export default () => {
  const [state, setSate] = useState<{
    visible?: { name: 'modal'; type: 'ADD' | 'Edit'; payload?: TransportSource };
  }>({});

  const requestActions = simpleRequestActions();
  const services = DeliveryServiceAPI(requestActions);
  const actionRef = useRef<ActionType>();

  const onRequestHandler = async (params: TableViewSearchParams<{ searchValue?: string }>) => {
    try {
      return await services.listTranSource(params);
    } catch (error: any) {
      message.error(error.message);
      return Promise.reject();
    }
  };

  const onOpenEntryHandler = async (data: TransportSource) => {
    const rs = await services.fetchTranSource(data.id);
    setSate((v) => ({ ...v, visible: { type: 'Edit', name: 'modal', payload: rs } }));
  };

  const onSaveHandler = (name: string, deliveryTracking?: boolean, description?: string) => {
    Modal.confirm({
      title: 'Save Queue Setting.',
      content: 'Are you sure?',
      onOk: async () => {
        try {
          await services.saveTranSource(state.visible?.payload?.id || 0, name, deliveryTracking , description);
          setSate((v) => ({ ...v, visible: undefined }));
          message.success('Saved successfully.');
          actionRef.current?.reloadAndRest?.()
        } catch (error: any) {
          message.error(error.message || 'Failed to queue setting.');
        }
      },
    });
  };

  return (
    <Spin spinning={requestActions.request?.loading}>
      <TableView<TransportSourceListItem, { searchValue?: string }>
        columns={[
          {
            title: 'Name',
            render: colLink(
              (r) => onOpenEntryHandler(r),
              (r) => r.name,
            ),
          },
          { title: 'Delivery Tracking', render: (_,r) => <Checkbox checked = {r.deliveryTracking || false} /> },
          { title: 'Description', dataIndex: 'description' },
          { title: 'Created By', dataIndex: 'createdBy' },
          { title: 'Created Date', render: (_, r) => formatDateTime(r.createdDate) },
        ]}
        
        tableProps={{
          actionRef: actionRef
        }}
        actionHandlers={{
          onAdd: () => {
            setSate((v) => ({ ...v, visible: { name: 'modal', type: 'ADD' } }));
          },
          onRequest: (criteria, pagination, sort) =>
            onRequestHandler({
              criteria,
              pagination,
              // sort,
            }),
        }}
      />
      <TranporSourceEntryModal
        open={state.visible?.name === 'modal'}
        onCancel={() => setSate((v) => ({ ...v, visible: undefined }))}
        data={state.visible?.payload}
        onSave={onSaveHandler}
      />
    </Spin>
  );
};
