import { TableViewSearchParams } from '@/components/DataCrud/TableView';
import { execDataService, execDataService0, fetchDataItemService, fetchDataListService, fetchDataPagingService } from '@/services/apiGateway';
import { LookupDataItem2 } from '@/services/data';
import { TaskActionDataParam } from '@/services/process-workflow/params';
import { LookupDataItem } from '@/services/shared/data';
import {
  BU,
  Department,
  EmployeeAdvanceSearchParams,
  EmployeeJobDetail,
  EmployeeListItem,
  JobTitle,
  RequestItem,
  RequisitionData,
  StaffRequisitionAdvanceSearchParams,
  StaffRequisitionRequest,
  StaffRequisitionRequestCancel,
  SubDepartment,
} from './data';

export const EmployeeServices = {
  listBu: fetchDataListService<BU>({
    actionName: 'list-bu',
    responseKey: 'buList',
    endpoint: 'HR',
  }),

  listDepartment: fetchDataListService<Department>({
    actionName: 'list-department',
    responseKey: 'deptList',
    endpoint: 'HR',
  }),

  listDepartmentByIds: (ids: number[]) => fetchDataListService<Department, { ids: number[] }>({
    actionName: 'list-department-by-ids',
    responseKey: 'deptList',
    payload: { ids },
    endpoint: 'HR',
  }),

  listSubDepartment: fetchDataListService<SubDepartment>({
    actionName: 'list-sub-department',
    responseKey: 'subDeptList',
    endpoint: 'HR',
  }),

  listLookupData: (list: string[]) =>
    fetchDataListService<LookupDataItem2, { list: string[] }>({
      actionName: 'list-lookup-data',
      endpoint: 'HR',
      payload: { list },
    }),

  listAllByIds: (ids: number[]) =>
    fetchDataListService<LookupDataItem, { ids: number[] }>({
      actionName: 'fetch-all-by-id',
      endpoint: 'HR',
      payload: { ids },
    }),
  list: (params: TableViewSearchParams<EmployeeAdvanceSearchParams>) =>
    fetchDataPagingService<EmployeeListItem, { searchValue?: string }>({
      actionName: 'list-employee',
      endpoint: 'HR',
      payload: { ...params.criteria },
      pagination: {
        pageSize: params.pagination?.pageSize,
        page: params.pagination?.current,
      },
    }),
  EmployeeUpdate: (data: EmployeeListItem) =>
    execDataService0<EmployeeListItem>({
      actionName: 'update-employee-profile',
      endpoint: 'HR',
      payload: { ...data }
    }),
  requisitionRequest: (data: RequisitionData) =>
    execDataService<{ data: string }, RequisitionData>({
      actionName: 'staff-requisition-request',
      endpoint: 'HR',
      payload: data
    }),

  cancelRequisitionRequest: (data: StaffRequisitionRequestCancel) =>
    execDataService<{ data: string }, StaffRequisitionRequestCancel>({
      actionName: 'staff-requisition-request-cancel',
      endpoint: 'HR',
      payload: data
    }),

  fetchStaffRequisitionRequest: (processInstId: string) => fetchDataItemService<StaffRequisitionRequest, { id: string }>({
    actionName: 'fetch-requisition-request',
    endpoint: 'HR',
    payload: { id: processInstId }
  }),

  fetchStaffRequisitionRequestById: (requistionId: number) => fetchDataItemService<StaffRequisitionRequest, { id: number }>({
    actionName: 'fetch-requisition-request-by-id',
    endpoint: 'HR',
    payload: { id: requistionId }
  }),

  hrbpApprove: (data: TaskActionDataParam<{ id: number; proposedBudget: string }>) =>
    execDataService0<TaskActionDataParam<{ proposedBudget: string }>>({
      actionName: 'hrbp-review',
      endpoint: 'HR',
      payload: data
    }),

  listStaffRequisition: (params: TableViewSearchParams<StaffRequisitionAdvanceSearchParams>) =>
    fetchDataPagingService<StaffRequisitionRequest, any>({
      actionName: 'list-staff-requisition',
      endpoint: 'HR',
      payload: { ...params.criteria },
      pagination: {
        pageSize: params.pagination?.pageSize,
        current: params.pagination?.current,
      },
    }),

  listPageJobTitle: (searchValue?: string) => fetchDataPagingService<LookupDataItem, { searchValue?: string }>({
    actionName: 'list-job-title',
    endpoint: 'HR',
    payload: { searchValue }
  }),

  requisitionLookup: (searchValue?: string) => fetchDataListService<LookupDataItem, { searchValue?: string }>({
    actionName: "staff-requisition-lookup",
    endpoint: 'HR',
    payload: { searchValue }
  }),

  fetchJobTitle: (id: number) => fetchDataItemService<JobTitle, { id: number }>({
    actionName: 'fetch-job-title',
    endpoint: 'HR',
    payload: { id }
  }),

  fetchEmployeeJobDetail: (id: number) => fetchDataListService<EmployeeJobDetail, { id: number }>({
    actionName: 'list-employee-basic-info',
    endpoint: 'HR',
    payload: { id }
  }),

  fetchRequestItemByCategories: (ids: number[]) => fetchDataListService<RequestItem, { ids: number[] }>({
    actionName: 'fetch-request-item_by-categories',
    endpoint: 'HR',
    payload: { ids }
  }),
  uploadFilesStaffRequisition: (processInstId: string, attachedFiles: string[]) =>
    execDataService<{ ok?: string }, { processInstId: string, attachedFiles: string[] }>({
      actionName: 'staff-requisition-upload-files',
      endpoint: 'HR',
      payload: { processInstId, attachedFiles }
    }),
  fetchHodOfUsers: (buId: number, keywords?: string, users?: string[]) => fetchDataListService<EmployeeListItem, { buId: number; keywords?: string; users?: string[] }>({
    actionName: 'fetch-hod-of-users',
    endpoint: 'HR',
    payload: { buId, keywords, users }
  }),

  fetchFunctionByUser: (user: string) => fetchDataItemService<Department, { id: string }>({
    actionName: 'fetch-function-by-user',
    endpoint: 'HR',
    payload: { id: user }
  }),


  fetchFunctionsByUsers: (users: string[]) => fetchDataListService<Department, { list: string[] }>({
    actionName: 'fetch-function-by-users',
    endpoint: 'HR',
    payload: { list: users }
  }),

  fetchHodByDeptAndBu: (deptId: number, buId: number) => fetchDataItemService<EmployeeListItem, { deptId: number; buId: number; }>({
    actionName: 'fetch-hod-by-dept-bu',
    endpoint: 'HR',
    payload: { deptId, buId }

  }),

};
