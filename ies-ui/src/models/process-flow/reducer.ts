import { Paging } from "@/services/API";
import { BaseActionType, baseReducer } from "@/services/model";
import { DiagramData, InstanceSearchParams, ProcessInstance, ProcessInstanceData, ProcessInstanceDef, UserDestItem, UserResult, UserTask } from "@/services/process-workflow/data";
import { UploadFile } from "antd/lib/upload/interface";
import { ActivityData, ModalData, State, WorkflowModalName } from "./data";

export type Action =
    BaseActionType<WorkflowModalName>
    | { type: 'setInstanceList'; payload: Paging<ProcessInstance>; }
    | { type: 'setTaskList'; payload: Paging<UserTask>; }
    | { type: 'updateTask'; payload: {newTask: UserTask; oldTaskId: string; ori?: 'taskList' | 'instView' }; }
    | { type: 'setProcessDefKey'; payload: ProcessInstanceDef; }
    | { type: 'setInstanceDefList'; payload: ProcessInstanceDef[]; }
    | { type: 'setSelectedCompanyId'; payload: { id: number }; }
    | { type: 'setRequestUser'; payload: UserResult; }
    | { type: 'setUserDestination'; payload: UserDestItem[] }
    | { type: 'clearUploadFiles'; }
    | { type: 'setFiles'; payload: UploadFile[]; }
    | { type: 'addFile'; payload: UploadFile; }
    | { type: 'removeFile'; payload: UploadFile; }
    | { type: 'setInstanceData'; payload: ProcessInstanceData<any>; }
    | { type: 'setSearchParams'; payload: InstanceSearchParams; }
    | {
        type: 'isClaim'; payload: {
            ori: 'taskList' | 'instView';
            task: UserTask;
        }
    }
    | { type: 'setDiagramData'; payload: DiagramData }
    | { type: 'setActivityData'; payload: ActivityData }
    | { type: 'setModalData'; payload: ModalData; };
    
export function reducer() {
    return (state: State, action: Action): State => {
        switch (action.type) {

            case 'setInstanceList': return { ...state, instanceList: action.payload }
            case 'setTaskList': return { ...state, taskList: action.payload }
            case 'setProcessDefKey': return {
                ...state, temp: {
                    ...state.temp,
                    processDef: action.payload
                }
            }
            case 'updateTask': {
                if (action.payload.ori == 'taskList') {
                    return {
                        ...state,
                        taskList: state.taskList ? {
                            ...state.taskList,
                            items: state.taskList.items.map(it => {
                                if (it.taskId == action.payload.oldTaskId) {
                                    return { ...action.payload.newTask }
                                } else {
                                    return { ...it }
                                }
                            })
                        } : undefined
                    }
                }
            }

            return {
                ...state,
                instanceData: state.instanceData ? {
                    ...state.instanceData,
                    task: state.instanceData.task ? {
                        ...state.instanceData.task,
                        ...action.payload.newTask
                    } : undefined
                } : undefined
            }

            case 'setInstanceDefList': return { ...state, processDefList: action.payload }
            case 'setSelectedCompanyId': return {
                ...state,
                temp: {
                    ...state.temp,
                    seletedCompayId: action.payload.id
                }
            };

            case 'setRequestUser': return { ...state, requestor: action.payload };
            case 'setUserDestination': return { ...state, userDestinationList: action.payload }
            case 'setInstanceData': return { ...state, instanceData: action.payload };
            case 'setModalData': return { ...state, modalData: action.payload };
            case 'isClaim': {

                if (action.payload.ori == 'taskList') {
                    return {
                        ...state,
                        taskList: state.taskList ? {
                            ...state.taskList,
                            items: state.taskList.items.map(it => {
                                if (it.taskId == action.payload.task.taskId) {
                                    return { ...it, ...action.payload.task }
                                } else {
                                    return { ...it }
                                }
                            })
                        } : undefined
                    }
                }
                return {
                    ...state,
                    instanceData: state.instanceData ? {
                        ...state.instanceData,
                        task: state.instanceData.task ? {
                            ...state.instanceData.task,
                            ...action.payload.task
                        } : undefined
                    } : undefined
                }
            };
            case 'clearUploadFiles': return { ...state, uploadFiles: [] }
            case 'setFiles': return { ...state, uploadFiles: action.payload };
            case 'addFile': return { ...state, uploadFiles: [...(state.uploadFiles || []), action.payload] };
            case 'removeFile': return { ...state, uploadFiles: [...(state.uploadFiles?.filter(it => it.uid !== action.payload.uid) || [])] };
            case 'setSearchParams': return { ...state, searchParams: action.payload }
            case 'setDiagramData': return {...state, diagramData: action.payload}
            case 'setActivityData': return {...state, activityData: action.payload}
            default:
                return baseReducer(state, action);
        }
    };
}