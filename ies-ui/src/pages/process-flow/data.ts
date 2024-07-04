import { ActivityData } from "@/models/process-flow/data";
import { ProcessInstanceData, Source, UserResult, UserTask } from "@/services/process-workflow/data";
import { UploadFile } from "antd/lib/upload/interface";


export interface FormOperation<T> {
    formKey: string,
    payload: T
}


export interface DataForm {
    formKey: string[];
    dataViewForm: (props: DataViewProps) => JSX.Element;
    actionDataForm: (props: ActionDataFormProps) => JSX.Element;
    quickView?: (task: UserTask) => JSX.Element;
}

export interface DataFormItem {
    formKey: string,
    dataForms: DataForm
}

export interface ActionDataFormProps {
    loading?: boolean;
    title?: string;
    visible?: boolean;
    formKey: string;
    noAttachment?: true;
    action: string | 'Start';
    payload?: { from: Source, id?: number, data?: any };
    uploadFiles?: UploadFile[];
    activityData?: ActivityData;
    procInstId?: string;
    ProcessInstanceData?: ProcessInstanceData<any>;
    notAllowToChangeRequestor?: boolean;
    requestor?: UserResult;
    actionHandlers?: {
        onSetRequestor?: (userId: string) => Promise<void>;
        onSetFiles?: (file: UploadFile[]) => void;
        // onAddFile?: (file: UploadFile) => void;
        // onRemoveFile?: (file: UploadFile) => void;
        onCancel?: (reloadRequired?: boolean) => void;
        onStartWorkflow?: (processDef: string, formKey: string, buId: number, requestor: UserResult, comment?: string) => Promise<any>;
        onCompletedTask?: (payload: any, comment?: string) => Promise<UserTask> | Promise<void>;
        onReset?: (includeRequestor?: boolean) => void;
        onOk?: () => void;
    }
}

export interface DataViewProps {
    id: string;
    formKey: string;
    type?: 'inst' | 'task';
    openInTab?: true;
    showDiagramHandler: (task: UserTask) => void;
    actionHandler: (action: string, task: UserTask, cb?: () => void) => void;
    forceUpdate?: number;
}


export interface AttachmentFile {
    id: string;
    fileName: string;
    fileType: string;
    createdDate: moment.Moment
}

declare namespace Contract {
    export interface DataForm {
        id: number
    }
}

declare namespace CashAdvance {

    export interface DataForm {

        id: number;
        amount: number;
        currency: string;
        amountInWords: string;
        dueDate: number;
        reason: string;
        paid: {
            paidBy?: string;
            chequeNo?: string;
            chequeDate?: number
            bank?: string
            refNo?: string
        };
        settled: {
            settledDate: number,
            refundAmount: number
        }

    }
}




declare namespace ITRequest {

    export interface RequestFormItem {
        id: number;
        item: RequestItem;
        reason: string;
        selectedOptions: FormItemSelectedOption[];
        extendedData: {
            cctvData?: RequestFormItemCCTVData
        }
    }

    export interface RequestFormItemCCTVData {
        id: number,
        reviewDate: string,
        reviewLocation: string
    }

    export interface FormItemSelectedOption {
        id: number;
        items: number[];
    }


    export interface RequestItemGroup {
        id: number;
        name: string;
        description?: string;
    }

    export interface RequestItem {
        id: number;
        name: string;
        description?: string;
        group: RequestItemGroup;
        options: RequestItemOption[];
        dataCode?: string;
    }

    export interface RequestItemOption {
        id: number;
        name: string;
        multipleFlag: boolean;
        values: RequestItemOptionValue[];
    }

    export interface RequestItemOptionValue {
        id: number;
        code: string;
        name: string;
    }

    export interface ICTRequestFormData {
        requestFormItems: RequestFormItem[]
    }

}
