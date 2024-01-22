import React, {  useEffect } from 'react'
import FormModalComp from '@/components/FormModal'
import { Card, Form, Input, DatePicker, message, Modal } from 'antd'

import moment from 'moment';
import { domain } from '@/services/del-expense/data';
import { useModel } from '@umijs/max';

const layout = {
    labelCol: { span: 6 },
    wrapperCol: { span: 18 },
};

const AddInvoiceForm: React.FC<{
    invoiceId?: number,
    deliveryId: number,
    completed: boolean;
    visible: boolean;
    savedInvoice: () => void;
    onCancel: () => void;

}> = ({ invoiceId, deliveryId , completed, visible, savedInvoice, onCancel }) => {
    const [form] = Form.useForm()
    const { invoice, saveInvoice, fetchInvoice } = useModel('delivery')

    useEffect(()=> {
        form.resetFields()
    }, [])

    useEffect(() => {
        if (invoiceId && invoiceId > 0 && visible) {
            fetchInvoice(invoiceId)
        }
    }, [invoiceId])

    useEffect(() => {
        form.setFieldsValue({
            invoiceNo: invoice?.invoiceNo,
            issuedDate:invoice &&  moment(invoice?.issuedDate) ,
            receivedDate: invoice &&  moment(invoice?.receivedDate),
            comment: invoice?.comment
        })
    }, [invoice])

    const onCancelHandler = () => {
        form.resetFields()
        onCancel()
    }

    const onSaveHandler = (data: domain.delivery.SaveInvoice) => {
        Modal.confirm({
            title: 'Confirmation',
            content: 'Are you sure to save?',
            onOk: () => {
                saveInvoice(data, () => {
                    form.resetFields()
                    savedInvoice()
                    if (invoiceId) {
                        onCancelHandler()
                    }
                    message.info("Invoice successfully saved")
                })
            }
        })
    }


    return <FormModalComp
        title="Vendor Invoice"
        visible={visible}
        readOnly={completed}
        width = {'900px'}
        onCancel={onCancelHandler}
        onSubmit={() => {
            form.validateFields().then(values => {
                const { invoiceNo, receivedDate, issuedDate, comment } = values
                const saveInvoice = {
                    id: invoiceId,
                    deliveryId: deliveryId,
                    invoiceNo: invoiceNo,
                    receivedDate: receivedDate,
                    issuedDate: issuedDate,
                    comment: comment,
                } as domain.delivery.SaveInvoice
                onSaveHandler(saveInvoice)
            })
        }}
        onResetForm={() => {
            form.resetFields()
        }}>
        <Form {...layout} form={form}>
            <Card>

                <Form.Item name='invoiceNo' label="Invoice No" rules={[{ required: true }]}>
                    <Input />
                </Form.Item>
                <Form.Item name='issuedDate' label="Issued Date" rules={[{ required: true }]}>
                    <DatePicker style={{ width: '100%' }} />
                </Form.Item>
                <Form.Item name='receivedDate' label="Received Date" rules={[{ required: true }]}>
                    <DatePicker style={{ width: '100%' }} />
                </Form.Item>
                <Form.Item name='comment' label="Comment">
                    <Input />
                </Form.Item>
            </Card>
        </Form>
    </FormModalComp>
}

export default AddInvoiceForm