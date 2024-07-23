import TableView, { TableViewSearchParams } from '@/components/DataCrud/TableView';
import { formatDate, formatDateTime } from '@/pages/utils';
import { Paging } from '@/services/API';
import { singleRequest } from '@/services/apiGateway';
import { QueueTicketDetail, QueueTicketListItem } from '@/services/delivery/data';
import { QueueTicketAdvanceSearchParams } from '@/services/delivery/req-params';
import { TicketServiceParams } from '@/services/delivery/ticket-service-params';
import { simpleRequestActions } from '@/services/model';
import { EyeFilled } from '@ant-design/icons';
import { PageContainer } from '@ant-design/pro-components';
import { ActionType } from '@ant-design/pro-table';
import { Button, message, Rate, Segmented, Space, Tooltip } from 'antd';
import { useEffect, useRef, useState } from 'react';
import { history } from "@umijs/max";
import TicketDetailView from '../ticket/ticket-detail-view';
import AdvanceSearch from './advance-search';

const options = [
  {
    label: 'All',
    value: 'ALL',
    subOptions: [],
  },
  { label: 'Queued', value: 'QUEUED', subOptions: [] },
  { label: 'Serving', value: 'SERVING', subOptions: [] },
  { label: 'On Hold', value: 'HOLD', subOptions: [] },
  { label: 'Served', value: 'SERVED', subOptions: [] },
  { label: 'Canceled', value: 'CANCELED', subOptions: [] },
];

export default () => {
  const requestActions = simpleRequestActions();
  const actionRef = useRef<ActionType>();

  const [searchParams, setSearchParams] = useState<QueueTicketAdvanceSearchParams>({
    status: 'ALL',
  });

  const [state, setSate] = useState<{
    visible?: { type: 'DETAIL'; payload: QueueTicketDetail } | { type: 'ADVANCE-SERACH' };
  }>({});

  const onDetailHandler = async (id: number) => {
    try {
      const rs = (await singleRequest(TicketServiceParams.fetchQueueTicketDetail(id))(
        requestActions,
      )) as QueueTicketDetail;
      setSate((v) => ({ ...v, visible: { type: 'DETAIL', payload: rs } }));
    } catch (error) {
      message.error('Failed to load data.');
    }
  };

  const onRequestHandler = async (
    params: TableViewSearchParams<QueueTicketAdvanceSearchParams>,
  ) => {
    try {
      return (await singleRequest(TicketServiceParams.listQueueTicket(params))(
        requestActions,
      )) as Paging<QueueTicketListItem>;
    } catch (error: any) {
      message.error(error.message || 'Failed to load data');
      return Promise.reject();
    }
  };

  const closeModal = (visible?: boolean) => {
    !visible && setSate((v) => ({ ...v, visible: undefined }));
  };

  useEffect(() => {
    actionRef.current?.reloadAndRest?.();
  }, [searchParams.status]);

  return (
    <PageContainer breadcrumb={undefined} title={''} onBack={history.back}>
      <TableView<QueueTicketListItem, { searchValue?: string }>
        columns={[
          {
            width: 50,
            render: (_, r) => (
              <Tooltip title="View">
                <Button type="link" icon={<EyeFilled />} onClick={() => onDetailHandler(r.id)} />
              </Tooltip>
            ),
          },

          {
            title: 'Ticket No',
            sorter: 'queueNum',
            render: (_, r) => `${r.ticketNum}/${r.resetNum}`,
          },
          {
            title: 'Loading Dock',
            sorter: 'loadingDock',
            hideInTable: searchParams.status == 'QUEUED',
            render: (_, r) => r.loadingDock?.code,
          },
          {
            title: 'Issued Date',
            sorter: 'issuedDate',
            render: (_, r) => formatDateTime(r.createdDate),
          },
          {
            title: 'License Plate',
            sorter: 'licensePlate',
            render: (_, r) => r.truck.licensePlate,
          },
          {
            title: 'Driver',
            sorter: 'driver',
            render: (_, r) => [r.driver.firstName, r.driver.lastName].filter((it) => it).join(' '),
          },
          {
            title: 'Priority',
            sorter: 'priority',
            width: 150,
            render: (_, r) => <Rate disabled value={r.priority} />,
          },
          {
            title: 'Status',
            hideInTable: searchParams.status !== 'ALL',
            dataIndex: 'status',
          },
        ]}
        advanceSearch
        displayOnly
        tableProps={{
          actionRef: actionRef,
        }}
        extraFilter={
          <Space size="large">
            <Segmented
              onChange={(value: any) => {
                setSearchParams((v) => ({ ...v, status: value }));
              }}
              value={searchParams.status}
              options={options} onResize={undefined} onResizeCapture={undefined} />
          </Space>
        }
        actionHandlers={{
          onAdvanceSearchClicked() {
            setSate((v) => ({ ...v, visible: { type: 'ADVANCE-SERACH' } }));
          },
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
      />
      {state.visible?.type == 'DETAIL' && (
        <TicketDetailView
          queueTicket={state.visible.payload}
          open={state.visible.type == 'DETAIL'}
          onCancelTicket={(id, remarks) =>
            singleRequest(TicketServiceParams.cancelQueueTicket(id, remarks))(requestActions)
          }
          onRefresh={(id) => {
            actionRef.current?.reloadAndRest?.();
            return onDetailHandler(id);
          }}
          onClose={() => closeModal()}
          onSetPriority={(id: number, rate: number, remarks: string) =>
            singleRequest(TicketServiceParams.setQeueTicketPriority(id, rate, remarks))(
              requestActions,
            )
          }
        />
      )}
      {state.visible?.type == 'ADVANCE-SERACH' && (
        <AdvanceSearch open={state.visible.type == 'ADVANCE-SERACH'} onVisibleChange={closeModal} />
      )}
    </PageContainer>
  );
};
