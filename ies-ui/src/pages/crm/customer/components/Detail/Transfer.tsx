import FormModalComp, { FormModalProps } from "@/components/FormModal";
import { LookupDataItem } from "@/services/data";
import { ProCard, ProFormText, ProFormTextArea } from "@ant-design/pro-components";
import ProForm, { ProFormSelect } from "@ant-design/pro-form";
import { useForm } from "antd/lib/form/Form";
import { FC, useEffect } from "react";

interface Props extends FormModalProps {
    currentSe: string,
    seList: LookupDataItem[];
    onTransfer: (salespersonId: number, remarks?: string) => void
}

const Transfer: FC<Props> = ({  currentSe, seList, onTransfer, ...props }) => {
    const [form] = useForm<{ fromSe: string, salespersonId: number; remarks: string}>()

    useEffect(() => {
        if(!props.open) return
        form.setFieldsValue({
            fromSe: currentSe
        })
        return () => form.resetFields()
    }, [props.open])
    return (
        <FormModalComp
            width="600px"
            title="Transfer Customer"
            {...props}
            onResetForm={() => form.resetFields()}
            onSubmit={async () => {
                const dataForm = await form.validateFields()
                onTransfer(dataForm.salespersonId, dataForm.remarks)
            }}

        >
            <ProCard>
                <ProForm form={form} submitter={false} >
                    <ProFormText name={"fromSe"} label ="Transfer From" disabled/>
                    <ProFormSelect
                        allowClear
                        showSearch
                        rules={[{ required: true }]}
                        label="Transfer To"
                        name="salespersonId"
                        options={seList?.map(it => {
                            return { value: it.id, label: [it.code, it.name].join('-') }
                        })}
                    />
                    <ProFormTextArea
                        name = "remarks"
                        label = "Remarks"
                        rules={[{ required: true }]}
                    />
                </ProForm>
            </ProCard>

        </FormModalComp>
    )
}

export default Transfer