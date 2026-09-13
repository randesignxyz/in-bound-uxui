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
            width={'700px'}
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
                if (parseFloat(dataForm.side_wall) < 100 || parseFloat(dataForm.side_wall) > 110) {
                    updatedWarningCount++;
                }
                if (parseFloat(dataForm.air_pressure) < 1.5) {
                    updatedWarningCount++;
                }
                if (parseFloat(dataForm.temperature_preform) < 87 || parseFloat(dataForm.temperature_preform) > 115) {
                    updatedWarningCount++;
                }
                if (parseFloat(dataForm.uv) < 100 || parseFloat(dataForm.uv) > 100) {
                    updatedWarningCount++;
                }
                if (parseFloat(dataForm.air_pressure2) < 1.5) {
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
                            <Text style={{ fontWeight: 'bold' }}>PET Inspection </Text>
                            <span style={{ fontSize: 'small', color: 'gray', marginLeft: '5px', }}>(CCP10)</span>

                        </Col>
                        <Col span={12}>
                            <Text style={{ fontWeight: 'bold' }}>Preform interior blower </Text>
                            <span style={{ fontSize: 'small', color: 'gray', marginLeft: '5px', }}>(oPRP7P)</span>

                        </Col>
                        <Divider style={{ marginTop: 10, marginBottom: 10 }} />

                    </Row>
                    <Row gutter={6}>
                        <Col span={12}>
                            <ProFormText
                                hasFeedback={false}
                                rules={[{ required: true, message: 'Please Enter Side-wall' }, { pattern: /^\d*\.?\d+$/, message: 'Please enter a valid number' }]}
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
                                initialValue={data?.side_wall}
                            />
                        </Col>
                        <Col span={12} style={{ display: 'flex', flexDirection: 'column' }}>
                            <ProFormText
                                hasFeedback={false}
                                rules={[{ required: true, message: 'Please Enter Air Pressure' }, { pattern: /^\d*\.?\d+$/, message: 'Please enter a valid number' }]}
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
                                                    {Number(airPressureValue) < 1.5 && airPressureValue !== '' && airPressureValue !== null && (
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
                                initialValue={data?.air_pressure}
                            />
                        </Col>
                    </Row>
                    <Row gutter={6}>
                        <Col span={12}>
                            <Text style={{ fontWeight: 'bold' }}>Preform heating module </Text>
                            <span style={{ fontSize: 'small', color: 'gray', marginLeft: '5px', }}>(oPRP8B)</span>
                        </Col>
                        <Col span={12}>
                            <Text style={{ fontWeight: 'bold' }}>Cap Disinfection </Text>
                            <span style={{ fontSize: 'small', color: 'gray', marginLeft: '5px', }}>(oPRP9B)</span>
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
                                initialValue={data?.temperature_preform}
                            // initialValue={data?.acf}
                            />
                        </Col>
                        <Col span={12} style={{ display: 'flex', flexDirection: 'column' }}>
                            <ProFormText
                                hasFeedback={false}
                                rules={[{ required: true, message: 'Please Enter UV' }, { pattern: /^\d*\.?\d+$/, message: 'Please enter a valid number' }]}
                                label={
                                    <ProForm.Item
                                        noStyle
                                        shouldUpdate={(prevValues, currentValues) => prevValues.uv !== currentValues.uv}
                                    >
                                        {({ getFieldValue }) => {
                                            const uvValue = getFieldValue('uv');
                                            return (
                                                <div>
                                                    UV light intensity
                                                    <span style={{ fontSize: 'small', color: 'gray', marginLeft: '5px' }}>
                                                        (100 %)
                                                    </span>
                                                    {(Number(uvValue) < 100 || Number(uvValue) > 100) && uvValue !== '' && uvValue !== null && (
                                                        <ExclamationCircleOutlined style={{ color: 'red', marginLeft: '5px' }} />
                                                    )}
                                                </div>
                                            );
                                        }}
                                    </ProForm.Item>
                                }
                                name={'uv'}
                                fieldProps={{
                                    type: 'number',
                                    step: 'any'
                                }}
                                initialValue={data?.uv}
                            />
                        </Col>
                    </Row>
                    <Row gutter={6}>
                        <Col span={12}>
                            <Text style={{ fontWeight: 'bold' }}>Bottle Filling and Capping </Text>
                            <span style={{ fontSize: 'small', color: 'gray', marginLeft: '5px', }}>(CCP12B & 13B)</span>
                        </Col>
                        <Col span={12}>
                            <Text style={{ fontWeight: 'bold' }}>Cap Blower </Text>
                            <span style={{ fontSize: 'small', color: 'gray', marginLeft: '5px', }}>(CCP6P)</span>
                        </Col>
                        <Divider style={{ marginTop: 10, marginBottom: 10 }} />

                    </Row>
                    <Row gutter={6}>
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
                        <Col span={12} style={{ display: 'flex', flexDirection: 'column' }}>
                            <ProFormText
                                hasFeedback={false}
                                rules={[{ required: true, message: 'Please Enter Air Pressure' }, { pattern: /^\d*\.?\d+$/, message: 'Please enter a valid number' }]}
                                label={
                                    <ProForm.Item
                                        noStyle
                                        shouldUpdate={(prevValues, currentValues) => prevValues.air_pressure2 !== currentValues.air_pressure2}
                                    >
                                        {({ getFieldValue }) => {
                                            const airPressure2Value = getFieldValue('air_pressure2');
                                            return (
                                                <div>
                                                    Air Pressure
                                                    <span style={{ fontSize: 'small', color: 'gray', marginLeft: '5px' }}>
                                                        (&gt; 1.5 bar)
                                                    </span>
                                                    {Number(airPressure2Value) < 1.5 && airPressure2Value !== '' && airPressure2Value !== null && (
                                                        <ExclamationCircleOutlined style={{ color: 'red', marginLeft: '5px' }} />
                                                    )}
                                                </div>
                                            );
                                        }}
                                    </ProForm.Item>
                                }
                                name={'air_pressure2'}
                                fieldProps={{
                                    type: 'number',
                                    step: 'any'
                                }}
                                initialValue={data?.air_pressure2}
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
                                        <span style={{ fontSize: 'small', color: 'gray', marginLeft: '5px', }}>(Instruction 4)</span>
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
