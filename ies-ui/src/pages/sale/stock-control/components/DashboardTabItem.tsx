import vital from '@/assets/logo.svg';
import mee from '@/assets/mee.png';
import posm from '@/assets/stock.png';
import { formatDate, formatDateTime } from '@/pages/utils';
import type { Paging } from '@/services/API';
// import {
//   BarChartOutlined,
//   EllipsisOutlined,
//   PieChartOutlined,
//   PlusOutlined,
//   RetweetOutlined,
// } from '@ant-design/icons';
import type { LookupDataItem } from '@/services/data';
import type { StockControlDetail, StockDetailLess, TransactionDetail } from '@/services/sale/data';
import type { ColumnConfig } from '@ant-design/plots';
import { Column, Gauge } from '@ant-design/plots';
import type { ActionType } from '@ant-design/pro-table';
import ProTable from '@ant-design/pro-table';
import { Card, Image, Input, Row, Skeleton, Space, Tag } from 'antd';
import type { SortOrder } from 'antd/lib/table/interface';
import { uniqueId } from 'lodash';
import numeral from 'numeral';
import { useEffect, useRef, useState } from 'react';
import { Model } from '../model';
import style from './style.less';

type Props = {
  forceUpdate: number;
  data: {
    id: number;
    details?: StockControlDetail;
    types?: LookupDataItem[];
    loading: boolean | undefined;
    stockItems?: StockDetailLess[];
  };
  // actionHandlers?: {
  //   onTransferMoney?: () => void;
  //   onAddItem?: (id: number, name: string) => void;
  // };
};

