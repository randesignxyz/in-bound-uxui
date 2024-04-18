// listStock: findPagingService<
//     { searchValue?: string; advanceSearch?: { status: string }; sort?: Record<string, SortOrder> },
//     StockControlLess
//   >(SaleService('list-stock'), actions),

import { TableViewSearchParams } from '@/components/DataCrud/TableView';
import { Paging } from '@/services/API';
import { RequestActions, ServiceApiType, singleRequest } from '@/services/apiGateway';
import { StockAdvanceSearchParams, StockControlLess } from '@/services/sale/data';

const StockControlActions = {
  listStock: (
    params: TableViewSearchParams<StockAdvanceSearchParams>,
  ): ServiceApiType<{ searchValue?: string }> => ({
    type: 'PAGING_QUERY',
    endpoint: 'SALE',
    actionName: 'list-stock',
    payload: { ...params.criteria },
    pagination: {
      pageSize: params.pagination?.pageSize,
      page: params.pagination?.current,
    },
  }),
};

export const StockControlServiceAPI = (requestActions: RequestActions) => {
  return {
    listStock: (params: TableViewSearchParams<StockAdvanceSearchParams>) =>
      singleRequest<StockControlLess>(StockControlActions.listStock(params))(
        requestActions,
      ) as Promise<Paging<StockControlLess>>,
  };
};
