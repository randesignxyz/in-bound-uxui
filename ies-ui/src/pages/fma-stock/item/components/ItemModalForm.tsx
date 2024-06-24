import {
    ModalForm,
    ModalFormProps,
    ProFormCheckbox,
    ProFormSelect,
    ProFormText,
    ProFormTextArea,   
  } from '@ant-design/pro-components';
import { useForm } from 'antd/lib/form/Form';
import { SaveItemData } from "../data.types";
import { Checkbox, Modal, Spin, message } from "antd";
import { simpleRequestActions } from "@/services/model";
import { createService } from "../services";
import { createService as createSrv } from "../../request/services";
import { useEffect, useState } from 'react';
import { ItemGroupListItem } from '../../request/data.types';

export default ({type, itemId, onRefresh,...rest}: ModalFormProps<SaveItemData> & {type: 'ADD'|'EDIT',itemId?:number, onRefresh?: () => void } ) => {
    const [form] = useForm<SaveItemData & { customer?: string }>();
    const [group,setGroup] = useState<ItemGroupListItem[]>()
    const [title, setTitle] = useState<string>('New Item')
    const requestActions = simpleRequestActions();
    const services = createService(requestActions);
    const srv = createSrv(requestActions)
    const uomList = [{name: 'Set'},{name: 'EA'},{name: 'Box'}]
    const readonly = type=='EDIT'?true:false
    // const title = type=='EDIT'?'Edit':'New Item'
    useEffect(()=>{
        type=='EDIT'?services.fetchItem(itemId||0).then(rs=> {
            console.log('payload111', rs)
            setTitle(type=='EDIT'?'Edit - ' + rs.itemCode:'New Item')
            form.setFieldsValue(rs)
            form.setFieldValue('groupId',rs.itemGroup.id)
        }):form.setFieldValue('isActiveY',true)
        srv.listAllItemGroup().then(rs=>{
            setGroup(rs)
        })
    },[type])
    const onSaveHandler = async () =>{      
        const formData = await form.validateFields(); 
        formData.status =  formData.isActiveY?'Y':'N' 
        formData.itemCode = formData?.itemCode??''
        formData.id = itemId||0
        console.log('payload', formData)          
        Modal.confirm({
            title: title,
            content: 'Are you sure to save.',
            onOk: async () => {
                try {
                services.saveItem(formData).then(it=>{
                    message.success('Saved successfully.');
                    onRefresh?.()
                }) 
                } catch (error) {
                message.error('Failed to save.');
                }
            },
        });
    }
          
    
    return <ModalForm<SaveItemData> 
            form={form} title={title}
            {...rest} 
            onFinish={onSaveHandler} 
            loading={requestActions.request?.loading||false}
        >
        <Spin spinning={requestActions.request?.loading || false}>
            {!readonly && <ProFormText label='Item Code' name={'itemCode'} rules={[{ required: true }]} readonly={readonly}/>}
            <ProFormText label='Abr.' name={'itemAbr'} rules={[{ required: true }]}/>
            <ProFormText label='Item Name' name={'itemName'} rules={[{ required: true }]}/>
            <ProFormSelect label='UoM' name={'defaultUoM'} mode="single" colSize={1} readonly={false} rules={[{ required: true }]} options={uomList?.map(it =>{ return {label: it.name,value: it.name}})} />
            <ProFormSelect label='Group' name={'groupId'} mode="single" colSize={1} readonly={false} rules={[{ required: true }]} options={group?.map(it =>{ return {label: it.itemGroupName,value: it.id}})} />
            <ProFormTextArea label='Description' name={'description'} rules={[{ required: false }]}/>
            <ProFormCheckbox  name='isActiveY'>Active</ProFormCheckbox>
        </Spin>
    </ModalForm>
}