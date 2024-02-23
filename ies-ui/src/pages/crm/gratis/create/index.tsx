import { ActionType, PageContainer, ProCard, ProColumns, ProForm, ProFormDatePicker, ProFormField, ProFormGroup, ProFormSelect,ProTable } from "@ant-design/pro-components"
import React, { useEffect, useRef, useState } from "react"
import { history } from 'umi';
import { CrmPaths } from "../..";
import { useForm } from "antd/es/form/Form";
import { LookupData } from "@/services/data";
import { simpleRequestActions } from "@/services/model";
import { MultiRequest } from "@/services/apiGateway";
import { GratisServices } from "../services";
import { Button, Modal, Space, message } from "antd";
import { CreateSettlemenDate, IncentiveSettlement, SettlementSearchDate} from "../types";
import { ContractLess } from "@/services/crm/contract";
import moment from "moment";
import ConfirmSaveSettlement from "./ConfirmSaveSettlement";
import SettlementTransactionSearchModal from "./SettlementTransactionSearchModal";
import { DeleteOutlined, ExportOutlined } from "@ant-design/icons";
import { formatDate } from "@/pages/utils";
import { values } from "lodash";
import Status from "@/components/Status";

interface SettlemenSearchForm{
    contractTypeId: string;
    scheduleDateQ?: moment.Moment;
    scheduleDateS?: moment.Moment;
    yearS?: moment.Moment;
    scheduleDateY?: moment.Moment;
}

