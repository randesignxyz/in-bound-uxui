import type { TableViewSearchParams } from '@/components/DataCrud/TableView';
import type { Paging } from '@/services/API';
import type { RequestActions, ServiceApiType } from '@/services/apiGateway';

import { singleRequest } from '@/services/apiGateway';
import type { IngredientAdvanceSearchParams, IngredientCreate, IngredientDto } from './data';

const IngredientActions = {
  pageIngrediet: (
    params: TableViewSearchParams<IngredientAdvanceSearchParams>,
  ): ServiceApiType<{ searchValue?: string }> => ({
    type: 'PAGING_QUERY',
    endpoint: 'RETAILER',
    actionName: 'page-ingredient',
    payload: { ...params.criteria },
    pagination: {
      pageSize: params.pagination?.pageSize,
      page: params.pagination?.current,
    },
  }),

  detailIngredient: (id: string): ServiceApiType<{ id: string }> => ({
    type: 'FETCH_QUERY',
    endpoint: 'RETAILER',
    actionName: 'detail-ingredient',
    payload: { id },
  }),
  saveIngredient: (data: IngredientCreate): ServiceApiType<IngredientCreate> => ({
    type: 'EXEC',
    endpoint: 'RETAILER',
    actionName: 'save-ingredient',
    payload: data,
  }),
};

export const IngredientServiceAPI = (requestActions: RequestActions) => {
  return {
    pageIngredient: (params: TableViewSearchParams<IngredientAdvanceSearchParams>) =>
      singleRequest<IngredientDto>(IngredientActions.pageIngrediet(params))(
        requestActions,
      ) as Promise<Paging<IngredientDto>>,
    detailIngredient: (id: string) =>
      singleRequest<IngredientDto>(IngredientActions.detailIngredient(id))(
        requestActions,
      ) as Promise<IngredientDto>,
    save: (params: IngredientCreate) =>
      singleRequest<{ data: string; message: string }>(IngredientActions.saveIngredient(params))(
        requestActions,
      ),
  };
};
