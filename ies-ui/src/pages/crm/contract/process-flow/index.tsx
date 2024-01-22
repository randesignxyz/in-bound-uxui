import DefaultActionForm from "@/pages/process-flow/components/forms/DefaultActionForm";
import DefaultStartForm from "@/pages/process-flow/components/forms/DefaultStartForm";
import { ActionDataFormProps, DataForm, DataViewProps } from "@/pages/process-flow/data";
import ProcessForm from "./ProccessForm";
import ReviewForm from "./ReviewForm";
import StartForm from "./StartForm";
import ViewForm from "./ViewForm";

export const CustomerContractForm = {
    processDefKey: 'customer_contract_request_process',
    start: 'customer_contract_request_process',
    startWithPayload: 'customer_contract_request_process_with_payload',
    se: 'customer_contract_se',
    asm: 'customer_contract_asm',
    rsm: 'customer_contract_rsm',
    fsm: 'customer_contract_fsm',
    gm: 'customer_contract_gm',
    saVerify: 'customer_contract_sa_verify',
    reworkd: 'originator_rework',
    sa: 'customer_contract_sa'
}
const CustomerContractDataForms1: DataForm[] = [
    {
        formKey: [CustomerContractForm.startWithPayload,],
        dataViewForm: (props: DataViewProps) => {
            return <ViewForm  {...props} type='inst' />;
        },
        actionDataForm: (props: ActionDataFormProps) => <StartForm {...props} />,
    }, {
        formKey: [CustomerContractForm.start,],
        dataViewForm: (props: DataViewProps) => {
            return <ViewForm  {...props} type='inst' />;
        },
        actionDataForm: (props: ActionDataFormProps) => <DefaultStartForm {...props} />,
    }, {
        formKey: [
            CustomerContractForm.se,
            CustomerContractForm.asm,
            CustomerContractForm.rsm,
            CustomerContractForm.fsm,
            CustomerContractForm.gm,
            CustomerContractForm.reworkd,
        ],
        dataViewForm: (props: DataViewProps) => <ViewForm  {...props} />,
        actionDataForm: (props: ActionDataFormProps) => <DefaultActionForm {...props} />,
    },
    {
        formKey: [
            CustomerContractForm.saVerify,
        ],
        dataViewForm: (props: DataViewProps) => <ViewForm {...props} />,
        actionDataForm: (props: ActionDataFormProps) => {
            if (props.action == 'Reworked') {
                return <DefaultActionForm {...props} />
            }
            return <ReviewForm {...props} />
        }
    },
    {
        formKey: [
            CustomerContractForm.sa
        ],
        dataViewForm: (props: DataViewProps) => <ViewForm {...props} />,
        actionDataForm: (props: ActionDataFormProps) => <ProcessForm {...props} />
    }
]

export default CustomerContractDataForms1