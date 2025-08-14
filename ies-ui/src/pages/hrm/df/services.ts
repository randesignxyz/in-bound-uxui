import { TableViewSearchParams } from "@/components/DataCrud/TableView";
import { RequestActions, ServiceApiType, singleRequest } from "@/services/apiGateway";
import { AppraisalMapping, DF360EmpDetailRs, DF360EmpListItem, DF360InfoAdvanceSearchParams, DF360Playload, DF360UpdatePlayload, DfAssessorList, DfInstrunctionItemList, EmployeeInfResult } from "./data";
import { Paging } from "@/services/API";

export const Df360Params = {
    list: (
        params: TableViewSearchParams<DF360InfoAdvanceSearchParams>,
    ): ServiceApiType<{ searchValue?: string }> => ({
        type: 'PAGING_QUERY',
        endpoint: 'HR',
        actionName: 'fetch_fd360_emp_page',
        payload: { ...params.criteria },
        pagination: {
            pageSize: params.pagination?.pageSize,
            page: params.pagination?.current,
        },
    }),
    save: (params: DF360Playload): ServiceApiType<DF360Playload> => ({
        type: 'EXEC',
        endpoint: 'HR',
        actionName: 'fd360_emp_create',
        payload: { ...params },
    }),
    draftEvaluation: (params: DF360UpdatePlayload): ServiceApiType<DF360UpdatePlayload> => ({
        type: 'EXEC',
        endpoint: 'HR',
        actionName: 'fd360_emp_draft',
        payload: { ...params },
    }),
    submitEvaluation: (params: DF360UpdatePlayload): ServiceApiType<DF360UpdatePlayload> => ({
        type: 'EXEC',
        endpoint: 'HR',
        actionName: 'fd360_emp_submit',
        payload: { ...params },
    }),
    detail: (id: number): ServiceApiType<{ id: number }> => ({
        type: 'FETCH_QUERY',
        endpoint: 'HR',
        actionName: 'fetch_fd360_emp_detail',
        payload: { id },
    }),
    fetchProbationEmployeeInfo: (id: number): ServiceApiType<{ id: number }> => ({
        type: 'FETCH_QUERY',
        endpoint: 'HR',
        actionName: 'fetch-probation-employee-info',
        payload: { id },
    }),
    fetchProbationEmpList: (searchValue?: string): ServiceApiType<{ searchValue?: string }> => ({
        type: 'LIST_QUERY',
        endpoint: 'HR',
        actionName: 'fetch-probation-evaluation-emp-list',
        payload: { searchValue },
    }),
    fetchAssessorList: (empId: number, type: string): ServiceApiType<{ empId: number, type: string }> => ({
        type: 'LIST_QUERY',
        endpoint: 'HR',
        actionName: 'fetch_fd360_assessor_list',
        payload: { empId, type },
    }),
    fetchDfInstructionList: (): ServiceApiType<{}> => ({
        type: 'LIST_QUERY',
        endpoint: 'HR',
        actionName: 'fetch_fd360_instruction_list',
        payload: { },
    }),

}
export const Df360EmpServiceAPI = (requestActions?: RequestActions) => {

    return{
        list: (params: TableViewSearchParams<DF360InfoAdvanceSearchParams>) => singleRequest<DF360EmpListItem>(Df360Params.list(params))(requestActions) as Promise<Paging<DF360EmpListItem>>,
        createDf360Form: (params: DF360Playload) => singleRequest(Df360Params.save(params))(requestActions),
        draftEvaluation:  (params: DF360UpdatePlayload) => singleRequest(Df360Params.draftEvaluation(params))(requestActions),
        submitEvaluation:  (params: DF360UpdatePlayload) => singleRequest(Df360Params.submitEvaluation(params))(requestActions),
        detail: (id: number) => singleRequest(Df360Params.detail(id))(requestActions) as Promise<DF360EmpDetailRs>,
        fetchProbationEmployeeInfo: (id: number) => singleRequest(Df360Params.fetchProbationEmployeeInfo(id))(requestActions) as Promise<EmployeeInfResult>,
        fetchProbationEmpList: (searchValue?: string) => singleRequest(Df360Params.fetchProbationEmpList(searchValue))(requestActions) as Promise<AppraisalMapping[]>,
        fetchAssessorList: (empId: number, type: string) => singleRequest(Df360Params.fetchAssessorList(empId, type))(requestActions) as Promise<DfAssessorList[]>,
        fetchDfInstructionList: () => singleRequest(Df360Params.fetchDfInstructionList())(requestActions) as Promise<DfInstrunctionItemList[]>,
    }
}