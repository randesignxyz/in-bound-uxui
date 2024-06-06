import { ViewType } from "@/components/DataCrud/CrudWrapper"
import { useState } from "react"
import SoDetailView from "./components/Detail"
import Edit from "./components/Edit";
import Create from "./components/Create";

export default ({ id, addNew, tabKey, actionHandlers }: {
    addNew?: true;
    tabKey?: string;
    id?: number;
    actionHandlers?: {
        onBack?: () => void;
    };
}) => {

    const [viewType, setViewType] = useState<ViewType>(addNew ? 'create' : 'detail')
    const [soId, setId] = useState(id)

    return <>
        {viewType == 'detail' ? <SoDetailView id={soId} openInTab actionHandlers={{
            onBack: actionHandlers?.onBack,
            onEdit: () => setViewType('edit')
        }} /> : <></>}

        {viewType == 'edit' && soId ? <Edit id={soId} actionHandlers={{ onBack: () => setViewType('detail') }} /> : <></>}

        {viewType == 'create' && tabKey ? <Create key={tabKey} actionHandlers={{
            onBack: (newId) => {
                setId(() => newId)
                setViewType(() => 'detail')
            }
        }
        } /> : <></>}

    </>



}