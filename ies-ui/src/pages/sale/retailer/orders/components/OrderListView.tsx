import type { TableViewSearchParams } from '@/components/DataCrud/TableView';
import TableView from '@/components/DataCrud/TableView';
import { SalePaths } from '@/pages/sale';
import { formatDateTime, wsRetailerEndPoint } from '@/pages/utils';
import type { Paging } from '@/services/API';
import { simpleRequestActions } from '@/services/model';
import { AimOutlined, EyeOutlined, WarningOutlined } from '@ant-design/icons';
import { ActionType, DrawerForm } from '@ant-design/pro-components';
import { history, useModel } from '@umijs/max';
import {
  Badge,
  Button,
  message,
  notification,
  Radio,
  Row,
  Space,
  Tag,
  Tooltip,
  Typography,
} from 'antd';
import Omit from 'omit.js';
import { useEffect, useRef, useState } from 'react';
import { RetailerPath } from '../..';
import BreadCrumbCom from '../../components/BreadCrumbCom';
import {
  CountOrder,
  GoogleEntity,
  OrderAdvanceParams,
  OrderPayload,
  PurchaseOrderDto,
} from '../data';
// import ActionComponent from './ActionComponent';
import OrderDetailView from './OrderDetailView';

import { join, upperFirst } from 'lodash';
import numeral from 'numeral';
import ReconnectingWebSocket from 'reconnecting-websocket';
import { OrderServiceAPI } from '../services';
import GoogleMapModal from './GoogleMapModal';

interface Props {
  onAdd?: () => void;
  onDetail?: (id: string) => void;
  onEdit?: (id: string) => void;
}

// const Context = React.createContext({ name: 'Default' });

