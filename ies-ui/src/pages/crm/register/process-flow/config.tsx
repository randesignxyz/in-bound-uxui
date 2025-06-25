import DefaultActionForm from '@/pages/process-flow/components/forms/DefaultActionForm';
import DefaultStartForm from '@/pages/process-flow/components/forms/DefaultStartForm';
import { ActionDataFormProps, DataForm, DataViewProps } from '@/pages/process-flow/data';



import { RegisterCustomerRequestFormNames } from '.';
import ViewForm from './ViewForm';
import FinanceApprovalForm from './FinanceApprovalForm';

export const getRegisterCustomerRequestForms = (): DataForm[] => [
  {
    formKey: [RegisterCustomerRequestFormNames.start,RegisterCustomerRequestFormNames.start],
    dataViewForm: (props: DataViewProps) => <ViewForm {...props} type="inst" />,
    actionDataForm: (props: ActionDataFormProps) => (<DefaultStartForm {...props} />),
  },
  {
    formKey: [     
      RegisterCustomerRequestFormNames.funManagerApproval
    ],
    dataViewForm: (props: DataViewProps) => <ViewForm {...props} />,
    actionDataForm: (props: ActionDataFormProps) => <DefaultActionForm {...props} />,
  },
   {
    formKey: [  
      RegisterCustomerRequestFormNames.financeManagerApproval
    ],
    dataViewForm: (props: DataViewProps) => <ViewForm {...props} />,
    actionDataForm: (props: ActionDataFormProps) => <FinanceApprovalForm {...props} />,
  },
];
