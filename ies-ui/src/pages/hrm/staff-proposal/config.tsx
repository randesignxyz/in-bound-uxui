import { ActionDataFormProps, DataForm, DataViewProps } from "@/pages/process-flow/data";
import { StaffProposalFormNames, StaffProposalOFLFormNames } from "./data.types";
import Detail from "./detail";
import DefaultStartForm from "@/pages/process-flow/components/forms/DefaultStartForm";
import DefaultActionForm from "@/pages/process-flow/components/forms/DefaultActionForm";
import StaffProposalHrForm from "./StaffProposalHrForm";
import { UserTask } from "@/services/process-workflow/data";
import MoreInfo from "./MoreInfo";

export const getStaffProposalRequestForms = (): DataForm[] => [
    {
        formKey: [StaffProposalFormNames.processDefKey, StaffProposalOFLFormNames.processDefKey],
        dataViewForm: (props: DataViewProps) => <Detail {...props} type="inst" />,
        actionDataForm: (props: ActionDataFormProps) => <DefaultStartForm {...props} />,
        quickView: (task: UserTask) => <MoreInfo {...task} />,
    },
    {
        formKey: [
            StaffProposalFormNames.staff_proposal_hrbp,
            StaffProposalFormNames.staff_proposal_hrbp_manager,
            StaffProposalFormNames.staff_proposal_hrm_manager,

            StaffProposalOFLFormNames.staff_proposal_ofl_hrm_manager_propose,
            StaffProposalOFLFormNames.staff_proposal_ofl_sm_function_propose
        ],
        dataViewForm: (props: DataViewProps) => <Detail {...props} />,
        actionDataForm: (props: ActionDataFormProps) => {
            if (props.action.toLowerCase() == 'rejected')
                return <DefaultActionForm {...props} />
            return <StaffProposalHrForm {...props} />
        }
        ,
    },
    {
        formKey: [
            StaffProposalFormNames.staff_proposal_dmbo1,
            StaffProposalFormNames.staff_proposal_dmbo2,
            StaffProposalFormNames.staff_proposal_dmbo_omr,
            StaffProposalFormNames.staff_proposal_mbo,
            StaffProposalFormNames.staff_proposal_dmd,
            StaffProposalFormNames.staff_proposal_hra_sr_manager,
            StaffProposalOFLFormNames.staff_proposal_ofl_sm_function_approval,
            StaffProposalOFLFormNames.staff_proposal_ofl_sm_function_review,
            StaffProposalOFLFormNames.staff_proposal_ofl_dmd_approval,
            StaffProposalOFLFormNames.staff_proposal_ofl_dmd_review,
            StaffProposalOFLFormNames.staff_proposal_ofl_ed_md_approval
        ],
        dataViewForm: (props: DataViewProps) => <Detail {...props} />,
        actionDataForm: (props: ActionDataFormProps) => <DefaultActionForm {...props} />,
    },
]
