import DefaultActionForm from '@/pages/process-flow/components/forms/DefaultActionForm';
import DefaultStartForm from '@/pages/process-flow/components/forms/DefaultStartForm';
import { ActionDataFormProps, DataForm, DataViewProps } from '@/pages/process-flow/data';
import ViewForm from './ViewForm';
import { AdjustmentRequestFormNames } from '.';
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
      AdjustmentRequestFormNames.functionReview,
      AdjustmentRequestFormNames.financeReview,
      AdjustmentRequestFormNames.functionAckwonledge,
      AdjustmentRequestFormNames.executiveApproval
    ],
    dataViewForm: (props: DataViewProps) => <ViewForm {...props} />,
    actionDataForm: (props: ActionDataFormProps) => <DefaultActionForm {...props} />,
  },
  // {
  //   formKey: [
  //     AdjustmentRequestFormNames.physicalStock
  //   ],
  //   dataViewForm: (props: DataViewProps) => <ViewForm {...props} contribute={{formNo: 1}} />,
  //   actionDataForm: (props: ActionDataFormProps) => <CheckStockControlForm {...props} />,
  // },
];
