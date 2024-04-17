import { ActionType, CheckCard, ProCard, ProFormDateRangePicker, ProTable } from "@ant-design/pro-components"
import { Button, Descriptions, Input, Modal, Radio, Space, Spin, Table, Tag, Tooltip, message } from "antd"
import { AdjustCustomerVisitSchedule, AdjustItem, GratisContract, GratisVerifyItem, GratisVerifySchedule, SearchCriteria, VerifyGratisContact } from "../../types"
import { GratisServices } from "../../services"
import { simpleRequestActions } from "@/services/model"
import AdjustTranModal from "./adjust/AdjustTranModal"
import GratisVerifytemList from "./GratisVerifytemList"
import { useEffect, useRef, useState } from "react"
import { formatDate, getColorStatus, toReadable } from "@/pages/utils"
import HistoryAdjustmentTransactionList from "./HistoryAdjustmentTransactionList"
import { EditOutlined, SelectOutlined } from "@ant-design/icons"
import Status from "@/components/Status"
import Icon from "@ant-design/icons/lib/components/Icon"
import moment from "moment"
import AdjDirectListItemSearchModal from "./adjust/AdjDirectListItemSearchModal"
import { useSafeState } from "ahooks"
import AdjOtherCustomerVisitSearchModal from "./adjust/AdjOtherCustomerVisitSearchModal"

interface Props{
    isVerify: boolean;
    gSettledId: number;
    gContractId: number;
    groupTypeCode?:string;
    verifyContract: VerifyGratisContact;
    onFinish: ()=> void;
}

