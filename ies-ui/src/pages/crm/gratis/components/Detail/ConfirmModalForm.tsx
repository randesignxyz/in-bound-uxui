import { ModalForm, ModalFormProps, ProFormSelect, ProFormText, ProFormTextArea } from "@ant-design/pro-components";
import { useState } from "react";

interface Props extends ModalFormProps<{remarks: string}> {
    key?: string;
    required?: true|false
    onSave: (remarks: string , cb:(v: boolean)=>void) => void;
    trigger?: JSX.Element;
    submitText?: string;
}

export default ( {submitText,trigger, key,required, onSave, ...rest} : Props) => {
    const [open,setOpen] = useState<boolean>(false);
    return <ModalForm trigger={trigger}
        {...rest}        
        submitter={{
            searchConfig: {
                submitText: submitText||'Save',
                resetText: 'Close'
                
            }
        }}        
        open={open}
        onFinish = {async dataForm => {
            onSave(dataForm.remarks,(v)=>{                
                setOpen(!v);
            });
            return false;
        }} 
        onOpenChange={(v)=>{             
            setOpen(v);
        }}  
    >        
        <ProFormTextArea rules={[{required: required }]}  label= "Remarks" name={'remarks'} />
    </ModalForm>
}