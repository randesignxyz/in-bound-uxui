import { ModalForm, ModalFormProps, ProFormSelect, ProFormText, ProFormTextArea } from "@ant-design/pro-components";
import { useState } from "react";

interface Props extends ModalFormProps<{status:string, remarks: string}>{
    key?: string;
    required?: boolean
    onSave: (status: string ,remarks: string , cb:(v: boolean)=>void) => void;
    trigger?: JSX.Element;
}

export default ( {trigger, key,required, onSave, ...rest} : Props) => {
    const [open,setOpen] = useState<boolean>(false);
    return <ModalForm trigger={trigger}
        {...rest}
        
        submitter={{
            searchConfig: {
                submitText: 'Save',
            }
        }}
        
        open={open}
        onFinish = {async dataForm => {
            onSave(dataForm.status,dataForm.remarks,(v)=>{                
                setOpen(!v);
            });
            return false;
        }} 
        onOpenChange={(v)=>{
            if(!v){
                // setOpen([]);
                // form.resetFields();               
            }
            setOpen(v);
        }}  
    >
        {/* <ProFormText rules={[{required }]}  label= "Label" name={'label'} /> */}
        <ProFormSelect rules={[{required:true }]}  label='Status'  name={'status'} options={[{label:'Achieved',value:'ACHIEVED'},{label:'Failed',value:'FAILED'}]} />
        <ProFormTextArea rules={[{required: true }]}  label= "Remarks" name={'remarks'} />

    </ModalForm>
}