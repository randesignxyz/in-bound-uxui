import { ActionDataFormProps, DataForm, DataViewProps } from "@/pages/process-flow/data";
import { GratisSettlementFormNames } from "./data.types";
import Detail from "./detail";
import DefaultStartForm from "@/pages/process-flow/components/forms/DefaultStartForm";
import DefaultActionForm from "@/pages/process-flow/components/forms/DefaultActionForm";

export const getGratisSettlementRequestForms = (): DataForm[] => [
    {
        formKey: [GratisSettlementFormNames.processDefKey],
        dataViewForm: (props: DataViewProps) => <Detail {...props} type="inst" />,
        actionDataForm: (props: ActionDataFormProps) => <DefaultStartForm {...props} />,
    },
    {
        formKey: [
            GratisSettlementFormNames.gratis_settlement_sal_ops_approval,
            GratisSettlementFormNames.gratis_settlement_nat_sal_approval,
            GratisSettlementFormNames.gratis_settlement_comm_approval,
            GratisSettlementFormNames.gratis_settlement_fin_approval,
            GratisSettlementFormNames.gratis_settlement_dmbo,
            // GratisSettlementFormNames.gratis_settlement_dmbo2,
            GratisSettlementFormNames.gratis_settlement_mbo

        ],
        dataViewForm: (props: DataViewProps) => <Detail {...props} />,
        actionDataForm: (props: ActionDataFormProps) => <DefaultActionForm {...props} />,
    }
]