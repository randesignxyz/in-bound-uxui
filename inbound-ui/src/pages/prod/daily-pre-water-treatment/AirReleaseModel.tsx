import FormModalComp, { FormModalProps } from '@/components/FormModal';
import { ProForm, ProFormText, ProFormTextArea } from '@ant-design/pro-components';
import { useEffect, useState } from 'react';
import { DailyPreWaterTreatmentList } from './data';
import { useForm } from 'antd/lib/form/Form';
import { Card, Col, Radio, Row, Typography, message } from 'antd';
import { useAccess } from '@umijs/max';
import { ExclamationCircleOutlined } from '@ant-design/icons';

interface Props extends FormModalProps {
    data?: DailyPreWaterTreatmentList
    type?: string
    onSave: (data: DailyPreWaterTreatmentList) => void
}
export default ({ data, type, onSave, ...props }: Props) => {
    const access = useAccess();
    const [form] = useForm<DailyPreWaterTreatmentList>();
    const { Text } = Typography;
    const [sf, setSF] = useState()
    const [acf, setACF] = useState()
    const [resin, setResin] = useState()
    const [initData, setInitData] = useState<DailyPreWaterTreatmentList>()

    useEffect(() => {
        if (props.open) {
            setInitData(data)
            setACF(data?.acf)
            setResin(data?.resin)
            setSF(data?.sf)
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
                if (sf == null) {
                    message.error('Please select SF!')
                    return
                }
                if (acf == null) {
                    message.error('Please select ACF!')
                    return
                }
                if (resin == null) {
                    message.error('Please select Resin!')
                    return
                }
                if (sf == 0) {
                    updatedWarningCount++;
                }
                if (acf == 0) {
                    updatedWarningCount++;
                }
                if (resin == 0) {
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
                        sf: sf,
                        acf: acf,
                        resin: resin,
                        warning_count: updatedWarningCount,
                        status: status,
                        action: "Add Treatment",
                        pre_treatment_id: data?.pre_treatment_id,
                        pre_treatment_type: type
                    }
                } else {
                    const changes = [
                        initData?.sf != sf ? `SF from ${initData?.sf == '1' ? 'Yes' : 'No'} to ${sf == '1' ? 'Yes' : 'No'}` : '',
                        initData?.acf != acf ? `ACF from ${initData?.acf == '1' ? 'Yes' : 'No'} to ${acf == '1' ? 'Yes' : 'No'}` : '',
                        initData?.resin != resin ? `Resin from ${initData?.resin == '1' ? 'Yes' : 'No'} to ${resin == '1' ? 'Yes' : 'No'}` : '',
                        initData?.remark != dataForm.remark ? `Remark from ${initData?.remark == null ? '' : initData?.remark} to ${dataForm.remark}` : ''
                    ];
                    const actionString = changes.filter(change => change !== '').join(', ');

                    entity = {
                        ...dataForm,
                        id: data?.id,
                        sf: sf,
                        acf: acf,
                        resin: resin,
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
                        <Col span={12} style={{ display: 'flex', flexDirection: 'column' }}>
                            <div style={{ flexDirection: 'row' }}>
                                <Text style={{ color: 'red', fontSize: 20 }}>*</Text>
                                <Text style={{ marginBottom: 10 }}>SF</Text>
                                {(sf == '0' || data?.sf == '0') ? <ExclamationCircleOutlined style={{ color: 'red', marginLeft: '5px' }} /> : <></>}
                            </div>
                            <Radio.Group
                                defaultValue={data?.sf == '1' ? '1' : data?.sf == '0' ? '0' : ''}
                                // value={data?.sf == '1' ? '1' : data?.sf == '0' ? '0' : ''}
                                onChange={(e) => setSF(e.target.value)}
                            >
                                <Radio value='1'>Yes</Radio>
                                <Radio value="0">No</Radio>
                            </Radio.Group>
                        </Col>
                        <Col span={12} style={{ display: 'flex', flexDirection: 'column' }}>
                            <div style={{ flexDirection: 'row' }}>
                                <Text style={{ color: 'red', fontSize: 20 }}>*</Text>
                                <Text style={{ marginBottom: 10 }}>ACF</Text>
                                {(acf == '0' || data?.acf == '0') ? <ExclamationCircleOutlined style={{ color: 'red', marginLeft: '5px' }} /> : <></>}
                            </div>
                            <Radio.Group
                                defaultValue={data?.acf == '1' ? '1' : data?.acf == '0' ? '0' : ''}
                                // value={data?.sf == '1' ? '1' : data?.sf == '0' ? '0' : ''}
                                onChange={(e) => (setACF(e.target.value), console.log(e.target.value))}
                            >
                                <Radio value='1'>Yes</Radio>
                                <Radio value="0">No</Radio>
                            </Radio.Group>
                        </Col>
                    </Row>
                    <Row gutter={6} style={{ marginTop: 20 }}>
                        <Col span={12} style={{ display: 'flex', flexDirection: 'column' }}>
                            <div style={{ flexDirection: 'row' }}>
                                <Text style={{ color: 'red', fontSize: 20 }}>*</Text>
                                <Text style={{ marginBottom: 10 }}>Resin</Text>
                                {(resin == '0' || data?.resin == '0') ? <ExclamationCircleOutlined style={{ color: 'red', marginLeft: '5px' }} /> : <></>}
                            </div>
                            <Radio.Group
                                defaultValue={data?.resin == '1' ? '1' : data?.resin == '0' ? '0' : ''}
                                // value={data?.sf == '1' ? '1' : data?.sf == '0' ? '0' : ''}
                                onChange={(e) => (setResin(e.target.value))}
                            >
                                <Radio value='1'>Yes</Radio>
                                <Radio value="0">No</Radio>
                            </Radio.Group>
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
