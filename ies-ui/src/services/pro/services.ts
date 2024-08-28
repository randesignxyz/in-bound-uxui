import { TableViewSearchParams } from '@/components/DataCrud/TableView';
import { Paging } from '../API';
import { RequestActions, ServiceApiType, fetchDataItemService, fetchDataListService, fetchDataPagingService, singleRequest } from '../apiGateway';
import { StartWorkFlowParam, TaskActionDataParam } from '../process-workflow/params';
import { BudgetCodeListItem, ItemDetail, ItemGroupListItem, ItemListItem, ProDepartment, ProEmployee, RequisitionDetailResponse, RequisitionItemDetailResponse, RequisitionItemList, RequisitionListItem, RequisitionResponse, RequisitionServiceItemDetailResponse, Requistion } from './data';
import {
  ItemAdvanceSearchParams,
  RequisitionAdvanceSearchParams,
  RequisitionBudgetCodeReviewParams,
  RequisitionProReviewparams,
} from './req-params';
import { RequisitionDetailWithQuotatopmResponse } from '@/pages/pro/price-comparison/data';

export const RequisitionParams = {
  list: (
    params: TableViewSearchParams<RequisitionAdvanceSearchParams>,
  ): ServiceApiType<{ searchValue?: string }> => ({
    type: 'PAGING_QUERY',
    endpoint: 'PRO',
    actionName: 'list-requisition',
    payload: { ...params.criteria },
    pagination: {
      pageSize: params.pagination?.pageSize,
      page: params.pagination?.current,
    },
  }),


  request: (params: StartWorkFlowParam<Requistion>): ServiceApiType<StartWorkFlowParam<Requistion>> => ({
    type: 'EXEC',
    endpoint: 'PRO',
    actionName: 'requisition-request',
    payload: params
  }),

  requestOnly: (params: StartWorkFlowParam<{ id: number }>): ServiceApiType<StartWorkFlowParam<{ id: number }>> => ({
    type: 'EXEC',
    endpoint: 'PRO',
    actionName: 'requisition-request-only',
    payload: params
  }),

  post: (id: number): ServiceApiType<{ id: number }> => ({
    type: 'EXEC',
    endpoint: 'PRO',
    actionName: 'post-pr-to-sap',
    payload: {
      id
    }
  }),

  save: (params: Requistion): ServiceApiType<Requistion> => ({
    type: 'EXEC',
    endpoint: 'PRO',
    actionName: 'save-requisition',
    payload: { ...params },
  }),

  detail: (id: number): ServiceApiType<{ id: number }> => ({
    type: 'FETCH_QUERY',
    endpoint: 'PRO',
    actionName: 'fetch-requisition',
    payload: { id },
  }),

  detailByProcessFlow: (id: string): ServiceApiType<{ id: string }> => ({
    type: 'FETCH_QUERY',
    endpoint: 'PRO',
    actionName: 'detail-by-process-flow',
    payload: { id },
  }),

  listBudgetCode: (buId?: number): ServiceApiType<any> => ({
    type: 'LIST_QUERY',
    endpoint: 'PRO',
    actionName: 'list-budget-code',
    responseKey: '',
    payload: {
      buId
    }
  }),

  listBudgetCodeByDept: (deptId: number): ServiceApiType<{ id: number }> => ({
    type: 'LIST_QUERY',
    endpoint: 'PRO',
    actionName: 'list-budget-code-by-dept',
    payload: { id: deptId }
  }),

  saveBudgetCodeReview: (data: TaskActionDataParam<RequisitionBudgetCodeReviewParams>): ServiceApiType<TaskActionDataParam<RequisitionBudgetCodeReviewParams>> => ({
    type: 'EXEC',
    endpoint: 'PRO',
    actionName: 'save-budget-review',
    payload: data
  }),

  saveProReview: (data: TaskActionDataParam<RequisitionProReviewparams>): ServiceApiType<TaskActionDataParam<RequisitionProReviewparams>> => ({
    type: 'EXEC',
    endpoint: 'PRO',
    actionName: 'save-pro-review',
    payload: data
  }),


  listItemById: (id: number): ServiceApiType<{ id: number }> => ({
    type: 'LIST_QUERY',
    endpoint: 'PRO',
    actionName: "fetch-pr-items-by-pr-id",
    payload: { id }
  }),

  listProEmployee: (): ServiceApiType<any> => ({
    type: 'LIST_QUERY',
    endpoint: 'PRO',
    actionName: 'list-pro-employee',
    responseKey: '',
    payload: null
  }),

  listProDepartment: (): ServiceApiType<any> => ({
    type: 'LIST_QUERY',
    endpoint: 'PRO',
    actionName: 'list-pro-department',
    responseKey: '',
    payload: null,
  }),
};


