import DescriptionDisplay, { DescriptionDisplayDataItem } from '@/components/Descriptions';
import { formatDate } from '@/pages/utils';
import { StockDetailItemSettle } from '@/services/sale/data';
import { PageContainer } from '@ant-design/pro-components';
import ProTable, { ActionType } from '@ant-design/pro-table';
import { Card, message, Table, Typography } from 'antd';
import numeral from 'numeral';
import { useEffect, useRef, useState } from 'react';
import { Model } from '../model';

type Props = {
  id: number;
  actionHandlers?: {
    onBack?: () => void;
  };
};

const SettlementDetail: React.FC<Props> = ({ id, actionHandlers }) => {
  const { state, actions } = Model();
  const actionRef = useRef<ActionType>();
  const { Text } = Typography;
  const [forceUpdate, setForceUpdate] = useState<number>(0);
  //   const access = useAccess();

  const displayItems: (DescriptionDisplayDataItem | undefined)[] = [
    { label: 'Salesperson Name', value: state.data?.detail.salespersonCode },
    { label: 'Cashier Name', value: state.data?.detail.cashierName },
    {
      label: 'Remark',
      //   onClick: () => {
      //     history.push(`${CrmPaths.customer}/detail/${soDetail?.associatedTo.customer.id}`);
      //   },
      value: state.data?.detail.remark,
    },
    { label: 'Bank Amount', value: numeral(state.data?.detail.bankAmount).format('$ 0,0.00') },
    { label: 'Amount KH', value: numeral(state.data?.detail.amountKH).format('0,0') },
    { label: 'Exchange Rate', value: numeral(state.data?.detail.exchangeRate).format('0,0') },
    { label: 'Amount', value: numeral(state.data?.detail.amount).format('$ 0,0.00') },

    {
      label: 'Settlement Amount',
      value: numeral(
        state.data
          ? state.data?.detail.amount +
              state.data?.detail.amountKH / state.data?.detail.exchangeRate +
              (state.data?.detail.bankAmount || 0.0)
          : 0.0,
      ).format('$ 0,0.00'),
    },
    { label: 'Sold Amount', value: numeral(state.data?.detail.soldAmount).format('$ 0,0.00') },
  ];

  useEffect(() => {
    try {
      id && actions.detail(id);
      //actions.initilizeData(id);
      // state.data?.initData?.saleInvoiceList?.forEach((it) => {
      //   console.log(it);
      // });
      // const t = state.data?.initData?.saleInvoiceList?.reduce((rest, it) => {
      //   rest += it.amount;
      //   return rest;
      // }, 0.0);
      // console.log(t);
    } catch {
      message.error('Failed to load Settlement Detail.');
    }
  }, []);

  return (
    <PageContainer
      title={`Settlement Date - ${formatDate(state.data?.detail?.settlementDate)}`}
      breadcrumb={undefined}
      // subTitle={formatDate(state.data?.detail?.scheduleDate)}
      onBack={actionHandlers?.onBack}
      // extra={
      //   access.canCreateEditSo &&
      //   isOpenStock() && [
      //     <Button
      //       type="link"
      //       htmlType="button"
      //       icon={<FileDoneOutlined />}
      //       onClick={() => {}}
      //       key="edit"
      //     >
      //       Settlement
      //     </Button>,
      //     <Button
      //       type="link"
      //       htmlType="button"
      //       // icon={<EditOutlined />}
      //       icon={<RetweetOutlined />}
      //       onClick={() => setAddModal({ visible: true })}
      //       key="edit"
      //     >
      //       Deposit Money
      //     </Button>,
      //     <Button
      //       type="link"
      //       htmlType="button"
      //       icon={<PlusOutlined />}
      //       onClick={() =>
      //         setAddStockModal({ visible: true, title: 'Add Request Items', typeId: undefined })
      //       }
      //       key="Add Request"
      //     >
      //       Add Request Items
      //     </Button>,
      //   ]
      // }
    >
      <Card size="small" title="General">
        <DescriptionDisplay data={displayItems} />
      </Card>
      <ProTable<StockDetailItemSettle, { searchValue?: string }>
        actionRef={actionRef}
        key={'stockItemsSettlement'}
        rowKey={'id'}
        title={() => {
          return <Text type="success">Last Stock Items Detail</Text>;
        }}
        options={{
          density: false,
          setting: false,
          reload: false,
          search: false,
          // search: true ?? (
          //   <Space size={[1, 'small']}>
          //     <Input.Search allowClear />
          //   </Space>
          // ),
        }}
        search={false}
        dataSource={state.data?.detail.stockDetails}
        summary={(data) => {
          const total = data.reduce((acc, it) => (acc += it.beginningQty + it.quantity), 0);
          const soldTotal = data.reduce((acc, it) => (acc += it.soldQty), 0);
          const actualTotal = data.reduce((acc, it) => (acc += it.actualQty || 0), 0);
          return (
            <Table.Summary.Row>
              <Table.Summary.Cell index={0} align="right" colSpan={6}>
                {/* <Text type="success">Total</Text> */}
                Total Summary:
              </Table.Summary.Cell>
              <Table.Summary.Cell index={1} align="right">
                <Text type="secondary">{total}</Text>
              </Table.Summary.Cell>
              <Table.Summary.Cell index={2} align="right">
                <Text type="warning">{soldTotal}</Text>
              </Table.Summary.Cell>
              <Table.Summary.Cell index={3} align="right">
                <Text type="success">{actualTotal}</Text>
              </Table.Summary.Cell>
            </Table.Summary.Row>
          );
        }}
        columns={[
          {
            title: 'Batch #',
            dataIndex: 'batchNo',
            width: 120,
          },

          {
            title: 'Expired Date',
            render: (_, r) => {
              return formatDate(r.expiredDate);
            },
          },

          {
            title: 'Product Name',
            // dataIndex: 'itemName',
            render: (_, r) => {
              return `${r.itemCode} - ${r.itemName}`;
            },
          },

          {
            title: 'UOM',
            align: 'center',
            dataIndex: 'uom',
            width: 60,
          },

          {
            title: 'Begin Stock',
            align: 'right',
            // dataIndex: 'beginningQty',
            render: (_, r) => {
              return <Text type="secondary">{r.beginningQty}</Text>;
            },
          },
          {
            title: 'Request Stock',
            align: 'right',
            // dataIndex: 'quantity',
            render: (_, r) => {
              return <Text type="secondary">{r.quantity}</Text>;
            },
          },
          {
            title: 'Total Stock',
            align: 'right',
            // render: (_, r) => {
            //   return r.beginningQty + r.quantity;
            // },
            render: (_, r) => {
              return <Text type="secondary">{r.beginningQty + r.quantity}</Text>;
            },
          },
          {
            title: 'Stock Used',
            align: 'right',
            // dataIndex: 'soldQty',
            render: (_, r) => {
              return <Text type="warning">{r.soldQty}</Text>;
            },
          },
          //   {
          //     title: 'End Stock',
          //     align: 'right',
          //     dataIndex: 'endQty',
          //   },
          {
            title: 'Actual Balance',
            align: 'right',
            //dataIndex: 'actualQty',
            render: (_, r) => {
              return <Text type="success">{r.actualQty}</Text>;
            },
            width: 120,
          },
          {
            title: 'Remark',
            dataIndex: 'remark',
            valueType: 'text',
            width: 120,
          },
        ]}
      />
    </PageContainer>
  );
};

export default SettlementDetail;
