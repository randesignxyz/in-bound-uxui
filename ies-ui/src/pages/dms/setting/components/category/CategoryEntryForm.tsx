import FormModalComp, { FormModalProps } from "@/components/FormModal"
import { ProForm, ProFormText, ProFormTextArea } from "@ant-design/pro-components";
import React, { useEffect } from "react"
import { CategoryCreate } from "./data";
import { useForm } from "antd/lib/form/Form";

interface Props extends FormModalProps {
    onSave:(data:CategoryCreate)=>void;
    data?:CategoryCreate
}

const CategoryEntryFormModal :React.FC<Props> =({ onSave, data ,...props}:Props)=>{
    
    const [form]  =useForm<CategoryCreate>();

    useEffect(()=>{
        props.open && form.setFieldsValue({...data});
    }, [props.open])

    return (
        <FormModalComp
            {...props}
            onSubmit={async()=>{
                
                
                const dataForm = await form.validateFields();
                const entry ={
                    ...dataForm,
                    id:data?.id,
                    status:"active"
                    
                }
                
               onSave(entry);
            }}
            width="400px"
            title="Category form"
        >
            <ProForm
                form={form}
                submitter={false}
            >
                <ProFormText
                    label="Title"
                    name={"name"}
                    rules={[{required:true}]}
                />
                <ProFormTextArea
                    name="description"
                    label="Description"
                />
                
            </ProForm>


        </FormModalComp>
    );
}

export default CategoryEntryFormModal