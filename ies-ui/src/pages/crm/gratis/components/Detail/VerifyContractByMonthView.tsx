import { ActionType, ProCard, ProTable } from "@ant-design/pro-components"
import { Button, Descriptions, Modal, Space, Table, Tag, Tooltip, message } from "antd"
import { AdjustItem, GratisContract, GratisVerifyItem, GratisVerifySchedule, VerifyGratisContact } from "../../types"
import { GratisServices } from "../../services"
import { simpleRequestActions } from "@/services/model"
import AdjustTranModal from "./adjust/AdjustTranModal"
import GratisVerifytemList from "./GratisVerifytemList"
import { useRef } from "react"
import { formatDate, getColorStatus, toReadable } from "@/pages/utils"
import HistoryAdjustmentTransactionList from "./HistoryAdjustmentTransactionList"
import { SelectOutlined } from "@ant-design/icons"

interface Props{
    isVerify: boolean;
    gContract: GratisContract;
    groupTypeCode?:string;
    verifyContract: VerifyGratisContact;
    onFinish: ()=> void;
}

const VerifyContractByMonthView= ({isVerify,gContract, groupTypeCode, verifyContract,onFinish}: Props) => {
    const requestActions = simpleRequestActions()
    const actionRef = useRef<ActionType>();
    const actionRefTableVerifySchedule = useRef<ActionType>();
    const toolBarRender=(id: number)=> 
        (isVerify) ? [            
            <AdjustTranModal verifyId={id} customerCode={gContract.customer.code} title={'Adjustment'} onSave={(status, remarks, adjItems, cb) => adjustHandler(id, adjItems, cb)} trigger={<Button type='primary'>Adjust</Button>} />
        ] : []

    const adjustHandler = (verifyId: number,adjItems: AdjustItem[]  , cb:(v: boolean)=>void)=>{       
        if(adjItems && adjItems.length==0) {
            message.warning('No data selected')
        }else{
            Modal.confirm({
                title: "", content: 'Are you sure?', 
                onOk: async () => {
                    try {
                        await GratisServices.adjustContractVerifyTrans(verifyId,adjItems)(requestActions)                       
                        cb(true)
                        actionRef.current?.reload()
                        onFinish()
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
    
    return (<Space direction='vertical' style={{width: '100%'}}>
        <ProCard bordered>
            <Descriptions size="small" column={4}>
                <Descriptions.Item label={'Verified Date'} >{verifyContract?.durationText}</Descriptions.Item>
                <Descriptions.Item label={'Customer Code'} >{gContract.customer.code}</Descriptions.Item>
                <Descriptions.Item label={'Verified'} >{verifyContract.verified}</Descriptions.Item>
                <Descriptions.Item label={'Status'} ><Tag color={getColorStatus(verifyContract.status)}>{toReadable(verifyContract.status)}</Tag></Descriptions.Item>
                <Descriptions.Item label={'Term'} span={3}>{gContract.terms}</Descriptions.Item>
                <Descriptions.Item label={'Remarks'}>{verifyContract.remarks}</Descriptions.Item>
            </Descriptions>
        </ProCard>
        {groupTypeCode=='OTHER' && <ProTable<GratisVerifySchedule> search={false} 
            actionRef={actionRefTableVerifySchedule}
            options={{
                fullScreen: false,
                density: false,
                reload: false,
                setting: false,
            }} 
            request={ async(page: any)=>{
                const rs = await GratisServices.fetchGratisVerifyScheduleList(verifyContract.id).query(requestActions)
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
                    title: 'Salesperson',
                    render: (_, r) => r.salesperson
                },
                { 
                    title: 'Type',
                    render:(_,r) => toReadable(r.planned)

                },
                {
                    title: 'Status',
                    align: 'right',
                    render:(_,r) =>  r.complianceCheck
                }
            ]}
        />}
        {groupTypeCode!='OTHER' &&<ProTable<GratisVerifyItem> search={false} 
            actionRef={actionRef}
            options={{
                fullScreen: false,
                density: false,
                reload: false,
                setting: false,
            }} 
            request={ async(page: any)=>{
                const rs = await GratisServices.fetchGratisVerifyItemList(verifyContract.id).query(requestActions)
                return{               
                    success: true, 
                    total: rs.length || 0,
                    data: rs
                }
            }}
            rowKey="uuId"
            toolBarRender={()=> toolBarRender(verifyContract.id) }
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
                    title: 'Type',
                    render:(_,r) => toReadable(r.actionCode)

                },
                {
                    title: 'Quantity',
                    align: 'right',
                    render:(_,r) =>  r.qty
                }
            ]}
            expandable={{
                expandedRowRender: (record => <GratisVerifytemList item={record} onFinish={removeHandler} />),
                rowExpandable: record => true,
            }}
            summary={(data) => {
                var qty = 0
                data?.forEach(it => {
                    qty = qty+ it.qty
                })       
                return <Table.Summary.Row style={{ textAlign: 'right', fontWeight: 'bold' }}>                   
                    <Table.Summary.Cell colSpan={5} index={3}>Total</Table.Summary.Cell>
                    <Table.Summary.Cell index={5}>{ qty || 0}</Table.Summary.Cell>
                </Table.Summary.Row>

            }}
        /> }
         {groupTypeCode!='OTHER' &&<ProCard title='History Logs' defaultCollapsed collapsible headerBordered size='small'>
          <HistoryAdjustmentTransactionList verifyContractId={verifyContract.id}/>
        </ProCard>}
    </Space>)
}

export default VerifyContractByMonthView