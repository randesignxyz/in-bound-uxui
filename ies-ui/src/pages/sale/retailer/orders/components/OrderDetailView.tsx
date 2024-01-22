import { SalePaths } from '@/pages/sale';
import { formatDateTime, retailerEndPoint, wsRetailerEndPoint } from '@/pages/utils';
import { simpleRequestActions } from '@/services/model';

import {
  ArrowRightOutlined,
  CheckCircleOutlined,
  CopyOutlined,
  DeleteOutlined,
  EditOutlined,
  SendOutlined,
  ShareAltOutlined,
  StopOutlined,
  WarningOutlined,
} from '@ant-design/icons';
import {
  ActionType,
  ModalForm,
  ProDescriptions,
  ProFormText,
  ProTable,
} from '@ant-design/pro-components';
import {
  Button,
  Card,
  Dropdown,
  Empty,
  MenuProps,
  message,
  Modal,
  Row,
  Space,
  Spin,
  Table,
  Tag,
  Timeline,
  Tooltip,
  Typography,
} from 'antd';
import { useForm } from 'antd/lib/form/Form';
import { countBy, includes, uniqueId, upperFirst } from 'lodash';
import { useCallback, useEffect, useRef, useState } from 'react';
import BreadCrumbCom from '../../components/BreadCrumbCom';

import ReconnectingWebSocket from 'reconnecting-websocket';

import type { OrderDto, OrderItems, OrderPayload, OrderStatusHistoryCreate } from '../data';

import Col from 'antd/lib/grid/col';
import numeral from 'numeral';
import RemarkFormModal from '../../components/RemarkFormModal';
import { OrderServiceAPI } from '../services';
import AssignStoreModal from './AssignStoreModal';

interface Props {
  onAdd?: () => void;
  id: string;
  sumDetail?: boolean;
}

