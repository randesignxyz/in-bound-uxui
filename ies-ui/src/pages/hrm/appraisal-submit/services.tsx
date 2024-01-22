import { SimpleRequestActions } from "@/services/model";
import { RequestItem,  SearchParams,  AppraisalEmp,  AppraisalEmpSubmissionResult, AppraisalEmPayload, AppraisalDimension, UpdateAppraisalEmPayload, CurrentAppraisalEmpSearch, AppraisalAttachmentFile, AppraisalEmpStatusTotal, AppraisalEmpSubmitAllPayload, AppraisalOverallPerformanceRating, AppraisalMapping, EmployeeInfResult, AppraisalInstructionItem, AppraisalDataLookup } from "./data.types";
import { CrudBaseServices } from "@/services/CrudBaseSevices";
import { FetchPagingParams } from "@/components/DataCrud/TableView";
import { execDataService, execDataService0, fetchDataItemService, fetchDataListService, fetchDataPagingService } from "@/services/apiGateway";
import { TaskActionDataParam } from "@/services/process-workflow/params";
import { Activity } from "@/services/process-workflow/data";


export const createService = ({ request }: { request: SimpleRequestActions; }): CrudBaseServices<
    AppraisalEmp,   
    AppraisalEmp,
    SearchParams,
    AppraisalEmPayload
