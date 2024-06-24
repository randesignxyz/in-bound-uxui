import DefaultActionForm from '@/pages/process-flow/components/forms/DefaultActionForm';
import DefaultStartForm from '@/pages/process-flow/components/forms/DefaultStartForm';
import { ActionDataFormProps, DataForm, DataViewProps } from '@/pages/process-flow/data';
import { StockRequestFormNames } from './';
import ViewForm from './ViewForm';

export const getFmaStockRequestForms = (): DataForm[] => [
  {
    formKey: [StockRequestFormNames.start],
    dataViewForm: (props: DataViewProps) => <ViewForm {...props} type="inst" />,
    actionDataForm: (props: ActionDataFormProps) => (
      <DefaultStartForm {...props} notAllowToChangeRequestor />
    ),
  },
  {
    formKey: [
      StockRequestFormNames.functionRequest,
      StockRequestFormNames.physicalStock,
      StockRequestFormNames.functionApproval,
      // StockRequestFormNames.dmbo1,
      // StockRequestFormNames.dmbo2,
      // StockRequestFormNames.mbo,
      // StockRequestFormNames.smFin,
      // StockRequestFormNames.mdDmd,
    ],
    dataViewForm: (props: DataViewProps) => <ViewForm {...props} />,
    actionDataForm: (props: ActionDataFormProps) => <DefaultActionForm {...props} />,
  },
];
