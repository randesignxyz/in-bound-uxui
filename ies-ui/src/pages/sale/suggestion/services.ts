import { TableViewSearchParams } from '@/components/DataCrud/TableView';
import { RequestActions, ServiceApiType } from '@/services/apiGateway';

import { singleRequest } from '@/services/apiGateway';
import type { ApprovalStockControlDto, ExchangeRate, SettlementModel, StockControlLess, StockStoreAdvanceSearchParams } from '@/services/sale/data';
import { Page } from '@/services/shared/data';
import { reject } from 'lodash';
import { CountStockDto } from '../../../services/sale/data';
import { endpoint } from '@/auth';

const SuggestionActions = {
  page:(param:TableViewSearchParams<StockStoreAdvanceSearchParams>):ServiceApiType<{searchValue?:string, role?:string}>=>({
      actionName:"list-suggestion-stock",
      endpoint:"SALE",
      type:"PAGING_QUERY",
      payload:{...param.criteria, role:param.criteria?.advanceSearch?.role},
      pagination:{...param.pagination},
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
  reject :(id?:number):ServiceApiType<{id?:number}> =>({
    type:"EXEC",
    actionName:"reject-request-stock",
    endpoint:"SALE",
    payload:{id}
  }),
  aceptedRequest:(id?:number):ServiceApiType<{id?:number}> =>({
    type:"EXEC",
    actionName:"accept-stock-request",
    endpoint:"SALE",
    payload:{id}
  }),
  approveStockRequest:(param:ApprovalStockControlDto):ServiceApiType<ApprovalStockControlDto> =>({
    type:"EXEC",
    actionName:"approve-stock-request",
    endpoint:"SALE",
    payload:param
  }),
  onSaveSettlementModel:(param:SettlementModel):ServiceApiType<SettlementModel> =>({
    type:"EXEC",
    actionName:"save-settlement-model",
    endpoint:"SALE",
    payload:param
  }),
  countStock:(param:CountStockDto):ServiceApiType<CountStockDto>=>({
    type:"EXEC",
    actionName:"count-stock",
    endpoint:"SALE",
    payload:param
  }),
  onClosedRequest:(id?:number):ServiceApiType<{id?:number}>=>({
    type:"EXEC",
    actionName:"close-stock-request",
    endpoint:"SALE",
    payload:{id}
  }),
  onApprovalStockRequest:(param:ApprovalStockControlDto):ServiceApiType<ApprovalStockControlDto> =>({
    type:"EXEC",
    actionName:"approve-stock-request",
    endpoint:"SALE",
    payload:param
  })
  // list: (
  //   params: TableViewSearchParams<CustomerAdvanceSearchParams>,
  // ): ServiceApiType<{ searchValue?: string }> => ({
  //   type: 'PAGING_QUERY',
  //   endpoint: 'RETAILER',
  //   actionName: 'page-customer',
  //   payload: { ...params.criteria },
  //   pagination: {
  //     pageSize: params.pagination?.pageSize,
  //     page: params.pagination?.current,
  //   },
  // }),

  // detail: (id: string): ServiceApiType<{ id: string }> => ({
  //   type: 'FETCH_QUERY',
  //   endpoint: 'RETAILER',
  //   actionName: 'detail-customer',
  //   payload: { id },
  // }),
  //   save: (data: PricingCreate): ServiceApiType<PricingCreate> => ({
  //     type: 'EXEC',
  //     endpoint: 'RETAILER',
  //     actionName: 'save-pricing',
  //     payload: data,
  //   }),
};

export const SuggestionServiceAPI = (requestActions: RequestActions) => {
  return {
    page:(param:TableViewSearchParams<StockStoreAdvanceSearchParams>) => singleRequest(SuggestionActions.page(param))(requestActions) as Promise<Page<StockControlLess>>,
    dsdExchangeRage: () =>singleRequest<ExchangeRate>(SuggestionActions.dsdExchangeRage())(requestActions) as Promise<ExchangeRate>,
    exchangeRage: () =>singleRequest<ExchangeRate>(SuggestionActions.exchangeRage())(requestActions) as Promise<ExchangeRate>,
    reject :(id?:number) =>singleRequest(SuggestionActions.reject(id))(requestActions),
    aceptRequestStock:(id?:number) =>singleRequest(SuggestionActions.aceptedRequest(id))(requestActions),
    approveStockRequest:(param:ApprovalStockControlDto) =>singleRequest(SuggestionActions.approveStockRequest(param))(requestActions),
    onSaveSettlementModel:(param:SettlementModel) =>singleRequest(SuggestionActions.onSaveSettlementModel(param))(requestActions) as Promise<{data:string, message:string}>,
    countStock:(param:CountStockDto)=>singleRequest(SuggestionActions.countStock(param))(requestActions) as Promise<{data:string; message:string}>,
    onClosedRequest:(id?:number)=>singleRequest(SuggestionActions.onClosedRequest(id))(requestActions) as Promise<{data:string; message:string}>,
    onApprovalStockRequest:(param:ApprovalStockControlDto)=>singleRequest(SuggestionActions.onApprovalStockRequest(param))(requestActions) as Promise<{data:string; message:string}>,
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
