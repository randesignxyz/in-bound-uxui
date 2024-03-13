import { RequestActions, ServiceApiType, singleRequest } from "@/services/apiGateway";
import { ContractCreate, ContractDTO, ContractRequestCreate, ContractRequestDTO, ContractRequestEntry } from "./data";
import { TableViewSearchParams } from "@/components/DataCrud/TableView";
import { ContractAdvanceSearchParams } from "@/pages/crm/contract/types";
import { Page } from "@/services/shared/data";

const ContractAction ={
    saveContractRequest :(data:ContractRequestCreate):ServiceApiType<ContractRequestCreate> =>({
        actionName:"save-contract-request",
        endpoint:"DMS",
        type:"EXEC",
        payload:data
    }),
    saveContract :(data:ContractCreate):ServiceApiType<ContractCreate> =>({
        actionName:"save-contract",
        endpoint:"DMS",
        type:"EXEC",
        payload:data
    }),
    fetchContract:(id?:number):ServiceApiType<{id?:number}> =>({
        actionName:"fetch-contract",
        endpoint:"DMS",
        type:"FETCH_QUERY",
        payload:{id}
    }),
    delete:(id?:number):ServiceApiType<{id?:number}>=>({
        actionName:"delete-contract",
        endpoint:"DMS",
        type:"EXEC",
        payload:{id}
    }),
    pageContractRequest:(params:TableViewSearchParams<ContractAdvanceSearchParams>):ServiceApiType<{searchValue?:string}> =>({
        actionName:"page-contract-request",
        endpoint:"DMS",
        type:"PAGING_QUERY",
        payload: { ...params.criteria },
        pagination: {
            pageSize: params.pagination?.pageSize,
            page: params.pagination?.current,
          }
    })
}


export const ContractServiceAPI =(requestActoin:RequestActions) =>{
    return {
        saveRequest:(data:ContractRequestCreate)=>singleRequest(ContractAction.saveContractRequest(data))(requestActoin),
        saveContract:(data:ContractCreate)=>singleRequest(ContractAction.saveContract(data))(requestActoin),
        fetchContract:(id?:number)=>singleRequest(ContractAction.fetchContract(id))(requestActoin) as Promise<ContractDTO>,
        deleteContract:(id?:number)=>singleRequest(ContractAction.delete(id))(requestActoin),
        pageContractRequest:(params:TableViewSearchParams<ContractAdvanceSearchParams>)=>singleRequest(ContractAction.pageContractRequest(params))(requestActoin) as Promise<Page<ContractDTO>>
    }
}