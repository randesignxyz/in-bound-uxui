import { simpleRequestActions } from '@/services/model';
import { ProTable } from '@ant-design/pro-components';

import type { SettlementDto, SettlementLess } from './data';
import { SettlementServiceAPI } from './services';
import numeral from 'numeral';
import { Button, Table, Typography } from 'antd';
import { EyeOutlined } from '@ant-design/icons';
import QuickViewDetail from './QuickViewDetail';
import { useState } from 'react';
import type { ExchangeRate } from '@/services/sale/data';
interface Props {
  // onAdd?: () => void;
  onDetail?: (id?: number) => void;
  //onEdit?: (id: string) => void;
}

export default ({}: Props) => {
  const requestActions = simpleRequestActions();
  const [quickView, setQuickView] = useState<{
    visible: boolean;
    soldExchangeRate?: ExchangeRate;
    settlement?: SettlementLess;
  }>();

  const { Text } = Typography;

  const _render = (parent: SettlementDto) => {
    if (parent.settlements && parent.settlements?.length > 0)
      return (
        <ProTable<SettlementLess>
          size={'small'}
          style={{ backgroundColor: '#EEE' }}
          key={'id'}
          rowKey={(r) => {
            return r.id!!;
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
                      settlement: r,
                      soldExchangeRate: parent.soldExchangeRate,
                    });
                  }}
                />
              ),
            },
            {
              title: 'Salesperson Name',
              render: (_, r) => {
                return `${r.salesperson.salespersonCode} - ${r.salesperson.salespersonName}`;
              },
            },
            // {
            //   title: 'Settled Bank Amount USD',
            //   align: 'right',
            //   render: (_, r) => {
            //     return numeral(r.bankAmount).format('$ 0,0.00');
            //   },
            // },
            {
              title: 'Settled Amount USD',
              align: 'right',
              render: (_, r) => {
                return numeral(r.amount).format('$ 0,0.00');
              },
            },
            {
              title: 'Settled Amount KHM',
              align: 'right',
              render: (_, r) => {
                return ` ${numeral(r.amountKH).format()}`;
              },
            },
            {
              title: 'Exchange Rate',
              align: 'right',
              render: (_, r) => {
                return `៛ ${numeral(
                  r.exchangeRate,
                ).format('0,0')}`;
              },
            },
            {
              title: 'Total Sold Amount',
              align: 'right',
              render: (_, r) => {
                // const total = r.soldAmount * (parent.soldExchangeRate?.target_amount || 0.0);
                // return `${parent.settledExchangeRate?.target_symbol} ${numeral(total).format(
                //   '0,0',
                // )}`;
                return <Typography.Text>$ {numeral(r.soldAmount).format("0,000.00")}</Typography.Text>
              },
            },
            {
              title: 'Total Settled Amount',
              align: 'right',
              render: (_, r) => {
                // const total = r.amountKH + (r.amount + (r.bankAmount || 0.0)) * r.exchangeRate;
                // return `${parent.settledExchangeRate?.target_symbol} ${numeral(total).format(
                //   '0,0',
                // )}`;
                const total = r.amount + (r.amountKH/r.exchangeRate)
                return <Typography.Text type='warning'>$ {numeral(total).format("0,000.00")}</Typography.Text>
              },
            },
          ]}
          summary={(data) => {
            const totalAmount = data.reduce((p,c) =>p + c.amount, 0);
            const totalAmountKH = data.reduce(function (acc, it) {
              return acc + it.amountKH;
            }, 0);
            const bankAmount = data.reduce(function (acc, it) {
              return acc + (it.bankAmount || 0.0) * it.exchangeRate;
            }, 0);
            const settledAmount = data.reduce(function (acc, it) {
              return acc + (it.bankAmount || 0.0 + it.amount) ;
            }, 0);

            const soldAmount = data.reduce(function (acc, it) {
              return acc + it.soldAmount ;
            }, 0);
            return (
              <>
                <Table.Summary.Row>
                  <Table.Summary.Cell index={0} align="right" colSpan={2}>
                    <Text type="success">Total</Text>
                  </Table.Summary.Cell>
                  {/* <Table.Summary.Cell index={1} align="right">
                    <Text type="success">{numeral(bankAmount).format('$ 0,0.00')}</Text>
                  </Table.Summary.Cell> */}
                  <Table.Summary.Cell index={1} align="right">
                    <Text type="success">{numeral(totalAmount).format('$ 0,0.00')}</Text>
                  </Table.Summary.Cell>
                  <Table.Summary.Cell index={2} align="right">
                    <Text type="success">
                      ៛​ {numeral(totalAmountKH).format('0,0')}
                    </Text>
                  </Table.Summary.Cell>
                  <Table.Summary.Cell index={4} align="right" />
                  <Table.Summary.Cell index={5} align="right">
                    <Text type="success">
                      $ {numeral(soldAmount).format('0,0.00')}
                    </Text>
                  </Table.Summary.Cell>
                  <Table.Summary.Cell index={6} align="right">
                    <Text type="success">
                      $ {numeral(settledAmount).format('0,0.00')}
                    </Text>
                  </Table.Summary.Cell>
                  
                </Table.Summary.Row>
              </>
            );
          }}
          headerTitle={false}
          search={false}
          options={false}
          dataSource={parent.settlements}
          pagination={false}
        />
      );
    else
      return (
        <div
          key={parent.settlementDate}
          style={{ textAlign: 'center', fontWeight: 'bold', color: 'gray' }}
        >
          No Data
        </div>
      );
  };

  return (
    <>
      <ProTable<SettlementDto>
        search={false}
        options={false}
        rowKey={'settlementDate'}
        expandable={{ expandedRowRender: _render }}
        request={async (
          params: {
            pageSize?: number;
            current?: number;
            keyword?: string;
          },
          //   sort: Record<string, SortOrder>,
        ) => {
          const result = await SettlementServiceAPI.settlementPage({
            // criteria: { sort: sort },
            pagination: {
              pageSize: params.pageSize,
              current: params.current,
            },
          }).query(requestActions);

          return {
            success: !!result,
            total: result?.total,
            data: result?.items.map((it: SettlementDto) => it).filter((it: any) => !!it),
          };
        }}
        //dataSource={product?.ingredients}
        columns={[
          {
            title: 'Settlement Date',
            dataIndex: 'settlementDate',
          },
          {
            title: 'Total Invoice',
            align: 'right',
            dataIndex: 'totalInvoice',
          },
          {
            title: 'Total Quantity',
            align: 'right',
            render: (_, r) => {
              return `${r.totalQty} ${r.uom}`;
            },
          },
          {
            title: 'Sold Amount',
            align: 'right',
            render: (_, r) => {
              // const total = (r.soldExchangeRate?.target_amount || 0.0) * r.totalSoldAmount;
              // return r.soldExchangeRate? `${r.settledExchangeRate?.target_symbol} ${numeral(total).format('0,0')}`:0;
              return <Typography.Text type='success'>$ {numeral(r.totalSoldAmount).format("0,000.00")}</Typography.Text>
            },
          },
          {
            title: 'Settled Amount',
            align: 'right',
            render: (_, r) => {
              // const total = (r.soldExchangeRate?.target_amount || 0.0) * r.totalSoldAmount;
              // return `${r.settledExchangeRate?.target_symbol} ${numeral(total).format('0,0')}`;
              return <Typography.Text type='success'>$ {numeral(r.totalSettledAmount).format("0,000.00")}</Typography.Text>
            },
          },
        ]}
      />
      <QuickViewDetail
        title={'Settlement View'}
        width={700}
        drawerProps={{
          onClose:()=>setQuickView({ visible: false, settlement: undefined, soldExchangeRate: undefined })
        }}
        open={quickView?.visible}
        soldExchangeRate={quickView?.soldExchangeRate}
        settlement={quickView?.settlement}
        // onClose={() =>
        //   setQuickView({ visible: false, settlement: undefined, soldExchangeRate: undefined })
        // }
      />
    </>
  );
};
