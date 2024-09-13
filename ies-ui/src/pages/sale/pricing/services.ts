// import { TableViewSearchParams } from '@/components/DataCrud/TableView';
// import { Paging } from '@/services/API';
// import { RequestActions, ServiceApiType, singleRequest } from '@/services/apiGateway';

import { TableViewSearchParams } from '@/components/DataCrud/TableView';
import { RequestActions, ServiceApiType, exec, find, findPaging } from '@/services/apiGateway';
import { ItemSalesLinePriceDto, PricingAdvanceSearchParam, PricingUpdateParam } from './data';

const PricingAction = {
  page: (
    params: TableViewSearchParams<PricingAdvanceSearchParam>,
  ): ServiceApiType<{ searchValue?: string; type?: string }> => ({
    type: 'PAGING_QUERY',
    endpoint: 'SALE',
    actionName: 'page-pricing',
    payload: { ...params.criteria, type: params.criteria?.advanceSearch?.status },
    pagination: {
      pageSize: params.pagination?.pageSize,
      page: params.pagination?.current,
    },
  }),
  detail: (id?: number): ServiceApiType<{ id?: number }> => ({
    type: 'FETCH_QUERY',
    endpoint: 'SALE',
    actionName: 'detail-pricing',
    payload: { id },
  }),
  update: (data: PricingUpdateParam): ServiceApiType<PricingUpdateParam> => ({
    type: 'EXEC',
    endpoint: 'SALE',
    actionName: 'update-item-pricing',
    payload: data,
  }),
};

export const PricingServiceAPI = (requestActions: RequestActions) => {
  return {
    page: (params: TableViewSearchParams<PricingAdvanceSearchParam>) =>
      findPaging<ItemSalesLinePriceDto>(PricingAction.page(params))(requestActions),
    detail: (id?: number) => find<ItemSalesLinePriceDto>(PricingAction.detail(id))(requestActions), //as Promise<ItemSalesLinePriceDto>,

    update: (data: PricingUpdateParam) =>
      exec<{ id: number; message: string }>(PricingAction.update(data))(requestActions),
  };
};
