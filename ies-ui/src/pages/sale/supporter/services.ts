
import { change_distributor, change_po_item, create_new_mme, wrong_pricing } from '../data';
import { request } from 'umi';
import { SupporterParam } from './data';
import { RequestActions, ServiceApiType, singleRequest } from '@/services/apiGateway';
import { LeadDetail } from '@/services/sale/data';
import { TableViewSearchParams } from '@/components/DataCrud/TableView';
import { Page } from '@/services/shared/data';

const Endpoint = 'http://10.0.12.247:85/services/sale/api/name';





export async function fetchChangePoItem(data: change_po_item) {
  return request(`${Endpoint}/purchase_order_change_new_item/exec`, {
    method: 'POST',
    accept: 'application/json',
    data,
  });
}

export async function fetchChangeDistributor(data: change_distributor) {
  return request(`${Endpoint}/dsd_change_distributor/exec`, {
    method: 'POST',
    accept: 'application/json',
    data,
  });
}

export async function fetchWrongPricing(data: wrong_pricing) {
  return request(`${Endpoint}/sales_invoice_remove_discount_pricing/exec`, {
    method: 'POST',
    accept: 'application/json',
    data,
  });
}

export async function fetchCreateNewMME(data: create_new_mme) {
  return request(`${Endpoint}/create_new_se/exec`, {
    method: 'POST',
    accept: 'application/json',
    data,
  });
}

// export async function fetchRollBackPO(data: change_po_item) {
//   return request(`${Endpoint}/purchase_order_change_new_item/exec`, {
//     method: 'POST',
//     accept: 'application/json',
//     data,
//   });
// }  


const SupporterActions = {
  poTodo: (params: SupporterParam): ServiceApiType<SupporterParam> => ({
    actionName: "supporter",
    endpoint: "SALE",
    type: "EXEC",
    payload: params
  }),
  page: (params: TableViewSearchParams<any>): ServiceApiType<{ searchValue?: string }> => ({
    actionName: "supporters",
    endpoint: "SALE",
    type: "PAGING_QUERY",
    payload: { ...params.criteria },
    pagination: params.pagination
  }),
}


export const SupporterServiceAPI = (requestActions: RequestActions) => {
  return {
    poTodo: (params: SupporterParam) => singleRequest(SupporterActions.poTodo(params))(requestActions),
    page: (params: TableViewSearchParams<any>) => singleRequest(SupporterActions.page(params))(requestActions) as Promise<Page<any>>,
  }
}