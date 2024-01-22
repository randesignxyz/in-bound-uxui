import { ModalForm, ProForm, ProFormItem, ProFormSelect, ProFormTextArea } from "@ant-design/pro-components"
import { Space } from "antd";
import { ReviewerMember } from "../data.types";
import { useForm } from "antd/es/form/Form";
import { simpleRequestActions } from "@/services/model";
import { AccountServiceAPI } from "@/services/account/services";
import { useState } from "react";
import { SearchAccount } from "@/services/account/data";

interface Props{
    open?: boolean;
    onOpenModalChange:(v:boolean)=>void;
    saveHandler:(data: ReviewerMember,resetFields:()=>void)=> void;
    checkList?: ReviewerMember[]
}
const ReviewMemberModal = ({open, onOpenModalChange,saveHandler,checkList}:Props)=> {
    const requestActions = simpleRequestActions()
    const accountServices = AccountServiceAPI(requestActions)
    const [form] = useForm<ReviewerMember>() 
    const [member, setMember] = useState<SearchAccount>()
    return (<ModalForm<ReviewerMember>
        title='Add Member'
        form = {form}
        modalProps={{
            centered:true,
            
        }}
        open={open}
        onOpenChange={onOpenModalChange}
        submitter={{
            searchConfig: {
                submitText: 'Save',
                resetText:'Close'            
            },
            render: (_, defaultDoms) => {
                return [
                    defaultDoms[0],
                    // edit&&<Button key="1" icon={<SaveOutlined />} onClick={saveDraftHandler}>Save Draft</Button>,
                    defaultDoms[1]
                ]
            }            
        }} 
        onFinish={ async (dataForm:any)=> {  
            // console.log(dataForm)
            await form.validateFields()           
            saveHandler(dataForm, ()=>{
                form.resetFields()
            })
            return false
        }}     
    >
        <Space direction="vertical" style={{ width: '100%' }}>
            <ProFormSelect label='Name' name='empNo' 
                rules= {[{ required: true }]}
                showSearch
                onChange={(value: any)=> {
                    // console.log('setMember',value)
                   
                }}
                request= {async(record)=>{
                    const it = await accountServices.findUserOrGroupList({
                        type: 'user',
                        searchValue:  record.keyWords,
                        approveOnly: false
                    });
                    return it.filter(it=> (checkList?.filter(i=> i.empNo==it.code)||[])?.length==0).map(it=> {return{label: it.name,value: it.code}})
                }}
            />
            <ProFormTextArea label='Remarks' name='remarks'/>
        </Space>

    </ModalForm>
        
    )
}
export default ReviewMemberModal