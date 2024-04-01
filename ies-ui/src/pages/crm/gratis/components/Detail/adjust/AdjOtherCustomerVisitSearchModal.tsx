import { ActionType, ModalForm, ModalFormProps, ProFormSelect, ProTable } from "@ant-design/pro-components";
import { AdjustCustomerVisitSchedule, AdjustInfoOn, AdjustItem, GratisSuggestedCustomerVisit, GratisVisitScheduleParams, ItemSAP } from "../../../types";
import {Button, Input, Space, Tooltip, message  } from "antd";
import { formatDate, toReadable } from "@/pages/utils";
import { useForm } from "antd/es/form/Form";
import { useEffect, useRef, useState } from "react";
import { GratisServices } from "../../../services";
import { simpleRequestActions } from "@/services/model";
import { EyeOutlined, MessageOutlined, SelectOutlined } from "@ant-design/icons";

interface Props extends ModalFormProps<{}> {
    gSettledId:number;
    verifyId: number;
    trigger?: JSX.Element;
    selectedItems?: AdjustCustomerVisitSchedule[];
    addHandler?:(item: AdjustCustomerVisitSchedule[], cb:(v: boolean)=>void)=>void;
    // onSave: (status: string ,remarks: string,adjItems: AdjustItem[], cb:(v: boolean)=>void) => void;
    customerCode?:string;  
}
const AdjOtherCustomerVisitSearchModal = ({gSettledId,verifyId,selectedItems,trigger, addHandler,  customerCode}:Props) => {
    const [form] = useForm<AdjustCustomerVisitSchedule>() 
    const actionRef = useRef<ActionType>();
    const actionCustVisitRef = useRef<ActionType>();
    const requestActions = simpleRequestActions() 
    // const [dataLookup, setDataLookup] = useState<AdjustInfoOn[]>()
    const [selectedFrom, setSelectedFrom] = useState<AdjustInfoOn>()
    const [selected, setSelected] = useState<AdjustCustomerVisitSchedule[]>()
    const [criteria, setCriteria] = useState<GratisVisitScheduleParams>()
    // useEffect(()=>{
    //     if(verifyId>0) loadData()
    // },[])
    // const loadData = async ()=>{
    //     // const rs = await GratisServices.gratisSaleOrderList(verifyId).query(requestActions)    
    //     // setDataLookup(rs)
    // }
    const onSearch=async (value:string)=>{
        try{
            form.validateFields()   
            setCriteria(v=> {
                return {...v,searchValue:value}
            })        
            actionCustVisitRef.current?.reload()
        }catch(ex){
            message.error('Not found')
        }
    }
    return(
        <ModalForm<AdjustCustomerVisitSchedule> width={'80%'}  layout="vertical"          
            form={form}                        
            trigger={trigger}    
            title= {`Find: Customer Visit Schedule | ${customerCode}`}
            modalProps={{
                maskClosable:false
            }}
            submitter={{
                searchConfig: {
                    submitText: 'Save',
                    resetText: 'Close'
                },
                render(_,defaultDoms) {
    
                    if (defaultDoms.length > 1) {
                        return [
                            defaultDoms[0],
                            (selected||[])?.length>0&&defaultDoms[1],
                        ]
                    }
                    else return defaultDoms
                },
            }}
            onFinish={async dataForm=>{
                // console.log('selected',selected)
                addHandler?.(selected||[],((va: Boolean)=>{
                    setSelected([])
                }))
                // setSearchData(v=> v?.filter((it:any)=> !!!selected?.find(i=>i.id===it.id)))
                setSelected([])
                return false
            }}           
            onValuesChange={(record:any, data:AdjustCustomerVisitSchedule)=> {
                // var dscription = record.dscription
                // if(dscription){
                //     setSelectedFrom(it=> dataLookup?.find(it=> it.dscription==dscription))
                // }           
            }}
        ><Space direction='vertical' style={{width: '100%'}} >
            
            <ProTable<GratisSuggestedCustomerVisit>   loading={requestActions.request?.loading} 
                size="small"
                actionRef = {actionCustVisitRef}
                search={false}
                bordered
                cardProps={false}
                options={{
                    fullScreen: false,
                    density: false,
                    reload: false,
                    setting: false
                }}       
                pagination={false}
                headerTitle={               
                    <Space>
                        {/* <ProFormSelect  width={220} allowClear={false}  rules={[{required:true, message:''  }]}  label='From'  name={'dscription'}
                            options={dataLookup?.map(it=> ({label: toReadable(it.dscription), value:it.dscription}))} /> */}
                        <Input.Search  loading={requestActions.request?.loading}  allowClear={true}  style={{marginTop:15}} onSearch={(value,_)=>onSearch(value)}/>
                    </Space>  
                }             
                columns={[
                    {
                        title: 'Schedule Date',
                        width: 130,
                        render: (_, r) => (
                        <Space size={1}>
                            <Tooltip title="View data in new browser tab.">
                            <Button
                                type="link"
                                size="small"
                                icon={<SelectOutlined />}
                                onClick={async () => {
                                window.open(`./../../visit-schedule/detail/${r.id}`, '_blank')?.focus();
                                }}
                            />
                            </Tooltip>    
                            {formatDate(r.scheduledDate)}               
                        </Space>
                        ),
                    },
                    { 
                        title: 'Schedule Type',
                        render:(_,r) => toReadable(r.scheduleType)
      
                    },
                    {
                        title: 'Salesperson',
                        render: (_, r) => r.salesperson
                    },
                    {
                        title: 'Contract No',
                        render:(_,r) =>  toReadable(r.contractNo)
                    },
                    {
                        title: 'Compliance Check',
                        render:(_,r) =>  toReadable(r.complianceStatus)
                    },
                    {
                      title: 'Contract No (Verified)',
                      render:(_,r) =>  toReadable(r.contractNo1)
                    },
                    {
                      title: 'Compliance Check (Updated)',
                      render:(_,r) =>  toReadable(r.complianceStatus1)
                    }, 
                    {
                      title: 'Status',
                      dataIndex: 'tranStatus',
                      render: (_, r) => r?.tranStatus||'Updated'
                    }                 
                ]}
                rowKey='id' 
                rowSelection={{
                    selections: ["SELECT_ALL", "SELECT_INVERT", "SELECT_NONE"],
                    checkStrictly: true,
                    getCheckboxProps: (data) => ({ disabled: !!selectedItems?.find(it=> it.id ==data.id ) }),
                    onSelect(item, selected) {
                        if (selected) {
                            setSelected(v => (
                                    [...(v || []), 
                                        {id: item.id,
                                        } as AdjustCustomerVisitSchedule 
                                    ]
                                )
                            )
                        } else {
                            setSelected(v => v?.filter(it => it.id != item.id))
                        }
                    },
                    onChange(_, selectedRows, info) {
                        if (info.type !== 'single') {
                            setSelected(
                                selectedRows.map(it=> ({
                                   id: it.id
                                }  as AdjustCustomerVisitSchedule)) 
                            )
                        }
                    },
                }}
                // dataSource={searchData}
                request={async (paging) => {
                    return GratisServices.fetchSuggestedCustomerVisit({ gSettledId: gSettledId, criteria: {gVerifyId:verifyId||-1,...criteria}, pagination: { current: paging?.current || 0, pageSize: paging?.pageSize || 20 } }).query(requestActions).then(it => {                    
                      return {
                        success: true,
                        total: it.total,
                        data: it.items
                      }
                    })
                  }}
            />
         </Space>
         </ModalForm>
    )
}
export default AdjOtherCustomerVisitSearchModal