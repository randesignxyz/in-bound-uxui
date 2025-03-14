import { formatDate } from '@/pages/utils';
import type { Paging } from '@/services/API';
import type { Locations } from '@/services/crm/data';
import type { LocationType } from '@/services/crm/services';
import type { LookupDataItem } from '@/services/data';
import type {
  ExchangeRate,
  LeadLess,
  SaleInvoiceLess,
  SalesTeamWorkLess,
  StockDetailLess,
} from '@/services/sale/data';
import { EditOutlined, PlusOutlined } from '@ant-design/icons';
import type { ActionType } from '@ant-design/pro-table';
import ProTable from '@ant-design/pro-table';
import { useAccess } from '@umijs/max';
import { useSetState } from 'ahooks';
import { Button, Tag, Tooltip } from 'antd';
import type { SortOrder } from 'antd/lib/table/interface';
import numeral from 'numeral';
import { useEffect, useRef } from 'react';
import SaleInvoiceFormModal from '../SaleInvoiceFormModal';
import { Model } from '../model';

type Props = {
  forceUpdate: number;
  data: {
    id: number;
    isOpen?: boolean;
    listStockDetailItem?: StockDetailLess[];
    // saleTypes?: LookupData[];
    typeProductItems?: { type: number; value: LookupDataItem[] }[];
    //salespersonCode?: string;
    owner?: SalesTeamWorkLess;
    exchangeRate?: ExchangeRate;
    salespersonList?: SalesTeamWorkLess[];
    loading: boolean;
    regionList?: Locations[];
    locations?: {
      communeList?: Locations[];
      districtList?: Locations[];
      provinceList?: Locations[];
      villageList?: Locations[];
    };
  };
  actionHandlers: {
    onLoadLocations: (type: LocationType, isNotClearChild: boolean, parentId?: number) => void;
    onSaveSaleInvoice: (item: SaleInvoiceLess) => void;
  };
};

const SaleInvoiceTabItem: React.FC<Props> = ({ forceUpdate, data, actionHandlers }) => {
  const innerActionRef = useRef<ActionType>();
  const access = useAccess();
  const { actions } = Model();
  // const { Text } = Typography;
  const [saleInvoiceModal, setSaleInvoiceModal] = useSetState<{
    visible: boolean;
    record?: SaleInvoiceLess;
  }>({
    visible: false,
  });

  const exchangeRate = () => data.exchangeRate?.target_amount || 0.0;

  const onSearchCriteria = (value: string | undefined) => {
    return { stockControlId: data.id, searchValue: value };
  };

  const onRequestHandler = (
    criteria?: { stockControlId: number; searchValue?: string },
    pagination?: {
      pageSize?: number;
      current?: number;
    },
    sort?: Record<string, SortOrder>,
  ) => {
    return actions.loadSaleInvoiceWithStockControl?.(criteria, pagination, sort).then((it) => {
      return it;
    }) as Promise<Paging<SaleInvoiceLess>>;
  };

  const getProductItems = () => {
    const result =
      data.listStockDetailItem?.flatMap((it) => {
        if (it.typeId !== 133) {
          return (
            it.items
              // ?.filter((it1) => it1.beginningQty + it1.quantity > it1.soldQty)
              .flatMap((it1) => ({
                id: it1.itemId,
                name: it1.itemName,
                code: it1.itemCode,
                qty: it1.quantity,
                price: 3.75,
                batchNo: it1.batchNo,
              }))
          );
        } else return [];
      }) || [];

    // const items: SaleItem[] = [];

    // result.reduce((res, value) => {
    //   if (value && !res[value.id]) {
    //     res[value.id] = { ...value, qty: 0 };
    //     items.push(res[value.id]);
    //   }
    //   value && (res[value.id].qty += value?.qty);
    //   return res;
    // }, {});

    // return items.sort((a, b) => {
    //   if (a.code < b.code) return -1;
    //   if (a.code > b.code) return 1;
    //   return 0;
    // });

    return result;
  };

  const getTypes = () => {
    return data.typeProductItems?.flatMap((it) => {
      return it.value.flatMap((it1) => {
        return { itemId: it1.id, itemType: it.type };
      });
    });
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
          {
            title: 'Batch No',
            render: (_, r) => {
              return r.batchNo === 'n/a' ? '-' : r.batchNo;
            },
          },
          { title: 'Code', dataIndex: 'itemCode' },
          { title: 'Description', dataIndex: 'itemName' },
          {
            title: 'Type',
            render: (_, r) => {
              return <Tag color={r.itemType === 'FOC' ? 'error' : 'success'}>{r.itemType}</Tag>;
              // return r.itemType;
            },
          },
          { title: 'Quantity', dataIndex: 'quantity' },
          { title: 'UOM', dataIndex: 'uom' },
          {
            title: 'Unit Price',
            align: 'right',
            render: (_, r) => {
              return `$ ${numeral(r.unitPrice).format('0,0.000')}`;
            },
          },
          {
            title: 'Amount',
            align: 'right',
            render: (_, r) => {
              return `$ ${numeral(r.quantity * r.unitPrice).format('0,0.000')}`;
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

  return (
    <>
      <ProTable<SaleInvoiceLess, { stockControlId: number; searchValue?: string }>
        // title={() => <Text>Helo</Text>}
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
              return formatDate(r.invoiceDate);
            },
          },
          {
            title: 'Customer',
            render: (_, r) => {
              return getCustomerName(r.customer);
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
            title: 'Total Quantity',
            align: 'right',
            render: (_, r) => {
              const total = r.items.reduce((acc, it) => acc + it.quantity, 0);
              return `${total} CASE${total > 1 ? 'S' : ''}`;
            },
          },
          {
            title: 'Amount',
            dataIndex: 'amount',
            align: 'right',
            valueType: 'money',
            render: (_, r) => {
              return `$ ${numeral(r.amount).format('0,0.000')}`;
            },
          },

          {
            title: 'Salesperson',
            render: (_, r) => {
              return `${r.salesperson.salespersonCode} - ${r.salesperson.salespersonName}`;
            },
          },
          {
            title: '',
            align: 'center',
            render: (_, r) => {
              return r.status === 'Pending' ? (
                <Tooltip title="Edit" key="edit">
                  <EditOutlined
                    style={{ color: '#448DF7' }}
                    onClick={() => {
                      setSaleInvoiceModal({ visible: true, record: r });
                    }}
                  />
                </Tooltip>
              ) : (
                <></>
              );
              // return <Checkbox defaultChecked={r.isActive ? true : false} disabled />;
            },
          },
        ]}
        toolBarRender={() => [
          access.canAccessAllMenuDSD && data.isOpen && (
            <Button
              size="small"
              type="primary"
              disabled={data.loading}
              onClick={() => {
                setSaleInvoiceModal({ visible: true });
              }}
              icon={<PlusOutlined />}
            />
          ),
        ]}
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
          pageSize: 50,
        }}
        request={async (
          params: {
            pageSize?: number;
            current?: number;
            keyword?: string;
          },
          sort: Record<string, SortOrder>,
        ) => {
          const searchParams = onSearchCriteria(params.keyword) || {
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
      <SaleInvoiceFormModal
        title="Sale Invoice"
        isLoading={data.loading || false}
        open={saleInvoiceModal.visible}
        data={{
          stockControlId: data.id,
          salespersonList: data.salespersonList,
          regionList: data.regionList,
          locations: data.locations,
          owner: data.owner,
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
      />
    </>
  );
};

export default SaleInvoiceTabItem;
