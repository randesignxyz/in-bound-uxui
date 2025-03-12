import ImagePreview from '@/components/ImagePreview';
import { displayDateTime, formatDate } from '@/pages/utils';
import { AddressInfo } from '@/services/crm/data';
import { CrmServiceAPI } from '@/services/crm/services';
import { simpleRequestActions } from '@/services/model';
import { LeadLess, SaleInvoiceLess } from '@/services/sale/data';
import {
  CheckCircleOutlined,
  CloseCircleOutlined,
  EditOutlined,
  SyncOutlined,
} from '@ant-design/icons';
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
import { PurchaseOrderDTO } from '../purchase_order/data';
import { PurchaseOrderDistributorDto, SettlementMethodDetailDTO } from './data';
import DistributorModal from './DistributorModal';
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

  const [modal, setModal] = useState<{
    visible?: {
      open: boolean;
      addressList: AddressInfo[];
      purchaseOrder?: PurchaseOrderDistributorDto;
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

  const onChangedDistributor = async (purchaseOrder: PurchaseOrderDTO) => {
    const purchaseOrderId = purchaseOrder.id;
    const data = await CrmServiceAPI(requestActions).listAddressByCustomer({
      id: purchaseOrderId,
    });
    setModal({
      visible: {
        open: true,
        // id: purchaseOrderId,
        addressList: data,
        purchaseOrder: {
          distributorId: purchaseOrder.distributorId,
          distributorName: purchaseOrder.distributorName,
          distributorCode: purchaseOrder.distributorCode,
          distributorPhone: purchaseOrder.distributorPhone,
          id: purchaseOrderId,
          latitude: purchaseOrder.latitude,
          longitude: purchaseOrder.longitude,
          addressId: purchaseOrder.addressId,
          address: purchaseOrder.address,
          addressCode: purchaseOrder.addressCode,
        },
      },
    });
  };

  const getCustomerName = (it?: LeadLess): string => {
    const name =
      it?.internalName !== null
        ? it?.internalName
        : it?.firstName !== null && it?.lastName !== null
        ? `${it?.firstName} ${it?.lastName}`
        : it?.firstName !== null
        ? it?.firstName
        : it?.lastName || '';
    return `${name} - ( ${it?.phone} )`;
  };

  const expandedRowRender = (parent: SaleInvoiceLess) => {
    return parent.items.length > 0 ? (
      <ProTable
        size={'small'}
        style={{ backgroundColor: '#EEE' }}
        key={'key'}
        rowKey={'id'}
        columns={[
          { title: '#', dataIndex: 'index', key: 'key' },
          {
            title: 'Batch No',
            render: (_, r) => {
              return r.batchNo === 'n/a' ? '-' : r.batchNo;
            },
          },
          { title: 'Code', dataIndex: 'itemCode' },
          { title: 'Description', dataIndex: 'itemName' },
          { title: 'Quantity', dataIndex: 'quantity' },
          { title: 'UOM', dataIndex: 'uom' },
          {
            title: 'Type',
            render: (_, r) => {
              return <Tag color={r.itemType === 'FOC' ? 'error' : 'success'}>{r.itemType}</Tag>;
              // return r.itemType;
            },
          },
          {
            title: 'Sale Price',
            align: 'right',
            render: (_, r) => {
              return `$ ${numeral(r.unitPrice).format('0,0.000')}`;
            },
          },
          {
            title: 'Amount',
            align: 'right',
            render: (_, r) => {
              return `$ ${numeral(r.quantity * r.unitPrice).format('0,0.000')}`;
            },
          },
          // {
          //   key: 'status',
          //   title: 'Status',
          //   dataIndex: 'status',
          //   render: (_, r) => {
          //     const color = r.status === 'approve' ? 'lime' : 'default';
          //     const str = r.status === 'approve' ? 'Approve' : 'Pending';
          //     return (
          //       <span>
          //         <Tag color={color}>{str}</Tag>
          //       </span>
          //     );
          //   },
          // },
          // {
          //   title: 'Action',
          //   dataIndex: 'operation',
          //   key: 'operation',
          //   valueType: 'option',
          //   render: () => [<a key="Pause">Pause</a>, <a key="Stop">Stop</a>],
          // },
        ]}
        headerTitle={false}
        search={false}
        options={false}
        dataSource={parent.items.sort((a, b) =>
          parseInt(a.itemCode) < parseInt(b.itemCode) ? 1 : 0,
        )}
        pagination={false}
      />
    ) : (
      <div key={parent.id} style={{ textAlign: 'center', fontWeight: 'bold', color: 'gray' }}>
        No Data
      </div>
    );
  };
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
            <Card key={p.id} size="small" title={'Purchase Order'}>
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
                        columns={[
                          {
                            title: 'P.O Number',
                            dataIndex: 'purchaseOrderCode',
                          },
                          {
                            title: 'Distributor Name',
                            dataIndex: 'distributorCode',
                            render: (_, r) =>
                              [r.distributorCode, r.distributorName].filter((po) => po).join(' - '),
                          },
                          { title: 'Address', dataIndex: 'addressCode' },
                          {
                            title: 'Date',
                            dataIndex: 'purchaseOrderDate',
                            valueType: 'date',
                          },
                          {
                            title: 'Request Quantity',
                            render: () => (
                              <Typography.Text type="success">{totalItem}</Typography.Text>
                            ),
                          },
                          {
                            title: 'Total Amount',
                            dataIndex: 'grantAmount',
                            render: () => (
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
                        tableExtraRender={() => {
                          if (dataSource.status === 'Pending') {
                            return (
                              <Flex flex={1} justify="end">
                                <Button
                                  type="primary"
                                  icon={<EditOutlined />}
                                  onClick={async () => {
                                    await onChangedDistributor(p);
                                  }}
                                >
                                  Change Distributor
                                </Button>
                              </Flex>
                            );
                          }
                        }}
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
          <Card size="small" title="Stock Count">
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
                      // column={{ xs: 1, sm: 2, md: 3, lg: 5, xl: 5, xxl: 5 }}
                      // column={2}
                      columns={[
                        {
                          title: 'Counted Number',
                          dataIndex: 'countedNo',
                          // span: 2,
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
                        {
                          title: 'Count Date',
                          render: (_, r) => {
                            return displayDateTime(r.countedDate);
                          },
                        },
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
        {dataSource && dataSource.salesInvoices && dataSource.salesInvoices.length > 0 && (
          <Card size="small" title="Sales Invoice">
            <Collapse
              ghost
              key={'collapSalesInvoice'}
              items={[
                {
                  key: 'ItemColSalesInvoice',
                  label: (
                    <ProDescriptions
                      size="small"
                      dataSource={{
                        invoiceDates: formatDate(
                          dataSource?.salesInvoices[dataSource?.salesInvoices.length - 1]
                            .invoiceDate,
                        ),
                        countInvoices: dataSource?.salesInvoices.length,
                        amount: dataSource?.salesInvoices.reduce((a, e) => a + e.amount, 0.0),
                      }}
                      contentStyle={{ fontWeight: 500 }}
                      // column={{ xs: 1, sm: 2, md: 3, lg: 5, xl: 5, xxl: 5 }}
                      // column={3}
                      columns={[
                        {
                          title: 'Latest Invoice Date',
                          dataIndex: 'invoiceDates',
                          // span: 2,
                        },

                        {
                          title: 'Invoice Counts',
                          dataIndex: 'countInvoices',
                          // span: 2,
                        },
                        {
                          title: 'Total Amount',
                          render: (_, r) => (
                            <Typography.Text type="success">
                              {numeral(r.amount).format('$ 0,000.000')}
                            </Typography.Text>
                          ),
                        },
                      ]}
                    />
                  ),
                  children: (
                    <ProTable<SaleInvoiceLess, { stockControlId: number; searchValue?: string }>
                      // title={() => <Text>Helo</Text>}
                      key={'saleInvoice'}
                      rowKey={'id'}
                      expandable={{ expandedRowRender }}
                      dataSource={dataSource.salesInvoices}
                      columns={[
                        {
                          title: 'Invoice #',
                          dataIndex: 'invoiceNo',
                        },
                        {
                          title: 'Salesperson',
                          render: (_, r) => {
                            return `${r.salesperson.salespersonCode} - ${r.salesperson.salespersonName}`;
                          },
                        },
                        {
                          title: 'Customer',
                          render: (_, r) => {
                            return getCustomerName(r.customer);
                          },
                        },
                        {
                          title: 'Total Quantity',
                          align: 'right',
                          render: (_, r) => {
                            const total = r.items.reduce((acc, it) => acc + it.quantity, 0);
                            return `${total} CASE${total > 1 ? 'S' : ''}`;
                          },
                        },
                        {
                          title: 'Invoice Date',
                          //dataIndex: 'invoiceNo'
                          render: (_, r) => {
                            return formatDate(r.invoiceDate);
                          },
                        },
                        {
                          title: 'Amount',
                          // dataIndex: 'amount',
                          align: 'right',
                          // valueType: 'money',
                          render: (_, r) => {
                            return `$ ${numeral(r.amount).format('0,0.000')}`;
                          },
                        },

                        {
                          title: 'Status',
                          dataIndex: 'status',
                          render: (_, r) => {
                            const color =
                              r.status === 'Pending'
                                ? 'magenta'
                                : r.status === 'Paid'
                                ? 'processing'
                                : r.status === 'Own'
                                ? 'success'
                                : 'warning';
                            return (
                              <span>
                                <Tag color={color}>{r.status}</Tag>
                              </span>
                            );
                          },
                        },
                      ]}
                      toolBarRender={false}
                      options={{
                        density: false,
                        setting: false,
                        reload: false,
                        search: false,
                        // search: true ?? (
                        //   <Space size={[1, 'small']}>
                        //     <Input.Search allowClear onSearch={onSearchHandler} />
                        //   </Space>
                        // ),
                      }}
                      size="small"
                      search={false}
                      pagination={{
                        pageSize: 50,
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
              return <ImagePreview key={p} fileId={p} width={150} version={1} />;
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
          if (actionState?.visible?.status === 'Completed') {
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
      <DistributorModal
        addressList={modal?.visible?.addressList ?? []}
        purchaseOrder={modal?.visible?.purchaseOrder}
        open={modal && modal.visible?.open}
        onCancel={() => setModal({ visible: undefined })}
        // onSubmit={(address, ) => {
        //   message.info('Hello');
        // }}
        onSubmitClick={async (
          purchaseOrderId,
          address,
          distributorId,
          distributorName,
          distributorCode,
          distributorPhone,
          addressInfo,
        ) => {
          if (addressInfo !== undefined) {
            setModal({ visible: undefined });
            await services.changeDistributor({
              id: purchaseOrderId,
              distributorCode: distributorCode,
              distributorName: distributorName,
              distributorPhone: distributorPhone,
              distributorId: distributorId,
              latitude: addressInfo?.latitude,
              longitude: addressInfo?.longitude,
              addressId: addressInfo?.customerAddressId,
              address: address,
              addressCode: addressInfo?.address,
            });
            await loadData();
          }
        }}
      />
    </Spin>
  );
};

export default SettlementMethodDetail;
