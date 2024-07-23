import FormModalComp, { FormModalProps } from "@/components/FormModal";
import { ProForm, ProFormDependency, ProFormDigit, ProFormTextArea } from "@ant-design/pro-components";
import { Row, Col } from "antd";
import { useForm } from "antd/es/form/Form";
import React, { useEffect } from "react";
import { NormFuelConsumptionCreate } from "../data";

interface Props extends FormModalProps {
    data?: NormFuelConsumptionCreate,
    onSave: (data: NormFuelConsumptionCreate) => void
}

const NormFuelConsumtion: React.FC<Props> = ({ onSave, data, ...props }) => {

    const [form] = useForm<NormFuelConsumptionCreate>();
    useEffect(()=>{
        props.open && form.resetFields();
        props.open && data && form.setFieldsValue({...data});
    }, [props.open]);
    return (
        <FormModalComp
            {...props}
            width="500px"
            title="Norm Fuel Consumption"
            onSubmit={async () => {
                const dataForm = await form.validateFields();
                const entry ={
                    ...dataForm,
                    id:data?.id
                }
                onSave(entry);
            }}
        >
            <ProForm form={form} submitter={false} onReset={() => form.resetFields()}>
                <Row gutter={6}>
                    <Col span={24}>
                        <ProFormDigit
                            label="Truck Tank Capacity"
                            name={'tankCapacity'}
                            rules={[{ required: true }]}
                        />
                    </Col>
                    <Col span={12}>
                        <ProFormDigit
                            label="Usage (WH2)"
                            name={'usage'}
                            rules={[{ required: true }]}
                            placeholder={'50 L'}
                        />
                    </Col>
                    <Col span={12}>
                        <ProFormDigit
                            name={'kilometer'}
                            label="Km/month"
                            rules={[{ required: true }]}
                            placeholder={'500 L'}
                        />
                    </Col>
                    <Col span={24}>
                        <ProFormDependency dependencies={['kilometer', 'usage']} name={['kilometer', 'usage']}>
                            {({ kilometer, usage }) => {
                                const usageRate = ((usage / kilometer) * 100).toFixed(2);
                                form.setFieldValue('usageRate', parseFloat(usageRate));
                                return (
                                    <>
                                        <ProFormDigit
                                            name={'usageRate'}
                                            label="Usage Rate"
                                            fieldProps={{
                                                value: parseFloat(usageRate) || 0,
                                            }}
                                        />
                                    </>
                                );
                            }}
                        </ProFormDependency>
                    </Col>
                    <Col span={24}>
                        <ProFormTextArea name={'remark'} label="Remark" rules={[{ max: 255 }]} />
                    </Col>
                </Row>
            </ProForm>
        </FormModalComp>
    )
}


export default NormFuelConsumtion