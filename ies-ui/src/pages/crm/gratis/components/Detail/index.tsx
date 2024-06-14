import { Space, Spin, Tag, message, Button, Tooltip, Descriptions, Modal, Dropdown, Input, Radio } from 'antd';
import { useEffect, useRef, useState } from 'react';
import { history } from 'umi';
import { CaretDownOutlined, EditOutlined, EyeOutlined, FieldTimeOutlined, FileAddOutlined, FileDoneOutlined, FileExcelOutlined, FilePdfOutlined, MessageOutlined, PartitionOutlined, QuestionCircleOutlined, SelectOutlined, StopOutlined, SyncOutlined } from '@ant-design/icons';
import { CrmPaths } from '@/pages/crm';
import { ActionType, CheckCard, PageContainer, ProCard, ProList, ProTable } from '@ant-design/pro-components';
import { simpleRequestActions } from '@/services/model';
import { useSafeState } from 'ahooks';
import { GratisServices } from '../../services';
import { AdjustItem, CriteriaExportReport, GratisContract, GratisSuggestedCustomer, GratisSuggestedCustomerVisit, IncentiveSettlement, ItemSAP, SearchCriteria, SettlementCycleActivity } from '../../types';
import { formatDate, formatDateTime, toReadable } from '@/pages/utils';
import VerifyContractList from './VerifyContractList';
import { Model } from '../../model';
import VerifyContractQuickView from './VerifyContractQuickView';
import moment from 'moment';
import ConfirmModalForm from './ConfirmModalForm';
import { DownloadData, downloadReport } from '@/services/apiGateway';
import { merge, replace } from 'lodash';
import ApprovalRequestModalForm from './ApprovalRequestModalForm';
import Status from '@/components/Status';
import ProcessFlowModel from '@/models/ProcessFlowModel';
import { ProcessFlowModalMngt } from '@/pages/process-flow/components/ProcessFlowModalWrapper';
import processIcon from '@/assets/gear-white.png';
import suggestionIcon from '@/assets/suggestions.png'
import '../../../gratis/style.less'
import Popconfirm from '@/components/Popconfirm';
import AdjustTranModal from './adjust/AdjustTranModal';
import SuggestionItemAdjustTranModal from './adjust/SuggestionItemAdjustTranModal';

