import Requestor from '@/pages/process-flow/components/Requestor/Requestor';
import { ModalForm, ModalFormProps }  from '@ant-design/pro-components';
import { Space, Typography, message } from "antd";
import { useForm } from "antd/lib/form/Form";
import {useState } from "react";
import ItemDetail from "../../request/item-detail";
import { FileAddFilled, FileAddOutlined } from '@ant-design/icons';
import Icon from '@ant-design/icons/lib/components/Icon';

interface Props extends ModalFormProps<DataFormType> {
    title?:string;
    key?: string;
    required?: true|false
    onSave: (requestor: DataFormType , cb:(v: boolean)=>void) => void;
    trigger?: JSX.Element;
    submitText?: string;
    settleId: number;
    forceRefresh:number;
}
type DataFormType = {
    requestorId: string
    requestorBuId: number  
    title: string
    requestTypeId: number
}

export default ( {title,settleId,submitText,trigger, key,required, onSave,forceRefresh, ...rest} : Props) => {
    const [form] = useForm<DataFormType>()
    const [open,setOpen] = useState<boolean>(false);  
   
    return <ModalForm<DataFormType>  
        form={form}
        trigger={trigger}
        title = {title ||'New Request'}
        width={'90%'}
        submitter={{
            searchConfig: {
                submitText: submitText||'Save',
                resetText: 'Close'
                
            }
        }}        
        open={open}
        onFinish = {async dataForm => {
            onSave(dataForm,(v)=>{                
                setOpen(!v);
            });
            return false;
        }} 
        onOpenChange={(v)=>{
            setOpen(v);
        }}  
    ><Space direction="vertical" style={{ width: '100%' }}>
        <Requestor onlyCurrentUser  form={form} />   
        <ItemDetail id={settleId} forceRefresh={forceRefresh}/> 
    </Space>
    </ModalForm>
}