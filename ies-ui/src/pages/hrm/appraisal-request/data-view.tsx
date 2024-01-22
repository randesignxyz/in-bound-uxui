import { simpleRequestActions } from "@/services/model"
import { createService } from "./services"
import { useEffect, useRef, useState } from "react"
import { AppraisalRequestDetail, ApprovalAppraisalRequestItem, ReviewerMember, ReviewerMemberPayload } from "./data.types"
import { Alert, Button, Descriptions, Popconfirm, Radio, Space, Spin, Tooltip, message } from "antd"
import { ActionType, ProCard, ProTable } from "@ant-design/pro-components"
import { AppraisalEmp } from "../appraisal-submit/data.types"
import { CheckOutlined, DeleteOutlined, EyeOutlined, LoadingOutlined, PlusOutlined, } from "@ant-design/icons"
import { Model } from "../appraisal-submit/model"
import AppraisalQuickView from "./components/AppraisalQuickView"
import Status from "@/components/Status"
import ReviewMemberModal from "./components/ReviewMemberModal"
import TableView from "@/components/DataCrud/TableView"
import { AppraisalEmpAdvanceSearchParams } from "../appraisal-submit/components/list"
import { Paging } from "@/services/API"
import { SortOrder } from "antd/es/table/interface"
import PopconfirmMe from "@/pages/expense/delivery/components/PopconfirmMe"

