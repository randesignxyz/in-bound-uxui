import React from "react"
import EntryForm from "../SoEntryForm"

interface Props {
    tabKey?: string;
    actionHandlers?: {
        onBack?: (id?: number) => void
    }
}

const Create: React.FC<Props> = ({ actionHandlers }) => {
    return <EntryForm type='new' onBack={actionHandlers?.onBack} />
}

export default Create