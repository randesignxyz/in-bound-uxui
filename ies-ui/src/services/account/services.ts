import { ServiceType } from "../API"
import { execDataService0, fetchDataItemService, fetchDataListService, fetchDataPagingService, findAllService, findService, RequestActions } from "../apiGateway"
import { Delegation, DelegationSaveParams, UserResult } from "../process-workflow/data"
import { AccountType, SearchAccount } from "./data"

export type AccountServiceName = 'list-user-group' | 'list-users' | 'list-available-candidate'

export const AccountService = (serviceName?: AccountServiceName): ServiceType => {
  return {
    type: 'WORK_FLOW', //TODO: to be seperated
    name: serviceName
  }
}


export const AccountServiceAPI = (actions?: RequestActions) => ({

  findUserOrGroupList: findAllService<{ type: AccountType, searchValue?: string, approveOnly: boolean }, SearchAccount>(AccountService('list-user-group'), actions),

  // findAvailableCandidate: findAllService<{ taskDefKey: string, searchValue?: string }, SearchAccount>(AccountService('list-available-candidate')),

  findUsers: findAllService<{ list: string[] }, SearchAccount>(AccountService('list-users'), actions),

  fetchUser: (userId: string) => fetchDataItemService<UserResult, { id: string }>({
    actionName: 'fetchUser',
    endpoint: 'WORK_FLOW',
    payload: { id: userId }
  }),

})

export const WorkFlowServiceAPI = (actions?: RequestActions) => ({
  save: (data: DelegationSaveParams) => execDataService0({
    actionName: 'save-task-delegation',
    endpoint: 'WORK_FLOW',
    payload: data
  })(actions),


  delete: (id: number) => execDataService0({
    actionName: 'delete-task-delegation',
    endpoint: 'WORK_FLOW',
    payload: { id }
  })(actions),

  list: (taskId: string) => fetchDataListService<Delegation, { id: string }>({
    actionName: 'list-task-delegation',
    endpoint: 'WORK_FLOW',
    payload: { id: taskId }
  }).query(actions)

})


export const AccountServiceAPIs = {
  fetchPagingContributors: (keyworks?: string, approveOnly?: boolean, type?: AccountType) => fetchDataPagingService<SearchAccount, { type: AccountType, searchValue?: String, approveOnly: boolean }>({
    actionName: 'list-user-group',
    endpoint: 'WORK_FLOW',
    payload: {
      approveOnly: approveOnly || true,
      type: type || 'user',
      searchValue: keyworks
    }
  }),


  fetchListContributors: (keyworks?: string, approveOnly?: boolean, type?: AccountType) => fetchDataListService<SearchAccount, { type: AccountType, searchValue?: String, approveOnly: boolean }>({
    actionName: 'list-user-group',
    endpoint: 'WORK_FLOW',
    payload: {
      approveOnly: approveOnly || true,
      type: type || 'user',
      searchValue: keyworks
    }
  }),

  findAvailableCandidate: (taskDefKey: string, searchValue?: string) => fetchDataListService<SearchAccount, { taskDefKey: string, searchValue?: string }>({
    actionName: 'list-available-candidate',
    endpoint: 'WORK_FLOW',
    payload: {
      taskDefKey,
      searchValue
    }
  }),

   findAvailableUsersTask: (procInstId?: string, searchValue?: string) => fetchDataListService<SearchAccount, { procInstId?: string, searchValue?: string }>({
    actionName: 'list-available-users-task',
    endpoint: 'WORK_FLOW',
    payload: {
      procInstId,
      searchValue
    }
  }),

  createSubtask: (taskId: String, userId: String, action: String, remarks: String, uploadedFiles: string[]) => execDataService0<{
    taskId: String, userId: String, action: String, remarks: String, uploadedFiles: string[]
  }>({
    actionName: 'create-sub-task',
    endpoint: 'WORK_FLOW',
    payload: {
      taskId,
      userId,
      action,
      remarks,
      uploadedFiles
    }
  }),

  reassignTask: (taskId: string, userId: string, reassigned: boolean, uploadedFiles: string[], remarks?: string) => execDataService0<{
    taskId: string;
    userId: string;
    remarks?: string;
    reassigned: boolean;
    uploadedFiles: string[];
  }>({
    actionName: 'assign-task',
    endpoint: 'WORK_FLOW',
    payload: {
      taskId,
      userId,
      remarks,
      reassigned,
      uploadedFiles
    }
  })
}

