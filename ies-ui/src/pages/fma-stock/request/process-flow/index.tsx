import DefaultActionForm from '@/pages/process-flow/components/forms/DefaultActionForm';
import DefaultStartForm from '@/pages/process-flow/components/forms/DefaultStartForm';
import { ActionDataFormProps, DataForm, DataViewProps } from '@/pages/process-flow/data';
import { UserTask } from '@/services/process-workflow/data';
import QuickView from './QuickView';
import ViewForm from './ViewForm';

export const StockRequestFormNames = {
    processDefKey: 'fma_stock_request_process',
    start: 'fma_stock_request_process',
    functionRequest: 'fma_stock_request_function_request',
    functionApproval: 'fma_stock_request_function_approval',
    physicalStock: 'fma_stock_request_check_physical_stock',
};

export const AcquisitionForm: DataForm[] = [
    {
      formKey: [StockRequestFormNames.start],
      dataViewForm: (props: DataViewProps) => <ViewForm {...props} type="inst" />,
      actionDataForm: (props: ActionDataFormProps) => <DefaultStartForm {...props} />,
      quickView: (task: UserTask) => <QuickView {...task} />,
    },
    {
      formKey: [
        StockRequestFormNames.functionRequest,
        StockRequestFormNames.physicalStock,
        StockRequestFormNames.functionApproval,       
      ],
      dataViewForm: (props: DataViewProps) => <ViewForm {...props} />,
      actionDataForm: (props: ActionDataFormProps) => <DefaultActionForm {...props} />,
    },
    // {
    //   formKey: [AcquisitionFormNames.budgetControoler],
    //   dataViewForm: (props: DataViewProps) => <ViewForm {...props} />,
    //   actionDataForm: (props: ActionDataFormProps) => <BudgetControlForm {...props} />,
    // },
    // {
    //   formKey: [AcquisitionFormNames.pro],
    //   dataViewForm: (props: DataViewProps) => <ViewForm {...props} />,
    //   actionDataForm: (props: ActionDataFormProps) => <ProReviewForm {...props} />,
    // },
  ];