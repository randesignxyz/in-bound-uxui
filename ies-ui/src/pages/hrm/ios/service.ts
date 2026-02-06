import { TableViewSearchParams } from "@/components/DataCrud/TableView";
import { execDataService, fetchDataItemService, fetchDataListService, fetchDataPagingService, queryDataPagingService } from "@/services/apiGateway";
import { EmployeeRecord } from "../master-data/data";
import { IosEmpRequest, IosEmpRequestDetail, IosRequestPayload } from "./data";


export const IOSService = {
    // employees: (param: TableViewSearchParams<any>) => fetchDataPagingService<EmployeeRecord, { searchValue: string }>({
    //     actionName: 'employee-ios',
    //     endpoint: 'HR',
    //     payload: param.criteria,
    //     pagination: param.pagination
    // }),

    page: (param: TableViewSearchParams<any>) => queryDataPagingService<IosEmpRequest>({
        actionName: 'fetch_ios_emp_request_page',
        endpoint: 'HR',
        payload: param.criteria,
        pagination: param.pagination
    }),
    // page: (param: TableViewSearchParams<any>) => fetchDataPagingService<EmployeeRecord>({
    //     actionName: 'ios-employee-request',
    //     endpoint: 'HR',
    //     payload: param.criteria,
    //     pagination: param.pagination
    // }),
    save: (param: IosRequestPayload) => execDataService({
        actionName: 'ios-emp-request',
        endpoint: 'HR',
        payload: param
    }),
    update: (param: IosRequestPayload) => execDataService({
        actionName: 'update-ios-emp-request',
        endpoint: 'HR',
        payload: param
    }),
    detail: (param: { id?: number }) => fetchDataItemService<IosEmpRequestDetail>({
        actionName: 'fetch_ios_emp_request',
        endpoint: 'HR',
        payload: param
    }),

    saveBatch: (param: { ids: number[], comment: string, action: string }) => execDataService({
        actionName: 'ios-emp-request-batch',
        endpoint: 'HR',
        payload: param
    }),


}