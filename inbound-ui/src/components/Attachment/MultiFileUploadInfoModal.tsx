import { ModalForm, ModalFormProps } from "@ant-design/pro-components";
import { UploadType } from "./FileUploader";
import { useState } from "react";

export default ({ file, onCancel, onOk, ...rest }: ModalFormProps & {
    file: UploadType[]; onCancel?: () => void;
    onOk: (file: UploadType[]) => void
}) => {

    const [data, setData] = useState<UploadType[]>([])

    return <ModalForm
        onOpenChange={visible => visible == false && onCancel?.()}
    >
        
    </ModalForm>
}