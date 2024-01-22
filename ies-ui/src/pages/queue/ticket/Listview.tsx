import TableView, { TableViewProps, TableViewSearchParams } from '@/components/DataCrud/TableView';
import RemarkModal from '@/components/remark-modal';
import { formatDate } from '@/pages/utils';
import { Paging } from '@/services/API';
import { singleRequest } from '@/services/apiGateway';
import {
  DeliveryNoteListItem,
  Loaded,
  PickingSlipItem,
  QRCodeListItem,
  QueueSummaryStatus,
  QueueTicket,
  QueueTicketDetail,
  QueueTicketListItem,
} from '@/services/delivery/data';
import { QueueTicketAdvanceSearchParams } from '@/services/delivery/req-params';
import { DeliveryServiceAPI } from '@/services/delivery/services';
import { IssueManualTicket, TicketServiceParams } from '@/services/delivery/ticket-service-params';
import { simpleRequestActions } from '@/services/model';
import { EyeFilled, StopOutlined } from '@ant-design/icons';
import { ActionType } from '@ant-design/pro-table';
import { Badge, Button, message, Modal, Radio, Rate, Spin, Tooltip } from 'antd';
import { useRef, useState } from 'react';
import IssueTicketModal from './issue-ticket-modal';
import LoadingDockModal from './loading-dock-modal';
import SearchModal from './search-modal';
import TicketDetailView from './ticket-detail-view';

