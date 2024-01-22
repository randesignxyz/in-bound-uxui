import { TableViewSearchParams } from '@/components/DataCrud/TableView';
import { Paging } from '@/services/API';
import { RequestActions, ServiceApiType, singleRequest } from '@/services/apiGateway';
import { ServiceTasksCreate, ServiceTasksDTO, ServiceTasksSearch } from './data';

const ServiceTasksAction = {
  save: (vhlt: ServiceTasksCreate): ServiceApiType<ServiceTasksCreate> => ({
    type: 'EXEC',
    actionName: 'save-service-tasks',
    endpoint: 'FLEET',
    payload: { ...vhlt },
  }),

  status: (param:{id:number,status:string}): ServiceApiType<{id:number, status:string}> => ({
    type: 'EXEC',
    actionName: 'update-status-service-tasks',
    endpoint: 'FLEET',
    payload: param,
  }),

  fetch: (id: number): ServiceApiType<{ id: number }> => ({
    type: "FETCH_QUERY",
    actionName: "fetch-service-tasks",
    endpoint: "FLEET",
    payload: { id }
  }),

  page: (
    params: TableViewSearchParams<ServiceTasksSearch>,
  ): ServiceApiType<{ searchValue?: string }> => ({
    type: 'PAGING_QUERY',
    actionName: 'page-service-tasks',
    endpoint: 'FLEET',
    payload: { ...params.criteria },
    pagination: {
      pageSize: params.pagination?.pageSize,
      page: params.pagination?.current,
    },
  }),
};

export const ServiceTasksServiceAPI = (requestActions: RequestActions) => {
  return {
    page: (params: TableViewSearchParams<ServiceTasksSearch>) =>
      singleRequest<ServiceTasksDTO>(ServiceTasksAction.page(params))(requestActions) as Promise<
        Paging<ServiceTasksDTO>
      >,

    save: (params: ServiceTasksCreate) =>
      singleRequest<{ data: string; message: string }>(ServiceTasksAction.save(params))(
        requestActions,
      ),

      status: (params: {id:number, status:string}) =>
      singleRequest<{ data: string; message: string }>(ServiceTasksAction.status(params))(
        requestActions,
      ),

      fetch: (id: number) =>
      singleRequest<ServiceTasksDTO>(ServiceTasksAction.fetch(id))(
        requestActions,
      ) as Promise<ServiceTasksDTO>,
  };
};
