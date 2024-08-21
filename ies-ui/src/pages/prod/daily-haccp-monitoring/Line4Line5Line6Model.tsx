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
    data?: HACCPMonitoring
    type?: string
    onSave: (data: HACCPMonitoringList) => void
}
export default ({ data, onSave, type, ...props }: Props) => {
    const access = useAccess();
    const [form] = useForm<HACCPMonitoringList>();
    const [activityControl, setActivityControl] = useState()

    const { Text } = Typography;

    useEffect(() => {
        if (props.open) {
            form.resetFields();
            setActivityControl(undefined)
        }
    }, [props.open]);

    return (
        <FormModalComp
            title="Inventory Transfer"
            {...props}
            width={'600px'}
            // readOnly={!(data?.assign_to_user?.split(" ").includes(access.currentUser?.login || '') || access.canAssignItemPre)}            
            // okText={data?.status !== 'pending' ? 'Update' : 'Submit'}
            onSubmit={async () => {
                const dataForm = await form.validateFields();
                let updatedWarningCount = 0;
                if (activityControl == null) {
                    message.error('Please select activity control!')
                    return
                }
                let status = 'normal'
                if (parseFloat(dataForm.side_wall) < 100 || parseFloat(dataForm.side_wall) > 110) {
                    updatedWarningCount++;
                }
                if (parseFloat(dataForm.air_pressure) < 1.5) {
                    updatedWarningCount++;
                }
                if (parseFloat(dataForm.temperature_preform) < 87 || parseFloat(dataForm.temperature_preform) > 115) {
                    updatedWarningCount++;
                }
                if (parseFloat(dataForm.treated_water_pressure) < 1.5) {
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
                    line:data?.line,
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
                            <Text style={{ fontWeight: 'bold' }}>PET Inspection </Text>
                            <span style={{ fontSize: 'small', color: 'gray', marginLeft: '5px', }}>(CCP10)</span>

                        </Col>
                        <Col span={12}>
                            <Text style={{ fontWeight: 'bold' }}>Preform interior blower </Text>
                            <span style={{ fontSize: 'small', color: 'gray', marginLeft: '5px', }}>(oPRP7)</span>

                        </Col>
                        <Divider style={{ marginTop: 10, marginBottom: 10 }} />

                    </Row>
                    <Row gutter={6}>
                        <Col span={12}>
                            <ProFormText
                                hasFeedback={false}
                                rules={[{ required: true, message: 'Please Enter Side-wall' },{ pattern: /^\d*\.?\d+$/, message: 'Please enter a valid number' }]}
                                label={
                                    <ProForm.Item
                                        noStyle
                                        shouldUpdate={(prevValues, currentValues) => prevValues.side_wall !== currentValues.side_wall}
                                    >
                                        {({ getFieldValue }) => {
                                            const sideWallValue = getFieldValue('side_wall');
                                            return (
                                                <div>
                                                    Side-wall
                                                    <span style={{ fontSize: 'small', color: 'gray', marginLeft: '5px' }}>
                                                    (Sensitive 100-110%)
                                                    </span>
                                                    {(Number(sideWallValue) < 100 || Number(sideWallValue) > 110) && sideWallValue !== '' && sideWallValue !== null && (
                                                        <ExclamationCircleOutlined style={{ color: 'red', marginLeft: '5px' }} />
                                                    )}
                                                </div>
                                            );
                                        }}
                                    </ProForm.Item>
                                }
                                name={'side_wall'}
                                fieldProps={{
                                    type: 'number',
                                    step: 'any'
                                  }}
                            // initialValue={data?.raw_water}
                            />
                        </Col>
                        <Col span={12} style={{ display: 'flex', flexDirection: 'column' }}>
                            <ProFormText
                                hasFeedback={false}
                                rules={[{ required: true, message: 'Please Enter Air Pressure' },{ pattern: /^\d*\.?\d+$/, message: 'Please enter a valid number' }]}
                                label={
                                    <ProForm.Item
                                        noStyle
                                        shouldUpdate={(prevValues, currentValues) => prevValues.air_pressure !== currentValues.air_pressure}
                                    >
                                        {({ getFieldValue }) => {
                                            const airPressureValue = getFieldValue('air_pressure');
                                            return (
                                                <div>
                                                    Air Pressure
                                                    <span style={{ fontSize: 'small', color: 'gray', marginLeft: '5px' }}>
                                                    (&gt; 1.5 bar)
                                                    </span>
                                                    {Number(airPressureValue)  < 1.5 && airPressureValue !== '' && airPressureValue !== null && (
                                                        <ExclamationCircleOutlined style={{ color: 'red', marginLeft: '5px' }} />
                                                    )}
                                                </div>
                                            );
                                        }}
                                    </ProForm.Item>
                                }
                                name={'air_pressure'}
                                fieldProps={{
                                    type: 'number',
                                    step: 'any'
                                  }}
                            />
                        </Col>
                    </Row>
                    <Row gutter={6}>
                        <Col span={12}>
                            <Text style={{ fontWeight: 'bold' }}>Preform heating module </Text>
                            <span style={{ fontSize: 'small', color: 'gray', marginLeft: '5px', }}>(oPRP8)</span>
                        </Col>
                        <Col span={12}>
                            <Text style={{ fontWeight: 'bold' }}>Bottle Filling and Capping </Text>
                            <span style={{ fontSize: 'small', color: 'gray', marginLeft: '5px', }}>(CCP12 & 13)</span>
                        </Col>
                        <Divider style={{ marginTop: 10, marginBottom: 10 }} />

                    </Row>
                    <Row gutter={6}>
                        <Col span={12}>
                            <ProFormText
                                hasFeedback={false}
                                rules={[{ required: true, message: 'Please Enter Temperature Preform' },{ pattern: /^\d*\.?\d+$/, message: 'Please enter a valid number' }]}
                                label={
                                    <ProForm.Item
                                        noStyle
                                        shouldUpdate={(prevValues, currentValues) => prevValues.temperature_preform !== currentValues.temperature_preform}
                                    >
                                        {({ getFieldValue }) => {
                                            const temperaturePreformValue = getFieldValue('temperature_preform');
                                            return (
                                                <div>
                                                    Temperature Preform
                                                    <span style={{ fontSize: 'small', color: 'gray', marginLeft: '5px' }}>
                                                    (87-115 °C)
                                                    </span>
                                                    {(Number(temperaturePreformValue) < 87 || Number(temperaturePreformValue) > 115) && temperaturePreformValue !== '' && temperaturePreformValue !== null && (
                                                        <ExclamationCircleOutlined style={{ color: 'red', marginLeft: '5px' }} />
                                                    )}
                                                </div>
                                            );
                                        }}
                                    </ProForm.Item>
                                }
                                name={'temperature_preform'}
                                fieldProps={{
                                    type: 'number',
                                    step: 'any'
                                  }}
                            // initialValue={data?.acf}
                            />
                        </Col>
                        <Col span={12} style={{ display: 'flex', flexDirection: 'column' }}>
                        <ProFormText
                                hasFeedback={false}
                                rules={[{ required: true, message: 'Please Enter FG [O₃]' },{ pattern: /^\d*\.?\d+$/, message: 'Please enter a valid number' }]}
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
                            />
                        </Col>
                    </Row>
                    <Row gutter={6}>
                        <Col span={12}>
                            <Text style={{ fontWeight: 'bold' }}>Cap rinsing </Text>
                            <span style={{ fontSize: 'small', color: 'gray', marginLeft: '5px', }}>(CCP11 & oPRP9)</span>
                            <Divider style={{ marginTop: 10, marginBottom: 10 }} />
                        </Col>
                    </Row>
                    <Row gutter={6}>
                    <Col span={24} style={{ display: 'flex', flexDirection: 'column' }}>
                        <ProFormText
                                hasFeedback={false}
                                rules={[{ required: true, message: 'Please Enter Treated water pressure/Flow scale' },{ pattern: /^\d*\.?\d+$/, message: 'Please enter a valid number' }]}
                                label={
                                    <ProForm.Item
                                        noStyle
                                        shouldUpdate={(prevValues, currentValues) => prevValues.treated_water_pressure !== currentValues.treated_water_pressure}
                                    >
                                        {({ getFieldValue }) => {
                                            const treatedWaterPressureValue = getFieldValue('treated_water_pressure');
                                            return (
                                                <div>
                                                    Treated water pressure/Flow scale
                                                    <span style={{ fontSize: 'small', color: 'gray', marginLeft: '5px' }}>
                                                    (&gt; 1.5 bar / flow scale&gt;3)
                                                    </span>
                                                    {Number(treatedWaterPressureValue) < 1.5 && treatedWaterPressureValue !== '' && treatedWaterPressureValue !== null && (
                                                        <ExclamationCircleOutlined style={{ color: 'red', marginLeft: '5px' }} />
                                                    )}
                                                </div>
                                            );
                                        }}
                                    </ProForm.Item>
                                }
                                name={'treated_water_pressure'}
                                fieldProps={{
                                    type: 'number',
                                    step: 'any'
                                  }}
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
                                        <span style={{ fontSize: 'small', color: 'gray', marginLeft: '5px', }}>(Instruction 4)</span>
                                    </div>
                                }
                                name={'take_action'}
                            />
                        </Col>
                    </Row>
                    <Row gutter={6}>
                        <Col span={24}>
                            <ProFormTextArea
                                hasFeedback={false}
                                label="Other"
                                name={'other'}
                            // initialValue={data?.status !== 'pending' ? (data?.remark == null ? '-' : data?.remark) : data?.remark}
                            />
                        </Col>
                    </Row>
                </Card>
            </ProForm>
        </FormModalComp>
    );
};
