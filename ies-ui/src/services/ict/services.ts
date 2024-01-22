import { TableViewSearchParams } from '@/components/DataCrud/TableView';
import { Paging } from '../API';
import { RequestActions, ServiceApiType, singleRequest } from '../apiGateway';
import { LookupData, LookupDataType } from '../data';
import { StartWorkFlowParam, TaskActionDataParam } from '../process-workflow/params';
import { AssignedTo, Category, CloseReason, Impact, Incident, IncidentDetailResponse, IncidentEmployee, IncidentListItem, IncidentPayloadParam, IncidentResponse, OnHoldReason, Priority, PriorityMatrix, SlaMatrix, SlaMatrixIncidents, Urgency, WorkgorupMatrix, Workgroup, WorkgroupCategory } from './data';
import {
  IgniteWorkFlowParam,
  IncidentAdvanceSearchParams,
  SaveIncidentParams,
  TicketIncidentReviewParams,
} from './req-params';

export const IncidentParams = {
  list: (
    params: TableViewSearchParams<IncidentAdvanceSearchParams>,
  ): ServiceApiType<{ searchValue?: string }> => ({
    type: 'PAGING_QUERY',
    endpoint: 'ICT',
    actionName: 'list-incident',
    payload: { ...params.criteria },
    pagination: {
      pageSize: params.pagination?.pageSize,
      page: params.pagination?.current,
    },
  }),

  request: (params: IgniteWorkFlowParam<IncidentPayloadParam>): ServiceApiType<IgniteWorkFlowParam<IncidentPayloadParam>> => ({
    type: 'EXEC',
    endpoint: 'ICT',
    actionName: 'incident-request',
    payload: params
  }),

  requestOnly: (params: StartWorkFlowParam<{id: number}>): ServiceApiType<StartWorkFlowParam<{id: number}>> => ({
    type: 'EXEC',
    endpoint: 'ICT',
    actionName: 'incident-request-only',
    payload: params
  }),

  
  save: (params: Incident): ServiceApiType<Incident> => ({
    type: 'EXEC',
    endpoint: 'ICT',
    actionName: 'save-incident',
    payload: { ...params },
  }),

  detail: (id: number): ServiceApiType<{ id: number }> => ({
    type: 'FETCH_QUERY',
    endpoint: 'ICT',
    actionName: 'fetch-incident',
    payload: { id },
  }),

  detailByProcessFlow: (id: string): ServiceApiType<{ id: string }> => ({
    type: 'FETCH_QUERY',
    endpoint: 'ICT',
    actionName: 'detail-by-process-flow',
    payload: { id },
  }),


  reassignSubFunction: (data: TaskActionDataParam<SaveIncidentParams>): ServiceApiType<TaskActionDataParam<SaveIncidentParams>> => ({
    type: 'EXEC',
    endpoint: 'ICT',
    actionName: 'reassign-subfunction',
    payload: data
  }),

  suspendTicket: (data: TaskActionDataParam<SaveIncidentParams>): ServiceApiType<TaskActionDataParam<SaveIncidentParams>> => ({
    type: 'EXEC',
    endpoint: 'ICT',
    actionName: 'suspend-ticket',
    payload: data
  }),

  requestorConfirm: (data: TaskActionDataParam<SaveIncidentParams>): ServiceApiType<TaskActionDataParam<SaveIncidentParams>> => ({
    type: 'EXEC',
    endpoint: 'ICT',
    actionName: 'requestor-confirm',
    payload: data
  }),

  resolvedTicket: (data: TaskActionDataParam<TicketIncidentReviewParams>): ServiceApiType<TaskActionDataParam<TicketIncidentReviewParams>> => ({
    type: 'EXEC',
    endpoint: 'ICT',
    actionName: 'resolved-ticket',
    payload: data
  }),

  listIncidentEmployee: (): ServiceApiType<any> => ({
    type: 'LIST_QUERY',
    endpoint: 'ICT',
    actionName: 'list-incident-employee',
    responseKey: '',
    payload: null
  }),

  listAllCategories: (): ServiceApiType<any> => ({
    type: 'LIST_QUERY',
    endpoint: 'ICT',
    actionName: 'list-all-category',
    responseKey: '',
    payload: null
  }),

  listMainCategory: (): ServiceApiType<any> => ({
    type: 'LIST_QUERY',
    endpoint: 'ICT',
    actionName: 'list-main-category',
    responseKey: '',
    payload: null
  }),

  listSubCategory: (): ServiceApiType<any> => ({
    type: 'LIST_QUERY',
    endpoint: 'ICT',
    actionName: 'list-sub-category',
    responseKey: '',
    payload: null
  }),

  listUrgency: (): ServiceApiType<any> => ({
    type: 'LIST_QUERY',
    endpoint: 'ICT',
    actionName: 'list-urgency',
    responseKey: '',
    payload: null
  }),

  listImpact: (): ServiceApiType<any> => ({
    type: 'LIST_QUERY',
    endpoint: 'ICT',
    actionName: 'list-impact',
    responseKey: '',
    payload: null
  }),

  listPriority: (): ServiceApiType<any> => ({
    type: 'LIST_QUERY',
    endpoint: 'ICT',
    actionName: 'list-priority',
    responseKey: '',
    payload: null
  }),

  listWorkgroup: (): ServiceApiType<any> => ({
    type: 'LIST_QUERY',
    endpoint: 'ICT',
    actionName: 'list-workgroup',
    responseKey: '',
    payload: null
  }),

  listAssignedTo: (): ServiceApiType<any> => ({
    type: 'LIST_QUERY',
    endpoint: 'ICT',
    actionName: 'list-assigned-to',
    responseKey: '',
    payload: null
  }),

  listReportedBy: (): ServiceApiType<any> => ({
    type: 'LIST_QUERY',
    endpoint: 'ICT',
    actionName: 'list-reported-by',
    responseKey: '',
    payload: null
  }),

  listOnHoldReason: (): ServiceApiType<any> => ({
    type: 'LIST_QUERY',
    endpoint: 'ICT',
    actionName: 'list-on-hold-reason',
    responseKey: '',
    payload: null
  }),

  listCloseReason: (): ServiceApiType<any> => ({
    type: 'LIST_QUERY',
    endpoint: 'ICT',
    actionName: 'list-close-reason',
    responseKey: '',
    payload: null
  }),

  listSla: (): ServiceApiType<any> => ({
    type: 'LIST_QUERY',
    endpoint: 'ICT',
    actionName: 'list-sla',
    responseKey: '',
    payload: null
  }),
  
  listLookup: (list: LookupDataType[]): ServiceApiType<{ list: LookupDataType[] }> => ({
    type: 'LIST_QUERY',
    endpoint: 'ICT',
    actionName: 'list-lookup-by-types',
    // responseKey: 'list',
    payload: {
      list
    },
  }),

  listPriorityMatrix: (): ServiceApiType<any> => ({
    type: 'LIST_QUERY',
    endpoint: 'ICT',
    actionName: 'list-priority-matrix',
    responseKey: '',
    payload: null
  }),


  listSlaMatrix: (): ServiceApiType<any> => ({
    type: 'LIST_QUERY',
    endpoint: 'ICT',
    actionName: 'list-sla-matrix',
    responseKey: '',
    payload: null
  }),

  listSlaMatrixIncidents: (incidentIds: number[]): ServiceApiType<any> => ({
    type: 'LIST_QUERY',
    endpoint: 'ICT',
    actionName: 'list-sla-matrix-incidents',
    responseKey: '',
    payload: null
  }),

  listWorkgroupMatrix: (): ServiceApiType<any> => ({
    type: 'LIST_QUERY',
    endpoint: 'ICT',
    actionName: 'list-workgroup-matrix',
    responseKey: '',
    payload: null
  }),

  listWorkgroupCategory
: (): ServiceApiType<any> => ({
    type: 'LIST_QUERY',
    endpoint: 'ICT',
    actionName: 'list-workgroup-category',
    responseKey: '',
    payload: null
  }),
};