const VerifyContractByMonthView= ({isVerify,gSettledId,gContractId, groupTypeCode, verifyContract,onFinish}: Props) => {
    const requestActions = simpleRequestActions()
    const actionRef = useRef<ActionType>();
    const actionRefTableVerifySchedule = useRef<ActionType>();
    const [criteria, setCriteria] = useState<SearchCriteria>()
    const [gContract, setGContract] = useState<GratisContract>()
    const isDirect = groupTypeCode === 'DIRECT' ? true : false
    const isInDirect = groupTypeCode === 'IN_DIRECT' ? true : false
    const isOther = groupTypeCode === 'OTHER' ? true : false
    useEffect(() => {
        try {
          loadData()
        //   setCurrent(currentNum)
        actionRef.current?.reload()
        } catch (error: any) {
          message.error(error.message || 'Failed to load data.');
        }
    }, [])    
    const loadData = async () => {
        const rs = await GratisServices.fectchGratisContract({id: gContractId}).query(requestActions)
        setGContract(rs)
    }
    const supTitle = (total: number) => {
        return <sup
            style={
                {
                    zIndex: 'auto',
                    minWidth: '20px',
                    height: '20px',
                    padding: '0 6px',
                    color: 'white',
                    fontWeight: '400',
                    fontSize: '12px',
                    lineHeight: '20px',
                    borderRadius: '10px',
                    whiteSpace: 'nowrap',
                    textAlign: 'center',
                    backgroundColor: '#ff4d4f',
                }
            }>{total}</sup>
    }
    
    const toolBarRender=(id: number)=> 
        (isVerify) ? [            
            isDirect&&<AdjustTranModal verifyId={id} customerCode={gContract?.customer.code} title={'Adjustment'} onSave={(status, remarks, adjItems, cb) => adjustHandler(id, adjItems, cb)} trigger={<Button type='link' icon={<EditOutlined/>}>Adjust</Button>} />,
            isInDirect&&<AdjDirectListItemSearchModal verifyId={id} customerCode={gContract?.customer.code} addHandler={(adjItems, cb) => adjustHandler(id, adjItems, cb)}   trigger={<Button type='link' icon={<EditOutlined/>}>Adjust</Button>}/>,
            isOther&&<AdjOtherCustomerVisitSearchModal gSettledId={gSettledId} verifyId={id} customerCode={`${gContract?.customer.code} - ${gContract?.customer.name}`} addHandler={(adjItems, cb) => adjustCustomerVisitScheduleHandler(id, adjItems, cb)}   trigger={<Button type='link' icon={<EditOutlined/>}>Adjust {gContract?.contracts?.find(i=> i.id==id)?.totalCustomerVisitUpdated||0>0?supTitle(gContract?.contracts?.find(i=> i.id==id)?.totalCustomerVisitUpdated||0):''}</Button>}/>
        ] : []
    const  optionsStatus=[
        { label: "All", value: "ALL",sort:1 },
        { label: "STD", value: "STD",sort:2 },
        { label: "Adj", value: "ADJ",sort:3 }
        ]
    const  optionsComplainceCheckStatus=[
        { label: "All", value: "ALL",sort:0},
        { label: "Compliant", value: "Compliant",sort:1 },
        { label: "Indefinable", value: "Indefinable",sort:2 },
        { label: "Non Compliant", value: "Non Compliant",sort:3 }
        ]    
    const adjustHandler = (verifyId: number,adjItems: AdjustItem[]  , cb:(v: boolean)=>void)=>{       
        if(adjItems && adjItems.length==0) {
            message.warning('No data selected')
        }else{
            console.log('save adjs',adjItems)
            Modal.confirm({
                title: "", content: 'Are you sure?', 
                onOk: async () => {
                    try {
                        await GratisServices.adjustContractVerifyTrans(verifyId,adjItems)(requestActions)                       
                        cb(true)
                        actionRef.current?.reload()
                        onFinish()
                        loadData()
                    }catch (error: any) {
                        message.error(error.message || 'Failed to change status.')
                    }
                }
            })  
        }      
    }  
    const removeHandler =() =>{  
        onFinish()
    } 
    
    const onSearchHandler = (value: string) => {
        setCriteria(v => ({ ...v, searchValue: value }));
        actionRef.current?.reloadAndRest?.();
    };

    const adjustCustomerVisitScheduleHandler = (verifyId: number,adjItems: AdjustCustomerVisitSchedule[]  , cb:(v: boolean)=>void)=>{       
        if(adjItems && adjItems.length==0) {
            message.warning('No data selected')
        }else{
            Modal.confirm({
                title: "", content: 'Are you sure?', 
                onOk: async () => {
                    try {
                        await GratisServices.synchroGratisCustomerVisitSchedule('multi',gSettledId,verifyId,adjItems.map(it=>it.id))(requestActions)  
                        cb(true)
                        actionRef.current?.reload()
                        onFinish()
                        loadData()
                    }catch (error: any) {
                        message.error(error.message || 'Failed to change status.')
                    }
                }
            })  
        }      
    }  
    
    return (<Spin spinning={requestActions.request?.loading}>
        <Space direction='vertical' style={{width: '100%'}} >
        <ProCard bordered>
            <Descriptions size="small" column={4}>
                <Descriptions.Item label={'Verified Date'} >{verifyContract?.durationText}</Descriptions.Item>
                <Descriptions.Item label={'Customer Code'} >{gContract?.customer.code}</Descriptions.Item>
                <Descriptions.Item label={'Verified'} >{verifyContract.verified}</Descriptions.Item>
                {/* <Descriptions.Item label={'Status'} ><Tag color={getColorStatus(verifyContract.status)}>{toReadable(verifyContract.status)}</Tag></Descriptions.Item> */}
                <Descriptions.Item label={'Status'} ><Status text={verifyContract.status||'FAILED'} value={verifyContract.status}/></Descriptions.Item> 
                <Descriptions.Item label={'Term'} span={3}>{gContract?.terms}</Descriptions.Item>
                <Descriptions.Item label={'Remarks'}>{verifyContract.remarks}</Descriptions.Item>
            </Descriptions>
        </ProCard>
        {groupTypeCode=='OTHER' && <ProTable<GratisVerifySchedule> search={false} 
            actionRef={actionRefTableVerifySchedule}
            cardProps={false}
            tableExtraRender={()=>
                <div>
                  <div style={{flex:0,float:'left', width:'80%',marginBottom:5}}> 
                    <Space direction="horizontal" >
                      <Input.Search allowClear style={{marginTop: 0}} onSearch={onSearchHandler}/>
                      <ProFormDateRangePicker 
                        fieldProps={{
                            style:{marginTop:10},
                            onChange(values) {
                                if(values && values.length>1){
                                    const dateFrom = moment( values[0]?.toDate())
                                    const dateTo = moment( values[1]?.toDate())
                                    setCriteria(v=> {return{...v, dateFrom: dateFrom,dateTo: dateTo}})
                                } else{
                                    setCriteria(v=> {return{...v, dateFrom: undefined,dateTo: undefined}})
                                } 
                                actionRefTableVerifySchedule.current?.reloadAndRest?.();                           
                            },
                      }}
                        
                      />
                      <Radio.Group optionType="button"
                        defaultValue={"ALL"}
                        options={optionsComplainceCheckStatus.sort((a,b)=> a.sort-b.sort )}
                        onChange={(e) => {
                            const value = e.target.value
                            setCriteria(v => ({ ...v, filter: value }));
                            actionRefTableVerifySchedule.current?.reloadAndRest?.();
                        }}
                      />
                    </Space>
                  </div>
                  <div style={{float:'right',marginRight:0}}> 
                    <Space style={{marginTop:15}}>
                      {toolBarRender(verifyContract.id) }
                    </Space>
                  </div>
                </div>
            }
            options={{
                fullScreen: false,
                density: false,
                reload: false,
                setting: false,
            }} 
            request={ async(page: any)=>{
                const rs = await GratisServices.fetchGratisVerifyScheduleList({...criteria,id:verifyContract.id}||{id:verifyContract.id}).query(requestActions)
                return{               
                    success: true, 
                    total: rs.length || 0,
                    data: rs
                }
            }}
            columns={[{
                    width: 20,
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
                    </Space>
                    ),
                },
                {
                    title: 'Schedule Date',
                    dataIndex: 'scheduleDate',  
                    render: (_, r) =>formatDate(r.scheduledDate)
                },
                {
                    title: 'Completed Date',
                    dataIndex: 'completedDate',  
                    render: (_, r) =>formatDate(r.completedDate)
                },
                { 
                    title: 'Schedule Type',
                    render:(_,r) => toReadable(r.scheduleType)

                },
                {
                    title: 'Schedule Status',
                    render:(_,r) =>  toReadable(r.status)
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
                }
            ]}
        />}
        {groupTypeCode!='OTHER' &&<ProTable<GratisVerifyItem> search={false} 
            actionRef={actionRef}
            cardProps={false}
            options={{
                fullScreen: false,
                density: false,
                reload: false,
                setting: false,
            }} 
            tableExtraRender={()=>
                <div>
                  <div style={{flex:0,float:'left', width:'80%',marginBottom:5}}> 
                    <Space direction="horizontal" >
                      <Input.Search allowClear style={{marginTop: 0}} onSearch={onSearchHandler}/>
                      <ProFormDateRangePicker 
                        fieldProps={{
                            style:{marginTop:10},
                            onChange(values) {
                                if(values && values.length>1){
                                    const dateFrom = moment( values[0]?.toDate())
                                    const dateTo = moment( values[1]?.toDate())
                                    setCriteria(v=> {return{...v, dateFrom: dateFrom,dateTo: dateTo}})
                                } else{
                                    setCriteria(v=> {return{...v, dateFrom: undefined,dateTo: undefined}})
                                } 
                                actionRef.current?.reloadAndRest?.();                           
                            },
                      }}
                        
                      />
                      <Radio.Group optionType="button"
                        defaultValue={"ALL"}
                        options={optionsStatus.sort((a,b)=> a.sort-b.sort )}
                        onChange={(e) => {
                            const value = e.target.value
                            setCriteria(v => ({ ...v, filter: value }));
                            actionRef.current?.reloadAndRest?.();
                        }}
                      />
                    </Space>
                  </div>
                  <div style={{float:'right',marginRight:0}}> 
                    <Space style={{marginTop:15}}>
                      {toolBarRender(verifyContract.id) }
                    </Space>
                  </div>
                </div>
            }
            request={ async(page: any)=>{
                const rs = await GratisServices.fetchGratisVerifyItemList({...criteria,id:verifyContract.id}||{id:verifyContract.id}).query(requestActions)
                return{               
                    success: true, 
                    total: rs.length || 0,
                    data: rs
                }
            }}
            rowKey="uuId"
            // toolBarRender={()=> toolBarRender(verifyContract.id) }
            columns={[
                {
                    title: 'Item',
                    dataIndex: 'itemName',  
                },
                {
                    title: 'Code',
                    render: (_, r) => r.itemCode
                },
                {
                    title: 'Customer Code',
                    dataIndex: 'customerCode',  
                },
                { 
                    title: 'STD Qty',
                    align: 'right',
                    render:(_,r) => r.qty1

                },
                { 
                    title: 'Adj Qty',
                    align: 'right',
                    render:(_,r) => r.qty2

                },
                {
                    title: 'Quantity',
                    align: 'right',
                    render:(_,r) =>  r.qty
                }
            ]}
            expandable={{
                expandedRowRender: (record => <GratisVerifytemList item={record} isVerify={isVerify} onFinish={removeHandler} />),
                rowExpandable: record => true,
            }}
            summary={(data) => {
                var qty = 0,
                    qty1 = 0,
                    qty2 = 0
                data?.forEach(it => {
                    qty = qty+ it.qty
                    qty1= qty1+ it.qty1
                    qty2 = qty2+ it.qty2
                })       
                return <Table.Summary.Row style={{ textAlign: 'right', fontWeight: 'bold' }}>                   
                    <Table.Summary.Cell colSpan={4} index={4}>Total</Table.Summary.Cell>
                    <Table.Summary.Cell index={4}>{ qty1 || 0}</Table.Summary.Cell>
                    <Table.Summary.Cell index={4}>{ qty2 || 0}</Table.Summary.Cell>
                    <Table.Summary.Cell index={4}>{ qty || 0}</Table.Summary.Cell>
                </Table.Summary.Row>

            }}
        /> }
         {groupTypeCode!='OTHER' &&<ProCard title='Data History' defaultCollapsed collapsible headerBordered size='small'>
          <HistoryAdjustmentTransactionList verifyContractId={verifyContract.id}/>
        </ProCard>}
    </Space></Spin>)
}

export default VerifyContractByMonthView