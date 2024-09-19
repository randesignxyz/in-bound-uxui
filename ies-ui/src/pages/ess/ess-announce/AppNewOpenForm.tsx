import { 
  ProCard,
  ProFormText,
  ProFormDatePicker,
  ProFormTextArea,  
  ModalForm,
  ProForm, 
  ProFormDateRangePicker
} from '@ant-design/pro-components';
import { Button, message, Modal,  Space  } from 'antd'; 
import { simpleRequestActions } from '@/services/model'; 
import { OpenEssDataItem} from '../data_ess';
import { ServicesEss } from '../service_ess_tran';  
import { useEffect } from 'react';
import moment from 'moment';
 
interface Props {
  open?: boolean;
  onOpenModalChange: (v: boolean) => void;
  refreshTable: () => void;
  data:OpenEssDataItem;
}

export default ({ open, onOpenModalChange, refreshTable,data}: Props) => {
  const requestActions = simpleRequestActions();
  const [formSubmittor] = ProForm.useForm<OpenEssDataItem>();
  const onSaveHandler = async (status: string) => {
    try { 
      const formData = await formSubmittor.validateFields();    
          
      var startDate = formData.annountmentDate[0];
      var endDate = formData.annountmentDate[1];

      formData.startDate = startDate;
      formData.endDate = endDate; 

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
    var dataRange= [data.startDate,data.endDate];
    formSubmittor.setFieldsValue({...data,annountmentDate:dataRange});
  }
  return (
    <ModalForm
      modalProps={{
        maskClosable: false,
      }}
      form={formSubmittor}
      open={open}
      width={'30%'}
      title={data!=null?<div>Edit Announment ESS</div>:<div>New Announment ESS</div>}
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
            <ProFormText name = "openTitle" rules={[{ required: true }]} placeholder={"Title"} label = {<div><strong>Title</strong></div>} /> 
            {/* <ProFormSelect
              rules={[{ required: true }]} 
              label="Department" 
              name={'department'}
              // options={lookupList.filter(it => it.type == 'CONTACT_TYPE').map(it => ({ label: it.name, value: it.id }))}
            /> */}
            <Space direction="horizontal" style={{ width: '100%' }}>
              {/* <ProFormDatePicker name = "startDate" rules={[{ required: true }]}  label = {<div><strong>Start Date</strong></div>} />            
              <ProFormDatePicker name = "endDate" rules={[{ required: true }]}  label = {<div><strong>End Date</strong></div>} />  */}
              
              <ProFormDateRangePicker label="Date" name={"annountmentDate"} rules={[{ required: true }]} />
            </Space> 
            <ProFormTextArea name = "description" rules={[{ required: true }]}  label = {<div><strong>Description</strong></div>} />  
          </Space>
        </ProCard>
      </Space>
    </ModalForm>
  );
};
