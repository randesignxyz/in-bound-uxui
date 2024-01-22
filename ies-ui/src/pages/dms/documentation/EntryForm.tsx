import { ProForm, ProFormCheckbox, ProFormDatePicker, ProFormDependency, ProFormDigit, ProFormSelect, ProFormText, ProFormTextArea } from "@ant-design/pro-components"
import { Button, Col, Row, UploadFile } from "antd"
import React, { useEffect, useState } from "react";
import FileUploader from "@/components/Attachment/FileUploader";
import { simpleRequestActions } from "@/services/model";
import { DocumentationCreate, DocumentationDTO } from "./data";
import { CategoryServiceAPI } from "../setting/components/category/service";
import FormModalComp, { FormModalProps } from "@/components/FormModal";
import { DocumentTypeServiceAPI } from "../setting/components/documentType/service";
import { CoreServiceAPI } from "../service";
import { DepartmentServiceAPI } from "../setting/components/department/service";
import { useForm } from "antd/lib/form/Form";


interface Props extends FormModalProps {
  type?: 'ADD' | 'EDIT';
  folderId?: number;
  onSave: (data: DocumentationCreate) => void;
  data?: DocumentationDTO;
  libraryId?: number;
}

const DocumentModalForm: React.FC<Props> = ({ type, onSave, folderId, data, libraryId, ...props }: Props) => {

  const requestAction = simpleRequestActions();
  const [url, setUrl] = useState<UploadFile>();
  const [form] = useForm<DocumentationCreate>();
  const [documentTypeHasExpire, setDocumentTypeHasExpire] = useState<DocumentTypeDTO[]>([]);

  useEffect(() => {
    props.open && data && form.setFieldsValue({
      ...data,
      documentTypeId: data.documentType?.id,
      orgUnitId: data.orgUnit?.id,
      departmentId: data.department?.id,

    });
    props.open && !data && form.resetFields();
  }, [props.open]);

  return (<>
    <FormModalComp
      {...props}
      title="Create Document"
      footer={
        <>
          <Button onClick={() => props.onCancel?.()}>Cancel</Button>
          <Button onClick={async () => {
            const dataForm = await form.validateFields();
            const entry = {
              ...dataForm,
              fileId: url?.response,
              fileType: url?.type,
              fileSize: url?.size,
              fileName: url?.name,
              folderId: folderId,
              libraryId: libraryId,
              status: "Draft"
            }
            onSave(entry);
          }} >Save Draft</Button>
          <Button type="primary" onClick={async () => {
            const dataForm = await form.validateFields();
            const entry = {
              ...dataForm,
              fileId: url?.response,
              fileType: url?.type,
              fileSize: url?.size,
              fileName: url?.name,
              folderId: folderId,
              libraryId: libraryId
            }
            onSave(entry);
          }}>Submit</Button>
        </>
      }
    >
      <ProForm
        form={form}

        submitter={false}
      >
        <Row
          gutter={16}
        >

          <Col span={10}>
            <ProFormText
              label={"Document Title"}
              name={"title"}
              rules={[{ required: true }]}
            />
          </Col>

          <Col span={6}>
            <ProFormText
              label={"Document Number"}
              name={"documentCode"}
            />

          </Col>
          <Col span={8}>
            <ProFormSelect
              label={"Category"}
              name={"category"}
              showSearch
              debounceTime={500}
              request={async (k: { keyWords: string }) => {
                const data = await CategoryServiceAPI(requestAction).page({
                  criteria: { searchValue: k.keyWords || "" }
                });

                return data.items.map(it => ({
                  label: it.name,
                  value: it.id
                }));

              }}
            />
          </Col>

          <Col span={8}>
            <ProFormDatePicker
              label="Effective Date"
              name={"effectiveDate"}
              width={"md"}
            />
          </Col>
          <Col span={8}>
            <ProFormSelect
              rules={[{ required: true }]}
              label={"Organization Unit"}
              name={"orgUnitId"}
              showSearch
              request={async (k: { keyWords: string }) => {
                const data = await CoreServiceAPI(requestAction).orgUnitList();
                return data.map(v => ({ label: v.name, value: v.id }))
              }}
            />
          </Col>
          <Col span={8}>
            <ProFormSelect
              name={"departmentId"}
              rules={[{ required: true }]}
              label="Department"
              request={async (k: { keyWords: string }) => {
                const data = await DepartmentServiceAPI(requestAction).page({
                  criteria: {
                    searchValue: k.keyWords || ""
                  }
                });

                return data.items?.map(v => ({ label: v.name, value: v.id }))
              }}
            />
          </Col>
          <Col span={8}>
            <ProFormSelect
              rules={[{ required: true }]}
              label="Document Type"
              name={"documentTypeId"}
              showSearch
              request={async (k: { keyWords: string }) => {
                const data = await DocumentTypeServiceAPI(requestAction).page({
                  criteria: {
                    searchValue: k.keyWords || ""
                  }
                });
                setDocumentTypeHasExpire(data.items);

                return data.items.map((v) => ({ value: v.id, label: v.name }))
              }}
            />
          </Col>
          <ProFormDependency dependencies={["documentTypeId"]} name={["documentTypeId"]}>
            {({ documentTypeId }) => {
              const documentType = documentTypeHasExpire.filter(it => it.id == documentTypeId)[0];
              documentType?.requiredExpire == false && form.resetFields(["isAlert", "expirationDate", "periodDays"])

              return (<>
                {(<>

                  <Col span={7}>
                    <ProFormDatePicker
                      label="Expiration Date"
                      name={"expirationDate"}
                      width={"md"}
                      disabled={!documentType?.requiredExpire}
                      rules={[{ required: documentType?.requiredExpire }]}

                    />

                  </Col>
                  <ProFormCheckbox
                    label="Alert"
                    disabled={!documentType?.requiredExpire}
                    name={"isAlert"}
                  />
                  <ProFormDependency dependencies={["isAlert"]} name={["isAlert"]}>
                    {({ isAlert }) => {
                      return (<>
                        {(
                          <Col span={7}>
                            <ProFormDigit
                              name={"periodDays"}
                              label="Notification Period"
                              rules={[{ required: isAlert }]}
                              disabled={!isAlert || !documentType?.requiredExpire}
                              addonAfter="/days"
                            />
                          </Col>
                        )}
                      </>)
                    }}
                  </ProFormDependency>

                </>)}
              </>)
            }}
          </ProFormDependency>
          <Col span={24}>
            <FileUploader
              required={true}
              onSetFiles={(e) => {
                setUrl(e[0]);

              }}

              initFiles={[data?.attachment?.fileId || ""] ||[]}
            />
          </Col>
        </Row>
        <ProFormTextArea
          name={"description"}
          label="Description"
        />




      </ProForm>

    </FormModalComp>
  </>)
}


export default DocumentModalForm