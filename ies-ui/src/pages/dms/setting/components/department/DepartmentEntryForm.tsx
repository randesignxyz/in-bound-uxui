import FormModalComp, { FormModalProps } from "@/components/FormModal"
import { ProForm, ProFormSelect, ProFormText, ProFormTextArea } from "@ant-design/pro-components";
import React, { useEffect } from "react"
import { useForm } from "antd/lib/form/Form";
import { simpleRequestActions } from "@/services/model";
import { CoreServiceAPI } from "@/pages/dms/service";

interface Props extends FormModalProps {
    onSave:(data:DeparmentCreate)=>void;
    data?:DepartmentDTO
}
const DepartmentEntryFormModal :React.FC<Props> =({ onSave, data ,...props}:Props)=>{
    const requestAction = simpleRequestActions();
    const [form]  =useForm<DeparmentCreate>();
    useEffect(()=>{
        form.resetFields();
        props.open && form.setFieldsValue({...data,buId:data?.buId?.id });
    }, [props.open])
    return (
        <FormModalComp
            {...props}
            width="600px"
            onSubmit={async()=>{
                const dataForm = await form.validateFields();
                const entry ={
                    ...dataForm,
                    id:data?.id,
                    status:"active"
                }
               onSave(entry);
            }}
            title="Department Form"
        >
            <ProForm
                form={form}
                submitter={false}
            >
                <ProFormText
                    label="Name"
                    name={"name"}
                    rules={[{required:true}]}
                />
                <ProFormSelect
                    name={"status"}
                    label="Status"
                    initialValue={"active"}
                    rules={[{required:true}]}
                    options={[
                        {
                            value:"active",
                            label:"Active"
                        },
                        {
                            value:"inactive",
                            label:"Inactive"
                        },
                    ]}
                />
                <ProFormSelect
                    name="buId"
                    label="Business unit"
                    showSearch
                    rules={[{required:true}]}
                    request={async()=>{
                        const data = await CoreServiceAPI(requestAction).orgUnitList();
                        return data.map(i=>({label:i.name, value:i.id }));
                    }}
                />
                <ProFormTextArea
                    name="description"
                    label="Description"
                />
            </ProForm>
        </FormModalComp>
    );
}

export default DepartmentEntryFormModal