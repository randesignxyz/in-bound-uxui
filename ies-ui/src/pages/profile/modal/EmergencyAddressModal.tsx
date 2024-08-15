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
                name={'provinceId'}
                options={[
                    { value: 1, label: "Male" },
                    { value: 2, label: "Female"}  
                ]}  
            />         
            {/*  */}
            <ProFormSelect 
                label="Khan/ District" 
                name={'districtId'}
                options={[
                    { value: 1, label: "Male" },
                    { value: 2, label: "Female"}  
                ]}   
            />         
            {/*  */}
            <ProFormSelect 
                label="Sangkhat/ Commune" 
                name={'communeId'}
                options={[
                    { value: 1, label: "Male" },
                    { value: 2, label: "Female"}  
                ]}   
            />
            {/*  */}
            <ProFormText label="House No" name={'homeNo'} />  
            <ProFormText label="Street" name={'street'} /> 
            <ProFormText label="Group/Village" name={'groupVillage'} />
        </ProCard>

    </ModalForm>
}