export default ({ id, sumDetail = true }: Props) => {
  const requestActions = simpleRequestActions();
  const services = OrderServiceAPI(requestActions);
  const [invoice, setInvoice] = useState<OrderDto>();

  const [rejectForm] = useForm<OrderStatusHistoryCreate>();
  const [commentModal, setCommentModal] = useState<{ visible: boolean; id?: string; flag: string }>(
    {
      visible: false,
      flag: 'order_item',
    },
  );

  const [assignModal, setAssignModal] = useState<{
    visible: boolean;
    selectedId?: string;
    selectedType?: string;
    referenceCode?: string;
    referencePhone?: string;
    comment?: string;
  }>({
    visible: false,
    selectedId: undefined,
    selectedType: undefined,
    referencePhone: undefined,
    referenceCode: undefined,
    comment: undefined,
  });

  // const retailerEndPoint =
  //   window.location.hostname.includes('ies.vital.com.kh') ||
  //   window.location.hostname.includes('10.0.8.215')
  //     ? 'https://retailer.ofl.a2hosted.com'
  //     : 'http://localhost:8002';

  // const retailerEndPoint = 'https://retailer.ofl.a2hosted.com';

  const { CopyToClipboard } = require('react-copy-to-clipboard');
  const { Text } = Typography;

  //const socket = io(`${retailerWebSocketEndPoint}`, { autoConnect: false });

  // const initialIO = useCallback(() => {
  //   socket.connect();
  // }, []);

  const initdata = useCallback(async () => {
    setInvoice(await services.detailOrder(id));
  }, []);
  useEffect(() => {
    initdata();
    // initialIO();

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
          if (order.status === 'update') {
            initdata();
          }
        }
      };
    };

    return () => {
      // socket.disconnect();
    };
  }, []);

  const actionRef = useRef<ActionType>();
  const routes = [
    {
      path: SalePaths.retailer,
      label: 'Retailer',
    },
    {
      path: SalePaths.order,
      label: 'Order',
    },
    {
      path: '',
      label: 'Detail',
    },
  ];

  const items: MenuProps['items'] = [
    {
      key: '1',
      label: (
        <Button
          type="link"
          icon={<SendOutlined />}
          onClick={() => {
            if (invoice)
              window.open(
                `https://t.me/share/url?url=${retailerEndPoint}/orders?p=${invoice.id}&q=${invoice.delivery?.id}`,
              );
          }}
        >
          Telegram
        </Button>
      ),
    },
    {
      key: '2',
      label: (
        <CopyToClipboard
          onCopy={() => message.info('Copied link')}
          text={
            invoice
              ? `${retailerEndPoint}/orders?p=${invoice.id}&q=${invoice.delivery?.id}`
              : undefined
          }
        >
          <Button type="link" icon={<CopyOutlined />} color="black">
            Copy Link
          </Button>
        </CopyToClipboard>
      ),
    },
  ];

  const isAllowDeleted = () => {
    const data = countBy(invoice?.items, 'status');
    return data['active'] > 1;
  };

  const isDeletedItem = (id: string) => {
    return invoice?.tracking.find((it) => it.entityId == id) !== undefined;
  };

  return (
    <>
      <Spin spinning={requestActions.request?.loading}>
        <Row justify="space-between">
          {!sumDetail && <BreadCrumbCom separator=">" routes={routes} />}
          <Space style={{ float: 'right' }}>
            {/* 'ontheway', */}
            {invoice && !includes(['canceled', 'delivered'], invoice?.orderedStatus) ? (
              <ModalForm
                width={400}
                trigger={
                  <Button type="default" danger={true} icon={<StopOutlined />}>
                    Cancel P.O
                  </Button>
                }
                form={rejectForm}
                onFinish={async () => {
                  const entry = {
                    id: id,
                    status: 'canceled',
                    remark: rejectForm.getFieldValue('remark'),
                  };
                  await services.updateStatus(entry);
                  message.success('Purchase Order was canceled.');
                  await initdata();
                  actionRef.current?.reloadAndRest?.();
                }}
              >
                <ProFormText
                  rules={[{ required: true }]}
                  label="Remark"
                  placeholder={'remark'}
                  name="remark"
                />
              </ModalForm>
            ) : undefined}
            {invoice?.orderedStatus === 'pending' ? (
              <>
                <Button
                  type="primary"
                  title="Approve"
                  onClick={() => {
                    Modal.confirm({
                      title: 'Are you Sure?',
                      content: 'Accept Order',
                      onOk: async () => {
                        const entry = {
                          id: id,
                          status: 'accepted',
                        };
                        await services.updateStatus(entry);
                        await initdata();
                        actionRef.current?.reloadAndRest?.();
                      },
                    });
                  }}
                >
                  Accept
                </Button>
              </>
            ) : includes(['accepted', 'rejected'], invoice?.orderedStatus) ? (
              <>
                <Button
                  type="default"
                  title={invoice?.orderedStatus === 'accepted' ? 'Assign' : 'Re-Assign Store'}
                  onClick={async () => {
                    // onHandleSearchCRM();
                    // setSate((v) => ({
                    //   ...v,
                    //   visible: { name: 'modal', type: 'ADD' },
                    // }));

                    if (invoice?.orderedStatus === 'rejected' && invoice.delivery) {
                      setAssignModal({
                        visible: true,
                        selectedId: invoice.delivery.id,
                        selectedType: invoice.delivery.storeType,
                        referenceCode: invoice.delivery.referenceCode,
                        referencePhone: invoice.delivery.referencePhone,
                        comment: invoice.delivery.comment,
                      });
                    } else {
                      setAssignModal({
                        visible: true,
                        selectedId: undefined,
                        selectedType: undefined,
                        referenceCode: undefined,
                        referencePhone: undefined,
                        comment: undefined,
                      });
                    }
                  }}
                >
                  {invoice?.orderedStatus === 'accepted' ? 'Assign' : 'Re-Assign Store'}
                </Button>
              </>
            ) : (
              ''
            )}
            {includes(['accept_delivered', 'ontheway', 'rejected'], invoice?.orderedStatus) && (
              <ModalForm
                width={400}
                trigger={
                  <Button type="primary" title="Complete Delivery" icon={<CheckCircleOutlined />}>
                    Complete Delivery
                  </Button>
                }
                form={rejectForm}
                onFinish={async () => {
                  const entry = {
                    id: id,
                    status: 'delivered',
                    remark: rejectForm.getFieldValue('remark'),
                  };
                  await services.updateStatus(entry);
                  message.success('Order is deliverd.');
                  await initdata();
                  actionRef.current?.reloadAndRest?.();
                }}
              >
                <ProFormText
                  rules={[{ required: true }]}
                  label="Remark"
                  placeholder={'remark'}
                  name="remark"
                />
              </ModalForm>
            )}

            {invoice?.orderedStatus === 'assigned' && (
              <>
                <Dropdown menu={{ items }} placement="bottomRight" arrow>
                  <Button icon={<ShareAltOutlined />} type="primary">
                    Share To
                  </Button>
                </Dropdown>
              </>
            )}
          </Space>
        </Row>

        <Card style={{ marginTop: 10 }} size="small" title={<Text>Order Detail</Text>}>
          <ProDescriptions
            size="small"
            dataSource={invoice}
            key="general-info"
            //contentStyle={{ fontWeight: 'bold' }}
            columns={[
              {
                title: 'Invoice No',
                dataIndex: 'referenceNo',
                key: 'referenceNo',
              },
              {
                title: 'Order Date',
                key: 'orderDate',
                valueType: 'dateTime',
                dataIndex: 'orderedDate',
              },
              {
                title: 'Status',
                key: 'status',
                render: (_, r) => {
                  return (
                    <Row>
                      <Tag
                        color={
                          r.orderedStatus !== 'canceled' && r.orderedStatus !== 'rejected'
                            ? r.orderedStatus !== 'pending'
                              ? 'blue'
                              : 'warning'
                            : 'red'
                        }
                      >
                        {r.orderedStatus === 'ontheway'
                          ? 'On the way'
                          : r.orderedStatus === 'accept_delivered'
                            ? 'Accept Delivery'
                            : r.orderedStatus === 'rejected'
                              ? 'Delivery Canceled'
                              : r.orderedStatus === 'canceled'
                                ? 'Canceled P.O'
                                : upperFirst(r.orderedStatus)}
                      </Tag>
                      {/* {r.orderedStatus === 'canceled' && (
                        <Tooltip placement="top" title={`Canceled by ${r.delivery?.storeType}`}>
                          <WarningOutlined style={{ color: 'magenta' }} />
                        </Tooltip>
                      )} */}
                    </Row>
                  );
                },
              },
              {
                title: 'Customer Name',
                key: 'customerName',
                render: (_, r) => {
                  return r.customerFullName;
                },
              },
              {
                title: 'Payment Method',
                render: (_, r) => <Tag color="lime">{r.paymentMethod}</Tag>,
              },
              {
                title: 'Payment Type',
                render: (_, r) => (
                  <Tag color={r.paymentStatus === 'Unpaid' ? 'magenta' : 'cyan'}>
                    {r.paymentStatus}
                  </Tag>
                ),
              },
              {
                title: 'Total Amount',
                render: (_, r) => numeral(r.amount + r.vatAmount - r.discount).format('$ #,#.00'),
              },

              {
                title: 'Remark',
                key: 'remark',
                render: (_, r) => {
                  return (
                    <Text
                      type={
                        r.orderedStatus === 'canceled'
                          ? 'danger'
                          : r.orderedStatus === 'delivered'
                            ? 'success'
                            : 'secondary'
                      }
                    >
                      {r.remark}
                    </Text>
                  );
                },
                //dataIndex: 'remark',
              },
            ]}
          />
        </Card>
        <Card size="small" style={{ marginTop: 10 }} title={<Text>Shipping Address</Text>}>
          <ProDescriptions
            size="small"
            dataSource={invoice}
            key="shipping-address"
            //contentStyle={{ fontWeight: 'bold' }}
            column={2}
            columns={[
              {
                title: 'Contact Name',
                key: 'contactName',
                render: (_, r) => {
                  return r.contactName;
                },
              },
              {
                title: 'Contact Phone Number',
                key: 'contactPhone',
                render: (_, r) => {
                  return r.contactPhone;
                },
              },
              {
                title: 'Address',
                key: 'shippingTo.address',
                render: (_, r) => {
                  return r.contactAddress;
                },
              },
            ]}
          />
          {/* <Row gutter={50}>
            <Col flex="500px">
              <ProFormTextArea
                readonly
                help={<span />}
                label="Ship to Address"
                disabled={true}
                name="address"
              />
            </Col>
            <Col flex="Auto" />
          </Row> */}
        </Card>
        {invoice?.delivery && (
          <Card
            title={
              <Space>
                <Text>Delivery Detail</Text>

                {invoice?.orderedStatus === 'rejected' && (
                  <Tooltip placement="top" title={`Canceled by ${invoice?.delivery?.storeType}`}>
                    <WarningOutlined style={{ color: 'magenta' }} />
                  </Tooltip>
                )}
              </Space>
            }
            size="small"
            style={{ marginTop: 10 }}
            extra={
              invoice.orderedStatus === 'assigned' && (
                <Space>
                  <Button
                    type="text"
                    icon={<DeleteOutlined />}
                    danger={true}
                    onClick={() => {
                      setCommentModal({
                        visible: true,
                        id: invoice.delivery?.id,
                        flag: 'delivery',
                      });
                    }}
                  >
                    Remove
                  </Button>
                  <Button
                    type="link"
                    icon={<EditOutlined />}
                    onClick={() => {
                      setAssignModal({
                        visible: true,
                        selectedId: invoice.delivery?.id,
                        selectedType: invoice.delivery?.storeType,
                        referenceCode: invoice.delivery?.referenceCode,
                        referencePhone: invoice.delivery?.referencePhone,
                        comment: invoice.delivery?.comment,
                      });
                    }}
                  >
                    Edit
                  </Button>
                </Space>
              )
            }
          >
            <ProDescriptions
              size="small"
              dataSource={invoice?.delivery}
              // labelStyle={{ columns: 2 }}
              key="delivery-info"
              column={2}
              columns={[
                {
                  title: 'Delivery Responsible',
                  //dataIndex: 'storeType',
                  key: 'storeType',
                  render: (_, r) => {
                    return r.storeType === 'mpu' ? 'MPU' : upperFirst(r.storeType);
                  },
                },
                {
                  title: 'Response by',
                  key: 'referencePhone',
                  render: (_, r) => {
                    return [r.referenceCode, r.referencePhone].join(' - ');
                  },
                },
                // {
                //   title: 'Comment',
                //   key: 'r.comment',
                //   render: (_, r) => {
                //     return r.comment;
                //   },
                // },
              ]}
            />
            {invoice.orderedStatus === 'rejected' && (
              <ProDescriptions
                column={2}
                request={async () => {
                  return Promise.resolve({
                    success: true,
                    data: {
                      info: {
                        date: formatDateTime(
                          invoice.orderStatusHistory?.at(invoice.orderStatusHistory.length - 1)
                            ?.createdDate,
                        ),
                        comment: invoice.orderStatusHistory
                          ?.at(invoice.orderStatusHistory.length - 1)
                          ?.remark?.split(': ')[1],
                      },
                    },
                  });
                }}
              >
                <ProDescriptions.Item
                  dataIndex={['info', 'date']}
                  label="Canceled on"
                  contentStyle={{ color: 'red' }}
                />
                <ProDescriptions.Item
                  dataIndex={['info', 'comment']}
                  label="Remark"
                  contentStyle={{ color: 'red' }}
                />
              </ProDescriptions>

              // <Text style={{ color: 'red' }}>
              //   Canceled on &nbsp;
              //   {formatDateTime(
              //     invoice.orderStatusHistory?.at(invoice.orderStatusHistory.length - 1)
              //       ?.createdDate,
              //   )}
              // </Text>
            )}
          </Card>
        )}

        {/* <Card size="small" style={{ marginTop: 10 }}>
          <Tabs
            defaultActiveKey="1"
            items={[
              {
                key: 'tab-product-items',
                label: `Items`,
                children: (
                  
                ),
              },
              {
                key: 'tab-ctivity',
                label: `Activity`,
                children: (
                  
                ),
              },
            ]}
          />
        </Card> */}

        <Card size="small" style={{ marginTop: 10 }}>
          <Row gutter={4}>
            <Col span={16}>
              <Card
                size="small"
                title="Items"
                style={{ marginLeft: 0, marginRight: 8.0, padding: 0 }}
              >
                <ProTable<OrderItems>
                  style={{ margin: 0, padding: 0 }}
                  size="small"
                  search={false}
                  options={false}
                  key="table-items"
                  pagination={false}
                  dataSource={invoice?.items?.sort((a, b) => (a.sequence > b.sequence ? 1 : -1))}
                  columns={[
                    {
                      title: 'No',
                      // dataIndex: 'index',
                      valueType: 'index',
                      render(_, r, index) {
                        const isdeleted = isDeletedItem(r.id);
                        return (
                          <>
                            {isdeleted ? (
                              <Text type="danger" delete>
                                {index + 1}
                              </Text>
                            ) : (
                              <Text>{index + 1}</Text>
                            )}
                          </>
                        );
                      },
                      width: 80,
                    },
                    {
                      title: 'Code',
                      // dataIndex: 'productCode',
                      render: (_, r) => {
                        const isdeleted = isDeletedItem(r.id);
                        return (
                          <>
                            {isdeleted ? (
                              <Text type="danger" delete>
                                {r.productCode}
                              </Text>
                            ) : (
                              <Text>{r.productCode}</Text>
                            )}
                          </>
                        );
                      },
                    },
                    {
                      title: 'Name',
                      // dataIndex: 'productName',
                      render: (_, r) => {
                        const isdeleted = isDeletedItem(r.id);
                        return (
                          <>
                            {isdeleted ? (
                              <Text type="danger" delete>
                                {r.productName}
                              </Text>
                            ) : (
                              <Text>{r.productName}</Text>
                            )}
                          </>
                        );
                      },
                    },
                    {
                      title: 'Quantity',
                      // dataIndex: 'quantity',
                      align: 'right',
                      render: (_, r) => {
                        const isdeleted = isDeletedItem(r.id);
                        return (
                          <>
                            {isdeleted ? (
                              <Text type="danger" delete>
                                {r.quantity}
                              </Text>
                            ) : (
                              <Text>{r.quantity}</Text>
                            )}
                          </>
                        );
                      },
                    },
                    {
                      title: 'Unit Price',
                      align: 'right',
                      render: (_, r) => {
                        const isdeleted = isDeletedItem(r.id);
                        const unitPrice = numeral(r.unitPrice).format('$ #,#.00');
                        return (
                          <>
                            {isdeleted ? (
                              <Text type="danger" delete>
                                {unitPrice}
                              </Text>
                            ) : (
                              <Text>{unitPrice}</Text>
                            )}
                          </>
                        );
                      },
                    },
                    {
                      title: 'Discount',
                      align: 'right',
                      render: (_, r) => {
                        const discount = numeral(r.discount).format('$ #,#.00');

                        const isdeleted = isDeletedItem(r.id);
                        return (
                          <>
                            {isdeleted ? (
                              <Text type="danger" delete>
                                {discount}
                              </Text>
                            ) : (
                              <Text>{discount}</Text>
                            )}
                          </>
                        );
                      },
                    },
                    {
                      title: 'Amount',
                      align: 'right',
                      render: (_, r) => {
                        const amount = numeral(r.amount).format('$ #,#.00');
                        const isdeleted = isDeletedItem(r.id);
                        return (
                          <>
                            {isdeleted ? (
                              <Text type="danger" delete>
                                {amount}
                              </Text>
                            ) : (
                              <Text>{amount}</Text>
                            )}
                          </>
                        );
                      },
                    },
                    {
                      title: '',
                      align: 'right',
                      hideInTable: isAllowDeleted() === false,
                      render: (_, r) => {
                        console.log(r);
                        return (
                          <Button
                            size="small"
                            type="link"
                            style={{ color: 'red' }}
                            icon={<DeleteOutlined />}
                            onClick={() => {
                              setCommentModal({ visible: true, id: r.id, flag: 'order_item' });
                            }}
                          />
                        );
                      },
                    },
                  ]}
                  summary={() => {
                    return (
                      <>
                        <Table.Summary.Row>
                          <Table.Summary.Cell index={0} align="right" colSpan={6}>
                            <Text>Amount</Text>
                          </Table.Summary.Cell>
                          <Table.Summary.Cell
                            index={0}
                            align="right"
                            colSpan={isAllowDeleted() ? 2 : 1}
                          >
                            <Text>{numeral(invoice?.amount || 0).format('$ #,#.00')}</Text>
                          </Table.Summary.Cell>
                        </Table.Summary.Row>
                        <Table.Summary.Row>
                          <Table.Summary.Cell index={0} align="right" colSpan={6}>
                            <Text type="danger">Discount</Text>
                          </Table.Summary.Cell>
                          <Table.Summary.Cell
                            index={isAllowDeleted() ? 0 : 1}
                            align="right"
                            colSpan={isAllowDeleted() ? 2 : 1}
                          >
                            <Text type="danger">
                              {numeral(invoice?.discount || 0).format('$ #,#.00')}
                            </Text>
                          </Table.Summary.Cell>
                        </Table.Summary.Row>

                        <Table.Summary.Row>
                          <Table.Summary.Cell
                            index={isAllowDeleted() ? 0 : 1}
                            align="right"
                            colSpan={6}
                          >
                            <Text>VAT Amount</Text>
                          </Table.Summary.Cell>
                          <Table.Summary.Cell
                            index={isAllowDeleted() ? 0 : 1}
                            align="right"
                            colSpan={isAllowDeleted() ? 2 : 1}
                          >
                            <Text>{numeral(invoice?.vatAmount || 0).format('$ #,#.00')}</Text>
                          </Table.Summary.Cell>
                        </Table.Summary.Row>
                        <Table.Summary.Row>
                          <Table.Summary.Cell
                            index={isAllowDeleted() ? 0 : 1}
                            align="right"
                            colSpan={6}
                          >
                            <Text type="success">Total Amount</Text>
                          </Table.Summary.Cell>
                          <Table.Summary.Cell
                            index={isAllowDeleted() ? 0 : 1}
                            align="right"
                            colSpan={isAllowDeleted() ? 2 : 1}
                          >
                            <Text type="success">
                              {numeral(
                                (invoice?.totalAmount || 0) +
                                (invoice?.vatAmount || 0) -
                                (invoice?.discount || 0),
                              ).format('$ #,#.00')}
                            </Text>
                            {/* <Table.Summary.Cell index={2} align="right" /> */}
                          </Table.Summary.Cell>
                        </Table.Summary.Row>
                      </>
                    );
                  }}
                />
              </Card>
            </Col>
            <Col span={8}>
              <Card size="small" title="Activity">
                {invoice !== undefined &&
                  invoice.orderStatusHistory !== undefined &&
                  invoice.orderStatusHistory.length > 0 ? (
                  <Timeline
                    style={{ marginTop: 10, marginLeft: 10 }}
                    key="activity"
                    items={invoice.orderStatusHistory.map((it, index) => ({
                      children: (
                        <>
                          <span>
                            <Tag
                              key={`previous-${index}`}
                              color={
                                it.previousStatus !== 'rejected'
                                  ? it.previousStatus !== 'pendding'
                                    ? 'blue'
                                    : 'green'
                                  : 'red'
                              }
                            >
                              {it.previousStatus === 'ontheway'
                                ? 'On the way'
                                : it.previousStatus === 'accept_delivered'
                                  ? 'Accept Delivery'
                                  : it.previousStatus === 'rejected'
                                    ? 'Delivery Canceled'
                                    : it.previousStatus === 'canceled'
                                      ? 'Canceled P.O'
                                      : upperFirst(it.previousStatus)}
                            </Tag>
                            <ArrowRightOutlined
                              key={`arror ${index}`}
                              style={{ marginRight: 10 }}
                            />
                            <Tag
                              key={`current-${index}`}
                              color={
                                it.currentStatus !== 'rejected'
                                  ? it.currentStatus !== 'pendding'
                                    ? 'blue'
                                    : 'green'
                                  : 'red'
                              }
                            >
                              {it.currentStatus === 'ontheway'
                                ? 'On the way'
                                : it.currentStatus === 'accept_delivered'
                                  ? 'Accept Delivery'
                                  : it.currentStatus === 'rejected'
                                    ? 'Delivery Canceled'
                                    : it.currentStatus === 'canceled'
                                      ? 'Canceled P.O'
                                      : upperFirst(it.currentStatus)}
                            </Tag>
                            <span style={{ marginLeft: 5, marginRight: 10 }}>
                              by {it.createdBy}
                            </span>
                            <span>{formatDateTime(it.createdDate)}</span>
                          </span>
                          <br />

                          {it.remark && (
                            <div style={{ marginRight: 20, color: 'gray' }}>{it.remark}</div>
                          )}
                        </>
                      ),
                    }))}
                  />
                ) : (
                  <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} />
                )}
              </Card>
            </Col>
          </Row>
        </Card>
      </Spin>

      <AssignStoreModal
        title={assignModal.selectedId ? 'Edit Assign Store' : 'Assign Store'}
        open={assignModal.visible}
        onCancel={() =>
          setAssignModal({
            visible: false,
            selectedId: undefined,
            selectedType: undefined,
            referenceCode: undefined,
            referencePhone: undefined,
            comment: undefined,
          })
        }
        centerPoint={{
          id: invoice?.id ?? uniqueId(),
          lat: invoice?.contactLatitude ?? 0,
          lng: invoice?.contactLongitude ?? 0,
          name: invoice?.customerFullName ?? '',
          internalName: invoice?.contactName ?? '',
          phone: invoice?.contactPhone ?? invoice?.customerPhone ?? '',
        }}
        purchaseOrderId={id}
        deliveryId={assignModal.selectedId}
        referenceCode={assignModal.referenceCode}
        comment={assignModal.comment}
        stroeType={assignModal.selectedType}
        callback={async () => {
          await initdata();
          actionRef.current?.reloadAndRest?.();
        }}
      />
      <RemarkFormModal
        title={commentModal.flag === 'delivery' ? 'Remove Delivery' : 'Remove Item'}
        open={commentModal.visible}
        onCancel={() => {
          setCommentModal({ visible: false, id: undefined, flag: commentModal.flag });
        }}
        onSave={async (objectId, remark) => {
          const response =
            commentModal.flag === 'delivery'
              ? await services.deleteOrderDelivery({
                id: objectId,
                orderId: id,
                status: 'accepted',
                remark: remark,
              })
              : await services.deleteOrderItem({
                orderId: id,
                orderItemId: objectId,
                reason: remark,
              });

          await initdata();
          actionRef.current?.reloadAndRest?.();
          setCommentModal({ visible: false, id: undefined, flag: commentModal.flag });
          message.info(response.message);
        }}
        id={commentModal.id ?? ''}
      />
    </>
  );
};
