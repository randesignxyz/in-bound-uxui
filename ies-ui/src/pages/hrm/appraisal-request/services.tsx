import { SimpleRequestActions } from "@/services/model";
import { RequestItem, SavePayLoad, SearchCriteria, SearchParams, AppraisalRequestDetail, AppraisalRequestListItem, AppraisalRequestItemPayload, ReviewerMember, ReviewerMemberPayload, AppraisalLookupData, ApprovalAppraisalRequestItem, PerformanceEvaluationAccessRs } from "./data.types";
import { CrudBaseServices } from "@/services/CrudBaseSevices";
import { FetchPagingParams } from "@/components/DataCrud/TableView";
import { execDataService, execDataService0, fetchDataItemService, fetchDataListService, fetchDataPagingService } from "@/services/apiGateway";
import { TaskActionDataParam } from "@/services/process-workflow/params";
import { AppraisalDataLookup, AppraisalEmp, AppraisalEmpSubmissionResult, EmployeeInfResult } from "../appraisal-submit/data.types";
import { LookupDataItem } from "@/services/data";
import { Paging } from "@/services/API";



export const createService = (request: SimpleRequestActions): CrudBaseServices<
    AppraisalRequestListItem,
    AppraisalRequestDetail,
    SearchParams,
    SavePayLoad
> & {
    actionHR: (data: TaskActionDataParam<{processInstId:string}>) => Promise<void>,
    findByInstId: (instId: string) => Promise<AppraisalRequestDetail>,
    fetchAppraisalSubmissionList:(SearchCriteria: SearchCriteria)=> Promise<AppraisalEmp[]>,
    listAppraisalBu:()=> any,
    listAppraisalFunction:()=> any,
    fetchItemDetail: (id: number) =>Promise<AppraisalEmp>,
    fetchAppraisalDataLookupList:()=> Promise<AppraisalDataLookup[]>,
    fetchAppraisalDimensionList:(id: number) => Promise<AppraisalEmpSubmissionResult[]>,
    saveItemDetail:(item: AppraisalRequestItemPayload)=> Promise<{data:string}>,
    saveMember:(member: ReviewerMemberPayload)=> Promise<{data:string}>,
    deleteMember:(id: number)=> Promise<{data:string}>,
    fetchRequestTypeList:()=> Promise<AppraisalLookupData[]>,
    fetchAppraisalPeriodList:()=> Promise<AppraisalLookupData[]>,
    fetchApprovalAppraisalRequestItemPaging:(params: FetchPagingParams<SearchParams>) => Promise<Paging<ApprovalAppraisalRequestItem>>,
    saveItemConfirmDone:(id: number) => Promise<{data:string}>   
} => {
    return {
        fetchPaging: async (params: FetchPagingParams<SearchParams>) =>
            fetchDataPagingService<AppraisalRequestListItem, FetchPagingParams<SearchParams>>({
                actionName: 'fetch-appraisal-request',
                endpoint: 'HR',
                payload: params,
                 pagination: {
                    page: params.pagination?.current,
                    pageSize: params.pagination?.pageSize
                }
            }).query(request),
        fetchApprovalAppraisalRequestItemPaging: async (params: FetchPagingParams<SearchParams>) =>
            fetchDataPagingService<ApprovalAppraisalRequestItem, FetchPagingParams<SearchParams>>({
                actionName: 'fetch-approval-appraisal-request-item',
                endpoint: 'HR',
                payload: params,
                 pagination: {
                    page: params.pagination?.current,
                    pageSize: params.pagination?.pageSize
                }
            }).query(request),    
        fetchList: async (params: SearchParams) =>
            fetchDataListService<AppraisalRequestListItem, SearchParams>({
                actionName: 'fetch-list-it-request',
                endpoint: 'HR',
                payload: params
            }).query(request),
        fetchItem: async (id: number) =>
            fetchDataItemService<AppraisalRequestDetail, { id: number }>({
                actionName: 'fetch-item-appraisal-request_by_instanceId',
                endpoint: 'HR',
                payload: { id }
            }).query(request),
        saveItem: async (data: SavePayLoad) =>
            execDataService<{data: string}, SavePayLoad>({
                actionName: 'make-appraisal-request',
                endpoint: 'HR',
                payload: data
            })(request),
        saveItemConfirmDone: async (id: number) =>
            execDataService<{data: string}, {id:number}>({
                actionName: 'save-appraisal-request-item-confirm-done',
                endpoint: 'HR',
                payload: {id}
            })(request),    
        findByInstId: async(instId: string) => fetchDataItemService<AppraisalRequestDetail, {id: string}>({
            actionName: "fetch-item-appraisal-request_by_instanceId",
            endpoint: 'HR',
            payload: {id: instId}
        }).query(request),
        actionHR: async(data: TaskActionDataParam<{processInstId: string}>) => execDataService0<TaskActionDataParam<{processInstId:string}>>({
            actionName: 'action-hr-appraisal-request',
            endpoint: 'HR',
            payload: data
        })(request),
        //SKH
        fetchAppraisalSubmissionList: async (searchCriteria: SearchCriteria) =>
        fetchDataListService<AppraisalEmp, SearchCriteria>({
            actionName: 'fetch-appraisal-submission-completed-list',
            endpoint: 'HR',
            payload: searchCriteria
        }).query(request),

        listAppraisalBu: () =>
        fetchDataListService<LookupDataItem>({
            actionName: 'appraisal-bu-lookup',
            responseKey: 'appraisalBuLookup',
            endpoint: 'HR'
            // payload: {}
        }).queryParams,
        listAppraisalFunction: () =>
        fetchDataListService<LookupDataItem>({
            actionName: 'appraisal-function-lookup',
            responseKey: 'appraisalFunctionLookup',
            endpoint: 'HR'
            // payload: {}
        }).queryParams,
        fetchAppraisalDataLookupList: async () =>
        fetchDataListService<AppraisalDataLookup>({
            actionName: 'fetch-appraisal-data-lookup-list',
            endpoint: 'HR'
        }).query(request),
        fetchAppraisalDimensionList: async (id: number) =>
        fetchDataListService<AppraisalEmpSubmissionResult, {id:number}>({
            actionName: 'fetch-appraisal-dimension',
            endpoint: 'HR',
            payload: {id}
        }).query(request),
        fetchItemDetail: async (id: number) =>
            fetchDataItemService<AppraisalEmp, { id: number }>({
                actionName: 'fetch-item-detail-appraisal-request',
                endpoint: 'HR',
                payload: { id }
            }).query(request),           
        saveItemDetail: async (item: AppraisalRequestItemPayload) =>
            execDataService<{data: string}, AppraisalRequestItemPayload>({
                actionName: 'update-item-appraisal-request',
                endpoint: 'HR',
                payload: item
            })(request),   
        saveMember: async (member: ReviewerMemberPayload) =>
            execDataService<{data: string}, ReviewerMemberPayload>({
                actionName: 'save-member-appraisal-request',
                endpoint: 'HR',
                payload: member
            })(request),   
        deleteMember: async (id: number) =>
            execDataService<{data: string}, {id:number}>({
                actionName: 'delete-member-appraisal-request',
                endpoint: 'HR',
                payload: {id}
            })(request),    
        fetchRequestTypeList: async () =>
            fetchDataListService<AppraisalLookupData>({
                actionName: 'fetch-appraisal-request-type',
                endpoint: 'HR'
            }).query(request),  
        fetchAppraisalPeriodList: async () =>
            fetchDataListService<AppraisalLookupData>({
                actionName: 'fetch-appraisal-period',
                endpoint: 'HR'
            }).query(request),            
    }
}