export default ({ processInstaceId, forceReload,formStarted,taskCompleted,showRating5,editable }: { 
    processInstaceId: string, 
    forceReload?: number,
    formStarted?:boolean,
    taskCompleted?:boolean,
    showRating5?:boolean,
    editable?:boolean
}) => {
    const requestActions = simpleRequestActions()
    const services = createService(requestActions)
    const [dataDetail, setDataDetail] = useState<AppraisalRequestDetail>()
    const { modals } = Model();
    const [appraisalEmp,setAppraisalEmp] = useState<ApprovalAppraisalRequestItem>()
    const actionRef = useRef<ActionType>();
    const [advanceSearchParams, setAdvanceSearchParams ] = useState<AppraisalEmpAdvanceSearchParams>({
        status: 'ALL',
    })
   
    useEffect(() => {
        (async () => {
            loadData()
        })()
    }, [forceReload,processInstaceId])
    const loadData = async ()=>{
        try {
            const rs = await services.findByInstId(processInstaceId)
            setDataDetail(rs)
        
        } catch (error: any) {
            message.error(error.message || 'Failed to load data.')
        }
    }
    const quickViewHandler = (appEmp: ApprovalAppraisalRequestItem) => {
        modals.showModal('QuickViewAppraisalForm');       
        setAppraisalEmp(appEmp)
    }
    const memberHander = ()=>{
        modals.showModal('ReviewMemberForm')
    }
    const refeshTable=( isClose:()=>boolean)=>{  
        loadData()
        if(isClose()){
            modals.hideModal('QuickViewAppraisalForm')
        }
        actionRef.current?.reloadAndRest?.()
    }
    const saveMember = async (member: ReviewerMember,resetFields:()=>void) => {
        var payload = {
            id: member.id,
            processInstId: processInstaceId,
            empId: member.empId,
            empNo: member.empNo,
            empName: member.empName,
            remarks: member.remarks
        } as ReviewerMemberPayload
        await services.saveMember(payload)
        resetFields()
        message.info('saved successfully.')
        loadData()
    }
    const onRequestHandler = async (  
        criteria?: { searchValue?: string; advanceSearch?:AppraisalEmpAdvanceSearchParams},
        pagination?: {
            pageSize?: number;
            current?: number;
          },
          sort?: Record<string, SortOrder>,
      ) => {
        var params = {...criteria,processInstaceId: processInstaceId, keyword: criteria?.searchValue, advanceSearch: criteria?.advanceSearch || advanceSearchParams}  
        return services.fetchApprovalAppraisalRequestItemPaging({
            criteria: params,
            sort:sort,
            pagination:{...pagination,pageSize:100}
        }).then(it => {
            return it
        }) as Promise<Paging<ApprovalAppraisalRequestItem>>
    }

    const saveItemConfirmDoneHandler = (rs: ApprovalAppraisalRequestItem)=>{
        services.saveItemConfirmDone(rs.id).then(it=>{
            actionRef.current?.reloadAndRest?.()
        })
    }

    return <Spin spinning={requestActions.request?.loading}>
        <Space direction="vertical" style={{ width: '100%' }}>       
            <Descriptions size='small' column={1}>
                <Descriptions.Item label={<b>Title</b>}>
                    {dataDetail?.title}
                </Descriptions.Item>
                <Descriptions.Item label={<b>Request Type</b>}>
                    {dataDetail?.requestType?.label}
                </Descriptions.Item>
            </Descriptions>
            <Alert type="info" message={dataDetail?.requestType?.description} />
            
            <ProCard  size="small" bordered title="Performance Appraisal List">
                <TableView<ApprovalAppraisalRequestItem, {searchValue?: string;  advanceSearch?:AppraisalEmpAdvanceSearchParams}>                     
                    displayOnly = {true}
                    cardProps={false}
                    tableProps={{
                        actionRef: actionRef, 
                        options:{
                            fullScreen: false,
                            density: false,
                            reload: false,
                            setting: false,
                        }
                    }}
                    extraFilter={               
                        <Space align="baseline" style={{right:'12px'}}>
                            <Radio.Group
                                  value={advanceSearchParams?.status || 'ALL'}
                                  onChange={(e) => {                           
                                      setAdvanceSearchParams((v) => ({
                                          ...v,
                                          status: e.target.value
                                      }))
                                      actionRef.current?.reloadAndRest?.()
                                  }}
                            >
                                <Radio.Button value="ALL">All</Radio.Button>
                                <Radio.Button value="PENDING" style={{paddingRight:'5px'}}>Pending</Radio.Button>
                                <Radio.Button value="DRAFTED">Drafted</Radio.Button>
                                <Radio.Button value="DONE">Done</Radio.Button>
                            </Radio.Group>
                        </Space>                        
                    }
                    actionHandlers={{
                        onRequest:onRequestHandler
                    }}
                    columns={[    
                        {
                            title:'Employee No', 
                            dataIndex: 'empNo',
                            sorter:'empNo',
                            width: 120,
                            render: (_, r)=>(
                            <Space size={1}>            
                                <Tooltip title="Quick data review">
                                <Button
                                    type="link"
                                    size="small"
                                    icon={<EyeOutlined />}
                                    onClick={() => quickViewHandler(r)}
                                />
                                </Tooltip>
                                {r.status=='PENDING'? <span style={{color:'red'}}>{r.empNo}</span>:r.empNo}
                            </Space>
                            ),
                        },                 
                        {title:'Employee Name', dataIndex: 'empName',sorter:'empName',
                            render:(_,r)=> r.status=='PENDING'? <span style={{color:'red'}}>{r.empName}</span>:r.empName
                        },
                        {title:'Employee Name(KH)', dataIndex: 'internalName',sorter:'internalName'},   
                        {title: 'Business Unit', dataIndex: 'buName',sorter:'buName'},
                        {title: 'Function', dataIndex: 'departmentName',sorter:'departmentName'},                    
                        {title: 'Job Title', dataIndex: 'jobTitle',sorter:'jobTitle'},
                        {title: 'Self- Rating', dataIndex: 'rating1',sorter:'rating1'},
                        {title: 'FM Rating', dataIndex: 'rating3',sorter:'rating3',
                            render:(_,r)=> {
                                return (r?.rating3==0 ?'-':  r?.rating3==-1.0 ?'-': r.rating3)
                            }
                        },
                        {title: 'Agreed Rating', dataIndex: 'rating5',sorter:'rating5',
                            render:(_,r)=>  (dataDetail?.status=='REJECT' ||(dataDetail?.status!='COMPLETED' && formStarted)) || !r?.rating5||r?.rating5==0 ?'-': r?.rating5
                        },
                        {
                            title:'',dataIndex:'status',
                            render:(_,r)=> !dataDetail?<LoadingOutlined spin/> : (r.status=='PENDING' && dataDetail?.status=='PENDING') && (editable&&!taskCompleted)? 
                            <PopconfirmMe placement="leftBottom" title='Confirmation' description="Are you sure?"
                            onConfirm={()=>{
                                saveItemConfirmDoneHandler(r)
                            }}
                            >
                                <Button type="default" icon={<CheckOutlined/>}>Done</Button>
                                </PopconfirmMe>
                                : <Status text={r.status}/>
                        }
                    ]}
                />
            </ProCard>
            {((dataDetail?.members||[]).length>0 || !formStarted) &&<ProCard  size="small" bordered title="Board Member List">                
                <ProTable size="small"
                    search={false} 
                    cardProps={false}
                    options={false}
                    pagination={false} 
                    dataSource={dataDetail?.members}
                    columns={[
                        {
                            title:<div>Name<span style={{color:'red'}}>*</span></div>,
                            width: '20%',
                            dataIndex:'empName'
                        },
                        {
                            title:'Remarks',
                            width: '80%',
                            dataIndex:'remarks'
                        },
                        {
                            title:'',width: 50, 
                            render:(_,r)=> (dataDetail?.status!='COMPLETED'  && editable && !taskCompleted)&&<Popconfirm
                                placement="topLeft"
                                title={'Are you sure to remove?'} 
                                onConfirm={()=> {                                
                                    services.deleteMember(r.id).then(rs=>{
                                        message.info('removed successfully.')
                                        loadData()
                                    })
                                    
                                }}
                                ><Button  size='small' danger  style={{padding:0}}
                                    type="link" key={`del-${r.id}`} icon={<DeleteOutlined size={3}/>}
                            /></Popconfirm> 
                        }
                    ]}
                />
                {(dataDetail?.status!='COMPLETED' && editable && !taskCompleted)&&<Button  size="small"
                    style={{ width: '100%', marginBottom: 8 }}
                    type="dashed" icon={<PlusOutlined/>}
                    onClick={memberHander}
                >Add More {taskCompleted}</Button>}
            </ProCard>}
            {appraisalEmp && dataDetail && modals.isVisible('QuickViewAppraisalForm') && <AppraisalQuickView
                taskCompleted={ taskCompleted}
                edit={editable}
                showRating5={showRating5}
                refeshTable={refeshTable} 
                appraisalRequestItemId={appraisalEmp.id||0}
                appraisalEmpId={appraisalEmp.appraisalEmpId} 
                open={modals.isVisible('QuickViewAppraisalForm')}  
                onOpenModalChange={(v: any) => !v && modals.hideModal('QuickViewAppraisalForm')}
              />}
            {modals.isVisible('ReviewMemberForm') &&<ReviewMemberModal
                 open={modals.isVisible('ReviewMemberForm')}  
                 onOpenModalChange={(v: any) => !v && modals.hideModal('ReviewMemberForm')}
                 saveHandler={(data: ReviewerMember,resetFields:()=>void)=>{
                    if((dataDetail?.members?.filter(it=> it.empNo==data.empNo).length==0)){
                        saveMember(data,resetFields)       
                    }   
                 }}
                 checkList={dataDetail?.members}
            />}
        </Space>
    </Spin>
}