const DashboardTabItem: React.FC<Props> = ({ forceUpdate, data }) => {
  const [searchValue, setSearchValue] = useState<string>();
  const innerActionRef = useRef<ActionType>();
  const { actions } = Model();

  const onSearchCriteria = (value: string | undefined) => {
    return { stockControlId: data.id, searchValue: value };
  };

  useEffect(() => {
    if (forceUpdate) {
      innerActionRef.current?.reload();
    }
  }, [forceUpdate]);

  const onSearchHandler = (value: string) => {
    setSearchValue(value);
    innerActionRef.current?.reloadAndRest?.();
  };

  const onRequestHandler = (
    criteria?: { stockControlId: number; searchValue?: string },
    pagination?: {
      pageSize?: number;
      current?: number;
    },
    sort?: Record<string, SortOrder>,
  ) => {
    return actions.loadTransaction?.(criteria, pagination, sort).then((it) => {
      return it;
    }) as Promise<Paging<TransactionDetail>>;
  };

  // const getTotalByType = (typeId: number) => {
  //   const stockQty = data.details?.transactions.find((it) => it.itemType === typeId);
  //   return stockQty === null ? '' : (stockQty.beginningQty || 0) + stockQty.quantity;
  // };

  const getTotalSaleOutByType = (typeId: number) => {
    const stockQty = data.details?.transactions.find((it) => it.itemType === typeId);
    return stockQty === undefined ? '' : stockQty.soldQty;
  };

  const getTotalCurrentQty = (typeId: number) => {
    const stockQty = data.details?.transactions.find((it) => it.itemType === typeId);
    return stockQty === undefined
      ? ''
      : (stockQty.beginningQty || 0) + stockQty.quantity - (stockQty.soldQty || 0);
  };

  const expandedRowRender = (parent: TransactionDetail) => {
    return parent.items.length > 0 ? (
      <ProTable
        size={'small'}
        style={{ backgroundColor: '#EEE' }}
        key={parent.id}
        rowKey={'id'}
        columns={[
          { title: 'Batch No', dataIndex: 'batchNo' },
          {
            title: 'Description',
            render: (_, r) => {
              return `${r.itemCode} - ${r.itemName}`;
            },
            key: 'id',
          },
          { title: 'Previous Qty', dataIndex: 'previousQty' },
          { title: 'Request Qty', dataIndex: 'requestQty' },
          { title: 'Current Qty', dataIndex: 'currentQty' },
          {
            title: 'Expired Date',
            render: (_, r) => {
              return r.expiredDate ? formatDate(r.expiredDate, 'DD-MM-YYYY') : '-';
            },
          },
          {
            key: 'status',
            title: 'Status',
            dataIndex: 'status',
            render: (_, r) => {
              const color =
                r.status === 'approve' ? 'lime' : r.status === 'pending' ? 'default' : 'blue';
              const str =
                r.status === 'approve' ? 'Approve' : r.status === 'pending' ? 'Pending' : 'Completed';
              return (
                <span>
                  <Tag color={color}>{str}</Tag>
                </span>
              );
            },
          },
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
  //style={{ width: '70%', marginBottom: 16 }}
  return (
    <>
      <Card size="small" title="Figure" style={{ marginBottom: 10 }}>
        <Row justify="center">
          <Row style={{ width: '55%', marginBottom: 16 }} justify="space-between">
            {data.details?.transactions
              .filter((it) => it.itemType === 132)
              .map((it) => {
                const config = {
                  width: 250,
                  height: 200,
                  percent: (it.soldQty || 0) / ((it.beginningQty || 0) + it.quantity),
                  range: {
                    // ticks: [0, 1 / 3, 2 / 3, 1],
                    // color: ['#F4664A', '#FAAD14', '#30BF78'],
                    ticks: [0, 1],
                    color: ['l(0) 0:#F4664A 0.5:#FAAD14 1:#30BF78'],
                  },
                  indicator: {
                    pointer: {
                      style: {
                        stroke: '#D0D0D0',
                      },
                    },
                    pin: {
                      style: {
                        stroke: '#D0D0D0',
                      },
                    },
                  },
                  statistic: {
                    title: {
                      offsetY: -8,
                      style: {
                        fontSize: '12px',
                        color: '#4B535E',
                      },
                      formatter: () =>
                        it.itemType === 132
                          ? 'Sale Mee Chiet'
                          : it.itemType === 131
                          ? 'Sale Vital'
                          : 'Merchandise',
                    },
                    content: {
                      style: {
                        fontSize: '14px',
                        //lineHeight: '12px',
                        lineHeight: '50px',
                      },
                      formatter: () => {
                        return numeral(
                          (it.soldQty || 0) / ((it.beginningQty || 0) + it.quantity),
                        ).format('% 0.00');
                      },
                    },
                  },
                };
                return <Gauge key={uniqueId()} {...config} />;
              })}
            {data.stockItems
              ?.filter((it) => it.typeId === 132)
              .flatMap((it) => {
                const resultBegin: { item: string; type: string; value: number }[] = [];
                it.items.reduce(function (res, value) {
                  const item = it.items.filter((it2) => it2.itemId === value.itemId)[0];
                  if (!res[value.itemId]) {
                    res[value.itemId] = {
                      item: item.itemName,
                      type: 'Begin Quantity',
                      value: 0,
                    };
                    resultBegin.push(res[value.itemId]);
                  }
                  res[value.itemId].value += value.beginningQty;
                  return res;
                }, {});

                const resultSole: { item: string; type: string; value: number }[] = [];
                it.items.reduce(function (res, value) {
                  const item = it.items.filter((it2) => it2.itemId === value.itemId)[0];
                  if (!res[value.itemId]) {
                    res[value.itemId] = {
                      item: item.itemName,
                      type: 'Sold Quantity',
                      value: 0,
                    };
                    resultSole.push(res[value.itemId]);
                  }
                  res[value.itemId].value += value.soldQty;
                  return res;
                }, {});

                const resultCurrent: { item: string; type: string; value: number }[] = [];
                it.items.reduce(function (res, value) {
                  const item = it.items.filter((it2) => it2.itemId === value.itemId)[0];
                  if (!res[value.itemId]) {
                    res[value.itemId] = {
                      item: item.itemName,
                      type: 'Current Quantity',
                      value: 0,
                    };
                    resultCurrent.push(res[value.itemId]);
                  }
                  res[value.itemId].value += value.actualQty;
                  return res;
                }, {});
                // const data = resultBegin.concat(resultSole).concat(resultCurrent);

                const config: ColumnConfig = {
                  data: resultBegin.concat(resultSole).concat(resultCurrent),
                  width: 500,
                  height: 200,
                  xField: 'item',
                  yField: 'value',
                  seriesField: 'type',
                  isGroup: true,
                  columnStyle: {
                    radius: [20, 20, 0, 0],
                  },
                  maxColumnWidth: 20,
                  minColumnWidth: 10,
                };
                // console.log(data);
                return <Column {...config} />;
                // return <Descriptions title="hello" />;
              })}
          </Row>
        </Row>
      </Card>
      <Card size="small" title="Transaction" style={{ marginBottom: 10 }}>
        {data.types && (
          <Row justify="center">
            <Row style={{ width: '40%', marginBottom: 16 }} justify="space-between">
              {/* <Card
                className={style.fabShadow}
                style={{ width: 170, height: 170 }}
                // actions={[
                //   <Tooltip placement="top" title="Deposit Money">
                //     <RetweetOutlined key="depositMoney" onClick={actionHandlers?.onTransferMoney} />
                //   </Tooltip>,
                //   <PieChartOutlined key="detail" onClick={() => message.info('piechart')} />,
                //   <EllipsisOutlined key="ellipsis" onClick={() => message.info('detail')} />,
                // ]}
              >
                <Skeleton className={style.skeletonClass} loading={data.loading} avatar active>
                  <Row justify="center">
                    <Image src={cashOnHand} height={50} preview={false} />
                  </Row>
                  <p style={{ fontWeight: 'bold', marginBottom: 0, textAlign: 'center' }}>
                    Cash on hand
                  </p>
                  <p
                    style={{
                      color: '#58565C',
                      fontWeight: 'bold',
                      textAlign: 'center',
                      marginTop: 0,
                      marginBottom: 0,
                    }}
                  >
                    {numeral(data.details?.cashOnHand).format('$ 0,0.00')}
                  </p>
                </Skeleton>
              </Card> */}
              {data.types?.map((it) => {
                return (
                  <Card
                    key={it.key}
                    className={style.fabShadow}
                    style={{ width: 170, height: 170 }}
                    // actions={[
                    //   <Tooltip placement="top" title={`Add ${it.name} items`}>
                    //     <PlusOutlined
                    //       key="add"
                    //       onClick={() => {
                    //         actionHandlers &&
                    //           actionHandlers.onAddItem &&
                    //           actionHandlers.onAddItem(it.id, it.name);
                    //       }}
                    //     />
                    //   </Tooltip>,
                    //   <BarChartOutlined key="barChart" onClick={() => message.info(it.id)} />,
                    //   <EllipsisOutlined key="ellipsis" onClick={() => message.info(it.id)} />,
                    // ]}
                  >
                    <Skeleton className={style.skeletonClass} loading={data.loading} avatar active>
                      <Row justify="center">
                        <Image
                          preview={false}
                          src={it.id === 131 ? vital : it.id === 132 ? mee : posm}
                          height={50}
                        />
                      </Row>
                      <p style={{ fontWeight: 'bold', marginBottom: 0, textAlign: 'center' }}>
                        {it.name}
                      </p>
                      {/* <p
                        style={{
                          color: '#58565C',
                          fontWeight: 'bold',
                          textAlign: 'center',
                          marginTop: 0,
                          marginBottom: 0,
                        }}
                      >
                        {getTotalByType(it.id) !== '' && (
                          <>
                            Total: {getTotalByType(it.id)}&nbsp;
                            <span style={{ fontSize: 9, fontWeight: 'bold' }}>
                              {it.id === 133 ? 'UNIT' : 'CASE'}
                            </span>
                          </>
                        )}
                      </p> */}
                      <p
                        style={{
                          color: '#58565C',
                          fontWeight: 'bold',
                          textAlign: 'center',
                          marginTop: 0,
                          marginBottom: 0,
                        }}
                      >
                        {getTotalCurrentQty(it.id) !== '' && (
                          <>
                            Current: {getTotalCurrentQty(it.id)}&nbsp;
                            <span style={{ fontSize: 9, fontWeight: 'bold' }}>
                              {getTotalCurrentQty(it.id) !== ''
                                ? it.id === 133
                                  ? 'UNIT'
                                  : 'CASE'
                                : ''}
                            </span>
                          </>
                        )}
                      </p>
                      <p
                        style={{
                          color: '#58565C',
                          fontWeight: 'bold',
                          textAlign: 'center',
                          marginTop: 0,
                          marginBottom: 0,
                        }}
                      >
                        {getTotalSaleOutByType(it.id) !== '' && (
                          <>
                            Sold: {getTotalSaleOutByType(it.id)}&nbsp;
                            <span style={{ fontSize: 9, fontWeight: 'bold' }}>
                              {getTotalSaleOutByType(it.id) !== ''
                                ? it.id === 133
                                  ? 'UNIT'
                                  : 'CASE'
                                : ''}
                            </span>
                          </>
                        )}
                      </p>
                    </Skeleton>
                  </Card>
                );
              })}
            </Row>
          </Row>
        )}

        <ProTable<TransactionDetail, { stockControlId: number; searchValue?: string }>
          actionRef={innerActionRef}
          expandable={{ expandedRowRender }}
          key={'transaction'}
          rowKey={'id'}
          columns={[
            {
              title: 'Transaction Date',
              key: 'id',
              render: (_, r) => {
                return formatDateTime(r.createdDate);
              },
            },

            {
              title: 'Previous Value',
              render: (_, r) => {
                const formatString = r.transactionType === 'top-up' ? '$ 0,0.00' : '0,0';
                return numeral(r.previousValue).format(formatString);
              },
            },
            {
              title: 'Transaction Value',
              render: (_, r) => {
                const formatString = r.transactionType === 'top-up' ? '$ 0,0.00' : '0,0';
                return numeral(r.transactionValue).format(formatString);
              },
            },
            {
              title: 'Current Value',
              render: (_, r) => {
                const formatString = r.transactionType === 'top-up' ? '$ 0,0.00' : '0,0';
                return numeral(r.currentValue).format(formatString);
              },
            },
            {
              title: 'Transaction Type',
              // dataIndex: 'status',
              render: (_, r) => {
                const color =
                  r.transactionType === 'top-up'
                    ? 'default'
                    : r.transactionType === 'approved'
                    ? 'success'
                    : r.transactionType === 'transfer'
                    ? 'blue'
                    : r.transactionType === 'sold'
                    ? 'magenta'
                    : 'warning';
                return (
                  <span>
                    <Tag color={color}>{r.transactionType}</Tag>
                  </span>
                );
              },
            },
            {
              title: 'Status',
              render: (_, r) => {
                const color =
                  r.status === 'COMPLETED'
                    ? 'success'
                    : r.status === 'approved'
                    ? 'default'
                    : r.status === 'canceled'
                    ? 'magenta'
                    : 'warning';
                const str = r.status === 'COMPLETED' ? 'Completed' : 'Pending';
                return (
                  <span>
                    <Tag color={color}>{str}</Tag>
                  </span>
                );
              },
            },
          ]}
          options={{
            density: false,
            setting: false,
            search: true ?? (
              <Space size={[1, 'small']}>
                <Input.Search allowClear onSearch={onSearchHandler} />
              </Space>
            ),
          }}
          size="small"
          search={false}
          request={async (
            params: {
              pageSize?: number;
              current?: number;
              keyword?: string;
            },
            sort: Record<string, SortOrder>,
          ) => {
            const searchParams = onSearchCriteria(searchValue) || { searchValue: searchValue };
            const result = await onRequestHandler(searchParams, params, sort);
            return {
              success: !!result,
              total: result?.total,
              data: result?.items.map((it: TransactionDetail) => it).filter((it: any) => !!it),
            };
          }}
          // pagination={pagination}
        />
      </Card>
    </>
  );
};

export default DashboardTabItem;
