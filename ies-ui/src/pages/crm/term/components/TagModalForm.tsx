import {
    ModalForm,
    ModalFormProps,
    ProFormSelect,
  } from '@ant-design/pro-components';
import { useForm } from 'antd/lib/form/Form';
import { simpleRequestActions } from '@/services/model';
import { Spin, message } from 'antd';
import { useEffect, useState} from 'react';
import { TermServices } from '../service';
import { LookupData } from '@/services/data';
import { MultiRequest } from '@/services/apiGateway';
import { ContractServices } from '../../contract/services';

export default ({
    termId,
    onRefresh,
    ...rest
  }: ModalFormProps<{tag: string[]}> & {termId: number, onRefresh?: () => void }) => {
    const requestActions = simpleRequestActions();
    const [form] = useForm<{tag: string[]}>();
    const [lookupData, setLookupData] = useState<{
      contractTypes?: LookupData[];
    }>();
    useEffect(()=>{
      loadData()
    },[])
    const loadData= async ()=>{
      const term =  await TermServices.detail(termId).query(requestActions)
      const rs = await MultiRequest<{
        contractTypes: LookupData[];
      }>([
        ContractServices.listContractType().queryParams,
      ])(requestActions);

      setLookupData(rs);
      form.setFieldsValue({
        tag: term.tag
      })
    }
    const onSaveHandler = async () =>{
      try {
        const formData = await form.validateFields();    
        const data = {...formData,termId:termId}
        await TermServices.saveTermTag(data)(requestActions).then(it=>{
          message.success('Saved successfully.');
          onRefresh?.()
        }) 
      }catch(error: any){
        message.error(error.message || 'Failed to save')
      }
    }
    
   return <ModalForm form={form} title="Tag" {...rest}  onFinish={onSaveHandler}>
     <Spin spinning={requestActions.request?.loading || false}>
      <ProFormSelect mode="tags" colSize={1} readonly={false} options={lookupData?.contractTypes?.map(it =>{ return {label: it.name,value: it.name}})} name={'tag'}/>
       
     </Spin>

   </ModalForm>
}