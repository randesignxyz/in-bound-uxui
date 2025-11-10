import { ModalForm, ModalFormProps, ProFormTextArea } from "@ant-design/pro-components";
import { useForm } from "antd/es/form/Form";
import React, { useEffect, useState } from "react";
import FileUploader from "@/components/Attachment/FileUploader";
import { AttachmentEntry } from "@/components/Attachment/AttachmentEntry";
import AttachmentsEntity from "../so/components/AttachmentsEntity";


interface Props extends ModalFormProps {
    onSave: (data: any) => void
}

const RemarkModal: React.FC<Props> = ({ onSave, ...props }) => {
    const [form] = useForm<RemarkParam>();
    const [file, setFile] = useState<string[]>([]);
    useEffect(() => {
        props.open && form.resetFields()
        props.open && setFile([])
    }, [props.open])


    return (
        <>
            <ModalForm
                {...props}
                form={form}
                width={500}
                onFinish={async () => {
                    const d = await form.validateFields();
                    onSave({
                        ...d,
                        attached: file?.filter(p => p).join(",")
                    })
                }}
            >

                <ProFormTextArea
                    name="remark"
                    label={"Remark"}
                />
               
                <FileUploader
                    onSetFiles={(d) => {
                        setFile(d?.map(p => p.response));
                    }}
                />

            </ModalForm>
        </>
    )
}

export default RemarkModal