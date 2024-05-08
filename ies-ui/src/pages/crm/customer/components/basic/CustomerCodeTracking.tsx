import { CustomerView } from "@/services/crm/data"
import { ModalForm, ModalFormProps, ProForm, ProFormText, ProFormTextArea } from "@ant-design/pro-components"
import { useForm } from "antd/lib/form/Form"
import { StringIterator } from "lodash"
import { useEffect, useState } from "react"

// const codeLevel = {
//     l9: ['L0', 'M0', "C0"],
//     l0: ['M0', "C0"],
//     m0: ["C0"],
//     c0: [],
// }

const codeLevel = {
    l9: ['L0', 'M0', "C0"],
    l0: ['L9', 'M0', "C0"],
    m0: ['L9', 'L0', "C0"],
    c0: ['L9', 'L0', 'M0'],
}

type FormDataType = {
    l9?: string;
    l0?: string;
    m0?: string;
    c0?: string;
    remarks?: string;
}

export default ({ onUpdate, data, ...rest }: ModalFormProps<FormDataType> & {
    data: CustomerView,
    onUpdate: (customerId: number, l9?: string, l0?: string, m0?: string, c0?: string, remarks?: string) => void;
}) => {
    const [form] = useForm<FormDataType>()
    const [prefix, setPrefix] = useState<string>()

    useEffect(() => {
        if (!rest.open) return
        const pre = data.code?.substring(0, 2)
        setPrefix(pre)
        form.setFieldsValue({
            l9: data.codeTracking?.idl9 || (pre == 'L9' ? data.code : undefined),
            l0: data.codeTracking?.idl0 || (pre == 'L0' ? data.code : undefined),
            m0: data.codeTracking?.idm0 || (pre == 'M0' ? data.code : undefined),
            c0: data.codeTracking?.idc0 || (pre == 'C0' ? data.code : undefined),
        })
        return () => form.resetFields()
    }, [rest.open])

    return (
        <ModalForm onFinish={async formData => onUpdate(data.id, formData.l9, formData.l0, formData.m0, formData.c0, formData.remarks)}
            form={form} {...rest} title={`Customer Code: ${data.code}`}  >
            <ProFormText name={'l9'} label='L9 Customer' disabled={!codeLevel.l9.some(it => it == prefix)} />
            <ProFormText name={'l0'} label='L0 Customer' disabled={!codeLevel.l0.some(it => it == prefix)} />
            <ProFormText name={'m0'} label='M0 Customer' disabled={!codeLevel.m0.some(it => it == prefix)} />
            <ProFormText name={'c0'} label='C0 Customer' disabled={!codeLevel.c0.some(it => it == prefix)} />
            <ProFormTextArea name={'remarks'} label='Remarks' />

        </ModalForm>
    )
}