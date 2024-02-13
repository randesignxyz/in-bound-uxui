import FormModalComp, { FormModalProps } from "@/components/FormModal";
import { ProForm } from "@ant-design/pro-components";
import DocFileUploader from "./DocFileUploader";
import { UploadFile } from "antd";
import { useState } from "react";
import { UploadAttachmentFile } from "../documentation/data";
import { getFileTypeviaExtension } from "../core";
import { useForm } from "antd/es/form/Form";

interface Props extends FormModalProps{
    onSave:(data:UploadAttachmentFile)=>void;
    documentId?:number;
    documentTypeId?:number;
}

const DocFileUploadModal:React.FC <Props> = ({ onSave, documentId, documentTypeId,...props }) =>{
    const [fileUpload, setFileUpload] = useState<UploadFile[]>();
    const [form] = useForm<UploadAttachmentFile>();

    return (
        <FormModalComp
            {...props}
            title="Upload New File"
            onSubmit={async()=>{
                await form.validateFields();
                const entry = {
                    documentId:documentId,
                    attachment:fileUpload?.map(o=>({
                        fileId:o?.response,
                        fileSize:o?.originFileObj?.size,
                        fileName:o?.originFileObj?.name,
                        fileType:o?.originFileObj?.type,
                        fileExtension:getFileTypeviaExtension(o?.originFileObj?.name)
                      }))
                }
                fileUpload?.length?onSave(entry):undefined;
                
            }}
        >
            <ProForm
                submitter={false}
                form={form}
            >
                <DocFileUploader
                
                    onGetFile={(e)=>{
                        setFileUpload(e);
                    }}
                    multi={false}
                    required={fileUpload?.length?false:true}
                    docTypeId={documentTypeId}
                />

            </ProForm>
        </FormModalComp>
    )
}

export default DocFileUploadModal