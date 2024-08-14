import { ActionDataFormProps } from '@/pages/process-flow/data';
import ActionFormWrapper from '@/pages/process-flow/components/forms/ActionFormWrapper';
import { ActionType, EditableProTable, ProForm, ProFormTextArea } from '@ant-design/pro-components';
import { StockRequestItemDetailResponse } from '../data.types';
import { simpleRequestActions } from '@/services/model';
import { createService } from '../services';
import { useEffect, useRef, useState } from 'react';
import { Card, Modal, UploadFile, message } from 'antd';
import { uniqueId } from 'lodash';
import { useForm } from 'antd/es/form/Form';
import { TaskActionDataParam } from '@/services/process-workflow/params';
import { formatDate } from '@/pages/utils';


export default (props: ActionDataFormProps) => {

    const requestActions = simpleRequestActions();
    const services = createService(requestActions);
    const actionRef = useRef<ActionType>();
    const [files, setFiles] = useState<UploadFile[]>([])
    const [data, setData] = useState<StockRequestItemDetailResponse[]>()
    const [items, setItems] = useState<StockRequestItemDetailResponse[]>()
    const [form] = useForm<{
        comment?: string;
    }>();

    useEffect(()=>{
        loadData()
        setFiles([])       
    },[])

    const loadData = async () => {
        const rs = await services.detailByProcessFlow(props.procInstId||'')
        const ds = rs.items.map(v=> ({...v,key: uniqueId().toString()}))
        setData(ds)
    }

    return (
        <ActionFormWrapper
           title="Request Review"
            {...props}
            width={'1350px'}
            actionHandlers= {{...props.actionHandlers,
                onCompleted: async ()=> {
                    if(!props.activityData?.taskId) {
                        message.error("Task Id is not found")
                        return
                    }
                    const dataForm = await form.validateFields()
                    const saveItems = items?.map(v => ({id:v.id,stockRemarks: v.stockRemarks}))                   
                    const data = {                      
                        taskId: props.activityData?.taskId || '',
                        actionName: props.action,
                        comment: dataForm.comment,  
                        payload: {items:saveItems||[]},                     
                        fileIds: files.map(it=> it.response)
                    } as TaskActionDataParam<{items:{id: number, stockRemarks?: string}[]}>
                    console.log('save data: ', data)
                    Modal.confirm({
                        title: 'Request Review',
                        content: 'Are you sure?',
                        onOk: async() => {
                          try {
                           await services.updatStockRemarks(data).then(it=> {
                                actionRef.current?.reload()
                            })
                            props.actionHandlers?.onCancel?.(true)
                          } catch (error: any) {
                            message.error(error?.message || 'Failed to submit.')
                          }
                        }
                      })
                },
                onSetFiles: file => setFiles(v=> (file)),
                onRemoveFile: file => setFiles(v=> v.filter(it=> it.uid !== file.uid)),
                onReset: ()=> {
                  loadData()
                  form.setFieldsValue({
                      comment: undefined
                    })
                    setFiles([])
                }

            }}        
        >
            <ProForm form={form} submitter={false}>
                <Card>         
                    <EditableProTable<StockRequestItemDetailResponse>
                        rowKey="key"
                        size='small'
                        recordCreatorProps = {false}
                        value={data}
                        editable={{
                            type: 'multiple',
                            editableKeys: data?.map(it => it.key),
                            onValuesChange: (_, recordList) => {
                                console.log('recordList:  ',recordList)
                                setItems(recordList);
                            },
            
                        }}
                        columns={[
                            { title: 'No', width: 50, editable: false, render: (_, __, index) => index + 1 },
                            { title: 'Item Code', width: 100, editable: false, dataIndex: 'itemCode' },
                            { title: 'Item Name', editable: false, dataIndex: 'itemName' },
                            {
                                title: 'Quantity Requested',
                                width: 100,
                                editable: false,
                                align: 'right',
                                dataIndex:'qty'
                    
                            },
                            {
                                title:'UoM',
                                width: 80,
                                editable: false,
                                dataIndex:'uom'
                    
                            },/*
                            {
                                title: 'To be Returned in Full or Partial (F/P)',
                                width: 110,
                                editable: false,
                                dataIndex:'returnType'
                    
                            },
                            {
                                title: 'Expected Return Date',
                                width: 110,
                                editable: false,
                                dataIndex:'returnDate',
                                render: (_, r) => formatDate(r?.returnDate)
                    
                            },*/
                            {
                                title:'Remarks',
                                editable: false,
                                dataIndex:'remarks'
                    
                            },
                            {
                                title: 'Stock Comment',
                                valueType: 'textarea',
                                dataIndex: 'stockRemarks',
                                fieldProps: { rows: 1, maxLength: 200 },
                            }
                        ]}
                    />
                </Card>
                <Card style={{ marginTop: 10, marginBottom: 10 }}>
                    <ProFormTextArea rules={[{required: props.action =='Rejected'}]} label="Comment" name="comment" />
                </Card>
            </ProForm>
        </ActionFormWrapper>
        )

}