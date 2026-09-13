import FormModalComp, { FormModalProps } from '@/components/FormModal';
import { ProForm, ProFormText, ProFormTextArea } from '@ant-design/pro-components';
import { useEffect, useState } from 'react';
import { DailyWaterTreatmentItem } from './data';
import { useForm } from 'antd/lib/form/Form';
import { Card, Col, Radio, Row, Typography, message } from 'antd';
import { useAccess } from '@umijs/max';
import { ExclamationCircleOutlined } from '@ant-design/icons';

interface Props extends FormModalProps {
    data?: DailyWaterTreatmentItem
    onSave: (data: DailyWaterTreatmentItem) => void
}
export default ({ data, onSave, ...props }: Props) => {
    const access = useAccess();
    const [form] = useForm<DailyWaterTreatmentItem>();
    const { Text } = Typography;
    const [odor, setOder] = useState()
    const [taste, setTaste] = useState()
    const [initData, setInitData] = useState<DailyWaterTreatmentItem>()

    useEffect(() => {
        if (props.open) {
            setInitData(data)
            setOder(data?.odor)
            setTaste(data?.taste)
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
                if (odor == null) {
                    message.error('Please select Odor!')
                    return
                }
                if (taste == null) {
                    message.error('Please select Taste!')
                    return
                }
                if (parseFloat(dataForm.tds) > 10) {
                    updatedWarningCount++;
                }
                if (parseFloat(dataForm.ph) < 6.5 || parseFloat(dataForm.ph) > 8.5) {
                    updatedWarningCount++;
                }
                if (parseFloat(dataForm.press_inlet) < 0.01 || parseFloat(dataForm.press_inlet) > 0.3) {
                    updatedWarningCount++;
                }
                if (parseFloat(dataForm.press_treat) < 0.01 || parseFloat(dataForm.press_treat) > 1.5) {
                    updatedWarningCount++;
                }
                if (parseFloat(dataForm.press_drain) < 0.01 || parseFloat(dataForm.press_drain) > 1.5) {
                    updatedWarningCount++;
                }
                if (odor == 0) {
                    updatedWarningCount++;
                }
                if (taste == 0) {
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
                    odor: odor,
                    taste: taste,
                    action:"Add Treatment",
                    treatment_id:data?.treatment_id
                }
            }else{
                const changes = [
                    initData?.tds != dataForm.tds ? `TDS from ${initData?.tds} to ${dataForm.tds}` : '',
                    initData?.ph != dataForm.ph ? `PH from ${initData?.ph} to ${dataForm.ph}` : '',
                    initData?.press_inlet != dataForm.press_inlet ? `Press-inlet from ${initData?.press_inlet} to ${dataForm.press_inlet}` : '',
                    initData?.press_treat != dataForm.press_treat ? `Press-treat from ${initData?.press_treat} to ${dataForm.press_treat}` : '',
                    initData?.press_drain != dataForm.press_drain ? `Press-drain from ${initData?.press_drain} to ${dataForm.press_drain}` : '',
                    initData?.odor != odor ? `Odor Release from ${initData?.odor == 1 ? 'Yes' : 'No'} to ${odor == 1 ? 'Yes' : 'No'}` : '',
                    initData?.taste != taste ? `Taste from ${initData?.taste == 1 ? 'Yes' : 'No'} to ${taste == 1 ? 'Yes' : 'No'}` : '',
                    initData?.other != dataForm.other ? `Other from ${initData?.other == null ? '' : initData?.other} to ${dataForm.other}` : '',
                ];
                const actionString = changes.filter(change => change !== '').join(', ');

                entity = {
                    ...dataForm,
                    id: data?.id,
                    warning_count: updatedWarningCount,
                    status: status,
                    odor: odor,
                    taste: taste,
                    action: `has modified ${actionString}`,
                    treatment_id:data?.treatment_id
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
                                rules={[{ required: true, message: 'Please Enter TDS'  },{ pattern: /^\d*\.?\d+$/, message: 'Please enter a valid number' }]}
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
                                                    (≤10 ppm)
                                                    </span>
                                                    {Number(tdsValue) > 10 && tdsValue !== '' && tdsValue !== null && (
                                                        <ExclamationCircleOutlined style={{ color: 'red', marginLeft: '5px' }} />
                                                    )}
                                                </div>
                                            );
                                        }}
                                    </ProForm.Item>
                                }
                                fieldProps={{
                                    type: 'number', // Restrict input type to number
                                    step: 'any'     // Allow any number, including decimals
                                  }}
                                name={'tds'}
                                initialValue={data?.tds}
                                fieldProps={{
                                    type: 'number',
                                    step: 'any'
                                  }}
                            />
                        </Col>
                        <Col span={12}>
                            <ProFormText
                                hasFeedback={false}
                                rules={[{ required: true, message: 'Please Enter PH'  },{ pattern: /^\d*\.?\d+$/, message: 'Please enter a valid number' }]}
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
                                rules={[{ required: true, message: 'Please Enter Press-inlet'  },{ pattern: /^\d*\.?\d+$/, message: 'Please enter a valid number' }]}
                                label={
                                    <ProForm.Item
                                        noStyle
                                        shouldUpdate={(prevValues, currentValues) => prevValues.press_inlet !== currentValues.press_inlet}
                                    >
                                        {({ getFieldValue }) => {
                                            const pressInletValue = getFieldValue('press_inlet');
                                            return (
                                                <div>
                                                    Press-inlet
                                                    <span style={{ fontSize: 'small', color: 'gray', marginLeft: '5px' }}>
                                                        (0.01-0.3 Mpa)
                                                    </span>
                                                    {(Number(pressInletValue) < 0.01 || Number(pressInletValue) > 0.3) && pressInletValue !== '' && pressInletValue !== null && (
                                                        <ExclamationCircleOutlined style={{ color: 'red', marginLeft: '5px' }} />
                                                    )}
                                                </div>
                                            );
                                        }}
                                    </ProForm.Item>
                                }
                                name={'press_inlet'}
                                initialValue={data?.press_inlet}
                                fieldProps={{
                                    type: 'number',
                                    step: 'any'
                                  }}
                            />
                        </Col>
                        <Col span={12}>
                            <ProFormText
                                hasFeedback={false}
                                rules={[{ required: true, message: 'Please Enter Press-Treat'  },{ pattern: /^\d*\.?\d+$/, message: 'Please enter a valid number' }]}
                                label={
                                    <ProForm.Item
                                        noStyle
                                        shouldUpdate={(prevValues, currentValues) => prevValues.press_treat !== currentValues.press_treat}
                                    >
                                        {({ getFieldValue }) => {
                                            const pressTreatValue = getFieldValue('press_treat');
                                            return (
                                                <div>
                                                    Press-Treat
                                                    <span style={{ fontSize: 'small', color: 'gray', marginLeft: '5px' }}>
                                                        (0.01-1.5 Mpa)
                                                    </span>
                                                    {(Number(pressTreatValue) < 0.01 || Number(pressTreatValue) > 1.5) && pressTreatValue !== '' && pressTreatValue !== null && (
                                                        <ExclamationCircleOutlined style={{ color: 'red', marginLeft: '5px' }} />
                                                    )}
                                                </div>
                                            );
                                        }}
                                    </ProForm.Item>
                                }
                                name={'press_treat'}
                                initialValue={data?.press_treat}
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
                                rules={[{ required: true, message: 'Please Enter Press-Drain'  },{ pattern: /^\d*\.?\d+$/, message: 'Please enter a valid number' }]}
                                label={
                                    <ProForm.Item
                                        noStyle
                                        shouldUpdate={(prevValues, currentValues) => prevValues.press_drain !== currentValues.press_drain}
                                    >
                                        {({ getFieldValue }) => {
                                            const pressDrainValue = getFieldValue('press_drain');
                                            return (
                                                <div>
                                                    Press-Drain
                                                    <span style={{ fontSize: 'small', color: 'gray', marginLeft: '5px' }}>
                                                        (0.01-1.5 Mpa)
                                                    </span>
                                                    {(Number(pressDrainValue) < 0.01 || Number(pressDrainValue) > 1.5) && pressDrainValue !== '' && pressDrainValue !== null && (
                                                        <ExclamationCircleOutlined style={{ color: 'red', marginLeft: '5px' }} />
                                                    )}
                                                </div>
                                            );
                                        }}
                                    </ProForm.Item>
                                }
                                name={'press_drain'}
                                initialValue={data?.press_drain}
                                fieldProps={{
                                    type: 'number',
                                    step: 'any'
                                  }}
                            />
                        </Col>

                        <Col span={6} style={{ display: 'flex', flexDirection: 'column' }}>
                            <div style={{ flexDirection: 'row' }}>
                                <Text style={{ color: 'red', fontSize: 20 }}>*</Text>
                                <Text style={{ marginBottom: 10 }}>Odor</Text>
                                {(odor == 0 || data?.odor == 0) ? <ExclamationCircleOutlined style={{ color: 'red', marginLeft: '5px' }} /> : <></>}
                            </div>
                            <Radio.Group
                                defaultValue={data?.odor == 1 ? '1' : data?.odor == 0 ? '0' : ''}
                                // value={data?.sf == '1' ? '1' : data?.sf == '0' ? '0' : ''}
                                onChange={(e) => (setOder(e.target.value))}
                            >
                                <Radio value='1'>Yes</Radio>
                                <Radio value="0">No</Radio>
                            </Radio.Group>
                        </Col>
                        <Col span={6} style={{ display: 'flex', flexDirection: 'column' }}>
                            <div style={{ flexDirection: 'row' }}>
                                <Text style={{ color: 'red', fontSize: 20 }}>*</Text>
                                <Text style={{ marginBottom: 10 }}>Taste</Text>
                                {(taste == 0 || data?.taste == 0) ? <ExclamationCircleOutlined style={{ color: 'red', marginLeft: '5px' }} /> : <></>}
                            </div>
                            <Radio.Group
                                defaultValue={data?.taste == 1 ? '1' : data?.taste == 0 ? '0' : ''}
                                // value={data?.sf == '1' ? '1' : data?.sf == '0' ? '0' : ''}
                                onChange={(e) => (setTaste(e.target.value))}
                            >
                                <Radio value='1'>Yes</Radio>
                                <Radio value="0">No</Radio>
                            </Radio.Group>
                        </Col>
                    </Row>
                    <Row gutter={6}>
                        <Col span={24}>
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
