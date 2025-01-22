import { TableViewSearchParams } from '@/components/DataCrud/TableView';
import { RequestActions, ServiceApiType } from '@/services/apiGateway';

import { singleRequest } from '@/services/apiGateway';
import type {
  ApprovalStockControlDto,
  ExchangeRate,
  MMAAprovalEntity,
  StockControlLess,
  StockStoreAdvanceSearchParams,
} from '@/services/sale/data';
import { Page } from '@/services/shared/data';
import { CountStockDto } from '../../../services/sale/data';
import { PurchaseOrderDTO } from '../mpu/purchase_order/data';

const SuggestionActions = {
  page: (
    param: TableViewSearchParams<StockStoreAdvanceSearchParams>,
  ): ServiceApiType<{ searchValue?: string; role?: string }> => ({
    // actionName:"list-suggestion-stock",
    actionName: 'mma_page_request_stock',
    endpoint: 'SALE',
    type: 'PAGING_QUERY',
    payload: { ...param.criteria, role: param.criteria?.advanceSearch?.role },
    pagination: { ...param.pagination },
  }),
  dsdExchangeRage: (): ServiceApiType<{}> => ({
    type: 'FETCH_QUERY',
    endpoint: 'SALE',
    actionName: 'exchange-rate-dsd-only',
    payload: {},
  }),
  exchangeRage: (): ServiceApiType<{}> => ({
    type: 'FETCH_QUERY',
    endpoint: 'SALE',
    actionName: 'exchange-rate',
    payload: {},
  }),
  reject: (param: RemarkParam): ServiceApiType<RemarkParam> => ({
    type: 'EXEC',
    actionName: 'reject-request-stock',
    endpoint: 'SALE',
    payload: param,
  }),
  aceptedRequest: (id?: number): ServiceApiType<{ id?: number }> => ({
    type: 'EXEC',
    actionName: 'accept-stock-request',
    endpoint: 'SALE',
    payload: { id },
  }),
  approveStockRequest: (
    param: ApprovalStockControlDto,
  ): ServiceApiType<ApprovalStockControlDto> => ({
    type: 'EXEC',
    actionName: 'approve-stock-request',
    endpoint: 'SALE',
    payload: param,
  }),
  onSaveSettlementModel: (param: SettlementEntry): ServiceApiType<SettlementEntry> => ({
    type: 'EXEC',
    actionName: 'save-settlement-model',
    endpoint: 'SALE',
    payload: param,
  }),
  countStock: (param: CountStockDto): ServiceApiType<CountStockDto> => ({
    type: 'EXEC',
    actionName: 'count-stock',
    endpoint: 'SALE',
    payload: param,
  }),
  onClosedRequest: (id?: number): ServiceApiType<{ id?: number }> => ({
    type: 'EXEC',
    actionName: 'close-stock-request',
    endpoint: 'SALE',
    payload: { id },
  }),
  onApprovalStockRequest: (
    param: ApprovalStockControlDto,
  ): ServiceApiType<ApprovalStockControlDto> => ({
    type: 'EXEC',
    actionName: 'approve-stock-request',
    endpoint: 'SALE',
    payload: param,
  }),
  onMMAApprovalStockRequest: (param: MMAAprovalEntity): ServiceApiType<MMAAprovalEntity> => ({
    type: 'EXEC',
    // actionName: 'mma-approve-stock-request',
    actionName:"mma_approve_stock",
    endpoint: 'SALE',
    payload: param,
  }),
  fetchRoleByUser: (id: string): ServiceApiType<{ id: string }> => ({
    type: 'LIST_QUERY',
    endpoint: 'SALE',
    payload: { id },
    actionName: 'fetch-role-by-user',
  }),
  listPurchaseOrderStock: (id?: number): ServiceApiType<{ id?: number }> => ({
    actionName: 'list-purchase-order-stock',
    endpoint: 'SALE',
    type: 'LIST_QUERY',
    payload: { id },
  }),
  onMMASaveSettlementModel: (param: SettlementEntry): ServiceApiType<SettlementEntry> => ({
    type: 'EXEC',
    actionName: 'save-mma-settlement-model',
    endpoint: 'SALE',
    payload: param,
  }),
};

export const SuggestionServiceAPI = (requestActions: RequestActions) => {
  return {
    page: (param: TableViewSearchParams<StockStoreAdvanceSearchParams>) =>
      singleRequest(SuggestionActions.page(param))(requestActions) as Promise<
        Page<StockControlLess>
      >,
    dsdExchangeRage: () =>
      singleRequest<ExchangeRate>(SuggestionActions.dsdExchangeRage())(
        requestActions,
      ) as Promise<ExchangeRate>,
    exchangeRage: () =>
      singleRequest<ExchangeRate>(SuggestionActions.exchangeRage())(
        requestActions,
      ) as Promise<ExchangeRate>,
    reject: (payload: RemarkParam) =>
      singleRequest<{ id: number; message: string }>(SuggestionActions.reject(payload))(
        requestActions,
      ) as Promise<{ id: number; message: string }>,
    aceptRequestStock: (id?: number) =>
      singleRequest(SuggestionActions.aceptedRequest(id))(requestActions),
    approveStockRequest: (param: ApprovalStockControlDto) =>
      singleRequest(SuggestionActions.approveStockRequest(param))(requestActions),
    onSaveSettlementModel: (param: SettlementEntry) =>
      singleRequest(SuggestionActions.onSaveSettlementModel(param))(requestActions) as Promise<{
        data: string;
        message: string;
      }>,
    countStock: (param: CountStockDto) =>
      singleRequest(SuggestionActions.countStock(param))(requestActions) as Promise<{
        data: string;
        message: string;
      }>,
    onClosedRequest: (id?: number) =>
      singleRequest(SuggestionActions.onClosedRequest(id))(requestActions) as Promise<{
        data: string;
        message: string;
      }>,
    onApprovalStockRequest: (param: ApprovalStockControlDto) =>
      singleRequest(SuggestionActions.onApprovalStockRequest(param))(requestActions) as Promise<{
        data: string;
        message: string;
      }>,
    onMMAApprovalStockRequest: (param: MMAAprovalEntity) =>
      singleRequest(SuggestionActions.onMMAApprovalStockRequest(param))(requestActions) as Promise<{
        data: string;
        message: string;
      }>,
    fetchRolByUser: (id: string) =>
      singleRequest(SuggestionActions.fetchRoleByUser(id))(requestActions) as Promise<
        { roleName: string }[]
      >,
    listPurchaseOrderStock: (id?: number) =>
      singleRequest(SuggestionActions.listPurchaseOrderStock(id))(requestActions) as Promise<
        PurchaseOrderDTO[]
      >,
    onMMASaveSettlementModel: (param: SettlementEntry) =>
      singleRequest(SuggestionActions.onMMASaveSettlementModel(param))(requestActions) as Promise<{
        data: string;
        message: string;
      }>,
    // listCustomer: (params: TableViewSearchParams<CustomerAdvanceSearchParams>) =>
    //   singleRequest<CustomerDto>(CustomerActions.list(params))(requestActions) as Promise<
    //     Paging<CustomerDto>
    //   >,
    // detailCustomer: (id: string) =>
    //   singleRequest<CustomerDto>(CustomerActions.detail(id))(
    //     requestActions,
    //   ) as Promise<CustomerDto>,
    // save: (params: PricingCreate) =>
    //   singleRequest<{ data: string; message: string }>(PricingActions.save(params))(requestActions),
  };
};
