// import { MultiRequest } from "@/services/apiGateway"
// import { LookupData} from "@/services/data"
// import { simpleRequestActions } from "@/services/model"
// import { ActionType,  ModalForm, ModalFormProps, ProCard, ProColumns, ProForm,  ProFormDateQuarterRangePicker,  ProFormGroup, ProFormSelect,  ProTable } from "@ant-design/pro-components"
// import {  message, Space, Spin, Tag, Tooltip} from "antd"
// import { useForm } from "antd/lib/form/Form"
// import { useEffect, useRef, useState } from "react"
// import { GratisServices } from "../services"
// import { CreateSettlemenDate, SaveGratisContactData, SettlementSearchDate } from "../types"
// import { Paging } from "@/services/API"
// import { ContractLess } from "@/services/crm/contract"
// import ConfirmSaveSettlement from "../create/ConfirmSaveSettlement"
// import moment from "moment"
// import { ExpandAltOutlined, MessageOutlined } from "@ant-design/icons"

// interface SettlemenSearchForm{
//     contractTypeId: number;
//     scheduleDate: moment.Moment[];
// }

// export default ({ contractId,onOpenModalChange, onRefresh, ...rest }: ModalFormProps<SaveGratisContactData> & { contractId?: number,onOpenModalChange?: (visible: boolean) => void, onRefresh?: () => void }) => {
//     const [open,setOpen] = useState<boolean>(true);
//     var timeout: NodeJS.Timeout
//     const requestActions = simpleRequestActions()
//     const [form] = useForm<SettlemenSearchForm>()  
//     const actionRef = useRef<ActionType>();
//     const [selected, setSelected] = useState<ContractLess[]>()
//     const [params, setParams] = useState<SettlementSearchDate>()
//     const [modalComplet, setModalComplet] = useState<{
//         type: 'complete';
//         required: boolean;
//         cb: (docRef: string, remakrs: string) => void;
//     }>()
//     const [lookupData, setLookupData] = useState<{
//     contractTypes?: LookupData[],
//     }>()
//     useEffect(() => {
//         (async () => {
//             const rs = await MultiRequest<{
//                 contractTypes: LookupData[],
//                 // terms: LookupData[],
//                 // brandList: LookupDataItem[]
//             }>(
//                 [
//                     GratisServices.listContractType().queryParams, 
//                     // GratisServices.listTerms().queryParams,
//                     // CustomerServices.listBrand.queryParams

//                 ]
//             )(requestActions)

//             setLookupData(rs)
//             // await loadData()

//         })()
//     },[])
//     const filter=(contractTypeId: number, scheduleDate: moment.Moment[])=>{
//         if(contractTypeId && scheduleDate){
//             var data = {
//                 contractTypeId: contractTypeId,
//                 dateFrom: scheduleDate[0],
//                 dateTo:  scheduleDate[1].add(2,'month').endOf('month')
//             } as SettlementSearchDate
//             console.log('filter: ',);
//             setParams(data)
//             actionRef.current?.reloadAndRest && actionRef.current?.reloadAndRest()
//         }

//     } 

//     const onSaveContractHandler = async (callBack:(v: boolean)=>void) => {
//         // const formData = await form.validateFields()
//         if(!selected || selected.length==0){
//             message.warning('Contract not selected')
//         }else{
//             setModalComplet({
//                 type: 'complete',
//                 required: true,           
//                 async cb(label,remakrs) {
//                     var data = {
//                         label:label,
//                         remarks:remakrs,
//                         contractId: selected?.map(it=> it.id),
//                         ...params                        
//                     } as CreateSettlemenDate                           
//                     var rs=await GratisServices.saveSettlement(data)(requestActions)
//                     if(rs.message=='ok' && rs.id || 0 >0 ) {
//                         message.success("Saved successfully.")
//                         setModalComplet(undefined)   
//                         callBack(true)   
//                         onRefresh?.()   
//                     }
//             }})
//         }  
        
//     }
    
