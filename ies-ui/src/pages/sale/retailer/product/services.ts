import type { TableViewSearchParams } from '@/components/DataCrud/TableView';
import type { Paging } from '@/services/API';
import { exec, RequestActions, ServiceApiType, singleRequest } from '@/services/apiGateway';
import type { ProductAdvanceSearchParams, ProductCreate, ProductDto } from './data';

const ProductActions = {
  pageProducts: (
    params: TableViewSearchParams<ProductAdvanceSearchParams>,
  ): ServiceApiType<{ searchValue?: string }> => ({
    type: 'PAGING_QUERY',
    endpoint: 'RETAILER',
    actionName: 'page-product',
    payload: { ...params.criteria },
    pagination: {
      pageSize: params.pagination?.pageSize,
      page: params.pagination?.current,
    },
  }),

  listProducts: (
    params: TableViewSearchParams<ProductAdvanceSearchParams>,
  ): ServiceApiType<{ searchValue?: string }> => ({
    type: 'LIST_QUERY',
    endpoint: 'RETAILER',
    actionName: 'list-product',
    payload: { ...params.criteria },
  }),

  detail: (id: string): ServiceApiType<{ id: string }> => ({
    type: 'FETCH_QUERY',
    endpoint: 'RETAILER',
    actionName: 'detail-product',
    payload: { id },
  }),

  save: (data: ProductCreate): ServiceApiType<ProductCreate> => ({
    type: 'EXEC',
    endpoint: 'RETAILER',
    actionName: 'save-product',
    payload: data,
  }),

  updateStatusProdcut: (data: {
    id: string;
    status: string;
  }): ServiceApiType<{ id: string; status: string }> => ({
    type: 'EXEC',
    endpoint: 'RETAILER',
    actionName: 'update-status-product',
    payload: data,
  }),
};

export const ProductServiceAPI = (requestActions: RequestActions) => {
  return {
    pageProducts: (params: TableViewSearchParams<ProductAdvanceSearchParams>) =>
      singleRequest<ProductDto>(ProductActions.pageProducts(params))(requestActions) as Promise<
        Paging<ProductDto>
      >,
    listProducts: (params: TableViewSearchParams<ProductAdvanceSearchParams>) =>
      singleRequest<ProductDto>(ProductActions.listProducts(params))(requestActions) as Promise<
        ProductDto[]
      >,
    detailProduct: (id: string) =>
      singleRequest<ProductDto>(ProductActions.detail(id))(requestActions) as Promise<ProductDto>,
    save: (params: ProductCreate) =>
      exec<{ data: string; message: string }>(ProductActions.save(params))(requestActions),

    updateStatusProduct: (params: { id: string; status: string }) =>
      exec<{ data: string; message: string }>(ProductActions.updateStatusProdcut(params))(
        requestActions,
      ),
  };
};
