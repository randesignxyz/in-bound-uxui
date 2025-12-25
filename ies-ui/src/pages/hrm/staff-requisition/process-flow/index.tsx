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
      StaffRequisitionOFLFormNames.HRBP,
      StaffRequisitionOFLFormNames.HRM_MANAGER,
      StaffRequisitionOFLFormNames.SR_MANAGER_APPROVAL,
      StaffRequisitionOFLFormNames.DMD,
      StaffRequisitionOFLFormNames.HRA_SR_MANAGER
    ],
    dataViewForm: (props: DataViewProps) => <ViewForm {...props} />,
    actionDataForm: (props: ActionDataFormProps) => <DefaultActionForm {...props} />,
    quickView: (task: UserTask) => <MoreInfo {...task} />,
  },
]