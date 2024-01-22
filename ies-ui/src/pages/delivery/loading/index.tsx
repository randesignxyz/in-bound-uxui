import TableView, { TableViewSearchParams } from '@/components/DataCrud/TableView';
import RemarkModal from '@/components/remark-modal';
import { formatDateTime } from '@/pages/utils';
import { Paging } from '@/services/API';
import { singleRequest } from '@/services/apiGateway';
import {
  DeliveryNoteListItem,
  Loaded,
  LoadedInfo,
  LoadingListItem,
  LoadingSummaryStatus,
  PickingSlipItem,
} from '@/services/delivery/data';
import { LoadingParams } from '@/services/delivery/loading-params';
import { LoadingAdvanceSearchParams, SaveLoadedParam } from '@/services/delivery/req-params';
import { DeliveryServiceAPI } from '@/services/delivery/services';
import { simpleRequestActions } from '@/services/model';
import {
  EyeFilled,
  FileDoneOutlined,
  FileSearchOutlined,
  FileSyncOutlined,
  StopOutlined,
} from '@ant-design/icons';
import { ActionType } from '@ant-design/pro-table';
import { Badge, Button, message, Modal, Radio, Space, Spin, Tooltip } from 'antd';
import { useEffect, useRef, useState } from 'react';
import ViewData from './data-view';
import FinishLoadingModal from './finish-loading-modal';
import PickingSlip from './picking-slip-modal';

