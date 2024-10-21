import { Button, Checkbox, Radio, Space, Spin, Tooltip, Typography } from "antd"
import { ProbationEvaluationEmpList, AppraisalEmpStatusTotal } from "../../data.types"
import TableView from "@/components/DataCrud/TableView";
import { SortOrder } from "antd/es/table/interface";
import { simpleRequestActions } from "@/services/model";
import { createService } from "../../services";
import { Paging } from "@/services/API";
import { formatDate, formatDateTime } from "@/pages/utils";
import Status from "@/components/Status";
import { ExportOutlined, EyeOutlined, FileExcelOutlined } from "@ant-design/icons";
import { useEffect, useRef, useState } from "react";
import { LightFilter, ProFormSelect } from "@ant-design/pro-components";
import { ActionType } from '@ant-design/pro-table';
import { CheckboxChangeEvent } from "antd/es/checkbox";
import { Model } from "../../model";
import { DownloadData, downloadReport } from '@/services/apiGateway';
import { replace } from "lodash";
import moment from "moment";
import ProbationRequestModal from "../../ProbationRequestModal";
import { ProbationEvaluationRequestFormNames } from "../../process-flow";
import { history, useModel } from 'umi';
import ProbationEvaluationQuickView from "../quick-view";
const { Link } = Typography;

interface Props {
    onAdd?: (id?: number) => void;
    onDetail?: (data: ProbationEvaluationEmpList) => void
    forceRefresh: number
}
export interface AppraisalEmpAdvanceSearchParams {
    status?: string
    pendingFilter?: string[]
    drafted?: boolean
}
interface LightFilterProp {
    pendingFilter?: string[]
}

