import DefaultActionForm from "@/pages/process-flow/components/forms/DefaultActionForm"
import { ActionDataFormProps, DataForm, DataViewProps } from "@/pages/process-flow/data"
import BudgetReview from "./BudgetReview"
import { StaffRequisitionFormNames, StaffRequisitionOFLFormNames } from "./data"
import ViewForm from "./ViewForm"
import { UserTask } from "@/services/process-workflow/data"
import MoreInfo from "./MoreInfo"



export const StaffRequisitionForms: DataForm[] = [

  {
    formKey: [StaffRequisitionFormNames.start,StaffRequisitionOFLFormNames.start],
    dataViewForm: (props: DataViewProps) => <ViewForm {...props} type="inst" />,
    actionDataForm: (props: ActionDataFormProps) => < div/>,
    quickView: (task: UserTask) => <MoreInfo {...task} />,
  },

  {
    formKey: [
      StaffRequisitionFormNames.processDefKey,
      StaffRequisitionFormNames.HRBP,
      StaffRequisitionFormNames.HRBP_MANAGER,
      StaffRequisitionFormNames.HRM_MANAGER,
      StaffRequisitionFormNames.DMBO1,
      StaffRequisitionFormNames.DMBO2,
      StaffRequisitionFormNames.DMBO_OMR,
      StaffRequisitionFormNames.MBO,
      StaffRequisitionFormNames.DMD,      
      StaffRequisitionFormNames.HRA_SR_MANAGER,

      StaffRequisitionOFLFormNames.processDefKey,
      StaffRequisitionOFLFormNames.OFL_HRM_MANAGER,
      StaffRequisitionOFLFormNames.OFL_SM_FUNCTION_APPROVAL,
      StaffRequisitionOFLFormNames.OFL_SM_FUNCTION_REVIEW,
      StaffRequisitionOFLFormNames.OFL_DMD_APPROVAL,
      StaffRequisitionOFLFormNames.OFL_SM_FUNCTION_PROPOSE,
      StaffRequisitionOFLFormNames.OFL_DMD_REVIEW,
      StaffRequisitionOFLFormNames.OFL_ED_MD_APPROVAL
    ],
    dataViewForm: (props: DataViewProps) => <ViewForm {...props} />,
    actionDataForm: (props: ActionDataFormProps) => <DefaultActionForm {...props} />,
    quickView: (task: UserTask) => <MoreInfo {...task} />,
  },
]