import DefaultActionForm from '@/pages/process-flow/components/forms/DefaultActionForm';
import DefaultStartForm from '@/pages/process-flow/components/forms/DefaultStartForm';
import { ActionDataFormProps, DataForm, DataViewProps } from '@/pages/process-flow/data';
import { PoRequestFormNames } from './data';
import ViewForm from './ViewForm';

export const getPoRequestForms = (): DataForm[] => [
  {
    formKey: [PoRequestFormNames.start],
    dataViewForm: (props: DataViewProps) => <ViewForm {...props} type="inst" />,
    actionDataForm: (props: ActionDataFormProps) => (
      <DefaultStartForm {...props} notAllowToChangeRequestor />
    ),
  },
  {
    formKey: [
      PoRequestFormNames.subProFunction,
      PoRequestFormNames.proFunction,
      PoRequestFormNames.finFunction,
      PoRequestFormNames.dmbo1,
      PoRequestFormNames.dmbo2,
      PoRequestFormNames.dmbo,
      PoRequestFormNames.mbo,
      PoRequestFormNames.smFin,
      PoRequestFormNames.mdDmd,
    ],
    dataViewForm: (props: DataViewProps) => <ViewForm {...props} />,
    actionDataForm: (props: ActionDataFormProps) => <DefaultActionForm {...props} />,
  },
];
