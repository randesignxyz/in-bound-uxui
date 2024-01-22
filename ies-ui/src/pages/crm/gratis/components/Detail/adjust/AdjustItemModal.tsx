import { SearchOutlined } from "@ant-design/icons";
import { ModalForm, ProCard, ProDescriptions, ProForm, ProFormDigit, ProFormField, ProFormGroup, ProFormSelect, ProFormText } from "@ant-design/pro-components";
import { Button, Card, Input, InputRef, Space, message } from "antd";
import { useForm } from "antd/es/form/Form";
import { AdjustInfoOn, AdjustItem, ItemSAP } from "../../../types";
import { useSetState } from "ahooks";
import { useEffect, useRef, useState } from "react";
import { uniqueId } from "lodash";
import Search from "antd/lib/input/Search";
import { toReadable } from "@/pages/utils";
import { simpleRequestActions } from "@/services/model";
import { GratisServices } from "../../../services";
import ListItemSearchModal from "./ListItemSearchModal";

interface Props {
    trigger?: JSX.Element;
    dataLookup?: AdjustInfoOn[];
    initData?: AdjustItem;
    addHandler:(item: AdjustItem)=>void;
    edit?: boolean ;
    cusomterCode?:string;
}
const AdjustItemModal= ({trigger,cusomterCode,dataLookup, initData,addHandler,edit}:Props)=>{
    const [form] = useForm<AdjustItem>()
    const [docNum,setDocNum] = useState<string>()
    const requestActions = simpleRequestActions()
    const [selectedFrom, setSelectedFrom] = useState<AdjustInfoOn>()
    const [searchData, setSearchData] = useState<ItemSAP[]>()
    const [selectedItem, setSelectedItem] = useState<ItemSAP>()
    const [modalSearch, setModalSearch] = useState<{
        type: 'itemSearch';
        // required: boolean;
        cb: (item:ItemSAP) => void;
    }>()

  
    const onSearch=async (value:string)=>{
        try{
            var dataForm = await form.getFieldsValue()
            setDocNum(value)
            const rs = await GratisServices.getListItemSAP(cusomterCode,value,selectedFrom?.dataSource,selectedFrom?.startedDate,selectedFrom?.endedDate).query(requestActions) 
            
            if(rs && rs.length>0){            
                setSearchData(rs)
                setModalSearch({
                    type: 'itemSearch',
                    cb:(item:ItemSAP)=>{
                        form.setFieldValue('itemCode',item.itemCode)
                        form.setFieldValue('itemName',item.itemName)
                        form.setFieldValue('qty',item.quantity)
                        form.validateFields()
                        setSelectedItem(item)
                        setModalSearch(undefined)
                    }
                })
                message.info('Successfull')
            }else{
                message.warning('Not found')
            }
            
        }catch(ex){
            message.error('Not found')
        }
       
        
    }
    return(<ModalForm<AdjustItem> width={570} size="small" layout="vertical" 
        trigger={trigger}        
        form={form}
        modalProps={{
            maskClosable:false 
         }}
        title={'Adjustment Item'}
        onFinish = {async (dataForm: AdjustItem) => {
            form.validateFields()
            addHandler({
                ...dataForm,
                docNum:docNum,
                dataSource: selectedFrom?.dataSource,
                // dscription: selectedFrom?.dscription,
                lineNum: selectedItem?.lineNum, 
                docDate: selectedItem?.docDate,         
                contractVerifyId: selectedFrom?.contractVerifyId||0,               
                startedDate: selectedFrom?.startedDate,
                endedDate:selectedFrom?.endedDate,
                uuId: initData?.uuId||uniqueId()
            })
            setDocNum('')
            setSelectedItem(undefined)
            form.resetFields()
            
            return true;
        }}       
        submitter={{
            searchConfig: {
                submitText: 'Add',
            },
            
           
        }}
        onOpenChange={(v)=>{
            form.setFieldValue('dscription',initData?.dscription)
            form.setFieldValue('itemCode',initData?.itemCode)
            form.setFieldValue('itemName',initData?.itemName)
            form.setFieldValue('qty',initData?.qty)
            setDocNum(initData?.docNum||'')
        }}
        onValuesChange={(record:any, data:AdjustItem)=> {
            var dscription = record.dscription
            if(dscription){
                setSelectedFrom(it=> dataLookup?.find(it=> it.dscription==dscription))
            }           
        }}
        
    >
        <ProCard bordered direction="row">
            <ProFormGroup direction="horizontal">
                <ProFormSelect disabled={edit} width={250} rules={[{required:true  }]}  label='From'  name={'dscription'}
                    options={dataLookup?.map(it=> ({label: toReadable(it.dscription), value:it.dscription}))} />
                <Input.Search  loading={requestActions.request?.loading}  disabled={edit} value={docNum} placeholder="Invoice/SO"  allowClear={true} style={{marginTop:25, marginLeft:-31}}  onChange={(e)=>setDocNum(e?.target?.value)} onSearch={(value,_)=>onSearch(value)}/>                
            </ProFormGroup>
            <ProFormText  disabled={edit}  rules={[{required:true  }]} label='Item Code' name='itemCode'/>
            <ProFormText  disabled={edit}  rules={[{required:true  }]} label='Item Name' name='itemName'/>
            <ProFormDigit  rules={[{required:true  }]} label='Qty' name='qty'/>
        </ProCard>
        { modalSearch?.type === 'itemSearch' && <ListItemSearchModal dataSource={searchData} 
            open={true}
            onOpenChange={(visible:boolean) => !visible && setModalSearch(undefined)}
            onSelected={modalSearch.cb} 
            loading = {requestActions.request?.loading||false}
            
        />}
</ModalForm>)
}
export default AdjustItemModal