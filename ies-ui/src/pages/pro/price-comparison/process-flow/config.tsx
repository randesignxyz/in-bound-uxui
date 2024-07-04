import DefaultActionForm from '@/pages/process-flow/components/forms/DefaultActionForm';
import DefaultStartForm from '@/pages/process-flow/components/forms/DefaultStartForm';
import { ActionDataFormProps, DataForm, DataViewProps } from '@/pages/process-flow/data';
import { PriceComparisonFormNames } from './data';
import ViewForm from './ViewForm';

export const getPriceComparisonForms = (): DataForm[] => [
  {
    formKey: [PriceComparisonFormNames.start],
    dataViewForm: (props: DataViewProps) => <ViewForm {...props} type="inst" />,
    actionDataForm: (props: ActionDataFormProps) => (
      <DefaultStartForm {...props} notAllowToChangeRequestor />
    ),
  },
  {
    formKey: [
      PriceComparisonFormNames.subProFunction,
      PriceComparisonFormNames.proFunction,
      PriceComparisonFormNames.requestedFunction,
      PriceComparisonFormNames.finFunction,
      PriceComparisonFormNames.dmbo,
      PriceComparisonFormNames.dmbo1,
      PriceComparisonFormNames.dmbo2,
      PriceComparisonFormNames.mbo,
      PriceComparisonFormNames.sinFin,
      PriceComparisonFormNames.mdDmd,
    ],
    dataViewForm: (props: DataViewProps) => <ViewForm {...props} />,
    actionDataForm: (props: ActionDataFormProps) => <DefaultActionForm {...props} />,
  },
];
