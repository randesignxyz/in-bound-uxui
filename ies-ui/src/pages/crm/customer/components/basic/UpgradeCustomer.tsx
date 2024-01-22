import FormModalComp, { FormModalProps } from "@/components/FormModal";
import { ProForm, ProFormText, ProFormTextArea } from "@ant-design/pro-components";
import { Space } from "antd";
import { useForm } from "antd/lib/form/Form";
import { useEffect } from "react";

export default ({ onSave, currCustNo, customerId, ...rest }: FormModalProps & {
    customerId: number;
    currCustNo: string;
    onSave: (customerId: number, newCode: string, remarks: string, ) => void;
}) => {


    const [form] = useForm<{ currentCode: string; newCode: string, remarks: string, prefix: string }>()

    useEffect(()=> {
        if(!rest.open) return
        form.setFieldsValue({
            prefix: 'L0',
            currentCode: currCustNo
        })

        return () => form.resetFields()
    }, [rest.open])

    return <FormModalComp
        {...rest}
        width = {'500px'}
        okText="Promote"
        title={`Promote customer`}
        onResetForm={() => form.resetFields( ['newCode', 'remarks'])}
        onSubmit={async () => {
            const dataForm = await form.validateFields();
            onSave(customerId, 'L0' + dataForm.newCode, dataForm.remarks);
        }}
    >

        <ProForm form={form} submitter = {false}>
            <ProFormText name={'currentCode'} label="Customer Code" disabled />
            <ProFormText label="New Code" required>
                <Space size={0}> <ProFormText  name={'prefix'} disabled width={60}/><ProFormText   name={"newCode"}  rules ={[{required: true}]}/></Space>
            </ProFormText>
            <ProFormTextArea label = 'Remarks' name={"remarks"} rules ={[{required: true}]}/>
        </ProForm>

    </FormModalComp>
}