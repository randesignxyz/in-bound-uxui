import type { TableViewProps } from '@/components/DataCrud/TableView';
import { formatDate } from '@/pages/utils';
import type { Paging } from '@/services/API';
import { simpleRequestActions } from '@/services/model';
import type {
  CountStockDto,
  CountStockItemDto,
  ExchangeRate,
  SaleInvoiceLess,
  StockControlLess,
  StockDetailItemLess,
  StockStoreAdvanceSearchParams,
} from '@/services/sale/data';
import { EditOutlined } from '@ant-design/icons';
import { PageContainer, ProColumns } from '@ant-design/pro-components';
import type { ActionType } from '@ant-design/pro-table';
import ProTable from '@ant-design/pro-table';
import { history, useAccess, useModel } from '@umijs/max';
import { useSetState } from 'ahooks';
import { Button, Col, Flex, Input, Modal, Row, Space, Table, Tag, Tooltip, Typography, message } from 'antd';
import type { SortOrder } from 'antd/lib/table/interface';
import numeral from 'numeral';
import { useEffect, useRef, useState } from 'react';
import { SalesInvoiceLess } from '../../so-invoice/data';
import CountStockModal from '../components/CountStockModal';
import EditItemEntryModal from '../components/EditItemEntryModal';
import SettlementModal from '../components/SettlementModal';
import { Model } from '../model';
import { SuggestionServiceAPI } from '../services';
import RemarkModalForm from '../../component/RemarkModal';

