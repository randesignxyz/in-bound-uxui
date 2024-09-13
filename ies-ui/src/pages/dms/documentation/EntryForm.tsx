import { ProForm } from "@ant-design/pro-components"
import { Button, UploadFile, message } from "antd"
import React, { useEffect, useState } from "react";
import { DocumentationCreate, DocumentationDTO } from "./data";
import FormModalComp, { FormModalProps } from "@/components/FormModal";
import { useForm } from "antd/lib/form/Form";
import DocFileUploader from "../attachment/DocFileUploader";
import { getFileTypeviaExtension } from "../core";
import DocumentationEntry from "./DocumentationEntry";
import ContractEntry from "../contract/ContractEntry";
interface Props extends FormModalProps {
  type?: 'ADD' | 'EDIT';
  onSave: (data: DocumentationCreate) => void;
  data?: DocumentationDTO;
  libraryId?: number;
  division?: string;
}
const DocumentModalForm: React.FC<Props> = ({ type, onSave, division, data, libraryId, ...props }: Props) => {
  const [fileUpload, setFileUpload] = useState<{ file?: UploadFile[], required?: boolean }>();
  const [form] = useForm<DocumentationCreate>();

  useEffect(() => {
    props.open && data && form.setFieldsValue({
      ...data.documentation,
      buId: data.buId?.id,
      category:data.category,
      ...data.accountant,
      ...data.term
    });
    props.open && !data && form.resetFields();
  }, [props.open]);
  return (<>
    <FormModalComp
      {...props}
      title={` ${type == "ADD" ? "New" : "Edit"} ${division == "DOC" ? "Document Form" : "Contract Form"}`}
      footer={
        <>
          <Button onClick={() => props.onCancel?.()}>Cancel</Button>
          <Button type="primary" onClick={async () => {
            !fileUpload?.file?.length && setFileUpload({ required: true });
            const dataForm = await form.validateFields();
            const entry: DocumentationCreate = {
              id: data?.id,
              libraryId: libraryId,
              division: division,
              category:dataForm.category,
              buId: dataForm.buId,
              content: {
                ...dataForm
              },
              accountant:{
                ...dataForm
              },
              term: {
                ...dataForm
              },
              attachment: fileUpload?.file?.map(o => ({
                fileId: o?.response,
                fileSize: o?.originFileObj?.size,
                fileName: o?.originFileObj?.name,
                fileType: o?.originFileObj?.type,
                fileExtension: getFileTypeviaExtension(o?.originFileObj?.name)
              })),
            }
            if(type==="ADD"){
              if(fileUpload?.file?.length){
                onSave(entry);
              }
              else{
                message.warning("Please upload file to attach contract!")
              }
            }
            else{
              onSave(entry);
            }
          }}>Submit</Button>
        </>
      }
    >
      <ProForm
        form={form}
        submitter={false}
      >
        {
          (division == "DOC") && 
          <DocumentationEntry data={data}/> ||
          <ContractEntry data={data} />
        }
        {!data && (
          <DocFileUploader
            service="FILE"
            required={fileUpload?.required}
            multi={true}
            onGetFile={(e) => {
              setFileUpload({ file: e });
            }}
          />
        )}
      </ProForm>

    </FormModalComp>
  </>)
}
export default DocumentModalForm