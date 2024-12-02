import { TableViewSearchParams } from "@/components/DataCrud/TableView";
import { execDataService, execDataService0, fetchDataItemService, fetchDataListService, fetchDataPagingService } from "@/services/apiGateway";
import { ContractLess } from "@/services/crm/contract";
import { LookupDataItem, LookupDataItem3 } from "@/services/data";
import { ContractAdvanceSearchParams, ContractPOSMItem, ContractViewData, EditContractCheck, POSM, SaveContactData, SaveContractCheckList, SavePosmParams } from "./types";
import moment, { Moment } from "moment";
import { AddressInfo, AddresssView } from "@/services/crm/data";

export const ContractServices = {

    list: (params: TableViewSearchParams<ContractAdvanceSearchParams>) => fetchDataPagingService<ContractLess, any>({
        actionName: 'list-contract',
        endpoint: 'CRM',
        payload: {
            ...params.criteria
         },
        pagination: {
            page: params.pagination?.current,
            pageSize: params.pagination?.pageSize
        }
    }),

    detail: (id: number) => fetchDataItemService<ContractViewData, {id: number}> ({
        actionName: 'find-contract',
        endpoint: 'CRM',
        payload: {id},
    }),
    saveContract: (data: SaveContactData) => execDataService0<SaveContactData>({
        actionName: 'save-contract',
        endpoint: 'CRM',
        payload: data,
    }),

    listContractType: () => fetchDataListService<LookupDataItem>({
        actionName: 'list-contract-type',
        responseKey: 'contractTypes',
        endpoint: 'CRM',
    
    }),
    
    listTerms: () => fetchDataListService<LookupDataItem>({
        actionName: 'list-terms',
        responseKey: 'terms',
        endpoint: 'CRM',
    }),
    
    listPOSM: fetchDataListService<POSM>({
        actionName: "list-posm",
        endpoint: 'CRM',  
    }),

    savePOSM: (data: SavePosmParams) => execDataService<{data: number}, SavePosmParams>({
        actionName: 'save-posm',
        endpoint: 'CRM',
        payload: data
    }),

    deletePOSM: (id: number) => execDataService0<{id: number}>({
        actionName: 'delete-posm',
        endpoint: 'CRM',
        payload: {id}
    }),

    listContractPOSM: (contractId: number) => fetchDataListService<ContractPOSMItem, {id: number}>({
        actionName: 'list-contract-posm',
        endpoint: 'CRM',
        payload: {id: contractId}
    }),

    listContractDataView:  (customerId: number, visitScheduleId?: number, customerAddressId?:number , checkingDate?: Moment) => fetchDataListService<ContractViewData, {
        id: number; 
        visitScheduleId?: number; 
        customerAddressId?:number; 
        checkingDate?: Moment
    }>({
        actionName: 'list-contract-preview',
        endpoint: 'CRM',
        payload: {id: customerId, visitScheduleId:visitScheduleId ,customerAddressId, checkingDate: checkingDate }
    }),

    saveContractChecked: (item: SaveContractCheckList) => execDataService0<SaveContractCheckList>({
        actionName: 'save_contract_checked',
        endpoint: 'CRM',
        payload: item
    }),

    editContractChecked: (data: EditContractCheck) => execDataService0<EditContractCheck>({
        actionName: 'edit_contract_checked',
        endpoint: 'CRM',
        payload: data
    }),

    terminateContract: (id: number, remarks: string) => execDataService<{id: number, remarks: string}>({
        actionName: 'terminate-contract',
        endpoint: 'CRM',
        payload: {id, remarks}
    }),

    listComplianceStatus: fetchDataListService<LookupDataItem3>({
        actionName: 'list-compliance-status',
        endpoint: 'CRM'
    }),

    listAvailableAddressByContractId: (id: number) => fetchDataListService<AddressInfo, {id: number}>({
        actionName: 'list-available-address-by-contract-id',
        endpoint: 'CRM',
        payload: {id}

    }),

    applyLocationToContract: (contractId: number, customerAddressIds: number[]) => execDataService0<{contractId: number, customerAddressIds: number[]}>({
        actionName: 'apply-location-to-contract',
        endpoint: 'CRM',
        payload: { contractId, customerAddressIds}
    }),

    listPOSMByCustomer :(id:number) =>fetchDataListService({
        actionName:"list-posm-by-customer",
        endpoint:"CRM",
        payload:{id},
    })
}