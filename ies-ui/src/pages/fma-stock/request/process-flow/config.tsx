import DefaultActionForm from '@/pages/process-flow/components/forms/DefaultActionForm';
import DefaultStartForm from '@/pages/process-flow/components/forms/DefaultStartForm';
import { ActionDataFormProps, DataForm, DataViewProps } from '@/pages/process-flow/data';
// import { StockRequestFormNames } from './';
import ViewForm from './ViewForm';
import { StockRequestFormNames } from '.';
import CheckStockControlForm from './CheckStockControlForm';

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
      StockRequestFormNames.functionApproval,
    ],
    dataViewForm: (props: DataViewProps) => <ViewForm {...props} />,
    actionDataForm: (props: ActionDataFormProps) => <DefaultActionForm {...props} />,
  },
  {
    formKey: [
      StockRequestFormNames.physicalStock
    ],
    dataViewForm: (props: DataViewProps) => <ViewForm {...props} contribute={{formNo: 1}} />,
    actionDataForm: (props: ActionDataFormProps) => <CheckStockControlForm {...props} />,
  },
];
