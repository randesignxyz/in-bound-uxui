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
                if (parseFloat(dataForm.raw_water) > 300) {
                    updatedWarningCount++;
                }
                if (parseFloat(dataForm.sf) > 300) {
                    updatedWarningCount++;
                }
                if (parseFloat(dataForm.acf) > 300) {
                    updatedWarningCount++;
                }
                if (parseFloat(dataForm.resin) > 300) {
                    updatedWarningCount++;
                }
                if (parseFloat(dataForm.um5) > 300) {
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
                        initData?.sf != dataForm.sf ? `SF from ${initData?.sf} to ${dataForm.sf}` : '',
                        initData?.acf != dataForm.acf ? `ACF from ${initData?.acf} to ${dataForm.acf}` : '',
                        initData?.resin != dataForm.resin ? `Resin from ${initData?.resin} to ${dataForm.resin}` : '',
                        initData?.um5 != dataForm.um5 ? `5µm from ${initData?.um5} to ${dataForm.um5}` : '',
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
                                            const rawWterValue = getFieldValue('raw_water');
                                            return (
                                                <div>
                                                    Raw Water
                                                    {Number(rawWterValue) > 300 && rawWterValue !== '' && rawWterValue !== null && (
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
                                rules={[{ required: true, message: 'Please Enter SF' },{ pattern: /^\d*\.?\d+$/, message: 'Please enter a valid number' }]}
                                label={
                                    <ProForm.Item
                                        noStyle
                                        shouldUpdate={(prevValues, currentValues) => prevValues.sf !== currentValues.sf}
                                    >
                                        {({ getFieldValue }) => {
                                            const sfValue = getFieldValue('sf');
                                            return (
                                                <div>
                                                    SF
                                                    {Number(sfValue) > 300 && sfValue !== '' && sfValue !== null && (
                                                        <ExclamationCircleOutlined style={{ color: 'red', marginLeft: '5px' }} />
                                                    )}
                                                </div>
                                            );
                                        }}
                                    </ProForm.Item>
                                }
                                name={'sf'}
                                initialValue={data?.sf}
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
                                rules={[{ required: true, message: 'Please Enter ACF' },{ pattern: /^\d*\.?\d+$/, message: 'Please enter a valid number' }]}
                                label={
                                    <ProForm.Item
                                        noStyle
                                        shouldUpdate={(prevValues, currentValues) => prevValues.acf !== currentValues.acf}
                                    >
                                        {({ getFieldValue }) => {
                                            const acfValue = getFieldValue('acf');
                                            return (
                                                <div>
                                                    ACF
                                                    {Number(acfValue) > 300 && acfValue !== '' && acfValue !== null && (
                                                        <ExclamationCircleOutlined style={{ color: 'red', marginLeft: '5px' }} />
                                                    )}
                                                </div>
                                            );
                                        }}
                                    </ProForm.Item>
                                }
                                name={'acf'}
                                initialValue={data?.acf}
                                fieldProps={{
                                    type: 'number',
                                    step: 'any'
                                  }}
                            />
                        </Col>
                        <Col span={12}>
                            <ProFormText
                                hasFeedback={false}
                                rules={[{ required: true, message: 'Please Enter Resin' },{ pattern: /^\d*\.?\d+$/, message: 'Please enter a valid number' }]}
                                label={
                                    <ProForm.Item
                                        noStyle
                                        shouldUpdate={(prevValues, currentValues) => prevValues.resin !== currentValues.resin}
                                    >
                                        {({ getFieldValue }) => {
                                            const resinValue = getFieldValue('resin');
                                            return (
                                                <div>
                                                    Resin
                                                    {Number(resinValue) > 300 && resinValue !== '' && resinValue !== null && (
                                                        <ExclamationCircleOutlined style={{ color: 'red', marginLeft: '5px' }} />
                                                    )}
                                                </div>
                                            );
                                        }}
                                    </ProForm.Item>
                                }
                                name={'resin'}
                                initialValue={data?.resin}
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
                                rules={[{ required: true, message: 'Please Enter Resin' },{ pattern: /^\d*\.?\d+$/, message: 'Please enter a valid number' }]}
                                label={
                                    <ProForm.Item
                                        noStyle
                                        shouldUpdate={(prevValues, currentValues) => prevValues.um5 !== currentValues.um5}
                                    >
                                        {({ getFieldValue }) => {
                                            const um5Value = getFieldValue('um5');
                                            return (
                                                <div>
                                                    5µm
                                                    {Number(um5Value) > 300 && um5Value !== '' && um5Value !== null && (
                                                        <ExclamationCircleOutlined style={{ color: 'red', marginLeft: '5px' }} />
                                                    )}
                                                </div>
                                            );
                                        }}
                                    </ProForm.Item>
                                }
                                name={'um5'}
                                initialValue={data?.um5}
                                fieldProps={{
                                    type: 'number',
                                    step: 'any'
                                  }}
                            />
                        </Col>
                        <Col span={12}>
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
