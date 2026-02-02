import { TableViewSearchParams } from "@/components/DataCrud/TableView"
import { fetchDataItemService, fetchDataListService, fetchDataPagingService, queryDataListService, queryDataPagingService } from "@/services/apiGateway"
import { EmployeeMasterIOS } from "./data"

export const EmployeeIOSAPI = {
    page: (param: any) => fetchDataListService<EmployeeMasterIOS>({
        actionName: 'fetch_ios_emp_master_list',
        endpoint: 'HR',
        payload: param
        // pagination: param.pagination
    }),
    iosEmployeeInit: (param: any) => fetchDataItemService<EmployeeMasterIOS>({
        actionName: 'fetch_init_data_ios_emp_request',
        endpoint: 'HR',
        payload: param
    }),
    pageMasterData: (param: any) => queryDataPagingService<EmployeeMasterIOS>({
        actionName: 'ios-employee-master',
        endpoint: 'HR',
        payload: param,
        pagination: param.pagination
    })
}