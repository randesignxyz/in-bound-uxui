import DefaultActionForm from '@/pages/process-flow/components/forms/DefaultActionForm';
import DefaultStartForm from '@/pages/process-flow/components/forms/DefaultStartForm';
import { ActionDataFormProps, DataForm, DataViewProps } from '@/pages/process-flow/data';
import { UserTask } from '@/services/process-workflow/data';
import BudgetControlForm from './BudgetControlForm';
import ProReviewForm from './ProReviewForm';
import QuickView from './QuickView';
import ViewForm from './ViewForm';
import ProCommentForm from './ProActionForm';
import ProActionForm from './ProActionForm';

export const AcquisitionFormNames = {
  processDefKey: 'requisition_request_process',
  start: 'requisition_request_process',
  sub: 'requisition_sub',
  hod: 'requisition_hod',
  budgetControoler: 'requisition_budget_controller',
  finMngApproval: 'requisition_fin',
  pro: 'requisition_pro',
  mbo: 'requisition_mbo',
  dmbo1: 'requisition_dmbo_1',
  dmbo2: 'requisition_dmbo_2',
  dmbo: 'requisition_dmbo',
  smFinance: 'requisition_sm_fin',
  md_dmd: 'requisition_md_dmd',
  srManagerApproval: 'requisition_sr_manager_approval',
  cdeMngPropose: 'requisition_cde_manager_propose',
  fleetRepairMaintenancePropose: 'requisition_fleet_repair_maintenance_propose',
};

export const AcquisitionNvcFormNames = {
  processDefKey: 'requisition_request_process_nvc',
  start: 'requisition_request_process_nvc',
  sub: 'requisition_nvc_sub',
  hod: 'requisition_nvc_hod',
  budgetControoler: 'requisition_nvc_budget_controller',
  finMngApproval: 'requisition_nvc_fin',
  pro: 'requisition_nvc_pro',
  mbo: 'requisition_nvc_mbo',
  dmbo1: 'requisition_nvc_dmbo_1',
  dmbo2: 'requisition_nvc_dmbo_2',
  dmbo: 'requisition_nvc_dmbo',
  smFinance: 'requisition_nvc_sm_fin',
  md_dmd: 'requisition_nvc_md_dmd',
};


export const AcquisitionOmmFormNames = {
  processDefKey: 'requisition_request_process_omm',
  start: 'requisition_request_process_omm',
  sub: 'requisition_omm_sub',
  hod: 'requisition_omm_hod',
  budgetControoler: 'requisition_omm_budget_controller',
  finMngApproval: 'requisition_omm_fin',
  pro: 'requisition_omm_pro',
  mbo: 'requisition_omm_mbo',
  dmbo1: 'requisition_omm_dmbo_1',
  dmbo2: 'requisition_omm_dmbo_2',
  dmbo: 'requisition_omm_dmbo',
  smFinance: 'requisition_omm_sm_fin',
  md_dmd: 'requisition_omm_md_dmd',
  constructionFunManager: 'requisition_omm_contruction_hod',
  constructionMbo1: 'requisition_omm_construction_mbo1',
  constructionMbo2: 'requisition_omm_construction_mbo2',
  constructionEd: 'requisition_omm_contruction_ed',

};


export const AcquisitionOmcFormNames = {
  processDefKey: 'requisition_request_process_omc',
  start: 'requisition_request_process_omc',
  sub: 'requisition_omc_sub',
  hod: 'requisition_omc_hod',
  budgetControoler: 'requisition_omc_budget_controller',
  finMngApproval: 'requisition_omc_fin',
  pro: 'requisition_omc_pro',
  mbo: 'requisition_omc_mbo',
  dmbo1: 'requisition_omc_dmbo_1',
  dmbo2: 'requisition_omc_dmbo_2',
  dmbo: 'requisition_omc_dmbo',
  smFinance: 'requisition_omc_sm_fin',
  md_dmd: 'requisition_omc_md_dmd',
};

export const AcquisitionForm: DataForm[] = [
  {
    formKey: [
      AcquisitionFormNames.start,
      AcquisitionNvcFormNames.start,
      AcquisitionOmmFormNames.start,
      AcquisitionOmcFormNames.start
    ],
    dataViewForm: (props: DataViewProps) => <ViewForm {...props} type="inst" />,
    actionDataForm: (props: ActionDataFormProps) => <DefaultStartForm {...props} />,
    quickView: (task: UserTask) => <QuickView {...task} />,
  },
  {
    formKey: [
      AcquisitionFormNames.sub,
      AcquisitionFormNames.hod,
      AcquisitionFormNames.finMngApproval,
      AcquisitionFormNames.mbo,
      AcquisitionFormNames.dmbo,
      AcquisitionFormNames.smFinance,
      AcquisitionFormNames.dmbo1,
      AcquisitionFormNames.dmbo2,
      AcquisitionFormNames.md_dmd,
      AcquisitionFormNames.srManagerApproval,
      AcquisitionFormNames.cdeMngPropose,
      AcquisitionFormNames.fleetRepairMaintenancePropose,
      
      AcquisitionNvcFormNames.sub,
      AcquisitionNvcFormNames.hod,
      AcquisitionNvcFormNames.finMngApproval,
      AcquisitionNvcFormNames.mbo,
      AcquisitionNvcFormNames.dmbo,
      AcquisitionNvcFormNames.smFinance,
      AcquisitionNvcFormNames.dmbo1,
      AcquisitionNvcFormNames.dmbo2,
      AcquisitionNvcFormNames.md_dmd,

      AcquisitionOmmFormNames.sub,
      AcquisitionOmmFormNames.hod,
      AcquisitionOmmFormNames.finMngApproval,
      AcquisitionOmmFormNames.mbo,
      AcquisitionOmmFormNames.dmbo,
      AcquisitionOmmFormNames.smFinance,
      AcquisitionOmmFormNames.dmbo1,
      AcquisitionOmmFormNames.dmbo2,
      AcquisitionOmmFormNames.md_dmd,

      AcquisitionOmcFormNames.sub,
      AcquisitionOmcFormNames.hod,
      AcquisitionOmcFormNames.finMngApproval,
      AcquisitionOmcFormNames.mbo,
      AcquisitionOmcFormNames.dmbo,
      AcquisitionOmcFormNames.smFinance,
      AcquisitionOmcFormNames.dmbo1,
      AcquisitionOmcFormNames.dmbo2,
      AcquisitionOmcFormNames.md_dmd,

      // AcquisitionOmmFormNames.constructionFunManager,
      // AcquisitionOmmFormNames.constructionMbo1,
      // AcquisitionOmmFormNames.constructionMbo2,
      // AcquisitionOmmFormNames.constructionEd,
    ],
    dataViewForm: (props: DataViewProps) => <ViewForm {...props} />,
    actionDataForm: (props: ActionDataFormProps) => <ProActionForm {...props} />,
  },
  {
    formKey: [
      AcquisitionFormNames.budgetControoler,
      AcquisitionNvcFormNames.budgetControoler,
      AcquisitionOmmFormNames.budgetControoler,
      AcquisitionOmcFormNames.budgetControoler
    ],
    dataViewForm: (props: DataViewProps) => <ViewForm {...props} />,
    actionDataForm: (props: ActionDataFormProps) => <BudgetControlForm {...props} />,
  },
  {
    formKey: [AcquisitionFormNames.pro, AcquisitionNvcFormNames.pro],
    dataViewForm: (props: DataViewProps) => <ViewForm {...props} />,
    actionDataForm: (props: ActionDataFormProps) => <ProReviewForm {...props} />,
  },
];
