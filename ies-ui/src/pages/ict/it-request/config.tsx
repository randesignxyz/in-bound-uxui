import DefaultActionForm from "@/pages/process-flow/components/forms/DefaultActionForm";
import DefaultStartForm from "@/pages/process-flow/components/forms/DefaultStartForm";
import { ActionDataFormProps, DataForm, DataViewProps } from "@/pages/process-flow/data";
import { ITRequestFormNames } from "./data.types";
import Detail from "./detail";
import DefaultSubtask from "@/pages/process-flow/components/forms/DefaultSubtask";
import DefaultReassign from "@/pages/process-flow/components/forms/DefaultReassign";

export const getItRequestForms = (): DataForm[] => [
    {
        formKey: [ITRequestFormNames.processDefKey],
        dataViewForm: (props: DataViewProps) => <Detail {...props} type="inst" />,
        actionDataForm: (props: ActionDataFormProps) => <DefaultStartForm {...props} />,
        //quickView: (task: UserTask) => <QuickView {...task} />,
    },
    {
        formKey: [
            ITRequestFormNames.subFunction,
            ITRequestFormNames.function,
            ITRequestFormNames.INFRA_SERVER_MANAGER,
            ITRequestFormNames.CORE_SYSTEM_MANAGER,
            ITRequestFormNames.APP_DEV_MANAGER,
            ITRequestFormNames.ICT_MANAGER,
            ITRequestFormNames.MBO,
            
        ],
        dataViewForm: (props: DataViewProps) => <Detail {...props} />,
        actionDataForm: (props: ActionDataFormProps) => <DefaultActionForm {...props} />,
    },
    {
        formKey: [
            ITRequestFormNames.IT_SUPPORT,
            ITRequestFormNames.IT_APP_DEV_SUPPORT,
            ITRequestFormNames.IT_CORE_SYS_SUPPORT,
        ],
        dataViewForm: (props: DataViewProps) => <Detail {...props} />,
        actionDataForm: (props: ActionDataFormProps) =>  {
            if(props.action == 'SUB_TASK')  { 
                return <DefaultSubtask {...props} />    
            }
            if(props.action == 'REASSIGN')  { 
                return <DefaultReassign {...props} />    
            }
            return <DefaultActionForm {...props} />
        },
    }
]