import { LookupDataItem2 } from "@/services/data"
import { ModalForm, ModalFormProps, ProFormDatePicker, ProFormSelect, ProFormText,ProCard, ProDescriptions} from "@ant-design/pro-components"
import { useForm } from "antd/lib/form/Form"
import { SaveEssProfile } from "../data.ess"
import { Space,Row, Col,Typography} from 'antd';
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

    return <ModalForm  {...rest} form={form} width={'40%'} title="Information Modified"
        onOpenChange={visible => {
            form.resetFields() 
            rest.onOpenChange?.(visible)
        }}

        submitter={false} 
        >
        <ProCard bordered>
            {/*  */}
            <div style={{marginTop:'10px'}}><Typography.Title level={4}>Contact Information</Typography.Title></div> 
            <ProDescriptions size="small" column={2}>
              <ProDescriptions.Item label="Email">222</ProDescriptions.Item>
              <ProDescriptions.Item label="Personal Phone">22222</ProDescriptions.Item>
              <ProDescriptions.Item label="Businese Phone">4444</ProDescriptions.Item> 
            </ProDescriptions>   

            {/*  */}
            <div style={{marginTop:'10px'}}><Typography.Title level={4}>Personal Information</Typography.Title></div>             
            <ProDescriptions size="small" column={2}>
              <ProDescriptions.Item label="Name KH">222</ProDescriptions.Item>
              <ProDescriptions.Item label="Name EN">22222</ProDescriptions.Item>
              <ProDescriptions.Item label="Date of Birth">4444</ProDescriptions.Item> 
              <ProDescriptions.Item label="Marital Status">4444</ProDescriptions.Item> 
              <ProDescriptions.Item label="Religion">4444</ProDescriptions.Item> 
              <ProDescriptions.Item label="National ID">4444</ProDescriptions.Item> 
              <ProDescriptions.Item label="Passport Number">4444</ProDescriptions.Item> 
            </ProDescriptions>   
             
            {/* Dependent */}
            <div style={{marginTop:'10px'}}><Typography.Title level={5}>Dependent</Typography.Title></div> 
            <ProDescriptions size="small" column={2}>
              <ProDescriptions.Item label="Relationship">222</ProDescriptions.Item>
              <ProDescriptions.Item label="Occupation">22222</ProDescriptions.Item>
              <ProDescriptions.Item label="Date of Birth">4444</ProDescriptions.Item> 
            </ProDescriptions>   
            
            {/*  */}
            <div style={{marginTop:'10px'}}><Typography.Title level={4}>Emergency Contact</Typography.Title></div>  
            <ProDescriptions size="small" column={2}>
              <ProDescriptions.Item label="Emergency Name">222</ProDescriptions.Item>
              <ProDescriptions.Item label="Emergency Contact Relation">22222</ProDescriptions.Item>
              <ProDescriptions.Item label="Emergency Phone">4444</ProDescriptions.Item>
              <ProDescriptions.Item label="Emergency Address"> afdsfdsfdsfds</ProDescriptions.Item>  
            </ProDescriptions> 
            {/*  */}
            <div style={{marginTop:'10px'}}><Typography.Title level={4}>Education</Typography.Title></div> 
            <ProDescriptions size="small" column={2}>
              <ProDescriptions.Item label="Emergency Name">222</ProDescriptions.Item>
              <ProDescriptions.Item label="Emergency Contact Relation">22222</ProDescriptions.Item>
              <ProDescriptions.Item label="Emergency Phone">4444</ProDescriptions.Item>
              <ProDescriptions.Item label="Emergency Address"> afdsfdsfdsfds</ProDescriptions.Item>  
            </ProDescriptions> 
            {/*  */}
            <div style={{marginTop:'10px'}}><Typography.Title level={4}>Languages</Typography.Title></div> 
            <ProDescriptions size="small" column={2}>
              <ProDescriptions.Item label="Emergency Name">222</ProDescriptions.Item>
              <ProDescriptions.Item label="Emergency Contact Relation">22222</ProDescriptions.Item>
              <ProDescriptions.Item label="Emergency Phone">4444</ProDescriptions.Item>
              <ProDescriptions.Item label="Emergency Address"> afdsfdsfdsfds</ProDescriptions.Item>  
            </ProDescriptions> 
            {/*  */}
            <div style={{marginTop:'10px'}}><Typography.Title level={4}>Training</Typography.Title></div> 
            <ProDescriptions size="small" column={2}>
              <ProDescriptions.Item label="Emergency Name">222</ProDescriptions.Item>
              <ProDescriptions.Item label="Emergency Contact Relation">22222</ProDescriptions.Item>
              <ProDescriptions.Item label="Emergency Phone">4444</ProDescriptions.Item>
              <ProDescriptions.Item label="Emergency Address"> afdsfdsfdsfds</ProDescriptions.Item>  
            </ProDescriptions> 
            {/*  */}
            <div style={{marginTop:'10px'}}><Typography.Title level={4}>Work Experiences</Typography.Title></div> 
            <ProDescriptions size="small" column={2}>
              <ProDescriptions.Item label="Emergency Name">222</ProDescriptions.Item>
              <ProDescriptions.Item label="Emergency Contact Relation">22222</ProDescriptions.Item>
              <ProDescriptions.Item label="Emergency Phone">4444</ProDescriptions.Item>
              <ProDescriptions.Item label="Emergency Address"> afdsfdsfdsfds</ProDescriptions.Item>  
            </ProDescriptions>  
        </ProCard>


    </ModalForm>
}