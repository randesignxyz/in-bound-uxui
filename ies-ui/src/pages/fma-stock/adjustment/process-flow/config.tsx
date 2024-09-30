import DefaultActionForm from '@/pages/process-flow/components/forms/DefaultActionForm';
import DefaultStartForm from '@/pages/process-flow/components/forms/DefaultStartForm';
import { ActionDataFormProps, DataForm, DataViewProps } from '@/pages/process-flow/data';
import ViewForm from './ViewForm';
import { AdjustmentRequestFormNames } from '.';
import FinReviewControlForm from './FinReviewControlForm';
// import CheckStockControlForm from './CheckStockControlForm';

export const getInventoryAdjustmentRequestForms = (): DataForm[] => [
  {
    formKey: [AdjustmentRequestFormNames.start],
    dataViewForm: (props: DataViewProps) => <ViewForm {...props} type="inst" />,
    actionDataForm: (props: ActionDataFormProps) => (
      <DefaultStartForm {...props} notAllowToChangeRequestor />
    ),
  },
  {
    formKey: [
      AdjustmentRequestFormNames.financeReview,
    ],
    dataViewForm: (props: DataViewProps) => <ViewForm {...props} contribute={{formNo: 1}} />,
    actionDataForm: (props: ActionDataFormProps) => <FinReviewControlForm {...props} />,
  },
  {
    formKey: [     
      AdjustmentRequestFormNames.whApproval,
      AdjustmentRequestFormNames.functionApproval,
      AdjustmentRequestFormNames.finManagerApproval,
      AdjustmentRequestFormNames.dmbo1,
      AdjustmentRequestFormNames.dmbo2,
      AdjustmentRequestFormNames.mbo,
      AdjustmentRequestFormNames.smFin,
      AdjustmentRequestFormNames.dmd
    ],
    dataViewForm: (props: DataViewProps) => <ViewForm {...props} />,
    actionDataForm: (props: ActionDataFormProps) => <DefaultActionForm {...props} />,
  },
 
];
