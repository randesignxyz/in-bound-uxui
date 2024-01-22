import type { DescriptionDisplayDataItem } from '@/components/Descriptions';
import DescriptionDisplay from '@/components/Descriptions';
import { formatDate, formatDateTime } from '@/pages/utils';
import type { ExchangeRate, StockDetailItemLess } from '@/services/sale/data';
import { ProTable } from '@ant-design/pro-components';
import type { DrawerProps } from 'antd';
import { Table } from 'antd';
import { Typography } from 'antd';
import { Card } from 'antd';
import { Drawer } from 'antd';
import numeral from 'numeral';
import type { SalesInvoiceAR, SalesInvoiceItemAR, StockControlARLess } from './data';

interface Prop extends DrawerProps {
  stockControl?: StockControlARLess;
  soldExchangeRate?: ExchangeRate;
}

export default (props: Prop) => {
  const { stockControl, soldExchangeRate } = props;

  const { Text } = Typography;

  const stockControlInfo: (DescriptionDisplayDataItem | undefined)[] = [
    { label: 'Requested Date', value: formatDate(stockControl?.requestedDate) },
    { label: '', value: '' },
    { label: 'Salesperson', value: stockControl?.owner },
    { label: 'Plate Number', value: stockControl?.plateNumber },
    { label: 'Approved By', value: stockControl?.approvedBy },
    { label: 'Is to be carried forward', value: stockControl?.isKeepForwarding ? 'True' : 'False' },
    {
      label: 'Settled Amount',
      value: `${soldExchangeRate?.target_symbol} ${numeral(stockControl?.totalSettledAmount).format(
        '0,0',
      )}`,
    },
    {
      label: 'Sold Amount',
      value: `${soldExchangeRate?.target_symbol} ${numeral(
        (stockControl?.totalSoldAmount || 0) * (soldExchangeRate?.target_amount || 0),
      ).format('0,0')}`,
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
                return `${soldExchangeRate?.target_symbol} ${numeral(
                  r.unitPrice * (soldExchangeRate?.target_amount || 0.0),
                ).format('0,0')}`;
              },
            },
            {
              title: 'Amount',
              align: 'right',
              render: (_, r) => {
                return `${soldExchangeRate?.target_symbol} ${numeral(
                  r.unitPrice * (soldExchangeRate?.target_amount || 0.0) * r.quantity,
                ).format('0,0')}`;
              },
            },
          ]}
          summary={(data) => {
            const totalAmount = data.reduce(
              (acc, it) =>
                acc + it.quantity * it.unitPrice * (soldExchangeRate?.target_amount || 0.0),
              0,
            );

            return (
              <>
                <Table.Summary.Row>
                  <Table.Summary.Cell index={0} align="right" colSpan={2}>
                    <Text type="warning">Total</Text>
                  </Table.Summary.Cell>
                  <Table.Summary.Cell index={1} align="right" colSpan={2}>
                    <Text type="warning">
                      {soldExchangeRate?.target_symbol} {numeral(totalAmount).format('0,0')}
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
    <Drawer {...props}>
      <Card size="small" title="General">
        <DescriptionDisplay column={2} data={stockControlInfo} />
      </Card>
      <ProTable<StockDetailItemLess>
        size={'small'}
        title={() => <Text type="success">Stock Items</Text>}
        dataSource={stockControl?.items}
        style={{ backgroundColor: '#EEE' }}
        rowKey={(r) => {
          return `items - ${r.id || 0}`;
        }}
        headerTitle={false}
        search={false}
        options={false}
        pagination={false}
        columns={[
          // {
          //   title: 'Batch No',
          //   dataIndex: 'batchNo',
          //   width: '110px',
          // },
          {
            title: 'Description',
            render: (_, r) => {
              return `${r.itemCode} - ${r.itemName}`;
            },
          },
          {
            title: 'Beg. Qty',
            align: 'right',
            dataIndex: 'beginningQty',
          },
          {
            title: 'Req. Qty',
            align: 'right',
            dataIndex: 'quantity',
          },
          {
            title: 'Total Qty',
            align: 'right',
            render: (_, r) => r.beginningQty + r.quantity,
          },
          {
            title: 'Stock Used',
            align: 'right',
            dataIndex: 'soldQty',
          },
          {
            title: 'Stock End',
            align: 'right',
            dataIndex: 'actualQty',
          },
        ]}
        summary={(data) => {
          const total = data.reduce((acc, it) => acc + it.beginningQty + it.quantity, 0);
          const totalSoldQty = data.reduce((acc, it) => acc + it.soldQty, 0);
          const totalEndQty = data.reduce((acc, it) => acc + (it.actualQty || 0), 0);
          return (
            <>
              <Table.Summary.Row>
                <Table.Summary.Cell index={0} align="right" colSpan={3}>
                  <Text type="success">Total</Text>
                </Table.Summary.Cell>
                <Table.Summary.Cell index={1} align="right">
                  <Text type="success">{total}</Text>
                </Table.Summary.Cell>
                <Table.Summary.Cell index={2} align="right">
                  <Text type="success">{totalSoldQty}</Text>
                </Table.Summary.Cell>
                <Table.Summary.Cell index={3} align="right">
                  <Text type="success">{totalEndQty}</Text>
                </Table.Summary.Cell>
              </Table.Summary.Row>
            </>
          );
        }}
      />
      <ProTable<SalesInvoiceAR>
        size={'small'}
        title={() => <Text type="success">Sale Invoices</Text>}
        dataSource={stockControl?.invoices}
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
              const total = (soldExchangeRate?.target_amount || 0.0) * r.amount;
              return `${soldExchangeRate?.target_symbol} ${numeral(total).format('0,0')}`;
            },
          },
        ]}
        summary={(data) => {
          const total =
            data.reduce((acc, it) => acc + it.amount, 0) * (soldExchangeRate?.target_amount || 0.0);
          return (
            <>
              <Table.Summary.Row>
                <Table.Summary.Cell index={0} align="right" colSpan={3}>
                  <Text type="success">Total</Text>
                </Table.Summary.Cell>
                <Table.Summary.Cell index={1} align="right" colSpan={2}>
                  <Text type="success">
                    {soldExchangeRate?.target_symbol} {numeral(total).format('0,0')}
                  </Text>
                </Table.Summary.Cell>
              </Table.Summary.Row>
            </>
          );
        }}
      />
    </Drawer>
  );
};
