import { TableViewProps } from '@/components/DataCrud/TableView';
import { formatDate } from '@/pages/utils';
import { Paging } from '@/services/API';
import { SaleInvoiceLess } from '@/services/sale/data';
import { PlusOutlined } from '@ant-design/icons';
import ProTable, { ActionType } from '@ant-design/pro-table';
import { Button, Input, message, Space, Tag } from 'antd';
import { SortOrder } from 'antd/lib/table/interface';
import numeral from 'numeral';
import { useRef } from 'react';
import { useModel } from 'umi';
import { Model } from '../model';

const SoInvoiceListView: React.FC<TableViewProps<SaleInvoiceLess>> = ({ actionHandlers }) => {
  //const access = useAccess();
  const cacheList = useModel('dataList');
  // const [searchValue, setSearchValue] = useState<string>();
  const innerActionRef = useRef<ActionType>();
  const { state, actions } = Model();

  const onSearchCriteria = (value: string | undefined) => {
    return { searchValue: value };
  };

  const onRequestHandler = (
    criteria?: { searchValue?: string },
    pagination?: {
      pageSize?: number;
      current?: number;
    },
    sort?: Record<string, SortOrder>,
  ) => {
    return actions.loadSaleInvoice?.(criteria, pagination, sort).then((it) => {
      return cacheList.cacheDataList({
        type: 'sale-invoice',
        //criteria: criteria?.advanceSearch || advanceSearchParams,
        data: it,
      });
    }) as Promise<Paging<SaleInvoiceLess>>;
  };

  // const onSearchHandler = async (value: string) => {
  //   setSearchValue(value);
  //   console.log('value ' + value);
  //   await innerActionRef.current?.reloadAndRest?.();
  // };

  const expandedRowRender = (parent: SaleInvoiceLess) => {
    return parent.items.length > 0 ? (
      <ProTable
        size={'small'}
        style={{ backgroundColor: '#EEE' }}
        key={'key'}
        rowKey={'id'}
        columns={[
          { title: '#', dataIndex: 'index', key: 'key' },
          { title: 'Code', dataIndex: 'itemCode' },
          { title: 'Description', dataIndex: 'itemName' },
          { title: 'Quantity', dataIndex: 'quantity' },
          { title: 'UOM', dataIndex: 'uom' },
          {
            title: 'Sale Price',
            align: 'right',
            render: (_, r) => {
              return numeral(r.unitPrice).format('$ 0,0.00');
            },
          },
          {
            title: 'Amount',
            align: 'right',
            render: (_, r) => {
              const amount = r.quantity * r.unitPrice;
              return numeral(amount).format('$ 0,0.00');
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
        dataSource={parent.items}
        pagination={false}
      />
    ) : (
      <div key={parent.id} style={{ textAlign: 'center', fontWeight: 'bold', color: 'gray' }}>
        No Data
      </div>
    );
  };

  return (
    <>
      {/* <TableView<SaleInvoiceLess, { searchValue?: string }> */}
      <ProTable<SaleInvoiceLess, { searchValue?: string }>
        actionRef={innerActionRef}
        key={'saleInvoice'}
        rowKey={'id'}
        toolBarRender={() => [
          <Button
            size="small"
            type="primary"
            disabled={state.loading}
            onClick={() => message.info('Hello')}
            icon={<PlusOutlined />}
          />,
        ]}
        options={{
          density: false,
          setting: false,
          reload: false,
          // search: false,
          search: true ?? (
            <Space size={[1, 'small']}>
              <Input.Search allowClear />
            </Space>
          ),
        }}
        search={false}
        //displayOnly={!access.canCreateEditSo}
        // extraFilter={
        // <Space size="large">
        //   <Radio.Group
        //     value={advanceSearchParams?.active || -1}
        //     onChange={(e) => {
        //       setAdvanceSearchParams((v) => ({
        //         ...v,
        //         status: e.target.value,
        //       }));
        //       actionRef.current?.reloadAndRest?.();
        //     }}
        //   >
        //     <Radio.Button value="-1">All</Radio.Button>
        //     <Radio.Button value="1">Active</Radio.Button>
        //     <Radio.Button value="0">Inactive</Radio.Button>
        //   </Radio.Group>
        // </Space>
        // }
        // actionHandlers={{
        //   onSearchCriteria: (data: string) => {
        //     return { searchValue: data };
        //   },
        //   onAdd: actionHandlers?.onAdd,
        //   onFirstLoad: () =>
        //     cacheList.fetchDataList('sale-invoice').then((v) => {
        //       if (v) {
        //         // setAdvanceSearchParams(v.creteria);
        //         return v.dataList;
        //       } else return onSaleInvoiceRequestHandler();
        //     }) as Promise<Paging<SaleInvoiceLess>>,
        //   onRequest: onSaleInvoiceRequestHandler,
        //   // onAdvanceSearchClicked: () => modals.showModal('advanceSearch'),
        // }}
        request={async (
          params: {
            pageSize?: number;
            current?: number;
            keyword?: string;
          },
          sort: Record<string, SortOrder>,
        ) => {
          const searchParams = onSearchCriteria(params.keyword);
          const data = await onRequestHandler(searchParams, params, sort);
          return {
            success: !!data,
            total: data?.total,
            data: data?.items.map((it: SaleInvoiceLess) => it).filter((it: any) => !!it),
          };
        }}
        expandable={{ expandedRowRender }}
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
            //dataIndex: 'invoiceNo'
            align: 'right',
            render: (_, r) => {
              return numeral(r.amount).format('$ 0,0.00');
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
      />
    </>
  );
};

export default SoInvoiceListView;
