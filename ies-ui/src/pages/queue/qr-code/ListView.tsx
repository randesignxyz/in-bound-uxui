import TableView, {
  colLink,
  TableViewProps,
  TableViewSearchParams,
} from '@/components/DataCrud/TableView';
import { formatDateTime } from '@/pages/utils';
import { QRCode, QRCodeListItem } from '@/services/delivery/data';
import { DeliveryServiceAPI } from '@/services/delivery/services';
import { simpleRequestActions } from '@/services/model';
import { message, Modal, Spin } from 'antd';
import { useState } from 'react';
import QRCodeEntryModal from './EntryForm';

export const QRCodeListView: React.FC<TableViewProps<QRCodeListItem>> = ({ }) => {
  const [state, setSate] = useState<{
    visible?: { name: 'modal'; type: 'ADD' | 'Edit'; payload?: QRCode };
  }>({});

  const requestActions = simpleRequestActions();
  const services = DeliveryServiceAPI(requestActions);

  const onRequestHandler = async (params: TableViewSearchParams<{ searchValue?: string }>) => {
    try {
      return await services.listQRcode(params);
    } catch (error: any) {
      message.error(error.message);
      return Promise.reject();
    }
  };

  const onSaveHandler = (name: string, code: string, description?: string) => {
    Modal.confirm({
      title: 'Save QR Code.',
      content: 'Are you sure?',
      onOk: async () => {
        try {
          await services.saveQRCode(state.visible?.payload?.id || 0, name, code, description);
          setSate((v) => ({ ...v, visible: undefined }));
          message.success('Saved successfully.');
        } catch (error: any) {
          message.error(error.message || 'Failed to save QR Code.');
        }
      },
    });
  };

  const onOpenEntryHandler = async (data: QRCodeListItem) => {
    try {
      const rs = await services.fetchQRCode(data.id);
      setSate((v) => ({ ...v, visible: { type: 'Edit', name: 'modal', payload: rs } }));
    } catch (error: any) {
      message.error(error.message || 'Failed to load data.');
    }
  };

  return (
    <Spin spinning={requestActions.request?.loading}>
      <TableView<QRCodeListItem, { searchValue?: string }>
        columns={[
          {
            title: 'Code',
            render: colLink(
              (r) => onOpenEntryHandler(r),
              (r) => r.code,
            ),
          },
          { title: 'Name', dataIndex: 'name' },
          { title: 'Description', dataIndex: 'description' },
          { title: 'Created By', dataIndex: 'createdBy' },
          { title: 'Created Date', render: (_, r) => formatDateTime(r.createdDate) },
        ]}
        actionHandlers={{
          onAdd: () => {
            setSate((v) => ({ ...v, visible: { name: 'modal', type: 'ADD' } }));
          },
          onRequest: (criteria, pagination, sort) =>
            onRequestHandler({
              criteria: { ...criteria, sort: sort },
              pagination,

            }),
        }}
      />

      <QRCodeEntryModal
        open={state.visible?.name == 'modal'}
        data={state.visible?.payload}
        onCancel={() => setSate((v) => ({ ...v, visible: undefined }))}
        onSave={onSaveHandler}
      />
    </Spin>
  );
};
