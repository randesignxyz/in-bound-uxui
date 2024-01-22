import { queryCurrent } from "@/services/user"
import { CurrentUser } from "../account/center/data";
import { RequestActions, ServiceApiType, singleRequest } from "@/services/apiGateway";
import { TableViewSearchParams } from "@/components/DataCrud/TableView";
import { Paging } from "@/services/API";


export const userLogin = () =>{
    const data =  queryCurrent();
    return data.then(it=>it)
}




const CoreServiceAction ={
    orgUnitList:():ServiceApiType<{}> =>({
        actionName:"list-org-unit",
        endpoint:"DMS",
        type:"LIST_QUERY",
        payload:{}
    }),

    saveFavorite :(data:Favorite):ServiceApiType<Favorite>=>({
        actionName:"save-favorite",
        endpoint:"DMS",
        type:"EXEC",
        payload:data
    }),
    unFavorite :(data:Favorite):ServiceApiType<Favorite>=>({
        actionName:"save-favorite",
        endpoint:"DMS",
        type:"EXEC",
        payload:data
    }),
    
    pageUserData:(params:TableViewSearchParams<UserDataAdvanceSearchParam>):ServiceApiType<{searchValue?:string}>=>({
        actionName:"page-user",
        endpoint:"DMS",
        type:"PAGING_QUERY",
        payload: { ...params.criteria },
        pagination: {
          pageSize: params.pagination?.pageSize,
          page: params.pagination?.current,
        },
    })
}

export const CoreServiceAPI = (requestActions: RequestActions)=>{
    return {
        orgUnitList:()=>singleRequest(CoreServiceAction.orgUnitList())(requestActions) as Promise<OrgUnitDTO[]>,
        saveFavorite:(data:Favorite)=>singleRequest(CoreServiceAction.saveFavorite(data))(requestActions),
        page : (params: TableViewSearchParams<UserDataDTO>)=>
        singleRequest<UserDataDTO>(CoreServiceAction.pageUserData(params))(requestActions) as Promise<Paging<UserDataDTO>> ,
    }
}