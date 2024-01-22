import TableView, { TableViewSearchParams } from '@/components/DataCrud/TableView';
import { Paging } from '@/services/API';
import { simpleRequestActions } from '@/services/model';
import { ProductItem } from '@/services/sale/data';
import type { ActionType } from '@ant-design/pro-table';

import { EditOutlined } from '@ant-design/icons';
import { useModel } from '@umijs/max';
import { Button, message, Tag, Typography } from 'antd';
import { useRef, useState } from 'react';
import ProductItemEditModal from './components/ProductItemEditModal';
import { ProductItemsServiceAPI } from './services';

// interface Props {
// onAdd?: () => void;
// onEdit?: (id: string) => void;
// onDetail?: (id: number) => void;
// }

export default ({}) => {
  const requestActions = simpleRequestActions();
  const services = ProductItemsServiceAPI(requestActions);
  // const ProductItemListView: React.FC<TableViewProps<ProductItem>> = ({ actionHandlers }) => {
  // const access = useAccess();
  const actionRef = useRef<ActionType>();
  const [module, setModule] = useState<{
    visible?: boolean;
    item?: ProductItem;
  }>({});
  const { Text } = Typography;
  const cacheList = useModel('dataList');
  // const [force, setForce] = useSetState<{ update: number }>({ update: 0 });
  // const [advanceSearchParams, setAdvanceSearchParams] = useState<StockAdvanceSearchParams>();

  const onRequestHandler = async (params: TableViewSearchParams<null>) => {
    try {
      return services.pageProducts(params).then((it) => {
        return cacheList.cacheDataList({
          type: 'sales-product-item',
          criteria: params,
          data: it,
        });
      }) as Promise<Paging<ProductItem>>;
    } catch (error: any) {
      message.error(error.message);
      return Promise.reject();
    }
  };

  return (
    <>
      <TableView<ProductItem, { searchValue?: string }>
        //hasCriteria={Object.values(Omit(advanceSearchParams, ['status'])).some((v) => v)}
        cache
        // extraFilter={
        //   <Space size="large">
        //     <Radio.Group
        //       value={advanceSearchParams.status}
        //       onChange={(e) => {
        //         setAdvanceSearchParams((v) => ({
        //           ...v,
        //           status: e.target.value,
        //         }));

        //         actionRef.current?.reloadAndRest?.();
        //       }}
        //     >
        //       <Radio.Button value="ALL">All</Radio.Button>
        //       <Badge size="small" offset={[-20, 0]} count={0}>
        //         <Radio.Button value="ACTIVE">Active</Radio.Button>
        //       </Badge>
        //       <Badge size="small" offset={[-20, 0]} count={0}>
        //         <Radio.Button value="INACTIVE">Inactive</Radio.Button>
        //       </Badge>
        //     </Radio.Group>
        //   </Space>
        // }
        displayOnly
        columns={[
          {
            title: 'No',
            render: (_, r, index) => {
              const rowIndex =
                actionRef.current?.pageInfo &&
                (actionRef.current?.pageInfo?.current - 1) * actionRef.current?.pageInfo?.pageSize +
                  (index + 1);
              return <Text type="secondary">{rowIndex}</Text>;
            },
          },
          {
            title: 'Product Name',
            // dataIndex: 'name',
            render: (_, r) => {
              return (
                <Button
                  type="link"
                  onClick={() => {
                    setModule({ visible: true, item: r });
                  }}
                >
                  {r.name}
                </Button>
              );
            },
          },
          {
            title: 'Product Code',
            dataIndex: 'code',
          },
          {
            title: 'Description',
            dataIndex: 'description',
          },
          {
            title: 'Active in Mobile',
            align: 'center',
            render: (_, r) => {
              return (
                <Tag color={r.isActiveMobileSales ? 'green' : 'red'}>
                  {r.isActiveMobileSales ? 'Active' : 'Inactive'}
                </Tag>
              );
              // return `${r.category?.code} - ${r.category?.name}`;
            },
          },
          {
            title: 'Active in Web',
            align: 'center',
            render: (_, r) => {
              return (
                <Tag color={r.isWebEnabled ? 'green' : 'red'}>
                  {r.isWebEnabled ? 'Active' : 'Inactive'}
                </Tag>
              );
              // return `${r.category?.code} - ${r.category?.name}`;
            },
          },
          {
            title: 'Allow Count Stock',
            align: 'center',
            render: (_, r) => {
              return (
                <Tag color={r.isStockCountEnabled ? 'green' : 'red'}>
                  {r.isStockCountEnabled ? 'Active' : 'Inactive'}
                </Tag>
              );
              // return `${r.category?.code} - ${r.category?.name}`;
            },
          },
          {
            title: 'Action',
            align: 'center',
            render: (_, r) => {
              return (
                <EditOutlined
                  style={{ color: '#448DF7' }}
                  onClick={() => {
                    setModule({ visible: true, item: r });
                  }}
                />
              );
            },
          },
        ]}
        actionHandlers={{
          onRequest: (criteria, pagination, sort) =>
            onRequestHandler({
              criteria: {
                ...criteria,
                //advanceSearch: advanceSearchParams,
                sort,
              },
              pagination,
            }),
          onFirstLoad: () =>
            cacheList.fetchDataList('sales-product-item').then((v) => {
              if (v) {
                // setAdvanceSearchParams({
                //   ...v.creteria?.criteria,
                //   status: v.creteria?.criteria?.advanceSearch?.status ?? 'ALL',
                // });
                return v.dataList;
              } else {
                return onRequestHandler({
                  criteria: {
                    // advanceSearch: advanceSearchParams,
                  },
                });
              }
            }) as Promise<Paging<ProductItem>>,
        }}
        tableProps={{
          actionRef: actionRef,
        }}
      />
      <ProductItemEditModal
        open={module.visible}
        item={module.item}
        actionHandlers={{
          onSave: async (actions) => {
            try {
              const result = await services.save({
                code: module.item?.code,
                isActiveMobileSales: actions?.isMobile,
                isStockCountEnabled: actions?.isCountStock,
                isWebEnabled: actions?.isWeb,
                uomId: -1,
                price: 0.0,
                name: '',
              });
              if (result.message.toLowerCase() === 'ok') {
                setModule({ visible: false, item: undefined });
                actionRef.current?.reload();
              }
              message.info(result.message);
            } catch (e) {
              message.error(e);
            }
          },
        }}
        onCancel={() => {
          setModule({ visible: false, item: undefined });
        }}
      />
    </>
  );
};

// export default ProductItemListView;
