import { ActionDataFormProps, DataForm, DataViewProps } from "@/pages/process-flow/data";
import { SaleStockTranferRequestFormNames } from "./data";
import DefaultStartForm from "@/pages/process-flow/components/forms/DefaultStartForm";
import DefaultActionForm from "@/pages/process-flow/components/forms/DefaultActionForm";
import ViewForm from "./ViewForm";
import StockTransfer from "./StockTransfer";

export const getSaleStockTransferRequestRequestForms = (): DataForm[] => [
    {
        formKey: [SaleStockTranferRequestFormNames.start],
        dataViewForm: (props: DataViewProps) => <ViewForm {...props} type="inst" />,
        actionDataForm: (props: ActionDataFormProps) => (
            <DefaultStartForm {...props} notAllowToChangeRequestor />
        )
    },
    {
        formKey: [
            SaleStockTranferRequestFormNames.supervisorApproval,
        ],
        dataViewForm: (props: DataViewProps) => <ViewForm {...props} />,
        actionDataForm: (props: ActionDataFormProps) => <DefaultActionForm {...props} />,
    },
    {
        formKey: [
            SaleStockTranferRequestFormNames.warehouseTransfer,

        ],
        dataViewForm: (props: DataViewProps) => <ViewForm {...props} />,
        actionDataForm: (props: ActionDataFormProps) => props.action.toLowerCase() == "rejected" ? <DefaultActionForm {...props} /> : <StockTransfer {...props} />,
    },
]