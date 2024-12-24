import DefaultActionForm from '@/pages/process-flow/components/forms/DefaultActionForm';
import DefaultStartForm from '@/pages/process-flow/components/forms/DefaultStartForm';
import { ActionDataFormProps, DataForm, DataViewProps } from '@/pages/process-flow/data';
import ViewForm from './ViewForm';
import { ProbationEvaluationRequestFormNames } from '.';
import AssessmentPreparationForm from './AssessmentPreparationForm';
import AssessmentSubmissionForm from './AssessmentSubmissionForm';
import HrReviewForm from './HrReviewForm';
import MboApprovalForm from './MboApprovalForm';

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
    actionDataForm: (props: ActionDataFormProps) => {
      return props.action =='Rejected'? <DefaultActionForm {...props} />: <AssessmentSubmissionForm {...props} />
    },
  },
  {
    formKey: [     
      ProbationEvaluationRequestFormNames.hrbp,
      ProbationEvaluationRequestFormNames.hrm,    
    ],
    dataViewForm: (props: DataViewProps) => <ViewForm {...props} />,
    actionDataForm: (props: ActionDataFormProps) => {
      const title= props.formKey== ProbationEvaluationRequestFormNames.hrbp?'HRB, Review':'HR Manager, Review'
      props = {...props,title}
     return <HrReviewForm {...props} />
    }
  },
  {
    formKey: [     
      ProbationEvaluationRequestFormNames.mbo,  
    ],
    dataViewForm: (props: DataViewProps) => <ViewForm {...props} />,
    actionDataForm: (props: ActionDataFormProps) => {
      const title= 'MBO/ Approval'
      props = {...props,title}
     return <MboApprovalForm {...props} />
    }
  },
];
