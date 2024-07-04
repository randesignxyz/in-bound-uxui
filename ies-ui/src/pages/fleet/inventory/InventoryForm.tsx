import FormModalComp, { FormModalProps } from "@/components/FormModal"
import { UploadOutlined } from "@ant-design/icons"
import { ProForm, ProFormCheckbox, ProFormDigit, ProFormGroup, ProFormSelect, ProFormText, ProFormTextArea } from "@ant-design/pro-components"
import { Col, GetProp, Row, Space, Upload, UploadFile, UploadProps } from "antd"
import { useForm } from "antd/es/form/Form"
import { useState } from "react"

interface Props extends FormModalProps {
    onSave: (data:InventoryCreate) => void,
    data?: InventoryCreate
}
const InventoryForm: React.FC<Props> = ({ onSave, data, ...props }) => {
    const [form] = useForm<InventoryCreate>();
    return (
        <>
            <FormModalComp
                {...props}
                title="New Inventory"   
                onSubmit={async () => {
                    const dataForm = await form.validateFields();
                    onSave(dataForm);
                }}
            >
                <ProForm
                    submitter={false}
                    form={form}
                >
                    <Row gutter={16}>
                        <Col span={12}>
                            <ProFormText
                                name={"name"}
                                label="Name"
                                rules={[{ required: true }]}
                            />
                        </Col>
                        <Col span={5}>
                            <ProFormText
                                name={"partNumber"}
                                label="Part Number"
                                rules={[{ required: true }]}
                            />
                        </Col>
                        <Col span={7}>
                            <ProFormSelect
                                name={"category"}
                                label="Category"
                            />
                        </Col>
                        <Col span={8}>
                            <ProFormText
                                name={"brand"}
                                label="Brand"
                            />
                        </Col>
                        <Col span={8}>
                            <ProFormText
                                name={"model"}
                                label="Model"
                            />
                        </Col>
                        <Col span={8}>
                            <ProFormText
                                name={"serialNumber"}
                                label="Serial Number"
                            />
                        </Col>
                    </Row>
                    <Row gutter={16} >
                        <Col span={18}>
                            <Row gutter={16}>
                                <Col span={8}>
                                    <ProFormDigit
                                        name={"qty"}
                                        label="Quantity"
                                        rules={[{ required: true }]}
                                    />
                                </Col>
                                <Col span={8}>
                                    <ProFormDigit
                                        name={"unitCost"}
                                        label="Unit Cost"
                                        rules={[{ required: true }]}
                                    />
                                </Col>
                                <Col span={8}>
                                    <ProFormSelect
                                        name={"unitType"}
                                        label="Unit Type"
                                        rules={[{ required: true }]}
                                        options={[
                                            {
                                                label: "Each",
                                                value: "each"
                                            },
                                            {
                                                label: "Foot",
                                                value: "fott"
                                            },
                                            {
                                                label: "Galon",
                                                value: "galon"
                                            },
                                            {
                                                label: "Inch",
                                                value: "inch"
                                            },
                                            {
                                                label: "Quart",
                                                value: "quart"
                                            },
                                            {
                                                label: "Set",
                                                value: "set"
                                            },
                                        ]}
                                    />
                                </Col>
                                <Col span={8}>
                                    <ProFormText
                                        name={"warehouse"}
                                        label="Warehouse"
                                    />
                                </Col>
                                <Col span={8}>
                                    <ProFormText
                                        name={"vendor"}
                                        label="Vendor"
                                    />
                                </Col>
                                <Col span={8}>
                                    <ProFormText
                                        name={"manufacturer"}
                                        label="Manufacturer"
                                    />
                                </Col>
                            </Row>
                        </Col>
                    </Row>
                    <Row gutter={16}>
                        <Col span={24}>
                            <ProFormTextArea
                                name="description"
                                label="Description"
                            />
                        </Col>
                    </Row>
                </ProForm>
            </FormModalComp>
        </>
    )
}

export default InventoryForm