const SuggestionListView: React.FC<TableViewProps<StockControlLess>> = ({ }) => {
  const cacheList = useModel('dataList');
  const actionRef = useRef<ActionType>();
  const access = useAccess();
  const [force, setForce] = useSetState<{ update: number }>({ update: 0 });
  const { state, actions } = Model();
  const { loading } = state;
  const requestActions = simpleRequestActions();
  const suggestionService = SuggestionServiceAPI(requestActions);

  const [exchangeRate, setExchangeRate] = useState<ExchangeRate>();
  const [dsdExchangeRate, setDsdExchangeRate] = useState<ExchangeRate>();
  const [remarkState, setRemarkState] = useState<{
    visible?:{
      open:boolean;
      carryData?:StockControlLess;
    }
  }>();
  // const [advanceSearchParams, setAdvanceSearchParams] = useState<StockStoreAdvanceSearchParams>({
  //   status: access.canAccessAllMenuDSD
  //     ? 'pending'
  //     : access.canAccessTabWarehouse
  //     ? 'approved'
  //     : access.canAccessTabCashier
  //     ? 'settled'
  //     : 'all',
  // });

  const [addNewModal, setAddNewModal] = useSetState<{
    open?: boolean;
    record?: StockControlLess;
  }>({});
  const [countModal, setCountModal] = useSetState<{
    open?: boolean;
    record?: StockControlLess;
  }>({});
  const [settleModal, setSettleModal] = useSetState<{
    open?: boolean;
    record?: StockControlLess;
  }>({});

  const { Text } = Typography;

  useEffect(() => {
    (async () => {
      const rs = await suggestionService.exchangeRage();
      setExchangeRate(rs);
      const rs1 = await suggestionService.dsdExchangeRage();
      setDsdExchangeRate(rs1);
    })();
  }, []);

  useEffect(() => {
    if (force) {
      actionRef.current?.reloadAndRest?.();
    }
  }, [force]);

  const onRequestHandler = (
    criteria?: { searchValue?: string; advanceSearch?: StockStoreAdvanceSearchParams },
    pagination?: {
      pageSize?: number;
      current?: number;
    },
    sort?: Record<string, SortOrder>,
  ) => {
    // const status = access.canAccessWarehouse
    //   ? ['approved', 'count stock']
    //   : access.canAccessSuggestion
    //   ? ['pending']
    //   : access.canAccessSettlement
    //   ? ['settled']
    //   : [''];
    const role = access.canAccessAllMenuDSD
      ? 'sale_admin'
      : access.canAccessTabWarehouse
        ? 'warehouse'
        : access.canAccessTabCashier
          ? 'cashier'
          : 'admin';
    return actions.loadListItem?.({ role: role, ...criteria }, pagination, sort).then((it) => {
      return cacheList.cacheDataList({
        type: 'stock',
        data: it,
      });
    }) as Promise<Paging<StockControlLess>>;
  };

  // const onRequestHandler = (
  //   criteria?: { searchValue?: string; advanceSearch?: StockAdvanceSearchParams },
  //   pagination?: {
  //     pageSize?: number;
  //     current?: number;
  //   },
  //   sort?: Record<string, SortOrder>,
  // ) => {
  //   return actions
  //     .loadListItem?.(criteria || { advanceSearch: advanceSearchParams }, pagination, sort)
  //     .then((it) => {
  //       setStorageData(it.items);
  //       return cacheList.cacheDataList({
  //         type: 'stock',
  //         criteria: criteria?.advanceSearch || advanceSearchParams,
  //         data: it,
  //       });
  //     }) as Promise<Paging<StockControlLess>>;
  // };

  const invoicesColumns: ProColumns<SalesInvoiceLess | StockDetailItemLess>[] =
    access.canAccessTabCashier
      ? [
        {
          title: 'Invoice #',
          dataIndex: 'invoiceNo',
        },
        {
          title: 'Reference #',
          dataIndex: 'referenceNo',
        },
        {
          title: 'Invoice Date',
          //dataIndex: 'invoiceNo'
          render: (_, r) => {
            if ('invoiceDate' in r) {
              return formatDate(r.invoiceDate);
            } else return '-';
          },
        },
        {
          title: 'Salesperson',
          render: (_, r) => {
            if ('invoiceDate' in r) {
              return `${r.salesperson.salespersonCode} - ${r.salesperson.salespersonName}`;
            } else return '-';
          },
        },
        {
          title: 'Amount',
          align: 'right',
          render: (_, r) => {
            if ('invoiceDate' in r) {
              // const amount = (dsdExchangeRate?.target_amount ?? 0) * r.amount;
              return `$ ${numeral(r.amount).format('0,000.00')}`;
            } else return '-';
          },
        },
      ]
      : [
        {
          title: 'Batch No',
          dataIndex: 'batchNo',
          // hideInTable: access.canAccessAllMenuDSD,
        },
        {
          title: 'Expired Date',
          render: (_, r) => {
            if ('expiredDate' in r) {
              return r.expiredDate || r.batchNo ? formatDate(r.expiredDate) : '-';
            } else return '-';
          },
        },
        {
          title: 'Description',
          render: (_, r) => {
            if ('expiredDate' in r) {
              return `${r.itemCode} - ${r.itemName} (${r.description})`;
            } else return '-';
          },
        },
        { title: 'UOM', dataIndex: 'uom' },
        {
          title: 'Type',
          render: (_, r) => {
            if ('expiredDate' in r) {
              return r.itemType === 131
                ? 'Vital'
                : r.itemType === 132
                  ? 'Mee Chiet'
                  : 'Merchandise';
            } else return '-';
          },
        },
        { title: 'Beginning Qty', align: 'right', dataIndex: 'beginningQty' },
        { title: 'Request Qty', align: 'right', dataIndex: 'quantity' },
      ];

  const colsApprove: ProColumns<StockDetailItemLess>[] = [
    {
      title: 'Batch No',
      render: (_, r) => {
        return r.batchNo ? r.batchNo : <Tag color={'red'}>Required</Tag>;
      },
    },
    {
      title: 'Expired Date',
      render: (_, r) => {
        return r.expiredDate || r.batchNo ? (
          formatDate(r.expiredDate)
        ) : (
          <Tag color={'red'}>Required</Tag>
        );
      },
    },
    {
      title: 'Description',
      render: (_, r) => {
        return `${r.itemCode} - ${r.itemName} (${r.description})`;
      },
    },
    { title: 'UOM', dataIndex: 'uom' },
    {
      title: 'Type',
      render: (_, r) => {
        return r.itemType === 131 ? 'Vital' : r.itemType === 132 ? 'Mee Chiet' : 'Merchandise';
      },
    },
    { title: 'Beginning Qty', align: 'right', dataIndex: 'beginningQty' },
    { title: 'Request Qty', align: 'right', dataIndex: 'quantity' },
    {
      title: 'Total Qty',
      align: 'right',
      render: (_, r) => {
        return r.beginningQty + r.quantity;
      },
    },
  ];

  const colsCountStock: ProColumns<StockDetailItemLess>[] = [
    {
      title: 'Batch No',
      render: (_, r) => {
        return r.batchNo ? r.batchNo : <Tag color={'red'}>Required</Tag>;
      },
    },
    {
      title: 'Description',
      render: (_, r) => {
        return `${r.itemCode} - ${r.itemName} (${r.description})`;
      },
    },
    { title: 'Begin Stock', align: 'right', dataIndex: 'beginningQty' },
    { title: 'Req. Stock', align: 'right', dataIndex: 'quantity' },
    { title: 'Total Stock', align: 'right', render: (_, r) => r.beginningQty + r.quantity },
    {
      title: 'Stock Used',
      align: 'right',
      dataIndex: 'soldQty',
    },
    {
      title: 'End Stock',
      align: 'right',
      render: (_, r) => {
        return r.beginningQty + r.quantity - r.soldQty;
      },
    },
  ];

  const summaryApprove = (parent: StockControlLess, data: readonly StockDetailItemLess[]) => {
    const beginningQty = data.reduce(function (acc, it) {
      return acc + it.beginningQty;
    }, 0);
    const requestQty = data.reduce(function (acc, it) {
      return acc + it.quantity;
    }, 0);
    return (
      <>
        <Table.Summary.Row>
          <Table.Summary.Cell index={0} align="right" colSpan={5}>
            <Text type="success">Total</Text>
          </Table.Summary.Cell>
          <Table.Summary.Cell index={1} align="right">
            <Text type="success">{beginningQty}</Text>
          </Table.Summary.Cell>
          <Table.Summary.Cell index={2} align="right">
            <Text type="success">{requestQty}</Text>
          </Table.Summary.Cell>
          <Table.Summary.Cell index={3} align="right">
            <Text type="success">{requestQty + beginningQty}</Text>
          </Table.Summary.Cell>
        </Table.Summary.Row>
        {parent.status === 'approved' && (
          <Table.Summary.Row>
            <Table.Summary.Cell index={0} align="right" colSpan={9}>
              <Button
                type="primary"
                onClick={() => {
                  setAddNewModal({ open: true, record: parent });
                }}
              >
                Edit
              </Button>
            </Table.Summary.Cell>
          </Table.Summary.Row>
        )}
      </>
    );
  };

  const summaryCountStock = (parent: StockControlLess, data: readonly StockDetailItemLess[]) => {
    const beginningQty = data.reduce(function (acc, it) {
      return acc + it.beginningQty;
    }, 0);
    const requestQty = data.reduce(function (acc, it) {
      return acc + it.quantity;
    }, 0);
    const soldQty = data.reduce(function (acc, it) {
      return acc + it.soldQty;
    }, 0);
    return (
      <>
        <Table.Summary.Row>
          <Table.Summary.Cell index={0} align="right" colSpan={2}>
            <Text type="success">Total</Text>
          </Table.Summary.Cell>
          <Table.Summary.Cell index={1} align="right">
            <Text type="success">{beginningQty}</Text>
          </Table.Summary.Cell>
          <Table.Summary.Cell index={2} align="right">
            <Text type="success">{requestQty}</Text>
          </Table.Summary.Cell>
          <Table.Summary.Cell index={3} align="right">
            <Text type="success">{requestQty + beginningQty}</Text>
          </Table.Summary.Cell>
          <Table.Summary.Cell index={4} align="right">
            <Text type="success">{soldQty}</Text>
          </Table.Summary.Cell>
          <Table.Summary.Cell index={5} align="right">
            <Text type="success">{requestQty + beginningQty - soldQty}</Text>
          </Table.Summary.Cell>
        </Table.Summary.Row>
        {/* <Table.Summary.Row>
          <Table.Summary.Cell index={0} colSpan={4} />
          <Table.Summary.Cell index={1} colSpan={3}>
            <ProFormCheckbox
              fieldProps={{ checked: true }}
              name="isKeepForwarding"
              label="Stock balance is to be carried Forward"
            />
          </Table.Summary.Cell>
        </Table.Summary.Row> */}
        {parent.status === 'count stock' && (
          <Table.Summary.Row>
            <Table.Summary.Cell index={0} align="right" colSpan={7}>
              <Space>
                <Button
                  type="default"
                  onClick={() => {
                    Modal.confirm({
                      title: `Submit ${parent.owner.split(' - ')[1]}'s stock`,
                      content: 'Are you sure.',
                      onOk: async () => {
                        const items = parent.items?.map((it) => {
                          const endQty = it.beginningQty + it.quantity - it.soldQty;
                          const item: CountStockItemDto = {
                            id: it.id!!,
                            actualQty: endQty,
                            endQty: endQty,
                            remark: '',
                          };
                          return item;
                        });
                        const countStock: CountStockDto = {
                          isForwardingStockControl: true,
                          stockControlId: parent.id,
                          items: items,
                        };
                        await actions.countStock(countStock);
                        setForce({ update: force.update + 1 });
                      },
                    });
                    // const items = dataSource.map((it) => {
                    //   const item: CountStockItemDto = {
                    //     id: it.id!!,
                    //     actualQty: it.actualQty || 0,
                    //     endQty: it.endQty || 0,
                    //     remark: it.remark || '',
                    //   };
                    //   return item;
                    // });

                    // const countStock: CountStockDto = {
                    //   isForwardingStockControl: params.isKeepForwarding,
                    //   stockControlId: data?.id || 0,
                    //   items: items,
                    // };
                  }}
                >
                  Submit
                </Button>
                <Button
                  type="primary"
                  onClick={() => {
                    setCountModal({ open: true, record: parent });
                  }}
                >
                  Edit
                </Button>
              </Space>
            </Table.Summary.Cell>
          </Table.Summary.Row>
        )}
      </>
    );
  };

  const expandedRowRender = (parent: StockControlLess) => {
    // const isCountStock = parent.status === 'count stock';

    return (parent.items && parent.items.length > 0) ||
      (parent.invoices && parent.invoices.length > 0) ? (
      <ProTable<StockDetailItemLess | SalesInvoiceLess>
        size={'small'}
        style={{ backgroundColor: '#EEE' }}
        key={'key'}
        headerTitle={false}
        search={false}
        options={false}
        dataSource={access.canAccessTabCashier ? parent.invoices : parent.items}
        pagination={false}
        // rowKey={(r) => {
        //   if (r instanceof SalesInvoiceLess){
        //     return "";
        //   } else {
        //     return r.batchNo + '-' + r.itemCode;
        //   }
        // }}
        columns={invoicesColumns}

        summary={(data) => {
          const item = data[0];

          if (parent.status === 'settled' && data.length === 0) {
            return (
              <Table.Summary.Row>
                <Table.Summary.Cell index={0} align="right" colSpan={5}>
                  <Button
                    type="link"
                    onClick={() => {
                      Modal.confirm({
                        title: 'Settlement has no invoice.',
                        content: 'Are you sure?',
                        onOk: async () => {
                          await actions.onClosedRequest(parent.id);
                          setForce({ update: force.update + 1 });
                        },
                      });
                    }}
                  >
                    Submit
                  </Button>
                </Table.Summary.Cell>
              </Table.Summary.Row>
            );
          }
          else if ("beginningQty" in item) {
            const beginningQty = data.reduce(function (acc, it) {
              return acc + (it?.beginningQty || 0);
            }, 0);
            const requestQty = data.reduce(function (acc, it) {
              return acc + (it?.quantity || 0);
            }, 0);

            return (
              <>
                <Table.Summary.Row>
                  <Table.Summary.Cell index={0} align="right" colSpan={5}>
                    <Text type="success">Total</Text>
                  </Table.Summary.Cell>
                  <Table.Summary.Cell index={1} align="right">
                    <Text type="success">{beginningQty}</Text>
                  </Table.Summary.Cell>
                  <Table.Summary.Cell index={2} align="right">
                    <Text type="success">{requestQty}</Text>
                  </Table.Summary.Cell>
                </Table.Summary.Row>
                {parent.status === 'pending' && (
                  <Table.Summary.Row>
                    <Table.Summary.Cell index={0} align="right" colSpan={7}>
                      <Space>
                        {
                          // access.canAccessDMSAdminMenu &&
                           <Button
                          danger
                          onClick={async () => {
                            setRemarkState({visible:{open:true, carryData:parent}});
                            // Modal.confirm({
                            //   title: 'Reject Suggestion.',
                            //   content: 'Are you sure?',
                            //   onOk: async () => {
                                // await actions.reject(parent.id);
                            //     setForce({ update: force.update + 1 });
                            //   },
                            // });
                          }}
                        >
                          Reject
                        </Button>
                        }
                        <Button
                          type="primary"
                          onClick={async () => {
                            Modal.confirm({
                              title: 'Accept Suggestion.',
                              content: 'Are you sure?',
                              onOk: async () => {
                                await actions.acceptRequest(parent);
                                setForce({ update: force.update + 1 });
                              },
                            });
                          }}
                        >
                          Approve
                        </Button>
                      </Space>
                    </Table.Summary.Cell>
                  </Table.Summary.Row>
                )}
              </>
            );
          }
          else {
            const total =
              data.reduce(function (acc, it) {
                return (acc + it.amount);
              }, 0) * (dsdExchangeRate?.target_amount ?? 0);
            // const disabled = data.some((it) => !it.batchNo || !it.expiredDate);
            return (
              <>
                <Table.Summary.Row>
                  <Table.Summary.Cell index={0} align="right" colSpan={4}>
                    <Text type="success">Total</Text>
                  </Table.Summary.Cell>
                  <Table.Summary.Cell index={1} align="right">
                    <Text type="success">
                      {dsdExchangeRate?.target_symbol} {numeral(total).format('0,0.00')}
                    </Text>
                  </Table.Summary.Cell>
                </Table.Summary.Row>
                {parent.status === 'settled' && (
                  <Table.Summary.Row>
                    <Table.Summary.Cell index={0} align="right" colSpan={5}>
                      <Button
                        type="primary"
                        onClick={() => {
                          setSettleModal({ open: true, record: parent });
                        }}
                      >
                        Settlement
                      </Button>
                    </Table.Summary.Cell>
                  </Table.Summary.Row>
                )}
              </>
            );
          }
        }}
      />
    ) : (
      access.canAccessAllMenuDSD ? (
        <ProTable
          size={'small'}
          style={{ backgroundColor: '#EEE' }}
          key={'key'}
          rowKey={(r) => {
            return r.batchNo + '-' + r.itemCode;
          }}
          columns={[
            {
              title: 'Batch No',
              dataIndex: 'batchNo',
            },
            {
              title: 'Expired Date',
              render: (_, r) => {
                return r.expiredDate || r.batchNo ? formatDate(r.expiredDate) : '-';
              },
            },
            {
              title: 'Description',
              render: (_, r) => {
                return `${r.itemCode} - ${r.itemName} (${r.description})`;
              },
            },
            { title: 'UOM', dataIndex: 'uom' },
            {
              title: 'Type',
              render: (_, r) => {
                return r.itemType === 131
                  ? 'Vital'
                  : r.itemType === 132
                  ? 'Mee Chiet'
                  : 'Merchandise';
              },
            },
            { title: 'Beginning Qty', align: 'right', dataIndex: 'beginningQty' },
            { title: 'Request Qty', align: 'right', dataIndex: 'quantity' },
          ]}
          summary={(data) => {
            const beginningQty = data.reduce(function (acc, it) {
              return acc + it.beginningQty;
            }, 0);
            const requestQty = data.reduce(function (acc, it) {
              return acc + it.quantity;
            }, 0);

            return (
              <>
                <Table.Summary.Row>
                  <Table.Summary.Cell index={0} align="right" colSpan={5}>
                    <Text type="success">Total</Text>
                  </Table.Summary.Cell>
                  <Table.Summary.Cell index={1} align="right">
                    <Text type="success">{beginningQty}</Text>
                  </Table.Summary.Cell>
                  <Table.Summary.Cell index={2} align="right">
                    <Text type="success">{requestQty}</Text>
                  </Table.Summary.Cell>
                </Table.Summary.Row>
                {parent.status === 'pending' && (
                  <Table.Summary.Row>
                    <Table.Summary.Cell index={0} align="right" colSpan={7}>
                      <Button
                        type="primary"
                        onClick={async () => {
                          Modal.confirm({
                            title: 'Accept Suggestion.',
                            content: 'Are you sure?',
                            onOk: async () => {
                              await actions.acceptRequest(parent);
                              setForce({ update: force.update + 1 });
                            },
                          });
                        }}
                      >
                        Approve
                      </Button>
                    </Table.Summary.Cell>
                  </Table.Summary.Row>
                )}
              </>
            );
          }}
          headerTitle={false}
          search={false}
          options={false}
          dataSource={parent.items}
          pagination={false}
        />
      ) : access.canAccessTabWarehouse ? (
        <ProTable
          size={'small'}
          style={{ backgroundColor: '#EEE' }}
          key={'key'}
          rowKey={(r) => {
            return r.batchNo + '-' + r.itemCode;
          }}
          columns={isCountStock ? colsCountStock : colsApprove}
          summary={(record: readonly StockDetailItemLess[]) => {
            return isCountStock
              ? summaryCountStock(parent, record)
              : summaryApprove(parent, record);
          }}
          headerTitle={
            false
            // <Button
            //   type="primary"
            //   style={{ alignItems: 'flex-end' }}
            //   onClick={() => message.info('testing ')}
            // >
            //   Merge
            // </Button>
          }
          search={false}
          options={false}
          dataSource={parent.items}
          pagination={false}
        />
      ) : parent.invoices && parent.invoices.length > 0 ? (
        <ProTable<SaleInvoiceLess>
          size={'small'}
          style={{ backgroundColor: '#EEE' }}
          key={'key'}
          rowKey={(r) => {
            return 'Invoice-' + r.id;
          }}
          columns={[
            {
              title: 'Invoice #',
              dataIndex: 'invoiceNo',
            },
            {
              title: 'Reference #',
              dataIndex: 'referenceNo',
            },
            {
              title: 'Invoice Date',
              //dataIndex: 'invoiceNo'
              render: (_, r) => {
                return formatDate(r.invoiceDate);
              },
            },
            {
              title: 'Salesperson',
              render: (_, r) => {
                return `${r.salesperson.salespersonCode} - ${r.salesperson.salespersonName}`;
              },
            },
            {
              title: 'Amount',
              align: 'right',
              render: (_, r) => {
                const amount = (dsdExchangeRate?.target_amount ?? 0) * r.amount;
                return `${dsdExchangeRate?.target_symbol} ${numeral(amount).format('0,0.00')}`;
              },
            },
          ]}
          summary={(data) => {
            const total =
              data.reduce(function (acc, it) {
                return acc + it.amount;
              }, 0) * (dsdExchangeRate?.target_amount ?? 0);
            // const disabled = data.some((it) => !it.batchNo || !it.expiredDate);
            return (
              <>
                <Table.Summary.Row>
                  <Table.Summary.Cell index={0} align="right" colSpan={4}>
                    <Text type="success">Total</Text>
                  </Table.Summary.Cell>
                  <Table.Summary.Cell index={1} align="right">
                    <Text type="success">
                      {dsdExchangeRate?.target_symbol} {numeral(total).format('0,0.00')}
                    </Text>
                  </Table.Summary.Cell>
                </Table.Summary.Row>
                {parent.status === 'settled' && (
                  <Table.Summary.Row>
                    <Table.Summary.Cell index={0} align="right" colSpan={5}>
                      <Button
                        type="primary"
                        onClick={() => {
                          setSettleModal({ open: true, record: parent });
                        }}
                      >
                        Settlement
                      </Button>
                    </Table.Summary.Cell>
                  </Table.Summary.Row>
                )}
              </>
            );
          }}
          headerTitle={false}
          search={false}
          options={false}
          dataSource={parent.invoices}
          pagination={{
            position: ['topCenter'],
            size: 'small',
            pageSize: 20,
            pageSizeOptions: [20, 40],
          }}
        />
      ) : (
        <Row>
          <Col flex={'auto'}>
            <div key={parent.id} style={{ textAlign: 'center', fontWeight: 'bold', color: 'gray' }}>
              No Data
            </div>
          </Col>
          <Col flex={'100px'}>
            <Button
              type="link"
              onClick={() => {
                Modal.confirm({
                  title: 'Settlement has no invoice.',
                  content: 'Are you sure?',
                  onOk: async () => {
                    await actions.onClosedRequest(parent.id);
                    setForce({ update: force.update + 1 });
                  },
                });
              }}
            >
              Submit
            </Button>
          </Col>
        </Row>
      )
      // <div key={parent.id} style={{ textAlign: 'center', fontWeight: 'bold', color: 'gray' }}>
      //   No Data
      // </div>
    );
  };

  return (
    <PageContainer breadcrumb={undefined} title={'Task List'} onBack={() => history.push('/sale')}>
      <ProTable<StockControlLess, { searchValue?: string }>
        actionRef={actionRef}
        key={'saleInvoice'}
        rowKey={'id'}
        toolBarRender={() => []}
        headerTitle={
          <Space size={[1, 'small']}>
            <Input.Search allowClear />

            {/* <Radio.Group
              value={advanceSearchParams?.status}
              onChange={(e) => {
                setAdvanceSearchParams((v) => ({
                  ...v,
                  status: e.target.value,
                }));

                actionRef.current?.reloadAndRest?.();
              }}
            >
              {access.canAccessAllMenuDSD && (
                <>
                  <Radio.Button value="pending">Pending</Radio.Button>
                  <Radio.Button value="custom">Approved</Radio.Button>
                </>
              )}
              {access.canAccessTabWarehouse && (
                <>
                  <Radio.Button value="approved">Pending</Radio.Button>
                  <Radio.Button value="count stock">Count Stock</Radio.Button>
                  <Radio.Button value="open">Open</Radio.Button>
                  <Radio.Button value="closed">Closed</Radio.Button>
                </>
              )}
              {access.canAccessTabCashier && (
                <>
                  <Radio.Button value="settled">Settled</Radio.Button>
                  <Radio.Button value="closed">Closed</Radio.Button>
                </>
              )}
              {}
            </Radio.Group> */}
          </Space>
        }
        options={{
          density: false,
          setting: false,
          reload: true,
        }}
        search={false}
        request={async (
          params: {
            pageSize?: number;
            current?: number;
            keyword?: string;
          },
          sort: Record<string, SortOrder>,
        ) => {
          const searchParams = {
            searchValue: params.keyword,
            advanceSearch: { status: 'pending' },
          };
          const data = await onRequestHandler(searchParams, params, sort);
          return {
            success: !!data,
            total: data?.total,
            data: data?.items.map((it: StockControlLess) => it).filter((it: any) => !!it),
          };
        }}
        expandable={{ expandedRowRender }}

        columns={[
          {
            title: 'Store Name',
            render: (_, r) => {
              return r.stockName ? r.stockName : '-';
            },
          },
          {
            width: 120,
            title: 'Request Date',
            align: 'right',
            render: (_, r) => {
              return formatDate(r.requestedDate);
            },
          },
          {
            title: 'Serial Number',
            dataIndex: 'referenceNo',
          },

          {
            title: 'Number Plate',
            dataIndex: 'plateNumber',
          },
          {
            title: 'Status',
            align: 'center',
            render: (_, r) => {
              const color =
                r.status === 'pending'
                  ? 'default'
                  : r.status === 'open'
                  ? 'success'
                  : r.status === 'canceled' || r.status === 'closed'
                  ? 'magenta'
                  : 'warning';
              return (
                <span>
                  <Tag color={color}>{r.status}</Tag>
                </span>
              );
            },
          },

          {
            title: 'Approved By',
            render: (_, r) => {
              return r.approvedBy ? r.approvedBy : '-';
            },
          },
          {
            width: 120,
            title: 'Approved Date',
            align: 'right',
            render: (_, r) => {
              return r.approvedDate ? formatDate(r.approvedDate) : '-';
            },
          },
          access.canAccessTabWarehouse
            ? {
              render: (_, r) => {
                return (
                  ['approved', 'count stock'].includes(r.status) && (
                    <Tooltip title="Edit" key="edit">
                      <EditOutlined
                        style={{ color: '#448DF7' }}
                        onClick={() => {
                          if (r.status === 'count stock') {
                            setCountModal({ open: true, record: r });
                          } else {
                            setAddNewModal({ open: true, record: r });
                          }
                        }}
                      />
                    </Tooltip>
                  )
                );
              },
            }
            : {},
        ]}
      />
      <EditItemEntryModal
        key={`EditItemEntryModal`}
        open={addNewModal.open}
        onCancel={() => setAddNewModal({ open: false, record: undefined })}
        loading={loading}
        data={addNewModal.record}
        actionHandlers={{
          onRejectItem: async (id: number, remark: string) => {
            try {
              const result = await suggestionService.doReject(id, remark);
              message.success(result.message);
            } catch (e: any) {
              message.error(e.toString());
            }
            if (addNewModal.record?.items?.length === 1) {
              setAddNewModal({
                open: false,
                record: undefined,
              });
            }
            setForce({ update: force.update + 1 });
          },
          onReload: () => {
            setAddNewModal({
              open: false,
              record: undefined,
            });
            setForce({ update: force.update + 1 });
          },
          onAddItem: async (item) => {
            await actions.approvalRequest(item);
            setAddNewModal({
              open: false,
              record: undefined,
            });
            setForce({ update: force.update + 1 });
          },
        }}
      />

      <CountStockModal
        key={`CountStockModal`}
        open={countModal.open}
        data={countModal.record}
        actionHandlers={{
          onCancel: () => setCountModal({ open: false, record: undefined }),
          //onCancel={() => setCountModal({ visible: false, record: undefined })},
          onAddItem: async (item) => {
            setCountModal({
              open: false,
              record: undefined,
            });
            await actions.countStock(item);
            setForce({ update: force.update + 1 });
          },
        }}
      />
      <SettlementModal
        key={`SettlementModal`}
        open={settleModal.open}
        data={settleModal.record}
        exchangeRate={exchangeRate}
        dsdExchangeRate={dsdExchangeRate}
        actionHandlers={{
          onCancel: () => setSettleModal({ open: false, record: undefined }),
          onAddItem: async (item) => {
            await actions.onSaveSettlementModel(item);
            setSettleModal({
              open: false,
              record: undefined,
            });
            setForce({ update: force.update + 1 });
          },
        }}
      />

      <RemarkModalForm
        open={remarkState?.visible?.open}
        showAlertInfo
        onCancel={()=>setRemarkState({visible:undefined})}
        status='reject'
        onSave={async (data)=>{
            actions.reject(data).then(o=>{
              message.success("Your rejection request was a success!")
            });
            setRemarkState({visible:undefined});
            actionRef.current?.reload?.();
        }}
      />
      
    </PageContainer>
  );
};

export default SuggestionListView;
