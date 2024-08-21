import FormModalComp, { FormModalProps } from '@/components/FormModal';
import { ProForm, ProFormText, ProFormTextArea } from '@ant-design/pro-components';
import { useEffect, useState } from 'react';
import { DailyWaterTreatmentItem } from './data';
import { useForm } from 'antd/lib/form/Form';
import { Card, Col, Radio, Row, Typography, message } from 'antd';
import { useAccess } from '@umijs/max';
import { ExclamationCircleOutlined } from '@ant-design/icons';

interface Props extends FormModalProps {
    data?: DailyWaterTreatmentItem,
    onSave: (data: DailyWaterTreatmentItem) => void
}
export default ({ data, onSave, ...props }: Props) => {
    const access = useAccess();
    const [form] = useForm<DailyWaterTreatmentItem>();
    const { Text } = Typography;
    const [air_release, setAir_Release] = useState()
    const [initData, setInitData] = useState<DailyWaterTreatmentItem>()

    useEffect(() => {
        if (props.open) {
            setInitData(data)
            setAir_Release(data?.air_release)
            form.resetFields();
        }
    }, [props.open]);

    return (
        <FormModalComp
            title="Inventory Transfer"
            {...props}
            width={'600px'}
            readOnly={!(data?.assign_to_user?.split(" ").includes(access.currentUser?.login || '') || access.canAssignItem)}
            okText={data?.status !== 'pending' ? 'Update' : 'Submit'}
            onSubmit={async () => {
                const dataForm = await form.validateFields();
                let updatedWarningCount = 0;
                let status = 'normal'
                if (air_release == null) {
                    message.error('Please select an Air Release!')
                    return
                }
                if (parseFloat(dataForm.tds) > 300) {
                    updatedWarningCount++;
                }
                if (parseFloat(dataForm.ph) < 6.5 || parseFloat(dataForm.ph) > 8.5) {
                    updatedWarningCount++;
                }
                if (parseFloat(dataForm.temperature) < 25 || parseFloat(dataForm.temperature) > 35) {
                    updatedWarningCount++;
                }
                if (parseFloat(dataForm.pressure) < 0.1 || parseFloat(dataForm.pressure) > 0.3) {
                    updatedWarningCount++;
                }
                if (air_release == 0) {
                    updatedWarningCount++;
                }
                if (updatedWarningCount > 0) {
                    status = 'warning'
                }
                let entity
                if (initData?.status == 'pending') {
                    entity = {
                        ...dataForm,
                        id: data?.id,
                        warning_count: updatedWarningCount,
                        status: status,
                        air_release: air_release,
                        action: "Add Treatment",
                        treatment_id: data?.treatment_id
                    }
                } else {
                    const changes = [
                        initData?.tds != dataForm.tds ? `TDS from ${initData?.tds} to ${dataForm.tds}` : '',
                        initData?.ph != dataForm.ph ? `PH from ${initData?.ph} to ${dataForm.ph}` : '',
                        initData?.temperature != dataForm.temperature ? `Temperature from ${initData?.temperature} to ${dataForm.temperature}` : '',
                        initData?.air_release != air_release ? `Air Release from ${initData?.air_release == 1 ? 'Yes' : 'No'} to ${air_release == '1' ? 'Yes' : 'No'}` : '',
                        initData?.other != dataForm.other ? `Other from ${initData?.other == null ? '' : initData?.other} to ${dataForm.other}` : '',
                    ];
                    const actionString = changes.filter(change => change !== '').join(', ');

                    entity = {
                        ...dataForm,
                        id: data?.id,
                        warning_count: updatedWarningCount,
                        status: status,
                        air_release: air_release,
                        action: `has modified ${actionString}`,
                        treatment_id: data?.treatment_id
                    }
                }
                // console.log(entity)
                onSave(entity)
            }}
        >
            <ProForm form={form} onReset={() => form.resetFields()} submitter={false}>
                <Card size="small">
                    <Row gutter={6}>
                        <Col span={12}>
                            <ProFormText
                                hasFeedback={false}
                                rules={[{ required: true, message: 'Please Enter TDS' },{ pattern: /^\d*\.?\d+$/, message: 'Please enter a valid number' }]}
                                label={
                                    <ProForm.Item
                                        noStyle
                                        shouldUpdate={(prevValues, currentValues) => prevValues.tds !== currentValues.tds}
                                    >
                                        {({ getFieldValue }) => {
                                            const tdsValue = getFieldValue('tds');
                                            return (
                                                <div>
                                                    TDS
                                                    <span style={{ fontSize: 'small', color: 'gray', marginLeft: '5px' }}>
                                                        (≤300 ppm)
                                                    </span>
                                                    {Number(tdsValue) > 300 && tdsValue !== '' && tdsValue !== null && (
                                                        <ExclamationCircleOutlined style={{ color: 'red', marginLeft: '5px' }} />
                                                    )}
                                                </div>
                                            );
                                        }}
                                    </ProForm.Item>
                                }
                                name={'tds'}
                                initialValue={data?.tds} 
                                fieldProps={{
                                    type: 'number',
                                    step: 'any'
                                  }}/>
                        </Col>
                        <Col span={12}>
                            <ProFormText
                                hasFeedback={false}
                                rules={[{ required: true, message: 'Please Enter PH' },{ pattern: /^\d*\.?\d+$/, message: 'Please enter a valid number' }]}
                                label={
                                    <ProForm.Item
                                        noStyle
                                        shouldUpdate={(prevValues, currentValues) => prevValues.ph !== currentValues.ph}
                                    >
                                        {({ getFieldValue }) => {
                                            const pHValue = getFieldValue('ph');
                                            return (
                                                <div>
                                                    PH
                                                    <span style={{ fontSize: 'small', color: 'gray', marginLeft: '5px' }}>
                                                        (6.5-8.5)
                                                    </span>
                                                    {(Number(pHValue) < 6.5 || Number(pHValue) > 8.5) && pHValue !== '' && pHValue !== null && (
                                                        <ExclamationCircleOutlined style={{ color: 'red', marginLeft: '5px' }} />
                                                    )}
                                                </div>
                                            );
                                        }}
                                    </ProForm.Item>
                                }
                                name={'ph'}
                                initialValue={data?.ph}
                                fieldProps={{
                                    type: 'number',
                                    step: 'any'
                                  }}
                            />
                        </Col>
                    </Row>
                    <Row gutter={6}>
                        <Col span={12}>
                            <ProFormText
                                hasFeedback={false}
                                rules={[{ required: true, message: 'Please Enter Temperature' },{ pattern: /^\d*\.?\d+$/, message: 'Please enter a valid number' }]}
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
                                                        (25-35)°C
                                                    </span>
                                                    {(Number(temperatureValue) < 25 || Number(temperatureValue) > 35) && temperatureValue !== '' && temperatureValue !== null && (
                                                        <ExclamationCircleOutlined style={{ color: 'red', marginLeft: '5px' }} />
                                                    )}
                                                </div>
                                            );
                                        }}
                                    </ProForm.Item>
                                }
                                name={'temperature'}
                                initialValue={data?.temperature}
                                fieldProps={{
                                    type: 'number',
                                    step: 'any'
                                  }}
                            />
                        </Col>
                        <Col span={12}>
                            <ProFormText
                                hasFeedback={false}
                                rules={[{ required: true, message: 'Please Enter Pressure' },{ pattern: /^\d*\.?\d+$/, message: 'Please enter a valid number' }]}
                                label={
                                    <ProForm.Item
                                        noStyle
                                        shouldUpdate={(prevValues, currentValues) => prevValues.pressure !== currentValues.pressure}
                                    >
                                        {({ getFieldValue }) => {
                                            const pressureValue = getFieldValue('pressure');
                                            return (
                                                <div>
                                                    Pressure
                                                    <span style={{ fontSize: 'small', color: 'gray', marginLeft: '5px' }}>
                                                        (0.1-0.3 Mpa)
                                                    </span>
                                                    {(Number(pressureValue) < 0.1 || Number(pressureValue) > 0.3) && pressureValue !== '' && pressureValue !== null && (
                                                        <ExclamationCircleOutlined style={{ color: 'red', marginLeft: '5px' }} />
                                                    )}
                                                </div>
                                            );
                                        }}
                                    </ProForm.Item>
                                }
                                name={'pressure'}
                                initialValue={data?.pressure}
                                fieldProps={{
                                    type: 'number',
                                    step: 'any'
                                  }}
                            />
                        </Col>
                    </Row>
                    <Row gutter={6}>
                        <Col span={12} style={{ display: 'flex', flexDirection: 'column' }}>
                            <div style={{ flexDirection: 'row' }}>
                                <Text style={{ color: 'red', fontSize: 20 }}>*</Text>
                                <Text style={{ marginBottom: 10 }}>Air Release</Text>
                                {(air_release == 0 || data?.air_release == 0) ? <ExclamationCircleOutlined style={{ color: 'red', marginLeft: '5px' }} /> : <></>}
                            </div>
                            <Radio.Group
                                defaultValue={data?.air_release == 1 ? '1' : data?.air_release == 0 ? '0' : ''}
                                onChange={(e) => (setAir_Release(e.target.value))}
                            >
                                <Radio value='1'>Yes</Radio>
                                <Radio value="0">No</Radio>
                            </Radio.Group>
                        </Col>
                        <Col span={12}>
                            <ProFormTextArea
                                hasFeedback={false}
                                label="Other"
                                name={'other'}
                                initialValue={data?.status !== 'pending' ? (data?.other == null ? '-' : data?.other) : data?.other}
                            />
                        </Col>
                    </Row>
                </Card>
            </ProForm>
        </FormModalComp>
    );
};
