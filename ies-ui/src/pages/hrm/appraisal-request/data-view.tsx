import { simpleRequestActions } from "@/services/model"
import { createService } from "./services"
import { useEffect, useRef, useState } from "react"
import { AppraisalRequestDetail, ApprovalAppraisalRequestItem, ReviewerMember, ReviewerMemberPayload } from "./data.types"
import { Alert, Button, Descriptions, Flex, Popconfirm, Radio, Space, Spin, Table, Tooltip, message } from "antd"
import { ActionType, ProCard, ProTable } from "@ant-design/pro-components"
import { AppraisalEmp } from "../appraisal-submit/data.types"
import { CheckOutlined, DeleteOutlined, DownloadOutlined, ExceptionOutlined, EyeOutlined, FileExcelOutlined, ImportOutlined, LoadingOutlined, PlusOutlined, UploadOutlined, } from "@ant-design/icons"
import { Model } from "../appraisal-submit/model"
import AppraisalQuickView from "./components/AppraisalQuickView"
import Status from "@/components/Status"
import ReviewMemberModal from "./components/ReviewMemberModal"
import TableView from "@/components/DataCrud/TableView"
import { AppraisalEmpAdvanceSearchParams } from "../appraisal-submit/components/list"
import { Paging } from "@/services/API"
import { SortOrder } from "antd/es/table/interface"
import PopconfirmMe from "@/pages/expense/delivery/components/PopconfirmMe"
import ImportFileButton from "@/components/ImportFileButton"
import { ImportDataItem, ImportDataResponse } from "@/services/shared/data"
import UploadData from "./components/upload-data"
import { downloadGenericReport } from "@/services/apiGateway"
import moment from "moment"
import { formatterQty1 } from "@/pages/utils"

