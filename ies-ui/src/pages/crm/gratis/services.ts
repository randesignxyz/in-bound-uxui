import { TableViewSearchParams } from "@/components/DataCrud/TableView";
import { execDataService, execDataService0, fetchDataItemService, fetchDataListService, fetchDataPagingService } from "@/services/apiGateway";
import { ContractLess } from "@/services/crm/contract";
// import { LookupDataItem, LookupDataItem3 } from "@/services/data";
import { AdjustItem, AdjustInfoOn, CreateSettlemenDate, GratisContract, GratisContractViewData, GratisVerifyItem, HistoryItem, IncentiveSettlement, LookupDataItem,  SaveChangeStatusData,  SaveGratisContractCheckListData, SearchCriteria, SettlementCycle, SettlementCycleActivity, SettlementCycleAdvanceSearchParams, SettlementSearchDate, VerifyGratisContact, ItemSAP, GratisVerifySchedule, ApprovalRequestPayload, GratisSuggestedCustomer, GratisSuggestedCustomerVisit, GratisVisitScheduleParams } from "./types";
import moment from "moment";

export const GratisServices = {

    gratisContractCheckList: (params: TableViewSearchParams<SettlementCycleAdvanceSearchParams>) => fetchDataPagingService<IncentiveSettlement, any>({
        actionName: 'list-incentive-settlement',
        endpoint: 'CRM',
        payload: {
            ...params.criteria
        },
        pagination: {
            page: params.pagination?.current,
            pageSize: params.pagination?.pageSize
        }
    }),
    fetchContractToGratisContract: (params:  SettlementSearchDate) => fetchDataListService<ContractLess, SettlementSearchDate>({
        actionName: 'find-contract-to-gratis-contract',
        endpoint: 'CRM',
        payload: params
    }),
    gratisVerifyContract: (id: number) => fetchDataItemService<GratisContractViewData, {id: number}> ({
        actionName: 'find-contract',
        endpoint: 'CRM',
        payload: {id},
    }),
    saveGratisContract: (data: SaveGratisContractCheckListData) => execDataService0<SaveGratisContractCheckListData>({
        actionName: 'save-gratis-contract',
        endpoint: 'CRM',
        payload: data,
    }),
    gratisVerifyContractCheckList: (criteria:{gContractId: number}) => fetchDataListService<VerifyGratisContact, any>({
        actionName: 'list-verify-gratis-contract',
        endpoint: 'CRM',
        payload: {...criteria}
    }),
    saveSettlement: (data: CreateSettlemenDate) => execDataService<{message?: string, id?: number},CreateSettlemenDate>({
        actionName: 'save-incentive-settlement',
        endpoint: 'CRM',
        payload: data,
    }),
    fetchSettlementDetail: (id: number) => fetchDataItemService<IncentiveSettlement, {id: number}>({
        actionName: 'find-incentive-settlement-detail',
        endpoint: 'CRM',
        payload: {id},
    }),
    fetchSettlementDetailByInstId: (id: string) => fetchDataItemService<IncentiveSettlement, {id: string}>({
        actionName: 'find-incentive-settlement-by-inst-id',
        endpoint: 'CRM',
        payload: {id},
    }),
    fetchSettlementContract: (params: {id: number,criteria?:SearchCriteria, pagination?: {current: number,pageSize?: number}},) => fetchDataPagingService<GratisContract, {id: number,criteria?:SearchCriteria, pagination?: {current: number,pageSize?: number}}>({
        actionName: 'list-gratis-contract',
        endpoint: 'CRM',
        payload: {
            id: params.id,
            ...params.criteria
        },
        pagination: {
            page: params.pagination?.current,
            pageSize: params.pagination?.pageSize
        }
    }),
    fetchSuggestedCustomer: (params: {id: number,criteria?:SearchCriteria, pagination?: {current: number,pageSize?: number}},) => fetchDataPagingService<GratisSuggestedCustomer, {id: number,criteria?:SearchCriteria, pagination?: {current: number,pageSize?: number}}>({
        actionName: 'gratis-suggested-customer',
        endpoint: 'CRM',
        payload: {
            id: params.id,
            ...params.criteria
        },
        pagination: {
            page: params.pagination?.current,
            pageSize: params.pagination?.pageSize
        }
    }),
    fetchSuggestedCustomerVisit: (params: {gSettledId: number,criteria?:GratisVisitScheduleParams, pagination?: {current: number,pageSize?: number}},) => fetchDataPagingService<GratisSuggestedCustomerVisit, {gSettledId: number,criteria?:GratisVisitScheduleParams, pagination?: {current: number,pageSize?: number}}>({
        actionName: 'gratis-suggested-customer-visit',
        endpoint: 'CRM',
        payload: {
            gSettledId: params.gSettledId,
            ...params.criteria
        },
        pagination: {
            page: params.pagination?.current,
            pageSize: params.pagination?.pageSize
        }
    }),
    fectchGratisContract: (criteria:{id: number}) => fetchDataItemService<GratisContract, any>({
        actionName: 'find-gratis-contract-detail',
        endpoint: 'CRM',
        payload: {...criteria}
    }),
    saveChangeStatusContractVerify: (data: SaveChangeStatusData) => execDataService0<SaveChangeStatusData>({
        actionName: 'save-change-status-contract-verify',
        endpoint: 'CRM',
        payload: data,
    }), 
    saveChangeStatusSettlementCycle: (data: SaveChangeStatusData) => execDataService0<SaveChangeStatusData>({
        actionName: 'save-change-status-settlement-cycle',
        endpoint: 'CRM',
        payload: data,
    }),
    requestApprovalSettlementCycle: (data: ApprovalRequestPayload) => execDataService0<ApprovalRequestPayload>({
        actionName: 'request-approval-gratis-settlement-cycle',
        endpoint: 'CRM',
        payload: data,
    }),

    listContractType: () => fetchDataListService<LookupDataItem>({
        actionName: 'list-gratis-contract_type_group',
        responseKey: 'contractTypes',
        endpoint: 'CRM',
    }),
    listContractTypeByCode: () => fetchDataListService<LookupDataItem>({
        actionName: 'list-gratis-contract_type_group_by_code',
        responseKey: 'contractTypesByGroupCode',
        endpoint: 'CRM',
    }),
    listLookupTarget: () => fetchDataListService<LookupDataItem>({       
        actionName: 'list-gratis-target',
        responseKey: 'gratisTarget',
        endpoint: 'CRM',
    
    }),
    listLookupSKUSettled: () => fetchDataListService<LookupDataItem>({       
        actionName: 'list-gratis-sku-settled',
        responseKey: 'skuSettled',
        endpoint: 'CRM',
    
    }),
    listLookupIncentive: () => fetchDataListService<LookupDataItem>({       
        actionName: 'list-gratis-incentive',
        responseKey: 'gratisIncentive',
        endpoint: 'CRM',
    }),
    listTerms: () => fetchDataListService<LookupDataItem>({
        actionName: 'list-terms',
        responseKey: 'terms',
        endpoint: 'CRM',
    }),
    fetchSettlementCycleActivityList: (id: number) => fetchDataListService<SettlementCycleActivity, any>({
        actionName: 'list-settlement-cycle-activity',
        endpoint: 'CRM',
        payload: {id}
    }),
     processSettledCalculateCycle: (id:number) => execDataService<{message?: string, id?: number},any>({
        actionName: 'process-settlement-calculate-cycle',
        endpoint: 'CRM',
        payload: {id},
    }),
    fetchSettlementCycle: (id: number, current: number,pageSize: number) => fetchDataPagingService<SettlementCycle, {id: number, pagination?: {current: number,pageSize?: number}}>({
        actionName: 'fetch-settlement-cycle',
        endpoint: 'CRM',
        payload: {id},
        pagination: {
            page: current,
            pageSize:pageSize
        }
    }),
    fetchGratisVerifyItemList: (criteria:SearchCriteria) => fetchDataListService<GratisVerifyItem, any>({
        actionName: 'list-gratis-verify-item',
        endpoint: 'CRM',
        payload: criteria
    }),
    fetchGratisVerifyScheduleList: (criteria:SearchCriteria) => fetchDataListService<GratisVerifySchedule, any>({
        actionName: 'list-gratis-verify-schedule',
        endpoint: 'CRM',
        payload: criteria
    }),
    gratisSaleOrderList: (id: number) => fetchDataListService<AdjustInfoOn, any>({
        actionName: 'list-sale-order',
        endpoint: 'CRM',
        payload: {id}
    }),
    // getListItemSAP: (customerCode?: string,docNum?: string,dataSource?:string,startedDate?:moment.Moment,endedDate?:moment.Moment) => fetchDataListService<ItemSAP, any>({
    //     actionName: 'list-item-sap',
    //     endpoint: 'CRM',
    //     payload: {customerCode,docNum,dataSource,startedDate,endedDate}
    // }),
        getListItemAdjustment: (currentVerifyId: number,customerCode?: string,docNum?: string,dataSource?:string,startedDate?:moment.Moment,endedDate?:moment.Moment) => fetchDataListService<ItemSAP, any>({
        actionName: 'list-item-adjustment',
        endpoint: 'CRM',
        payload: {currentVerifyId,customerCode,docNum,dataSource,startedDate,endedDate}
    }),
    getListSuggestionItemAdjustment: (incentiveSettlementId: number,gVerifyId?: number,gratisSettlementConfigId?:number) => fetchDataListService<ItemSAP, any>({
        actionName: 'list-gratis-suggested-item-adjustment',
        endpoint: 'CRM',
        payload: {incentiveSettlementId,gVerifyId,gratisSettlementConfigId}
    }),
    adjustContractVerifyTrans: (id:number,adjItems: AdjustItem[]) => execDataService0<{contractVerifyId:number,items: AdjustItem[]}>({
        actionName: 'adjust-contract-verify-trans',
        endpoint: 'CRM',
        payload: {
            contractVerifyId:id,
            items: adjItems
        },
    }),
    synchroGratisCustomerVisitSchedule: (tranType: string, gSettledId:number,gVerifyId?: number,scheduleIds?:number[]) => execDataService0<{tranType:string,gSettledId:number,gVerifyId?: number,scheduleIds?:number[]}>({
        actionName: 'synchro-gratis-customer-visit-schedule',
        endpoint: 'CRM',
        payload: {
            gSettledId,
            gVerifyId,
            scheduleIds,
            tranType
        },
    }),
    removeGContractVerifyTrans: (id:number) => execDataService0<{id:number}>({
        actionName: 'remove-g-contract-verify-tran',
        endpoint: 'CRM',
        payload: {id:id},
    }),
    fetchHistoryGratisTransList: (criteria:SearchCriteria) => fetchDataListService<HistoryItem, any>({
        actionName: 'list-gratis-history-trans',
        endpoint: 'CRM',
        payload: criteria
    }),
    fetchExistingGratisIncentive: (params:  SettlementSearchDate) => fetchDataListService<IncentiveSettlement, SettlementSearchDate>({
        actionName: 'fetch-existing-gratis-incentive',
        endpoint: 'CRM',
        payload: params
    })
}