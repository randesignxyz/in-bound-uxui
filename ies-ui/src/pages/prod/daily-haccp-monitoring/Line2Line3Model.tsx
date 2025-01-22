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
    line?: string,
    assign_to?: string
}
export default ({ data, onSave, type, line, assign_to, ...props }: Props) => {
    const access = useAccess();
    const [form] = useForm<HACCPMonitoringList>();
    const [smell, setSmell] = useState<string | undefined | number>(undefined);
    const [activityControl, setActivityControl] = useState<string | undefined | number>(undefined)
    const [nozzlesRinser, setNozzlesRinser] = useState<string | undefined | number>(undefined)
    const [opo, setOpo] = useState<string | undefined | number>(undefined)
    const { Text } = Typography;

    useEffect(() => {
        if (props.open) {
            form.resetFields();
            setSmell(data?.smell)
            setActivityControl(data?.activity_control)
            setNozzlesRinser(data?.nozzles_rinser)
            setOpo(data?.opo)
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
                if (smell == null) {
                    message.error('Please select smell!')
                    return
                }
                if (activityControl == null) {
                    message.error('Please select activity control!')
                    return
                }
                if (nozzlesRinser == null) {
                    message.error('Please select nozzles rinser!')
                    return
                }
                if (line == 'Line 3' && opo == null) {
                    message.error('Please select OPO!')
                    return
                }
                let status = 'normal'
                if (parseFloat(dataForm.water_pressure) < 1.0) {
                    updatedWarningCount++;
                }
                if (parseFloat(dataForm.fg) < 0.05 || parseFloat(dataForm.fg) > 0.4) {
                    updatedWarningCount++;
                }
                if (smell == 0) {
                    updatedWarningCount++;
                }
                if (activityControl == 0) {
                    updatedWarningCount++;
                }
                if (nozzlesRinser == 0) {
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
                    nozzles_rinser: nozzlesRinser,
                    smell: smell,
                    opo: opo,
                    activity_control: activityControl,
                    haccp_id: data?.haccp_id,
                    activities: [{ action: "Add Monitoring " }],
                }
                onSave(entity)
            }}
        >
            <ProForm form={form} onReset={() => form.resetFields()} submitter={false}>
                <Card size="small">
                    {line == 'Line 3' ?
                        <Row gutter={12}>
                            <Col span={24} style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
                                <Radio.Group
                                    defaultValue={data?.opo == 'OPO 1' ? 'OPO 1' : data?.opo == 'OPO 2' ? 'OPO 2' : ''}
                                    onChange={(e) => (setOpo(e.target.value))}
                                >
                                    <Radio value='OPO 1'>OPO 1</Radio>
                                    <Radio value="OPO 2">OPO 2</Radio>
                                </Radio.Group>
                            </Col>
                        </Row>
                        : <></>}

                    <Row gutter={6}>
                        <Col span={24}>
                            <Text style={{ fontWeight: 'bold' }}>Bottle and Cap rinsing </Text>
                            <span style={{ fontSize: 'small', color: 'gray', marginLeft: '5px', }}>(oPRP7 & 8 and CCP10 & 11)</span>

                            <Divider style={{ marginTop: 10, marginBottom: 10 }} />
                        </Col>
                    </Row>
                    <Row gutter={6}>
                        <Col span={12}>
                            <ProFormText
                                hasFeedback={false}
                                rules={[{ required: true, message: 'Please Enter Water pressure' }, { pattern: /^\d*\.?\d+$/, message: 'Please enter a valid number' }]}
                                label={
                                    <ProForm.Item
                                        noStyle
                                        shouldUpdate={(prevValues, currentValues) => prevValues.water_pressure !== currentValues.water_pressure}
                                    >
                                        {({ getFieldValue }) => {
                                            const waterPressureValue = getFieldValue('water_pressure');
                                            return (
                                                <div>
                                                    Water pressure
                                                    <span style={{ fontSize: 'small', color: 'gray', marginLeft: '5px' }}>
                                                        (&gt; 1.0 bar)
                                                    </span>
                                                    {Number(waterPressureValue) < 1.0 && waterPressureValue !== '' && waterPressureValue !== null && (
                                                        <ExclamationCircleOutlined style={{ color: 'red', marginLeft: '5px' }} />
                                                    )}
                                                </div>
                                            );
                                        }}
                                    </ProForm.Item>
                                }
                                name={'water_pressure'}
                                initialValue={data?.water_pressure}
                                fieldProps={{
                                    type: 'number',
                                    step: 'any'
                                }}
                            />
                        </Col>
                        <Col span={12} style={{ display: 'flex', flexDirection: 'column' }}>
                            <div style={{ flexDirection: 'row' }}>
                                <Text style={{ color: 'red', fontSize: 20 }}>*</Text>
                                <Text style={{ marginBottom: 10 }}>Nozzles rinser</Text>
                                <span style={{ fontSize: 'small', color: 'gray', marginLeft: '5px', }}>(No one clog of 32/40)</span>
                                {nozzlesRinser == 0 ? <ExclamationCircleOutlined style={{ color: 'red', marginLeft: '5px' }} /> : <></>}

                            </div>
                            <Radio.Group
                                defaultValue={data?.nozzles_rinser == '1' ? '1' : data?.nozzles_rinser == '0' ? '0' : ''}
                                onChange={(e) => (setNozzlesRinser(e.target.value))}
                            >
                                <Radio value='1'>Yes</Radio>
                                <Radio value="0">No</Radio>
                            </Radio.Group>
                            {/* </Col> */}
                        </Col>
                    </Row>
                    <Row gutter={6}>
                        <Col span={24}>
                            <Text style={{ fontWeight: 'bold' }}>Filling and capping </Text>
                            <span style={{ fontSize: 'small', color: 'gray', marginLeft: '5px', }}>(CCP12 & 13)</span>
                            <Divider style={{ marginTop: 10, marginBottom: 10 }} />
                        </Col>
                    </Row>
                    <Row gutter={6}>
                        <Col span={12}>
                            <ProFormText
                                hasFeedback={false}
                                rules={[{ required: true, message: 'Please Enter FG' }, { pattern: /^\d*\.?\d+$/, message: 'Please enter a valid number' }]}
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
                            <div style={{ flexDirection: 'row' }}>
                                <Text style={{ color: 'red', fontSize: 20 }}>*</Text>
                                <Text style={{ marginBottom: 10 }}>Smell</Text>
                                {smell == 0 ? <ExclamationCircleOutlined style={{ color: 'red', marginLeft: '5px' }} /> : <></>}
                            </div>
                            <Radio.Group
                                defaultValue={data?.smell == '1' ? '1' : data?.smell == '0' ? '0' : ''}
                                onChange={(e) => (setSmell(e.target.value))}
                            >
                                <Radio value='1'>Yes</Radio>
                                <Radio value="0">No</Radio>
                            </Radio.Group>
                        </Col>
                    </Row>
                    <Row gutter={6}>
                        <Col span={24}>
                            <Text style={{ fontWeight: 'bold' }}>Activity control when exceeding </Text>
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
                                rules={[nozzlesRinser == 0 || smell == 0 ? { required: true, message: 'Please Enter Take action' } : {}]}
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
                                initialValue={data?.other} />
                        </Col>
                    </Row>
                </Card>
            </ProForm>
        </FormModalComp>
    );
};
