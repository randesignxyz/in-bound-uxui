import { formatDate } from '@/pages/utils';
import type { Paging } from '@/services/API';
import type { ExchangeRate, LeadLess, SaleInvoiceLess } from '@/services/sale/data';
import { EditOutlined } from '@ant-design/icons';
import type { ActionType } from '@ant-design/pro-table';
import ProTable from '@ant-design/pro-table';
import { Card, Tag, Tooltip, Typography } from 'antd';
import type { SortOrder } from 'antd/lib/table/interface';
import numeral from 'numeral';
import { useEffect, useRef } from 'react';
import { useAccess } from 'umi';
import { Model } from '../model';
// import SaleInvoiceFormModal from '../SaleInvoiceFormModal';

type Props = {
  forceUpdate: number;
  data: {
    stockStoreId: number;
    stockControlId?: number;
    exchangeRate?: ExchangeRate;
    //     isOpen?: boolean;
    //     listStockDetailItem?: StockDetailLess[];
    //     // saleTypes?: LookupData[];
    //     typeProductItems?: { type: number; value: LookupDataItem[] }[];
    //     //salespersonCode?: string;
    //     salespersonList?: SalesTeamWorkLess[];
    //     loading: boolean;
    //     regionList?: Locations[];
    //     locations?: {
    //       communeList?: Locations[];
    //       districtList?: Locations[];
    //       provinceList?: Locations[];
    //       villageList?: Locations[];
    //     };
  };
  actionHandlers: {
    onEditSaleInvoice: (item: SaleInvoiceLess) => void;
    //     onLoadLocations: (type: LocationType, isNotClearChild: boolean, parentId?: number) => void;
    //     onSaveSaleInvoice: (item: SaleInvoiceLess) => void;
  };
};

