import FormModalComp, { FormModalProps } from '@/components/FormModal';
import { ProForm, ProFormText, ProFormTextArea } from '@ant-design/pro-components';
import { useEffect, useState } from 'react';
import { DailyPreWaterTreatmentList } from './data';
import { useForm } from 'antd/lib/form/Form';
import { Card, Col, Row } from 'antd';
import { useAccess } from '@umijs/max';

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
            if (data?.status == 'pending') {
                form.resetFields();
            }
        }
    }, [props.open]);

    return (
        <FormModalComp
            title="Inventory Transfer"
            {...props}
            width={'600px'}
            okText={data?.status !== 'pending' ? 'Update' : 'Submit'}
            readOnly={!(data?.assign_to_user?.split(" ").includes(access.currentUser?.login || '') || access.canAssignItemPre)}            
            onSubmit={async () => {
                const dataForm = await form.validateFields();
                let updatedWarningCount = 0;
                let status = 'normal'
                if (parseFloat(dataForm.sf) < 0.1 || parseFloat(dataForm.sf) > 0.3) {
                    updatedWarningCount++;
                }
                if (parseFloat(dataForm.acf) < 0.1 || parseFloat(dataForm.acf) > 0.3) {
                    updatedWarningCount++;
                }
                if (parseFloat(dataForm.resin) < 0.1 || parseFloat(dataForm.resin) > 0.3) {
                    updatedWarningCount++;
                }
                if (parseFloat(dataForm.um5) < 0.1 || parseFloat(dataForm.um5) > 0.3) {
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
                        action: `has modified ${actionString}`,                        pre_treatment_id: data?.pre_treatment_id,
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
                                rules={[{ required: true, message: 'Please Enter SF' }]}
                                label='SF'
                                name={'sf'}
                                initialValue={data?.sf}
                            />
                        </Col>
                        <Col span={12}>
                            <ProFormText
                                hasFeedback={false}
                                rules={[{ required: true, message: 'Please Enter ACF' }]}
                                label='ACF'
                                name={'acf'}
                                initialValue={data?.acf} />
                        </Col>
                    </Row>
                    <Row gutter={6}>
                        <Col span={12}>
                            <ProFormText
                                hasFeedback={false}
                                rules={[{ required: true, message: 'Please Enter Resin' }]}
                                label='Resin'
                                name={'resin'}
                                initialValue={data?.resin} />
                        </Col>
                        <Col span={12}>
                            <ProFormText
                                hasFeedback={false}
                                rules={[{ required: true, message: 'Please Enter Resin' }]}
                                label='5µm'
                                name={'um5'}
                                initialValue={data?.um5} />
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
        </FormModalComp >
    );
};
