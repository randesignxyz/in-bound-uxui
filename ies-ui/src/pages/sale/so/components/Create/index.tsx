import React from "react"
import EntryForm from "../SoEntryForm"

interface Props {
    tabKey?: string;
    openInTab?: true
    actionHandlers?: {
        onBack?: (id?: number) => void
    }
}

const Create: React.FC<Props> = ({ actionHandlers, openInTab }) => {
    return <EntryForm type='new' openInTab={openInTab} onBack={actionHandlers?.onBack} />
}

export default Create