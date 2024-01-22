import { UploadFile } from "antd/lib/upload/interface"
import React from "react"
import FileUploader from "./FileUploader"

export const AttachmentEntry: React.FC<{
    files: UploadFile[];
    multiple?: boolean;
    service?: "WORK_FLOW" | "FILE" ;
    onAddFile?: (files: UploadFile) => void;
    onRemoveFile?: (files: UploadFile) => void;
}> = ({ files, multiple, service, onAddFile, onRemoveFile }) => {

    return (
        <FileUploader
            multiple = {multiple}
            service = {service}
            // uploadFiles={files}
            actionHandlers={{
                onAddFile: onAddFile,
                onRemoveFile: onRemoveFile,
            }} />
    )
}
