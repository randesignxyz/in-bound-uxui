import { ModalForm, ProCard, ProFormDigit } from "@ant-design/pro-components";
import { Descriptions } from "antd";
import { useForm } from "antd/es/form/Form";
import {  AdjustItem} from "../../../types";

interface Props {
    trigger?: JSX.Element;  
    initData?: AdjustItem;
    addHandler:(item: AdjustItem)=>void;    
}
const AdjustItemModal= ({trigger, initData, addHandler}:Props)=>{
    const [form] = useForm<AdjustItem>()
    return(<ModalForm<AdjustItem> width={650} size="small" layout="vertical" 
        trigger={trigger}        
        form={form}
        modalProps={{
            maskClosable:false 
         }}
        title={'Edit Item'}
        onFinish = {async (dataForm: AdjustItem) => {
            form.validateFields()
            addHandler({
                ...dataForm
            })
            return true;
        }}       
        submitter={{
            searchConfig: {
                submitText: 'Edit',
            },
            
           
        }}
        onOpenChange={(v)=>{
            form.setFieldValue('qty',initData?.qty)
        }}
    >
        <ProCard bordered direction="row">
            <Descriptions column={2}>                
                <Descriptions.Item label='Invoice/SO' >{initData?.docNum}</Descriptions.Item>
                <Descriptions.Item label='Description' span={2}>{initData?.dscription}</Descriptions.Item>
                <Descriptions.Item label='Item Code' >{initData?.itemCode}</Descriptions.Item>
                <Descriptions.Item label='Item Name' >{initData?.itemName}</Descriptions.Item>
            </Descriptions>           
            <ProFormDigit min={1} rules={[{required:true }]} label='Qty' name='qty'/>
        </ProCard>
</ModalForm>)
}
export default AdjustItemModal