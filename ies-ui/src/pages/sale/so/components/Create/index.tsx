import React from "react"
import EntryForm from "../SoEntryForm"

interface Props {
    actionHandlers?: {
        onBack?: () => void
    }
}

const Create: React.FC<Props> = ({ actionHandlers }) => {
    return <EntryForm type = 'new'/>


}

export default Create