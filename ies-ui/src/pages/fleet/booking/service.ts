import { TableViewSearchParams } from "@/components/DataCrud/TableView"
import { RequestActions, ServiceApiType, singleRequest } from "@/services/apiGateway"
import { Page } from "@/services/shared/data"


const BookingService ={
    create:(param:any):ServiceApiType<{}>=>({
        actionName:"booking",
        endpoint:"FLEET",
        type:"EXEC",
        payload:param
    }),
     page:(param?:TableViewSearchParams<any>):ServiceApiType<{}>=>({
        actionName:"bookings",
        endpoint:"FLEET",
        type:"PAGING_QUERY",
        payload:{...param?.criteria},
        pagination:{
            page:param?.pagination?.current,
            pageSize:param?.pagination?.pageSize
        },
        sort:{...param?.criteria?.sort}
    }),
        detail:(param?:{id:number}):ServiceApiType<{}>=>({
        actionName:"booking/detail",
        endpoint:"FLEET",
        type:"FETCH_QUERY",
        payload:param
    }),
}

export const  BookingAPI = (requestAction:RequestActions)=>{
    return {
        page:(param?:TableViewSearchParams<any>)=>singleRequest(BookingService.page(param))(requestAction) as Promise<Page<any>>,
        detail:(param?:{id:number}) =>singleRequest(BookingService.detail(param))(requestAction) as Promise<any>,
        create:(param?:{id:number}) =>singleRequest(BookingService.create(param))(requestAction) as Promise<any>,
    }
}