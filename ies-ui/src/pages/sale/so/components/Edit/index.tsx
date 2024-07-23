import React from "react"
import EntryForm from "../SoEntryForm"
interface Props {
    id: number;
    openInTab?: true;
    actionHandlers?: {
        onBack?: () => void
    }
}

const Edit: React.FC<Props> = ({ id, openInTab, actionHandlers }) => {
    return <EntryForm openInTab={openInTab} type='edit' id={id} onBack={actionHandlers?.onBack} />
}

export default Edit