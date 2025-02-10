import ImagePreview from '@/components/ImagePreview';
import { displayDateTime } from '@/pages/utils';
import { simpleRequestActions } from '@/services/model';
import { CheckCircleOutlined, CloseCircleOutlined, SyncOutlined } from '@ant-design/icons';
import { ActionType, ProDescriptions, ProTable } from '@ant-design/pro-components';
import {
  Button,
  Card,
  Collapse,
  Flex,
  Modal,
  Space,
  Spin,
  Table,
  Tag,
  Typography,
  message,
} from 'antd';
import { max } from 'lodash';
import numeral from 'numeral';
import { useEffect, useRef, useState } from 'react';
import RemarkModalForm from '../../component/RemarkModal';
import { SettlementMethodDetailDTO } from './data';
import { SettlementMethodServicAPI } from './service';

const { Text } = Typography;
interface Props {
  id?: number;
}

const SettlementMethodDetail: React.FC<Props> = ({ id }) => {
  const requestActions = simpleRequestActions();
  const [dataSource, setDataSource] = useState<SettlementMethodDetailDTO>();
  const actionRef = useRef<ActionType>();
  const services = SettlementMethodServicAPI(requestActions);
  // const [po, setPo] = useState<PurchaseOrderDTO>();
  const [actionState, setActionState] = useState<{
    visible?: {
      open: true;
      status: 'Completed' | 'Pending' | 'Rejected';
      carryData?: SettlementMethodDetailDTO;
    };
  }>();
  const loadData = async () => {
    setDataSource(await services.detail(id));
  };
  useEffect(() => {
    if (id) {
      loadData();
    }
  }, [id]);
  return (
    <Spin spinning={requestActions.request?.loading}>
      <Flex vertical gap={16}>
        <Card
          size="small"
          title={'General Infomation'}
          extra={[
            dataSource?.status === 'Pending' && (
              <Button
                type="link"
                icon={<CheckCircleOutlined />}
                onClick={() => {
                  Modal.confirm({
                    title: 'Confirm Message',
                    content: (
                      <Space direction="vertical">
                        <Typography.Text>
                          This is a message inform warning; be careful before clicking OK.
                        </Typography.Text>
                        <Typography.Text type="warning">
                          You really want to confirm the request?
                        </Typography.Text>
                      </Space>
                    ),
                    onOk: async () => {
                      services
                        .confirm({
                          id: dataSource.id,
                        })
                        .then(() => {
                          actionRef.current?.reload?.();
                          loadData?.();
                          message.success('Your confirmation request was a success!');
                        });
                    },
                  });
                }}
              >
                Confirm
              </Button>
            ),
            dataSource?.status === 'Pending' && (
              <Button
                type="link"
                danger
                icon={<CloseCircleOutlined />}
                onClick={() => {
                  setActionState({
                    visible: { open: true, status: 'Rejected', carryData: dataSource },
                  });
                }}
              >
                Reject
              </Button>
            ),
          ]}
        >
          <ProDescriptions
            dataSource={dataSource}
            actionRef={actionRef}
            loading={requestActions.request?.loading}
            columns={[
              {
                title: 'Salesperson',
                render: (_, r) =>
                  [r?.salespersonCode, r?.salespersonName].filter((p) => p).join('-'),
              },
              {
                title: 'Cashier Name',
                dataIndex: 'cashierName',
              },
              {
                title: 'Satus',
                render: (_, r) => (
                  <Tag
                    bordered={false}
                    icon={
                      r.status === 'Pending' ? (
                        <SyncOutlined spin />
                      ) : r.status === 'Completed' ? (
                        <CheckCircleOutlined />
                      ) : (
                        <CloseCircleOutlined />
                      )
                    }
                    color={
                      r.status === 'Pending'
                        ? 'processing'
                        : r.status === 'Completed'
                        ? 'success'
                        : 'error'
                    }
                  >
                    {r.status}
                  </Tag>
                ),
              },
              {
                title: 'Amount (USD)',
                dataIndex: 'amount',
                valueType: 'money',
                render: (_, r) => (
                  <Text type="success">{`$ ${numeral(r.amount).format('0,000.000')}`}</Text>
                ),
              },
              {
                title: 'Amount (KHR)',
                dataIndex: 'amountKH',
                render: (_, r) => (
                  <Text type="success">{`${
                    r.amountKH > 0 ? numeral(r.amountKH).format('0,000') : '-'
                  } ៛`}</Text>
                ),
              },
              {
                title: 'Remark',
                dataIndex: 'remark',
              },
            ]}
          />
        </Card>
        {dataSource?.purchaseOrder?.map((p) => {
          const totalItem = p.items?.reduce((p, c) => p + c.quantity, 0);
          const totalAmount = p.items?.reduce((p, c) => p + c.quantity * c.pricing, 0);
          return (
            <Card size="small">
              <Collapse
                size="small"
                ghost
                items={[
                  {
                    key: 's',
                    label: (
                      <ProDescriptions
                        dataSource={p}
                        contentStyle={{ fontWeight: 500 }}
                        size="small"
                        column={{ xs: 1, sm: 2, md: 3, lg: 5, xl: 5, xxl: 5 }}
                        columns={[
                          {
                            title: 'Distributor Name',
                            dataIndex: 'distributorCode',
                            //span: 2,
                            render: (_, r) =>
                              [r.distributorCode, r.distributorName].filter((po) => po).join(' - '),
                          },
                          { title: 'P.O Number', dataIndex: 'purchaseOrderCode' },
                          {
                            title: 'Date',
                            // dataIndex: 'purchaseOrderDate',
                            // valueType: 'date',
                            render: (_, r) => {
                              return displayDateTime(r.purchaseOrderDate);
                            },
                          },
                          {
                            title: 'Request Quantity',
                            render: (_, r) => (
                              <Typography.Text type="success">{totalItem}</Typography.Text>
                            ),
                          },
                          {
                            title: 'Total Amount',
                            dataIndex: 'grantAmount',
                            render: (_, r) => (
                              <Typography.Text type="success">
                                {numeral(totalAmount).format('$ 0,000.000')}
                              </Typography.Text>
                            ),
                          },
                        ]}
                      />
                    ),
                    children: (
                      <ProTable
                        dataSource={p.items}
                        search={false}
                        options={false}
                        ghost
                        pagination={false}
                        size="small"
                        columns={[
                          {
                            title: 'Item Name',
                            render: (_, r) => [r.itemCode, r.itemName].filter((h) => h).join(' - '),
                          },
                          {
                            title: 'Type',
                            dataIndex: 'itemType',
                          },
                          {
                            title: 'UOM',
                            dataIndex: 'uom',
                          },
                          {
                            title: 'Quantity',
                            dataIndex: 'quantity',
                            align: 'right',
                          },
                          {
                            title: 'Price',
                            align: 'right',
                            render: (_, r) => numeral(r.pricing).format('$ 0,000.000'),
                          },
                          {
                            title: 'Total',
                            align: 'right',
                            render: (_, r) => (
                              <Typography.Text type="warning">
                                {numeral(r.pricing * r.quantity).format('$ 0,000.000')}
                              </Typography.Text>
                            ),
                          },
                        ]}
                      />
                    ),
                  },
                ]}
              />
            </Card>
          );
        })}
        {(dataSource?.purchaseOrder?.length ?? 0) > 0 && (
          <Card size="small">
            <Collapse
              ghost
              items={[
                {
                  key: '1a',
                  label: (
                    <ProDescriptions
                      size="small"
                      dataSource={dataSource?.stockCount}
                      contentStyle={{ fontWeight: 500 }}
                      column={{ xs: 1, sm: 2, md: 3, lg: 5, xl: 5, xxl: 5 }}
                      columns={[
                        {
                          title: 'Counted Number',
                          dataIndex: 'countedNo',
                          span: 2,
                        },
                        {
                          title: 'Count Date',
                          // dataIndex: 'countedDate',
                          // valueType: 'date',
                          render: (_, r) => {
                            return displayDateTime(r.countedDate);
                          },
                        },
                        {
                          title: 'Sold Quantity',

                          render: (_, r) => {
                            return (
                              <Typography.Text type="warning">
                                {r.items?.reduce((acc, it) => acc + it.soldQuantity, 0)}
                              </Typography.Text>
                            );
                          },
                        },
                        {
                          title: 'Return Quantity',
                          render: (_, r) => {
                            return (
                              <Typography.Text type="warning">
                                {r.items?.reduce((acc, it) => acc + it.actualQuantity, 0)}
                              </Typography.Text>
                            );
                          },
                        },
                        // {
                        //   title: 'Saleperson',
                        //   render: (_, r) =>
                        //     [r.salespersonCode, r.salespersonName].filter((p) => p).join('-'),
                        // },
                      ]}
                    />
                  ),
                  children: (
                    <ProTable
                      dataSource={dataSource?.stockCount?.items}
                      search={false}
                      options={false}
                      ghost
                      pagination={false}
                      size="small"
                      columns={[
                        {
                          title: 'Item Name',
                          render: (_, r) => [r.itemCode, r.itemName].filter((y) => y).join(' - '),
                        },
                        {
                          title: 'Type',
                          dataIndex: 'itemType',
                        },
                        {
                          title: 'UOM',
                          dataIndex: 'uom',
                        },
                        {
                          title: 'Req. Qty',
                          dataIndex: 'requestQuantity',
                          align: 'right',
                        },
                        {
                          title: 'Sold Qty',
                          dataIndex: 'soldQuantity',
                          align: 'right',
                        },
                        {
                          title: 'System Qty',
                          dataIndex: 'systemQuantity',
                          align: 'right',
                        },
                        {
                          title: 'Actual Qty',
                          dataIndex: 'actualQuantity',
                          align: 'right',
                        },
                      ]}
                      summary={(items) => {
                        const rqty = items.reduce((p, c) => p + c.requestQuantity, 0);
                        const soldqty = items.reduce((p, c) => p + c.soldQuantity, 0);
                        const sysqty = items.reduce((p, c) => p + c.systemQuantity, 0);
                        const acqty = items.reduce((p, c) => p + c.actualQuantity, 0);
                        return (
                          <>
                            <Table.Summary.Row>
                              <Table.Summary.Cell index={0} colSpan={3} align="right">
                                Total
                              </Table.Summary.Cell>
                              <Table.Summary.Cell index={1} align="right">
                                <Typography.Text type="success">{rqty}</Typography.Text>
                              </Table.Summary.Cell>
                              <Table.Summary.Cell index={1} align="right">
                                <Typography.Text type="success">{soldqty}</Typography.Text>
                              </Table.Summary.Cell>
                              <Table.Summary.Cell index={1} align="right">
                                <Typography.Text type="success">{sysqty}</Typography.Text>
                              </Table.Summary.Cell>
                              <Table.Summary.Cell index={1} align="right">
                                <Typography.Text type="success">{acqty}</Typography.Text>
                              </Table.Summary.Cell>
                            </Table.Summary.Row>
                          </>
                        );
                      }}
                    />
                  ),
                },
              ]}
            />
          </Card>
        )}
        <Card size="small">
          <ProTable
            size="small"
            ghost
            options={false}
            search={false}
            dataSource={dataSource?.items}
            pagination={false}
            columns={[
              {
                title: 'Settlement Method',
                dataIndex: 'settlementMethod',
              },
              {
                title: 'Bank Name',
                dataIndex: 'bankName',
              },
              {
                title: 'Reference No',
                dataIndex: 'referenceNo',
              },
              {
                title: 'Currency',
                dataIndex: 'currency',
              },
              {
                title: 'Exchange Rate',
                align: 'right',
                render: (_, r) =>
                  r.exchangeRate === 1 ? '-' : `${numeral(r.exchangeRate).format('0,000')} ៛`,
              },
              {
                title: 'Amount (KHR)',
                dataIndex: 'amount',
                align: 'right',
                render: (_, r) =>
                  r.currency === 'KHR' ? `${numeral(r.amount).format('0,000')} ៛` : '-',
              },
              {
                title: 'Amount (USD)',
                dataIndex: 'amount',
                align: 'right',
                render: (_, r) =>
                  r.currency !== 'KHR' ? `$ ${numeral(r.amount).format('0,000.000')}` : '-',
              },

              {
                title: 'Amount',
                align: 'right',
                render: (_, r) => (
                  <Text type="success">
                    {r.currency !== 'USD'
                      ? `$ ${numeral(r.amount / r.exchangeRate).format('0,000.000')}` //formatCurrency(r.amount / r.exchangeRate, '$')
                      : `$ ${numeral(r.amount).format('0,000.000')}`}
                  </Text>
                ),
              },
            ]}
            summary={(items) => {
              const total = items.reduce(
                (acc, it) =>
                  it.currency !== 'USD' ? acc + it.amount / it.exchangeRate : acc + it.amount,
                0.0,
              );
              const totalKh = items.reduce(
                (acc, it) => acc + (it.currency !== 'USD' ? it.amount : 0.0),
                0.0,
              );
              const totalUSD = items.reduce(
                (acc, it) => acc + (it.currency === 'USD' ? it.amount : 0.0),
                0.0,
              );
              return (
                <>
                  <Table.Summary.Row>
                    <Table.Summary.Cell index={0} colSpan={4} align="right">
                      Total
                    </Table.Summary.Cell>
                    <Table.Summary.Cell index={1} align="right">
                      <Typography.Text type="success">
                        {max(items.map((it) => it.exchangeRate)) === 1
                          ? '-'
                          : max(items.map((it) => it.exchangeRate))}
                      </Typography.Text>
                    </Table.Summary.Cell>
                    <Table.Summary.Cell index={1} align="right">
                      <Typography.Text type="success">{`${
                        totalKh > 0 ? numeral(totalKh).format('0,000') : '-'
                      } ៛`}</Typography.Text>
                    </Table.Summary.Cell>
                    <Table.Summary.Cell index={1} align="right">
                      <Typography.Text type="success">{`$ ${numeral(totalUSD).format(
                        '0,000.000',
                      )}`}</Typography.Text>
                    </Table.Summary.Cell>
                    <Table.Summary.Cell index={1} align="right">
                      <Typography.Text type="success">{`$ ${numeral(total).format(
                        '0,000.000',
                      )}`}</Typography.Text>
                    </Table.Summary.Cell>
                  </Table.Summary.Row>
                </>
              );
            }}
          />
        </Card>
        <Card size="small" hidden={dataSource?.attachments?.length ? false : true}>
          <Flex wrap gap="small">
            {dataSource?.attachments?.map((p) => {
              return <ImagePreview fileId={p} width={150} version={1} />;
            })}
          </Flex>
        </Card>
        {/* <Card size="small" style={{ height: "100%" }}>
                    {
                        dataSource?.comment?.length ? (<>
                            <Timeline
                                mode="left"
                                items={dataSource.comment.map(p => ({
                                    label: <Space><Typography.Text type="warning">{p.createdBy}</Typography.Text><Typography.Text italic>{formatDate(p.createdDate)}</Typography.Text></Space>,
                                    children: <Flex vertical justify="space-around">
                                        <Typography.Text type="danger">{p.type}</Typography.Text>
                                        <Space>
                                            <Typography.Text type="secondary">remark:</Typography.Text>
                                            <Typography.Text >{p.description}</Typography.Text>
                                        </Space>

                                    </Flex>
                                }))}
                            />
                        </>)
                            : <Flex justify="center"><Text type="secondary">no remark</Text></Flex>
                    }
                </Card> */}
      </Flex>
      <RemarkModalForm
        open={actionState?.visible?.open}
        showAlertInfo={false}
        onSave={async (data) => {
          const entry = {
            ...data,
            id: dataSource?.id,
          };
          if (actionState?.visible?.status == 'Completed') {
            services.confirm(entry).then(() => {
              actionRef.current?.reload?.();
              loadData?.();
              message.success('Your confirmation request was a success!');
            });
          } else {
            services.reject(entry).then(() => {
              actionRef.current?.reload?.();
              loadData?.();
              message.success('Your rejection request was a success!');
            });
          }
          setActionState({ visible: undefined });
        }}
        status={actionState?.visible?.status}
      />
    </Spin>
  );
};

export default SettlementMethodDetail;
