import type { DescriptionDisplayDataItem } from '@/components/Descriptions';
import DescriptionDisplay from '@/components/Descriptions';
import { formatDate, formatDateTime } from '@/pages/utils';
import type { DrawerProps } from 'antd';
import { Table } from 'antd';
import { Typography } from 'antd';
import { Card } from 'antd';
import { Drawer } from 'antd';
import type { SettlementLess } from './data';
import numeral from 'numeral';
import type { ExchangeRate } from '@/services/sale/data';
import { DrawerForm, DrawerFormProps, ProTable } from '@ant-design/pro-components';
import type { SalesInvoiceAR, SalesInvoiceItemAR } from '../daily_report/data';

interface Prop extends DrawerFormProps {
  settlement?: SettlementLess;
  soldExchangeRate?: ExchangeRate;
}

export default (props: Prop) => {
  const { settlement, soldExchangeRate } = props;
  const { Text } = Typography;

  const settlementInfo: (DescriptionDisplayDataItem | undefined)[] = [
    {
      label: 'Salesperson',
      value: `${settlement?.salesperson.salespersonCode} - ${settlement?.salesperson.salespersonName}`,
    },
    { label: '', value: '' },
    { label: 'Settled Date', value: formatDate(settlement?.settlementDate) },
    // { label: '', value: '' },
    //{ label: 'Sold Quantity', value: `${settlement?.totalQty} ${settlement?.uom}` },
    { label: 'Cashier Name', value: settlement?.cashierName },
    {
      label: 'Exchange Rate',
      value: `${soldExchangeRate?.target_symbol} ${soldExchangeRate?.target_amount}`,
    },

    {
      label: 'Bank Amount USD',
      value: numeral(settlement?.bankAmount).format('$ 0,0.00'),
    },

    {
      label: 'Amount USD',
      value: numeral(settlement?.amount).format('$ 0,0.00'),
    },

    {
      label: 'Amount KHM',
      value: `${soldExchangeRate?.target_symbol} ${numeral(settlement?.amountKH).format('0,0')}`,
    },
    {
      label: 'Settled Amount',
      value: `${soldExchangeRate?.target_symbol} ${numeral(
        ((settlement?.bankAmount || 0.0) + (settlement?.amount || 0.0)) *
          (settlement?.exchangeRate || 0.0) +
          (settlement?.amountKH || 0.0),
      ).format('0,0')}`,
    },
    {
      label: 'Sold Amount',
      value: `${soldExchangeRate?.target_symbol} ${
        (settlement?.soldAmount || 0.0) * (soldExchangeRate?.target_amount || 0.0)
      }`,
    },
  ];

  const _render = (parent: SalesInvoiceAR) => {
    if (parent.items && parent.items?.length > 0)
      return (
        <ProTable<SalesInvoiceItemAR>
          size={'small'}
          style={{ backgroundColor: '#EEE' }}
          key={'id'}
          rowKey={(r) => {
            return r.id!!;
          }}
          headerTitle={false}
          search={false}
          options={false}
          dataSource={parent.items}
          pagination={false}
          columns={[
            {
              title: 'Description',
              width: '230px',
              render: (_, r) => {
                return `${r.code} - ${r.name}`;
              },
            },
            {
              title: 'Quantity',
              align: 'center',
              dataIndex: 'quantity',
            },
            {
              title: 'Unit Price',
              align: 'right',
              render: (_, r) => {
                return `$ ${numeral(r.unitPrice).format('0,000.00')}`;
              },
            },
            {
              title: 'Amount',
              align: 'right',
              render: (_, r) => {
                return `$ ${numeral(r.unitPrice  * r.quantity).format('0,000.00')}`;
              },
            },
          ]}
          summary={(data) => {
            const totalAmount = data.reduce((acc, it) =>( acc + (it.quantity *it.unitPrice)),0) ?? 0.00;

            return (
              <>
                <Table.Summary.Row>
                  <Table.Summary.Cell index={0} align="right" colSpan={2}>
                    <Text type="warning">Total</Text>
                  </Table.Summary.Cell>
                  <Table.Summary.Cell index={1} align="right" colSpan={2}>
                    <Text type="warning">
                      $ {numeral(totalAmount).format('0,000.00')}
                    </Text>
                  </Table.Summary.Cell>
                </Table.Summary.Row>
              </>
            );
          }}
        />
      );
    else
      return (
        <div
          key={formatDateTime(parent.invoiceDate)}
          style={{ textAlign: 'center', fontWeight: 'bold', color: 'gray' }}
        >
          No Data
        </div>
      );
  };

  return (
    <DrawerForm {...props}
      resize
    >
      <Card size="small" title="General">
        <DescriptionDisplay column={2} data={settlementInfo} />
      </Card>
      <ProTable<SalesInvoiceAR>
        size={'small'}
        title={() => <Text type="success">Sale Invoices</Text>}
        dataSource={settlement?.invoices}
        style={{ backgroundColor: '#EEE' }}
        rowKey={(r) => {
          return `Invoice - ${r.id || 0}`;
        }}
        headerTitle={false}
        search={false}
        options={false}
        pagination={false}
        expandable={{ expandedRowRender: _render }}
        columns={[
          {
            title: 'Invoice No',
            dataIndex: 'invoiceNo',
          },
          {
            title: 'Invoice Date',
            render: (_, r) => {
              return formatDate(r.invoiceDate);
            },
          },
          {
            title: 'Salesperson',
            dataIndex: 'salesperson',
          },
          {
            title: 'Amount',
            align: 'right',
            render: (_, r) => {
              return `$ ${numeral(r.amount).format('0,000.00')}`;
            },
          },
        ]}
        summary={(data) => {
          const total =data?.reduce((acc, it) =>( acc + it.amount),0) ?? 0;
          return (
            <>
              <Table.Summary.Row>
                <Table.Summary.Cell index={0} align="right" colSpan={4}>
                  <Text type="success">Total Amount</Text>
                </Table.Summary.Cell>
                <Table.Summary.Cell index={1} align="right">
                  <Text type="success">
                    $ {numeral(total).format('0,000.00')}
                  </Text>
                </Table.Summary.Cell>
              </Table.Summary.Row>
            </>
          );
        }}
      />
    </DrawerForm>
  );
};
