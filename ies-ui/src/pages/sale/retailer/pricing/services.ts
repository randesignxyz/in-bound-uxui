import type { TableViewSearchParams } from '@/components/DataCrud/TableView';
import type { Paging } from '@/services/API';
import type { RequestActions, ServiceApiType } from '@/services/apiGateway';

import { singleRequest } from '@/services/apiGateway';
// import { List } from 'lodash';
import type {
  ItemsPricing,
  PricingAdvanceSearchParams,
  PricingGroupCreate,
  PricingRuleItems,
} from './data';

const PricingActions = {
  list: (
    params: TableViewSearchParams<PricingAdvanceSearchParams>,
  ): ServiceApiType<{ searchValue?: string }> => ({
    type: 'PAGING_QUERY',
    endpoint: 'RETAILER',
    actionName: 'list-pricing',
    payload: { ...params.criteria },
    pagination: {
      pageSize: params.pagination?.pageSize,
      page: params.pagination?.current,
    },
  }),
  save: (data: ItemsPricing): ServiceApiType<ItemsPricing> => ({
    type: 'EXEC',
    endpoint: 'RETAILER',
    actionName: 'save-pricing',
    payload: data,
  }),

  detail: (id: string): ServiceApiType<{ id: string }> => ({
    type: 'FETCH_QUERY',
    endpoint: 'RETAILER',
    actionName: 'detail-pricing',
    payload: { id },
  }),

  pricingItemList: (id: string): ServiceApiType<{ id: string }> => ({
    type: 'LIST_QUERY',
    endpoint: 'RETAILER',
    actionName: 'item-pricing',
    payload: { id },
  }),

  // for control Pricing Group
  savePricingGroup: (data: PricingGroupCreate): ServiceApiType<PricingGroupCreate> => ({
    type: 'EXEC',
    endpoint: 'RETAILER',
    actionName: 'save-pricing-group',
    payload: data,
  }),

  deletePricingItem: (id: number): ServiceApiType<{ id: number }> => ({
    type: 'EXEC',
    endpoint: 'RETAILER',
    actionName: 'delete-item-pricing',
    payload: { id },
  }),
};

export const PricingServiceAPI = (requestActions: RequestActions) => {
  return {
    listPricing: (params: TableViewSearchParams<PricingAdvanceSearchParams>) =>
      singleRequest<ItemsPricing>(PricingActions.list(params))(requestActions) as Promise<
        Paging<ItemsPricing>
      >,
    savePricing: (params: ItemsPricing) =>
      singleRequest<{ data: string; message: string }>(PricingActions.save(params))(requestActions),

    detailPricing: (id: string) =>
      singleRequest<ItemsPricing>(PricingActions.detail(id))(
        requestActions,
      ) as Promise<ItemsPricing>,

    // ------- end

    pricingItemList: (id: string) =>
      singleRequest<PricingRuleItems>(PricingActions.pricingItemList(id))(
        requestActions,
      ) as Promise<PricingRuleItems[]>,

    // save: (params: PricingRule) =>
    //   singleRequest<{ data: string; message: string }>(PricingActions.save(params))(requestActions),

    deletePricingItem: (id: number) =>
      singleRequest<{ data: string; message: string }>(PricingActions.deletePricingItem(id))(
        requestActions,
      ),
  };
};
