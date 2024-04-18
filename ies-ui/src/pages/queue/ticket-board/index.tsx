import { TableViewSearchParams } from '@/components/DataCrud/TableView';
import { Paging } from '@/services/API';
import { singleRequest } from '@/services/apiGateway';
import { QRCodeListItem, QueueTicketDetail, QueueTicketListItem } from '@/services/delivery/data';
import { QueueTicketAdvanceSearchParams } from '@/services/delivery/req-params';
import { IssueManualTicket, TicketServiceParams } from '@/services/delivery/ticket-service-params';
import { simpleRequestActions } from '@/services/model';
import {
  EyeFilled,
  HistoryOutlined,
  PlayCircleOutlined,
  PlusOutlined,
  ReloadOutlined,
} from '@ant-design/icons';
import ProList from '@ant-design/pro-list';
import { ActionType } from '@ant-design/pro-table';
import {
  Badge, Button, Card,
  Col, Input, message,
  Modal, Rate, Row,
  Segmented, Space, Spin, Tag,
} from 'antd';
import { useEffect, useRef, useState } from 'react';
import { history } from 'umi';
import ticketIcon from '@/assets/ticket.png';
import { formatDateTime, server, toReadable } from '@/pages/utils';
import moment from 'moment';
import { DeliveryServiceAPI } from '@/services/delivery/services';
import IssueTicketModal from '../ticket/issue-ticket-modal';
import TicketDetailView from '../ticket/ticket-detail-view';
import { QueuePaths } from '@/pages/delivery';
import { PageContainer, ProDescriptions } from '@ant-design/pro-components';
import { ReqQueuetParams } from '@/services/delivery/queue-params';
import ReconnectingWebSocket from 'reconnecting-websocket';

const options = [
  {
    label: 'All',
    value: 'ALL',
    subOptions: [],
  },
  { label: 'Queued', value: 'QUEUED', subOptions: [] },
  { label: 'Serving', value: 'SERVING', subOptions: [] },
  { label: 'On Hold', value: 'HOLD', subOptions: [] },
];

