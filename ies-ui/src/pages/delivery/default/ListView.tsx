import TableView, { TableViewSearchParams } from '@/components/DataCrud/TableView';
import { formatDateTime } from '@/pages/utils';
import {
  AssignDocParam,
  AssigningDocsResponse,
  CheckoutListItem,
  DeliveryInfo,
  DeliveryListItem,
  DeliverySummaryStatus,
} from '@/services/delivery/data';
import { DeliveryAdvanceSearchParams } from '@/services/delivery/req-params';
import { DeliveryServiceAPI } from '@/services/delivery/services';
import { simpleRequestActions } from '@/services/model';
import { ActionType } from '@ant-design/pro-table';
import { Badge, Button, message, Modal, Radio, Space, Spin, Tooltip } from 'antd';
import { useRef, useState } from 'react';
import { EyeFilled, FileDoneOutlined } from '@ant-design/icons';
import DeliveryDetailView from './delivery-detail';
import AssignedDocModal from '../board/assigned-docs';

export default () => {
  const requestActions = simpleRequestActions();
  const services = DeliveryServiceAPI(requestActions);
  const [summary, setSummary] = useState<DeliverySummaryStatus>();
  const [searchParams, setSearchParams] = useState<DeliveryAdvanceSearchParams>({
    status: 'PENDING',
    settlementStatus: 'All',
  });

  const [state, setState] = useState<{
    visible?:
      | {
          type: 'SETTLEMENT';
          payload: {
            delivery: DeliveryListItem;
            items: CheckoutListItem[];
          };
        }
      | { type: 'DETAIL'; payload: DeliveryInfo }
      | {
          type: 'ASSIGNED_DOC';
          payload: {
            delivery: DeliveryListItem;
            assigningData: AssigningDocsResponse;
          };
        };
  }>();

  const actionRef = useRef<ActionType>();

  const onRequestHandler = async (params: TableViewSearchParams<DeliveryAdvanceSearchParams>) => {
    try {
      services.deliverySummaryStatus().then(setSummary).catch(console.error);
      return await services.listDelivery(params);
    } catch (error: any) {
      message.error(error.message);
      return Promise.reject();
    }
  };

  const onDetailHandler = async (data: DeliveryListItem) => {
    try {
      const rs = await services.fetchDeliveryInfo(data.id);
      setState((v) => ({ ...v, visible: { type: 'DETAIL', payload: rs } }));
    } catch (error) {
      message.error('Failed to load data.');
    }
  };

  const hideModal = (visible?: boolean) => !visible && setState({ visible: undefined });

  const onAssigningDocsHandler = async (delivery: DeliveryListItem) => {
    try {
      const assigningData = await services.fetchLoadedDetail(delivery.id);
      setState({
        visible: {
          type: 'ASSIGNED_DOC',
          payload: {
            delivery,
            assigningData,
          },
        },
      });
    } catch (error) {
      message.error('Failed to load data.');
    }
  };

  return (
    <Spin spinning={requestActions.request?.loading}>
      <TableView<DeliveryListItem, { searchValue?: string }>
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
              <Badge size="small" offset={[-20, 0]} count={summary?.inProcess}>
                <Radio.Button value="IN_PROGRESS">In Progress</Radio.Button>
              </Badge>

              <Radio.Button value="DELIVERED">Delivered</Radio.Button>

              <Radio.Button value="CANCELED" style={{ marginLeft: 30 }}>
                Canceled
              </Radio.Button>
            </Radio.Group>
          </Space>
        }
        columns={[
          {
            width: 50,
            render: (_, r) => (
              <Tooltip title="View">
                <Button type="link" icon={<EyeFilled />} onClick={() => onDetailHandler(r)} />
              </Tooltip>
            ),
          },
          {
            title: 'Driver',
            sorter: 'driver',
            render: (_, r) => [r.driver.firstName, r.driver.lastName].filter((it) => it).join(' '),
          },
          { title: 'License Plate', sorter: 'truck', render: (_, r) => r.truck.licensePlate },
          {
            title: 'Trip Started',
            sorter: 'tripStarted',
            render: (_, r) => formatDateTime(r.startedDate),
          },
          {
            title: 'Trip Ended',
            sorter: 'tripEnded',
            render: (_, r) => formatDateTime(r.finishedDate),
          },
          {
            hideInTable: ['CANCELED', 'DELIVERED'].some((it) => it === searchParams.status),
            title: 'Action',
            render: (_, r) => (
              <Space>
                {!r.assignedDocDate && (
                  <Button
                    type="link"
                    icon={<FileDoneOutlined />}
                    onClick={() => onAssigningDocsHandler(r)}
                  />
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

      {/* {state?.visible?.type === 'SETTLEMENT' && (
        <Settlement
          data={state?.visible?.payload.items}
          onSave={onSaveSettlement}
          visible={state?.visible?.type === 'SETTLEMENT'}
          onCancel={hideModal}
        />
      )} */}

      {state?.visible?.type === 'DETAIL' && (
        <DeliveryDetailView
          width={1000}
          data={state.visible.payload}
          open={state.visible.type === 'DETAIL'}
          onVisibleChange={hideModal}
        />
      )}

      {state?.visible?.type === 'ASSIGNED_DOC' && (
        <AssignedDocModal
          {...state.visible.payload}
          loading={requestActions.request?.loading}
          // onSave = {onAssignedDocsHandler}
          open={state?.visible?.type === 'ASSIGNED_DOC'}
          onReload={onAssigningDocsHandler}
          onVisibleChange={hideModal}
        />
      )}
    </Spin>
  );
};
