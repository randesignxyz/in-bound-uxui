

import { ActionDataFormProps, DataForm, DataViewProps } from "@/pages/process-flow/data";
import DefaultStartForm from "@/pages/process-flow/components/forms/DefaultStartForm";
import TaskListDetailView from "./DetailView";
import { StockTransferRequestFormName } from "./dataFormName.type";

export const getStockTransferRequestForms = (): DataForm[] => [
    {
        formKey: [StockTransferRequestFormName.processDefKey],
        dataViewForm: (props: DataViewProps) => <TaskListDetailView {...props} onCountStock={()=>{}} onView={()=>{}}  />,
        actionDataForm: (props: ActionDataFormProps) => <DefaultStartForm {...props} />,
        // quickView: (task: UserTask) => <MoreInfo {...task} />,
    },
    // {
    //     formKey: [
    //         AppraisalRequestFormNames.performance_review_hr_review,
    //         AppraisalRequestFormNames.performance_review_dmbo_mbo_review,
    //         AppraisalRequestFormNames.performance_review_dmd_review            
    //     ],
    //     dataViewForm: (props: DataViewProps) => <Detail {...props} contributor={{editable:true,showRating5:true}} />,
    //     actionDataForm: (props: ActionDataFormProps) => {
    //         if (props.action.toLowerCase() == 'rejected')
    //             return <DefaultActionForm {...props} />
    //         return <AppraisalRequestHrForm {...props} />
    //     }
    // },
    // {
    //     formKey: [
    //         AppraisalRequestFormNames.performance_review_dmbo_mbo_approval,
    //         AppraisalRequestFormNames.performance_review_sm_hrm_consent,
    //         AppraisalRequestFormNames.performance_review_dmd_approval,
    //         AppraisalRequestFormNames.performance_review_md_ed_approval
    //     ],
    //     dataViewForm: (props: DataViewProps) => <Detail {...props}  contributor={{editable:false,showRating5:true}}/>,
    //     actionDataForm: (props: ActionDataFormProps) => <DefaultActionForm {...props} />,
    // },
]