import { 
  ProCard,
  ProFormText,
  ProFormDatePicker,
  ProFormTextArea,  
  ModalForm, 
} from '@ant-design/pro-components';
import { Button, message, Modal,  Space  } from 'antd';
import { useForm } from 'antd/lib/form/Form';
import { simpleRequestActions } from '@/services/model'; 
import { OpenEssDataItem} from '../data_ess';
import { ServicesEss } from '../service_ess_tran';  
import { useEffect } from 'react';
 
interface Props {
  open?: boolean;
  onOpenModalChange: (v: boolean) => void;
  refreshTable: () => void;
  data:OpenEssDataItem;
}

export default ({ open, onOpenModalChange, refreshTable,data}: Props) => {
  const requestActions = simpleRequestActions();
  const [formSubmittor] = useForm<OpenEssDataItem>();
  const onSaveHandler = async (status: string) => {
    try {
      const formData = await formSubmittor.validateFields();    
      const dataV = {id:data.id||-1,...formData} as OpenEssDataItem 
      Modal.confirm({
        title:'New Open',
        content:'Are you to create new open?',
        onOk: async () => {
          await ServicesEss.saveOpenAnnounce(dataV)(requestActions).then(it=>{
            message.success('create successfully.');
            onOpenModalChange?.(false); 
            refreshTable();
          }) 
        }
      })         
      
    }catch(error: any){
      message.error(error.message || 'Failed to save')
      refreshTable();
    }
  };
 
  useEffect(() => {
      initData()
  }, [data])
  const initData = async () => {
    formSubmittor.setFieldsValue(data);
  }
  return (
    <ModalForm
      modalProps={{
        maskClosable: false,
      }}
      form={formSubmittor}
      open={open}
      width={'30%'}
      title={<div>New Announment ESS</div>}
      submitter={{
        searchConfig: {
          submitText: 'Submit',
        },
        render: (_, defaultDoms) => {
          return [
            defaultDoms[0],
            ( 
              <Button
                key="save_draft"
                onClick={() => {
                  onSaveHandler('SUBMITTING');
                }}
              >
                Create Announce 
              </Button>
            ), 
          ];
        },
      }}
      onFinish={() => onSaveHandler('SUBMITTED')}
      onOpenChange={(visible) => !visible && onOpenModalChange?.(visible)}
    >
      <Space direction="vertical" style={{ width: '100%' }}>
        <ProCard size="small" bordered headerBordered>
          <Space direction="vertical" style={{ width: '100%' }}>
            <ProFormText name = "openTitle" /*fieldProps={{ style: { height:'50px',fontSize:'24px' }}} */label = {<div><strong>Title</strong></div>} /> 
            {/* <ProFormSelect
              rules={[{ required: true }]} 
              label="Department" 
              name={'department'}
              // options={lookupList.filter(it => it.type == 'CONTACT_TYPE').map(it => ({ label: it.name, value: it.id }))}
            /> */}
            <Space direction="horizontal" style={{ width: '100%' }}>
              <ProFormDatePicker name = "startDate" /*fieldProps={{ style: { height:'50px',fontSize:'24px' }}}*/ label = {<div><strong>Started Date</strong></div>} />            
              <ProFormDatePicker name = "endDate" /*fieldProps={{ style: { height:'50px',fontSize:'24px' }}}*/ label = {<div><strong>Ended Date</strong></div>} /> 
            </Space> 
            <ProFormTextArea name = "description" /*fieldProps={{ style: { height:'50px',fontSize:'24px' }}}*/ label = {<div><strong>Description</strong></div>} />  
          </Space>
        </ProCard>
      </Space>
    </ModalForm>
  );
};
