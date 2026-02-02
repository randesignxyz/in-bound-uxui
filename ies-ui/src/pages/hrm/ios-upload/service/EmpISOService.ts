import { RequestActions, ServiceApiType, singleRequest } from '@/services/apiGateway';
import { EmpISOData } from '@/pages/hrm/ipo-upload/service/data';
import { Paging } from '@/services/API';
import { TableViewSearchParams } from '@/components/DataCrud/TableView';

export const IEmpISOService = {
  List: (params: { criteria: { searchValue?: string } }): ServiceApiType<{ searchValue?: string }> => ({
    type: 'PAGING_QUERY',
    endpoint: 'HR',
    actionName: 'fetch_ios_emp_master_page',
    payload: { ...params.criteria },
    pagination: params.pagination,
  }),
};
interface ListParams {
  criteria: { searchValue?: string };
}

interface ListParams {
  searchValue?: string;
}

export const EmpISOServiceAPI = (requestActions?: RequestActions) => ({
  ListAll: (params: TableViewSearchParams<ListParams>) =>
    singleRequest<EmpISOData>(
      IEmpISOService.List({
        criteria: {
          searchValue: params.criteria?.searchValue,
        },
        pagination: params.pagination,
      })
    )(requestActions) as Promise<Paging<EmpISOData>>,
});


