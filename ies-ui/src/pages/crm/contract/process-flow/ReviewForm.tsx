import React from 'react'
import { Button, Card, Col, Form, message, Modal, Row, Spin } from 'antd';
import { Model } from '../model';
import { useEffect } from 'react';
import ActionFormWrapper from '@/pages/process-flow/components/forms/ActionFormWrapper';
import ProForm, { ProFormGroup, ProFormText, ProFormTextArea } from '@ant-design/pro-form';
import { UIBuilder } from '@/components/UIBuilder';
import { EyeOutlined } from '@ant-design/icons';
import { ContractTermData } from '@/services/crm/data';
import moment from 'moment';
import { duration, translateToKh } from '@/pages/utils';
import { ActionDataFormProps } from '@/pages/process-flow/data';

const ReviewForm: React.FC<ActionDataFormProps> = (props) => {

    const [form] = Form.useForm<ContractTermData>()
    const { state, actions } = Model()
    const contractTerm = state.data?.contractTerm
    useEffect(() => {
        if (!props.visible || !props.payload?.id) return
        actions.getContractTerm(props.payload?.id)
    }, [props.visible])

    useEffect(() => {
        props.visible && initData()
    }, [state.data?.contractTerm])

    const initData = () => {

        form.setFieldsValue({
            ...terms
        })
    }

    const durationKh = duration(moment(contractTerm?.effectiveDate), moment(contractTerm?.expiryDate))?.
        replace('years', 'ឆ្នាំ').replace('year', 'ឆ្នាំ').replace('months', 'ខែ').replace('month', 'ខែ').replace('days', 'ថ្ងៃ').replace('day', 'ថ្ងៃ')
    const terms = {
        bizName: contractTerm?.terms?.find(it => it.type == 'BIZ_NAME')?.term || contractTerm?.bizName,
        owner: contractTerm?.terms?.find(it => it.type == 'OWNER_NAME')?.term || contractTerm?.owner,
        phoneList: contractTerm?.terms?.filter(it => it.type == 'PHONE_LIST').map(it => it.term).join(", ") || [contractTerm?.phone1, contractTerm?.phone2, contractTerm?.phone3].filter(it => it).join(", "),
        partyATerms: contractTerm?.terms?.filter(it => it.type == 'PARTY_A').map(it => ({ lineItem: it.lineItem, term: it.term })) || contractTerm?.partyATerms,
        partyBTerms: contractTerm?.terms?.filter(it => it.type == 'PARTY_B').map(it => ({ lineItem: it.lineItem, term: it.term })) || state.data?.contractTerm?.partyBTerms,
        effectiveDate:  translateToKh(moment(contractTerm?.effectiveDate)),
        expiryDate: translateToKh(moment(contractTerm?.expiryDate)),
        duration: contractTerm?.terms?.find(it => it.type == 'DURATION')?.term || durationKh,
        address: contractTerm?.terms?.find(it => it.type == 'ADDRESS')?.term || contractTerm?.address,
    }

    const onSaveTemp = async () => {
        try {
            const rs = await form.validateFields()
            const term = await actions.saveContractTermTemp(rs)
            props.payload?.id && actions.viewContractDoc(props.payload.id, term.id)
        } catch (error: any) {
            message.error(error.message ||"Failed to preview.")
        }
    }

    return (<ActionFormWrapper
        loading={state.loading}

        {...props}
        width='1000px'

        actionHandlers={{
            ...props.actionHandlers,

            onReset: () => {
                form.resetFields()
                props.actionHandlers?.onReset?.()
            },
            onCompleted: async () => {
                const values = await form.validateFields()
                const { comment } = values
                try {

                    Modal.confirm({
                        title: 'SA verification',
                        content: 'Are you sure?',
                        onOk: async () => {
                            await actions.saveContractTerm({ ...values, id: props.payload?.id })
                            await props.actionHandlers?.onCompletedTask?.(values, comment)
                            message.success("Action is submited succesfully.")
                            props.actionHandlers?.onCancel?.()
                        }
                    })

                } catch(error: any) {
                    message.error(error.message ||"Failed to complete task.")
                }
            }
        }}>
        <Spin spinning={state.loading}>
            <ProForm
                layout='vertical'
                submitter={false}
                form={form}>
                <Card size = 'small' title = "Term">
                    <ProFormGroup title="Customer Info">
                        <ProFormText label="Business Name" name="bizName" />
                        <ProFormText label="Owner Name" name="owner" />
                        <ProFormText label="Phone List" name="phoneList" />
                    </ProFormGroup>
                    <ProFormGroup title="Address">
                        <ProFormTextArea width='xl' name="address" />
                    </ProFormGroup>
                    <ProFormGroup title="Duration">
                        <ProFormText label="Effective Date" name="effectiveDate" />
                        <ProFormText label="Expiry Date" name="expiryDate" />
                        <ProFormText label="Duration" name="duration" />
                    </ProFormGroup>
                    <ProFormGroup title="Party B">
                        <Form.Item>
                            <Form.List name="partyBTerms">
                                {
                                    UIBuilder.createFormListElements((field, index) => {
                                        return <>
                                            <ProFormText wrapperCol={{ flex: 20 }} readonly fieldKey={[field.fieldKey, 'lineItem']} name={[field.name, 'order']} />
                                            <ProFormTextArea width={800} colSize={30} fieldKey={[field.fieldKey, 'term']} name={[field.name, 'term']} />
                                        </>
                                    }, () => true, (index) => ({ lineItem: index + 2 }), true)
                                }
                            </Form.List>
                        </Form.Item>
                    </ProFormGroup>
                    <ProFormGroup title="Party A">
                        <Form.Item>
                            <Form.List name="partyATerms">
                                {
                                    UIBuilder.createFormListElements((field, index) => {
                                        return <>
                                            <ProFormText wrapperCol={{ flex: 20 }} readonly fieldKey={[field.fieldKey, 'lineItem']} name={[field.name, 'order']} />
                                            <ProFormTextArea width={800} colSize={30} fieldKey={[field.fieldKey, 'term']} name={[field.name, 'term']} />
                                        </>
                                    }, () => true, (index) => ({ lineItem: index + 2 }), true)
                                }
                            </Form.List>
                        </Form.Item>
                    </ProFormGroup>
                    <Row>
                        <Col flex='500' />
                        <Col flex='20'>
                            <Button loading={false}
                                style={{ marginTop: 20 }}
                                icon={<EyeOutlined />}
                                onClick={onSaveTemp}
                            >Preview</Button>
                        </Col>
                        <Col flex='Auto' />
                    </Row>
                </Card>

                <Card title = 'Comment' size = 'small' style={{ marginBottom: '5px',  marginTop: '5px' }}>
                    <ProFormTextArea name='comment' />
                </Card>
            </ProForm>
        </Spin>
    </ActionFormWrapper>)
}

export default ReviewForm