const ContactDetailView: React.FC<{ id: number, onRefresh?: () => void, onEdit: (id: number, cb?: () => void) => void }> = ({ id, onEdit }) => {
  const requestActions = simpleRequestActions()
  const actionRef = useRef<ActionType>();
  const actionSuggestedRef = useRef<ActionType>();
  const actionSuggestedCustVisitRef = useRef<ActionType>();
  const [data, setData] = useSafeState<IncentiveSettlement>()
  const [gContract, setGContract] = useSafeState<{ id: number, orderNo: number }>()
  const { modals } = Model();
  const [activity, setActivity] = useSafeState<SettlementCycleActivity[]>()
  const [spinTip, setspinTip] = useSafeState<string>('');
  const [criteria, setCriteria] = useState<SearchCriteria>()
  const [forceRefresh, setForceRefresh] = useState<number>(1)
  const [isSuggested,setIsSuggested] = useState<boolean>(false)
  const [criteriaSuggested, setCriteriaSuggested] = useState<SearchCriteria>()
  const [isSynchAll,setIsSynchAll] = useState<boolean>(false)
  const [suggestionData, setSuggestionData] = useState<ItemSAP[]>()

  const model = ProcessFlowModel()
  const { actions } = model
  useEffect(() => {
    try {
      loadData()
    } catch (error: any) {
      message.error(error.message || 'Failed to load data.');
    }
  }, []);
  const loadData = async () => {
    const rs = await GratisServices.fetchSettlementDetail(id).query(requestActions)
    const action = await GratisServices.fetchSettlementCycleActivityList(id).query(requestActions)
    setData(rs)
    setActivity(action)
    setspinTip('')
  }
  const handleBackHandler = () => {
    history.push(`${CrmPaths.gratisSettlement}/list`);
  };
  const onRequestHandler = async (paging?: any) => {
    return GratisServices.fetchSettlementContract({ id: id, criteria: criteria, pagination: { current: paging?.current || 0, pageSize: paging?.pageSize || 20 } }).query(requestActions).then(it => {
      return {
        success: true,
        total: it.total,
        data: it.items
      }
    })
  }
  const quickViewHandler = (id: number, orderNo: number) => {
    modals.showModal('verifyContractQuickView');
    setGContract({ id, orderNo })
  }
  const reloadQuickView = async (id: number, orderNo: number) => {
    // modals.hideModal('verifyContractQuickView')
    setGContract({ id, orderNo })
    modals.showModal('verifyContractQuickView', loadData);
    actionRef.current?.reloadAndRest?.();
    actionSuggestedRef.current?.reloadAndRest?.();
  }

  const onIssueHandler = () => {
    Modal.confirm({
      title: 'Settlement Cycle Issue', content: 'Are you sure?',
      onOk: async () => {
        try {
          await GratisServices.saveChangeStatusSettlementCycle({ id: data?.id || 0, status: 'ISSUED', remarks: '' })(requestActions)
          loadData()
          message.success("Issued successfully.")
        } catch (error: any) {
          message.error(error.message || "Failed to issue settlement cycle.")
        }
      }
    })
  }
  const onRequestApprovalHandler = (requestor: { requestorId: string; requestorBuId: number; title: string; requestTypeId: number }, cb: (v: boolean) => void) => {
    Modal.confirm({
      title: 'New Request', content: 'Are you sure?',
      onOk: async () => {
        try {
          const payload = {
            settlementCycleId: data?.id || 0,
            requester: requestor.requestorId,
            requesterBuId: requestor.requestorBuId
          }
          cb(true)
          await GratisServices.requestApprovalSettlementCycle(payload)(requestActions)
          loadData()
          message.success("Requested successfully.")
        } catch (error: any) {
          message.error(error.message || "Failed to request approval.")
        }
      }
    })
  }
  const onCancleHandler = (remarks: string, cb: (v: boolean) => void) => {
    Modal.confirm({
      title: 'Settlement Cycle Cancele', content: 'Are you sure?',
      onOk: async () => {
        try {
          await GratisServices.saveChangeStatusSettlementCycle({ id: data?.id || 0, status: 'CANCELED', remarks })(requestActions)
          loadData()
          cb(true)
          message.success("Canceled successfully.")
        } catch (error: any) {
          message.error(error.message || "Failed to cancle settlement cycle.")
        }
      }
    })
  }
  const processSettlementCycle = async () => {
    try {
      Modal.confirm({
        title: 'Settlement Calculate Cycle', content: 'Are you sure?',
        onOk: async () => {
          setspinTip('Processing...')
          await GratisServices.processSettledCalculateCycle(data?.id || 0)(requestActions)
          loadData()
          message.success("Processed successfully.")
          setspinTip('')
        }
      })

    } catch (error: any) {
      setspinTip('')
      message.error("Failed to process settlement cycle.")
    }
  }
  const onSearchHandler = (value: string) => {
    setCriteria(v => ({ ...v, searchValue: value }));
    actionRef.current?.reloadAndRest?.();
  };
  const onSearchSuggestedCustomerHandler = (value: string) => {
    setCriteriaSuggested(v => ({ ...v, searchValue: value }));
    actionSuggestedCustVisitRef.current?.reloadAndRest?.();
  };
  const onSearchStatusHandler = (value: string) => {
    setCriteria(v => ({ ...v, status: value }));
    actionRef.current?.reloadAndRest?.();
  };
  const dataReport = (data: { id?: number, label?: string, status?: string, contractTypeCode?: string }, exportType: 'PDF' | 'EXCEL'): DownloadData<CriteriaExportReport> => {

    var direct = data?.contractTypeCode == 'OTHER' ? 'Display':data?.contractTypeCode == 'IN_DIRECT' ?'Indirect' : 'Direct'
    var issued = data?.status == 'ISSUED' ? 'Issued' : ''
    var reportName = replace('SettlementIncentive@@##Report', '@@', direct)
    reportName = replace(reportName, '##', issued)
    return {
      reportName: 'gratis-settlement-cycle-report',
      fileName: `Settlement-Cycle-${data?.label}`,
      type: exportType,
      data: {
        id: data?.id || 0,
        reportName: reportName
      }
    }

  }
  /** Enable Button : Process Status              && Status                         && Request Status
   * -----------------------------------------------------------------------------------------------
   * Cancel         : created || Processed_cycle  && Pending                        && NONE || Rejected  
   * Issue          : Processed_cycle             && Pending                        &&  Completed
   * Process Cycle  : created                     && Pending
   * Preview        : Processed_cycle             && Pending || Issued || canceled
   * Export         : Processed_cycle             && Pending || Issued
   * Verify         : created || Processed_cycle  && Pending                         && !PENDING 
   * New Request    : Processed_cycle             && Pending                         && NONE || Rejected  
  */
  const isPending = data?.status === 'PENDING' ? true : false
  const isCanceled = data?.status === 'CANCELED' ? true : false
  const isIssued = data?.status === 'ISSUED' ? true : false
  const isCreated = data?.processStatus === 'CREATED' ? true : false
  const isProcessCalculate = data?.processStatus === 'PROCESSED_CYCLE' ? true : false
  const isDirect = data?.contractType?.code === 'DIRECT' ? true : false
  const isInDirect = data?.contractType?.code === 'IN_DIRECT' ? true : false
  const isOther = data?.contractType?.code === 'OTHER' ? true : false

  const isRequestCompleted = data?.requestStatus == 'COMPLETED' ? true : false
  const isRequestRejected = data?.requestStatus == 'REJECTED' ? true : false
  const isRequestNA = data?.requestStatus == 'NONE' ? true : false
  const isRequestPending = data?.requestStatus == 'PENDING' ? true : false

  const stausText = (data?.requestStatus == 'NONE' || data?.status != 'PENDING') ? data?.status : (data?.requestStatus == 'COMPLETED' ? 'APPROVED' : data?.requestStatus)
  const contractTypeDirect = data?.contractType?.code=='DIRECT'?true:false
  const groupTypeOther=data?.contractType?.code=='OTHER'?true:false
  const  optionsStatus=[
    { label: "All", value: "ALL",sort:1 },
    { label: "Achieved", value: "ACHIEVED",sort:2 },   
    { label: "Failed", value: "FAILED",sort:4 }
  ]
  if(!contractTypeDirect){
    optionsStatus.push({ label: "Achieved*", value: "N-ACHIEVED",sort:3 })
  }
  const synchroGratisCustomerVisit= async (tranType: string,gSettledId:number,gVerifyId?: number,scheduleIds?:number[])=>{
    try {
      await GratisServices.synchroGratisCustomerVisitSchedule(tranType,gSettledId,gVerifyId,scheduleIds)(requestActions)                       
      // cb(true)
      actionSuggestedCustVisitRef.current?.reload()
      // onFinish()
      loadData()
    }catch (error: any) {
        message.error(error.message || 'Failed to change status.')
    }
  }
  const synchroGratisCustVisitAll=async (gSettledId:number)=>{
    Modal.confirm({
      title: 'Synch All', content: 'Are you sure to update all customer visit schedule?',
      onOk: async () => {
        synchroGratisCustomerVisit('all',gSettledId,-1)
      }
    })
  }
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
                    actionSuggestedRef.current?.reload()
                    // onFinish()
                    // loadData()
                }catch (error: any) {
                    message.error(error.message || 'Failed to change status.')
                }
            }
        })  
    }      
  }
  const initailSuggestionData =async (incentiveSettlementId:number,verifyId: number)=>{
    setSuggestionData(undefined)
    await GratisServices.getListSuggestionItemAdjustment(incentiveSettlementId,verifyId).query(requestActions).then(it=>{
      setSuggestionData(it)
    })
   
  }  

  return (
    <Spin spinning={requestActions.request?.loading || false} tip={spinTip}>
      <PageContainer
        breadcrumb={undefined}
        onBack={handleBackHandler}
        title={`Settlement Label: ${data?.label}`}
        extra={
          <Space key="settlement_cycle_actions">
            {data?.processInstId && <Button onClick={() => actions.loadDiagram(data?.processInstId)} icon={<PartitionOutlined />}>Diagram</Button>}
            {isProcessCalculate && isPending && (isRequestNA || isRequestRejected) &&
              <ApprovalRequestModalForm required
                forceRefresh={forceRefresh}
                title={`New Request: ${data?.contractType?.name} | ${data?.label} - Form ${formatDate(data?.startedDate, 'MMM YYYY')} To ${formatDate(data?.endedDate, 'MMM YYYY')}`}
                settleId={data?.id || 0} submitText='Submit'
                onSave={(requestor, cb) => onRequestApprovalHandler(requestor, cb)}
                trigger={<Button type='primary' key="1" icon={<FileAddOutlined />} onClick={() => { setForceRefresh(i => i + 1) }}>New Request</Button>}
              />
            }
            {isProcessCalculate && isPending && isRequestCompleted && <Button onClick={onIssueHandler} type='primary' key="1" icon={<FileDoneOutlined />}>Issue</Button>}
            {(isCreated || isProcessCalculate) && isPending && (isRequestNA || isRequestRejected) && <ConfirmModalForm title={''} submitText='Cancel' required onSave={(remarks, cb) => onCancleHandler(remarks, cb)} trigger={<Button key="0" danger icon={<StopOutlined />}>Cancel</Button>} />}
            {isCreated && isPending && <Button type='primary' key="1" style={{padding:'0px 8px 0px 8px'}} icon={<img src={processIcon} width={25} height={25}/>} onClick={processSettlementCycle}>Process Cycle</Button>}
            {isProcessCalculate && (isPending || isIssued) && <Dropdown key="3" trigger={['click']} menu={{
              items: [{
                label: 'Settlement Cycle', key: 'gratis-settlement-cycle-report', icon: <FileExcelOutlined />, onClick: () => {
                  return downloadReport<CriteriaExportReport>(requestActions)(dataReport({ id: data?.id, label: data?.label, status: data?.status, contractTypeCode: data?.contractType?.code }, 'EXCEL'))
                }
              }, {
                label: 'Settlement Cycle (PDF)', key: 'gratis-settlement-cycle-report-pdf', icon: <FilePdfOutlined />, onClick: () => {
                  return downloadReport<CriteriaExportReport>(requestActions)(dataReport({ id: data?.id, label: data?.label, status: data?.status, contractTypeCode: data?.contractType?.code }, 'PDF'))
                }
              },]
            }}
            ><Button icon={<CaretDownOutlined />}>Export</Button></Dropdown>}
          </Space>
        }
      >
        <Space direction='vertical' size={'small'} style={{ width: '100%' }}>
          <ProCard title='Setlement Cycle' headerBordered size='small'>
            <Descriptions column={4}>
              <Descriptions.Item label="Agreetment Type">{data?.contractType?.name}</Descriptions.Item>
              <Descriptions.Item label="Created By">{data?.createdBy}</Descriptions.Item>
              <Descriptions.Item label="Created Date">{formatDate(data?.createdDate)}</Descriptions.Item>
              <Descriptions.Item label="Status"><Status value={stausText} text={stausText || 'PENDING'} /></Descriptions.Item>
              <Descriptions.Item label="For the period From" >{`${formatDate(data?.startedDate, 'MMM YYYY')} To ${formatDate(data?.endedDate, 'MMM YYYY')}`}</Descriptions.Item>
              <Descriptions.Item label="Remarks" span={2}>{data?.description}</Descriptions.Item>
              <Descriptions.Item label="Form No">{data?.formNo}</Descriptions.Item>
            </Descriptions>
          </ProCard>
          <ProCard title='' headerBordered size='small'
            extra={
              <Space>
                <CheckCard.Group value={isSuggested?'suggestion':undefined}
                  onChange={(e)=>{
                    setIsSuggested(e?.toString()=='suggestion'?true:false)
                  }}
                >
                  <CheckCard avatar={<img src={suggestionIcon} style={{height:18, width:21}}/>} title='Adjustable Customer' size='small'  value="suggestion"  style={{width:'190px',borderStyle:'dashed'}}/>
                </CheckCard.Group>
              </Space>
            }
          >
            {!groupTypeOther&&isSuggested&&<ProTable<GratisSuggestedCustomer>
               actionRef={actionSuggestedRef}
               search={false}
               size='small'
               options={{
                 fullScreen: false,
                 density: false,
                 reload: true,
                 setting: false,
               }}     
                headerTitle={               
                  <Space>
                    <Input.Search allowClear onSearch={onSearchSuggestedCustomerHandler} />                    
                  </Space>    
                } 
                request={async (paging) => {
                  return GratisServices.fetchSuggestedCustomer({ id: id, criteria: {...criteriaSuggested,filter:'suggestion'}, pagination: { current: paging?.current || 0, pageSize: paging?.pageSize || 20 } }).query(requestActions).then(it => {
                    return {
                      success: true,
                      total: it.total,
                      data: it.items
                    }
                  })
                }}
                rowKey={'id'}
                columns={[{
                  title:'Verified Date',
                  dataIndex: 'contractId',
                  render: (_, r) => (
                    <Space size={1}>
                      <Tooltip title="Quick data review">
                        <Button
                          type="link"
                          size="small"
                          icon={<EyeOutlined />}
                          onClick={() => quickViewHandler(r?.gcontractId, r?.orderNo-1)}
                        >{r.durationText}</Button>
                      </Tooltip>                      
                    </Space>
                  ),
                }, {
                  title: 'Agreement Name',
                  dataIndex: 'gContractNo',
                  render: (_, r) => <Tooltip title={!r?.terms ? 'No Term' : r?.terms}><MessageOutlined /> {r?.contractNo}</Tooltip>
                },{
                  title:'Total Qty',
                  dataIndex:'percentage',
                  render: (_, r) => r?.percentage? <div><span>{`${r?.percentage}%`}</span><div style={{padding:2,fontSize:13,color:'#b49900',borderRadius:5}}>{`(${r?.qty}/${r?.targets})`}</div></div>:'-'
                },{
                  title:'+Qty',
                  dataIndex: 'percentLess',
                  render: (_, r) => {
                    const so = r?.soQty>0? `SO: ${r?.soQty}`:''
                    const inv = r.soInvQty>0 ? `INV: ${r?.soInvQty}`:''
                    return r?.percentLess? <div>
                      <span>{`${r?.percentLess}%`}</span>
                      <div style={{padding:2,fontSize:13,color:'#b49900',borderRadius:5}}>
                        {`(${r?.qtyLess}/${r?.targets}) ${so} ${inv}`}
                      </div>
                    </div>:'-'
                  }
                },/* {
                  title: 'Customer Code',
                  dataIndex: 'gcontractId',
                  render: (_, r) => r?.customer?.code
                },*/ {
                  title: 'Customer',  
                  render: (_, r) =>    <span>{r.customer?.code} - {r.customer?.name}</span>
                }, {
                  title: 'Brand',  
                  render: (_, r) => r.brand
                }, {
                  title: 'Status',
                  dataIndex: 'Status',
                  render: (_, r) => <Status text={r?.status||'FAILED'} value={r?.status} />
                },{
                  title: 'Action',
                  align: 'center',
                  width: 15,
                  render: (_,r) => //<Button type='link' icon={<EditOutlined/>}>Adjust</Button>
                  <SuggestionItemAdjustTranModal loading={requestActions.request?.loading} data={suggestionData ||[]} incentiveSettlementId = {r.incentiveSettlementId} verifyId={r.gcontractVerifyId} customerCode={r.customer?.code} title={'Adjustment'} 
                    onSave={(status, remarks, adjItems, cb) => adjustHandler(r.gcontractVerifyId, adjItems, cb)} 
                    trigger={<Button type='link' icon={<EditOutlined/>} onClick={()=>initailSuggestionData(r.incentiveSettlementId,r.gcontractVerifyId)}>Adjust</Button>} 
                  />
                }
              ]} 
            />}
            {groupTypeOther&&isSuggested&&<ProTable<GratisSuggestedCustomerVisit>
               actionRef={actionSuggestedCustVisitRef}
               search={false}
               size='small'
               options={{
                 fullScreen: false,
                 density: false,
                 reload: true,
                 setting: false,
               }}     
                headerTitle={               
                  <Space>
                    <Input.Search allowClear onSearch={onSearchSuggestedCustomerHandler} />       
                    {isPending&&isSynchAll&&<Button type='primary' icon={<SyncOutlined/>} onClick={()=>synchroGratisCustVisitAll(data?.id||0)}>Synch All</Button>}         
                  </Space>    
                } 
                request={async (paging) => {
                  return GratisServices.fetchSuggestedCustomerVisit({ gSettledId: id,criteria:{...criteriaSuggested}, pagination: { current: paging?.current || 0, pageSize: paging?.pageSize || 20 } }).query(requestActions).then(it => {
                    setIsSynchAll(it.total||0>0?true:false)
                    return {
                      success: true,
                      total: it.total,
                      data: it.items
                    }
                  })
                }}
                rowKey={'id'}
                columns={[{
                  title:'Verified Date',
                  dataIndex: 'gcontractId',
                  render: (_, r) => (
                    <Space size={1}>
                      <Tooltip title="Quick data review">
                        <Button
                          type="link"
                          size="small"
                          icon={<EyeOutlined />}
                          onClick={() => quickViewHandler(r?.gcontractId, r?.orderNo-1)}
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
                  // render: (_, r) => `${r?.customer?.code} - ${r?.customer?.name}`
                  render: (_, r) => <div>
                    <span>{r.customer?.code} - {r.customer?.name}</span>
                    <div style={{padding:2,fontSize:13,color:'#b49900',borderRadius:5}}>{r?.address}</div>
                  </div>
                }, {
                  title: 'Brand',  
                  render: (_, r) => r.brand
                },{
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
              }, 
              {
                title: 'Action',
                dataIndex: 'Status',
                render: (_, r) => isPending&&<Popconfirm title='Confirm' placement='left' description='Are you sure to update customer visit schedule?'  
                    onConfirm={()=>{ synchroGratisCustomerVisit('single', r.incentiveSettlementId,  r.gcontractVerifyId,[r.id])}}
                  > 
                    <Button type="primary" size="small" icon={<SyncOutlined/>}>Synch</Button>
                  </Popconfirm>
              }
          ]}
            />}
            {!isSuggested&&<ProTable<GratisContract>
              actionRef={actionRef}
              search={false}
              size='small'
              options={{
                fullScreen: false,
                density: false,
                reload: true,
                setting: false,
              }}
              headerTitle={
                <div style={{position:'absolute',flex:1,width:'95%'}}>
                  <div style={{float:'left'}}> 
                    <Space>
                      <Input.Search allowClear onSearch={onSearchHandler} />
                      <Radio.Group optionType="button"
                        defaultValue={"ALL"}
                        options={optionsStatus.sort((a,b)=> a.sort-b.sort )}
                        onChange={(e) => {
                          onSearchStatusHandler(e.target.value)
                        }}
                      />
                    </Space>
                  </div>
                  <div style={{float:'left', paddingLeft:15, marginTop:0}}> 
                    <Space>
                      <CheckCard.Group value={criteria?.filter} style={{border:0}}
                        onChange={(e)=>{
                          setCriteria(v => ({ ...v, filter: e?.toString() }));
                          actionRef.current?.reloadAndRest?.();
                        }}
                      >
                        <CheckCard bordered={false} avatar={<EditOutlined/>} title='Adjusted' size='small'  value="adjusted" style={{width:'110px',borderStyle:'dashed'}}/>
                        {/* {criteria?.status=='FAILED' &&<CheckCard avatar={<img src={suggestionIcon} style={{height:18, width:21}}/>} title='Suggestion' size='small'  value="suggestion"  style={{width:'130px'}}/>}                   */}
                      </CheckCard.Group>
                    </Space>
                  </div>
                </div>
              }
              request={async (paging) => {
                return GratisServices.fetchSettlementContract({ id: id, criteria: criteria, pagination: { current: paging?.current || 0, pageSize: paging?.pageSize || 20 } }).query(requestActions).then(it => {
                  return {
                    success: true,
                    total: it.total,
                    data: it.items
                  }
                })
              }}
              rowKey={'id'}
              columns={[{
                width: 20,
                render: (_, r) => (
                  <Space size={1}>
                    <Tooltip title="Quick data review">
                      <Button
                        type="link"
                        size="small"
                        icon={<EyeOutlined />}
                        onClick={() => quickViewHandler(r.id, 0)}
                      />
                    </Tooltip>
                  </Space>
                ),
              }, {
                title: 'Agreement Name',
                dataIndex: 'contractNo',
                render: (_, r) => <Tooltip title={!r?.terms ? 'No Term' : r?.terms}><MessageOutlined /> {r?.contractNo}</Tooltip>
              },
              {
                  title: 'Agreetment Type',
                  render: (_, item) => item.contractType
              },/* {
                title: 'Customer Code',

                render: (_, r) =>  r?.customer?.code
              },*/ {
                title: 'Customer',

                // render: (_, r) => r?.customer?.name
                render: (_, r) => <div>
                <span>{r.customer?.code} - {r.customer?.name}</span>
                {(r?.address && r?.address!= r.customer?.name) &&<div style={{padding:2,fontSize:13,color:'#b49900',borderRadius:5}}>{r?.address}</div>}
            </div>
              }, {
                title: 'Brand',

                render: (_, r) => r.brand
              }, {
                title: 'Start Date',
                dataIndex: 'contractNo',
                render: (_, r) => formatDate(r.effectiveDate)
              }, {
                title: 'End Date',
                dataIndex: 'contractNo',
                render: (_, r) => formatDate(r.expiryDate)
              }, {
                title: 'Status',
                render: (_, r) => {
                  var status = r.achieved == 0 ? 'Failed' : 'Achieved'
                  var statusText = (r.months || 0) > 1 ? r.achieved + '/' + r.months + ' | Achieved' : toReadable(status)
                  return <Space>
                    {(r.months || 0) > 1 ?<span style={{border:0, color: (r.achieved == 0 ? '#ff4d4f' : '#52c41a')}}>
                      {statusText}{((r?.achieved || 0) > 0 && (r?.achieved || 0) != (r.months || 0)) && <span style={{ color: 'red' }}>*</span>}
                    </span>:<Status text={status} value={status} />
                    }
                  </Space>
                }
              }
              ]}
              expandable={!contractTypeDirect?{
                expandedRowRender: (record => <VerifyContractList quickViewHandler={quickViewHandler} item={record} />),
                rowExpandable: record => true,
              }:{}}
            />}
          </ProCard>
          <ProCard title='Activities' defaultCollapsed collapsible headerBordered size='small'>
            <ProList<SettlementCycleActivity>
              metas={{
                avatar: { render: (_, r) => <FieldTimeOutlined /> },
                title: { render: (_, r) => `${toReadable(r.action)} by ${r?.actionBy}` },
                subTitle: { render: (_, r) => `${moment(moment(r.actionDate)).fromNow()}` },
                description: {
                  dataIndex: 'comment',
                  render: (_, r) => {
                    return <>{r.linkId > 0 ? <Button icon={<EyeOutlined />} size='small' type='link' onClick={() => quickViewHandler(r.linkId, r.linkNo - 1 || 0)} /> : ''} {r.comment}</>
                  }
                },
                extra: { render: (r: SettlementCycleActivity) => formatDateTime(moment(r.actionDate)) }
              }}
              dataSource={activity}
            />
          </ProCard>
        </Space>
        {gContract && modals.isVisible('verifyContractQuickView') && <VerifyContractQuickView
          gSettledId={id}
          gContractId={gContract.id}
          status={data?.status || ''}
          groupTypeCode={data?.contractType?.code}
          currentNum={gContract.orderNo}
          isVerify={(isCreated || isProcessCalculate) && isPending && (isDirect||isInDirect||isOther) && (isRequestNA || isRequestRejected)}
          open={modals.isVisible('verifyContractQuickView')}
          onOpenModalChange={(v: any) => !v && modals.hideModal('verifyContractQuickView')}
          reloadQuickView={reloadQuickView}
        />}
        <ProcessFlowModalMngt workflowModel={model} />
      </PageContainer>
    </Spin>
  );
};

export default ContactDetailView;
function waitTime(arg0: number) {
  throw new Error('Function not implemented.');
}

