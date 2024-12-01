import { Button, Checkbox, message, Radio, Space, Spin, Tabs, Tooltip, Typography, Splitter, Flex, Row, Col, Input, Table, Descriptions, Card } from "antd"
import { AppraisalAdvanceParams, AppraisalEmp, AppraisalEmpStatusTotal, AppraisalOverallPerformanceRating, OverallPerformanceHeadCountRs, PerformanceFunctionHeadCountCriter } from "../../data.types"
import { useModel } from 'umi'
import TableView from "@/components/DataCrud/TableView";
import { SortOrder } from "antd/es/table/interface";
import { simpleRequestActions } from "@/services/model";
import { createService } from "../../services";
import { Paging } from "@/services/API";
import { formatDateTime, formatterPercentage0} from "@/pages/utils";
import Status from "@/components/Status";
import { ExportOutlined, EyeOutlined, FileExcelOutlined, FilterOutlined, PicRightOutlined, PlusOutlined, UnorderedListOutlined } from "@ant-design/icons";
import AppraisalFormQuickView from "../quick-view/index";
import { useEffect, useRef, useState } from "react";
import AppraisalRequestForm from "../../AppraisalSubmitForm";
import { LightFilter, ProCard, ProFormSelect, ProList } from "@ant-design/pro-components";
import ProTable, { ActionType } from '@ant-design/pro-table';
import SubmitAllListModal from "./SubmitAllListModal";
import { CheckboxChangeEvent } from "antd/es/checkbox";
import { Model } from "../../model";
import { DownloadData, downloadReport } from '@/services/apiGateway';
import { replace } from "lodash";
import moment from "moment";
import AdvanceApprasialSubmitSearch from "../AdvanceApprasialSubmitSearch";
import { AppraisalLookupData, PerformanceEvaluationAccessRs } from "@/pages/hrm/appraisal-request/data.types";
import { createService as screateServiceRequesst } from "@/pages/hrm/appraisal-request/services"
import styles from '@/pages/hrm/style.less';
import Search from "antd/lib/input/Search";
import { Line } from "@ant-design/plots";
import { render } from "@testing-library/react";
import ticket from "@/pages/queue/ticket";
import Center from "@/pages/account/center";
import category from "@/pages/sale/retailer/category";
import AdvancePerformanceEvaluationSearch from "../AdvancePerformanceEvaluationSearch";
import company from "@/pages/delivery/company";


const { Link } = Typography;

interface Props {
    onDetail?: (data: AppraisalEmp) => void
    forceRefresh: number
}
export interface AppraisalEmpAdvanceSearchParams {
    status?: string
    pendingFilter?: string[]
    drafted?: boolean
    bu?: number[]
    department?: number[]
    appraisalPeriodId?: number
}
export interface PerformanceEvaluationAdvanceSearchParams {
    status?: string
    pendingFilter?: string[]
    drafted?: boolean
    appraiser?:number
    company?: number[]
    function?: number[]
    appraisalPeriodId?: number
}
interface LightFilterProp {
    pendingFilter?: string[]
}