const SaleInvoiceTabItem: React.FC<Props> = ({ forceUpdate, data, actionHandlers }) => {
  // const [searchValue, setSearchValue] = useState<string>();
  const innerActionRef = useRef<ActionType>();
  const { actions } = Model();
  const access = useAccess();
  const onRequestHandler = (
    criteria?: { stockControlId?: number; searchValue?: string },
    pagination?: {
      pageSize?: number;
      current?: number;
    },
    sort?: Record<string, SortOrder>,
  ) => {
    return actions.loadSaleInvoiceWithStockControl(criteria, pagination, sort).then((it) => {
      // return actions.loadSaleInvoiceWithSalesperson(criteria, pagination, sort).then((it) => {
      return it;
    }) as Promise<Paging<SaleInvoiceLess>>;
  };

  const getCustomerName = (it?: LeadLess): string => {
    const name =
      it?.internalName !== null
        ? it?.internalName
        : it?.firstName !== null && it?.lastName !== null
        ? `${it?.firstName} ${it?.lastName}`
        : it?.firstName !== null
        ? it?.firstName
        : it?.lastName || '';
    return `${name} - ( ${it?.phone} )`;
  };

  useEffect(() => {
    if (forceUpdate) {
      innerActionRef.current?.reload();
    }
  }, [forceUpdate]);

  const expandedRowRender = (parent: SaleInvoiceLess) => {
    return parent.items.length > 0 ? (
      <ProTable
        size={'small'}
        style={{ backgroundColor: '#EEE' }}
        key={'key'}
        rowKey={'id'}
        columns={[
          { title: '#', dataIndex: 'index', key: 'key' },
          { title: 'Batch No', dataIndex: 'batchNo' },
          {
            title: 'Description',
            render: (_, r) => {
              return `${r.itemCode} - ${r.itemName}`;
            },
          },
          { title: 'Quantity', dataIndex: 'quantity',align:"right" },
          { title: 'UOM', dataIndex: 'uom' },
          {
            title: 'Sale Price',
            align: 'right',
            render: (_, r) => {
              // const unitPrice = r.unitPrice * exchangeRate();
              // return `${data.exchangeRate?.target_symbol} ${numeral(unitPrice).format('0,0.00')}`;
               return `$ ${numeral( r.unitPrice).format("0,000.00")}`
            },
          },
          {
            title: 'Amount',
            align: 'right',
            render: (_, r) => {
              return <Typography.Text type='success'>$ {numeral(r.quantity * r.unitPrice).format("0,000.00")}</Typography.Text>
            },
          },
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
      {/* <Card
        size="small"
      > */}
        <ProTable<SaleInvoiceLess, { stockControlId: number; searchValue?: string }>
          actionRef={innerActionRef}
          key={'saleInvoice'}
          rowKey={'id'}
          expandable={{ expandedRowRender }}
          columns={[
            {
              title: 'Invoice #',
              dataIndex: 'invoiceNo',
            },
            {
              title: 'Invoice Date',
              //dataIndex: 'invoiceNo'
              render: (_, r) => {
                return formatDate(r.invoiceDate, 'DD-MM-YYYY');
              },
            },
            {
              title: 'Salesperson',
              render: (_, r) => {
                return `${r.salesperson.salespersonCode} - ${r.salesperson.salespersonName}`;
              },
            },
            {
              title: 'Customer',
              render: (_, r) => {
                return getCustomerName(r.customer);
              },
            },
            {
              title: 'Total Quantity',
              align: 'right',
              render: (_, r) => {
                const total = r.items.reduce((acc, it) => acc + it.quantity, 0);
                return `${total} CASE${total > 1 ? 'S' : ''}`;
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
            {
              title: 'Amount',
              //dataIndex: 'invoiceNo'
              align:"right",
              render: (_, r) => {
                // const amount = r.amount * exchangeRate();
                return `$ ${numeral(r.amount).format('0,0.00')}`;
              },
            },
            access.canAccessSettlement
              ? {
                  title: '',
                  align: 'center',
                  render: (_, r) => {
                    return r.status === 'Pending' ? (
                      <Tooltip title="Edit" key="edit">
                        <EditOutlined
                          style={{ color: '#448DF7' }}
                          onClick={() => {
                            //setSaleInvoiceModal({ visible: true, record: r });
                            actionHandlers.onEditSaleInvoice(r);
                          }}
                        />
                      </Tooltip>
                    ) : (
                      <></>
                    );
                  },
                }
              : {},
          ]}
          //   toolBarRender={() => [
          //     data.isOpen && (
          //       <Button
          //         size="small"
          //         type="primary"
          //         disabled={data.loading}
          //         onClick={() => setSaleInvoiceModal({ visible: true })}
          //         icon={<PlusOutlined />}
          //       />
          //     ),
          //   ]}
          options={{
            density: false,
            setting: false,
            reload: false,
            search: false,
            // search: true ?? (
            //   <Space size={[1, 'small']}>
            //     <Input.Search allowClear onSearch={onSearchHandler} />
            //   </Space>
            // ),
          }}
          size="small"
          search={false}
          pagination={{
            pageSize: 10,
          }}
          request={async (
            params: {
              pageSize?: number;
              current?: number;
              keyword?: string;
            },
            sort: Record<string, SortOrder>,
          ) => {
            // const searchParams = {
            //   stockStoreId: data.stockStoreId,
            //   searchValue: params.keyword,
            // };
            const searchParams = {
              stockControlId: data.stockControlId,
              searchValue: params.keyword,
            };

            const result = await onRequestHandler(searchParams, params, sort);
            return {
              success: !!result,
              total: result?.total,
              data: result?.items.map((it: SaleInvoiceLess) => it).filter((it: any) => !!it),
            };
          }}
          // pagination={pagination}
        />
      {/* </Card> */}
      {/* <SaleInvoiceFormModal
        title="Sale Invoice"
        isLoading={data.loading || false}
        visible={saleInvoiceModal.visible}
        data={{
          stockControlId: data.id,
          salespersonList: data.salespersonList,
          regionList: data.regionList,
          locations: data.locations,
          saleItems: getProductItems(),
          typeProductItems: getTypes(),
          detail: saleInvoiceModal.record,
        }}
        onCancel={() => setSaleInvoiceModal({ visible: false, record: undefined })}
        actionHandlers={{
          onSubmit: (item: SaleInvoiceLess) => {
            actionHandlers.onSaveSaleInvoice(item);
            setSaleInvoiceModal({ visible: false, record: undefined });
          },
          onLoadLocations: actionHandlers.onLoadLocations,
        }}
      /> */}
    </>
  );
};

export default SaleInvoiceTabItem;
