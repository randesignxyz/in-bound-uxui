import DefaultActionForm from '@/pages/process-flow/components/forms/DefaultActionForm';
import DefaultStartForm from '@/pages/process-flow/components/forms/DefaultStartForm';
import { ActionDataFormProps, DataForm, DataViewProps } from '@/pages/process-flow/data';
import ViewForm from './ViewForm';
import { ProbationEvaluationRequestFormNames } from '.';
import AssessmentPreparationForm from './AssessmentPreparationForm';
import AssessmentSubmissionForm from './AssessmentSubmissionForm';

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
    dataViewForm: (props: DataViewProps) => <ViewForm {...props} />,
    actionDataForm: (props: ActionDataFormProps) => <AssessmentPreparationForm {...props} />,
  },
  {
    formKey: [     
      ProbationEvaluationRequestFormNames.lineManagerSubmission,    
    ],
    dataViewForm: (props: DataViewProps) => <ViewForm {...props} />,
    actionDataForm: (props: ActionDataFormProps) => props.action =='Rejected'? <DefaultActionForm {...props} />: <AssessmentSubmissionForm {...props} />,
  },
  {
    formKey: [  
      ProbationEvaluationRequestFormNames.hrbp,
      ProbationEvaluationRequestFormNames.hrm,
      ProbationEvaluationRequestFormNames.mbo,
    ],
    dataViewForm: (props: DataViewProps) => <ViewForm {...props} />,
    actionDataForm: (props: ActionDataFormProps) => <DefaultActionForm {...props} />,
  }
];
