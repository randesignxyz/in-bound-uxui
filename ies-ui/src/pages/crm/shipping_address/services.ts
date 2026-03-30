import { TableViewSearchParams } from "@/components/DataCrud/TableView";
import transfer from "@/pages/fma-stock/transfer";
import { RequestActions, ServiceApiType, singleRequest } from "@/services/apiGateway";
import { Page } from "@/services/shared/data";

const ShippingAddressAction = {
    page: (param?: TableViewSearchParams<any>): ServiceApiType<{}> => ({
        actionName: "page-sale-customer-address",
        endpoint: "CRM",
        type: "PAGING_QUERY",
        payload: { ...param?.criteria },
        pagination: {
            page: param?.pagination?.current,
            pageSize: param?.pagination?.pageSize
        },
        sort: { ...param?.criteria?.sort }
    }),
    detail: (param?: { id: number }): ServiceApiType<{}> => ({
        actionName: "detail",
        endpoint: "CRM",
        type: "FETCH_QUERY",
        payload: param
    }),
    listSalesperson: (param: { id: number }): ServiceApiType<{}> => ({
        actionName: "list-by-sale-customer-address",
        endpoint: "CRM",
        type: "LIST_QUERY",
        payload: param
    }),
    transfer: (param: any): ServiceApiType<{}> => ({
        actionName: "transfer-sale-customer-address",
        endpoint: "CRM",
        type: "EXEC",
        payload: param
    }),
    fetch: (param?: { id: number }): ServiceApiType<{}> => ({
        actionName: "fetch-sale-customer-address",
        endpoint: "CRM",
        type: "FETCH_QUERY",
        payload: param
    }),
}

export const ShippingAddressAPI = (requestAction: RequestActions) => {
    return {
        page: (param?: TableViewSearchParams<any>) => singleRequest(ShippingAddressAction.page(param))(requestAction) as Promise<Page<any>>,
        detail: (param?: { id: number }) => singleRequest(ShippingAddressAction.detail(param))(requestAction) as Promise<any>,
        fetch: (param?: { id: number }) => singleRequest(ShippingAddressAction.fetch(param))(requestAction) as Promise<any>,
        listBySalesperson: (param: { id: number }) => singleRequest(ShippingAddressAction.listSalesperson(param))(requestAction) as Promise<any[]>,
        transfer: (param: any) => singleRequest(ShippingAddressAction.transfer(param))(requestAction) as Promise<any>
    }
}