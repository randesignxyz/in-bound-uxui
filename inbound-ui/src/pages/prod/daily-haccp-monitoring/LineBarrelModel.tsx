import FormModalComp, { FormModalProps } from '@/components/FormModal';
import { ProForm, ProFormText, ProFormTextArea } from '@ant-design/pro-components';
import { useEffect, useState } from 'react';
// import { DailyPreWaterTreatmentList } from './data';
import { useForm } from 'antd/lib/form/Form';
import { Card, Col, Divider, message, Radio, Row, Typography } from 'antd';
import { useAccess } from '@umijs/max';
import { HACCPMonitoring, HACCPMonitoringList } from './data';
import { ExclamationCircleOutlined } from '@ant-design/icons';

interface Props extends FormModalProps {
    data?: HACCPMonitoringList
    type?: string
    onSave: (data: HACCPMonitoringList) => void
    line?: string
    assign_to?: string
}
export default ({ data, onSave, type, line, assign_to, ...props }: Props) => {
    const access = useAccess();
    const [form] = useForm<HACCPMonitoringList>();
    const [activityControl, setActivityControl] = useState<string | undefined | number>(undefined)

    const { Text } = Typography;

    useEffect(() => {
        if (props.open) {
            form.resetFields();
            setActivityControl(data?.activity_control)
        }
    }, [props.open]);

    return (
        <FormModalComp
            title="Inventory Transfer"
            {...props}
            width={'600px'}
            readOnly={!(assign_to?.split(" ").includes(access.currentUser?.login || '') || access.canAssignItemPre)}
            okText={data?.status !== 'pending' ? 'Update' : 'Submit'}
            onSubmit={async () => {
                const dataForm = await form.validateFields();
                let updatedWarningCount = 0;
                if (activityControl == null) {
                    message.error('Please select activity control!')
                    return
                }
                let status = 'normal'
                if (parseFloat(dataForm.uv_lamp) < 10) {
                    updatedWarningCount++;
                }
                if (parseFloat(dataForm.temperature) < 55 || parseFloat(dataForm.temperature) > 75) {
                    updatedWarningCount++;
                }
                if (parseFloat(dataForm.water_pressure) < 1) {
                    updatedWarningCount++;
                }
                if (parseFloat(dataForm.fg) < 0.05 || parseFloat(dataForm.fg) > 0.4) {
                    updatedWarningCount++;
                }
                if (activityControl == 0) {
                    updatedWarningCount++;
                }
                if (updatedWarningCount > 0) {
                    status = 'warning'
                }
                const entity = {
                    ...dataForm,
                    id: data?.id,
                    line: line,
                    warning_count: updatedWarningCount,
                    status: status,
                    activity_control: activityControl,
                    haccp_id: data?.haccp_id,
                    activities: [{ action: "Add Monitoring " }],
                }
                onSave(entity)
            }}
        >
            <ProForm form={form} onReset={() => form.resetFields()} submitter={false}>
                <Card size="small">
                    <Row gutter={6}>
                        <Col span={12}>
                            <Text style={{ fontWeight: 'bold' }}>UV Cabinet </Text>
                            <span style={{ fontSize: 'small', color: 'gray', marginLeft: '5px', }}>(oPRP7)</span>

                        </Col>
                        <Col span={12}>
                            <Text style={{ fontWeight: 'bold' }}>Display Barrel filling </Text>
                            <span style={{ fontSize: 'small', color: 'gray', marginLeft: '5px', }}>(oPRP8)</span>

                        </Col>
                        <Divider style={{ marginTop: 10, marginBottom: 10 }} />

                    </Row>
                    <Row gutter={6}>
                        <Col span={12}>
                            <ProFormText
                                hasFeedback={false}
                                rules={[{ required: true, message: 'Please Enter UV Lamp' }, { pattern: /^\d*\.?\d+$/, message: 'Please enter a valid number' }]}
                                label={
                                    <ProForm.Item
                                        noStyle
                                        shouldUpdate={(prevValues, currentValues) => prevValues.uv_lamp !== currentValues.uv_lamp}
                                    >
                                        {({ getFieldValue }) => {
                                            const uvLampValue = getFieldValue('uv_lamp');
                                            return (
                                                <div>
                                                    UV Lamp
                                                    <span style={{ fontSize: 'small', color: 'gray', marginLeft: '5px' }}>
                                                        (Store cap &gt; 10minutes)
                                                    </span>
                                                    {(Number(uvLampValue) < 10) && uvLampValue !== '' && uvLampValue !== null && (
                                                        <ExclamationCircleOutlined style={{ color: 'red', marginLeft: '5px' }} />
                                                    )}
                                                </div>
                                            );
                                        }}
                                    </ProForm.Item>
                                }
                                name={'uv_lamp'}
                                fieldProps={{
                                    type: 'number',
                                    step: 'any'
                                }}
                                initialValue={data?.uv_lamp}
                            />
                        </Col>
                        <Col span={12} style={{ display: 'flex', flexDirection: 'column' }}>
                            <ProFormText
                                hasFeedback={false}
                                rules={[{ required: true, message: 'Please Enter Temperature' }, { pattern: /^\d*\.?\d+$/, message: 'Please enter a valid number' }]}
                                label={
                                    <ProForm.Item
                                        noStyle
                                        shouldUpdate={(prevValues, currentValues) => prevValues.temperature !== currentValues.temperature}
                                    >
                                        {({ getFieldValue }) => {
                                            const temperatureValue = getFieldValue('temperature');
                                            return (
                                                <div>
                                                    Temperature
                                                    <span style={{ fontSize: 'small', color: 'gray', marginLeft: '5px' }}>
                                                        (55-75 °C)
                                                    </span>
                                                    {(Number(temperatureValue) < 55 || Number(temperatureValue) > 75) && temperatureValue !== '' && temperatureValue !== null && (
                                                        <ExclamationCircleOutlined style={{ color: 'red', marginLeft: '5px' }} />
                                                    )}
                                                </div>
                                            );
                                        }}
                                    </ProForm.Item>
                                }
                                name={'temperature'}
                                fieldProps={{
                                    type: 'number',
                                    step: 'any'
                                }}
                                initialValue={data?.temperature}
                            />
                        </Col>
                    </Row>
                    <Row gutter={6}>
                        <Col span={12}>
                            <Text style={{ fontWeight: 'bold' }}>Barrel Cleaning </Text>
                            <span style={{ fontSize: 'small', color: 'gray', marginLeft: '5px', }}>(oPRP8 & CCP10)</span>
                        </Col>
                        <Col span={12}>
                            <Text style={{ fontWeight: 'bold' }}>Barrel Filling and Capping </Text>
                            <span style={{ fontSize: 'small', color: 'gray', marginLeft: '5px', }}>(CCP11 & 12)</span>
                        </Col>
                        <Divider style={{ marginTop: 10, marginBottom: 10 }} />

                    </Row>
                    <Row gutter={6}>
                        <Col span={12}>
                            <ProFormText
                                hasFeedback={false}
                                rules={[{ required: true, message: 'Please Enter Temperature Preform' }, { pattern: /^\d*\.?\d+$/, message: 'Please enter a valid number' }]}
                                label={
                                    <ProForm.Item
                                        noStyle
                                        shouldUpdate={(prevValues, currentValues) => prevValues.water_pressure !== currentValues.water_pressure}
                                    >
                                        {({ getFieldValue }) => {
                                            const waterPressureValue = getFieldValue('water_pressure');
                                            return (
                                                <div>
                                                    O₃ water pressure
                                                    <span style={{ fontSize: 'small', color: 'gray', marginLeft: '5px' }}>
                                                        (&gt; 1 bar)
                                                    </span>
                                                    {(Number(waterPressureValue) < 1) && waterPressureValue !== '' && waterPressureValue !== null && (
                                                        <ExclamationCircleOutlined style={{ color: 'red', marginLeft: '5px' }} />
                                                    )}
                                                </div>
                                            );
                                        }}
                                    </ProForm.Item>
                                }
                                name={'water_pressure'}
                                fieldProps={{
                                    type: 'number',
                                    step: 'any'
                                }}
                                initialValue={data?.water_pressure}
                            // initialValue={data?.acf}
                            />
                        </Col>
                        <Col span={12} style={{ display: 'flex', flexDirection: 'column' }}>
                            <ProFormText
                                hasFeedback={false}
                                rules={[{ required: true, message: 'Please Enter FG [O₃]' }, { pattern: /^\d*\.?\d+$/, message: 'Please enter a valid number' }]}
                                label={
                                    <ProForm.Item
                                        noStyle
                                        shouldUpdate={(prevValues, currentValues) => prevValues.fg !== currentValues.fg}
                                    >
                                        {({ getFieldValue }) => {
                                            const fgValue = getFieldValue('fg');
                                            return (
                                                <div>
                                                    FG [O₃]
                                                    <span style={{ fontSize: 'small', color: 'gray', marginLeft: '5px' }}>
                                                        (0.05-0.4 ppm)
                                                    </span>
                                                    {(Number(fgValue) < 0.05 || Number(fgValue) > 0.4) && fgValue !== '' && fgValue !== null && (
                                                        <ExclamationCircleOutlined style={{ color: 'red', marginLeft: '5px' }} />
                                                    )}
                                                </div>
                                            );
                                        }}
                                    </ProForm.Item>
                                }
                                name={'fg'}
                                fieldProps={{
                                    type: 'number',
                                    step: 'any'
                                }}
                                initialValue={data?.fg}
                            />
                        </Col>
                    </Row>
                    <Row gutter={6}>
                        <Col span={24}>
                            <Text style={{ fontWeight: 'bold' }}>Activity control when exceeding critical limit</Text>
                            <Divider style={{ marginTop: 10, marginBottom: 10 }} />
                        </Col>
                    </Row>
                    <Row gutter={6}>
                        <Col span={12} style={{ display: 'flex', flexDirection: 'column' }}>
                            <div style={{ flexDirection: 'row' }}>
                                <Text style={{ color: 'red', fontSize: 20 }}>*</Text>
                                <Text style={{ marginBottom: 10 }}>Control</Text>
                                {activityControl == 0 ? <ExclamationCircleOutlined style={{ color: 'red', marginLeft: '5px' }} /> : <></>}
                            </div>
                            <Radio.Group
                                defaultValue={data?.activity_control == '1' ? '1' : data?.activity_control == '0' ? '0' : ''}
                                onChange={(e) => (setActivityControl(e.target.value))}
                            >
                                <Radio value='1'>Under Control</Radio>
                                <Radio value="0">Over Control</Radio>
                            </Radio.Group>
                        </Col>
                        <Col span={12}>

                            <ProFormText
                                hasFeedback={false}
                                // rules={[{ required: true, message: 'Please Enter FG' }]}
                                label={
                                    <div>
                                        Take action
                                        <span style={{ fontSize: 'small', color: 'gray', marginLeft: '5px', }}>(Instruction 3)</span>
                                    </div>
                                }
                                name={'take_action'}
                                initialValue={data?.take_action}
                            />
                        </Col>
                    </Row>
                    <Row gutter={6}>
                        <Col span={24}>
                            <ProFormTextArea
                                hasFeedback={false}
                                label="Other"
                                name={'other'}
                                initialValue={data?.other}
                            // initialValue={data?.status !== 'pending' ? (data?.remark == null ? '-' : data?.remark) : data?.remark}
                            />
                        </Col>
                    </Row>
                </Card>
            </ProForm>
        </FormModalComp>
    );
};
