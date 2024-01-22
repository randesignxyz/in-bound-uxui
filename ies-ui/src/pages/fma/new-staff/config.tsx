import { ActionDataFormProps, DataForm, DataViewProps } from "@/pages/process-flow/data";
import { FMANewStaffFormNames } from "./data.types";
import Detail from "./detail";
import DefaultStartForm from "@/pages/process-flow/components/forms/DefaultStartForm";
import DefaultActionForm from "@/pages/process-flow/components/forms/DefaultActionForm";
import DefaultSubtask from "@/pages/process-flow/components/forms/DefaultSubtask";
import DefaultReassign from "@/pages/process-flow/components/forms/DefaultReassign";

export const getFMANewStaffRequestForms = (): DataForm[] => [
    {
        formKey: [FMANewStaffFormNames.processDefKey],
        dataViewForm: (props: DataViewProps) => <Detail {...props} type="inst" />,
        actionDataForm: (props: ActionDataFormProps) => <DefaultStartForm {...props} />,
        //quickView: (task: UserTask) => <QuickView {...task} />,
    },
    {
        formKey: [
            FMANewStaffFormNames.functionManagerApproval,
            FMANewStaffFormNames.fmaManagerApproval,
        ],
        dataViewForm: (props: DataViewProps) => <Detail {...props} />,
        actionDataForm: (props: ActionDataFormProps) => <DefaultActionForm {...props} />,
    },
    {
        formKey: [
            FMANewStaffFormNames.fmaSupportOfl,
            FMANewStaffFormNames.fmaSupportNvc,
            FMANewStaffFormNames.fmaSupportOmm,
            FMANewStaffFormNames.fmaSupportOmr,

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