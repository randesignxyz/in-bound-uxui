import { ActionDataFormProps, DataForm, DataViewProps } from "@/pages/process-flow/data";
import { StockCountProcessFormName } from "./data";
import ViewForm from "@/pages/crm/contract/process-flow/ViewForm";
import DefaultStartForm from "@/pages/process-flow/components/forms/DefaultStartForm";


export const getStockCountRequestForm = ():DataForm[] => [
    {
        formKey:[StockCountProcessFormName.start],
        dataViewForm: (props: DataViewProps) => <ViewForm {...props} type="inst" />,
        actionDataForm: (props: ActionDataFormProps) => (
            <DefaultStartForm {...props} notAllowToChangeRequestor />
        )
    },
    
]