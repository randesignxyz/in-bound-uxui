import { ModalForm, ModalFormProps, ProFormCheckbox, ProFormText, ProFormTextArea } from "@ant-design/pro-components";
import { Checkbox } from "antd";
import { useEffect, useState } from "react";

interface Props extends ModalFormProps<{docRef:string, remarks: string,reconcile?: boolean}>{
    key?: string;
    required?: boolean
    onSave: (docRef: string ,remarks: string,reconcile?: boolean , key?: string, ) => void;
}

export default ( { key,required, onSave, ...rest} : Props) => {
    const [require,setRequire] = useState<boolean>(false)
    useEffect(()=>{
        if(required) setRequire(required)
    },[])
   
    return <ModalForm {...rest} onFinish = {dataForm => {
          onSave(dataForm.docRef,dataForm.remarks,dataForm.reconcile, key)
         return Promise.resolve()
    }} >
        <ProFormText rules={[{required: require }]}  label= "Doc Ref" name={'docRef'} />
        <ProFormCheckbox  name={'reconcile'} fieldProps={{onChange:(v)=> setRequire(!(v?.target?.checked||false))}} >Reconcile</ProFormCheckbox>
        <ProFormTextArea rules={[{required: !require }]} label= "Remarks" name={'remarks'} />

    </ModalForm>
}