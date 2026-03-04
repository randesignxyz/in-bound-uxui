import { ViewType } from "@/components/DataCrud/CrudWrapper"
import { useState } from "react"
import SoDetailView from "./components/Detail"
import Edit from "./components/Edit";
import Create from "./components/Create";

export default ({ id, addNew, tabKey, openInTab, actionHandlers, target, onMarkTabAsModified }: {
    addNew?: true;
    tabKey?: string;
    openInTab?: true;
    id?: number;
    target?: 'PO' | 'GO';
    onMarkTabAsModified?: (modified: boolean) => void;
    actionHandlers?: {
        onBack?: () => void;
    };
}) => {

    const [viewType, setViewType] = useState<ViewType>(addNew ? 'create' : 'detail')
    const [soId, setId] = useState(id)

    return <>
        {viewType == 'detail' ? <SoDetailView id={soId} openInTab={openInTab} actionHandlers={{
            onBack: actionHandlers?.onBack,
            onEdit: () => setViewType('edit')
        }} /> : <></>}

        {viewType == 'edit' && soId ? <Edit openInTab={openInTab} id={soId}
            actionHandlers={{ onBack: () => setViewType('detail') }}
        />
            : <></>
        }

        {viewType == 'create' && tabKey ? <Create openInTab={openInTab} key={tabKey}
            target={target}
            onMarkTabAsModified={onMarkTabAsModified}
            actionHandlers={{
                onBack: (newId) => {
                    setId(() => newId)
                    setViewType(() => 'detail')
                }
            }
            } /> : <></>}

    </>



}