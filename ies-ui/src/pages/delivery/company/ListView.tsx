import TableView, { colLink, TableViewSearchParams } from '@/components/DataCrud/TableView';
import { formatDateTime } from '@/pages/utils';
import { MultiRequest } from '@/services/apiGateway';
import { Company, CompanyListItem, SaveCompany, TransportSource } from '@/services/delivery/data';
import { DeliveryParams } from '@/services/delivery/delivery-params';
import { DeliveryServiceAPI } from '@/services/delivery/services';
import { simpleRequestActions } from '@/services/model';
import { message, Modal, Spin } from 'antd';
import { useState } from 'react';
import CompanyEntryModal from './EntryForm';

export default () => {
  const [state, setSate] = useState<{
    visible?: { name: 'modal'; type: 'ADD' | 'Edit'; payload?: Company };
    initData?: {
      transportsourceList: TransportSource[];
    };
  }>({});

  const requestActions = simpleRequestActions();
  const services = DeliveryServiceAPI(requestActions);

  const onRequestHandler = async (params: TableViewSearchParams<{}>) => {
    try {
      return await services.listCompany(params);
    } catch (error: any) {
      message.error(error.message);
      return Promise.reject();
    }
  };

  const onEditHandler = async (data: CompanyListItem) => {
    const initData = await MultiRequest<{
      transportSourceList: TransportSource[];
      company: Company;
    }>([DeliveryParams.listAllTranSource(), DeliveryParams.fetchCompany(data.id)])(requestActions);

    setSate((v) => ({
      ...v,
      visible: { type: 'Edit', name: 'modal', payload: initData.company },
      initData: {
        transportsourceList: initData.transportSourceList,
      },
    }));
  };

  const onAddHandler = async () => {
    const initData = await MultiRequest<{
      transportSourceList: TransportSource[];
    }>([DeliveryParams.listAllTranSource()])(requestActions);

    setSate((v) => ({
      ...v,
      visible: { name: 'modal', type: 'ADD' },
      initData: {
        transportsourceList: initData.transportSourceList,
      },
    }));
  };

  const onSaveHandler = (data: SaveCompany) => {
    Modal.confirm({
      title: 'Save Company.',
      content: 'Are you sure?',
      onOk: async () => {
        try {
          await services.saveCompany({ ...data, id: state.visible?.payload?.id });
          setSate((v) => ({ ...v, visible: undefined }));
          message.success('Saved successfully.');
        } catch (error: any) {
          message.error(error.message || 'Failed to company.');
        }
      },
    });
  };

  return (
    <Spin spinning={requestActions.request?.loading}>
      <TableView<CompanyListItem, { searchValue?: string }>
        columns={[
          {
            title: 'Name',
            render: colLink(
              (r) => onEditHandler(r),
              (r) => r.name,
            ),
          },
          { title: 'Transport Source', render: (_, r) => r.transportSource.name },
          { title: 'Contact Person', dataIndex: 'contactPerson' },
          { title: 'Phones', render: (_, r) => [r.phone1, r.phone2].filter((it) => it).join(', ') },
          { title: 'Description', dataIndex: 'description' },
          { title: 'Created By', dataIndex: 'createdBy' },
          {
            title: 'Created Date',
            width: 150,
            align: 'right',
            render: (_, r) => formatDateTime(r.createdDate),
          },
        ]}
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
      <CompanyEntryModal
        transprotSourceList={state.initData?.transportsourceList || []}
        open={state.visible?.name === 'modal'}
        onCancel={() => setSate((v) => ({ ...v, visible: undefined }))}
        data={state.visible?.payload}
        onSave={onSaveHandler}
      />
    </Spin>
  );
};
