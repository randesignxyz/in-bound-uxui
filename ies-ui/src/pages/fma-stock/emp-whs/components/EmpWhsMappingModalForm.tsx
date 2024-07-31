import {
    DrawerForm,
    ModalFormProps,
    ProFormCheckbox,
    ProFormSelect,
    ProFormText,
    ProList,
  } from '@ant-design/pro-components';
import { useForm } from 'antd/lib/form/Form';
import { EmployeeList, EmpWhsMappingDetail, SaveEmpWarehouseMappingData, SearchEmpParams, UoM, WarehouseList } from "../data.types";
import { Button, Descriptions, List, Modal, Space, Spin, Typography, message } from "antd";
import { simpleRequestActions } from "@/services/model";
import { createService } from "../services";
import { createService as createSrv } from "../../request/services";
import { useEffect, useState } from 'react';
import { ItemGroupListItem } from '../../request/data.types';
import { DeleteOutlined, UserAddOutlined } from '@ant-design/icons';
import EmpSearchModal from './EmpSearchModal';
import { FetchPagingParams } from '@/components/DataCrud/TableView';
import { Page } from '@/services/shared/data';

export default ({type, itemId, onRefresh,...rest}: ModalFormProps<SaveEmpWarehouseMappingData> & {type: 'ADD'|'EDIT',itemId?:number, onRefresh?: () => void } ) => {
    const [form] = useForm<SaveEmpWarehouseMappingData >();
    const [title, setTitle] = useState<string>('New mapping employee with warehouse')
    const requestActions = simpleRequestActions();
    const services = createService(requestActions);
    const srv = createSrv(requestActions)
    const readonly = type=='EDIT'?true:false
    const [modalVisible, setModalVisible] = useState<{ type: 'ADD', id?: number , cb?: () => void } | {type: 'EDIT', id?: number, cb?:() => void  }>()
    const [emps, setEmps] = useState<Page<EmployeeList>>()
    const [selectedEmp, setSelectedEmp] = useState<EmpWhsMappingDetail>()
    const [warehouse, setWarhouse] = useState<WarehouseList[]>()
    const [whsMapping, setWhsMapping] = useState<WarehouseList[]>([])
   
    useEffect(()=>{
        type=='EDIT'?services.fetchItem(itemId||0).then(rs=> {
            setTitle(type=='EDIT'?'Edit - ' + rs.empNo:'New mapping employee with warehouse')
            form.setFieldValue('isActiveY',rs.isActiveY)
            // form.setFieldValue('groupId',rs?.itemGroup?.id)
            setSelectedEmp(rs)
            setWhsMapping(rs.whsList)
            console.log('mapping employee with warehouse',rs)
        }):form.setFieldValue('isActiveY',true)       
        services.fetchWarehouseList().then(rs=>{
            setWarhouse(rs)
        })
    },[type])
    const onSaveHandler = async () =>{      
        const formData = await form.validateFields(); 
        if(whsMapping.length== 0){
            message.error('Mapping list is no data, please add some warehouses.');
            return
        }
        const data={
            id: itemId||0,
            empId: selectedEmp?.id,
            empNo: selectedEmp?.empNo,
            active: formData.isActiveY?'Y':'N',
            whsList: whsMapping.map(r=> r.code)
            
        } as SaveEmpWarehouseMappingData
        Modal.confirm({
            title: title,
            content: 'Are you sure to save.',
            onOk: async () => {
                try {
                    services.checkEmpNoWhsMapping(data.empNo).then(rs=> {
                        if(rs.empNo == data.empNo && type=='ADD'){
                            message.error(`Emp NO ${data.empNo} already existed.`);
                            return
                        }
                        try {
                            services.saveEmpWhsMapping(data).then(it=>{
                                message.success('Saved successfully.');
                                onRefresh?.()
                            }) 
                        } catch (error) {
                            message.error('Failed to save.');
                        }
                    })
                    
                } catch (error:any) {
                    message.error('Failed to save.');
                }
            },
        });
    }
    const onAddEmp=()=>{
        setModalVisible({type: 'ADD',cb:()=>{ setModalVisible(undefined)}})
    }
     const onAssign=(emp: EmployeeList)=>{
        console.log('onAssign', emp)
        setSelectedEmp({
            id: emp.id,
            empNo: emp.employeeCode,
            empId: emp.id,
            firstName: emp.firstName,
            lastName: emp.lastName,
            internalName: emp.employeeLocalName
        } as EmpWhsMappingDetail)
        form.setFieldValue('empNo',emp.employeeCode)
        setModalVisible(undefined)

    }
    const onSearchEmp=(value?: string) => {        
        const data = {
            keywords: value,
            criteria: {
                searchValue: value
            },            
            pagination: {
                pageSize: 20,
                current: 0
            }
        } as FetchPagingParams<SearchEmpParams>
        services.fetchPagingEmp(data).then(rs => {           
            setEmps(rs)
        })
    }
    // const cols = ():ProColumns<{code:string,name: string}>[]=>
    //      ([{
    //         title:'',
    //         dataIndex:'code',
    //         render:(_, r)=> r. 
    //     }])
    
    return<>
        <DrawerForm<SaveEmpWarehouseMappingData> 
                form={form} title={title}
                {...rest} 
                onFinish={onSaveHandler} 
                loading={requestActions.request?.loading||false}
            >
            <Spin spinning={requestActions.request?.loading || false}>
                <Space direction='horizontal' style={{width:'100%'}}>
                    {!readonly && <ProFormText disabled={true}  label='Emp No' name={'empNo'} style={{width:'80%'}} rules={[{ required: true }]} readonly={readonly}/>}
                    {!readonly &&<Button onClick={onAddEmp} style={{marginTop:10}}  icon={<UserAddOutlined />} />}
                </Space> 
                <Descriptions>
                    <Descriptions.Item label="Local Name">{selectedEmp?.internalName}</Descriptions.Item>
                    <Descriptions.Item label="Fiest Name">{selectedEmp?.firstName}</Descriptions.Item>
                    <Descriptions.Item label="Last Name">{selectedEmp?.lastName}</Descriptions.Item>                    
                    {/* <Descriptions.Item label="BU">{selectedEmp?.bu}</Descriptions.Item>
                    <Descriptions.Item label="Job Title" span={2}>{selectedEmp?.jobTitle}</Descriptions.Item>
                    <Descriptions.Item label="Department">{selectedEmp?.department}</Descriptions.Item> */}
                </Descriptions>
                {/* <Card title='Warehouse Mapping'> */}
                    <Space direction='vertical' style={{width:'100%'}}>
                        {warehouse && <ProFormSelect 
                            showSearch
                            allowClear
                            label="Warehouse List" 
                            name="warehouseCode"
                            
                            options={warehouse?.filter(r=> !whsMapping.find(w=> w.code==r.code)).map(r=> ({value: r.code, label: r.code}))}
                            onChange={(value: string)=> { 
                                if(value){
                                    const whs = warehouse.find(r=> r.code===value)
                                    whs&&setWhsMapping((v) => [...v, whs]) 
                                    form.setFieldValue('warehouseCode',"")
                                }
                            }}
                            
                        />}
                        
                        {whsMapping&&<ProList cardProps={{title:'Mapping List', bordered:true, headerBordered: true}}
                            dataSource={whsMapping}
                            // columns={cols()}
                            renderItem={item => (
                                <List.Item actions={[<Button size='small' danger onClick = {() =>setWhsMapping((v) => v.filter(r=> r.code!= item.code))  } type='link' icon={<DeleteOutlined/>} />]}>
                                    <List.Item.Meta
                                        title={
                                            <Space>
                                                <Typography.Text strong >{[item.code, item.name, ].filter(it => it).join(": ")}</Typography.Text>
                                            </Space>
                                        }
                                        description={
                                            <div>{item.build}</div>
                                        }
                                    />
                                </List.Item>
                            )}
                        />}
                    </Space>
                {/* </Card> */}
                
                <ProFormCheckbox  name='isActiveY'>Active</ProFormCheckbox>
            </Spin>
        </DrawerForm>
        {modalVisible?.type && <EmpSearchModal onAssign={onAssign} loading={requestActions.request?.loading} onSearch={onSearchEmp} data={emps} open = {true} onOpenChange = {(v:boolean) => !v && setModalVisible(undefined)}/>}
    </>
}