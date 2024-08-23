import { ActionDataFormProps } from "@/pages/process-flow/data";
import ActionFormWrapper from '@/pages/process-flow/components/forms/ActionFormWrapper';
import { useState } from "react";
import { UploadFile } from "antd";

export default (props: ActionDataFormProps) => {

    const [files, setFiles] = useState<UploadFile[]>([])

    return <ActionFormWrapper {...props} title="Stock Transfer"
        actionHandlers={{
            ...props.actionHandlers,
            onCompleted: () => {
                props.actionHandlers?.onCancel?.(true)
            },
            onSetFiles: file => setFiles(v => (file)),
            onRemoveFile: file => setFiles(v => v.filter(it => it.uid !== file.uid)),
        }}
    >
        <div>Do Transfer</div>
    </ActionFormWrapper>
}