export const IncidentServiceAPI = (requestActions: RequestActions) => {
  return {

    list: (params: TableViewSearchParams<IncidentAdvanceSearchParams>) =>singleRequest<IncidentListItem>(IncidentParams.list(params))(requestActions) as Promise<Paging<IncidentListItem>>,
    save: (params: Incident) =>singleRequest(IncidentParams.save(params))(requestActions),
    detail: (id: number) => singleRequest(IncidentParams.detail(id))(requestActions) as Promise<IncidentDetailResponse>,
    detailByProcessFlow: (id: string) => singleRequest(IncidentParams.detailByProcessFlow(id))(requestActions) as Promise<IncidentDetailResponse>,

    request: (params: IgniteWorkFlowParam<IncidentPayloadParam>) =>singleRequest(IncidentParams.request(params))(requestActions) as Promise<IncidentResponse>,
    requestOnly:(params: StartWorkFlowParam<{id: number;}>) => singleRequest(IncidentParams.requestOnly(params))(requestActions) as Promise<IncidentResponse>,

    listIncidentEmplyee: () => singleRequest(IncidentParams.listIncidentEmployee())(requestActions) as Promise<IncidentEmployee[]>,
    
    resolvedTicket: (data: TaskActionDataParam<TicketIncidentReviewParams>) => singleRequest(IncidentParams.resolvedTicket(data))(requestActions),
    requestorConfirm: (data: TaskActionDataParam<TicketIncidentReviewParams>) => singleRequest(IncidentParams.requestorConfirm(data))(requestActions),
    reassignSubFunction: (data: TaskActionDataParam<TicketIncidentReviewParams>) => singleRequest(IncidentParams.reassignSubFunction(data))(requestActions),
    suspendTicket: (data: TaskActionDataParam<TicketIncidentReviewParams>) => singleRequest(IncidentParams.suspendTicket(data))(requestActions),


    listLookup: (types: LookupDataType[]) => singleRequest(IncidentParams.listLookup(types))(requestActions) as Promise<LookupData[]>,

    listUrgency: () => singleRequest(IncidentParams.listUrgency())(requestActions) as Promise<Urgency[]>,
    listImpact: () => singleRequest(IncidentParams.listImpact())(requestActions) as Promise<Impact[]>,
    listPriority: () => singleRequest(IncidentParams.listPriority())(requestActions) as Promise<Priority[]>,

    listAllCategories: () => singleRequest(IncidentParams.listAllCategories())(requestActions) as Promise<Category[]>,
    listMainCategory: () => singleRequest(IncidentParams.listMainCategory())(requestActions) as Promise<Category[]>,
    listSubCategory: () => singleRequest(IncidentParams.listSubCategory())(requestActions) as Promise<Category[]>,

    listWorkgroup: () => singleRequest(IncidentParams.listWorkgroup())(requestActions) as Promise<Workgroup[]>,
    listAssignedTo: () => singleRequest(IncidentParams.listAssignedTo())(requestActions) as Promise<AssignedTo[]>,
    listReportedBy: () => singleRequest(IncidentParams.listReportedBy())(requestActions) as Promise<AssignedTo[]>,


    listOnHoldReason: () => singleRequest(IncidentParams.listOnHoldReason())(requestActions) as Promise<OnHoldReason[]>,
    listCloseReason: () => singleRequest(IncidentParams.listCloseReason())(requestActions) as Promise<CloseReason[]>,

    listPriorityMatrix: () => singleRequest(IncidentParams.listPriorityMatrix())(requestActions) as Promise<PriorityMatrix[]>,
    listSlaMatrix: () => singleRequest(IncidentParams.listSlaMatrix())(requestActions) as Promise<SlaMatrix[]>,
    listSlaMatrixIncidents: (data: number[]) => singleRequest(IncidentParams.listSlaMatrixIncidents(data))(requestActions) as Promise<SlaMatrixIncidents[]>,
    listWorkgroupMatrix: () => singleRequest(IncidentParams.listWorkgroupMatrix())(requestActions) as Promise<WorkgorupMatrix[]>,
    listWorkgroupCategory: () => singleRequest(IncidentParams.listWorkgroupCategory())(requestActions) as Promise<WorkgroupCategory[]>,

  };
};

// const ItemParams = {
//   list: (
//     params: TableViewSearchParams<IncidentAdvanceSearchParams>,
//   ): ServiceApiType<{ searchValue?: string }> => ({
//     type: 'PAGING_QUERY',
//     endpoint: 'ICT',
//     actionName: 'list-item',
//     payload: { ...params.criteria },
//     pagination: {
//       pageSize: params.pagination?.pageSize,
//       page: params.pagination?.current,
//     },
//   }),


//   detail:(id: number): ServiceApiType<{id: number}> => ({
//     type: 'FETCH_QUERY',
//     endpoint: 'ICT',
//     actionName: 'fetch-item-detail',
//     payload: {id}
//   })
// };

