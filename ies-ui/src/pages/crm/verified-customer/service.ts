import { TableViewSearchParams } from "@/components/DataCrud/TableView";
import { RequestActions, ServiceApiType, singleRequest } from "@/services/apiGateway";
import { Page } from "@/services/shared/data";

const CustomerWithAddressVerifiedAction = {

    changeStatus: (param: any): ServiceApiType<{}> => ({
        actionName: "status-verified-address-lat-long",
        endpoint: "CRM",
        type: "EXEC",
        payload: param
    }),
    page: (param: TableViewSearchParams<any>): ServiceApiType<{ searchValue?: string }> => ({
        actionName: "page-customer-address-verified",
        endpoint: "CRM",
        type: "PAGING_QUERY",
        payload: { ...param.criteria },
        pagination: {
            current: param.pagination?.current,
            pageSize: param.pagination?.pageSize
        }
    }),
    list: (param: {id:number}): ServiceApiType<{}> => ({
        actionName: "list-customer-address-verified",
        endpoint: "CRM",
        type: "LIST_QUERY",
        payload:param,
       
    }),
    delete: (param: number[]): ServiceApiType<{}> => ({
        actionName: "delete-share-customer-lead",
        endpoint: "CRM",
        type: "EXEC",
        payload: param
    }),
    syncVerifiedLatlong: (): ServiceApiType<{}> => ({
        actionName: "sync-customer-lat-long",
        endpoint: "CRM",
        type: "EXEC",
        payload: {}
    }),
}

export const CustomerWithAddressVerifiedAPI = (requestAction: RequestActions) => {
    return {
        listCustomerLeadBySE: (param: { id: number }) => singleRequest(CustomerWithAddressVerifiedAction.listCustomerLeadBySE(param))(requestAction) as Promise<any[]>,
        saveShare: (param: any) => singleRequest(CustomerWithAddressVerifiedAction.saveShare(param))(requestAction),
        page: (param: TableViewSearchParams<any>) => singleRequest(CustomerWithAddressVerifiedAction.page(param))(requestAction) as Promise<Page<any>>,
        delete: (param: number[]) => singleRequest(CustomerWithAddressVerifiedAction.delete(param))(requestAction),
        changeStatus: (param: any) => singleRequest(CustomerWithAddressVerifiedAction.changeStatus(param))(requestAction),
        syncVerifiedLatlong: () => singleRequest(CustomerWithAddressVerifiedAction.syncVerifiedLatlong())(requestAction),
        list: (param: {id:number}) => singleRequest(CustomerWithAddressVerifiedAction.list(param))(requestAction) as Promise<any[]>
    }
}