const AppraisalList: React.FC<Props> = ({ forceRefresh, onDetail }) => {
    const { data, modals } = Model();
    const actionRef = useRef<ActionType>();
    const actionTargetRef = useRef<ActionType>();
    const cacheList = useModel('dataList');
    const requestActions = simpleRequestActions();
    const srv = createService({ request: requestActions })
    const srvRequest = screateServiceRequesst(requestActions)
    const [appraisalEmp, setAppraisalEmp] = useState<AppraisalEmp>()
    const [total, setTotal] = useState<AppraisalEmpStatusTotal>()
    const [forceChange, setForceChange] = useState<number>(0)
    const [period,setPeriod] = useState<AppraisalLookupData[]>()

    const [advanceSearchParams, setAdvanceSearchParams] = useState<AppraisalEmpAdvanceSearchParams>({status: 'ALL'})
    const [criteria, setCriteria] = useState<{ searchValue?: string; advanceSearch?: AppraisalEmpAdvanceSearchParams }>()
    const [modalVisible, setModalVisible] = useState< { type: 'ADD'; payload: AppraisalAdvanceParams } | { type: 'EDIT'; payload: AppraisalAdvanceParams } >();
    const [advanceSearch, setAdvanceSearch] = useState<{ visible: boolean }>();
    const [modalEvaluatioVisible, setModalEvaluatioVisible] = useState< { type: 'ADD'; payload: AppraisalAdvanceParams } | { type: 'EDIT'; payload: AppraisalAdvanceParams } >();
    const [advanceEvaluationSearch, setAdvanceEvaluationSearch] = useState<{ visible: boolean }>();
    
    
    /** Performance Target View ------------------------------------------------------------------------------------------------------------------------------- */
    const [activeTab, setActiveTab] = useState<string>()
    const [searchTargetValue, setSearchTargetValue] = useState<string>();
    const [overalPerfEmpDs, setOveralPerfEmpDs] = useState<AppraisalEmp[]>([]);
    const [overalPerfScore,setOveralPerfScore] = useState<AppraisalOverallPerformanceRating[]>([])
    const [overalPerfHeadCount, setOveralPerfHeadCount] = useState<OverallPerformanceHeadCountRs[]>([])
    const [overalPerfTotalHeadCount, setOveralPerfTotalHeadCount] = useState<number>(0)
    const [advanceSearchPerformEvaluationParams, setAdvanceSearchPerformEvaluationParams] = useState<PerformanceEvaluationAdvanceSearchParams>({status: 'ALL'})
    const [accessPerfEvaluation,setAccessPerfEvaluation] = useState<boolean>(false)
    const [perfEvaluationAccess,setPerfEvaluationAccess] = useState<PerformanceEvaluationAccessRs>()

    useEffect(() => {
        onLoadData()
    }, [forceChange])
    useEffect(() => {
        refeshTable()
    }, [forceRefresh])

    const onLoadData =() =>{
        srvRequest.fetchAppraisalPeriodList().then(year=>{setPeriod(year)})
        onStatusTotal(period?.[0].value||-1)
        srv.fetchPerformanceEvaluationAccess(period?.[0].value||-1).then(rs=>{
            setAccessPerfEvaluation(rs.access)
            setPerfEvaluationAccess(rs)
        })
    }
    const onStatusTotal = (perfId: number) => {
        srv.findAppraisalEmpStatusTotal(perfId).then((it: AppraisalEmpStatusTotal) => {
            setTotal(it)
        })
    }

    const onRequestHandler = (
        criteria?: { searchValue?: string; advanceSearch?: AppraisalEmpAdvanceSearchParams },
        pagination?: {
            pageSize?: number;
            current?: number;
        },
        sort?: Record<string, SortOrder>,
    ) => {
        var params = {...criteria, keyword: criteria?.searchValue, advanceSearch: criteria?.advanceSearch || advanceSearchParams }
        setCriteria(params)
        return srv.fetchPaging({
            criteria: params,
            sort: sort,
            pagination: pagination
        }).then(it => {
            return cacheList.cacheDataList({
                type: 'appraisal-submit',
                data: it
            })
        }) as Promise<Paging<AppraisalEmp>>
    }
    const quickViewHandler = (appEmp: AppraisalEmp) => {
        modals.showModal('QuickViewAppraisalForm');
        setAppraisalEmp(appEmp)
    }
    const refeshTable = () => {
        setForceChange(v => v + 1)
        actionRef?.current?.reload?.()
    }
    const createAppraisalFormHandler = () => {
        modals.showModal('CreateAppraisalForm');
    }

    const submitAllHandler = () => {
        modals.showModal('SubmitAllListView');
    }
    const onFilterStatusHandler = (values: LightFilterProp) => {
        setAdvanceSearchParams((v) => ({
            ...v,
            pendingFilter: (values?.pendingFilter || []).length > 0 ? values?.pendingFilter : undefined
        }))
        actionRef?.current?.reload?.()
    }
    const onDraftedHandler = (e: CheckboxChangeEvent) => {
        var value = e.target.checked
        setAdvanceSearchParams((v) => ({
            ...v,
            drafted: value
        }))
        actionRef?.current?.reload?.()
    }
    const onOnlyCurrentAppraisal = (value: any)=> {
        setAdvanceSearchParams((v) => ({
            ...v,
            appraisalPeriodId: value
        }))
        onStatusTotal(value)
        actionRef.current?.reloadAndRest?.();
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
            }>{total}
        </sup>
    }


    const dowloandData = (reportName: string,fileName: string): DownloadData<{ searchValue?: string; advanceSearch?: AppraisalEmpAdvanceSearchParams }> => {
        // var direct = 'Direct'
        // var issued = 'Issued'
        // var reportName = replace('performance-review@@-list-report', '@@', reportName)
        var params = { ...criteria, searchValue: criteria?.searchValue, advanceSearch: criteria?.advanceSearch || advanceSearchParams }
        // reportName = replace(reportName, '##', issued)
        return {
            reportName: reportName,
            fileName: fileName,
            type: 'EXCEL',
            data: params
        }
    }
    const dowloandExcelHandler = (fileType: string) => {
        const reportName = fileType=='Detail'? 'performance-review-detail-list-report':'performance-review-list-report'
        const fileName = fileType=='Detail'? `Performance-Review-Detail-List_${moment().toDate().toDateString()}`:`Performance-Review-List_${moment().toDate().toDateString()}`
        return downloadReport<{ searchValue?: string; advanceSearch?: AppraisalEmpAdvanceSearchParams }>(requestActions)(dowloandData(reportName,fileName))
    }
    const cols = [
        {
            title: 'Employee No #',
            sorter: 'empNo',
            width: 140,
            render: (_: any, r: any) => {
                var vali = data.validationMsgList(r)
                return (<Space size={1}>
                    <Button
                        type="link"
                        size="small"
                        icon={<EyeOutlined />}
                        onClick={() => quickViewHandler(r)}
                    />
                    <Button
                        size="small"
                        type="link"
                        icon={<ExportOutlined />}
                        onClick={async () => {
                            window.open(`/external/hrm/appraisal-submit/detail/${r.id}`, '_blank')?.focus();
                        }}
                    />
                    <a onClick={() => { onDetail?.(r) }}>
                        <Link type={(vali.length > 0) ? 'danger' : undefined}>
                            <Tooltip
                                title={(vali.length > 0) && vali.map(it => <div><b style={{ color: 'orange' }}>{it.title}: </b>{it.msg}</div>)}
                                overlayStyle={{ maxWidth: '500px' }}
                            >
                                {r.empNo}
                            </Tooltip>
                        </Link>
                    </a>
                </Space>)
            },
        },
        {
            title: 'Employee Name',
            // width: 180, 
            dataIndex: 'empName', sorter: 'empName'
        },
        {
            title: 'Employee(KH)', sorter: 'internalName', render(_: any, r: any) {
                return r.internalName
            },
        },
        { title: 'Business Unit', dataIndex: 'buName', sorter: 'buName' },
        { title: 'Function', dataIndex: 'departmentName', sorter: 'function' },
        { title: 'Job Title', dataIndex: 'jobTitle', sorter: 'jobTitle' },
        { title: 'Self- Rating', dataIndex: 'rating1', sorter: 'rating1' },
        {
            title: 'FM Rating', dataIndex: 'rating2', sorter: 'rating2',
            render: (_: any, r: any) => {
                return (r?.rating2 == 0 ? '-' : r?.rating2 == -1.0 ? '-' : r.rating2)
            }
        },
        {
            title: 'Agreed Rating', dataIndex: 'rating5', sorter: 'rating5',
            render: (_: any, r: any) => !r?.rating5 || r?.rating5 == 0 ? '-' : r?.rating5
        },
        { title: 'Modified By', sorter: 'modifiedBy', dataIndex: 'modifiedBy' },
        {
            title: 'Modified Date', sorter: 'modifiedDate', dataIndex: 'modifiedDate',
            render(_: any, r: any) {
                return r.modifiedDate && formatDateTime(r.modifiedDate)
            }
        },
        {
            title: 'Status', width: '100px', render: (_: any, r: any) => <><Status text={r.status} />
                {r.actionStatus === 'DRAFTED' && r.currentDrafted ?
                    <sup style={{
                        zIndex: 'auto',
                        minWidth: '20px',
                        padding: '0px 6px 1px 6px',
                        color: 'white',
                        fontWeight: '400',
                        fontSize: '10px',
                        lineHeight: '20px',
                        borderRadius: '10px',
                        whiteSpace: 'nowrap',
                        textAlign: 'center',
                        backgroundColor: '#faad14fa',
                    }}>Drafted</sup> : ''}
            </>
        }
    ]
    if (total?.accessRequest) {
        cols.push({
            title: 'Process Request Status', width: '120px',
            render: (_: any, r: any) => <Status text={r.requestStatus || 'NA'} />
        })
    }

    /**  Performance Targert View ---------------------------------------------------------------------------------------------------------------------*/
    const [refreashEvaluationData, setRefreashEvaluationData] = useState<number>(0)
    useEffect(()=>{
        if(forceChange==0 || (overalPerfHeadCount.length<=0 && activeTab=="2")){
            onDataLoad( period?.[0].value||0)
        }
    },[forceChange,(overalPerfHeadCount.length<=0 && activeTab=="2")])

    useEffect(()=>{
        if(refreashEvaluationData>0 && activeTab=="2"){
            const perfId = advanceSearchPerformEvaluationParams.appraisalPeriodId||-1
            onDataLoad(perfId)
        }
    },[refreashEvaluationData])

    const onDataLoad=(perfId: number)=>{
        const adSearch = {appraisalPeriodId:perfId, 
            appraiser: advanceSearchPerformEvaluationParams.appraiser,
            company: advanceSearchPerformEvaluationParams.company,
            function: advanceSearchPerformEvaluationParams.function
        }

        srv.fetchAppraisalOveralRating(perfId).then(rs=>{
            setOveralPerfScore(rs)
        })
        const data  = {...adSearch, id:perfId} as PerformanceFunctionHeadCountCriter
        srv.fetchPerformanceFunctionHeadCount(data).then(rs=>{
            setOveralPerfHeadCount(rs.data)
            setOveralPerfTotalHeadCount(rs.totalHeadCount)
        })
        const pagination ={
            pageSize: 2000,
            current: 0
        }
        
        var targetParams = {searchValue: undefined, keyword: undefined, advanceSearch: adSearch }
        srv.fetchPerformanceEvaluationPaging({
            criteria: targetParams,
            pagination: pagination

        }).then(rs=> {
            setOveralPerfEmpDs(rs.items)
        })
        actionTargetRef.current?.reloadAndRest?.();
    }

    const onSearch= (value: string) => {
        setSearchTargetValue(value)
        actionTargetRef.current?.reloadAndRest?.();
    }
    const onYearTargetAppraisal = (value: any)=> {
        setAdvanceSearchPerformEvaluationParams((v) => ({
            ...v,
            appraisalPeriodId: value
        }))
        onDataLoad(value)        
    }

    const onFilterEvaluationHandler = (v: any) => {
        setAdvanceEvaluationSearch({ visible: true })
        // setAdvanceSearchParams((v) => ({
        //     ...v,
        //     pendingFilter: (values?.pendingFilter || []).length > 0 ? values?.pendingFilter : undefined
        // }))
        // actionRef?.current?.reload?.()
    }
    
    const extraContent = (<>
        <Flex gap={1} style={{marginTop: 0, padding:0}}>
           <Col style={{padding:0, margin: 0}}>           
            <Row style={{padding:0,marginBottom:5,height: 35,width:245}}>
                <ProFormSelect style={{width:'206px' }}   allowClear={false}
                        fieldProps={{defaultValue: period?.[0].value}}
                        rules={[{required:false}]}  name={"appraisalPeriodId"}
                        options={period?.map(it => ({label: it.label, value: it.value}))}
                        onChange={onYearTargetAppraisal}
                    />
                <Button icon={<FilterOutlined/>} style={{marginLeft:2}} onClick={onFilterEvaluationHandler}></Button>
            </Row>
            <Row style={{padding:0, marginTop:0}}>
                    <Input.Search allowClear  style={{ width: '240px' }} placeholder="Search" onSearch={ onSearch} />
            </Row>
           </Col>
           
        </Flex>
    </>)

    const ListContent = ({ data }: { data: AppraisalEmp }) => (
        <Row justify="end">
        <Col flex={1}></Col>
        <Col flex={'400px'}>
            <Row><b>{data.empName}</b></Row>
            <Row>Self-Rating:<b style={{paddingLeft:5}}>{data.rating1}</b></Row>
            <Row>FM Rating:<b style={{paddingLeft:5}}>{data.rating2}</b></Row>
            <Row>Agreed Rating: <b style={{paddingLeft:5}}>{data.rating3}</b></Row>
        </Col>
        </Row>
    );
    const onPerformanceTargetRequestHandler = async (
        params: {
          pageSize?: number;
          current?: number;
          keyword?: string;
        },
        sort: Record<string, SortOrder>,
      ) => {
        const pagination ={
            pageSize: params.pageSize,
            current: params.current
        }
        var targetParams = {searchValue: searchTargetValue, keyword: searchTargetValue, advanceSearch: advanceSearchPerformEvaluationParams }
        // setCriteria(params1)
        const rs = await  srv.fetchPerformanceEvaluationPaging({
            criteria: targetParams,
            // sort: sort,
            pagination: pagination

        })
        // setOveralPerfEmpDs(rs.items)
        return  {
            success: !!rs,
            total: rs?.total,
            data: rs?.items,
          };
    }
   

    return <>
        <Tabs onChange={key => setActiveTab(key)} defaultActiveKey="1" style={{marginTop: -30}}>
            <Tabs.TabPane icon={<UnorderedListOutlined/>} tab="Performance Submission" key="1">
                <Spin spinning={requestActions.request?.loading} >
                <TableView<AppraisalEmp, { searchValue?: string; advanceSearch?: AppraisalEmpAdvanceSearchParams }>
                    cache     
                    tableProps={{
                        actionRef: actionRef,
                        options: { reload: true, density: false, fullScreen: false, setting: false },
                        toolbar: {actions: [
                            period && <div style={{marginTop: 25}}>
                                <ProFormSelect style={{width:'100%'}}   allowClear={false}
                                    fieldProps={{defaultValue: period?.[0].value}}
                                    rules={[{required:false}]}  name={"appraisalPeriodId"} label = "Year" 
                                    options={period?.map(it => ({label: it.label, value: it.value}))}
                                    onChange={onOnlyCurrentAppraisal}
                                />
                            </div>,
                            <Button style={{marginTop:0}}
                            key={'bt'}
                            type="link"
                            onClick={() => { createAppraisalFormHandler()}}
                            icon={<PlusOutlined />}
                            >New Appraisal Form</Button>,
                        ],}
                    }}
                    advanceSearch
                    extraFilter={
                        <Space align="baseline" style={{ right: '12px' }}>
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
                                <Radio.Button value="PENDING" style={{ paddingRight: '5px' }}>Pending {(total?.pending || 0 > 0) && supTitle(total?.pending || 0)}</Radio.Button>
                                <Radio.Button value="COMPLETED">Completed</Radio.Button>
                            </Radio.Group>
                            {advanceSearchParams?.status === 'PENDING' &&
                                <LightFilter<LightFilterProp>
                                    onValuesChange={(_, values) => {
                                        onFilterStatusHandler(values)

                                    }}
                                >
                                    <ProFormSelect
                                        name="pendingFilter"
                                        width={280}
                                        label="Status"
                                        mode="multiple"
                                        initialValue={advanceSearchParams.pendingFilter}
                                        options={[
                                            { label: 'Submitting', value: 'SUBMITTING' },
                                            { label: 'Submitted', value: 'SUBMITTED' },
                                            { label: 'Reviewed', value: 'REVIEWED' }
                                        ]}
                                    />

                                </LightFilter>}
                            {advanceSearchParams?.status === 'PENDING' && <Checkbox name="drafted" checked={advanceSearchParams?.drafted} onChange={onDraftedHandler}>Drafted{(total?.drafted || 0 > 0) && supTitle(total?.drafted || 0)}</Checkbox>}
                            {/*(advanceSearchParams?.status === 'PENDING' && (total?.drafted || 0) > 1) && <Space>
                                <Button type="primary" onClick={submitAllHandler}>Submit All</Button>
                            </Space>*/}
                        </Space>

                    }
                    extraRightFilter={<Flex gap={5}>
                         <Tooltip placement="bottom" title="Dowload Excel File Detail"><Button icon={<FileExcelOutlined />} onClick={()=>dowloandExcelHandler('Detail')} /></Tooltip>
                        <Tooltip placement="bottom" title="Dowload Excel File"><Button icon={<FileExcelOutlined />} onClick={()=>dowloandExcelHandler('')} /></Tooltip>
                        </Flex>
                    }
                    actionHandlers={{
                        onAdvanceSearchClicked: () => setAdvanceSearch({ visible: true }),
                        // onAdd: createAppraisalFormHandler,
                        onFirstLoad: () => onRequestHandler(),
                        onRequest: onRequestHandler,
                    }}
                    columns={cols}
                />
                {appraisalEmp && modals.isVisible('QuickViewAppraisalForm') && <AppraisalFormQuickView refreshTable={refeshTable} appraisalEmp={appraisalEmp} open={modals.isVisible('QuickViewAppraisalForm')} onOpenModalChange={(v: any) => !v && modals.hideModal('QuickViewAppraisalForm')} />}
                {modals.isVisible('CreateAppraisalForm') && <AppraisalRequestForm
                    open={modals.isVisible('CreateAppraisalForm')}
                    onOpenModalChange={(v: any) => !v && modals.hideModal('CreateAppraisalForm')}
                    refreshTable={refeshTable}
                />}
                {modals.isVisible('SubmitAllListView') && <SubmitAllListModal
                    open={modals.isVisible('SubmitAllListView')}
                    onOpenModalChange={(v: any) => !v && modals.hideModal('SubmitAllListView')}
                    refreshTable={refeshTable}
                />
                }
                {/*  advance search */}
                <AdvanceApprasialSubmitSearch
                title="Advance Search"
                closable
                open={advanceSearch?.visible} 
                dataItem={modalVisible?.payload}
                onClose={() => {
                    setAdvanceSearch({ visible: false });
                }}
                onReset={() => {  
                    setAdvanceSearchParams((v) => ({ ...v,bu:undefined,department:undefined  }));
                    actionRef.current?.reloadAndRest?.();
                }}
                onSearch={(data) => {  
                    setAdvanceSearchParams((v) => ({ ...v, ...data, status: v.status }));
                    actionRef.current?.reloadAndRest?.();
                }}
                />
                </Spin>
            </Tabs.TabPane>
           { accessPerfEvaluation && <Tabs.TabPane icon={<PicRightOutlined />} tab="Performance Evaluation" key="2">
                <Flex>
                    <ProCard
                        size="small"
                        style={{ backgroundColor: '#fafafa', width: 320 }}
                        bodyStyle={{padding:0,margin:0}} 
                        title={extraContent}
                        headerBordered
                        className={styles.listCard}
                    >
                        <ProList<AppraisalEmp>
                            rowKey="id"
                            size="small"
                            actionRef={actionTargetRef}
                            pagination={{}}
                            columns={[{ title: 'test', dataIndex: 'id' }]}
                            metas={{
                                title: {
                                    render: (_, r) => (
                                        <Flex align='baseline'>
                                            <Button
                                                type="link"
                                                size="small"
                                                icon={<EyeOutlined />}
                                                onClick={() => quickViewHandler(r)}
                                            />
                                            <Button type='link' onClick={() => {
                                                    window.open(`/external/hrm/appraisal-submit/detail/${r.id}`, '_blank')?.focus();
                                                }} title='Open in new tab' icon={<ExportOutlined size={5} />} />
                                                <a onClick={(e) =>  onDetail?.(r)}>
                                                    {' '}
                                                    {r.empNo}
                                                </a>
                                        </Flex>
                                    )
                                },
                                // subTitle: { render: (_, r) => <Space> {r.empName}</Space>},
                                description: {
                                    render: (_, r) => ListContent({ data: r }) 
                                },
                            }}
                            request={onPerformanceTargetRequestHandler}
                        />
                    </ProCard>
                    
                


                    <Space direction="vertical" style={{padding:5,width:'100%'}}>
                            <Flex gap={5}>
                                
                                {overalPerfHeadCount && 
                                                                      
                                    <ProTable<OverallPerformanceHeadCountRs>
                                    size="small"                                        
                                        headerTitle = {<Flex gap={120} ><div style={{float:'left', width: 250}}>Total Function Head Count: {overalPerfTotalHeadCount}</div><div style={{float:'right',}}><Button type="primary" onClick={submitAllHandler}>Submit All</Button></div></Flex>}
                                        style={{width: 500}}
                                        pagination = {false}
                                        options={false}
                                        search = {false}
                                        columns={[{
                                            title: 'Performance Score',dataIndex:'rating'
                                        },{
                                            title: 'Target %',dataIndex:'targetPercent',
                                            render:(_,r:any)=> formatterPercentage0.format(r.targetPercent/100)
                                        },{
                                            title: 'Target #Head Count',dataIndex:'targetHeadCount'
                                        },{
                                            title: 'Actual %',dataIndex:'actualPercent',
                                            render:(_,r:any)=> formatterPercentage0.format(r.actualPercent/100) 
                                        },{
                                            title: 'Actual #Head Count',dataIndex:'actualHeadCount'
                                        },{
                                            title: 'Variance %',dataIndex:'variancePercent',
                                            render:(_,r:any)=> formatterPercentage0.format(r.variancePercent/100)
                                        }]}
                                        dataSource={overalPerfHeadCount}
                                    />
                                    }
                                 
                                
                                   <Card size="small" style={{width: 690}}>
                                            {/* <Line {...config} /> */}
                                    <Line                                      
                                        height={300}                                    
                                        data={overalPerfHeadCount.flatMap( it => ([{
                                            score: it.rating,
                                            category: 'Target %',
                                            value: it.targetPercent
                                        },{
                                            score: it.rating,
                                            category: 'Actual %',
                                            value: it.actualPercent
                                        }
                                    ]))}
                                        xField="score"
                                        yField="value"
                                        shapeField = 'smooth'
                                        colorField= 'category'
                                        legend= {{
                                            color: {
                                              title: true,
                                              position: 'top',
                                              rowPadding: 5,
                                            },
                                        }}
                                        labels={ [
                                            // { text: 'value', style: { fontSize: 10, fontWeight: 'bold' } },
                                            {
                                              text: (d:any, i:any, data:any) => (formatterPercentage0.format(d.value/100)),
                                              style: {
                                                fontSize: 9,
                                                dy: -10,
                                                dx: 0
                                              },
                                            },
                                          ]}
                                        // label= {{
                                        //     text: 'value',
                                        //     style: {
                                        //       fontWeight: 'bold',
                                        //     },
                                        // }}
                                        smooth={true}
                                        // animation={{
                                        //     appear: {
                                        //         animation: "path-in",
                                        //         duration: 1
                                        //     }
                                        // }}
                                    />
                                   </Card>
                                 
                                   </Flex>   
                                   <Flex  gap={2} >                     
                            {overalPerfScore && overalPerfScore.sort((a,b)=> (a.rating-b.rating)).map(rs=>{
                                    return  overalPerfEmpDs && <Col>
                                        <Card size="small" key={'card_'+rs.id} title={rs.rating+'-'+rs.description} bodyStyle={{padding:0,margin:0}}  style={{minWidth: 237, margin:0, padding:0}}>                                           
                                            <ProList<AppraisalEmp>  style={{padding:0,margin:0}} 
                                                rowKey={rs.id+''}
                                                size="small"
                                                metas={{
                                                    title: {
                                                        render: (_, r:AppraisalEmp) => (
                                                            <a style={{width:'100%'}} onClick={(e) =>  quickViewHandler?.(r)}>{r.empName} ({r.rating2})</a>
                                                    )}
                                                }}
                                                dataSource={overalPerfEmpDs.filter((f: AppraisalEmp) => ((f?.rating2||0)>= rs.startedScore && (f?.rating2||0)<= rs.endedScore))}
                                                // request={onTargetRequestHandler}
                                            />
                                        </Card>
                                    </Col>
                                })
                            }                           
                           
                            </Flex>
                    </Space>
                    </Flex>
                    {perfEvaluationAccess && <AdvancePerformanceEvaluationSearch
                        title="Advance Search"
                        closable
                        dataDS={perfEvaluationAccess}
                        open={advanceEvaluationSearch?.visible} 
                        // dataItem={modalEvaluatioVisible?.payload}
                        onClose={() => {
                            setAdvanceEvaluationSearch({ visible: false });
                        }}
                        onReset={() => {  
                            setAdvanceSearchPerformEvaluationParams((v) => ({
                                ...v,
                                appraiser: undefined,
                                company: undefined,
                                function: undefined
                            }))
                            setRefreashEvaluationData(v=> v+1)
                        }}
                        onSearch={(data) => { 
                            setAdvanceSearchPerformEvaluationParams((v) => ({
                                ...v,
                                appraiser: data.appraiser,
                                company: data.company,
                                function: data.function
                            }))
                            setRefreashEvaluationData(v=> v+1)
                            // onDataLoad(advanceSearchPerformEvaluationParams.appraisalPeriodId||-1) 
                            // actionTargetRef.current?.reloadAndRest?.();
                        }}
                    />}
            </Tabs.TabPane>
            }
        </Tabs></>
}

export default AppraisalList