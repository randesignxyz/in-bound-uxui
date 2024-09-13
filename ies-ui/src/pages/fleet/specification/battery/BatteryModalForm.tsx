import FormModalComp, { FormModalProps } from "@/components/FormModal";
import { ProForm, ProFormDatePicker, ProFormDigit, ProFormText } from "@ant-design/pro-components";
import { Row, Col } from "antd";
import { useForm } from "antd/es/form/Form";
import React, { useEffect } from "react";
import { BatteryVehicleCreate, BatteryVehicleDTO } from "../data";

interface Props extends FormModalProps {
    data?: BatteryVehicleDTO,
    onSave: (data: BatteryVehicleCreate) => void
}

const BatteryModalForm: React.FC<Props> = ({ onSave, data, ...props }) => {
    const [form] = useForm<BatteryVehicleCreate>();
    useEffect(() => {
        props.open && form.resetFields();
        props.open && data && form.setFieldsValue({ ...data });
    }, [props.open]);

    return (
        <FormModalComp
            {...props}
            width="500px"
            title="Norm Fuel Consumption"
            onSubmit={async () => {
                const dataForm = await form.validateFields();
                const entry = {
                    ...dataForm,
                    id: data?.id
                }
                onSave(entry);
            }}
        >
            <ProForm
                form={form}
                submitter={false}
                onReset={() => form.resetFields()}
            >
                <Row gutter={12} >
                    <Col span={12}>
                        <ProFormText
                            name={"brand"}
                            label="Brand"
                            rules={[{ required: true }]}
                        />
                        <ProFormText
                            name={"code"}
                            label="Code"
                            rules={[{ required: true }]}
                        />
                        <ProFormText
                            name="power"
                            label="Power (Ah)"
                            rules={[{ required: true }]}
                        />
                    </Col>
                    <Col span={12}>
                        <ProFormDigit
                            rules={[{ required: true }]}
                            name={"quantity"}
                            label="Quantity"
                        />
                        <ProFormText
                            name={"durability"}
                            label="Durability"
                        />
                        <ProFormDatePicker
                            width={"xl"}
                            name={"purchaseDate"}
                            label="Purchase Date"
                        />
                    </Col>
                </Row>
            </ProForm>
        </FormModalComp>
    )
}


export default BatteryModalForm