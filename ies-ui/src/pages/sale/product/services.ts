import { TableViewSearchParams } from '@/components/DataCrud/TableView';
import { Paging } from '@/services/API';
import { exec, RequestActions, ServiceApiType, singleRequest } from '@/services/apiGateway';
import { ProductItem } from '@/services/sale/data';

const ProductItemActions = {
  pageProducts: (
    params: TableViewSearchParams<null>,
  ): ServiceApiType<{ searchValue?: string }> => ({
    type: 'PAGING_QUERY',
    endpoint: 'SALE',
    actionName: 'list-product-item',
    payload: { ...params.criteria },
    pagination: {
      pageSize: 100, //params.pagination?.pageSize,
      page: params.pagination?.current,
    },
  }),

  //   listProductItem: findPagingService<{ searchText?: string }, ProductItem>(
  //     SaleService('list-product-item'),
  //     actions,
  //   ),

  // listProducts: (
  //   params: TableViewSearchParams<ProductAdvanceSearchParams>,
  // ): ServiceApiType<{ searchValue?: string }> => ({
  //   type: 'LIST_QUERY',
  //   endpoint: 'RETAILER',
  //   actionName: 'list-product',
  //   payload: { ...params.criteria },
  // }),

  // detail: (id: string): ServiceApiType<{ id: string }> => ({
  //   type: 'FETCH_QUERY',
  //   endpoint: 'RETAILER',
  //   actionName: 'detail-product',
  //   payload: { id },
  // }),

  save: (data: {
    uomId: number;
    price: number;
    name: string;
    code?: string;
    isActiveMobileSales?: boolean;
    isWebEnabled?: boolean;
    isStockCountEnabled?: boolean;
  }): ServiceApiType<{
    code?: string;
    uomId: number;
    price: number;
    name: string;
    isActiveMobileSales?: boolean;
    isWebEnabled?: boolean;
    isStockCountEnabled?: boolean;
  }> => ({
    type: 'EXEC',
    endpoint: 'SALE',
    actionName: 'active-product-item',
    payload: data,
  }),

  // updateStatusProdcut: (data: {
  //   id: string;
  //   status: string;
  // }): ServiceApiType<{ id: string; status: string }> => ({
  //   type: 'EXEC',
  //   endpoint: 'RETAILER',
  //   actionName: 'update-status-product',
  //   payload: data,
  // }),
};

export const ProductItemsServiceAPI = (requestActions: RequestActions) => {
  return {
    pageProducts: (params: TableViewSearchParams<null>) =>
      singleRequest<ProductItem>(ProductItemActions.pageProducts(params))(
        requestActions,
      ) as Promise<Paging<ProductItem>>,
    //   listProducts: (params: TableViewSearchParams<ProductAdvanceSearchParams>) =>
    //     singleRequest<ProductDto>(ProductActions.listProducts(params))(requestActions) as Promise<
    //       ProductDto[]
    //     >,
    //   detailProduct: (id: string) =>
    //     singleRequest<ProductDto>(ProductActions.detail(id))(requestActions) as Promise<ProductDto>,
    save: (params: {
      code?: string;
      isActiveMobileSales?: boolean;
      isWebEnabled?: boolean;
      isStockCountEnabled?: boolean;
      uomId: number;
      price: number;
      name: string;
    }) => exec<{ data: string; message: string }>(ProductItemActions.save(params))(requestActions),

    //   updateStatusProduct: (params: { id: string; status: string }) =>
    //     exec<{ data: string; message: string }>(ProductActions.updateStatusProdcut(params))(
    //       requestActions,
    //     ),
  };
};
