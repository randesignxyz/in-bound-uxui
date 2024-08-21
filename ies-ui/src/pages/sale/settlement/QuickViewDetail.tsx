import type { DescriptionDisplayDataItem } from '@/components/Descriptions';
import DescriptionDisplay from '@/components/Descriptions';
import { formatDate, formatDateTime } from '@/pages/utils';
import { Flex, Table } from 'antd';
import { Typography } from 'antd';
import { Card } from 'antd';
import type { SettlementLess } from './data';
import numeral from 'numeral';
import type { ExchangeRate } from '@/services/sale/data';
import { DrawerForm, DrawerFormProps, ProTable } from '@ant-design/pro-components';
import type { SalesInvoiceAR, SalesInvoiceItemAR } from '../daily_report/data';
import React from 'react';

interface Prop extends DrawerFormProps {
  settlement?: SettlementLess;
  soldExchangeRate?: ExchangeRate;
}

const QuickViewDetail: React.FC<Prop> = ({ settlement, soldExchangeRate, ...props }) => {
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
      value: ` ${settlement?.exchangeRate}`,
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
      value: ` ${numeral(settlement?.amountKH).format('0,0')}`,
    },
    {
      label: 'Settled Amount',
      value: `$ ${numeral(settlement?.amount || 0 + ((settlement?.amountKH || 0) / (settlement?.exchangeRate || 0) || 0)).format('0,0.00')}`,
    },
    {
      label: 'Sold Amount',
      value: `$ ${numeral(settlement?.soldAmount || 0.0).format("0,000.00")}`
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
                return `$ ${numeral(r.unitPrice * r.quantity).format('0,000.00')}`;
              },
            },
          ]}
          summary={(data) => {
            const totalAmount = data.reduce((acc, it) => (acc + (it.quantity * it.unitPrice)), 0) ?? 0.00;

            return (
              <>
                <Table.Summary.Row>
                  <Table.Summary.Cell index={0} align="right" colSpan={2}>
                    <Typography.Text type="warning">Total</Typography.Text>
                  </Table.Summary.Cell>
                  <Table.Summary.Cell index={1} align="right" colSpan={2}>
                    <Typography.Text type="warning">
                      $ {numeral(totalAmount).format('0,000.00')}
                    </Typography.Text>
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
      <Flex gap={10} vertical>
        <Card size="small" title="General">
          <DescriptionDisplay column={2} data={settlementInfo} />
        </Card>
        {/* <Card size='small' title="General">
          <ProDescriptions
            column={2}
            dataSource={settlement}
            columns={[
              {
                title:"Saleperson",
                dataIndex:"",
                render:(_,r)=>[r?.salesperson.salespersonCode,r?.salesperson.salespersonName].filter(o=>o).join(" - ")
              },
              {
                title:"Settled Date",
                render:(_,r)=>formatDate(settlement?.settlementDate)
              },
              {
                title:"Cashier Name",
                render:(_,r)=>settlement?.cashierName
              },
              {
                title:"Amount (USD)",
                render:(_,r)=>settlement?.amount
              },
              {
                title:"Amount (KHM)",
                render:(_,r)=>settlement?.amountKH
              },
              {
                title:"Sold Amount",
                render:(_,r)=><Typography.Text type='success'>$ {numeral(settlement?.soldAmount)}</Typography.Text>
              },
              {
                title:"Settled Amount",
                render:(_,r)=><Typography.Text type='warning'>$ {numeral(settlement?.amount)}</Typography.Text>
              },
              
            ]}
          />
      </Card> */}
        <ProTable<SalesInvoiceAR>
          size={'small'}
          title={() => <Typography.Text type="success">Sale Invoices</Typography.Text>}
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
            const total = data?.reduce((acc, it) => (acc + it.amount), 0) ?? 0;
            return (
              <>
                <Table.Summary.Row>
                  <Table.Summary.Cell index={0} align="right" colSpan={4}>
                    <Typography.Text type="success">Total Amount</Typography.Text>
                  </Table.Summary.Cell>
                  <Table.Summary.Cell index={1} align="right">
                    <Typography.Text type="success">
                      $ {numeral(total).format('0,000.00')}
                    </Typography.Text>
                  </Table.Summary.Cell>
                </Table.Summary.Row>
              </>
            );
          }}
        />

      </Flex>

    </DrawerForm>
  );
};


export default QuickViewDetail