//     const cols: ProColumns<ContractLess>[] = [{
//         title:'Agreement Name',
//         dataIndex:'contractNo',
//         render: (_, r) => <Tooltip title={!r?.terms?'No Term':r?.terms}><MessageOutlined/> {r?.contractNo}</Tooltip>
//     },{
//         title:'Customer Code',
//         render: (_, r) => `${r.customer?.code}`
//     },{
//         title:'Customer Namne',
//         render: (_, r) => `${r.customer?.name}`
//     },{
//         title:'Budget Code',
//         dataIndex:'budgetCode'
//     },{
//         title:'Brand',
//         dataIndex:'brand'
//     },{
//         title: 'Duration Date',
//         hideInSearch: true,
//         render: (_, record) => `${moment(record.effectiveDate).format('YYYY-MM-DD')} - ${moment(record.expiryDate).format('YYYY-MM-DD')}` 
//     }

//     ]

//     return <> <ModalForm title="Create Settlement Cycle" {...rest} width='90%' style={{margin:0, padding:0}}
//         modalProps={{
//             maskClosable: false
//         }}
//         open={open}
//         onFinish={async data => {
//             onSaveContractHandler((v)=>{
//                 setOpen(!v);
//             })
//             return false;
//         }}
//         onOpenChange={(v)=>{          
//             setOpen(v);
//             onOpenModalChange?.(v)
//         }}
//     >       
//         <Space direction='vertical' style={{width: '100%'}} >        
//         <ProCard boxShadow  size="small"> 
//                 <ProForm<SettlemenSearchForm> form={form} submitter={false}  size="small"
//                     onFieldsChange={(changedFields, allFields) => {
//                         clearTimeout(timeout)
//                         const contractTypeId = allFields.find(it => it.name == 'contractTypeId')
//                         const scheduleDate = allFields.find(it => it.name == 'scheduleDate')
//                         timeout = setTimeout(function () {
//                             filter(contractTypeId?.value,scheduleDate?.value)
//                         }, 100)
//                     }}
//                 >
//                 <ProFormGroup size={'small'}>
//                     <ProFormSelect label="Contract Type"  name={'contractTypeId'} rules={[{ required: false }]} showSearch allowClear width={'sm'} options={lookupData?.contractTypes?.map(it => ({ label: it.name, value: it.id }))}/>                         
//                     <ProFormDateQuarterRangePicker label='Schedule Date' name={'scheduleDate'}/>                     
//                 </ProFormGroup> 
//                 </ProForm>          
//             </ProCard>
//                 <ProTable<ContractLess> 
//                     actionRef={actionRef} search={false} 
//                     bordered
//                     cardProps={false}
//                     options={{
//                         fullScreen: false,
//                         density: false,
//                         reload: false,
//                         setting: false,
                        
//                     }} 
//                     request={(page: any)=>{
//                         return GratisServices.fetchContractToGratisContract(params||{}).query(requestActions).then(it => {
//                             return {               
//                                 success: true, 
//                                 total: it?.length,
//                                 data: it
//                             }
                
//                         }) as Promise<Paging<ContractLess>>
//                     }} 
//                     rowKey='id' 
//                     rowSelection={{
//                         selections: ["SELECT_ALL", "SELECT_INVERT", "SELECT_NONE"],
//                         checkStrictly: true,
//                         getCheckboxProps: (data) => ({ disabled: !data.terms }),
//                         onSelect(item, selected1) {
//                             if (selected1) {
//                                 setSelected(v => ([...(v || []), item]))
//                             } else {
//                                 setSelected(v => v?.filter(it => it.id != item.id))
//                             }
//                         },
//                         onChange(_, selectedRows, info) {
//                             console.log('selected info: ',info)
//                             if (info.type !== 'single') {
//                                 setSelected(selectedRows)
//                             }
//                         },
//                     }}
//                     columns={cols}
//                 />           
//         </Space>
//         {
//             modalComplet?.type === 'complete' && <ConfirmSaveSettlement open={true}
//                 onOpenChange={visible => !visible && setModalComplet(undefined)}
//                 required={modalComplet.required}
//                 onSave={modalComplet.cb} 
//                 loading={requestActions.request?.loading || false}/>
//         } 
//     </ModalForm>
    
//     </>
// }