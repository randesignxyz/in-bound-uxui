import FormModalComp, { FormModalProps } from "@/components/FormModal"
import { ContractDetail } from "@/services/crm/data"
import ProForm, { ProFormDatePicker,  ProFormTextArea } from "@ant-design/pro-form"
import { message, Modal } from "antd"
import { useForm } from "antd/lib/form/Form"
import moment from "moment"
import React from "react"

const layout = {
    labelCol: { span: 4 },
    wrapperCol: { span: 17 },
};

interface Props extends FormModalProps {
    contract?: ContractDetail,
    actionHandlers?: {
        onRenewContract?: (expiryDate: moment.Moment, remarks?: string) => Promise<void>
    }
}

const RenewContract: React.FC<Props> = ({ contract, actionHandlers, ...rest }) => {
    const [form] = useForm<{
        effectiveDate: moment.Moment;
        expiryDate: moment.Moment;
        remarks?: string
    }>()

    return (
        <FormModalComp
            {...rest}
            onResetForm = {()=> form.resetFields()}
            onSubmit = {async ()=> {
                const data = await form.validateFields()
                if(!data) return
                Modal.confirm({
                    title: 'Confirmation',
                    content: 'Are you sure to save.',
                    onOk: async() => {
                        try {
                            await actionHandlers?.onRenewContract?.(data.expiryDate, data.remarks )
                            message.success("Saved successfully")
                            rest.onCancel?.()
                        } catch (error: any) {
                            message.error(error.message || "Failed to save.")
                        }
                    }
                })

            }}
            >
            <ProForm
                {...layout}
                initialValues = {{
                    effectiveDate: contract?.expireDate && moment(contract.expireDate)
                }}
                layout = 'horizontal'
                form={form}
                submitter={false}>
                <ProFormDatePicker readonly label='New Effective Date' name='effectiveDate' />
                <ProFormDatePicker rules={[{ required: true }]} label='Expiry Date' name='expiryDate' />
                <ProFormTextArea label="Remarks" name='remarks' />
            </ProForm>

        </FormModalComp>
    )
}

export default RenewContract