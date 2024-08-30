import { formatDate } from '@/pages/utils';
import type { Paging } from '@/services/API';
import type { ExchangeRate, StockControlDetailDto } from '@/services/sale/data';
import type { ActionType } from '@ant-design/pro-table';
import ProTable from '@ant-design/pro-table';
import { Card, Typography } from 'antd';
import { useEffect, useRef } from 'react';
import { history } from "@umijs/max";
import { SalePaths } from '../..';
import { Model } from '../model';
import numeral from 'numeral';
const {Text } = Typography

type Props = {
  data: {
    id: number;
    forceUpdate?: number;
    dsdExchangeRate?: ExchangeRate;
  };
};

const HistoryTabItem: React.FC<Props> = ({ data }) => {
  const { actions } = Model();
  const actionRef = useRef<ActionType>();

  useEffect(() => {
    if (data.forceUpdate) actionRef.current?.reload();
  }, [data.forceUpdate]);

  const onRequestHandler = (
    //criteria?: { stockControlId: number; searchValue?: string },
    pagination?: {
      pageSize?: number;
      current?: number;
    },
    //sort?: Record<string, SortOrder>,
  ) => {
    // return actions.loadSaleInvoiceWithStockControl?.(criteria, pagination, sort).then((it) => {
    //   return it;
    // }) as Promise<Paging<StockControlDetailDto>>;
    return actions.history(data?.id, pagination).then((it) => {
      return it;
    }) as Promise<Paging<StockControlDetailDto>>;
  };

  return (
    <Card size="small">
      <ProTable<StockControlDetailDto>
        actionRef={actionRef}
        size="small"
        // dataSource={data?.histories}
        rowKey="id"
        pagination={{
          pageSize: 10,
        }}
        bordered={false}
        search={false}
        options={{
          setting: false,
          density: false,
          fullScreen: false,
          reload: false,
        }}
        columns={[
          {
            title: 'Requested Date',
            render: (_, r) => {
              return (
                <a onClick={() => history.push(`${SalePaths.stock}/detail/${r.id}`)}>
                  {formatDate(r.requestDate, 'DD-MM-YYYY')}
                </a>
              );
            },
          },
          {
            title: 'Source',
            align: 'center',
            dataIndex: 'stockControlType',
          },
          {
            title: 'Begin Stock',
            align: 'right',
            render: (_, r) => {
              const it = r.transactions[0];
              const beginQty = it !== null ? it?.beginningQty || 0 : 0;
              // return `${numeral(beginQty).format('0,0')} CASE${beginQty > 1 ? 'S' : ''}`;
              return numeral(beginQty).format('0,0');
            },
          },

          {
            title: 'Req. Stock',
            align: 'right',
            render: (_, r) => {
              const it = r.transactions[0];
              const reqQty = it !== null ? it?.quantity : 0;
              // return `${numeral(reqQty).format('0,0')} CASE${reqQty > 1 ? 'S' : ''}`;
              return numeral(reqQty).format('0,0');
            },
          },

          {
            title: 'Sold Stock',
            align: 'right',
            render: (_, r) => {
              const it = r.transactions[0];
              const soldQty = it !== null ? it?.soldQty || 0 : 0;
              // return `${numeral(soldQty).format('0,0')} CASE${soldQty > 1 ? 'S' : ''}`;
              return <Text type='danger'>({numeral(soldQty).format('0,0')})</Text>
            },
          },
          {
            title: 'End Stock',
            align: 'right',
            render: (_, r) => {
              const it = r.transactions[0];
              const beginQty = it !== null ? it?.beginningQty || 0 : 0;
              const reqQty = it !== null ? it?.quantity : 0;
              const soldQty = it !== null ? it?.soldQty || 0 : 0;
              const endQty = (beginQty + reqQty - soldQty);
              // return `${numeral(endQty).format('0,0')} CASE${endQty > 1 ? 'S' : ''}`;
              return numeral(endQty).format('0,0');
            },
          },

          {
            title: 'Sold Amount',
            align: 'right',
            render: (_, r) => {
              // const total = r.soldAmount * (data.dsdExchangeRate?.target_amount || 0);
              return <Text type='success' >{`$ ${numeral(r.soldAmount).format('0,000.00')}`}</Text>
            },
          },
          { title: 'Status', dataIndex: 'status', align: 'center' },
          // { title: 'Quantity', dataIndex: 'actualQty', align: 'right' },
          // { title: 'UOM', dataIndex: 'uom' },
          //{ title: 'Expired Date', render: (_, r) => formatDate(r.expiredDate) },
        ]}
        request={async (
          params: {
            pageSize?: number;
            current?: number;
            keyword?: string;
          },
          //sort: Record<string, SortOrder>,
        ) => {
          //   const searchParams = onSearchCriteria(params.keyword) || {
          //     searchValue: params.keyword,
          //   };
          //   const data = await onRequestHandler(searchParams, params, sort);
          const result = await onRequestHandler(params);
          return {
            success: !!result,
            total: result?.total,
            data: result?.items.map((it: StockControlDetailDto) => it).filter((it: any) => !!it),
          };
        }}
      />
    </Card>
  );
};

export default HistoryTabItem;
