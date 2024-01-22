import ActionFormWrapper from '@/pages/process-flow/components/forms/ActionFormWrapper';
import { ActionDataFormProps } from '@/pages/process-flow/data';

import { simpleRequestActions } from '@/services/model';
import { Category, Incident, IncidentDetailResponse, PriorityMatrix, Workgroup } from '@/services/ict/data';
import { IncidentServiceAPI } from '@/services/ict/services';
import ProForm, {
  ProFormSelect,
  ProFormTextArea,
} from '@ant-design/pro-form';
import { Card, Col, message, Modal, Row } from 'antd';
import { useForm } from 'antd/lib/form/Form';
import { UploadFile } from 'antd/lib/upload/interface';
import { useEffect, useState } from 'react';
import { LookupData, LookupDataType } from '@/services/data';

export default (props: ActionDataFormProps) => {
  const requestActions = simpleRequestActions();
  
  const services = IncidentServiceAPI(requestActions);
  // const workflowSerivce = WorkflowServiceAPI(requestActions);
  // const [isAnalyst, setAnalyst] = useState<boolean>(true);
  
  // const [requestor, setRequestor] = useState<UserResult>();
  
  const [lookupList, setLookupList] = useState<LookupData[]>([]);
  
  const [allCategoryList, setAllCategoryList] = useState<Category[]>([]);
  const [classificationList, setClassificationList] = useState<Category[]>([]);
  const [categoryList, setCategoryList] = useState<Category[]>([]);
  
  const [workgroupList, setWorkgroupList] = useState<Workgroup[]>([]);
  
  const [priorityMatrixList, setPriorityMatrixList] = useState<PriorityMatrix[]>([]);
  // const [workgroupCategory, setWorkgroupCategory] = useState<WorkgroupCategory[]>([]);

  
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

      // const userResult = await workflowSerivce.findUser({id: data.requestedBy});
      // setRequestor(userResult);
      
      const priorityMatrixs = await services.listPriorityMatrix();
      setPriorityMatrixList(priorityMatrixs);

      const lookupTypes: LookupDataType[] = ['URGENCY', 'IMPACT', 'PRIORITY', 'SOURCE'];
      const lookupDataList = await services.listLookup(lookupTypes);
      setLookupList(lookupDataList);

      const workgroupCategories = await services.listWorkgroupCategory();
      // setWorkgroupCategory(workgroupCategories);

      const allCategories = await services.listAllCategories();
      setAllCategoryList(allCategories);

      // setClassificationList(allCategories.filter(f => f?.parentId === null));

      setClassificationList(allCategories.filter(f => f.parentId === null && workgroupCategories.filter(ff => ff.workgroupId === data.workgroupId??0).map(m => m.categoryId).includes(f.id)));

      // setCategoryList(allCategories.filter(f => f?.parentId !== null));
      setCategoryList(allCategories.filter(it => data.classificationId??0 === it.parentId));
      

      const workgroups = await services.listWorkgroup();
      setWorkgroupList(workgroups);

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
      title="Incident Ticket - On Hold"
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
            title: 'Suspend the ticket',
            content: 'Are you sure?',
            onOk: async() => {
              try {
                await services.suspendTicket({
                  taskId: props.activityData?.taskId || '',
                  actionName: props.action,
                  comment: form.getFieldValue('onHoldReason') ?? null,
                  payload: {
                    id: incident?.id || 0,
                    ...dataForm,
                    assignedTo: null,
                    status: 'ON_HOLD',
                    company: null,
                    location: null,
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
      title='Incident Ticket - On Hold'
      form={form} 
      submitter={false}
      autoFocusFirstInput  
      onValuesChange={(changeValue, values) => {
        const {urgencyId, impactId, classificationId } = changeValue;
         if ('classificationId' in changeValue) {
          setCategoryList(allCategoryList.filter(it => classificationId === it.parentId));
        }

        
        if('urgencyId' in changeValue
        || 'impactId' in changeValue){

          const urgency = 'urgencyId' in changeValue?urgencyId:values.urgencyId
          const impact = 'impactId' in changeValue?impactId:values.impactId

          const priorityMatrixFilter = priorityMatrixList.find(f => f.urgencyId === urgency && f.impactId === impact)
          const priorityId = priorityMatrixFilter?.priorityId
         
          form.setFieldsValue({priorityId})
        }
      }}    
      >
      
        <Card title="" size="small" style={{ marginTop: '10px', marginBottom:"10px" }}>
        <Row gutter={20}>
            <Col flex="250">
              <ProFormSelect rules={[{required: true}]} name='urgencyId' label='Urgency' 
              options={lookupList?.filter(it => it.type === 'URGENCY').map(it => {
                return { value: it.id, label: it.name }
            })}  />
            </Col>
            <Col flex="250">
            <ProFormSelect rules={[{required: true}]} name='impactId' label='Impact' options={lookupList?.filter(it => it.type === 'IMPACT').map(it => {
                return { value: it.id, label: it.name }
            })}  />
            </Col>
            <Col flex="250">
            
            <ProFormSelect name="priorityId" label="Priority" rules={[{required: true}]} readonly={true}  disabled={false} options={lookupList?.filter(it => it.type === 'PRIORITY').map(it => {
                return { value: it.id, label: it.name }
            })}  />
              
              
            </Col>
            </Row>
            <Row gutter={20}>
            <Col flex="250" >
            <ProFormSelect rules={[{required: true}]} readonly={true}  disabled={false} name='workgroupId' label='Sub Function' 
                options={workgroupList.map(it => {return {value: it.id, label: it.name}})} />
            </Col>
            <Col flex="250">
              <ProFormSelect rules={[{required: true}]} name='classificationId' label='Classification' 
              options={classificationList.map(it => {
                return {value: it.id, label: it.name}
              })} />
             
             
            </Col>
            
            <Col flex="250">
            
                        <ProFormSelect rules={[{required: true}]} name='categoryId' label='Category' 
                        options={categoryList.map(it => {return {value: it.id, label: it.name}})} />
                        
             
            </Col>
            
            
            </Row>
            
          <Row gutter={20}>
                  <Col flex="auto">
                
                <ProFormTextArea rules={[{required: true}]} label="Reason" name={'onHoldReason'} />
                
              </Col>
          </Row>
        </Card>        
       </ProForm>  
             
    </ActionFormWrapper>
  );
};
