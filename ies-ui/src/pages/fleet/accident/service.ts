import { TableViewSearchParams } from "@/components/DataCrud/TableView";
import { Paging } from "@/services/API";
import { RequestActions, ServiceApiType, singleRequest } from "@/services/apiGateway";
import { AccidentCreate, AccidentDTO, SearchAccidentParam } from "./data";


const AccidentAction = {

    save: (param: AccidentCreate):ServiceApiType<AccidentCreate> =>({
        actionName:"save-accident",
        endpoint:"FLEET",
        type:"EXEC",
        payload:param
    }),

    page: (
        params: TableViewSearchParams<SearchAccidentParam>,
      ): ServiceApiType<{ searchValue?: string }> => ({
        type: "PAGING_QUERY",
        actionName: "page-accident",
        endpoint: "FLEET",
        payload: { ...params.criteria },
        pagination: {
          pageSize: params.pagination?.pageSize,
          page: params.pagination?.current,
        },
    }),
}




export const AccidentServiceAPI = (requestActions: RequestActions) => {
    return {
      page : (params: TableViewSearchParams<SearchAccidentParam>)=>
       singleRequest<AccidentDTO>(AccidentAction.page(params))(requestActions) as Promise<Paging<AccidentDTO>> ,

      save: (data: AccidentCreate) =>singleRequest<{data:string, message:string}>(AccidentAction.save(data))(requestActions),
      
    }
};
  