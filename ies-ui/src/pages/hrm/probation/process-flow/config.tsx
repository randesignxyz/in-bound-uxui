import DefaultActionForm from '@/pages/process-flow/components/forms/DefaultActionForm';
import DefaultStartForm from '@/pages/process-flow/components/forms/DefaultStartForm';
import { ActionDataFormProps, DataForm, DataViewProps } from '@/pages/process-flow/data';
import ViewForm from './ViewForm';
import { ProbationEvaluationRequestFormNames } from '.';
import PreparationAssessmentForm from './PreparationAssessmentForm';
// import CheckStockControlForm from './CheckStockControlForm';

export const getProbationEvaluationRequestForms = (): DataForm[] => [
  {
    formKey: [ProbationEvaluationRequestFormNames.start],
    dataViewForm: (props: DataViewProps) => <ViewForm {...props} type="inst" />,
    actionDataForm: (props: ActionDataFormProps) => (
      <DefaultStartForm {...props} notAllowToChangeRequestor />
    ),
  },
  {
    formKey: [     
      ProbationEvaluationRequestFormNames.assessmentPreparation,    
    ],
    dataViewForm: (props: DataViewProps) => <PreparationAssessmentForm {...props} />,
    actionDataForm: (props: ActionDataFormProps) => <DefaultActionForm {...props} />,
  },
  {
    formKey: [     
      ProbationEvaluationRequestFormNames.assessmentPreparation,
      ProbationEvaluationRequestFormNames.lineManagerSubmission,
      ProbationEvaluationRequestFormNames.hrbp,
      ProbationEvaluationRequestFormNames.hrm,
      ProbationEvaluationRequestFormNames.mbo,
    ],
    dataViewForm: (props: DataViewProps) => <ViewForm {...props} />,
    actionDataForm: (props: ActionDataFormProps) => <DefaultActionForm {...props} />,
  },
  // {
  //   formKey: [
  //     ProbationEvaluationRequestFormNames.physicalStock
  //   ],
  //   dataViewForm: (props: DataViewProps) => <ViewForm {...props} contribute={{formNo: 1}} />,
  //   actionDataForm: (props: ActionDataFormProps) => <CheckStockControlForm {...props} />,
  // },
];