export default ({ processInstaceId,processDefKey, forceReload,formStarted,taskCompleted,showRating5, showImport,editable }: { 
    processInstaceId: string, 
    processDefKey: string,
    forceReload?: number,
    formStarted?:boolean,
    taskCompleted?:boolean,
    showRating5?:boolean,
    showImport?:boolean,
    editable?:boolean
}) => {
    const requestActions = simpleRequestActions()
    const services = createService(requestActions)
    const [dataDetail, setDataDetail] = useState<AppraisalRequestDetail>()
    const { modals } = Model();
    const [appraisalRequestItem,setAppraisalRequestItem] = useState<ApprovalAppraisalRequestItem>()
    const actionRef = useRef<ActionType>();
    const [advanceSearchParams, setAdvanceSearchParams ] = useState<AppraisalEmpAdvanceSearchParams>({
        status: 'ALL',
    })
    const [importData, setImportData] = useState<ImportDataResponse>()
    const [loading, setLoading] = useState(false);
   
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
    const quickViewHandler = (appRequestItem: ApprovalAppraisalRequestItem) => {
        modals.showModal('QuickViewAppraisalForm');       
        setAppraisalRequestItem(appRequestItem)
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
            pagination:{...pagination,pageSize:200}
        }).then(it => {
            return it
        }) as Promise<Paging<ApprovalAppraisalRequestItem>>
    }

    const saveItemConfirmDoneHandler = (rs: ApprovalAppraisalRequestItem)=>{
        services.saveItemConfirmDone(rs.id).then(it=>{
            actionRef.current?.reloadAndRest?.()
        })
    }

    const handleDownload= async() => {
        try {
            setLoading(true)
            await downloadGenericReport(requestActions)({
                fileName: `Performance Evalutaion Request-${dataDetail?.formNo}-${moment().format()}.xls`,
                type: 'EXCEL',
                data: {
                    reportName:'performance_evaluation_request',
                    reportPath: '/Reports/hrm',
                    data: [      
                       {key:'processInstaceId', value: processInstaceId},
                       {key:'formNo', value: dataDetail?.formNo},
                    ]
                }
            }).then(()=>{
                setLoading(false)
            })
        } catch (error: any) {
            message.error(error.message || "Failed to generate report.")
            setLoading(false)
        }            
    };

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
                    extraRightFilter={
                        (showImport && !taskCompleted) && <Flex gap={2}>
                            <ImportFileButton<ImportDataItem>
                                importedKey="PERFORMANCE_REVIEW_REQUEST"
                                onDataResponse={data => {
                                    setImportData(data)
                                }}
                                key={'PERFORMANCE-REVIEW-REQUEST'}
                                onHandleChange={(status) => {
                                    setLoading(status == 'uploading');
                                    if (status == 'done') {
                                        message.info('Data uploaded.');
                                    }
                                }}
                            />
                            <Button type="link" loading={loading}  icon={<DownloadOutlined/>} onClick={handleDownload}>Export</Button>
                        </Flex>
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
                        {title: 'Self- Rating', dataIndex: 'rating1',sorter:'rating1',
                            render: (_: any, r: any) => {
                                return formatterQty1.format(r.rating1)
                            }
                        },
                        {title: "Manager's Rating", dataIndex: 'rating3',sorter:'rating3',
                            render:(_,r)=> {
                                return (r?.rating3==0 ?'-':  r?.rating3==-1.0 ?'-': formatterQty1.format(r?.rating3||0))
                            }
                        },
                        {title: 'Final Score', dataIndex: 'rating5',sorter:'finalScore',
                            render:(_,r)=>  (dataDetail?.status=='REJECT' ||(dataDetail?.status!='COMPLETED' && formStarted)) || !r?.finalScore||r?.finalScore==0 ?'-': formatterQty1.format(r?.finalScore)
                        },
                        {
                            title:'',dataIndex:'status',
                            render:(_,r)=> !dataDetail?<LoadingOutlined spin/> : (r.status=='PENDING' && dataDetail?.status=='PENDING') && (editable&&!taskCompleted)? 
                            <PopconfirmMe placement="leftBottom" title='Confirmation' description="Are you sure?"
                            onConfirm={()=>{
                                saveItemConfirmDoneHandler(r)
                            }}
                            >
                                <Button type="link" icon={<CheckOutlined/>}/>
                                </PopconfirmMe>
                                : <Status text={r.status=='IMPORTED'?'DONE': r.status}/>
                        }
                    ]}
                    summary={(data) => {
                        const totalRow = data.length || 1
                        var rating = 0;
                        var finalScore = 0
                        if(data.length> 0){
                            data?.forEach((it) => {
                                rating += (it.rating3||0)
                                finalScore += (it.finalScore||0)
                            });
                        }
                        const avgMRating = (rating / totalRow)
                        const avgFinalScore = (finalScore / totalRow)
                        return (
                            <Table.Summary.Row style={{ textAlign: 'right', fontWeight: 'bold' }}>
                              <Table.Summary.Cell colSpan={7} index={7}>
                                {'AVG'}
                              </Table.Summary.Cell>
                              <Table.Summary.Cell colSpan={1} index={7} align="left">
                                {avgMRating==0.00?'-':formatterQty1.format(avgMRating)} 
                              </Table.Summary.Cell>
                              <Table.Summary.Cell colSpan={2} index={8} align="left">
                                {(dataDetail?.status=='REJECT' ||(dataDetail?.status!='COMPLETED' && formStarted)) || avgFinalScore==0.00?'-':formatterQty1.format(avgFinalScore)} 
                              </Table.Summary.Cell>
                            </Table.Summary.Row>
                          )
                    }}
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
            {appraisalRequestItem && dataDetail && modals.isVisible('QuickViewAppraisalForm') && <AppraisalQuickView
                taskCompleted={ taskCompleted}
                edit={editable}
                showRating5={showRating5}
                refeshTable={refeshTable} 
                appraisalRequestItem={ appraisalRequestItem}
                // appraisalRequestItemId={appraisalRequestItem.id||0}
                // appraisalEmpId={appraisalRequestItem.appraisalEmpId} 
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
        <UploadData title="Import Performance Review Request" onCancel={() => setImportData(undefined)} open={!!importData} datasources={importData} onFinish={()=> {actionRef.current?.reloadAndRest?.()}} />
    </Spin>
}