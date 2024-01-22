import FormModalComp, { FormModalProps } from "@/components/FormModal";
import { ProForm, ProFormCheckbox, ProFormSelect, ProFormText, ProFormTextArea } from "@ant-design/pro-components";
import { Col, Row } from "antd";
import { useForm } from "antd/es/form/Form";

interface Props extends FormModalProps {
    onSave: (data: DocumentTypeCreate) => void
}

const DocumentTypeModalForm: React.FC<Props> = ({ onSave, ...props }) => {
    const [form] = useForm<DocumentTypeCreate>();
    return (
        <>
            <FormModalComp
                {...props}
                width="600px"

                onSubmit={async () => {
                    const dataForm = await form.validateFields();
                    onSave(dataForm);

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
                                rules={[{required:true}]}
                                label="Type Name"
                            />
                        </Col>
                        <Col span={24}>
                            <ProFormSelect
                                initialValue={"active"}
                                name={"status"}
                                label="Status"
                                rules={[{required:true}]}
                                options={[
                                    {
                                        value:"active",
                                        label:"Active"
                                    },
                                    {
                                        value:"inactive",
                                        label:"Inactive"
                                    },
                                ]}
                            />
                        </Col>
                        <Col span={24}>
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
                    </Row>







                </ProForm>

            </FormModalComp>
        </>
    )
}

export default DocumentTypeModalForm