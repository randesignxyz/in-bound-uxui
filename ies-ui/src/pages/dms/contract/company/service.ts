import { TableViewSearchParams } from "@/components/DataCrud/TableView";
import { RequestActions, ServiceApiType, singleRequest } from "@/services/apiGateway";
import { Page } from "@/services/shared/data";

const CompanyAction={
    save:(data:CompanyEntryCreate):ServiceApiType<CompanyEntryCreate> =>({
        actionName:"save-company",
        endpoint:"DMS",
        type:"EXEC",
        payload:data
    }),
    fetch:(id?:number):ServiceApiType<{id?:number}> =>({
        actionName:"fetch-company",
        endpoint:"DMS",
        type:"FETCH_QUERY",
        payload:{id},

    }),

    page:(params:TableViewSearchParams<CompanyAdvanceSearchParam>):ServiceApiType<{searchValue?:string}>=>({
        actionName:"page-company",
        endpoint:"DMS",
        type:"PAGING_QUERY",
        payload: { ...params.criteria },
        pagination: {
            pageSize: params.pagination?.pageSize,
            page: params.pagination?.current,
          }
    })
}

export const CompanySerivceAPI = (requestAction:RequestActions)=>{
    return {
        save:(data:CompanyEntryCreate)=>singleRequest(CompanyAction.save(data))(requestAction),
        fetch:(id?:number) =>singleRequest(CompanyAction.fetch(id))(requestAction) as Promise<CompanyDTO>,
        page:(params:TableViewSearchParams<CompanyAdvanceSearchParam>) =>singleRequest(CompanyAction.page(params))(requestAction) as Promise<Page<CompanyDTO>>
    }
}