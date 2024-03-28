import {
    ModalForm,
    ModalFormProps,
    ProFormText,
    ProFormTextArea,   
  } from '@ant-design/pro-components';
import { useForm } from 'antd/lib/form/Form';
import { SaveTermData} from '../types';
import { simpleRequestActions } from '@/services/model';
import { Spin, message } from 'antd';
import { useEffect} from 'react';
import { TermServices } from '../service';

export default ({
    onRefresh,
    ...rest
  }: ModalFormProps<SaveTermData> & { onRefresh?: () => void }) => {
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
        await TermServices.saveTerm(data)(requestActions).then(it=>{
          message.success('Saved successfully.');
          onRefresh?.()
        }) 
      }catch(error: any){
        message.error(error.message || 'Failed to save')
      }
    }
    
   return <ModalForm form={form} title="Term" {...rest}  onFinish={onSaveHandler}>
     <Spin spinning={requestActions.request?.loading || false}>
        <ProFormText label='Code' name={'code'} rules={[{ required: true }]}/>
        <ProFormTextArea label='Description' name={'description'} rules={[{ required: true }]}>
        </ProFormTextArea>
     </Spin>

   </ModalForm>
}