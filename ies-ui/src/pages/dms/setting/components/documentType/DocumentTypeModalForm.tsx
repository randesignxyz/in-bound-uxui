import FormModalComp, { FormModalProps } from "@/components/FormModal";
import { ProForm, ProFormCheckbox, ProFormDependency, ProFormSelect, ProFormText, ProFormTextArea } from "@ant-design/pro-components";
import { Col, Row } from "antd";
import { useForm } from "antd/es/form/Form";
import { useEffect } from "react";

interface Props extends FormModalProps {
    onSave: (data: DocumentTypeCreate) => void;
    data?:DocumentTypeDTO;
}

const DocumentTypeModalForm: React.FC<Props> = ({ onSave, data, ...props }) => {
    const [form] = useForm<DocumentTypeCreate>();
    useEffect(()=>{
        props.open && form.setFieldsValue({
            ...data,
            fileExtension:data?.fileExtension?.toString()
        })
    })
    return (
        <>
            <FormModalComp
                {...props}
                width="600px"

                onSubmit={async () => {
                    const dataForm = await form.validateFields();
                    onSave({
                        id:data?.id,
                        ...dataForm,
                        fileExtension:dataForm.fileExtension?.toString()
                    });

                }}
                title="Create Document Type"
            >
                <ProForm
                    submitter={false}
                    form={form}
                    style={{
                        backgroundColor: "white"
                    }}
                >
                    <Row gutter={10}>
                        <Col span={24}>
                            <ProFormText
                                name={"name"}
                                rules={[{ required: true }]}
                                label="Type Name"
                            />
                        </Col>
                        <Col span={10}>
                            <ProFormSelect
                                initialValue={"active"}
                                name={"status"}
                                label="Status"
                                rules={[{ required: true }]}
                                options={[
                                    {
                                        value: "active",
                                        label: "Active"
                                    },
                                    {
                                        value: "inactive",
                                        label: "Inactive"
                                    },
                                ]}
                            />
                        </Col>
                        <Col span={8}>
                            <ProFormCheckbox
                                name={"requiredExpire"}
                                label="Require Expire Date"
                            />
                        </Col>

                        <Col span={24}>
                            <ProFormTextArea
                                label="Description"
                                name={"description"}
                            />
                        </Col>

                        <Col span={24}>
                            <ProFormCheckbox
                                label="File Types"
                                addonAfter={"Restrict File Types"}
                                name={"restrictFile"}
                            />

                        </Col>

                        <ProFormDependency dependencies={["restrictFile"]} name={["restrictFile"]}>
                            {({ restrictFile }) => {
                                
                                return (<>
                                    <ProFormCheckbox.Group
                                        disabled={!restrictFile}
                                        name={"fileExtension"}
                                        options={[
                                            {
                                                label: ".pdf",
                                                value: ".pdf"
                                            },
                                            {
                                                label: ".xlsx",
                                                value: ".xlsx"
                                            },
                                            {
                                                label: ".xls",
                                                value: ".xls"
                                            },
                                            {
                                                label: ".docx",
                                                value: ".docx"
                                            },
                                            {
                                                label: ".txt",
                                                value: ".txt"
                                            },
                                            {
                                                label: ".jpg",
                                                value: ".jpg"
                                            },
                                            {
                                                label: ".png",
                                                value: ".png"
                                            },
                                            {
                                                label: ".zip",
                                                value: ".zip"
                                            },
                                        ]}
                                    />
                                </>)
                            }}
                        </ProFormDependency>

                    </Row>

                </ProForm>

            </FormModalComp>
        </>
    )
}

export default DocumentTypeModalForm