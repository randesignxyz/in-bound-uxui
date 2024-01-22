import { ActionDataFormProps, DataForm, DataViewProps } from "@/pages/process-flow/data";
import Detail from "./detail";
import DefaultStartForm from "@/pages/process-flow/components/forms/DefaultStartForm";
import DefaultActionForm from "@/pages/process-flow/components/forms/DefaultActionForm";
import { ITNewStaffFormNames } from "./data.types";
import ItSupportForm from "./ItSupportForm";
import DefaultSubtask from "@/pages/process-flow/components/forms/DefaultSubtask";
import DefaultReassign from "@/pages/process-flow/components/forms/DefaultReassign";
import HiredFunctionForm from "./HiredFunctionForm";

export const getItNewStaffRequestForms = (): DataForm[] => [
    {
        formKey: [ITNewStaffFormNames.processDefKey],
        dataViewForm: (props: DataViewProps) => <Detail {...props} type="inst" />,
        actionDataForm: (props: ActionDataFormProps) => <DefaultStartForm {...props} />,
        //quickView: (task: UserTask) => <QuickView {...task} />,
    },
    {
        formKey: [
            ITNewStaffFormNames.function_manager,
        ],
        dataViewForm: (props: DataViewProps) => <Detail {...props} />,
        actionDataForm: (props: ActionDataFormProps) => props.action == 'Approved' ? <HiredFunctionForm {...props} /> : <DefaultActionForm {...props} />,
    },
    {
        formKey: [
            ITNewStaffFormNames.ict_manager,
        ],
        dataViewForm: (props: DataViewProps) => <Detail {...props} />,
        actionDataForm: (props: ActionDataFormProps) => <DefaultActionForm {...props} />,
    }, {

        formKey: [
            ITNewStaffFormNames.it_review,
        ],
        dataViewForm: (props: DataViewProps) => <Detail {...props} />,
        actionDataForm: (props: ActionDataFormProps) => <ItSupportForm {...props} />,
    }, {

        formKey: [
            ITNewStaffFormNames.it_support,
        ],
        dataViewForm: (props: DataViewProps) => <Detail {...props} />,
        actionDataForm: (props: ActionDataFormProps) => {
            if (props.action == 'Completed') {
                return <DefaultActionForm {...props} />
            }
            if (props.action == 'SUB_TASK') {
                return <DefaultSubtask {...props} />
            }
            if (props.action == 'REASSIGN') {
                return <DefaultReassign {...props} />
            }

            return <></>

        },
    }
]