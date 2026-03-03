import React from "react"
import EntryForm from "../SoEntryForm"

interface Props {
    tabKey?: string;
    openInTab?: true;
    target?: 'PO' | 'GO';
    actionHandlers?: {
        onBack?: (id?: number) => void
    };
    onMarkTabAsModified?: (modified: boolean) => void;
}

const Create: React.FC<Props> = ({ actionHandlers, openInTab, target, onMarkTabAsModified }) => {
    return <EntryForm type='new' openInTab={openInTab} onBack={actionHandlers?.onBack} target={target} onMarkTabAsModified={onMarkTabAsModified} />
}

export default Create