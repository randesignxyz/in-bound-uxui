import FormModalComp, { FormModalProps } from "@/components/FormModal";
import { ProForm, ProFormDatePicker, ProFormSelect, ProFormText, ProFormTextArea } from "@ant-design/pro-components";
import { useForm } from "antd/es/form/Form";

interface Props extends FormModalProps{
    onSave:(data:ContractEntry)=> void
}

interface ContractEntry{

}
const ContractModalForm:React.FC<Props> = ({onSave, ...props}) =>{


    const [form] = useForm<ContractEntry>();
    return (
        <>
            <FormModalComp
            {...props}
                title="Contract Form"
            >
                <ProForm
                    form={form}
                    submitter={false}
                >

                    <ProFormText
                        name={"companyName"}
                        label="Company Name"
                    />
                    <ProFormDatePicker
                        label="Date"
                        name={"date"}
                    />
                    <ProFormText
                        name={"contractName"}
                        label="Contract Name"
                    />
                    <ProFormText
                        label="City/Province"
                        name={"city"}
                    />
                    <ProFormTextArea
                        name={"description"}
                        label="Description"
                    />
                    <ProFormText
                        name={"vendorName"}
                        label="Customer/Vendor Name"
                    />
                    <ProFormText
                        name={"vendorCode"}
                        label="Customer/Vendor Code"
                    />
                    <ProFormDatePicker
                        name={"expireDate"}
                        label="Expiration Date"
                    />
                    <ProFormText
                        name={"department"}
                        label="Department"
                    />
                    <ProFormText
                        name={"gratis"}
                        label="Gratis"
                    />
                    <ProFormSelect
                        name={"type"}
                        label="Type"
                    />
                    
                    <p>Attach File</p>

                </ProForm>

            </FormModalComp>
        </>
    )
}

export default ContractModalForm