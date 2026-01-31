import { RequestActions, ServiceApiType, singleRequest } from '@/services/apiGateway';
import { EmpISOData } from '@/pages/hrm/ipo-upload/service/data';
import { Paging } from '@/services/API';

export const IEmpISOService = {
  List: (params: { criteria: { searchValue?: string } }): ServiceApiType<{ searchValue?: string }> => ({
    type: 'LIST_QUERY',
    endpoint: 'HR',
    actionName: 'fetch_ios_emp_master_list',
    payload: { ...params.criteria },
  }),
};

interface ListParams {
  criteria: { searchValue?: string };
}

export const EmpISOServiceAPI = (requestActions?: RequestActions) => ({
  ListAll: () =>
    singleRequest<EmpISOData[]>(
      IEmpISOService.List({})
    )(requestActions),
});

