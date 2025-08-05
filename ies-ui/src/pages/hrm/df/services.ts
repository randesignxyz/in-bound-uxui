import { TableViewSearchParams } from "@/components/DataCrud/TableView";
import { RequestActions, ServiceApiType, singleRequest } from "@/services/apiGateway";
import { DF360EmpDetailRs, DF360EmpListItem, DF360InfoAdvanceSearchParams, DF360Playload, DF360UpdatePlayload } from "./data";
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

}
export const Df360EmpServiceAPI = (requestActions?: RequestActions) => {

    return{
        list: (params: TableViewSearchParams<DF360InfoAdvanceSearchParams>) => singleRequest<DF360EmpListItem>(Df360Params.list(params))(requestActions) as Promise<Paging<DF360EmpListItem>>,
        createDf360Form: (params: DF360Playload) => singleRequest(Df360Params.save(params))(requestActions),
        draftEvaluation:  (params: DF360UpdatePlayload) => singleRequest(Df360Params.draftEvaluation(params))(requestActions),
        submitEvaluation:  (params: DF360UpdatePlayload) => singleRequest(Df360Params.submitEvaluation(params))(requestActions),
        detail: (id: number) => singleRequest(Df360Params.detail(id))(requestActions) as Promise<DF360EmpDetailRs>,
    }
}