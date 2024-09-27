import { ActionDataFormProps, DataForm, DataViewProps } from "@/pages/process-flow/data";
import { StockCountProcessFormName } from "./data";
import ViewForm from "@/pages/crm/contract/process-flow/ViewForm";
import DefaultStartForm from "@/pages/process-flow/components/forms/DefaultStartForm";
import DefaultActionForm from "@/pages/process-flow/components/forms/DefaultActionForm";
import MakeStockCountForm from "./MakeStockCountForm";


export const getStockCountRequestForm = ():DataForm[] => [
    {
        formKey:[StockCountProcessFormName.start],
        dataViewForm: (props: DataViewProps) => <ViewForm {...props} type="inst" />,
        actionDataForm: (props: ActionDataFormProps) => (
            <DefaultStartForm {...props} notAllowToChangeRequestor />
        )
    },
    {
        formKey:[StockCountProcessFormName.warehouseMakeCountStock],
        dataViewForm:(props:DataViewProps) =><ViewForm {...props} type="inst" />,
        actionDataForm: (props: ActionDataFormProps) => props.action.toLowerCase() == "rejected" ? <DefaultActionForm {...props} /> : <MakeStockCountForm {...props} />,
    },
    {
        formKey:[StockCountProcessFormName.cashierMakeSettlement],
        dataViewForm:(props:DataViewProps) =><ViewForm {...props} type="inst" />,
        actionDataForm: (props: ActionDataFormProps) => props.action.toLowerCase() == "rejected" ? <DefaultActionForm {...props} /> : <MakeStockCountForm {...props} />,
    },
    
]