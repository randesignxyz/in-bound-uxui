import TableView, { colLink, TableViewSearchParams } from '@/components/DataCrud/TableView';
import { formatDateTime, toReadable } from '@/pages/utils';
import { Paging } from '@/services/API';
import { MultiRequest, singleRequest } from '@/services/apiGateway';
import { LoadingBayListItem, LoadingCapacityListItem, LoadingDock, LoadingDockListItem } from '@/services/delivery/data';
import { LoadingServiceParams } from '@/services/delivery/loading-bay-service-params';
import { SaveLoadingDockParams } from '@/services/delivery/queue-params';
import { simpleRequestActions } from '@/services/model';
import { ActionType } from '@ant-design/pro-table';
import { Checkbox, message, Modal, Rate, Spin } from 'antd';
import { useRef, useState } from 'react';
import LoadingDockEntryModal from './EntryForm';

export const LoadingDockListView: React.FC<{}> = ({}) => {
  const [state, setSate] = useState<{
    visible?: {
      name: 'modal';
      type: 'ADD' | 'Edit';
      payload?: {
        loadingBayList: LoadingBayListItem[];
        loadingDockList?: LoadingDockListItem[];
        loadingDock?: LoadingDock;
        loadingCapacityList?: LoadingCapacityListItem[];
      };
    };
  }>({});

  const requestActions = simpleRequestActions();
  const actionRef = useRef<ActionType>();
  const onRequestHandler = async (params: TableViewSearchParams<{}>) => {
    try {
      return (await singleRequest<LoadingDockListItem>(
        LoadingServiceParams.listLoadingDock(params),
      )(requestActions)) as Paging<LoadingDockListItem>;
    } catch (error: any) {
      message.error(error.message);
      return Promise.reject();
    }
  };

  const onSaveHandler = (data: SaveLoadingDockParams) => {
    Modal.confirm({
      title: 'Save Loading dock.',
      content: 'Are you sure?',
      onOk: async () => {
        try {
          await singleRequest(LoadingServiceParams.saveLoadingDock(data))(requestActions);
          setSate((v) => ({ ...v, visible: undefined }));
          message.success('Loading dock Saved successfully.');
          actionRef.current?.reloadAndRest?.();
        } catch (error: any) {
          message.error(error.message || 'Failed to save loading dock.');
        }
      },
    });
  };

  const onOpenEntryHandler = async (data: LoadingDockListItem) => {

      const rs = await MultiRequest<{
        loadingBayList: LoadingBayListItem[];
        loadingDockList: LoadingDockListItem[];
        loadingDock: LoadingDock;
        loadingCapacityList: LoadingCapacityListItem[];
      }>([
        LoadingServiceParams.listAllLoadingBay(),
        LoadingServiceParams.listAllLoadingDock(),
        LoadingServiceParams.fetchLoadingDock(data.id),
        LoadingServiceParams.listLoadingCapacity()
      ])(requestActions);

      setSate((v) => ({ ...v, visible: { type: 'Edit', name: 'modal', payload: rs } }));
    
  };

  return (
    <Spin spinning={requestActions.request?.loading}>
      <TableView<LoadingDockListItem, { searchValue?: string }>
        columns={[
          {
            title: 'Code',
            render: colLink(
              (r) => onOpenEntryHandler(r),
              (r) => r.code,
            ),
          },

          { title: 'Name', dataIndex: 'name' },
          { title: 'Loading Bay', render: (_, r) => r.loadingBay.name },
          {
            title: 'Auto Assigned',
            width: 120,
            render: (_, r) => <Checkbox checked={r.autoAssigned} />,
          },
          { title: 'Truck Loading Capacity', render: (_, r) => r.truckLoadingCapacities?.map(it=> it.name)?.join(', ')  },
          { title: 'Joined', render: (_, r) =>  r.combinedLoadingDocks?.map(it=> it.code)?.join(', ') },
          { title: 'Status', render: (_, r) => toReadable(r.status) },
          { title: 'Priority', render: (_, r) => <Rate value={r.priority} disabled/> },
          { title: 'Description', dataIndex: 'description' },
          { title: 'Created By', dataIndex: 'createdBy' },
          { title: 'Created Date', render: (_, r) => formatDateTime(r.createdDate) },
        ]}
        tableProps={{
          actionRef: actionRef,
        }}
        actionHandlers={{
          onAdd: async () => {
            const rs = await singleRequest(LoadingServiceParams.listAllLoadingBay())(
              requestActions,
            ) as LoadingBayListItem[];
            setSate((v) => ({
              ...v,
              visible: {
                type: 'ADD',
                name: 'modal',
                payload: {
                  loadingBayList: rs,
                },
              },
            }));
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

      {state.visible?.payload && (
        <LoadingDockEntryModal
          onSave={onSaveHandler}
          
          open={state.visible?.name === 'modal'}
          data={state.visible.payload}
          onCancel={() => setSate((v) => ({ ...v, visible: undefined }))}
        />
      )}
    </Spin>
  );
};
