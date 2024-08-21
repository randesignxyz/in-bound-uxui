import type { RequestActions, ServiceApiType } from '@/services/apiGateway';

import { singleRequest } from '@/services/apiGateway';
import type { ExchangeRate } from '@/services/sale/data';

const SuggestionActions = {
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
  reject :(id:number):ServiceApiType<{id:number}> =>({
    type:"EXEC",
    actionName:"reject-request-stock",
    endpoint:"SALE",
    payload:{id}
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
    dsdExchangeRage: () =>singleRequest<ExchangeRate>(SuggestionActions.dsdExchangeRage())(requestActions) as Promise<ExchangeRate>,
    exchangeRage: () =>singleRequest<ExchangeRate>(SuggestionActions.exchangeRage())(requestActions) as Promise<ExchangeRate>,
    reject :(id:number) =>singleRequest(SuggestionActions.reject(id))(requestActions)
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
