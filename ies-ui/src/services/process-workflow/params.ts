
export interface StartWorkFlowParam<T> {
    processDef: string,
    formKey: string,
    buId: number,
    requestor: string;
    payload: T
    comment?: string,
}

export interface ActionParams<T> {
    processInstanceId: string;
    action: string;
    comment?: string,
    attachmentId?: string[]
    payload?: T
}

export interface TaskActionDataParam<T> {
    taskId: string;
    actionName: String;
    payload: T;
    comment?: string;
    fileIds?: string[];
}


export type TaskListAdvanceSearchParams = {
    isGlobal: boolean;
    status: string;
    latest: boolean;
    searchValue?: string;

};
