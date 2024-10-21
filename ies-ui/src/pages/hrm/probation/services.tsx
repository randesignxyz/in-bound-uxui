import { SimpleRequestActions } from "@/services/model";
import { RequestItem,  SearchParams,  ProbationEvaluationEmpList,  AppraisalEmpSubmissionResult, AppraisalEmPayload, AppraisalDimension, UpdateAppraisalEmPayload, CurrentAppraisalEmpSearch, AppraisalAttachmentFile, AppraisalEmpStatusTotal, AppraisalEmpSubmitAllPayload, AppraisalOverallPerformanceRating, AppraisalMapping, EmployeeInfResult, AppraisalInstructionItem, AppraisalDataLookup, ProbationEvaluationResources, ProbationEvaluationResourcesSupport, ProbationEvaluationDetailRs, ProbationEvaluationPayload, ProbationFormType, ProbationEvaluationRef } from "./data.types";
import { CrudBaseServices } from "@/services/CrudBaseSevices";
import { FetchPagingParams } from "@/components/DataCrud/TableView";
import { execDataService, execDataService0, fetchDataItemService, fetchDataListService, fetchDataPagingService } from "@/services/apiGateway";
import { TaskActionDataParam } from "@/services/process-workflow/params";
import { Activity } from "@/services/process-workflow/data";
import { ProbationEvaluationData } from "../data";


export const createService = ({ request }: { request: SimpleRequestActions; }): CrudBaseServices<
ProbationEvaluationEmpList,   
ProbationEvaluationEmpList,
    SearchParams,
    AppraisalEmPayload
> & {
    // actionHR: (data: TaskActionDataParam<{id: number; items: RequestItem[]}>) => Promise<void>,
    // findByInstId: (instId: number) => Promise<AppraisalEmp>
    request:(data: ProbationEvaluationData)=> Promise<any>,
    insertAssessment:(data: TaskActionDataParam<ProbationEvaluationPayload>)=> Promise<any>,
    updateAssessment:(data: TaskActionDataParam<ProbationEvaluationPayload>)=> Promise<any>,
    fetchProbationFormTypeList:()=> Promise<ProbationFormType[]>,
    fetchProbationEvaluationRefList:(empId: number)=> Promise<ProbationEvaluationRef[]>,

    fetchActivityList:(id: number) => Promise<Activity[]>
    fetchAppraisalDimensionList:(id: number) => Promise<AppraisalEmpSubmissionResult[]>
    fetchAppraisalEmpDimensionList:(id: number) => Promise<AppraisalEmpSubmissionResult[]>
    findCurrentAppraisalEmp:(id: number)=> Promise<CurrentAppraisalEmpSearch>
    removeAttachmentList:(id: string)=> Promise<{data: string}>
    addAppraisalAttachment: (appraisalEmpId:number,list: string[]) =>Promise<AppraisalAttachmentFile[]>
    findAppraisalEmpStatusTotal:()=> Promise<AppraisalEmpStatusTotal>,
    findDraftedAppraisalEmpList:()=> Promise<ProbationEvaluationEmpList[]>,
    submitAllAppraisalEmps:(ids?: AppraisalEmpSubmitAllPayload[])=> Promise<{ok:string}>,
    fetchAppraisalOveralRating:(id:number)=>Promise<AppraisalOverallPerformanceRating[]>,
    fetchProbationEmpList:(searchValue?:string)=>Promise<AppraisalMapping[]>,
    fetchEmployeeInfo:(id:number)=> Promise<EmployeeInfResult>,
    fetchAppraisalIntructionList:(id:number)=> Promise<AppraisalInstructionItem[]>,
    fetchAppraisalDataLookupList:()=> Promise<AppraisalDataLookup[]>,
    fetchProbationEvaluationResourcesList:()=> Promise<ProbationEvaluationResources[]>,
    fetchProbationEvaluationResourcesSupportList:()=> Promise<ProbationEvaluationResourcesSupport[]>,
    detailByProcessFlow: (instId: string) => Promise<ProbationEvaluationDetailRs>
} => {
    return {
        request: async (data: ProbationEvaluationData) =>
            execDataService<{data: string}, ProbationEvaluationData>({
                actionName: 'probation-evaluation-request',
                endpoint: 'HR',
                payload: data
            })(request),
        insertAssessment: async (data: TaskActionDataParam<ProbationEvaluationPayload>) =>
            execDataService<{data: string}, TaskActionDataParam<ProbationEvaluationPayload>>({
                actionName: 'probation-evaluation-insert-assessment',
                endpoint: 'HR',
                payload: data
            })(request),
        updateAssessment: async (data: TaskActionDataParam<ProbationEvaluationPayload>) =>
                execDataService<{data: string}, TaskActionDataParam<ProbationEvaluationPayload>>({
                    actionName: 'probation-evaluation-assessment-submission',
                    endpoint: 'HR',
                    payload: data
                })(request),
        fetchProbationFormTypeList: async () =>
            fetchDataListService<ProbationFormType>({
                actionName: 'fetch-probation-form-type-list',
                endpoint: 'HR'
            }).query(request),            
        fetchProbationEvaluationRefList: async (empId: number) =>
                fetchDataListService<ProbationEvaluationRef,{empId: number}>({
                    actionName: 'fetch_probation_evaluation_ref_list',
                    endpoint: 'HR',
                    payload: {empId},
                }).query(request),            
          

        fetchPaging: async (params: FetchPagingParams<SearchParams>) =>
            fetchDataPagingService<ProbationEvaluationEmpList, FetchPagingParams<SearchParams>>({
                actionName: 'probation-evaluation-page',
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
        fetchProbationEmpList: async (searchValue?: string) =>
            fetchDataListService<AppraisalMapping, {searchValue?:string}>({
                actionName: 'fetch-probation-evaluation-emp-list',
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
            fetchDataListService<ProbationEvaluationEmpList, SearchParams>({
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
            fetchDataItemService<ProbationEvaluationEmpList, { id: number }>({
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
        findDraftedAppraisalEmpList: async()=> fetchDataListService<ProbationEvaluationEmpList>({
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
            }).query(request),
        fetchProbationEvaluationResourcesList: async () =>
            fetchDataListService<ProbationEvaluationResources>({
                actionName: 'fetch_probation_evaluation_resources',
                endpoint: 'HR'
            }).query(request),  
        fetchProbationEvaluationResourcesSupportList: async () =>
                fetchDataListService<ProbationEvaluationResourcesSupport>({
                    actionName: 'fetch_probation_evaluation_resources',
                    endpoint: 'HR'
                }).query(request),    
        detailByProcessFlow: async(instId: string) => fetchDataItemService<ProbationEvaluationDetailRs>({
                actionName: 'probation-evaluation-detail-by-process-flow',
                endpoint: 'HR',
                payload: {id:instId}
            }).query(request),

    }
}