export default () => {
  const requestActions = simpleRequestActions();
  const actionRef = useRef<ActionType>();
  const services = DeliveryServiceAPI(requestActions);
  const [searchParams, setSearchParams] = useState<
    TableViewSearchParams<QueueTicketAdvanceSearchParams>
  >({
    criteria: {
      advanceSearch: {
        activeOnly: true,
        status: 'QUEUED',
      },
    },
  });

  // const [subStatus, SetSubStatus] = useState<{label: string; value: string;}[]>([])

  const [state, setSate] = useState<{
    visible?:
    | { type: 'ISSUE_QUEUE' }
    | { type: 'DETAIL'; payload: QueueTicketDetail };
  }>({});

  const closeModal = (visible?: boolean) => {
    !visible && setSate((v) => ({ ...v, visible: undefined }));
  };

  const onRequestHandler = async (
    params: TableViewSearchParams<QueueTicketAdvanceSearchParams>,
  ) => {
    try {
      const data = (await singleRequest(TicketServiceParams.listQueueTicket(params))(
        requestActions,
      )) as Paging<QueueTicketListItem>;
      return {
        success: !!data,
        total: data?.total,
        data: data?.items,
      };
    } catch (error: any) {
      message.error(error.message || 'Failed to load data');
      return Promise.reject();
    }
  };

  const issueTicketHandler = async (data: IssueManualTicket) => {
    Modal.confirm({
      title: 'Issule ticket manually.',
      content: 'Are you sour?',
      onOk: async () => {
        try {
          data.type == 'Delivery' &&
            singleRequest(TicketServiceParams.issueManualDiliveryTicket({ ...data }))(
              requestActions,
            );
          data.type == 'Pickup' &&
            singleRequest(TicketServiceParams.issueManualPickupTicket({ ...data }))(requestActions);
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

  useEffect(() => {
    var clientWebSocket = new ReconnectingWebSocket(`ws://${server}/event-emitter`);
    clientWebSocket.onopen = () => {
      clientWebSocket.onmessage = (ev) => {
        const message = ev.data as string;
        if (message.includes('refresh')) {
          actionRef.current?.reloadAndRest?.();
        }
      };
    };
  }, []);

  useEffect(() => {
    actionRef.current?.reloadAndRest?.();
  }, [searchParams.criteria?.advanceSearch?.status]);

  return (
    <PageContainer breadcrumb={undefined} title={'Ticket Board'} onBack={history.back}>
      <Spin spinning={requestActions.request?.loading}>
        <Row style={{ marginBottom: 10 }}>
          <Col flex="300px">
            {' '}
            <Input.Search
              allowClear
              onSearch={(value) => {
                setSearchParams((v) => ({
                  ...v,
                  criteria: {
                    ...v.criteria,
                    searchValue: value,
                  },
                }));
                actionRef.current?.reloadAndRest?.();
              }}
            />{' '}
          </Col>
          <Col flex="20px" />
          <Col flex="200px">
            <Segmented
              value={searchParams.criteria?.advanceSearch?.status}
              onChange={(value: any) => {
                setSearchParams((v) => ({
                  ...v,
                  criteria: {
                    ...v.criteria,
                    advanceSearch: {
                      ...v.criteria?.advanceSearch,
                      status: value,
                    },
                  },
                }));
              }}
              options={options} onResize={undefined} onResizeCapture={undefined} />
          </Col>
          <Col flex={'Auto'} />
          <Col>
            <Button
              type="link"
              onClick={async () => {
                setSate((v) => ({ ...v, visible: { type: 'ISSUE_QUEUE' } }));
              }}
              icon={<PlusOutlined />}
            />
            <Button
              type="link"
              onClick={async () => {
                await ReqQueuetParams.forceAssignLoadingDock(requestActions);
                actionRef.current?.reloadAndRest?.();
              }}
              icon={<PlayCircleOutlined />}
            />
            <Button
              type="link"
              onClick={() => {
                history.push(QueuePaths.history);
              }}
              icon={<HistoryOutlined />}
            />
            <Button
              type="link"
              onClick={() => actionRef.current?.reloadAndRest?.()}
              icon={<ReloadOutlined />}
            />
          </Col>
        </Row>
        <Card>
          <ProList<QueueTicketListItem>
            pagination={{
              showQuickJumper: true,
            }}
            request={(criteria, pagination) =>
              onRequestHandler({
                criteria: {
                  ...criteria,
                  searchValue: searchParams.criteria?.searchValue,
                  advanceSearch: searchParams.criteria?.advanceSearch,
                },
                pagination,
              })
            }
            actionRef={actionRef}
            metas={{
              avatar: {
                render: (_, r) => <Badge count={r.resetNum} offset={[5, 10]} size='small' color='#faad14' >  <img height="50px" src={ticketIcon} /></Badge>
              },
              title: {
                render: (_, item) => <a onClick={() => onDetailHandler(item.id)}> {item.ticketNum} </a>
              },
              subTitle: {
                render: (_, r) => <Space><Tag>{toReadable(r.status)}</Tag> </Space>
              },
              description: {
                render: (_, r) => (
                  <ProDescriptions<QueueTicketListItem> size='small' style={{ width: 'calc(100vh - 5px)' }}>
                    <ProDescriptions.Item valueType={'dateTime'} label="Issued On"> {formatDateTime(moment(r.createdDate))}</ProDescriptions.Item>
                    <ProDescriptions.Item label="Driver Name"> {[r.driver.firstName, r.driver.lastName].join(" ") || 'N/A'}</ProDescriptions.Item>
                    <ProDescriptions.Item label="License Plate #"> {r.truck.licensePlate}</ProDescriptions.Item>
                    <ProDescriptions.Item label="Prority"  > <Rate disabled value={r.priority} /> </ProDescriptions.Item>
                    <ProDescriptions.Item label="Loading Dock">
                      {[
                        r.loadingDock?.code,
                        ...(r.loadingDock?.combinedLoadingDocks?.map((it) => it.code) ||
                          []),
                      ].join(', ')}
                    </ProDescriptions.Item>
                  </ProDescriptions>
                )
              },
              actions: {
                render: (_, r) => [<Button type='link' icon={<EyeFilled />} onClick={() => onDetailHandler(r.id)} >View</Button>]
              }
            }}
          />
        </Card>
        {state.visible?.type == 'ISSUE_QUEUE' && (
          <IssueTicketModal
            open={state.visible.type == 'ISSUE_QUEUE'}
            onOpenChange={closeModal}
            onRefresh={() => actionRef.current?.reloadAndRest?.()}


          />
        )}

        {state.visible?.type == 'DETAIL' && (
          <TicketDetailView
            queueTicket={state.visible.payload}
            open={state.visible.type == 'DETAIL'}
            onRefresh={(id) => {
              actionRef.current?.reloadAndRest?.();
              return onDetailHandler(id);
            }}
            onClose={() => closeModal()}
            onSetPriority={(id: number, rate: number, remarks: string) => {
              return singleRequest(TicketServiceParams.setQeueTicketPriority(id, rate, remarks))(
                requestActions,
              );
            }}
            onCancelTicket={(id, remarks) =>
              singleRequest(TicketServiceParams.cancelQueueTicket(id, remarks))(requestActions)
            }
          />
        )}
      </Spin>
    </PageContainer>
  );
};
