import { ServiceType } from "../API";
import { execDataService0, execDownloadForm, execService, findAllService, findPagingService, findService, RequestActions } from "../apiGateway";
import { AttachmentFile } from "../data";

import { ActionData, BMPNData, ConfigEndEventParams, ConfigEndEventRs, Delegation, DelegationSaveParams, DiagramData, InstanceActivity, InstanceSearchParams, MessageTemplate, NotificationFeedback, OriginatorAuth, ProcessInstance, ProcessInstanceData, ProcessInstanceDef, ProcessInstanceDefItem, SaveFirstLevelApproval, SaveWorkflowOriginator, StartProcessAction, UserDestItem, UserResult, UserTask } from "./data";

export type WorkflowServiceName = 'fetchInstanceData'
  | 'fetchDiagram'
  | 'extractDiagramDef'
  | 'deployWorkflow'
  | 'fetchWorkflowOriginator'
  | 'fetchDestApproval'
  | 'fetchProcessDef'
  | 'saveOriginator'
  | 'saveDestApproval'

  | 'fetchUser'
  | 'startWorkflow'
  | 'completeTask'
  | 'createManualTask'
  | 'fetchProcessPayload'

  | 'listTasks'

  | 'taskItemList'
  | 'completedActivityList'
  | 'userDestList'
  | 'claim'
  | 'unClaim'

  | 'listInstances'
  | 'list-process-def'
  | 'notificationFeedbackList'
  | 'saveNotificationFeedback'
  | 'fetchNotificationFeedback'

  | 'check-initial-sponsor'
  | 'list-uploaded-files'
  | 'fetch-base64-by-file-id'
  | 'extract-diagram-def'
  | 'fetch-workflow-originator'
  | 'fetch-dest-approval'
  | 'fetch-notification-feedback'
  | 'deploy-workflow'
  | 'save-dest-approval'
  | 'save-originator'

  | 'list-message-template'
  | 'fetch-config-end-event'
  | 'save-config-end-event'
  | 'list-activity'
  | 'force-complete-tasks'
  | 'list-available-process-def'

export const WorkFlowService = (serviceName?: WorkflowServiceName): ServiceType => {
  return {
    type: 'WORK_FLOW',
    name: serviceName
  }
}

export const WorkflowServiceAPI = (actions?: RequestActions) => ({

  startWorkflow: execService<StartProcessAction, UserTask>(WorkFlowService('startWorkflow'), actions),

  completeTask: execService<ActionData, UserTask>(WorkFlowService('completeTask'), actions),

  forceCompleteTasks: execService<{
    instanceIdList: string[];
    action: string;
    remarks?: string;
  }, any>(WorkFlowService('force-complete-tasks'), actions),

  findProcessDefList: findAllService<{ id: number }, ProcessInstanceDef>(WorkFlowService('list-process-def'), actions),

  findInstanceList: findPagingService<InstanceSearchParams, ProcessInstance>(WorkFlowService('listInstances'), actions),
  findTaskList: findPagingService<{ filter: string, latest: boolean, searchValue?: string, myRequest: boolean}, UserTask>(WorkFlowService('listTasks'), actions),


  findDiagram: findService<{ id: string }, DiagramData>(WorkFlowService('fetchDiagram'), actions),
  findProcessDef: findService<{ key: string }, ProcessInstanceDef>(WorkFlowService('fetchProcessDef'), actions),
  findUser: findService<{ id: string }, UserResult>(WorkFlowService('fetchUser'), actions),

  findInstanceData: <D>() => findService<{ id: string, type: 'inst' | 'task' }, ProcessInstanceData<D>>(WorkFlowService('fetchInstanceData'), actions),

  claim: execService<{ id: string }, UserTask>(WorkFlowService('claim'), actions),
  unClaim: execService<{ id: string }, UserTask>(WorkFlowService('unClaim'), actions),
  downloadForm: execDownloadForm(WorkFlowService(), actions),

  findUserDestinationList: findAllService<{ id: string }, UserDestItem>(WorkFlowService('userDestList'), actions),

  listUploadedFiles: findAllService<{ list: string[] }, AttachmentFile>(WorkFlowService('list-uploaded-files'), actions),
  // extract-diagram-def
  extractProcessDef: findService<{ id: string }, BMPNData>(WorkFlowService('extract-diagram-def'), actions),

  fetchWorkflowOriginator: findService<{ id: string }, OriginatorAuth>(WorkFlowService('fetch-workflow-originator'), actions),
  fetchDestApproval: findService<{ id: string }, SaveFirstLevelApproval>(WorkFlowService('fetch-dest-approval'), actions),
  fetchNotificationFeedback: findService<{ id: string }, NotificationFeedback>(WorkFlowService('fetch-notification-feedback'), actions),

  fetchConfigEntEvent: findService<{ id: string }, ConfigEndEventRs>(WorkFlowService('fetch-config-end-event'), actions),
  deployProcessDef: execService<{ fileId: string }, {}>(WorkFlowService('deploy-workflow'), actions),
  saveDest: execService<SaveFirstLevelApproval, {}>(WorkFlowService('save-dest-approval'), actions),
  saveConfigEndEvent: execService<ConfigEndEventParams, void>(WorkFlowService('save-config-end-event'), actions),
  saveOriginator: execService<SaveWorkflowOriginator, {}>(WorkFlowService('save-originator'), actions),

  listMessageTemplate: findAllService<{}, MessageTemplate>(WorkFlowService('list-message-template'), actions),

  listActivity: findAllService<{ list: string[] }, InstanceActivity>(WorkFlowService('list-activity'), actions),

  listAvailableProcessDef: findAllService<any, ProcessInstanceDefItem>(WorkFlowService('list-available-process-def'), actions),

})

