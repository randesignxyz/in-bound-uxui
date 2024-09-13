import FormModalComp, { FormModalProps } from '@/components/FormModal';
import {  ProForm, ProFormSelect, ProFormTextArea } from '@ant-design/pro-components';
import { useEffect } from 'react';
import { useForm } from 'antd/lib/form/Form';
import { Card, Col, Row } from 'antd';
import {  HACCPMonitoringInstruction } from './data';

interface Props extends FormModalProps {
    onSave: (data: HACCPMonitoringInstruction) => void;
    isEdit?:boolean
    defaultVal?:string
}
export default ({ onSave,isEdit,defaultVal, ...props }: Props) => {
    const [form] = useForm<HACCPMonitoringInstruction>();

    useEffect(() => {
        form.resetFields()
    }, [props.open]);

    return (
        <FormModalComp
            title="Inventory Transfer"
            {...props}
            width={'800px'}
            onSubmit={async () => {
                const dataForm = await form.validateFields();
                onSave(dataForm)
            }}
        >
            <ProForm form={form} onReset={() => form.resetFields()} submitter={false}>
                <Card size="small">
                    {isEdit == false?
                    <Row gutter={6}>
                        <Col span={24}>
                            <ProFormSelect
                                options={[
                                    {
                                        value: '1',
                                        label: 'Line 2 and 3',
                                    },
                                    {
                                        value: '2',
                                        label: 'Line 4, 5 and 6',
                                    },
                                ]}
                                name="group_line"
                                label="For Line"
                                rules={[{ required: true }]}
                                // fieldProps={{
                                //     onChange: (value: any) => {
                                //         const assignToString = value.join(' ');
                                //         const finalValues = { ...value, assign_to: assignToString };
                                //         setAssignTo(finalValues.assign_to)
                                //     },
                                // }}
                            />
                        </Col>
                    </Row>
                    :<></>}
                    <Row gutter={6}>
                        <Col span={24}>
                            <ProFormTextArea
                                hasFeedback={false}
                                label="Instruction"
                                name={'instruction'}
                                initialValue={defaultVal}
                                rules={[{ required: true }]}
                                fieldProps={{
                                    onChange: (event: React.ChangeEvent<HTMLTextAreaElement>) => {
                                        const value: string = event.target.value;

                                        // console.log(value)
                                    },
                                }}
                            />
                        </Col>
                    </Row>
                </Card>
            </ProForm>
        </FormModalComp>
    );
};
