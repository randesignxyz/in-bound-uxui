import { RequestActions, ServiceApiType, singleRequest } from "@/services/apiGateway";
import { SalesTeamWorkLess, UoM } from "@/services/sale/data";
import { TableViewSearchParams } from "@/components/DataCrud/TableView";
import { Page } from "@/services/shared/data";
import { CustomerInfo, PurchaseReqeustAdvanceSearch, PurchaseRequestCreate, PurchaseRequestDTO, PurchaseRequestUpdateParam } from "./data";

const PurchaseRequestAction = {
    page: (params: TableViewSearchParams<PurchaseReqeustAdvanceSearch>): ServiceApiType<{ searchValue?: string }> => ({
        actionName: "page-purchase-request",
        endpoint: "SALE",
        type: "PAGING_QUERY",
        payload: { ...params.criteria },
        pagination: {
            pageSize: params.pagination?.pageSize,
            page: params.pagination?.current,
        },
    }),
    customerDistributor: (params: TableViewSearchParams<PurchaseReqeustAdvanceSearch>): ServiceApiType<{ searchValue?: string }> => ({
        actionName: "customer-info",
        endpoint: "CRM",
        type: "PAGING_QUERY",
        payload: { ...params.criteria },
        pagination: {
            pageSize: params.pagination?.pageSize,
            page: params.pagination?.current,
        },
    }),
    salespersonList: (params:{searchValue?:string}): ServiceApiType<{searchValue?:string}> => ({
        type: 'LIST_QUERY',
        endpoint: 'SALE',
        responseKey: 'salespersonList',
        actionName: 'list-sales-team-work',
        payload: params,

    }),
    stockCategory:():ServiceApiType<{}> =>({
        actionName:"stock_category",
        endpoint:"SALE",
        type:"LIST_QUERY",
        payload:{}
    }),
    save:(data:PurchaseRequestCreate):ServiceApiType<PurchaseRequestCreate> =>({
        actionName:"save-purchase-request",
        endpoint:"SALE",
        type:"EXEC",
        payload:data
    }),
    updateStatus:(data:PurchaseRequestUpdateParam):ServiceApiType<PurchaseRequestUpdateParam> =>({
        actionName:"update-status-purchase-request",
        endpoint:"SALE",
        type:"EXEC",
        payload:data
    }),
    uom:():ServiceApiType<{}> =>({
        actionName:"list-uom",
        endpoint:"SALE",
        type:"LIST_QUERY",
        payload:{}
    }),
    fetchData :(id?:number):ServiceApiType<{id?:number}> =>({
        actionName:"detail-purchase-request",
        endpoint:"SALE",
        type:"FETCH_QUERY",
        payload:{id}
    }),
    delte:(id?:number):ServiceApiType<{ id?:number }> =>({
        actionName:"delete-purchase-request",
        endpoint:"SALE",
        type:"EXEC",
        payload:{id}
    })
}

export const PurChaseRequestAPIService = (requestActions: RequestActions) => {
    return {
        page:(params:TableViewSearchParams<PurchaseReqeustAdvanceSearch>)=>singleRequest(PurchaseRequestAction.page(params))(requestActions) as Promise<Page<PurchaseRequestDTO>>,
        customerDistributor:(params:TableViewSearchParams<PurchaseReqeustAdvanceSearch>)=>singleRequest(PurchaseRequestAction.customerDistributor(params))(requestActions) as Promise<Page<CustomerInfo>>,
        salespersonList: (params:{searchValue?:string}) => singleRequest(PurchaseRequestAction.salespersonList(params))(requestActions) as Promise<SalesTeamWorkLess[]>,
        stockCategory: () => singleRequest(PurchaseRequestAction.stockCategory())(requestActions) as Promise<LookupDataDTO[]>,
        save:(data:PurchaseRequestCreate)=>singleRequest(PurchaseRequestAction.save(data))(requestActions) as Promise<{message:string, data:PurchaseRequestCreate}>,
        updateStatus:(data:PurchaseRequestUpdateParam)=>singleRequest(PurchaseRequestAction.updateStatus(data))(requestActions) as Promise<{message:string, data:PurchaseRequestCreate}>,
        uom:()=>singleRequest(PurchaseRequestAction.uom())(requestActions) as Promise<UoM[]>,
        fetchData:(id?:number)=>singleRequest(PurchaseRequestAction.fetchData(id))(requestActions) as Promise<PurchaseRequestDTO>,
        delete:(id?:number)=>singleRequest(PurchaseRequestAction.delte(id))(requestActions) as Promise<{message:string}>
    }
}