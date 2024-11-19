import DefaultActionForm from '@/pages/process-flow/components/forms/DefaultActionForm';
import DefaultStartForm from '@/pages/process-flow/components/forms/DefaultStartForm';
import { ActionDataFormProps, DataForm, DataViewProps } from '@/pages/process-flow/data';
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
      StockRequestFormNames.physicalStock
    ],
    dataViewForm: (props: DataViewProps) => <ViewForm {...props} contribute={{formNo: 1}} />,
    actionDataForm: (props: ActionDataFormProps) => <CheckStockControlForm {...props} />,
  },
  {
    formKey: [     
      StockRequestFormNames.functionRequest,
      StockRequestFormNames.marketingReview,
      StockRequestFormNames.functionApproval,
      StockRequestFormNames.warehouseTransferComplet
    ],
    dataViewForm: (props: DataViewProps) => <ViewForm {...props} />,
    actionDataForm: (props: ActionDataFormProps) => <DefaultActionForm {...props} />,
  },
 
];
