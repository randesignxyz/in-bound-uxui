import {
    ModalForm,
    ModalFormProps,
    ProFormSelect,
    ProFormText,
    ProFormTextArea,   
  } from '@ant-design/pro-components';
import { useForm } from 'antd/lib/form/Form';
import { SaveTermData} from '../types';
import { simpleRequestActions } from '@/services/model';
import { Modal, Spin, message } from 'antd';
import { useEffect} from 'react';
import { TermServices } from '../service';
import { LookupData } from '@/services/data';

export default ({
    onRefresh,
    contractTypes,
    ...rest
  }: ModalFormProps<SaveTermData> & { onRefresh?: () => void,contractTypes?: LookupData[] }) => {
    const requestActions = simpleRequestActions();
    const [form] = useForm<SaveTermData & { customer?: string }>();
    
    useEffect(()=>{
      loadData()
    },[])
    const loadData= async ()=>{
      const term =  await TermServices.getTermCode().query(requestActions)
      form.setFieldsValue({
        code: term.data
      })
    }
    const onSaveHandler = async () =>{
        try {
        const formData = await form.validateFields();    
        const data = {id:-1,...formData} as SaveTermData 
        Modal.confirm({
          title:'New Term',
          content:'Are you to save this term?',
          onOk: async () => {
            await TermServices.saveTerm(data)(requestActions).then(it=>{
              message.success('Saved successfully.');
              onRefresh?.()
            }) 
          }
        })         
        
      }catch(error: any){
        message.error(error.message || 'Failed to save')
      }
    }
    
  return <ModalForm form={form} title="New Term" {...rest}  onFinish={onSaveHandler}>
    <Spin spinning={requestActions.request?.loading || false}>
      <ProFormText label='Code' name={'code'} rules={[{ required: true }]}/>
      <ProFormTextArea label='Description' name={'description'} rules={[{ required: true }]}/>
      <ProFormSelect label='Tag' mode="tags" colSize={1} readonly={false} options={contractTypes?.map(it =>{ return {label: it.name,value: it.name}})} name={'tag'}/>
    </Spin>
  </ModalForm>
}