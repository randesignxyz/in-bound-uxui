import { TableViewSearchParams } from "@/components/DataCrud/TableView";
import { FilterItem } from "@/components/DefaultFilter";
import { Pagination, Paging } from "@/services/API";
import { ContractTermData } from "@/services/crm/data";
import { StateType } from "@/services/model";
import { BMPNData, ConfigEndEventParams, ConfigEndEventRs, DiagramData, MessageTemplate, NotificationFeedback, OriginatorAuth, ProcessInstance, ProcessInstanceData, ProcessInstanceDef, SaveFirstLevelApproval, SaveWorkflowOriginator, UserDestItem, UserResult, UserTask } from "@/services/process-workflow/data";
import { TaskListAdvanceSearchParams } from "@/services/process-workflow/params";
import { UploadFile } from "antd/lib/upload/interface";


type Source = 'WorkList' | 'Edit' | 'Customer' | 'Contract' | 'settlement'
export type WorkflowModalName = 'Start' | 'Action' | 'Diagram'
    | 'InstanceDefList' | 'ShowUserDest'
    | 'originator-setup' | 'destination-setup'
    | 'end-task-setup' | 'deployment' | 'process-info'

export interface ModelService {

    state: State;
    actions: {
        modals: {
            isVisible: (modalName: WorkflowModalName) => boolean;
            hideModal: (modalName: WorkflowModalName) => void;
        };
        setRequestor: (userId: string) => Promise<void>,
        reset: () => Promise<void>,
        addFile: (file: UploadFile) => void,
        removeFile: (file: UploadFile) => void,
        downloadForm: (pInst: string, fileName?: string) => Promise<void>
    }

}



export type ModalData = {
    type: 'Action';
    taskId?: string;
    activity: string;
    formKey: string;
    action: string;
    payload?: any;
} | {
    type: 'Diagram',
    diagram: DiagramData
} | {
    type: 'UserDestination',
    taskId: string;
}

export const InstanceStateFilter = [
    { id: 'ALL', name: 'All' },
    { id: 'PENDING', name: 'Pending' },
    { id: 'IN_PROGRESS', name: 'In Progress' },
    { id: 'COMPLETED', name: 'Completed' },
    { id: 'REJECTED', name: 'Rejected' },
]

export const TaskStatusFilter = [
    { id: 'AVAILABLE', name: 'Available Tasks' },
    { id: 'ASSIGNED', name: 'My Tasks' },
    { id: 'COMPLETED', name: 'Completed Tasks' },
]

export interface InstanceSearchParams {
    state?: string;
    searchValue?: string;
}


export interface ActivityData {
    procInstId: string;
    taskId?: string;
    activity: string;
    formKey: string;
    action: string;
    payload?: any;
}

export interface State extends StateType<WorkflowModalName> {

    //Action Data
    requestor?: UserResult;
    uploadFiles?: UploadFile[];
    activityDatamodalData?: ModalData;

    //To auction modal form
    activityData?: ActivityData;
    //For dialog display
    diagramData?: DiagramData;


    //View Data
    instanceData?: ProcessInstanceData<any>;

    //Serach Datea
    instanceList?: Paging<ProcessInstance>;
    taskList?: Paging<UserTask>;
    processDefList?: ProcessInstanceDef[];


    //Search Params
    searchParams?: InstanceSearchParams;

    //Filter
    instStatusFilterList?: FilterItem[];
    taskStatusFilterList?: FilterItem[];

    userDestinationList?: UserDestItem[];

    temp?: {
        seletedCompayId?: number;
        processDef?: ProcessInstanceDef;
    }

}

export interface NotificationTemplate {
    id?: number | string,
    action: string,
    subject: string,
    bcc?: string,
    body: string
}

export interface IProcessWorkflowModel {
    state: State,
    actions: {
        loadPRocessDef: (defKey: string) => Promise<void>;
        loadProcessDefList: (id: number) => Promise<void>;
        openStartMenu: (id: number) => Promise<void>;
        loadInstanceList: (params?: { criteria?: InstanceSearchParams, paging?: Pagination }) => Promise<void>;
        loadTaskList: (params: TableViewSearchParams<TaskListAdvanceSearchParams>) => Promise<Paging<UserTask>>;
        showUserDest: (taskId: string) => Promise<void>
        startWorkflow: (data: any, processDef: string, buId: number, formKey: string, comment?: string) => Promise<UserTask>;
        completeTask: (params: { payload: any; ori?: 'taskList' | 'instView'; comment?: string; }) => Promise<void>;
        loadDiagram: (instId?: string) => Promise<void>;
        openActionForm: (activity: string, formKey: string, action: string, procInstId: string, taskId?: string, payload?: { from: Source, id: number } | any) => void;
        loadInstanceData: (id: string, type: 'inst' | 'task') => Promise<void>;
        selectedCompanyId: (id: number) => void;
        loadInitData: () => Promise<void>;
        claim: (params?: { taskId?: string, ori?: 'taskList' | 'instView' }) => Promise<void>;
        unClaim: (params?: { taskId?: string, ori?: 'taskList' | 'instView' }) => Promise<void>;
        setRequestor: (userId?: string) => Promise<void>;
        getRequestor: (userId?: string) => Promise<UserResult>;
        setRequestor1: (processDefId: string, userId?: string) => Promise<void>;
        crearUploadFiles: () => void;
        onSetFiles: (file: UploadFile[]) => void;
        addFile: (file: UploadFile) => void;
        removeFile: (file: UploadFile) => void;
        downloadForm: (pInst: string, fileName?: string) => Promise<void>;
        extractProcessDef: (processDefId: string) => Promise<BMPNData>;
        fetchWorkflowOriginator: (processDefId: string) => Promise<OriginatorAuth>;
        fetchDestApproval: (processDefId: string) => Promise<SaveFirstLevelApproval>;
        fetchNotificationFeedback: (processDefId: string) => Promise<NotificationFeedback>;
        saveConfigEndEvent: (params: ConfigEndEventParams) => Promise<void>;
        fetchConfigEndEvent: (eventId: string) => Promise<ConfigEndEventRs>;
        deployProcessDef: (fileId: string) => Promise<void>;
        saveDest: (data: SaveFirstLevelApproval) => Promise<void>;
        saveOriginator: (data: SaveWorkflowOriginator) => Promise<void>;
        saveContractTermTemp: (data: ContractTermData) => Promise<{ id: number; }>;
        listMessageTemplate: () => Promise<MessageTemplate[]>

    };
    modals: {
        isVisible: (modalName: WorkflowModalName) => boolean;
        showModal: (modalName: WorkflowModalName) => void;
        hideModal: (modalName: WorkflowModalName) => void;
    },

}