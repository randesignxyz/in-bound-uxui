import type { TableViewSearchParams } from '@/components/DataCrud/TableView';
import type { Paging } from '@/services/API';
import type { RequestActions, ServiceApiType } from '@/services/apiGateway';

import { singleRequest } from '@/services/apiGateway';
import type { Locations } from '@/services/crm/data';
import { LookupData } from '@/services/data';
import type { LeadDetail, LeadLess } from '@/services/sale/data';
import type { LeadAdvanceSearchParams } from './data';

const LeadActions = {
  list: (
    params: TableViewSearchParams<LeadAdvanceSearchParams>,
  ): ServiceApiType<{ id?: string }> => ({
    type: 'PAGING_QUERY',
    endpoint: 'SALE',
    actionName: 'page-lead',
    payload: { id: params.criteria?.searchValue ? params.criteria?.searchValue : '' },
    pagination: {
      pageSize: params.pagination?.pageSize,
      page: params.pagination?.current,
    },
  }),

  detail: (id: number): ServiceApiType<{ id: number }> => ({
    type: 'FETCH_QUERY',
    endpoint: 'SALE',
    actionName: 'detail-lead',
    payload: { id },
  }),
  save: (data: LeadLess): ServiceApiType<LeadLess> => ({
    type: 'EXEC',
    endpoint: 'SALE',
    actionName: 'save-lead',
    payload: data,
  }),
  loadRegion: (param: {
    type: string;
    parentId?: number;
  }): ServiceApiType<{ type: string; parentId?: number }> => ({
    type: 'LIST_QUERY',
    endpoint: 'CRM',
    actionName: 'locations',
    payload: param,
  }),
  loadLocations: (params: { ids: number[] }): ServiceApiType<{ ids: number[] }> => ({
    type: 'LIST_QUERY',
    endpoint: 'CRM',
    actionName: 'get-location-by-parents',
    payload: params,
  }),

  outletTypes: (params: { id: number }): ServiceApiType<{ id: number }> => ({
    type: 'LIST_QUERY',
    endpoint: 'SALE',
    actionName: 'sales_type',
    payload: params,
  }),
};

export const LeadServiceAPI = (requestActions: RequestActions) => {
  return {
    listLead: (params: TableViewSearchParams<LeadAdvanceSearchParams>) =>
      singleRequest<LeadDetail>(LeadActions.list(params))(requestActions) as Promise<
        Paging<LeadDetail>
      >,
    detailLead: (id: number) =>
      singleRequest<LeadDetail>(LeadActions.detail(id))(requestActions) as Promise<LeadDetail>,
    save: (params: LeadDetail) =>
      singleRequest<{ data: number; message: string }>(LeadActions.save(params))(requestActions),
    location: (type: string, parentId?: number) =>
      singleRequest<Locations[]>(LeadActions.loadRegion({ type: type, parentId: parentId }))(
        requestActions,
      ) as Promise<Locations[]>,
    locations: (ids: number[]) =>
      singleRequest<Locations[]>(LeadActions.loadLocations({ ids: ids }))(
        requestActions,
      ) as Promise<Locations[]>,

    outletTypes: () =>
      singleRequest<LookupData[]>(LeadActions.outletTypes({ id: -1 }))(requestActions) as Promise<
        LookupData[]
      >,
  };
};
