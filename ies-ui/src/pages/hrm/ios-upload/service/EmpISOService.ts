import { RequestActions, ServiceApiType, singleRequest } from '@/services/apiGateway';
import { EmpISOData, IOSEmployeeSearchParams } from '@/pages/hrm/ios-upload/service/data';
import { Paging } from '@/services/API';
import { TableViewSearchParams } from '@/components/DataCrud/TableView';

export const IEmpISOService = {
  List: (params: TableViewSearchParams<IOSEmployeeSearchParams>): ServiceApiType<{ searchValue?: string }> => ({
    type: 'PAGING_QUERY',
    endpoint: 'HR',
    actionName: 'fetch_ios_emp_master_page',
    payload: { ...params.criteria },
    pagination: {
      pageSize: params.pagination?.pageSize,
      page: params.pagination?.current
    }
  }),

  DeleteEmpIOS: (id: string | number ): ServiceApiType<{ id: number | string }> => ({
    type: "EXEC",
    endpoint: "HR",
    actionName: "remove_ios_emp_master_list",
    payload: { id }
  })
};

export const EmpISOServiceAPI = (requestActions?: RequestActions) => ({
  ListAll: (params: TableViewSearchParams<IOSEmployeeSearchParams>) =>
    singleRequest<EmpISOData>(
      IEmpISOService.List(params))(requestActions) as Promise<Paging<EmpISOData>>,

  DeleteEmployeeIOS: (id: number | string)=> singleRequest(IEmpISOService.DeleteEmpIOS(id))(requestActions)
});


