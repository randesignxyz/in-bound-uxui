import { ActionDataFormProps } from '@/pages/process-flow/data';
import ActionFormWrapper from '@/pages/process-flow/components/forms/ActionFormWrapper';
import { ActionType, EditableFormInstance, EditableProTable, ProForm, ProFormSelect, ProFormText, ProFormTextArea } from '@ant-design/pro-components';
import { EmpWarehouseList, AdjRequestDetailResponse, AdjRequestItemDetailResponse, AdjRequestItemPayload } from '../data.types';
import { simpleRequestActions } from '@/services/model';
import { createService } from '../services';
import { useEffect, useRef, useState } from 'react';
import { Card, Col, InputNumber, Modal, Row, Table, UploadFile, message } from 'antd';
import { uniqueId } from 'lodash';
import { useForm } from 'antd/es/form/Form';
import { TaskActionDataParam } from '@/services/process-workflow/params';
import { formatDate, formatter } from '@/pages/utils';
import AddItem from '@/pages/pro/quotation/AddItem';
import { BudgetCodeListItem } from '@/services/pro/data';
import { RequisitionServiceAPI } from '@/services/pro/services';


export default (props: ActionDataFormProps) => {

    const requestActions = simpleRequestActions();
    const services = createService(requestActions);
    // const proServices = RequisitionServiceAPI(requestActions);
    const actionRef = useRef<ActionType>();
    const [files, setFiles] = useState<UploadFile[]>([])
    const [dataItems, setDataItems] = useState<AdjRequestItemDetailResponse[]>()
    const editableFormRef = useRef<EditableFormInstance>();
    const [budgetCodeList, setBudgetCodesList] = useState<BudgetCodeListItem[]>([]);
    
    
    const [form] = useForm<{
        comment?: string;
        warehouseFrom?: string;
    }>();

    useEffect(()=>{
        loadData()
        setFiles([])       
    },[])

    const loadData = async () => {
        const rs = await services.detailByProcessFlow(props.procInstId||'')
        const ds = rs.items.map(v=> ({...v,key: uniqueId().toString()}))
        setDataItems(ds)
        await services.listBudgetCode().then(budgetCodes => setBudgetCodesList(budgetCodes)); 
    }

    return (
        <ActionFormWrapper
           title="Finance Review"
            {...props}
            width={'1350px'}
            actionHandlers= {{...props.actionHandlers,
                onCompleted: async ()=> {
                    await editableFormRef.current?.validateFields()
                    if(!props.activityData?.taskId) {
                        message.error("Task Id is not found")
                        return
                    }
                    const dataForm = await form.validateFields()
                    const saveItems = dataItems?.map(v => ({id:v.id, itemId: v.itemId, budgetCode: v.budgetCode,itemCost: v.itemCost, qty: v.qty} as AdjRequestItemPayload))  
                    const data = {   
                        processInstId:  props.activityData?.procInstId,                  
                        taskId: props.activityData?.taskId || '',
                        actionName: props.action,
                        comment: dataForm.comment, 
                        payload: {items:saveItems||[]},                     
                        fileIds: files.map(it=> it.response)
                    } as (TaskActionDataParam<{items:AdjRequestItemPayload[]}> & {processInstId: string, warehouseFrom?: string})
                    Modal.confirm({
                        title: 'Adjustment Request',
                        content: 'Are you sure?',
                        onOk: async() => {
                          try {
                            await services.updateAdj(data).then(it=> {
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
                <Card >  
                    {/* <Row >
                        <Col flex={'250px'}  style={{paddingRight: 25}}>
                            <ProFormSelect                               
                                options={warehouse.map(i=>({label:i.warehouseCode, value: i.warehouseCode}))}
                                rules={[{ required: true, whitespace: true }]}
                                label="From Warehouse"
                                name={'warehouseFrom'}
                            />           
                        </Col>
                        <Col flex={'250px'}>
                            {data?.warehouseTo&&<ProFormText initialValue={data?.warehouseTo} label='To Warehouse' name={'warehouseTo'}  readonly={false}/>}
                        </Col>
                    </Row>  */}
                    
                    {budgetCodeList && <EditableProTable<AdjRequestItemDetailResponse>   
                        formRef={editableFormRef}
                        editableFormRef={editableFormRef}                   
                        rowKey="key"
                        size='small'
                        // cardProps = {false}
                        recordCreatorProps = {false}
                        value={dataItems}
                        editable={{
                            type: 'multiple',
                            editableKeys: dataItems?.map(it => it.key),
                            onValuesChange: (_, recordList) => {
                                setDataItems(
                                    recordList.map(it=> it)
                                );
                            },
                        }}
                        columns={[
                            { title: 'No', width: 50, editable: false, render: (_, __, index) => index + 1 },
                            { title: 'Item Code', width: 100, editable: false, dataIndex: 'itemCode' },
                            { title: 'Item Name', editable: false, dataIndex: 'itemName' },
                            {
                                title: 'Request Type',
                                width: 110,
                                editable: false,
                                dataIndex:'requestType'
                    
                            },
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
                    
                            },{
                                title:'BudgetCode',
                                // editable: false,
                                dataIndex:'budgetCode',
                                // fieldProps: { showSearch: true },
                                valueType: 'select',
                                valueEnum: (r) => budgetCodeList.filter(it=> it.code!=r.budgetCode).reduce((acc, cur) => ({ ...acc, [cur.code]: cur.code }), {})     
                                // request: async (_, r: any) => {
                                //     return budgetCodeList.map((it) => ({ label: it.code, value: it.code }));
                                // },
                            },
                            {
                                title: 'Item Cost',
                                width: 110,
                                align: 'right',
                                // editable: false,
                                valueType: 'money',                
                                formItemProps: {rules: [{ required: true}], },
                                fieldProps: { style: { width: 80 }, min: 1},
                                dataIndex:'itemCost',
                                // render: (_, r) => formatter.format(r.qty)
                                renderFormItem(_, config, form) {
                                    return <InputNumber
                                        onChange={(e:any) => { 
                                            setDataItems(
                                                dataItems?.map(it=> {
                                                    if(it.key==config.record?.key ){
                                                        return {...it, itemCost: e }
                                                    }

                                                    return it

                                                })
                                            )

                                        }}
                                    />
                                }
                    
                            },
                            {
                                title: 'Amout',
                                width: 110,
                                align: 'right',
                                editable: false,
                                valueType: 'digit',                
                                formItemProps: {rules: [{ required: true}] },
                                dataIndex:'amount',
                                render: (_, r) => formatter.format((r.qty<0?-1:1)*(r.qty*r.itemCost))
                    
                            },
                            {
                                title:'Remarks',
                                editable: false,
                                dataIndex:'remarks'
                    
                            }
                        ]}
                        summary={(data) => {
                            var totalAmount = 0
                            dataItems?.forEach((it) => {
                                totalAmount += (it.qty<0?-1:1)*(it.qty*it.itemCost)
                            })
                            return (
                              <Table.Summary.Row style={{ textAlign: 'right', fontWeight: 'bold' }}>
                                <Table.Summary.Cell colSpan={8} index={8}>
                                  {'Total Amount'}
                                </Table.Summary.Cell>
                                <Table.Summary.Cell colSpan={1} index={9} align="right">
                                  {formatter.format(totalAmount || 0)}
                                </Table.Summary.Cell>
                              </Table.Summary.Row>
                            );
                          }}
                    />}
                </Card>
                <Card style={{ marginTop: 10, marginBottom: 10 }}>
                    <ProFormTextArea rules={[{required: props.action =='Rejected'}]} label="Comment" name="comment" />
                </Card>
            </ProForm>
        </ActionFormWrapper>
    )

}