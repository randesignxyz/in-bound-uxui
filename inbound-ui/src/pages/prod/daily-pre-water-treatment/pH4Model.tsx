import FormModalComp, { FormModalProps } from '@/components/FormModal';
import { ProForm, ProFormText, ProFormTextArea } from '@ant-design/pro-components';
import { useEffect, useState } from 'react';
import { DailyPreWaterTreatmentList } from './data';
import { useForm } from 'antd/lib/form/Form';
import { Card, Col, Row } from 'antd';
import { useAccess } from '@umijs/max';
import { ExclamationCircleOutlined } from '@ant-design/icons';

interface Props extends FormModalProps {
    data?: DailyPreWaterTreatmentList
    type?: string
    onSave: (data: DailyPreWaterTreatmentList) => void
}
export default ({ data, onSave, type, ...props }: Props) => {
    const access = useAccess();
    const [form] = useForm<DailyPreWaterTreatmentList>();
    const [initData, setInitData] = useState<DailyPreWaterTreatmentList>()

    useEffect(() => {
        if (props.open) {
            setInitData(data)
            form.resetFields();
        }
    }, [props.open]);

    return (
        <FormModalComp
            title="Inventory Transfer"
            {...props}
            width={'600px'}
            readOnly={!(data?.assign_to_user?.split(" ").includes(access.currentUser?.login || '') || access.canAssignItemPre)}            
            okText={data?.status !== 'pending' ? 'Update' : 'Submit'}
            onSubmit={async () => {
                const dataForm = await form.validateFields();
                let updatedWarningCount = 0;
                let status = 'normal'
                if (parseFloat(dataForm.raw_water) < 6.5 || parseFloat(dataForm.raw_water) > 8.5) {
                    updatedWarningCount++;
                }
                if (parseFloat(dataForm.sf1) < 6.5 || parseFloat(dataForm.sf1) > 8.5) {
                    updatedWarningCount++;
                }
                if (parseFloat(dataForm.sf2) < 6.5 || parseFloat(dataForm.sf2) > 8.5) {
                    updatedWarningCount++;
                }
                if (parseFloat(dataForm.acf1) < 6.5 || parseFloat(dataForm.acf1) > 8.5) {
                    updatedWarningCount++;
                }
                if (parseFloat(dataForm.acf2) < 6.5 || parseFloat(dataForm.acf2) > 8.5) {
                    updatedWarningCount++;
                }
                if (parseFloat(dataForm.um101) < 6.5 || parseFloat(dataForm.um101) > 8.5) {
                    updatedWarningCount++;
                }
                if (parseFloat(dataForm.um102) < 6.5 || parseFloat(dataForm.um102) > 8.5) {
                    updatedWarningCount++;
                }
                if (parseFloat(dataForm.buffer_st002) < 6.5 || parseFloat(dataForm.buffer_st002) > 8.5) {
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
                        action: "Add Treatment",
                        pre_treatment_id: data?.pre_treatment_id,
                        pre_treatment_type: type
                    }
                } else {
                    const changes = [
                        initData?.raw_water != dataForm.raw_water ? `Raw Water from ${initData?.raw_water} to ${dataForm.raw_water}` : '',
                        initData?.sf1 != dataForm.sf1 ? `SF 1 from ${initData?.sf1} to ${dataForm.sf1}` : '',
                        initData?.sf2 != dataForm.sf2 ? `SF 2 from ${initData?.sf2} to ${dataForm.sf2}` : '',
                        initData?.acf1 != dataForm.acf1 ? `ACF1 from ${initData?.acf1} to ${dataForm.acf1}` : '',
                        initData?.acf2 != dataForm.acf2 ? `ACF2 from ${initData?.acf2} to ${dataForm.acf2}` : '',
                        initData?.um101 != dataForm.um101 ? `10µm 1 from ${initData?.um101} to ${dataForm.um101}` : '',
                        initData?.um102 != dataForm.um102 ? `Buffer ST002 from ${initData?.um102} to ${dataForm.um102}` : '',
                        initData?.buffer_st002 != dataForm.buffer_st002 ? `10µm 2 from ${initData?.buffer_st002} to ${dataForm.buffer_st002}` : '',
                        initData?.remark != dataForm.remark ? `Remark from ${initData?.remark == null ? '' : initData?.remark} to ${dataForm.remark}` : ''
                    ];
                    const actionString = changes.filter(change => change !== '').join(', ');

                    entity = {
                        ...dataForm,
                        id: data?.id,
                        warning_count: updatedWarningCount,
                        status: status,
                        action: `has modified ${actionString}`,
                        pre_treatment_id: data?.pre_treatment_id,
                        pre_treatment_type: type
                    }
                }
                onSave(entity)
            }}
        >
            <ProForm form={form} onReset={() => form.resetFields()} submitter={false}>
                <Card size="small">
                    <Row gutter={6}>
                        <Col span={12}>
                            <ProFormText
                                hasFeedback={false}
                                rules={[{ required: true, message: 'Please Enter Raw Water' },{ pattern: /^\d*\.?\d+$/, message: 'Please enter a valid number' }]}
                                label={
                                    <ProForm.Item
                                        noStyle
                                        shouldUpdate={(prevValues, currentValues) => prevValues.raw_water !== currentValues.raw_water}
                                    >
                                        {({ getFieldValue }) => {
                                            const rawWaterValue = getFieldValue('raw_water');
                                            return (
                                                <div>
                                                    Raw Water
                                                    {(Number(rawWaterValue) < 6.5 || Number(rawWaterValue) > 8.5) && rawWaterValue !== '' && rawWaterValue !== null && (
                                                        <ExclamationCircleOutlined style={{ color: 'red', marginLeft: '5px' }} />
                                                    )}
                                                </div>
                                            );
                                        }}
                                    </ProForm.Item>
                                }
                                name={'raw_water'}
                                initialValue={data?.raw_water}
                                fieldProps={{
                                    type: 'number',
                                    step: 'any'
                                  }}
                            />
                        </Col>
                        <Col span={12}>
                            <ProFormText
                                hasFeedback={false}
                                rules={[{ required: true, message: 'Please Enter SF 1' },{ pattern: /^\d*\.?\d+$/, message: 'Please enter a valid number' }]}
                                label={
                                    <ProForm.Item
                                        noStyle
                                        shouldUpdate={(prevValues, currentValues) => prevValues.sf1 !== currentValues.sf1}
                                    >
                                        {({ getFieldValue }) => {
                                            const sf1Value = getFieldValue('sf1');
                                            return (
                                                <div>
                                                    SF 1
                                                    {(Number(sf1Value) < 6.5 || Number(sf1Value) > 8.5) && sf1Value !== '' && sf1Value !== null && (
                                                        <ExclamationCircleOutlined style={{ color: 'red', marginLeft: '5px' }} />
                                                    )}
                                                </div>
                                            );
                                        }}
                                    </ProForm.Item>
                                }
                                name={'sf1'}
                                initialValue={data?.sf1}
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
                                rules={[{ required: true, message: 'Please Enter SF 2' },{ pattern: /^\d*\.?\d+$/, message: 'Please enter a valid number' }]}
                                label={
                                    <ProForm.Item
                                        noStyle
                                        shouldUpdate={(prevValues, currentValues) => prevValues.sf2 !== currentValues.sf2}
                                    >
                                        {({ getFieldValue }) => {
                                            const sf2Value = getFieldValue('sf2');
                                            return (
                                                <div>
                                                    SF 2
                                                    {(Number(sf2Value) < 6.5 || Number(sf2Value) > 8.5) && sf2Value !== '' && sf2Value !== null && (
                                                        <ExclamationCircleOutlined style={{ color: 'red', marginLeft: '5px' }} />
                                                    )}
                                                </div>
                                            );
                                        }}
                                    </ProForm.Item>
                                }
                                name={'sf2'}
                                initialValue={data?.sf2}
                                fieldProps={{
                                    type: 'number',
                                    step: 'any'
                                  }}
                            />
                        </Col>
                        <Col span={12}>
                            <ProFormText
                                hasFeedback={false}
                                rules={[{ required: true, message: 'Please Enter ACF1' },{ pattern: /^\d*\.?\d+$/, message: 'Please enter a valid number' }]}
                                label={
                                    <ProForm.Item
                                        noStyle
                                        shouldUpdate={(prevValues, currentValues) => prevValues.acf1 !== currentValues.acf1}
                                    >
                                        {({ getFieldValue }) => {
                                            const acf1Value = getFieldValue('acf1');
                                            return (
                                                <div>
                                                    ACF1
                                                    {(Number(acf1Value) < 6.5 || Number(acf1Value) > 8.5) && acf1Value !== '' && acf1Value !== null && (
                                                        <ExclamationCircleOutlined style={{ color: 'red', marginLeft: '5px' }} />
                                                    )}
                                                </div>
                                            );
                                        }}
                                    </ProForm.Item>
                                }
                                name={'acf1'}
                                initialValue={data?.acf1}
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
                                rules={[{ required: true, message: 'Please Enter ACF2' },{ pattern: /^\d*\.?\d+$/, message: 'Please enter a valid number' }]}
                                label={
                                    <ProForm.Item
                                        noStyle
                                        shouldUpdate={(prevValues, currentValues) => prevValues.acf2 !== currentValues.acf2}
                                    >
                                        {({ getFieldValue }) => {
                                            const acf2Value = getFieldValue('acf2');
                                            return (
                                                <div>
                                                    ACF2
                                                    {(Number(acf2Value) < 6.5 || Number(acf2Value) > 8.5) && acf2Value !== '' && acf2Value !== null && (
                                                        <ExclamationCircleOutlined style={{ color: 'red', marginLeft: '5px' }} />
                                                    )}
                                                </div>
                                            );
                                        }}
                                    </ProForm.Item>
                                }
                                name={'acf2'}
                                initialValue={data?.acf2}
                                fieldProps={{
                                    type: 'number',
                                    step: 'any'
                                  }}
                            />
                        </Col>
                        <Col span={12}>
                            <ProFormText
                                hasFeedback={false}
                                rules={[{ required: true, message: 'Please Enter 10µm 1' },{ pattern: /^\d*\.?\d+$/, message: 'Please enter a valid number' }]}
                                label={
                                    <ProForm.Item
                                        noStyle
                                        shouldUpdate={(prevValues, currentValues) => prevValues.um101 !== currentValues.um101}
                                    >
                                        {({ getFieldValue }) => {
                                            const um101Value = getFieldValue('um101');
                                            return (
                                                <div>
                                                    10µm 1
                                                    {(Number(um101Value) < 6.5 || Number(um101Value) > 8.5) && um101Value !== '' && um101Value !== null && (
                                                        <ExclamationCircleOutlined style={{ color: 'red', marginLeft: '5px' }} />
                                                    )}
                                                </div>
                                            );
                                        }}
                                    </ProForm.Item>
                                }
                                name={'um101'}
                                initialValue={data?.um101}
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
                                rules={[{ required: true, message: 'Please Enter 10µm 2' },{ pattern: /^\d*\.?\d+$/, message: 'Please enter a valid number' }]}
                                label={
                                    <ProForm.Item
                                        noStyle
                                        shouldUpdate={(prevValues, currentValues) => prevValues.um102 !== currentValues.um102}
                                    >
                                        {({ getFieldValue }) => {
                                            const um102Value = getFieldValue('um102');
                                            return (
                                                <div>
                                                    10µm 2
                                                    {(Number(um102Value) < 6.5 || Number(um102Value) > 8.5) && um102Value !== '' && um102Value !== null && (
                                                        <ExclamationCircleOutlined style={{ color: 'red', marginLeft: '5px' }} />
                                                    )}
                                                </div>
                                            );
                                        }}
                                    </ProForm.Item>
                                }
                                name={'um102'}
                                initialValue={data?.um102}
                                fieldProps={{
                                    type: 'number',
                                    step: 'any'
                                  }}
                            />
                        </Col>
                        <Col span={12}>
                            <ProFormText
                                hasFeedback={false}
                                rules={[{ required: true, message: 'Please Enter Buffer ST002' },{ pattern: /^\d*\.?\d+$/, message: 'Please enter a valid number' }]}
                                label={
                                    <ProForm.Item
                                        noStyle
                                        shouldUpdate={(prevValues, currentValues) => prevValues.buffer_st002 !== currentValues.buffer_st002}
                                    >
                                        {({ getFieldValue }) => {
                                            const bufferSt002Value = getFieldValue('buffer_st002');
                                            return (
                                                <div>
                                                    Buffer ST002
                                                    {(Number(bufferSt002Value) < 6.5 || Number(bufferSt002Value) > 8.5) && bufferSt002Value !== '' && bufferSt002Value !== null && (
                                                        <ExclamationCircleOutlined style={{ color: 'red', marginLeft: '5px' }} />
                                                    )}
                                                </div>
                                            );
                                        }}
                                    </ProForm.Item>
                                }
                                name={'buffer_st002'}
                                initialValue={data?.buffer_st002}
                                fieldProps={{
                                    type: 'number',
                                    step: 'any'
                                  }}
                            />
                        </Col>

                        <Col span={24}>
                            <ProFormTextArea
                                hasFeedback={false}
                                label="Remark"
                                name={'remark'}
                                initialValue={data?.status !== 'pending' ? (data?.remark == null ? '-' : data?.remark) : data?.remark}
                            />
                        </Col>
                    </Row>
                </Card>
            </ProForm>
        </FormModalComp>
    );
};
