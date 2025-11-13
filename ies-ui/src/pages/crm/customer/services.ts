import { execDataService, execDataService0, fetchDataListService, fetchDataPagingService, singleRequest } from "@/services/apiGateway";
import { Address, CustomerItemLess, SalePerson } from "@/services/crm/data";
import { LookupDataItem } from "@/services/shared/data";
import { SaveCustomerPosmParams } from "../contract/types";
import { SavePosmItemCheckedParams, SaveSupplySourceParams, SupplySource } from "./types";

export const CustomerServices = {
  listSalesperson: fetchDataListService<SalePerson>({
    actionName: 'sale',
    endpoint: 'CRM',
  }),

  search: (searchValue?: string) => fetchDataListService<LookupDataItem, { searchValue?: string }>({
    actionName: 'lookup-customers',
    endpoint: 'CRM',
    payload: {
      searchValue
    }
  }),

  listCustomer: (saleId: number) => fetchDataListService<CustomerItemLess, { id: number }>({
    actionName: 'list-customer-by-sale',
    endpoint: 'CRM',
    payload: { id: saleId }
  }),

  listSupplyByCustomer: (customerId: number) => fetchDataListService<SupplySource, { id: number }>({
    actionName: 'list-product-supply-by-customer',
    endpoint: 'CRM',
    payload: { id: customerId }
  }),

  saveSupplySource: (params: SaveSupplySourceParams) => execDataService0<SaveSupplySourceParams>({
    actionName: 'save-supply-source',
    endpoint: 'CRM',
    payload: params
  }),

  deleteSupplySource: (id: number) => execDataService0<{ id: number }>({
    actionName: 'delete-supply-source',
    endpoint: 'CRM',
    payload: { id }
  }),

  transfers: (toSaleId: number, customerIdList: number[]) => execDataService0<{ customerIdList: number[]; salespersonId: number; }>({
    actionName: 'transfer-customers',
    endpoint: 'CRM',
    payload: {
      customerIdList: customerIdList,
      salespersonId: toSaleId
    }
  }),

  updateCustomerCodeHis: (customerId: number, idl9?: string, idl0?: string, idm0?: string, idc0?: string, remarks?: string) => execDataService0<{
    customerId: number; idl9?: string; idl0?: string; idm0?: string; idc0?: string; remarks?: string
  }>({
    actionName: 'update-customer-code-his',
    endpoint: 'CRM',
    payload: {
      customerId, idl9, idl0, idm0, idc0, remarks
    }
  }),

  listBrand: fetchDataListService<LookupDataItem>({
    actionName: 'list-brand',
    responseKey: 'brandList',
    endpoint: 'CRM',
  }),

  listDistributors: (searchValue?: string) => fetchDataPagingService<CustomerItemLess, { searchValue?: string }>({
    actionName: 'list-distributor',
    endpoint: 'CRM',
    payload: {
      searchValue
    }
  }),

  saveCustomerPOSM: (params: SaveCustomerPosmParams) => execDataService<{ data: number }, SaveCustomerPosmParams>({
    actionName: 'save-customer-posm',
    endpoint: 'CRM',
    payload: params
  }),

  deleteCustomerPosm: (id: number) => execDataService0<{ id: number }>({
    actionName: 'delete-customer-posm',
    endpoint: 'CRM',
    payload: { id }
  }),

  checkPosm: (visitId: number, items: SavePosmItemCheckedParams[]) => execDataService0<{ visitId: number; items: SavePosmItemCheckedParams[]; }>({
    actionName: 'check-posm',
    endpoint: 'CRM',
    payload: {
      visitId,
      items
    }
  }),

  syncExecStoreProcedureCustomer:()=>execDataService0({
    actionName:"sync-execute-store-procedure-customer-auto",
    endpoint:"CRM",
    payload:{}
  }),

  // PHEUN REACH 05/05/2025
  customerPOSMContract:(data:any)=>execDataService0({
    actionName:"customer-posm-contract",
    endpoint:"CRM",
    payload:data,
  }),

  addressByCustomerIds:(data:any)=>fetchDataPagingService<Address,{searchValue?:string}>({
    actionName: "list-address-by-customer-ids",
    endpoint: "CRM",
    payload: data?.criteria,
    pagination:{
      pageSize:data.pagination?.pageSize??50,
      page:data.pagination?.page
    }
  })

}