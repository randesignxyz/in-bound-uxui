import { Delegation } from "@/services/process-workflow/data"
import { ModalForm, ModalFormProps, ProForm, ProFormDatePicker, ProFormSelect, ProFormTextArea } from "@ant-design/pro-components"

interface Props extends ModalFormProps<Delegation, { data: string }> {
    onAdd: (data: Delegation) => void
}
export default ({ onAdd, ...rest }: Props) => {
    return <ModalForm<Delegation, { data: string }>
        title="Delegation"
        {...rest} onFinish={async (data) => { onAdd(data) }}
    >

        <ProFormSelect name={"approvers"} label="Approver" rules={[{ required: true }]} />
        <ProFormSelect tooltip="Leave blank for auto approval" name={"deligateTo"} label="Delegate To" />
        <ProForm.Group>
            <ProFormDatePicker name={"effectiveDate"} label="Effective Date" rules={[{ required: true }]} />
            <ProFormDatePicker name={"expiryDate"} label="Expirey Date" />
        </ProForm.Group>
        <ProFormTextArea name={"remarks"} label="Remarks" rules={[{ required: true }]} />

    </ModalForm>
}