> & {
    // actionHR: (data: TaskActionDataParam<{id: number; items: RequestItem[]}>) => Promise<void>,
    // findByInstId: (instId: number) => Promise<AppraisalEmp>
    fetchActivityList:(id: number) => Promise<Activity[]>
    fetchAppraisalDimensionList:(id: number) => Promise<AppraisalEmpSubmissionResult[]>
    fetchAppraisalEmpDimensionList:(id: number) => Promise<AppraisalEmpSubmissionResult[]>
    findCurrentAppraisalEmp:(id: number)=> Promise<CurrentAppraisalEmpSearch>
    removeAttachmentList:(id: string)=> Promise<{data: string}>
    addAppraisalAttachment: (appraisalEmpId:number,list: string[]) =>Promise<AppraisalAttachmentFile[]>
    findAppraisalEmpStatusTotal:()=> Promise<AppraisalEmpStatusTotal>,
    findDraftedAppraisalEmpList:()=> Promise<AppraisalEmp[]>,
    submitAllAppraisalEmps:(ids?: AppraisalEmpSubmitAllPayload[])=> Promise<{ok:string}>,
    fetchAppraisalOveralRating:(id:number)=>Promise<AppraisalOverallPerformanceRating[]>,
    fetchAppraisalList:(searchValue?:string)=>Promise<AppraisalMapping[]>,
    fetchEmployeeInfo:(id:number)=> Promise<EmployeeInfResult>,
    fetchAppraisalIntructionList:(id:number)=> Promise<AppraisalInstructionItem[]>,
    fetchAppraisalDataLookupList:()=> Promise<AppraisalDataLookup[]>
} => {
    return {
        fetchPaging: async (params: FetchPagingParams<SearchParams>) =>
            fetchDataPagingService<AppraisalEmp, FetchPagingParams<SearchParams>>({
                actionName: 'fetch-paging-appraisal-submit',
                endpoint: 'HR',
                payload: params,
                 pagination: {
                    page: params.pagination?.current,
                    pageSize: params.pagination?.pageSize
                }
            }).query(request)
        ,
        fetchActivityList: async (id: number) =>
            fetchDataListService<Activity, {id:number}>({
                actionName: 'fetch-appraisal-submit-activity',
                endpoint: 'HR',
                payload: {id}
            }).query(request)
        ,
        removeAttachmentList:  async (id: string) =>
            execDataService<{data: string}, {id:string}>({
                actionName: 'remove-appraisal-attachment',
                endpoint: 'HR',
                payload: {id}
            })(request)
        ,
        addAppraisalAttachment:  async (appraisalEmpId:number,list: string[]) =>
        fetchDataListService<AppraisalAttachmentFile, {id:number,list: string[]}>({
            actionName: 'add-appraisal-attachment',
            endpoint: 'HR',
            payload: {id:appraisalEmpId,list}
        }).query(request)
        ,
        fetchAppraisalDimensionList: async (id: number) =>
            fetchDataListService<AppraisalEmpSubmissionResult, {id:number}>({
                actionName: 'fetch-appraisal-dimension',
                endpoint: 'HR',
                payload: {id}
            }).query(request)
            ,
        fetchAppraisalList: async (searchValue?: string) =>
            fetchDataListService<AppraisalMapping, {searchValue?:string}>({
                actionName: 'fetch-appraisal-list',
                endpoint: 'HR',
                payload: {searchValue}
            }).query(request)
            ,    
        fetchAppraisalEmpDimensionList: async (id: number) =>
                fetchDataListService<AppraisalEmpSubmissionResult, {id:number}>({
                    actionName: 'appraisal-emp-dimension-list',
                    endpoint: 'HR',
                    payload: {id}
                }).query(request)    
        ,
        fetchList: async (params: SearchParams) =>
            fetchDataListService<AppraisalEmp, SearchParams>({
                actionName: 'fetch-list-it-request',
                endpoint: 'HR',
                payload: params
            }).query(request)
        ,
        fetchAppraisalOveralRating: async(id: number) =>
            fetchDataListService<AppraisalOverallPerformanceRating, {id: number}>({
                actionName: 'fetch-appraisal-overall-rating',
                endpoint: 'HR',
                payload: {id}
            }).query(request),
        fetchItem: async (id: number) =>
            fetchDataItemService<AppraisalEmp, { id: number }>({
                actionName: 'fetch-appraisal-emp-by-id',
                endpoint: 'HR',
                payload: { id }
            }).query(request),
        saveItem: async (data: AppraisalEmPayload) =>
            execDataService<{data: string}, AppraisalEmPayload>({
                actionName: 'make-appraisal-submit',
                endpoint: 'HR',
                payload: data
            })(request),
        submitAllAppraisalEmps: async (ids?: AppraisalEmpSubmitAllPayload[])=>
            execDataService<{ok:string},{ids?:AppraisalEmpSubmitAllPayload[]}>({
                actionName:'submit-all-appraisal-emp',
                endpoint:'HR',
                payload: {ids:ids}
            })(request),    
        // findByInstId: async(instId: number) => fetchDataItemService<AppraisalEmp, {id: number}>({
        //     actionName: "fetch-appraisal-emp-by-id",
        //     endpoint: 'HR',
        //     payload: {id: instId}
        // }).query(request),
        findCurrentAppraisalEmp: async(id: number) => fetchDataItemService<CurrentAppraisalEmpSearch, {id: number}>({
            actionName: "fetch-current-appraisal-emp",
            endpoint: 'HR',
            payload: {id: id}
        }).query(request),
        findAppraisalEmpStatusTotal: async() => fetchDataItemService<AppraisalEmpStatusTotal>({
            actionName: "fetch-appraisal-emp-status-total",
            endpoint: 'HR',
            // payload: {id: id}
        }).query(request),
        fetchEmployeeInfo: async(id:number) => fetchDataItemService<EmployeeInfResult,{id:number}>({
            actionName: "fetch-employee-info",
            endpoint: 'HR',
            payload: {id: id}
        }).query(request),
        findDraftedAppraisalEmpList: async()=> fetchDataListService<AppraisalEmp>({
            actionName: 'fetch-drafted-appraisal-emp',
            endpoint: 'HR',
            // payload: {id}
        }).query(request),
        fetchAppraisalIntructionList: async (id: number) =>
            fetchDataListService<AppraisalInstructionItem, {id: number}>({
                actionName: 'appraisal-instruction-list',
                endpoint: 'HR',
                payload: {id}
            }).query(request),
        fetchAppraisalDataLookupList: async () =>
            fetchDataListService<AppraisalDataLookup>({
                actionName: 'fetch-appraisal-data-lookup-list',
                endpoint: 'HR'
            }).query(request)    
    ,
    }
}