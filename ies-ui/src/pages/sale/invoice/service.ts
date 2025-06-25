import { TableViewSearchParams } from "@/components/DataCrud/TableView";
import { RequestActions, ServiceApiType, singleRequest } from "@/services/apiGateway";
import { Page } from "@/services/shared/data";


const InvoiceAction = {
    pageInvoice: (param: TableViewSearchParams<any>): ServiceApiType<{}> => ({
        actionName: "page-sale-invoice",
        endpoint: "SALE",
        type: "PAGING_QUERY",
        payload: {...param.criteria},
        pagination: param.pagination,
        sort: param.criteria?.sort
    }),
    saveSaleInvoiceRemark: (param: { id?: number, remark: string }): ServiceApiType<{}> => ({
        actionName: "save-sale-invoice-remark",
        endpoint: "SALE",
        type: "EXEC",
        payload: param
    }),
}

export const InvoiceServiceAPI = (requestAction: RequestActions) => {
    return {
        pageInvoice: (param: TableViewSearchParams<any>) => singleRequest(InvoiceAction.pageInvoice(param))(requestAction) as Promise<Page<any>>,
        saveSaleInvoiceRemark: (param: { id?: number, remark: string }) => singleRequest(InvoiceAction.saveSaleInvoiceRemark(param))(requestAction) as Promise<any>,
    }
}