export const RequisitionServiceAPI = (requestActions?: RequestActions) => {
  return {
    list: (params: TableViewSearchParams<RequisitionAdvanceSearchParams>) => singleRequest<RequisitionListItem>(RequisitionParams.list(params))(requestActions) as Promise<Paging<RequisitionListItem>>,
    save: (params: Requistion) => singleRequest(RequisitionParams.save(params))(requestActions),

    detail: (id: number) => singleRequest(RequisitionParams.detail(id))(requestActions) as Promise<RequisitionDetailResponse>,

    details: (ids: number[]) => fetchDataListService<RequisitionDetailResponse, { ids: number[] }>({
      actionName: 'fetch-requisitions',
      endpoint: 'PRO',
      payload: { ids }
    }).query(requestActions),

    detailWithQuotation: (id: number) => fetchDataItemService<RequisitionDetailWithQuotatopmResponse, { id: number }>({
      actionName: 'fetch-pr-quotation-by-pr-id',
      endpoint: 'PRO',
      payload: { id }
    }).query(requestActions),
    // listItemListById: (id: number) => singleRequest(RequisitionParams.listItemById(id))(requestActions) as Promise<RequisitionItemList>, 

    //fetch-pr-quotations-by-pr-ids
    detailsWithQuotations: (ids: number[]) => fetchDataListService<RequisitionDetailWithQuotatopmResponse, { ids: number[] }>({
      actionName: 'fetch-pr-quotations-by-pr-ids',
      endpoint: 'PRO',
      payload: { ids }
    }).query(requestActions),

    detailByProcessFlow: (id: string) => singleRequest(RequisitionParams.detailByProcessFlow(id))(requestActions) as Promise<RequisitionDetailResponse>,

    request: (params: StartWorkFlowParam<Requistion>) => singleRequest(RequisitionParams.request(params))(requestActions) as Promise<RequisitionResponse>,
    requestOnly: (params: StartWorkFlowParam<{ id: number; }>) => singleRequest(RequisitionParams.requestOnly(params))(requestActions) as Promise<RequisitionResponse>,

    post: (id: number) => singleRequest(RequisitionParams.post(id))(requestActions) as Promise<RequisitionResponse>,

    listBudgetCode: (buId?: number) => singleRequest(RequisitionParams.listBudgetCode(buId))(requestActions) as Promise<BudgetCodeListItem[]>,
    listBudgetCodeByDept: (deptId: number) => singleRequest(RequisitionParams.listBudgetCodeByDept(deptId))(requestActions) as Promise<BudgetCodeListItem[]>,
    saveBudgetCodeReviews: (data: TaskActionDataParam<RequisitionBudgetCodeReviewParams>) => singleRequest(RequisitionParams.saveBudgetCodeReview(data))(requestActions),
    listProEmplyee: () => singleRequest(RequisitionParams.listProEmployee())(requestActions) as Promise<ProEmployee[]>,
    saveProReview: (data: TaskActionDataParam<RequisitionProReviewparams>) => singleRequest(RequisitionParams.saveProReview(data))(requestActions),
    listProDepartment: () => singleRequest(RequisitionParams.listProDepartment())(requestActions) as Promise<ProDepartment[]>,

    listForPQ: (params: TableViewSearchParams<RequisitionAdvanceSearchParams>) => fetchDataPagingService<RequisitionListItem>({
      actionName: 'fetch-pr-for-pq',
      endpoint: 'PRO',
      payload: { ...params.criteria },
      pagination: {
        pageSize: params.pagination?.pageSize,
        page: params.pagination?.current,
      },


    })
  };
};

const ItemParams = {
  list: (
    params: TableViewSearchParams<ItemAdvanceSearchParams>,
  ): ServiceApiType<{ searchValue?: string }> => ({
    type: 'PAGING_QUERY',
    endpoint: 'PRO',
    actionName: 'list-item',
    payload: { ...params.criteria, },
    pagination: {
      pageSize: params.pagination?.pageSize,
      page: params.pagination?.current,
    },
  }),

  listAllItemGroup: (): ServiceApiType<any> => ({
    type: 'LIST_QUERY',
    endpoint: 'PRO',
    actionName: 'list-all-item-group',
    responseKey: '',
    payload: null
  }),

  listAllItemGroupByBu: (buId: number): ServiceApiType<any> => ({
    type: 'LIST_QUERY',
    endpoint: 'PRO',
    actionName: 'list-all-item-group-by-bu',
    responseKey: '',
    payload: {
      buId
    }
  }),

  detail: (id: number): ServiceApiType<{ id: number }> => ({
    type: 'FETCH_QUERY',
    endpoint: 'PRO',
    actionName: 'fetch-item-detail',
    payload: { id }
  })
};

export const ItemServiceAPI = (requestActions: RequestActions) => {
  return {
    list: (params: TableViewSearchParams<ItemAdvanceSearchParams>) => singleRequest<ItemListItem>(ItemParams.list(params))(requestActions) as Promise<Paging<ItemListItem>>,
    listAllItemGroup: () => singleRequest<ItemGroupListItem>(ItemParams.listAllItemGroup())(requestActions) as Promise<ItemGroupListItem[]>,
    listAllItemGroupByBu: (id: number) => singleRequest<ItemGroupListItem>(ItemParams.listAllItemGroupByBu(id))(requestActions) as Promise<ItemGroupListItem[]>,
    detail: (id: number) => singleRequest(ItemParams.detail(id))(requestActions) as Promise<ItemDetail>
  };
};
