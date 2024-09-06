import { simpleRequestActions } from '@/services/model';
import { ProTable } from '@ant-design/pro-components';
import { Button } from 'antd';
import type { StockControlARLess } from './data';
import type { StockControlAR } from './data';
import { DailyReportAPI } from './services';
import numeral from 'numeral';
import { EyeOutlined } from '@ant-design/icons';
import { formatDate } from '@/pages/utils';
import QuickViewDetail from './QuickViewDetail';
import { useState } from 'react';
import type { ExchangeRate } from '@/services/sale/data';

interface Props {}

export default ({}: Props) => {
  const requestActions = simpleRequestActions();
  const [quickView, setQuickView] = useState<{
    visible: boolean;
    soldExchangeReate?: ExchangeRate;
    stockControl?: StockControlARLess;
  }>();

  //   const { Text } = Typography;

  const _render = (parent: StockControlAR) => {
    if (parent.stockControls && parent.stockControls?.length > 0)
      return (
        <ProTable<StockControlARLess>
          size={'small'}
          style={{ backgroundColor: '#EEE' }}
          key={'id'}
          rowKey={(r) => {
            return r.id;
          }}
          columns={[
            {
              render: (_, r) => (
                <Button
                  type="link"
                  icon={<EyeOutlined />}
                  onClick={async () => {
                    setQuickView({
                      visible: true,
                      stockControl: r,
                      soldExchangeReate: parent.soldExchangeRate,
                    });
                  }}
                />
              ),
            },
            {
              title: 'Owner',
              dataIndex: 'owner',
            },
            {
              title: 'Requested Date',
              render: (_, r) => {
                return formatDate(r.requestedDate);
              },
            },
            {
              title: 'Plate Number',
              align: 'center',
              dataIndex: 'plateNumber',
            },
            {
              title: '# Invoices',
              align: 'center',
              render: (_, r) => {
                return r.invoices?.length || 'N/A';
              },
            },
            {
              title: 'Settled Amount KHM',
              align: 'right',
              render: (_, r) => {
                return `៛ ${numeral( r.totalSettledAmount).format('0,000')}`;
              },
            },
            {
              title: 'Sold Amount ',
              align: 'right',
              render: (_, r) => {
                const amountKH = r.totalSoldAmount ;
                return `$ ${numeral(amountKH).format('0,000.00')}`;
              },
            },
          ]}
          headerTitle={false}
          search={false}
          options={false}
          dataSource={parent.stockControls}
          pagination={false}
        />
      );
    else
      return (
        <div
          key={parent.stockControls}
          style={{ textAlign: 'center', fontWeight: 'bold', color: 'gray' }}
        >
          No Data
        </div>
      );
  };

  return (
    <>
      <ProTable<StockControlAR>
        search={false}
        options={false}
        rowKey={'requestedDate'}
        expandable={{ expandedRowRender: _render }}
        request={async (
          params: {
            pageSize?: number;
            current?: number;
            keyword?: string;
          },
          //   sort: Record<string, SortOrder>,
        ) => {
          const result = await DailyReportAPI.queryPage({
            // criteria: { sort: sort },
            pagination: {
              pageSize: params.pageSize,
              current: params.current,
            },
          }).query(requestActions);

          return {
            success: !!result,
            total: result?.total,
            data: result?.items.map((it: StockControlAR) => it).filter((it: any) => !!it),
          };
        }}
        //dataSource={product?.ingredients}
        columns={[
          {
            title: 'Requested Date',
            dataIndex: 'requestedDate',
          },
          {
            title: '# Invoices',
            align: 'right',
            dataIndex: 'totalInvoice',
          },
          {
            title: 'Total Quantity',
            align: 'right',
            render: (_, r) => {
              return `${r.totalSoldQty} ${r.uom}`;
            },
          },
          {
            title: 'Total Settled Amount KHM',
            align: 'right',
            render: (_, r) => {
              return `៛  ${numeral(r.totalSettledAmount).format('0,0')}`;
            },
          },
          {
            title: 'Total Sold Amount ',
            align: 'right',
            render: (_, r) => {
              return `$ ${numeral(r.totalSoldAmount).format(
                '0,000.00',
              )}`;
            },
          },
        ]}
      />
      <QuickViewDetail
        title={'Stock Control Quick View'}
        width={700}
        destroyOnClose
        placement={'right'}
        open={quickView?.visible}
        soldExchangeRate={quickView?.soldExchangeReate}
        stockControl={quickView?.stockControl}
        onClose={() =>
          setQuickView({ visible: false, stockControl: undefined, soldExchangeReate: undefined })
        }
      />
    </>
  );
};
