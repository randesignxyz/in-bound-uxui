import { CrudBaseServices } from "@/services/CrudBaseSevices"
import { SimpleRequestActions } from "@/services/model"
import { execDataService0, fetchDataItemService, fetchDataListService, fetchDataPagingService } from "@/services/apiGateway"
import { FetchPagingParams } from "@/components/DataCrud/TableView"
import { SaveItemData, SearchItemParams, UoM, EmployeeList, SearchEmpParams, WarehouseList, SaveEmpWarehouseMappingData, EmpWhsMappingList, EmpWhsMappingDetail, CheckEmpWhsMapping } from "./data.types"
import { Paging } from "@/services/API"

export const createService = (request: SimpleRequestActions): CrudBaseServices<
    EmpWhsMappingList,
    EmpWhsMappingDetail,
    SearchItemParams &{keyword?:string},
    SaveItemData    
> & {
    fetchUoMList:()=> Promise<UoM[]>
    fetchPagingEmp:(params: FetchPagingParams<SearchEmpParams>)=> Promise<Paging<EmployeeList>>
    fetchWarehouseList:() => Promise<any>
    saveEmpWhsMapping: (data: SaveEmpWarehouseMappingData) =>Promise<any>
    checkEmpNoWhsMapping: (id: string)  =>Promise<any>
} => {
    return {
        fetchPaging: async (params: FetchPagingParams<SearchItemParams &{keyword?:string}>) =>
            fetchDataPagingService<EmpWhsMappingList, FetchPagingParams<SearchItemParams&{keyword?:string}>>({
                actionName: 'fetch-paging-emp-whs-mapping',
                endpoint: 'FMA',
                payload: params,
                pagination: {
                    page: params.pagination?.current,
                    pageSize: params.pagination?.pageSize
                }
            }).query(request)
        ,
        fetchList: async (params: SearchItemParams) =>
            fetchDataListService<EmpWhsMappingList, SearchItemParams>({
                actionName: 'fetch-list-it-request',
                endpoint: 'ICT',
                payload: params
            }).query(request)
        ,
        fetchItem: async (id: number) =>
            fetchDataItemService<EmpWhsMappingDetail, { id: number }>({
                actionName: 'fetch-emp-whs-mapping-detail',
                endpoint: 'FMA',
                payload: { id }
            }).query(request)
        ,
        saveItem: async (data: SaveItemData) =>
            execDataService0<SaveItemData>({
                actionName: 'save-item',
                endpoint: 'FMA',
                payload: data
            })(request)
        ,
        fetchUoMList: async () =>
            fetchDataListService<any, UoM>({
                actionName: 'fetch-uom',
                endpoint: 'FMA',
                // payload: {}
            }).query(request)
        , 
        fetchPagingEmp: async (params: FetchPagingParams<SearchEmpParams>) =>
            fetchDataPagingService<EmployeeList, FetchPagingParams<SearchEmpParams>>({
                actionName: 'fetch-paging-emp',
                endpoint: 'FMA',
                payload: params,
                pagination: {
                    page: params.pagination?.current,
                    pageSize: params.pagination?.pageSize
                }
            }).query(request)
        , 
        fetchWarehouseList: async () =>
            fetchDataListService<WarehouseList, {}>({
                actionName: 'fetch-all-warehouse',
                endpoint: 'FMA'
            }).query(request)
        , 
        saveEmpWhsMapping: async (data: SaveEmpWarehouseMappingData) =>
            execDataService0<SaveEmpWarehouseMappingData>({
                actionName: 'save-emp-whs-mapping',
                endpoint: 'FMA',
                payload: data
            })(request)
        ,
        checkEmpNoWhsMapping: async (id: string) =>
            fetchDataItemService<CheckEmpWhsMapping, { id: string }>({
                actionName: 'check-emp-no-whs-mapping',
                endpoint: 'FMA',
                payload: { id }
            }).query(request)
        ,

    }

}