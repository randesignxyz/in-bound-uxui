import { LookupDataItem2 } from "@/services/data"
import { ModalForm, ModalFormProps, ProCard, ProFormSelect, ProFormText } from "@ant-design/pro-components"
import { useForm } from "antd/lib/form/Form"
import { SaveEssProfile } from "../data.ess"
import { Space} from 'antd';
import { useEffect,useState } from 'react'; 

interface Props extends ModalFormProps<SaveEssProfile> { 
    data?: SaveEssProfile,
}

export default ({ data, ...rest }: Props) => {

    const [form] = useForm<SaveEssProfile>()

    useEffect(() => {
        initData();
    }, [data]);
    const initData = async () => { 
        form.setFieldsValue(data)
    }; 

    return <ModalForm  {...rest} form={form} width={'30%'} title="Modify emergency address"
        onOpenChange={visible => {
            form.resetFields() 
            rest.onOpenChange?.(visible)
        }}

        submitter={{
            searchConfig: {
                submitText: 'Save',
                resetText: 'Cancel',
            },
        }} 
        > 

        <ProCard bordered>
            <ProFormSelect 
                label="City/ Province" 
                name={'province_id'}
                options={[
                    { value: 1, label: "Male" },
                    { value: 2, label: "Female"}  
                ]}  
            />         
            {/*  */}
            <ProFormSelect 
                label="Khan/ District" 
                name={'district_id'}
                options={[
                    { value: 1, label: "Male" },
                    { value: 2, label: "Female"}  
                ]}   
            />         
            {/*  */}
            <ProFormSelect 
                label="Sangkhat/ Commune" 
                name={'commune_id'}
                options={[
                    { value: 1, label: "Male" },
                    { value: 2, label: "Female"}  
                ]}   
            />
            {/*  */}
            <ProFormText label="House No" name={'home_no'} />  
            <ProFormText label="Street" name={'street'} /> 
            <ProFormText label="Group/Village" name={'group_village'} />
        </ProCard>

    </ModalForm>
}