export const QueueTicketListView: React.FC<TableViewProps<QueueTicketListItem>> = ({ }) => {
  const requestActions = simpleRequestActions();
  const services = DeliveryServiceAPI(requestActions);

  const [summary, setSummary] = useState<QueueSummaryStatus>();
  const actionRef = useRef<ActionType>();

  const [state, setSate] = useState<{
    visible?:
    | { type: 'ISSUE_QUEUE'; payload: QRCodeListItem[] }
    | { type: 'SEARCH' }
    | { type: 'Edit'; payload: QueueTicket }
    | { type: 'LOADING_DOCK' | 'CANCELED'; payload: QueueTicketListItem }
    | { type: 'DETAIL'; payload: QueueTicketDetail }
    | {
      type: 'PICKING_SLIP';
      payload: {
        queueTicketItem: QueueTicketListItem;
        pickingSlipItems: PickingSlipItem[];
        deliveryNoteListItems: DeliveryNoteListItem[];
      };
    }
    | {
      type: 'FINISH_LOADING';
      payload: {
        queueTicketItem: QueueTicketListItem;
        loaded: Loaded;
      };
    };
  }>({});

  const [searchParams, setSearchParams] = useState<QueueTicketAdvanceSearchParams>({
    status: 'ALL',
  });

  const closeModal = (visible?: boolean) => {
    !visible && setSate((v) => ({ ...v, visible: undefined }));
  };

  const onRequestHandler = async (
    params: TableViewSearchParams<QueueTicketAdvanceSearchParams>,
  ) => {
    services.queueSummaryStatus().then(setSummary).catch(console.error);

    return (await singleRequest(TicketServiceParams.listQueueTicket(params))(
      requestActions,
    )) as Paging<QueueTicketListItem>;
  };

  const assignedLoadingHandler = (id: number, loadingDockId: number) => {
    Modal.confirm({
      title: 'Loading Bay Assigning',
      content: 'Are you sure?',
      onOk: async () => {
        try {
          await services.assignedLoadingDock(id, loadingDockId);
          closeModal();
          actionRef.current?.reloadAndRest?.();
          message.success('Loading bay assigned succesfully.');
        } catch (error) {
          message.error(`Failed to assign loading bay`);
        }
      },
    });
  };

  const onCancelTicketHandler = (id: number, remarks: string) => {
    Modal.confirm({
      title: 'Cancel Queue Ticket',
      content: 'Are you sure?',
      onOk: async () => {
        try {
          await singleRequest(TicketServiceParams.cancelQueueTicket(id, remarks))(requestActions);
          closeModal();
          actionRef.current?.reloadAndRest?.();
          message.success('Queue ticket canceled succesfully.');
        } catch (error) {
          message.error(`Failed to cancel queue ticket.`);
        }
      },
    });
  };

  const onStartEditHandler = async (id: number) => {
    try {
      const rs = (await singleRequest(TicketServiceParams.fetchQueueTicketDetail(id))(
        requestActions,
      )) as QueueTicketDetail;
      setSate((v) => ({ ...v, visible: { type: 'DETAIL', payload: rs } }));
    } catch (error) {
      message.error('Failed to load data.');
    }
  };

  const issueTicketHandler = async (data: IssueManualTicket) => {
    Modal.confirm({
      title: 'Issule ticket manually.',
      content: 'Are you sour?',
      onOk: async () => {
        try {
          if (data.type == 'Delivery') {
            await singleRequest(TicketServiceParams.issueManualDiliveryTicket({ ...data }))(requestActions);
          }
          if(data.type == 'Pickup' ) {
            await singleRequest(TicketServiceParams.issueManualPickupTicket({ ...data }))(requestActions);
          }
          message.success('Ticket issued');
          closeModal();
          actionRef.current?.reloadAndRest?.();
        } catch (error: any) {
          message.error(error.message || 'Failed to issue ticket.');
        }
      },
    });
  };

  const onLoadDriverHandler = () => services.listAllDrivers();

  return (
    <Spin spinning={requestActions.request?.loading}>
      <TableView<QueueTicketListItem, { searchValue?: string }>
        columns={[
          {
            width: 50,
            render: (_, r) => (
              <Tooltip title="View">
                <Button type="link" icon={<EyeFilled />} onClick={() => onStartEditHandler(r.id)} />
              </Tooltip>
            ),
          },
          {
            title: 'Queue Num',
            sorter: 'queueNum',
            render: (_, r) => [r.ticketNum, r.resetNum].join('/'),
          },
          { title: 'Queue', dataIndex: 'queueName' },
          {
            title: 'Issued Date',
            sorter: 'issuedDate',
            render: (_, r) => formatDate(r.issuedDate),
          },
          {
            title: 'Loading Dock',
            sorter: 'loadingDock',
            hideInTable: searchParams.status === 'QUEUED',
            render: (_, r) => r.loadingDock?.code,
          },
          {
            title: 'Priority',
            sorter: 'priority',
            width: 150,
            render: (_, r) => <Rate disabled value={r.priority} />,
          },
          {
            title: 'Driver',
            sorter: 'driver',
            render: (_, r) => [r.driver.firstName, r.driver.lastName].join('-'),
          },
          {
            title: 'License Plate',
            sorter: 'licensePlate',
            render: (_, r) => r.truck.licensePlate,
          },
          {
            title: 'Truck',
            sorter: 'truckNo',
            render: (_, r) => [r.truck.code].join('-'),
          },
          { title: 'Load Capacity', align: 'right', render: (_, r) => r.truck.loadingCapacity },
          {
            title: 'Status',
            hideInTable: searchParams.status !== 'ALL',
            dataIndex: 'status',
          },
          {
            hideInTable: ['CANCELED', 'COMPLETED'].some((it) => it === searchParams.status),
            title: 'Action',
            render: (_, r) =>
              r.status !== 'CANCELED' &&
              r.status !== 'COMPLETED' && (
                <Tooltip title="Cancel Queue Ticket">
                  <Button
                    type="link"
                    icon={<StopOutlined style={{ color: 'red' }} />}
                    onClick={() => {
                      setSate((v) => ({
                        ...v,
                        visible: {
                          type: 'CANCELED',
                          payload: r,
                        },
                      }));
                    }}
                  />
                </Tooltip>
              ),
          },
        ]}
        extraFilter={
          <Radio.Group
            value={searchParams.status}
            onChange={(e) => {
              setSearchParams((v) => ({
                ...v,
                status: e.target.value,
              }));

              actionRef.current?.reloadAndRest?.();
            }}
          >
            <Radio.Button value="ALL">All</Radio.Button>
            <Badge size="small" offset={[-20, 0]} count={summary?.pending}>
              <Radio.Button value="PENDING">Pending</Radio.Button>
            </Badge>
            <Badge size="small" offset={[-20, 0]} count={summary?.inProgress}>
              <Radio.Button value="IN_PROGRESS">In Progress</Radio.Button>
            </Badge>

            <Radio.Button value="COMPLETED">Completed</Radio.Button>

            <Radio.Button value="CANCELED" style={{ marginLeft: 30 }}>
              Canceled
            </Radio.Button>
          </Radio.Group>
        }
        actionHandlers={{
          onAdd: async () => {
            const rs = await services.listAllQRCode();
            setSate((v) => ({ ...v, visible: { type: 'ISSUE_QUEUE', payload: rs } }));
          },
          onAdvanceSearchClicked: () => setSate((v) => ({ ...v, visible: { type: 'SEARCH' } })),
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
        advanceSearch
        tableProps={{
          actionRef: actionRef,
        }}
      />

      {state.visible?.type === 'LOADING_DOCK' && (
        <LoadingDockModal
          queue={state.visible.payload}
          open={state.visible.type === 'LOADING_DOCK'}
          onCancel={closeModal}
          onSave={assignedLoadingHandler}
        />
      )}
      {state.visible?.type === 'CANCELED' && (
        <RemarkModal
          title="Cancel Queue Ticket"
          id={state.visible.payload.id}
          width="500px"
          open={state.visible.type === 'CANCELED'}
          onCancel={closeModal}
          onSave={onCancelTicketHandler}
        />
      )}

      {state.visible?.type === 'DETAIL' && (
        <TicketDetailView
          queueTicket={state.visible.payload}
          open={state.visible.type === 'DETAIL'}
          onRefresh={(id) => {
            actionRef.current?.reloadAndRest?.();
            return onStartEditHandler(id);
          }}
          onCancelTicket={(id, remark) => Promise.reject()}
          onClose={() => closeModal()}
          onSetPriority={(id: number, rate: number, remarks: string) => {
            return singleRequest(TicketServiceParams.setQeueTicketPriority(id, rate, remarks))(
              requestActions,
            );
          }}
        />
      )}
      {state.visible?.type === 'SEARCH' && (
        <SearchModal
          open={state.visible.type === 'SEARCH'}
          onOpenChange={closeModal}
          onSeach={(data) => Promise.resolve()}
        />
      )}

      {state.visible?.type === 'ISSUE_QUEUE' && (
        <IssueTicketModal
          open={state.visible.type === 'ISSUE_QUEUE'}
          onLoadDrivers={onLoadDriverHandler}
          onOpenChange={closeModal}
          onIssue={issueTicketHandler}
          qrCodes={state.visible.payload}
        />
      )}
    </Spin>
  );
};

export default QueueTicketListView;