const SettlementView: React.FC<{}> = ({}) =>{
    const handleBackHandler = () => {
        history.push(`${CrmPaths.gratisSettlement}/list`);
    };
    var timeout: NodeJS.Timeout
    const requestActions = simpleRequestActions()
    const [form] = useForm<SettlemenSearchForm>()  
    const actionRef = useRef<ActionType>();
    const [dataSettled, setDataSettled] = useState<ContractLess[]>([])
    const [params, setParams] = useState<SettlementSearchDate>()
    const [frequency, setFrequency] = useState<string>('QUARTER')
    const [contractType, setContractType] = useState<string>('DIRECT')
    const [modalComplet, setModalComplet] = useState<{
        type: 'complete';
        required: boolean;
        cb: (docRef: string, remakrs: string) => void;
    }>()
    const [modalSearchTrans, setModalSearchTrans] = useState<{
        type: 'search-settlement-trans';
        required: boolean;
        cb: (selected: ContractLess[]) => void;
    }>()
    const [lookupData, setLookupData] = useState<{
        contractTypes?: LookupData[],
        contractTypesByGroupCode?: LookupData[],
        gratisTarget?: LookupData[],
        skuSettled?: LookupData[],
        gratisIncentive?: LookupData[]
    }>()
    useEffect(() => {
        (async () => {
            const rs = await MultiRequest<{
                contractTypes: LookupData[],
                contractTypesByGroupCode: LookupData[],
                gratisTarget: LookupData[],
                skuSettled: LookupData[]
                gratisIncentive: LookupData[]
            }>(
                [
                    GratisServices.listContractType().queryParams, 
                    GratisServices.listContractTypeByCode().queryParams, 
                    GratisServices.listLookupTarget().queryParams, 
                    GratisServices.listLookupSKUSettled().queryParams, 
                    GratisServices.listLookupIncentive().queryParams,
                ]
            )(requestActions)
            setLookupData(rs)
        })()
    },[])
    const filterAction=(contractTypeGroup: string,contractTypeId: number[],frequency: string, startedDate: moment.Moment, endedDate: moment.Moment)=>{       
        if(contractTypeGroup && startedDate && endedDate){
            var data = {
                contractTypeGroupCode: contractTypeGroup,
                contractTypeId: contractTypeId,
                frequency: frequency,
                dateFrom: startedDate,
                dateTo: endedDate.endOf('month')    
            } as SettlementSearchDate
            setParams(data)          
            actionRef.current?.reloadAndRest && actionRef.current?.reloadAndRest()
        }
    }
    const gotoView = (id: number) => {
        history.push(`/crm/gratis/detail/${id}`)
    }

    const onCompleteHandler = async () => {   
        if(!dataSettled || dataSettled.length==0){
            message.warning('No data in list.')
        }else{
            setModalComplet({
                type: 'complete',
                required: true,           
                async cb(label,remakrs) {                    
                    var data = {
                        label:label,
                        remarks:remakrs,
                        contractId: dataSettled?.map(it=> it.id),
                        dateFrom: params?.dateFrom,
                        dateTo: params?.dateTo,
                        frequency: frequency,
                        contractTypeGroupCode: params?.contractTypeGroupCode                                 
                    } as CreateSettlemenDate  
                                             
                    var rs=await GratisServices.saveSettlement(data)(requestActions)
                    if(rs.message=='ok' && rs.id || 0 >0 ) {
                        message.success("Saved successfully.")
                        setModalComplet(undefined)   
                        gotoView(rs.id || 0)          
                    }
            }})
        }     
    }
    const cols: ProColumns<ContractLess>[] = [{
        title:'Agreement Name',
        dataIndex:'contractNo'
    },{
        title:'Customer',
        render: (_, r) => `${r.customer?.code} ${r.customer?.name}`
    },{
        title:'Budget Code',
        dataIndex:'budgetCode'
    },{
        title:'Brand',
        dataIndex:'brand'
    },{
        title: 'Duration Date',
        hideInSearch: true,
        render: (_, r) => `${formatDate(r?.effectiveDate,'YYYY-MM-DD')} - ${formatDate(r?.expiryDate,'YYYY-MM-DD')}`
    },{
        title:'Term',
        dataIndex:'terms'
    },{
        title:'Action',
        render:(_,r)=> <Button onClick={(v)=> setDataSettled(v=> v.filter(it => it.id!=r.id))} icon ={<DeleteOutlined style={{color:"red"}}/>}></Button>
    }]

    const cols1 = (): ProColumns<IncentiveSettlement>[] => ([
        {
            title:'Form No #',
            dataIndex: 'formNo',
            sorter: 'formNo',
            width: 140,
            render: (_, r) => (
              <Space size={1}>
                <Button
                    type="link"
                    size="small"
                    icon={<ExportOutlined />}
                    onClick={async () => {
                        window.open(`/external/crm/gratis/detail/${r.id}`, '_blank')?.focus();
                    }}
                />
                {r.formNo? r.formNo:'NA'}
              </Space>
            ),
        },
        {
            title: 'Settlement Name',
            dataIndex: 'label',
            sorter: 'label',
            render: (_, item) => `${item.label}`
        },
        {
            title: 'Agreetment Type',
            render: (_, item) => item.contractType?.name
        }, 
        {            
            dataIndex: 'settledPeriod',
            sorter: 'settledPeriod',
            title: 'Settlement Period',
        },
        {
            align: 'right',
            dataIndex: 'startedDate',
            sorter: 'startedDate',
            title: 'From',
            render: (_, item) => formatDate(item.startedDate)
        },
        {
            align: 'right',
            dataIndex: 'endedDate',
            sorter: 'endedDate',
            title: 'To',
            render: (_, item) => formatDate(item.endedDate)
        },
        {
            title: 'Created By',       
            dataIndex: 'createdBy',
            sorter: 'createdBy'
        },
        {
            align: 'right',
            dataIndex: 'createdDate',
            sorter: 'createdDate',
            title: 'Created Date',
            render: (_, item) => formatDate(item.createdDate)
        },
        {
            title: 'Status',
            render: (_, item) => {
                const stausText = (item?.requestStatus=='NONE'||item?.status!='PENDING')?  item?.status: (item?.requestStatus=='COMPLETED'?'APPROVED':item?.requestStatus)
                return <Status value={stausText} text={stausText||'PENDING'}/>
            }
        }
    ])
    

    const onSubmit= async()=>{
        await form.validateFields()
        try{
            const rs = await GratisServices.fetchExistingGratisIncentive({...params}).query(requestActions)          
            if(rs && rs.length> 0){
                Modal.warning({
                    title: 'Settlement Period',
                    width: '80%',
                    content: (
                        <Space direction="vertical">
                            <div>• If there is pending settlement, please finish it first.</div>
                            <div>• If this period is already settled, please select another.</div>
                            <ProTable<IncentiveSettlement>
                            search={false}
                            size='small'
                            cardBordered={false}
                            cardProps={false}
                            options={{
                                fullScreen: false,
                                density: false,
                                reload: false,
                                setting: false,
                            }}     
                            pagination={false}
                            dataSource={rs}
                            columns={cols1()}
                        />
                        </Space>
                        
                    ),
                  });
            }else{
                setModalSearchTrans({
                    type: 'search-settlement-trans',
                    required: true,           
                    async cb(selected) {                               
                        setDataSettled(v=> [...v,...selected])
                        setModalSearchTrans(undefined)  
                        actionRef.current?.reload()  
                    }
                })
            }
        } catch(ex){
            message.error('Not found')
        }
    }
    const onReset= async()=>{
        form.resetFields()
        setDataSettled([])
    }

    return(
        <PageContainer
            title='New Settlement'
            breadcrumb={undefined}
            onBack={handleBackHandler}
            footer={[
                <Button
                  type="primary" 
                  
                  onClick={onCompleteHandler}
                >Create Settlement</Button>,
              ]}
        >
            <Space direction='vertical' style={{width: '100%'}}>                
            
            <ProCard boxShadow size="small">
                <ProForm<SettlemenSearchForm> form={form}  layout="vertical"
                    // submitter={{
                    //     searchConfig:{
                    //         submitText:'Add Customer'   ,
                                         
                    //     },
                    //     onReset: (value) =>{
                    //         setDataSettled([])
                    //     }
                    // }}
                    submitter={false}
                    // onFinish={ async (formData: SettlemenSearchForm) => {                     
                    //     setModalSearchTrans({
                    //         type: 'search-settlement-trans',
                    //         required: true,           
                    //         async cb(selected) {                               
                    //             setDataSettled(v=> [...v,...selected])
                    //             setModalSearchTrans(undefined)  
                    //             actionRef.current?.reload()  
                    //         }
                    //     })
                    // }}
                    onFieldsChange={(changedFields, allFields) => {
                        clearTimeout(timeout)
                        const contractTypeGroup = allFields.find(it => it.name == 'contractTypeGroup')
                        const contractTypeId = allFields.find(it => it.name == 'contractTypeId')
                        const scheduleDateQ = allFields.find(it => it.name == 'scheduleDateQ')
                        const scheduleDateS = allFields.find(it => it.name == 'scheduleDateS')
                        const scheduleDateY = allFields.find(it => it.name == 'scheduleDateY')
                        const yearS = allFields.find(it => it.name == 'yearS')
                        const frenquencyValue = allFields.find(it => it.name == 'scheduleType')
                        var endedDate1:any= null
                        var startedDate1:any=null
                        
                        if(frenquencyValue && frenquencyValue?.value){
                            setFrequency(frenquencyValue?.value || 'QUARTER')                           
                        }                        
                        if((frequency =='QUARTER' || frequency =='MONTH') && scheduleDateQ?.value){
                            startedDate1 = scheduleDateQ?.value
                            endedDate1 =  startedDate1.add(2,'month') 
                        }
                        if(frequency =='SEMESTER' && (scheduleDateS?.value || yearS?.value)){
                            var d = yearS?.value as moment.Moment
                            var v = scheduleDateS?.value
                            var startOfY = d.add(-1,"year").endOf("year").add(1,"day")
                            startedDate1 = startOfY.add(v,'month')
                            endedDate1 = startedDate1.add(5,'month')
                            console.log(v,startOfY)
                        }
                        if(frequency =='YEAR' && scheduleDateY?.value){
                            var date = scheduleDateY?.value              
                            startedDate1 = date.add(-1,"year").endOf("year").add(1,"day")
                            endedDate1 = date.endOf("year")
                        }   
                        if(contractTypeGroup?.value && contractTypeGroup?.value!=contractType){                            
                            form.setFieldValue('scheduleType',undefined)
                        }                          
                        setTimeout(function() {                        
                            filterAction(contractTypeGroup?.value,contractTypeId?.value, frequency,startedDate1,endedDate1)
                            setContractType(contractTypeGroup?.value)
                        }, 100)
                    }}
                    
                >
                <ProFormGroup size={'small'}>
                    <ProFormSelect label="Contract Type" disabled={dataSettled.length>0} name={'contractTypeGroup'} rules={[{ required: true }]} showSearch allowClear width={'sm'} options={lookupData?.contractTypes?.map(it => ({ label: it.name, value: it.code }))}/>     
                    {contractType==='OTHER'&&<ProFormSelect label="" style={{marginTop:'24px'}} name={'contractTypeId'} allowClear width={'sm'}   mode="multiple" rules={[{ required: true }]} disabled={dataSettled.length>0}  options={lookupData?.contractTypesByGroupCode?.filter(it=> it.code==contractType).map(it => ({ label: it.name, value: it.id }))}/>}
                   {/* </ProFormGroup>
                   <ProFormGroup size={'small'} align="center"> */}
                    <ProFormSelect label={contractType=='DIRECT'?'Target':'Settlement Period'} disabled={dataSettled.length>0} name={"scheduleType"}   rules={[{ required: true }]} 
                        options={[
                            {label:'Monthly',value:'MONTH'},
                            {label:'Quarterly',value:'QUARTER'},
                            {label:'Semesterly',value:'SEMESTER'},
                            {label:'Annually',value:'YEAR'}
                        ].filter(it=> !(it.value =='MONTH' && contractType!='DIRECT'))}
                    />
                    
                    {(frequency=='QUARTER' || frequency=='MONTH') && <ProFormDatePicker.Quarter label={contractType=='DIRECT'?"Settlement Period":' '} style={{marginTop: (contractType=='DIRECT'?'0px':'24px')}} disabled={dataSettled.length>0}  name={'scheduleDateQ'} rules={[{ required: true }]}/>}
                    {frequency=='SEMESTER'  && <><ProFormDatePicker.Year label={contractType=='DIRECT'?"Settlement Period":' '} style={{margin:0}} rules={[{ required: true }]} disabled={dataSettled.length>0} name={'yearS'}/><ProFormSelect label="" style={{marginTop:'24px',marginLeft:-4, width: 120 }}  disabled={dataSettled.length>0}  name={'scheduleDateS'} options={[{label:'Semester 1',value:0},{label:'Semester 2',value:6}]}/></>}
                    {frequency=='YEAR' && <ProFormDatePicker.Year label={contractType=='DIRECT'?"Settlement Period":' '}   addonAfter disabled={dataSettled.length>0}  name={'scheduleDateY'} rules={[{ required: true }]}/>}
                    
                    <div style={{marginTop:'24px'}}>
                        <Button name=";;" style={{marginRight:2}} onClick={onReset}> Reset</Button>
                        <Button loading={requestActions.request?.loading} name=";;" type="primary" onClick={onSubmit}> Add Customer</Button>
                    </div>
                </ProFormGroup>                 
                </ProForm>          
            </ProCard>
            <ProTable<ContractLess> 
                actionRef={actionRef} search={false} size="small"
                bordered
                tableStyle={{paddingTop:25}}
                options={{
                    fullScreen: false,
                    density: false,
                    reload: false,
                    setting: false,
                }} 
                dataSource={dataSettled}
                columns={cols}
            />           
        </Space>
        {
            modalComplet?.type === 'complete' && <ConfirmSaveSettlement open={true}
                onOpenChange={visible => !visible && setModalComplet(undefined)}
                required={modalComplet.required}
                onSave={modalComplet.cb} 
                loading={requestActions.request?.loading || false}
            />
        }
        {
            modalSearchTrans?.type === 'search-settlement-trans' && <SettlementTransactionSearchModal open={true}
                onOpenChange={visible => !visible && setModalSearchTrans(undefined)}
                required={modalSearchTrans.required}
                onSave={modalSearchTrans.cb} 
                params={params||{}}
                dataFilter={dataSettled}
                gratisTarget={lookupData?.gratisTarget}
                gratisIncentive={lookupData?.gratisIncentive}
                skuSettled={lookupData?.skuSettled}
                loading={requestActions.request?.loading || false}
            />
        }
        </PageContainer>
    )
}
export default SettlementView
