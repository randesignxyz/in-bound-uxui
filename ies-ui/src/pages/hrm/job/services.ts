// services.ts
import { TableViewSearchParams } from "@/components/DataCrud/TableView";
import { RequestActions, ServiceApiType, singleRequest } from "@/services/apiGateway";
import { JobInfoAdvanceSearchParams, ListJob } from './data';
import { Paging } from "@/services/API";


export const JobOperator = {
  list: (
    params: TableViewSearchParams<JobInfoAdvanceSearchParams>,
  ): ServiceApiType<{ searchValue?: string }> => ({
    type: 'PAGING_QUERY',
    endpoint: 'HR',
    actionName: 'fetch-list-job',
    payload: { ...params.criteria },
  }),
  create: (params: Partial<ListJob>): ServiceApiType<Partial<ListJob>> => ({
    type: 'EXEC',
    endpoint: 'HR',
    actionName: 'fetch-create-job',
    payload: { ...params },
  }),
  update: (params: Partial<ListJob>): ServiceApiType<Partial<ListJob>> => ({
    type: 'EXEC',
    endpoint: 'HR',
    actionName: 'fetch-update-job',
    payload: { ...params },
  }),
  delete: (id: number | string): ServiceApiType<{ id: number | string }> => ({
    type: 'EXEC',
    endpoint: 'HR',
    actionName: 'fetch-delete-job',
    payload: { id },
  }),
  detail: (id: number | string): ServiceApiType<{ id: number | string }> => ({
    type: 'FETCH_QUERY',
    endpoint: 'HR',
    actionName: 'fetch-job-by-id',
    payload: { id },
  }),
};

export const JobServiceAPI = (requestActions?: RequestActions) => ({
  listAll: (params: TableViewSearchParams<JobInfoAdvanceSearchParams>) => singleRequest<ListJob>(JobOperator.list(params))(requestActions) as Promise<Paging<ListJob>>,
  createNewJob: (params: Partial<ListJob>) =>
    singleRequest(JobOperator.create(params))(requestActions),
  updateJob: (params: Partial<ListJob>) =>
    singleRequest(JobOperator.update(params))(requestActions),
  deleteJob: (id: number | string) => singleRequest(JobOperator.delete(id))(requestActions),
  detail: (id: number | string) =>
    singleRequest(JobOperator.detail(id))(requestActions) as Promise<ListJob>,
});
