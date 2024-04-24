import DefaultActionForm from '@/pages/process-flow/components/forms/DefaultActionForm';
import DefaultStartForm from '@/pages/process-flow/components/forms/DefaultStartForm';
import { ActionDataFormProps, DataForm, DataViewProps } from '@/pages/process-flow/data';
import { UserTask } from '@/services/process-workflow/data';
import BudgetControlForm from './BudgetControlForm';
import ProReviewForm from './ProReviewForm';
import QuickView from './QuickView';
import ViewForm from './ViewForm';

export const AcquisitionFormNames = {
  processDefKey: 'requisition_request_process',
  start: 'requisition_request_process',
  sub: 'requisition_sub',
  hod: 'requisition_hod',
  budgetControoler: 'requisition_budget_controller',
  finMngApproval: 'requisition_fin',
  pro: 'requisition_pro',
  mbo: 'requisition_mbo',
  dmbo1: 'requisition_dmbo_1',
  dmbo2: 'requisition_dmbo_2',
  dmbo: 'requisition_dmbo',
  smFinance: 'requisition_sm_fin',
  md_dmd: 'requisition_md_dmd',
};

export const AcquisitionForm: DataForm[] = [
  {
    formKey: [AcquisitionFormNames.start],
    dataViewForm: (props: DataViewProps) => <ViewForm {...props} type="inst" />,
    actionDataForm: (props: ActionDataFormProps) => <DefaultStartForm {...props} />,
    quickView: (task: UserTask) => <QuickView {...task} />,
  },
  {
    formKey: [
      AcquisitionFormNames.sub,
      AcquisitionFormNames.hod,
      AcquisitionFormNames.finMngApproval,
      AcquisitionFormNames.mbo,
      AcquisitionFormNames.dmbo,
      AcquisitionFormNames.smFinance,
      AcquisitionFormNames.dmbo1,
      AcquisitionFormNames.dmbo2,
      AcquisitionFormNames.md_dmd,
    ],
    dataViewForm: (props: DataViewProps) => <ViewForm {...props} />,
    actionDataForm: (props: ActionDataFormProps) => <DefaultActionForm {...props} />,
  },
  {
    formKey: [AcquisitionFormNames.budgetControoler],
    dataViewForm: (props: DataViewProps) => <ViewForm {...props} />,
    actionDataForm: (props: ActionDataFormProps) => <BudgetControlForm {...props} />,
  },
  {
    formKey: [AcquisitionFormNames.pro],
    dataViewForm: (props: DataViewProps) => <ViewForm {...props} />,
    actionDataForm: (props: ActionDataFormProps) => <ProReviewForm {...props} />,
  },
];
