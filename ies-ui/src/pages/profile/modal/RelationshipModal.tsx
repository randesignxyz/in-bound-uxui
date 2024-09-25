import { ModalForm, ModalFormProps,ProCard, ProFormTextArea, ProFormSelect, ProFormText, ProForm, ProFormDatePicker } from "@ant-design/pro-components"
import { RelationshipData } from "../data.ess" 
import { useEffect,useState } from 'react'; 
import { Modal, message, Button} from "antd"; 
import { ProfileData } from "../data";
import { simpleRequestActions } from "@/services/model";
import { ProfileServicesEss } from "../service_ess";
import { ProfileOutlined,SaveOutlined,CloseSquareOutlined } from "@ant-design/icons";

interface Props extends ModalFormProps<RelationshipData> { 
    profile: ProfileData;
    data?: RelationshipData; 
    type:string; 
    isAdmin:number;
    empId:number;
    cb: { //used callback function to parent form 
        onReload:()=>void; 
    };
}

export default ({ profile,data,type,isAdmin,empId,cb, ...rest }: Props) => {
    const requestActions = simpleRequestActions(); 
 
    const [form] = ProForm.useForm<RelationshipData>();   
    
    useEffect(() => {
        initData();
    }, [data]);
    const initData = async () => {   
        // 
        if(!!data){
            form.setFieldsValue(data!!);
        }
        else{
            form.resetFields();
        }
    };
 
    // 
    const onAdminSubmit = async ()=>{
        const bmForm = await form.validateFields(); 
        Modal.confirm({
            title: 'Save Family Member',
            content: 'Are you sure?',
            onOk: async () => {
              try {  
                bmForm.id = (!!data!!?data!!.id:0);
                bmForm.empId = empId;
                bmForm.status=true;
                bmForm.isDelete=0;
                await ProfileServicesEss.saveRelationshipAdmin(bmForm)(requestActions); 
                // call back fun
                cb.onReload(); 
              } catch (error: any) {
                message.error(error.message || 'Failed to save.');
              }
            },
        });
    }
    return <ModalForm  {...rest} form={form} width={'30%'} title={!!data?<><ProfileOutlined /> Edit Family member</>:<><ProfileOutlined /> Add Family member</>} 
            submitter={isAdmin==2&&empId>0?
                {
                    render: () => { 
                        return <><Button onClick={()=>{onAdminSubmit();}}><SaveOutlined /> Save</Button></>
                    }
                }
                :{
                    searchConfig: {
                        submitText: <div><SaveOutlined /> Save</div>,
                        resetText: <div><CloseSquareOutlined /> Cancel</div>,
                    }
                }
            } 
        >  
        <ProCard bordered>
            <ProFormText label="Full Name" name={'relationshipName'} rules={[{ required: true }]} placeholder={"Family Name, Given Name"} /> 
            <ProFormSelect rules={[{ required: true }]} 
                label="Relationship"
                // disabled = {!!data}
                name={'relationshipId'}
                options={profile.relship?.map((it) => {
                    return { value: it.id, label: it.titleName };
                })}  
            /> 
            <ProFormSelect rules={[{ required: true }]} 
                label="Occupation"
                name={'occupationId'}
                options={profile.oc?.map((it) => {
                    return { value: it.id, label: it.titleName };
                })}  
            />
            <ProFormDatePicker 
                label="Date of Birth"
                name={'dateOfBirth'}/>  
            <ProFormTextArea label="Description" name={'description'} /> 
        </ProCard>
          
    </ModalForm>
}