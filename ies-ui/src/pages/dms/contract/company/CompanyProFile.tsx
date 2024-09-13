import FormModalComp, { FormModalProps } from "@/components/FormModal"
import { ProForm, ProFormText, ProFormTextArea } from "@ant-design/pro-components"
import React from "react"


interface Props extends FormModalProps{
    onSave:(data:CompanyEntryCreate)=>void
}

const ComapanyProFile:React.FC<Props> = ({ onSave, ...props })=>{

    return(
        <>
            <FormModalComp
                {...props}
            >
                <ProForm>
                    <ProFormText
                        name={"name"}
                        label="Name"
                    />
                    <ProFormText
                        name={"companyNumber"}
                        label="Company Number"
                    />
                    <ProFormText
                        name={"groupId"}
                        label="Company Group"
                    />
                    <ProFormText
                        name={"taxId"}
                        label="Company Tax ID"
                    />
                    <ProFormText
                        name={"websiteUrl"}
                        label="Website URL"
                    />
                    <ProFormText
                        name={"companyType"}
                        label="Company Type"
                    />
                    <ProFormTextArea
                        name={"address1"}
                        label="Address 1"
                    />
                    <ProFormTextArea
                        name={"address2"}
                        label="Address 2"
                    />
                    <ProFormText
                        name={"city"}
                        label="City"
                    />
                    <ProFormText
                        name={"state"}
                        label="State"
                    />
                    <ProFormText
                        name={"postalCode"}
                        label="Postal Code"
                    />
                    <ProFormText
                        name={"country"}
                        label="Country"
                    />
                    <ProFormText
                        name={"phone"}
                        label="Phone"
                    />
                </ProForm>
            </FormModalComp>
        </>
    )
}

export default ComapanyProFile