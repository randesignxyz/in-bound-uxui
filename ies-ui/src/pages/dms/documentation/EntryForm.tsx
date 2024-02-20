import { ProForm } from "@ant-design/pro-components"
import { Button, UploadFile } from "antd"
import React, { useEffect, useState } from "react";
import { simpleRequestActions } from "@/services/model";
import { DocumentationCreate, DocumentationDTO } from "./data";
import FormModalComp, { FormModalProps } from "@/components/FormModal";
import { useForm } from "antd/lib/form/Form";
import DocFileUploader from "../attachment/DocFileUploader";
import { getFileTypeviaExtension } from "../core";
import DocumentationEntry from "./DocumentationEntry";
import ContractEntry from "../contract/ContractEntry";


interface Props extends FormModalProps {
  type?: 'ADD' | 'EDIT';
  folderId?: number;
  onSave: (data: DocumentationCreate) => void;
  data?: DocumentationDTO;
  libraryId?: number;
  division?: string;
  
}

const DocumentModalForm: React.FC<Props> = ({ type, onSave, division, folderId, data, libraryId, ...props }: Props) => {

  const requestAction = simpleRequestActions();
  const [fileUpload, setFileUpload] = useState<{file?:UploadFile[],required?:boolean}>();
  const [form] = useForm<DocumentationCreate>();


  useEffect(() => {
    props.open && data && form.setFieldsValue({
      ...data.documentation,
      buId:data.buId?.id,
      ...data.term
      
    });
    props.open && !data && form.resetFields();

  }, [props.open]);

  return (<>
    <FormModalComp
      {...props}
      title={` ${type=="ADD"?"New":"Edit"} ${division=="DOC"?"Document Form":"Contract Form"}`}
      footer={
        <>
          <Button onClick={() => props.onCancel?.()}>Cancel</Button>
          <Button type="primary" onClick={async () => {
            // console.log(fileUpload?.file?.length);
            !fileUpload?.file?.length && setFileUpload({required:true});
            const dataForm = await form.validateFields();
            const entry: DocumentationCreate = {
              id:data?.id,
              libraryId: libraryId,
              folderId: folderId,
              division: division,
              buId:dataForm.buId,
              content: {
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
            
            
             onSave(entry);
            // // fileUpload?.file && onSave(entry)
            // console.log(fileUpload?.file?.length);
            
          }}>Submit</Button>
        </>
      }
    >
      <ProForm
        form={form}
        submitter={false}
      >
        {
          (division == "DOC") && <DocumentationEntry /> ||
          <ContractEntry />
        }

        {!data && (
          <DocFileUploader
            service="FILE"
            required={fileUpload?.required}
            multi={true}
            onGetFile={(e) => {
              setFileUpload({file:e})
              
            }}
          />
        )}
      </ProForm>

    </FormModalComp>
  </>)
}


export default DocumentModalForm