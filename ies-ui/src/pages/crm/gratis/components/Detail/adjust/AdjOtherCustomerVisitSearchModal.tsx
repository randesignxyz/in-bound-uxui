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
    const [dataLookup, setDataLookup] = useState<AdjustInfoOn[]>()
    const [selectedFrom, setSelectedFrom] = useState<AdjustInfoOn>()
    // const [searchData, setSearchData] = useState<ItemSAP[]>()
    const [selected, setSelected] = useState<AdjustCustomerVisitSchedule[]>()
    // const [docNum,setDocNum] = useState<string>()
    const [criteria, setCriteria] = useState<GratisVisitScheduleParams>()
    useEffect(()=>{
        if(verifyId>0) loadData()
    },[])
    const loadData = async ()=>{
        // const rs = await GratisServices.gratisSaleOrderList(verifyId).query(requestActions)    
        // setDataLookup(rs)
    }
    const onSearch=async (value:string)=>{
        try{
            form.validateFields()   
            setCriteria(v=> {
                return {...v,searchValue:value}
            })        
            actionCustVisitRef.current?.reload() 
            // setDocNum(value)
            // if(value=='' || value.length<4) return
            // const rs = await GratisServices.getListItemAdjustment(verifyId,customerCode,value,selectedFrom?.dataSource,selectedFrom?.startedDate,selectedFrom?.endedDate).query(requestActions)             
            // if(rs && rs.length>0){  
            //     setSearchData(rs)
            // }else{
            //     setSearchData([])
            //     message.warning('Not found')
            // } 
        }catch(ex){
            message.error('Not found')
        }
    }
    return(
        <ModalForm<AdjustCustomerVisitSchedule> width={'80%'}  layout="vertical" 
         
            form={form}                        
            trigger={trigger}    
            title='Find: Customer Visit Schedule'
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
                var dscription = record.dscription
                if(dscription){
                    setSelectedFrom(it=> dataLookup?.find(it=> it.dscription==dscription))
                }           
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
                    /*{
                        title:'Verified Date',
                        dataIndex: 'gcontractId',
                        render: (_, r) => (
                          <Space size={1}>
                            <Tooltip title="Quick data review">
                              <Button
                                type="link"
                                size="small"
                                icon={<EyeOutlined />}
                                // onClick={() => quickViewHandler(r?.gcontractId, r?.orderNo-1)}
                              >{r.durationText}</Button>
                            </Tooltip>                      
                          </Space>
                        ),
                      }, {
                        title: 'Agreement Name',
                        dataIndex: 'contractNo',
                        render: (_, r) => <Tooltip title={!r?.terms ? 'No Term' : r?.terms}><MessageOutlined /> {r?.gcontractNo}</Tooltip>
                      }, {
                        title: 'Customer',
                        dataIndex: 'gcontractId',
                        render: (_, r) => `${r?.customer?.code} - ${r?.customer?.name}`
                      }, {
                        title: 'Brand',  
                        render: (_, r) => r.brand
                      }, {
                        title: 'Status',
                        dataIndex: 'Status',
                        render: (_, r) => <Status text={r?.status||'FAILED'} value={r?.status} />
                      }*/{
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
                    /*{
                        title: 'Completed Date',
                        dataIndex: 'completedDate',  
                        render: (_, r) =>formatDate(r.completedDate)
                    },*/
                    { 
                        title: 'Schedule Type',
                        render:(_,r) => toReadable(r.scheduleType)
      
                    },
                    /*{
                        title: 'Schedule Status',
                        render:(_,r) =>  toReadable(r.status)
                    },*/
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
                                            // dataSource: selectedFrom?.dataSource,
                                            // qty: item.quantity, 
                                            // contractVerifyId: selectedFrom?.contractVerifyId||0,               
                                            // startedDate: selectedFrom?.startedDate,
                                            // endedDate:selectedFrom?.endedDate
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
                                    // dataSource: selectedFrom?.dataSource,
                                    // qty: it.quantity, 
                                    // contractVerifyId: selectedFrom?.contractVerifyId||0,               
                                    // startedDate: selectedFrom?.startedDate,
                                    // endedDate:selectedFrom?.endedDate
                                }  as AdjustCustomerVisitSchedule)) 
                            )
                        }
                    },
                }}
                // dataSource={searchData}
                request={async (paging) => {
                    return GratisServices.fetchSuggestedCustomerVisit({ gSettledId: gSettledId, criteria: {gVerifyId:verifyId||-1,...criteria}, pagination: { current: paging?.current || 0, pageSize: paging?.pageSize || 20 } }).query(requestActions).then(it => {
                    //   setIsSynchAll(it.total||0>0?true:false)
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