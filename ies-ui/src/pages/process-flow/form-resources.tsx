import CustomerContractDataForms1 from '@/pages/crm/contract/process-flow';
import { StaffRequisitionForms } from '@/pages/hrm/staff-requisition/process-flow';
import { IncidentTicketForm } from '@/pages/ict/incident/process-flow';
import { AcquisitionForm } from '@/pages/pro/requisition/process-flow';
import { UserTask } from '@/services/process-workflow/data';
import { getFMANewStaffRequestForms } from '../fma/new-staff/config';
import { getStaffProposalRequestForms } from '../hrm/staff-proposal/config';
import { getItRequestForms } from '../ict/it-request/config';
import { getItNewStaffRequestForms } from '../ict/new-staff/config';
import { getPoRequestForms } from '../pro/po/process-flow/config';
import { getPriceComparisonForms } from '../pro/price-comparison/process-flow/config';
import { ActionDataFormProps, DataForm, DataViewProps } from './data';
import { getAppraisalRequestForms } from '../hrm/appraisal-request/config';
import { getGratisSettlementRequestForms } from '../crm/gratis/request/config';
import { getSaleStockTransferRequestRequestForms } from '../sale/stock-control/stock-transfer-request/process-flow/config';

const dataFormResources: DataForm[] = [
  // ...CashAdvanceForms,
  // ...ITRequestForms,
  // ...ContractRequestForms,
  // ...ExpensesClaimForms,
  // ...CustomerContractDataForms,

  // ...CustomerContractDataFormsTest,
  ...CustomerContractDataForms1,
  ...AcquisitionForm,
  ...StaffRequisitionForms,
  // ...IssueRequestForms,
  // ...CarBooingForms,
  // ...MeetingRookBooingForms,
  // // ...GratisClaimDataForms
  // ...GratisClaimDataForms1
  ...IncidentTicketForm,
  ...getItRequestForms(),
  ...getStaffProposalRequestForms(),
  ...getFMANewStaffRequestForms(),
  ...getItNewStaffRequestForms(),
  ...getPriceComparisonForms(),
  ...getPoRequestForms(),
  ...getAppraisalRequestForms(),
  ...getGratisSettlementRequestForms(),
  ...getSaleStockTransferRequestRequestForms()
];

export const getActionForm = (props: ActionDataFormProps) =>
  dataFormResources
    .find((it) => it.formKey.some((k) => k === props.formKey))
    ?.actionDataForm(props);
export const getViewForm = (props: DataViewProps) =>
  dataFormResources.find((it) => it.formKey.some((k) => k === props.formKey))?.dataViewForm(props);

export const ActionFormWrapper: React.FC<ActionDataFormProps> = (props) => {
  return (
    dataFormResources
      .find((it) => it.formKey.some((k) => k === props.formKey))
      ?.actionDataForm(props) || <div />
  );
};

export const getQuikview = (task: UserTask) => {
  return dataFormResources
    .find((it) => it.formKey.some((k) => k === task.instanceInfo.processDefKey))
    ?.quickView?.(task);
};
