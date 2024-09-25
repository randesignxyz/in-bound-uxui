import { 
  ProCard,
  ProFormText,
  ProFormDatePicker,
  ProFormTextArea,  
  ModalForm,
  ProFormCheckbox,
  ProFormDigit,
  ProFormDateTimePicker,
  ProFormDateTimeRangePicker, 
} from '@ant-design/pro-components';
import { Button, Col, message, Modal,  Row,  Space, Typography  } from 'antd';
import { useForm } from 'antd/lib/form/Form';
import { simpleRequestActions } from '@/services/model'; 
import { OpenEssDataItem} from '../data_ft';
import { ServicesEss } from '../service_ft_tran';  
import { useEffect } from 'react';
import { IssuesCloseOutlined, CarOutlined, HistoryOutlined, EditOutlined, RedoOutlined, HighlightOutlined, UserOutlined } from "@ant-design/icons";
 
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
      width={'60%'}
      title={data!=null?<div><CarOutlined /> EDIT REQUEST CAR</div>:<div><CarOutlined /> NEW REQUEST CAR</div>}
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
        
        <div style={{marginTop:'10px'}}><Typography.Title level={5}><UserOutlined /> REQUESTER</Typography.Title></div>
        <ProCard bordered style={{backgroundColor:'#f5f5f5'}}>
          <Row>
              <Col span={6} style={{padding:'3px'}}>
                  <ProFormText label="Emp No" name={'requesterId'} disabled/>
              </Col>                  
              <Col span={6} style={{padding:'3px'}}>
                  <ProFormText label="Name" name={'requesterId'} disabled/>
              </Col>            
              <Col span={6} style={{padding:'3px'}}>  
                  <ProFormText label="Business Unit" name={'requesterName'} disabled/>
              </Col>                             
              <Col span={6} style={{padding:'3px'}}>  
                  <ProFormText label="Email" name={'requesterEmail'} disabled/>
              </Col>      
          </Row>

        </ProCard>
        
        <div style={{marginTop:'10px'}}><Typography.Title level={5}><UserOutlined /> DRIVER INFORMATION</Typography.Title></div>
        <ProCard size="small" bordered headerBordered>
          <Row>
              <Col span={8} style={{padding:'3px'}}>
                  <ProFormText label="Driver Emp ID" name={'driverId'}  rules={[{ required: true }]}/>
              </Col>                       
              <Col span={8} style={{padding:'3px'}}>  
                  <ProFormText label="Driver Name" name={'driverName'} disabled/>
              </Col>                           
              <Col span={8} style={{padding:'3px'}}>  
                  <ProFormText label="Gender" name={'gener'} disabled/>
              </Col>     
          </Row>
          <Row>
              <Col span={8} style={{padding:'3px'}}>
                  <ProFormText label="Email" name={'personalEmail'} disabled/>
              </Col>                       
              <Col span={8} style={{padding:'3px'}}>  
                  <ProFormText label="Approval Email" name={'approvalEmail'} disabled/>
              </Col>                           
              <Col span={8} style={{padding:'3px'}}>  
                  <ProFormText label="Phone Number" name={'phoneNumber'} disabled/>
              </Col>     
          </Row>
          <Row>
              <Col span={8} style={{padding:'3px'}}>
                  <ProFormText label="Company Name" name={'companyName'} disabled/>
              </Col>                       
              <Col span={8} style={{padding:'3px'}}>  
                  <ProFormText label="Department" name={'department'} disabled/>
              </Col>     
          </Row>
          <Row>           
              <Col span={8} style={{padding:'3px'}}>  
                  <ProFormText label="Driving License No" name={'drivingLicense'}  rules={[{ required: true }]}/>
              </Col>                          
              <Col span={8} style={{padding:'3px'}}>  
                  {/* checking if license is expiry */}
                  <ProFormDatePicker label="Expiry Date" name={'licenseExpiryDate'}  rules={[{ required: true }]}/>
              </Col>      
          </Row>
        </ProCard>
        
        <div style={{marginTop:'10px'}}><Typography.Title level={5}><HighlightOutlined /> INFORMATION</Typography.Title></div>
        <ProCard size="small" bordered headerBordered>
          <Row>
              <Col span={24} style={{padding:'3px'}}>
                  <ProFormText label="Destination" name={'destination'}  rules={[{ required: true }]}/>
              </Col>      
          </Row>
          <Row>                   
              <Col span={24} style={{padding:'3px'}}>  
                  <ProFormTextArea label="Purpose" name={'purpose'}  rules={[{ required: true }]}/>
              </Col>    
          </Row>
          <Row>
              <Col span={24} style={{padding:'3px'}}>
                  <ProFormDateTimeRangePicker  label="Request Date" name={'requestDate'} rules={[{ required: true}]} />
              </Col>      
          </Row> 
          <Row>
              <Col span={6} style={{padding:'3px'}}>
                  <ProFormDigit label="Number of Person" name={'numberPerson'}  rules={[{ required: true }]}/>
              </Col>                          
              <Col span={6} style={{padding:'3px'}}>  
                  <ProFormDigit label="Estimated.Km" name={'estimatKh'}  rules={[{ required: true }]}/>
              </Col>                      
              <Col span={6} style={{padding:'3px'}}>   
                  <ProFormCheckbox label="Need To Transport Stuff" name={"marriedWith"} placeholder={"Need To Transport Stuff"}/>
              </Col>      
          </Row> 
        </ProCard>
      </Space>
    </ModalForm>
  );
};
