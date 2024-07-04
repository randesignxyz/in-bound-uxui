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
                if (parseFloat(dataForm.sf1) < 0.2 || parseFloat(dataForm.sf1) > 0.5) {
                    updatedWarningCount++;
                }
                if (parseFloat(dataForm.sf2) < 0.2 || parseFloat(dataForm.sf2) > 0.5) {
                    updatedWarningCount++;
                }
                if (parseFloat(dataForm.acf1) < 0.2 || parseFloat(dataForm.acf1) > 0.5) {
                    updatedWarningCount++;
                }
                if (parseFloat(dataForm.acf2) < 0.2 || parseFloat(dataForm.acf2) > 0.5) {
                    updatedWarningCount++;
                }
                if (parseFloat(dataForm.um101) > 2.5) {
                    updatedWarningCount++;
                }
                if (parseFloat(dataForm.um102) > 2.5) {
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
                        initData?.sf1 != dataForm.sf1 ? `SF 1 from ${initData?.sf1} to ${dataForm.sf1}` : '',
                        initData?.sf2 != dataForm.sf2 ? `SF 2 from ${initData?.sf2} to ${dataForm.sf2}` : '',
                        initData?.acf1 != dataForm.acf1 ? `ACF1 from ${initData?.acf1} to ${dataForm.acf1}` : '',
                        initData?.acf2 != dataForm.acf2 ? `ACF2 from ${initData?.acf2} to ${dataForm.acf2}` : '',
                        initData?.um101 != dataForm.um101 ? `10µm 1 from ${initData?.um101} to ${dataForm.um101}` : '',
                        initData?.um102 != dataForm.um102 ? `10µm 2 from ${initData?.um102} to ${dataForm.um102}` : '',
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
                                label={<div>
                                    SF 1
                                    <span style={{ fontSize: 'small', color: 'gray', marginLeft: '5px', }}>(0.2-0.5 bar)</span>
                                </div>}
                                name={'sf1'}
                                initialValue={data?.sf1}
                            />
                        </Col>
                        <Col span={12}>
                            <ProFormText
                                hasFeedback={false}
                                rules={[{ required: true, message: 'Please Enter SF 2' }]}
                                label={<div>
                                    SF 2
                                    <span style={{ fontSize: 'small', color: 'gray', marginLeft: '5px', }}>(0.2-0.5 bar)</span>
                                </div>}
                                name={'sf2'}
                                initialValue={data?.sf2} />
                        </Col>
                    </Row>
                    <Row gutter={6}>
                        <Col span={12}>
                            <ProFormText
                                hasFeedback={false}
                                rules={[{ required: true, message: 'Please Enter ACF1' }]}
                                label={<div>
                                    ACF1
                                    <span style={{ fontSize: 'small', color: 'gray', marginLeft: '5px', }}>(0.2-0.5 bar)</span>
                                </div>}
                                name={'acf1'}
                                initialValue={data?.acf1} />
                        </Col>
                        <Col span={12}>
                            <ProFormText
                                hasFeedback={false}
                                rules={[{ required: true, message: 'Please Enter ACF2' }]}
                                label={<div>
                                    ACF2
                                    <span style={{ fontSize: 'small', color: 'gray', marginLeft: '5px', }}>(0.2-0.5 bar)</span>
                                </div>}
                                name={'acf2'}
                                initialValue={data?.acf2} />
                        </Col>
                    </Row>
                    <Row gutter={6}>
                        <Col span={12}>
                            <ProFormText
                                hasFeedback={false}
                                rules={[{ required: true, message: 'Please Enter SF' }]}
                                label={<div>
                                    10µm 1
                                    <span style={{ fontSize: 'small', color: 'gray', marginLeft: '5px', }}>(&lt; 2.5 bar)</span>
                                </div>}
                                name={'um101'}
                                initialValue={data?.um101} />
                        </Col>
                        <Col span={12}>
                            <ProFormText
                                hasFeedback={false}
                                rules={[{ required: true, message: 'Please Enter SF 2' }]}
                                label={<div>
                                    10µm 2
                                    <span style={{ fontSize: 'small', color: 'gray', marginLeft: '5px', }}>(&lt; 2.5 bar)</span>
                                </div>}
                                name={'um102'}
                                initialValue={data?.um102} />
                        </Col>
                        <Col span={24}>
                            <ProFormTextArea
                                hasFeedback={false}
                                label="Remark"
                                name={'remark'}
                                initialValue={data?.status !== 'pending' ?(data?.remark == null ? '-' : data?.remark):data?.remark}
                            />
                        </Col>
                    </Row>
                </Card>
            </ProForm>
        </FormModalComp>
    );
};
