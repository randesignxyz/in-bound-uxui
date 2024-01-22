import type { RequestActions, ServiceApiType } from '@/services/apiGateway';

import { singleRequest } from '@/services/apiGateway';
import type { Locations } from '@/services/crm/data';
import type { LookupDataItem } from '@/services/data';
import type { SalesTeamWorkLess } from '@/services/sale/data';

export const StoreStockActions = {
  listRegion: (): ServiceApiType<{}> => ({
    type: 'LIST_QUERY',
    endpoint: 'CRM',
    responseKey: 'regionList',
    actionName: 'locations',
    payload: { type: 'DIVISION' },
  }),

  typeProductItems: (): ServiceApiType<{}> => ({
    type: 'LIST_QUERY',
    endpoint: 'SALE',
    responseKey: 'typeProductItems',
    actionName: 'list-type-product-items',
    payload: {},
  }),

  types: (): ServiceApiType<{}> => ({
    type: 'LIST_QUERY',
    endpoint: 'SALE',
    responseKey: 'types',
    actionName: 'list-stock-category',
    payload: {},
  }),

  salespersonList: (): ServiceApiType<{}> => ({
    type: 'LIST_QUERY',
    endpoint: 'SALE',
    responseKey: 'salespersonList',
    actionName: 'list-sales-team-work',
    payload: {},
  }),

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
// { actionName: 'locations', responseKey: 'regionList', payload: { type: 'DIVISION' } },

// teamWorks?: TeamWorkLess[];
//   salespersonList?: SalesTeamWorkLess[];
//   types?: LookupDataItem[];
//   // salesType?: LookupDataItem[];
//   regionList?: Locations[];
//   saleInvoiceList?: SaleInvoiceLess[];
//   typeProductItems?: { type: number; value: LookupDataItem[] }[];

// let initSaleInvoiceParams: InitSaleInvoiceParam[] = [
//   // {
//   //   actionName: 'look-up-data',
//   //   responseKey: 'salesType',
//   //   payload: {
//   //     list: ['SALE_TYPE'],
//   //   },
//   // },
//   {
//     actionName: 'list-type-product-items',
//     responseKey: 'typeProductItems',
//     payload: {},
//   },
//   {
//     actionName: 'list-stock-category',
//     responseKey: 'types',
//     payload: {},
//   },
//   {
//     actionName: 'list-sales-team-work',
//     responseKey: 'salespersonList',
//     payload: {},
//   },
// ];
// const result = await crmServices.initCustomerData(initParams);
// const rs = await saleServices.initSaleInvoiceData(initSaleInvoiceParams);
// dispatch({
//   type: 'initialData',
//   payload: { ...rs, ...result },
// });

export const StoreStockServiceAPI = (requestActions: RequestActions) => {
  return {
    listRegion: () =>
      singleRequest<Locations>(StoreStockActions.listRegion())(
        requestActions,
      ) as Promise<Locations>,
    typeProductItems: () =>
      singleRequest<{ type: number; value: LookupDataItem[] }>(
        StoreStockActions.typeProductItems(),
      )(requestActions) as Promise<{ type: number; value: LookupDataItem[] }>,
    types: () =>
      singleRequest<LookupDataItem>(StoreStockActions.types())(
        requestActions,
      ) as Promise<LookupDataItem>,
    salespersonList: () =>
      singleRequest<SalesTeamWorkLess>(StoreStockActions.salespersonList())(
        requestActions,
      ) as Promise<SalesTeamWorkLess>,

    // save: (params: PricingCreate) =>
    //   singleRequest<{ data: string; message: string }>(PricingActions.save(params))(requestActions),
  };
};
