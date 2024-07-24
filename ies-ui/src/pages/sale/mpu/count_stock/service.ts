import { TableViewSearchParams } from "@/components/DataCrud/TableView";
import { RequestActions, ServiceApiType, singleRequest } from "@/services/apiGateway";
import { CountStockDto } from "@/services/sale/data";
import { Page } from "@/services/shared/data";

const CountStockAction = {

    page :(param:TableViewSearchParams<CountStockAdvanceSearch>):ServiceApiType<{searchValue?:string}> =>({
        actionName:"page-for-stock-count",
        endpoint:"SALE",
        type:"PAGING_QUERY",
        payload:{
            ...param.criteria
        },
        pagination:{
            page:param.pagination?.current,
            pageSize:param.pagination?.pageSize
        }
    }),

    detail:(id?:number):ServiceApiType<{id?:number}> =>({
        actionName:"detail-stock-count",
        endpoint:"SALE",
        type:"FETCH_QUERY",
        payload:{id}
    })
}


export const CountStockServiceAPI = (requestAction:RequestActions) =>{
    return {
        page :(param:TableViewSearchParams<CountStockAdvanceSearch>)=>singleRequest(CountStockAction.page(param))(requestAction) as Promise<Page<StockCountDto>>,
        detail:(id?:number) =>singleRequest(CountStockAction.detail(id))(requestAction) as Promise<StockCountDto>
    }
}