export default ({ onAdd, onDetail }: Props) => {
  const [api, contextHolder] = notification.useNotification();

  const requestActions = simpleRequestActions();
  const services = OrderServiceAPI(requestActions);
  const [advanceSearchParams, setAdvanceSearchParams] = useState<OrderAdvanceParams>({
    status: 'ALL',
  });
  const actionRef = useRef<ActionType>();
  const cacheList = useModel('dataList');
  const { Text } = Typography;

  const [countOrder, setCountOrder] = useState<CountOrder>();

  const [googleModal, setGoogleModal] = useState<GoogleEntity>({
    visible: false,
    id: '',
    lat: -1,
    lng: -1,
    name: '',
    internalName: '',
    phone: '',
  });

  const onRequestHandler = async (params: TableViewSearchParams<OrderAdvanceParams>) => {
    try {
      const result = await Promise.all([
        services.countOrder.query(requestActions),
        services.listOrder(params),
      ]);
      setCountOrder(result[0]);
      return Promise.resolve(
        cacheList.cacheDataList({
          type: 'retailer-order',
          criteria: params,
          data: result[1],
        }) as Paging<PurchaseOrderDto>,
      );
    } catch (error: any) {
      message.error(error.message);
      return Promise.reject();
    }
  };

  const routes = [
    {
      path: SalePaths.retailer,
      label: 'Retailer',
    },
    {
      path: '',
      label: 'Orders',
    },
  ];

  const resetModal = () => {
    setGoogleModal({
      visible: false,
      id: '',
      lat: -1,
      lng: -1,
      internalName: '',
      name: '',
      phone: '',
    });
  };

  // const socket = io('ws://localhost:8003', {
  //   // transports: ['websocket'],
  //   autoConnect: false,
  //   extraHeaders: {},
  // });

  // //{ autoConnect: false }

  // const _refresh = (json: any) => {
  //   console.log('------------------------------- fired order');
  //   if (json['reload'] === true) {
  //     services.countOrder.query(requestActions).then((_countOrder) => {
  //       setCountOrder(_countOrder);
  //       actionRef.current?.reload();
  //     });
  //   }
  // };

  // const _removeListener = () => {
  //   console.log('------------------------------- Remove Listeners');
  //   socket.off('new order');
  //   socket.off('updated order');
  //   socket.disconnect();
  // };

  useEffect(() => {
    (async () => {
      // setCountOrder(await services.countOrder.query(requestActions));
    })();

    const url = `ws://${wsRetailerEndPoint}/order-emitter`;
    let clientWebSocket = new ReconnectingWebSocket(url);
    console.log(`----------------------------- ${url}`);
    clientWebSocket.onopen = () => {
      console.log('----------------------------- onopen');
      clientWebSocket.onmessage = (ev) => {
        const message = ev.data as string;
        if (message.indexOf('@') !== -1) {
          const data = message.split('@')[1];
          const order: OrderPayload = JSON.parse(data);
          if (order.status === 'new') {
            actionRef.current?.reload().then(() => {
              api.info({
                message: `Notification`,
                description: <Text>Purchase Order by {order.customerName}</Text>,
                // description: <Context.Consumer>{({ name }) => `Hello, ${name}!`}</Context.Consumer>,
                placement: 'topRight',
                onClick: () => history.push(`${RetailerPath.orderItem}/detail/${order.orderId}`),
                style: {
                  cursor: 'pointer',
                },
              });
            });
          }
        }
      };
    };

    return () => {};
  }, []);

  //const contextValue = useMemo(() => ({ name: 'New Purchase Order' }), []);

  return (
    <>
      {contextHolder}
      <Row justify="space-between" style={{ marginBottom: 10 }}>
        <BreadCrumbCom separator=">" routes={routes} />
      </Row>
      <TableView<PurchaseOrderDto, { searchValue?: string; advanceSearch: OrderAdvanceParams }>
        hasCriteria={Object.values(Omit(advanceSearchParams, ['status'])).some((v) => v)}
        cache
        displayOnly
        extraFilter={
          <Space size="small">
            <Radio.Group
              value={advanceSearchParams.status}
              onChange={(e) => {
                setAdvanceSearchParams((v) => ({
                  ...v,
                  status: e.target.value,
                }));

                actionRef.current?.reloadAndRest?.();
              }}
            >
              <Radio.Button value="ALL" style={{ borderRadius: 5 }}>
                All
              </Radio.Button>
              <Badge size="small" offset={[-20, 0]} count={countOrder?.pending}>
                <Radio.Button value="pending">Pending</Radio.Button>
              </Badge>
              <Badge size="small" offset={[-20, 0]} count={countOrder?.accepted}>
                <Radio.Button value="accepted">Accepted</Radio.Button>
              </Badge>
              <Badge size="small" offset={[-20, 0]} count={countOrder?.assigned}>
                <Radio.Button value="assigned">Assigned</Radio.Button>
              </Badge>
              <Badge size="small" offset={[-20, 0]} count={countOrder?.acceptDelivered}>
                <Radio.Button value="accept_delivered">Accept Delivery</Radio.Button>
              </Badge>
              <Badge size="small" offset={[-20, 0]} count={countOrder?.ontheway}>
                <Radio.Button value="ontheway">On the way</Radio.Button>
              </Badge>
              <Badge size="small" offset={[-20, 0]} count={0}>
                <Radio.Button value="delivered">Delivered</Radio.Button>
              </Badge>
              <Badge size="small" offset={[-20, 0]} count={countOrder?.rejected}>
                <Radio.Button value="rejected">Delivery Canceled</Radio.Button>
              </Badge>
              <Badge size="small" offset={[-20, 0]} count={0}>
                <Radio.Button value="canceled">Canceled P.O</Radio.Button>
              </Badge>
            </Radio.Group>
          </Space>
        }
        columns={[
          {
            width: 50,
            render: (_, r) => (
              <>
                <DrawerForm
                  trigger={<Button type="link" icon={<EyeOutlined />} />}
                  submitter={false}
                >
                  <OrderDetailView id={r.id} sumDetail={true} />
                </DrawerForm>
              </>
            ),
          },
          {
            width: 147,
            title: 'Invoice No',
            render: (_, r) => {
              return (
                <Button
                  type="link"
                  onClick={() => {
                    onDetail?.(r.id);
                  }}
                >
                  {r.referenceNo}
                </Button>
              );
            },
          },
          {
            title: 'Ordered By',
            render: (_, r) => {
              return (
                <Button
                  type="link"
                  onClick={() => {
                    history.push(`${RetailerPath.customer}/detail/${r.customerId}`);
                  }}
                >
                  {[r.customerFirstName, r.customerLastName].join(' ')}
                </Button>
              );
            },
          },
          {
            title: 'Amount',
            align: 'right',
            render: (_, r) => numeral(r.amount).format('$ #,#.00'),
          },

          {
            title: 'Accepted By',
            hideInTable: advanceSearchParams.status !== 'accepted',
            render: (_, r) => r.createdByHistory,
          },

          {
            title: 'Accepted Date',
            hideInTable: advanceSearchParams.status !== 'accepted',
            render: (_, r) => formatDateTime(r.createdDateHistory),
          },
          {
            title:
              advanceSearchParams.status === 'ontheway'
                ? 'Delivery By'
                : advanceSearchParams.status === 'delivered'
                ? 'Delivered By'
                : advanceSearchParams.status === 'accept_delivered'
                ? 'Accept By'
                : 'Assinged To',
            hideInTable:
              [
                'delivered',
                'assigned',
                'accept_delivered',
                'ontheway',
                'canceled',
                'rejected',
              ].indexOf(advanceSearchParams.status ?? '') === -1,
            render: (_, r) =>
              r.referencePhone
                ? join([r.referenceCode, r.referencePhone], ' - ')
                : r.referenceCode ?? '',

            // r.deliveryReferencePhone
            //   ? join([r.deliveryReferenceCode, r.deliveryReferencePhone], ' - ')
            //   : r.deliveryReferenceCode,
            // : r.delivery?.referencePhone
            // ? join([r.delivery?.referenceCode, r.delivery?.referencePhone], ' - ')
            // : r.delivery?.referenceCode,
          },
          {
            title: 'Status',
            dataIndex: 'orderedStatus',
            render: (_, r) => {
              return (
                <Row>
                  <Tag
                    color={
                      ['rejected', 'canceled'].indexOf(r.orderedStatus.toLocaleLowerCase()) === -1
                        ? r.orderedStatus !== 'pending'
                          ? 'blue'
                          : 'warning'
                        : 'red'
                    }
                  >
                    {r.orderedStatus === 'ontheway'
                      ? 'On the way'
                      : r.orderedStatus === 'reassigned'
                      ? 'Accepted'
                      : r.orderedStatus === 'accept_delivered'
                      ? 'Accept Delivery'
                      : r.orderedStatus === 'rejected'
                      ? 'Delivery Canceled'
                      : r.orderedStatus === 'canceled'
                      ? 'Canceled P.O'
                      : upperFirst(r.orderedStatus)}
                  </Tag>
                  {r.orderedStatus === 'reassigned' && r.storeType ? (
                    <Tooltip placement="topRight" title={`Canceled by ${upperFirst(r.storeType)}`}>
                      <WarningOutlined style={{ color: 'magenta' }} />
                    </Tooltip>
                  ) : undefined}

                  {/* {r.orderedStatus === 'reassigned' && r.delivery ? (
                    <Tooltip
                      placement="topRight"
                      title={`Canceled by ${upperFirst(r.delivery.storeType)}`}
                    >
                      <WarningOutlined style={{ color: 'magenta' }} />
                    </Tooltip>
                  ) : undefined} */}
                </Row>
              );
            },
          },
          // {
          //   title: 'Ship To Name',
          //   render: (_, r) => {
          //     if (r.shippingTo.lastName) {
          //       return [r.shippingTo.firstName, r.shippingTo.lastName].join(' ');
          //     }
          //     return r.shippingTo.firstName;
          //   },
          // },
          {
            title: 'Ship To Phone',
            render: (_, r) => r.contactPhone,
          },
          {
            title: 'Ship To Address',
            hideInTable: ['ALL', 'pending'].indexOf(advanceSearchParams.status ?? '') === -1,
            render: (_, r) => {
              return (
                <Button
                  type="link"
                  onClick={() =>
                    setGoogleModal({
                      visible: true,
                      id: r.id,
                      lat: r.contactLatitude ?? -1,
                      lng: r.contactLongitude ?? -1,
                      name: join([r.customerFirstName, r.customerLastName], ' - '),
                      internalName: `Contact Name: ${r.contactName}`,
                      phone: `Contact Phone: ${r.contactPhone}`,
                    })
                  }
                >
                  <Space>
                    <AimOutlined />
                    <Text>{r.contactAddress}</Text>
                  </Space>
                </Button>
              );
            },
          },
          {
            title: 'Payment Status',
            hideInTable:
              ['ALL', 'pending', 'delivered'].indexOf(advanceSearchParams.status ?? '') === -1,
            render: (_, r) => (
              <Tag color={r.paymentStatus === 'Unpaid' ? 'magenta' : 'cyan'}>{r.paymentStatus}</Tag>
            ),
          },
          {
            title: 'Payment Method',
            hideInTable:
              ['ALL', 'pending', 'delivered', 'ontheway'].indexOf(
                advanceSearchParams.status ?? '',
              ) === -1,
            render: (_, r) => <Tag color="lime">{r.paymentMethod}</Tag>,
          },
          {
            title: 'Canceled By',
            hideInTable: advanceSearchParams.status !== 'canceled',
            render: (_, r) => r.createdByHistory,
          },
          {
            title: 'Canceled Date',
            hideInTable: advanceSearchParams.status !== 'canceled',
            render: (_, r) => formatDateTime(r.createdDateHistory),
          },
          {
            title: 'Reason',
            hideInTable: advanceSearchParams.status !== 'canceled',
            render: (_, r) => r.remarkHistory?.split(': ')[1],
          },
          {
            title: 'Order Date',
            hideInTable: advanceSearchParams.status === 'canceled',
            render: (_, r) => formatDateTime(r.orderedDate),
            // (
            //   <Space>
            //     <p>{moment(r.orderedDate).fromNow()}</p>
            //   </Space>
            // ),
          },
        ]}
        // advanceSearch
        actionHandlers={{
          onAdd: onAdd,
          onRequest: (criteria, pagination, sort) =>
            onRequestHandler({
              criteria: {
                ...criteria,
                advanceSearch: advanceSearchParams,
                sort,
              },
              pagination,
            }),
          onFirstLoad: () =>
            cacheList.fetchDataList('sale-order').then((v) => {
              if (v) {
                setAdvanceSearchParams({
                  ...v.creteria?.criteria,
                  status: v.creteria?.criteria?.advanceSearch?.status ?? 'ALL',
                });
                return v.dataList;
              } else {
                return onRequestHandler({
                  criteria: {
                    advanceSearch: advanceSearchParams,
                  },
                });
              }
            }) as Promise<Paging<PurchaseOrderDto>>,
        }}
        tableProps={{
          actionRef: actionRef,
        }}
      />
      <GoogleMapModal
        open={googleModal.visible}
        onCancel={resetModal}
        onSubmit={resetModal}
        centerPoint={{ ...googleModal }}
      />
    </>
  );
};
