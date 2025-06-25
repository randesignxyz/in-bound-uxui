// listStock: findPagingService<
//     { searchValue?: string; advanceSearch?: { status: string }; sort?: Record<string, SortOrder> },
//     StockControlLess
//   >(SaleService('list-stock'), actions),

import { TableViewSearchParams } from '@/components/DataCrud/TableView';
import { Paging } from '@/services/API';
import { execDataService, fetchDataItemService, RequestActions, ServiceApiType, singleRequest } from '@/services/apiGateway';
import { TaskActionDataParam } from '@/services/process-workflow/params';
import { StockAdvanceSearchParams, StockControlDetail, StockControlLess } from '@/services/sale/data';
import { StockTransfer, StockTransferRequest } from '../workflow_integration/stock_request/data';

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

  fetchStockControl: (id?: string): ServiceApiType<{ id?: string }> => ({
    actionName: "fetch-stock-control",
    type: "FETCH_QUERY",
    endpoint: "SALE",
    payload: { id },

  }),

};

export const StockControlServiceAPI = (requestActions: RequestActions) => {
  return {
    listStock: (params: TableViewSearchParams<StockAdvanceSearchParams>) =>
      singleRequest<StockControlLess>(StockControlActions.listStock(params))(
        requestActions,
      ) as Promise<Paging<StockControlLess>>,

    fetchStockControl: (id?: string) => singleRequest(StockControlActions.fetchStockControl(id))(requestActions) as Promise<StockControlLess>,


    stockTransferAction: (data: TaskActionDataParam<StockTransfer>) => execDataService<{ data: string }, TaskActionDataParam<StockTransfer>>({
      actionName: 'stock-transfer',
      endpoint: 'SALE',
      payload: data
    })(requestActions),

    fetchStockTransferRequest: (processInstanceId: string) => fetchDataItemService<StockTransferRequest, { id: string }>({
      actionName: 'fetch-transfer-request',
      endpoint: 'SALE',
      payload: {
        id: processInstanceId
      }
    }).query(requestActions),

    saveSaleInvoiceRemark: (param: { id: number, remark: string }) => execDataService<StockTransferRequest, {}>({
      actionName: "save-sale-invoice-remark",
      endpoint: 'SALE',
      payload: param
    })(requestActions)
  };
};