const ProbationList: React.FC<Props> = ({ onAdd, forceRefresh, onDetail }) => {
    const { data, modals } = Model();
    const actionRef = useRef<ActionType>();
    const cacheList = useModel('dataList');
    const requestActions = simpleRequestActions();
    const srv = createService({ request: requestActions })
    const [appraisalEmp, setAppraisalEmp] = useState<ProbationEvaluationEmpList>()
    const [total, setTotal] = useState<AppraisalEmpStatusTotal>()
    const [forceChange, setForceChange] = useState<number>(0)

    const [advanceSearchParams, setAdvanceSearchParams] = useState<AppraisalEmpAdvanceSearchParams>({
        status: 'ALL',
    })
    const [criteria, setCriteria] = useState<{ searchValue?: string; advanceSearch?: AppraisalEmpAdvanceSearchParams }>()
    useEffect(() => {
        srv.findAppraisalEmpStatusTotal().then((it: AppraisalEmpStatusTotal) => {
            setTotal(it)
        })
    }, [forceChange])
    useEffect(() => {
        refeshTable()
    }, [forceRefresh])

    const onRequestHandler = (
        criteria?: { searchValue?: string; advanceSearch?: AppraisalEmpAdvanceSearchParams },
        pagination?: {
            pageSize?: number;
            current?: number;
        },
        sort?: Record<string, SortOrder>,
    ) => {
        var params = { ...criteria, keyword: criteria?.searchValue, advanceSearch: criteria?.advanceSearch || advanceSearchParams }
        setCriteria(params)
        return srv.fetchPaging({
            criteria: params,
            sort: sort,
            pagination: pagination

        }).then(it => {
            return cacheList.cacheDataList({
                type: 'probation-evaluation-emp',
                data: it
            })
        }) as Promise<Paging<ProbationEvaluationEmpList>>
    }
    const quickViewHandler = (appEmp: ProbationEvaluationEmpList) => {
        modals.showModal('QuickViewAppraisalForm');
        setAppraisalEmp(appEmp)
    }
    const refeshTable = () => {
        setForceChange(v => v + 1)
        actionRef?.current?.reload?.()
    }
    const createAppraisalFormHandler = () => {
        modals.showModal('CreateProbationForm');
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


    const dowloandData = (): DownloadData<{ searchValue?: string; advanceSearch?: AppraisalEmpAdvanceSearchParams }> => {
        var direct = 'Direct'
        var issued = 'Issued'
        var reportName = replace('SettlementIncentive@@##Report', '@@', direct)
        var params = { ...criteria, searchValue: criteria?.searchValue, advanceSearch: criteria?.advanceSearch || advanceSearchParams }
        reportName = replace(reportName, '##', issued)
        return {
            reportName: 'performance-review-list-report',
            fileName: `Performance-Review-List_${moment().toDate().toDateString()}`,
            type: 'EXCEL',
            data: params
        }
    }
    // const dowloandExcelHandler = () => {
    //     return downloadReport<{ searchValue?: string; advanceSearch?: AppraisalEmpAdvanceSearchParams }>(requestActions)(dowloandData())
    // }
    const cols = [
        {
            title: 'Form No #',
            sorter: 'formNo',
            width: 150,
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
                            // window.open(`/external/hrm/probation-evaluation/detail/${r.id}`, '_blank')?.focus();
                            window.open(`/external/data-form/${ProbationEvaluationRequestFormNames.processDefKey}/${r.instanceId}`, '_blank')?.focus();
                        }}
                    />
                    <a onClick={() => {history.push(`/data-form/${ProbationEvaluationRequestFormNames.processDefKey}/${r.instanceId}`)}}>
                        <Link type={(vali.length > 0) ? 'danger' : undefined}>
                            <Tooltip
                                title={(vali.length > 0) && vali.map(it => <div><b style={{ color: 'orange' }}>{it.title}: </b>{it.msg}</div>)}
                                overlayStyle={{ maxWidth: '500px' }}
                            >
                                {r.formNo}
                            </Tooltip>
                        </Link>
                    </a>
                </Space>)
            },
        },
        {
            title: 'Employee No',
            dataIndex: 'empNo', sorter: 'empNo',
            // width: 140,
            // render: (_: any, r: any) => {
            //     var vali = data.validationMsgList(r)
            //     return (<Space size={1}>
            //         <Button
            //             type="link"
            //             size="small"
            //             icon={<EyeOutlined />}
            //             onClick={() => quickViewHandler(r)}
            //         />
            //         <Button
            //             size="small"
            //             type="link"
            //             icon={<ExportOutlined />}
            //             onClick={async () => {
            //                 window.open(`/external/hrm/appraisal-submit/detail/${r.id}`, '_blank')?.focus();
            //             }}
            //         />
            //         <a onClick={() => { onDetail?.(r) }}>
            //             <Link type={(vali.length > 0) ? 'danger' : undefined}>
            //                 <Tooltip
            //                     title={(vali.length > 0) && vali.map(it => <div><b style={{ color: 'orange' }}>{it.title}: </b>{it.msg}</div>)}
            //                     overlayStyle={{ maxWidth: '500px' }}
            //                 >
            //                     {r.empNo}
            //                 </Tooltip>
            //             </Link>
            //         </a>
            //     </Space>)
            // },
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
        { title: 'Position', dataIndex: 'jobTitle', sorter: 'jobTitle' },
        { title: 'Job Level', dataIndex: 'formTypeName', sorter: 'formTypeName' },
        { title: 'Business Unit', dataIndex: 'buName', sorter: 'buName' },
        { title: 'Function', dataIndex: 'departmentName', sorter: 'function' },
       
        // { title: 'Self- Rating', dataIndex: 'rating1', sorter: 'rating1' },
        // {
        //     title: 'FM Rating', dataIndex: 'rating2', sorter: 'rating2',
        //     render: (_: any, r: any) => {
        //         return (r?.rating2 == 0 ? '-' : r?.rating2 == -1.0 ? '-' : r.rating2)
        //     }
        // },
        // {
        //     title: 'Agreed Rating', dataIndex: 'rating5', sorter: 'rating5',
        //     render: (_: any, r: any) => !r?.rating5 || r?.rating5 == 0 ? '-' : r?.rating5
        // },
        { title: 'Modified By', sorter: 'lastModifiedBy', dataIndex: 'lastModifiedBy' },
        {
            title: 'Modified Date', sorter: 'lastModifiedDate', dataIndex: 'lastModifiedDate',
            render(_: any, r: any) {
                return r.lastModifiedDate && formatDateTime(r.lastModifiedDate,'DD-MMM-YYYY')
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
        },{
            title: 'Due Date', sorter: 'requestedDate', dataIndex: 'requestedDate',
            with: 210,
            render(_: any, r: any) {
                return r.requestedDate && formatDate(r.requestedDate,'DD-MMM-YYYY')
            }
        },
    ]
    // if (total?.accessRequest) {
    //     cols.push({
    //         title: 'Process Request Status', width: '120px',
    //         render: (_: any, r: any) => <Status text={r.requestStatus || 'NA'} />
    //     })
    // }
    return <Spin spinning={requestActions.request?.loading}>
        <TableView<ProbationEvaluationEmpList, { searchValue?: string; advanceSearch?: AppraisalEmpAdvanceSearchParams }>
            // advanceSearch            
            cache
            addButtonLabel={'New Probation Evaluation Form'}
            tableProps={{
                actionRef: actionRef,
                options: { reload: false, density: false, fullScreen: false, setting: false }
            }}
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
                    {(advanceSearchParams?.status === 'PENDING' && (total?.drafted || 0) > 1) && <Space>
                        <Button type="primary" onClick={submitAllHandler}>Submit All</Button>
                    </Space>}
                </Space>
            }
            // extraRightFilter={<Tooltip placement="bottom" title="Dowload Excel File"><Button icon={<FileExcelOutlined />} onClick={dowloandExcelHandler} /></Tooltip>}
            actionHandlers={{
                onAdd: createAppraisalFormHandler,
                // onAdd: onAdd,
                onFirstLoad: () => onRequestHandler(),
                onRequest: onRequestHandler,
            }}
            columns={cols}
        />
        {/* {appraisalEmp && modals.isVisible('QuickViewAppraisalForm') &&  */}
        <ProbationEvaluationQuickView refreshTable={refeshTable} appraisalEmp={appraisalEmp} open={modals.isVisible('QuickViewAppraisalForm')} onOpenModalChange={(v: any) => !v && modals.hideModal('QuickViewAppraisalForm')} />
        {modals.isVisible('CreateProbationForm') && <ProbationRequestModal
            open={modals.isVisible('CreateProbationForm')}
            onOpenChange={(v: any) => !v && modals.hideModal('CreateProbationForm')}
            // refreshTable={refeshTable}
        />}
        {/* {modals.isVisible('SubmitAllListView') && <SubmitAllListModal
            open={modals.isVisible('SubmitAllListView')}
            onOpenModalChange={(v: any) => !v && modals.hideModal('SubmitAllListView')}
            refreshTable={refeshTable}
        />
        } */}
    </Spin>
}

export default ProbationList