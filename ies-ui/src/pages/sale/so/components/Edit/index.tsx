import React from "react"
import EntryForm from "../SoEntryForm"
interface Props {
    id: number;
    actionHandlers?: {
        onBack?: () => void
    }
}

const Edit: React.FC<Props> = ({ id }) => {
    return <EntryForm type = 'edit' id = {id} />
}

export default Edit