import { ModalForm, ModalFormProps, ProFormText, ProFormTextArea } from "@ant-design/pro-components";

interface Props extends ModalFormProps<{label:string, remarks: string}>{
    key?: string;
    required?: boolean
    onSave: (label: string ,remarks: string , key?: string, ) => void;
    loading?:boolean;
}

export default ( { key,required, onSave,loading, ...rest} : Props) => {
   
    return <ModalForm {...rest}
        loading={loading}
        modalProps={{
            maskClosable:false 
         }}
        submitter={{
            searchConfig: {
                submitText: 'Save',
            }
           
        }}
        onFinish = {dataForm => {
            onSave(dataForm.label,dataForm.remarks, key)
            return Promise.resolve()
        }} 
    >
        <ProFormText rules={[{required }]}  label= "Label" name={'label'} />
        <ProFormTextArea  label= "Remarks" name={'remarks'} />

    </ModalForm>
}