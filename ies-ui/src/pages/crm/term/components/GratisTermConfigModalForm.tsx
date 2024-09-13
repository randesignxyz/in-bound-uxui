import {
    ModalForm,
    ModalFormProps,
    ProForm,
    ProFormDigit,
    ProFormGroup,
    ProFormSelect,
    ProFormText,
    ProFormTextArea,   
  } from '@ant-design/pro-components';
import { useForm } from 'antd/lib/form/Form';
import { SaveGratisSettledConfigData,GratisSettledConfigData } from '../types';
import { simpleRequestActions } from '@/services/model';
import { Spin, message } from 'antd';
import { useEffect } from 'react';
import { TermServices } from '../service';

export default ({
    termId,
    initData,
    onRefresh,
    ...rest
  }: ModalFormProps<SaveGratisSettledConfigData> & {termId: number,initData?:GratisSettledConfigData,onRefresh?: () => void }) => {
    const requestActions = simpleRequestActions();
    const [form] = useForm<SaveGratisSettledConfigData & { customer?: string }>();
    const settledSKUList = [
      {code:'FG000001',sku:'350mL'},
      {code:'FG000002',sku:'500mL'},
      {code:'FG000003',sku:'1.5L'},
      {code:'FG000004',sku:'20L(S)'}
    ]
    useEffect(()=>{
      form.setFieldsValue({
        ...initData
      })
    },[])

    const onSaveHandler= async()=>{
      try {
        const formData = await form.validateFields();    
        const data = {...formData,termId: termId,id: initData?.id} as SaveGratisSettledConfigData      
        await TermServices.saveSettledConfig(data)(requestActions).then(it => {
          message.success('Saved successfully.');
          onRefresh?.()
        })      
      } catch(error: any){
          message.error(error.message || 'Failed to save')
      }

    }

   return(
   <ModalForm<SaveGratisSettledConfigData> width={1150}
    form={form} title="Gratis Configuration - Term Mapping" {...rest} 
    modalProps={{
      okText:'Save'
    }}
    onFinish={onSaveHandler}
   >
     <Spin spinning={requestActions.request?.loading || false}>
      <ProFormGroup >
        <ProFormText  label='SKU' name={'sku'} rules={[{ required: true }]} width={180}/>  
        <ProFormText label='Operator' name={'operator'}  rules={[{ required: true }]} width={150}/>  
        <ProFormDigit label='Target0' name={'target0'} rules={[{ required: true }]} width={150}/>  
        <ProFormDigit label='Target1' name={'target1'} rules={[{ required: true }]} width={150}/>   
        <ProFormDigit min={-5} label='Count' name={'countValue'} rules={[{ required: true }]} width={150}/>      
        <ProFormDigit label='Offer' name={'offer'} rules={[{ required: true }]} width={150}/>      
      </ProFormGroup>
      <ProFormGroup >
        <ProFormSelect options={settledSKUList.map(it=> { return {label: it.code,value: it.code}})} label='Settled SKU Code' name={'settledCode'} rules={[{ required: true }]} width={180}/>   
        <ProFormSelect options={settledSKUList.map(it=> { return {label: it.sku,value: it.sku}})} label='Settled SKU' name={'settledSKU'} rules={[{ required: true }]} width={150}/>  
        <ProFormText label='Exclude SKU' name={'excludedSKU'} rules={[{ required: true }]} width={150}/>  
        <ProFormText label='Merged SKU' name={'mergedSKU'} rules={[{ required: true }]} width={150}/>     
      </ProFormGroup>
      <ProFormTextArea label='Remarks' name={'remark'} />
        
     </Spin>

   </ModalForm>)
}