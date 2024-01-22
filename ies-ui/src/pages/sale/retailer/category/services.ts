import type { TableViewSearchParams } from '@/components/DataCrud/TableView';
import type { Paging } from '@/services/API';
import type { RequestActions, ServiceApiType } from '@/services/apiGateway';

import { exec, singleRequest } from '@/services/apiGateway';
import type { CategoryAdvanceSearchParams, CategoryCreate, CategoryDto } from './data';

const CategoryActions = {
  listCategory: (
    params: TableViewSearchParams<CategoryAdvanceSearchParams>,
  ): ServiceApiType<{ searchValue?: string }> => ({
    type: 'PAGING_QUERY',
    endpoint: 'RETAILER',
    actionName: 'list-category',
    payload: { ...params.criteria },
    pagination: {
      pageSize: params.pagination?.pageSize,
      page: params.pagination?.current,
    },
  }),

  detailCategory: (id: string): ServiceApiType<{ id: string }> => ({
    type: 'FETCH_QUERY',
    endpoint: 'RETAILER',
    actionName: 'detail-category',
    payload: { id },
  }),
  saveCategory: (data: CategoryCreate): ServiceApiType<CategoryCreate> => ({
    type: 'EXEC',
    endpoint: 'RETAILER',
    actionName: 'save-category',
    payload: data,
  }),
  updateStatusCategory: (data: {
    id: string;
    status: string;
  }): ServiceApiType<{ id: string; status: string }> => ({
    type: 'EXEC',
    endpoint: 'RETAILER',
    actionName: 'update-status-category',
    payload: data,
  }),
};

export const CategoryServiceAPI = (requestActions: RequestActions) => {
  return {
    listCategory: (params: TableViewSearchParams<CategoryAdvanceSearchParams>) =>
      singleRequest<CategoryDto>(CategoryActions.listCategory(params))(requestActions) as Promise<
        Paging<CategoryDto>
      >,
    detailCategory: (id: string) =>
      singleRequest<CategoryDto>(CategoryActions.detailCategory(id))(
        requestActions,
      ) as Promise<CategoryDto>,
    save: (params: CategoryCreate) =>
      exec<{ data: string; message: string }>(CategoryActions.saveCategory(params))(requestActions),

    updateStatusCategory: (params: { id: string; status: string }) =>
      exec<{ data: string; message: string }>(CategoryActions.updateStatusCategory(params))(
        requestActions,
      ),
  };
};
