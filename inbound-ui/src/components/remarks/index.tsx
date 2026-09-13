import { ModalForm, ModalFormProps, ProFormTextArea } from "@ant-design/pro-components";

interface Props extends ModalFormProps<{remarks: string}>{
    key?: string;
    required?: boolean
    onSave: (remarks: string , key?: string, ) => void;
}

export default ( { key,required, onSave, ...rest} : Props) => {
   
    return <ModalForm {...rest} onFinish = {dataForm => {
          onSave(dataForm.remarks, key)
         return Promise.resolve()
    }} >

        <ProFormTextArea rules={[{required }]}  label= "Remarks" name={'remarks'} />

    </ModalForm>
}