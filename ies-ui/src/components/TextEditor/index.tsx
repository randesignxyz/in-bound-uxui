import { ProFormText, ProFormTextArea } from "@ant-design/pro-components"


interface Props {

}

export default ({}: Props) =>{
   return (
    <div>
        <ProFormText rules={[{required: true}]} label = "Subject" name={'subject'}/>
        <ProFormText label = "BCC" name={'bcc'}/>
        <ProFormTextArea rules={[{required: true}]} fieldProps={{rows: 10}} label ="Messages" name={'messageBody'}/>       
    </div>
   )
}