export default () => {
  const requestActions = simpleRequestActions();
  const services = DeliveryServiceAPI(requestActions);

  const [summary, setSummary] = useState<LoadingSummaryStatus>();
  const [searchParams, setSearchParams] = useState<LoadingAdvanceSearchParams>({
    status: 'PENDING',
  });

  useEffect(() => {}, []);

  const [modal, setModal] = useState<
    | {
        type: 'PICKING-SLIP';
        payload: {
          loadingItem: LoadingListItem;
          isModified?: boolean;
          pickingSlipItems: PickingSlipItem[];
          deliveryNoteListItems: DeliveryNoteListItem[];
        };
      }
    | {
        type: 'FINISH_LOADING';
        payload: {
          loadingItem: LoadingListItem;
          loaded: Loaded;
        };
      }
    | { type: 'CANCEL'; payload: LoadingListItem }
    | { type: 'VIEW'; payload: LoadedInfo }
    | { type: 'NONE' }
  >({
    type: 'NONE',
  });

  const actionRef = useRef<ActionType>();

  const onCancelLoading = async (id: number, remarks: string) => {
    try {
      Modal.confirm({
        title: 'Cancel Loading',
        content: 'Are you sure?',
        onOk: async () => {
          try {
            await singleRequest(LoadingParams.cancelLoading(id, remarks))(requestActions);
            closeModal();
            actionRef.current?.reloadAndRest?.();
            message.success('Cancel is successfully.');
          } catch (error) {
            message.error(`Failed to cancel`);
          }
        },
      });
    } catch (error: any) {
      message.error(error.message || 'Failed to cancel');
    }
  };
  const onRequestHandler = async (params: TableViewSearchParams<LoadingAdvanceSearchParams>) => {
    try {
      services
        .loadingSummaryStatus()
        .then((rs) => setSummary(rs))
        .catch((reason) => console.error(reason));
      return (await singleRequest<LoadingListItem>(LoadingParams.listLoading(params))(
        requestActions,
      )) as Paging<LoadingListItem>;
    } catch (error: any) {
      message.error(error.message);
      return Promise.reject();
    }
  };

  const loadedHandler = async (item: LoadingListItem) => {
    try {
      const loaded = await services.fetchLoadedItem(item.id);

      setModal({
        type: 'FINISH_LOADING',
        payload: {
          loadingItem: item,
          loaded: loaded,
        },
      });
    } catch (error) {
      message.error(`Failed to load data.`);
    }
  };

  const doLoadedHandler = (data: SaveLoadedParam) => {
    Modal.confirm({
      title: 'Finish Loading',
      content: 'Are you sure?',
      onOk: async () => {
        try {
          await services.saveLoaded(data);
          closeModal();
          actionRef.current?.reloadAndRest?.();
          message.success('Loaded saved successfully.');
        } catch (error) {
          message.error(`Failed to save loaded`);
        }
      },
    });
  };

  const openPickingSlipModal = async (item: LoadingListItem, assigned?: boolean) => {
    try {
      const loadingItem = await services.listPickingSlip(item.id);
      if (loadingItem.pickingItems.length === 0) {
        message.warning('Not picking slip found.');
        return;
      }
      setModal({
        type: 'PICKING-SLIP',
        payload: {
          loadingItem: item,
          isModified: assigned,
          deliveryNoteListItems: loadingItem.deliveryNoteListItems,
          pickingSlipItems: loadingItem.pickingItems,
        },
      });
    } catch (error: any) {
      message.error(error.message);
    }
  };

  const viewHandler = async (item: LoadingListItem) => {
    const rs = await services.fetchLoadedInfo(item.id);
    setModal({ type: 'VIEW', payload: rs });
  };

  const closeModal = (visible?: boolean) => {
    !visible && setModal((v) => ({ ...v, type: 'NONE' }));
  };

  return (
    <Spin spinning={requestActions.request?.loading}>
      <TableView<LoadingListItem, { searchValue?: string }>
        extraFilter={
          <Space size="large">
            <Radio.Group
              value={searchParams.status}
              onChange={(e) => {
                if (e.target.value === 'DELIVERED') {
                }
                setSearchParams((v) => ({
                  ...v,
                  status: e.target.value,
                  settlementStatus: e.target.value === 'DELIVERED' ? 'UN_SETTLED' : 'All',
                }));

                actionRef.current?.reloadAndRest?.();
              }}
            >
              <Radio.Button value="ALL">All</Radio.Button>
              <Badge size="small" offset={[-20, 0]} count={summary?.pending}>
                <Radio.Button value="PENDING">Pending</Radio.Button>
              </Badge>
              <Badge size="small" offset={[-20, 0]} count={summary?.loading}>
                <Radio.Button value="LOADING">Loading</Radio.Button>
              </Badge>
              <Radio.Button value="LOADED">Loaded</Radio.Button>
              <Radio.Button value="CANCELED" style={{ marginLeft: 30 }}>
                Canceled
              </Radio.Button>
            </Radio.Group>
          </Space>
        }
        displayOnly
        columns={[
          {
            width: 50,
            render: (_, r) => (
              <Tooltip title="View">
                <Button type="link" icon={<EyeFilled />} onClick={() => viewHandler(r)} />
              </Tooltip>
            ),
          },
          { title: 'Loading Dock', sorter: 'loadingDock', dataIndex: 'loadingDock' },
          {
            title: 'Driver',
            sorter: 'driver',
            render: (_, r) => [r.driver.firstName, r.driver.lastName].join(' '),
          },
          { title: 'Driver Phone', render: (_, r) => r.driver.phoneNo },
          { title: 'Truck', sorter: 'truck', render: (_, r) => r.truck.licensePlate },
          {
            title: 'loading Started',
            sorter: 'loadingStarted',
            render: (_, r) => formatDateTime(r.loadingStarted),
          },
          {
            title: 'loading Ended',
            sorter: 'loadingEnded',
            render: (_, r) => formatDateTime(r.loadingEnded),
          },
          {
            title: 'Status',
            hideInTable: searchParams.status !== 'ALL',
            dataIndex: 'status',
          },
          {
            title: 'Action',
            hideInTable: searchParams.status === 'CANCELED' || searchParams.status === 'LOADED',
            render: (_, r) => (
              <Space size={1}>
                {r.status === 'PENDING' && (
                  <Tooltip title="Assign Picking">
                    <Button
                      type="link"
                      icon={<FileSearchOutlined />}
                      onClick={() => openPickingSlipModal(r)}
                    />
                  </Tooltip>
                )}

                {r.status === 'LOADING' && (
                  <Tooltip title="Complete loading">
                    <Button
                      type="link"
                      icon={<FileDoneOutlined />}
                      onClick={() => loadedHandler(r)}
                    />
                  </Tooltip>
                )}

                {r.status === 'LOADING' && (
                  <Tooltip title="Edit Picking">
                    <Button
                      type="link"
                      icon={<FileSyncOutlined />}
                      onClick={() => openPickingSlipModal(r, true)}
                    />
                  </Tooltip>
                )}

                {(r.status === 'LOADING' || r.status === 'PENDING') && (
                  <Tooltip title="Cancel loading">
                    <Button
                      type="link"
                      icon={<StopOutlined style={{ color: 'red' }} />}
                      onClick={() => setModal({ type: 'CANCEL', payload: r })}
                    />
                  </Tooltip>
                )}
              </Space>
            ),
          },
        ]}
        actionHandlers={{
          onRequest: (criteria, pagination, sort) =>
            onRequestHandler({
              criteria: {
                ...criteria,
                advanceSearch: searchParams,
                sort,
              },
              pagination,
            }),
        }}
        tableProps={{
          actionRef: actionRef,
        }}
      />
      {/* {modal.type === 'PICKING-SLIP' && (
        <PickingSlip
          open={modal.type === 'PICKING-SLIP'}
          onCancel={closeModal}
          data={modal.payload.loadingItem}
        />
      )} */}

      {modal.type === 'FINISH_LOADING' && (
        <FinishLoadingModal
          width={1000}
          open={modal.type === 'FINISH_LOADING'}
          loadingItem={modal.payload.loadingItem}
          loaded={modal.payload.loaded}
          onVisibleChange={(visible) => !visible && closeModal()}
          onSave={doLoadedHandler}
        />
      )}

      {modal.type === 'CANCEL' && (
        <RemarkModal
          title="Cancel Loading"
          open={modal.type === 'CANCEL'}
          onCancel={closeModal}
          id={modal.payload.id}
          onSave={onCancelLoading}
        />
      )}

      {modal.type === 'VIEW' && (
        <ViewData
          width={1000}
          title="Loading"
          data={modal.payload}
          open={modal.type === 'VIEW'}
          
          onVisibleChange={closeModal}
        />
      )}
    </Spin>
  );
};
