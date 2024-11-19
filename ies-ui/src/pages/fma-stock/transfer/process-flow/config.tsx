import DefaultActionForm from '@/pages/process-flow/components/forms/DefaultActionForm';
import DefaultStartForm from '@/pages/process-flow/components/forms/DefaultStartForm';
import { ActionDataFormProps, DataForm, DataViewProps } from '@/pages/process-flow/data';
import ViewForm from './ViewForm';
import { TransferRequestFormNames } from '.';
import CheckStockControlForm from './CheckStockControlForm';

export const getInventoryTransferRequestForms = (): DataForm[] => [
  {
    formKey: [TransferRequestFormNames.start],
    dataViewForm: (props: DataViewProps) => <ViewForm {...props} type="inst" />,
    actionDataForm: (props: ActionDataFormProps) => (
      <DefaultStartForm {...props} notAllowToChangeRequestor />
    ),
  },
  {
    formKey: [     
      TransferRequestFormNames.functionRequest,
      TransferRequestFormNames.functionApproval,
    ],
    dataViewForm: (props: DataViewProps) => <ViewForm {...props} />,
    actionDataForm: (props: ActionDataFormProps) => <DefaultActionForm {...props} />,
  },
  {
    formKey: [
      TransferRequestFormNames.physicalStock
    ],
    dataViewForm: (props: DataViewProps) => <ViewForm {...props} contribute={{formNo: 1}} />,
    actionDataForm: (props: ActionDataFormProps) => <CheckStockControlForm {...props} />,
  },
];
