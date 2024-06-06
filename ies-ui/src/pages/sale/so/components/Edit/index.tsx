import React from "react"
import EntryForm from "../SoEntryForm"
interface Props {
    id: number;
    actionHandlers?: {
        onBack?: () => void
    }
}

const Edit: React.FC<Props> = ({ id, actionHandlers }) => {
    return <EntryForm type='edit' id={id} onBack={actionHandlers?.onBack} />
}

export default Edit