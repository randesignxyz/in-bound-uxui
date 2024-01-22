import ActionFormWrapper from '@/pages/process-flow/components/forms/ActionFormWrapper';
import { ActionDataFormProps } from '@/pages/process-flow/data';
import { simpleRequestActions } from '@/services/model';
import { Incident, IncidentDetailResponse } from '@/services/ict/data';
import { IncidentServiceAPI } from '@/services/ict/services';
import ProForm, {
  ProFormTextArea,
} from '@ant-design/pro-form';
import { Card, Col, message, Modal, Row } from 'antd';
import { useForm } from 'antd/lib/form/Form';
import { UploadFile } from 'antd/lib/upload/interface';
import { useEffect, useState } from 'react';

export default (props: ActionDataFormProps) => {
  const requestActions = simpleRequestActions();
  // const access = useAccess();
  const services = IncidentServiceAPI(requestActions);
  // const workflowSerivce = WorkflowServiceAPI(requestActions);
  // const [isAnalyst, setAnalyst] = useState<boolean>(false);
 
  // const [requestor, setRequestor] = useState<UserResult>();
  
  const [incident, setIncident] = useState<IncidentDetailResponse>();
  
  const [files, setFiles] = useState<UploadFile[]>([])
  
  const [form] = useForm<Incident>();
  

  useEffect(() => {
    if (!props.visible) return;
    loadData();
    return ()=> {
      form.resetFields()
      setFiles([])
    }
  }, [props.visible]);


  const loadData = async () => {
    try {
      if (!props.activityData?.procInstId) return;  
      const data = await services.detailByProcessFlow(
        props.activityData?.procInstId,
      );

      // setAnalyst(access.isAnalystIncidentTicket);

      
      // const userResult = await workflowSerivce.findUser({id: data.requestedBy});
      // setRequestor(userResult);
      

      setIncident(data);

      form.setFieldsValue({
        ...data
      });
    } catch (error: any) {
      message.error(error?.message || 'Failed to fetchdata');
    }
  };

  return (
    <ActionFormWrapper
      title="Incident Ticket - On Confirmation"
      {...props}
      loading={requestActions.request?.loading}
      width={'1230px'}
      actionHandlers= {{...props.actionHandlers, 
        onCompleted: async ()=> {

          if(!incident) return
          if(!props.activityData?.taskId) {
            message.error("Task Id is not found")
            return
          }
          const dataForm = await form.validateFields()

          Modal.confirm({
            title: 'Requestor Confirmation',
            content: 'Are you sure?',
            onOk: async() => {
              try {
                await services.requestorConfirm({
                  taskId: props.activityData?.taskId || '',
                  actionName: props.action,
                  comment: form.getFieldValue('comment') ?? null,
                  payload: {
                    id: incident?.id || 0,
                    ...dataForm,
                    assignedTo: null,
                    status: props.action=='Confirmed' ? 'CLOSED' : 'REJECTED',
                    location: null,
                    company: null,
                  },
                  fileIds: files.filter(f=> f.status !== 'error').map(it=> it.response)
                })
                props.actionHandlers?.onCancel?.(true)
              } catch (error: any) {
                message.error(error?.message || 'Failed to submit.')
              }
            }
          })

        },
        onAddFile: file => setFiles(v=> ([...v, file])),
        onRemoveFile: file => setFiles(v=> v.filter(it=> it.uid !== file.uid)),
        onReset: ()=> {
          
            setFiles([])
        }
      }}
    >
      
      <ProForm 
      form={form} 
      submitter={false}
      autoFocusFirstInput
      >
      
        <Card title="" size="small" style={{ marginTop: '10px', marginBottom:"10px" }}>
         
          <Row gutter={20}>
                  <Col flex="auto">
                <ProFormTextArea rules={[{required: true}]} label="Comment" name={'comment'} />
                
              </Col>
          </Row>
        </Card>        
       </ProForm>  
             
    </ActionFormWrapper>
  );
};
