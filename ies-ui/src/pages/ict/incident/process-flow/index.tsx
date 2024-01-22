
import { ActionDataFormProps, DataForm, DataViewProps } from '@/pages/process-flow/data';
import { UserTask } from '@/services/process-workflow/data';
import QuickView from './QuickView';
import ViewForm from './ViewForm';
import RequestorConfirmation from './RequestorConfirmation';
import IctActionOnReassignForm from './IctActionOnReassignForm';
import IctActionOnHoldForm from './IctActionOnHoldForm';
import IctActionOnResolveForm from './IctActionOnResolveForm';
import DefaultStartForm from '@/pages/process-flow/components/forms/DefaultStartForm';
import { IncidentFormNames } from '../data.type';

// export const IncidentFormNames = {
//   processDefKey: 'incident_ticket_process',
//   start: 'incident_ticket_process',
//   it_service_desk: 'it_service_desk',
//   sap_support: 'sap_support',
//   developer_support: 'developer_support',
//   network_server_support: 'network_server_support',
//   requestor_confirm: 'requestor_confirm',
//   incident: 'incident_ticket',
// };

export const IncidentTicketForm: DataForm[] = [
  {
    formKey: [IncidentFormNames.start],
    dataViewForm: (props: DataViewProps) => <ViewForm {...props} type="inst" />,
    actionDataForm: (props: ActionDataFormProps) => <DefaultStartForm {...props} />,
    quickView: (task: UserTask) => <QuickView {...task} />,
  },
  {
    formKey: [
      IncidentFormNames.it_service_desk,
      IncidentFormNames.sap_support,
      IncidentFormNames.developer_support,
      IncidentFormNames.network_server_support,
    ],
    dataViewForm: (props: DataViewProps) => <ViewForm {...props} />,
    actionDataForm: (props: ActionDataFormProps) => props.action === 'Reassigned' ? <IctActionOnReassignForm {...props} /> : props.action === 'On_Hold' ? <IctActionOnHoldForm {...props} /> : <IctActionOnResolveForm {...props} />,
  },
  {
    formKey: [IncidentFormNames.requestor_confirm],
    dataViewForm: (props: DataViewProps) => <ViewForm {...props} />,
    actionDataForm: (props: ActionDataFormProps) => <RequestorConfirmation {...props} />,
  },
 
];
