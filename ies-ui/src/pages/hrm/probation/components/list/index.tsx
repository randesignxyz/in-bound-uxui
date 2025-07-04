import { Button, Radio, Space, Spin, Typography } from "antd"
import { ProbationEvaluationEmpList, ProbationEmpStatusTotal } from "../../data.types"
import TableView from "@/components/DataCrud/TableView";
import { SortOrder } from "antd/es/table/interface";
import { simpleRequestActions } from "@/services/model";
import { createService } from "../../services";
import { Paging } from "@/services/API";
import { formatDate, formatDateTime } from "@/pages/utils";
import Status from "@/components/Status";
import { ExportOutlined, EyeOutlined } from "@ant-design/icons";
import { useEffect, useRef, useState } from "react";
import { LightFilter, ProFormSelect } from "@ant-design/pro-components";
import { ActionType } from '@ant-design/pro-table';
import { Model } from "../../model";
import ProbationRequestModal from "../../ProbationRequestModal";
import { ProbationEvaluationRequestFormNames } from "../../process-flow";
import { history, useAccess, useModel } from 'umi';
import ProbationEvaluationQuickView from "../quick-view";
import ProbationReportModalForm from "../../reports/ProbationReportModalForm";

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
    const access = useAccess()
    const { modals } = Model();
    const actionRef = useRef<ActionType>();
    const cacheList = useModel('dataList');
    const requestActions = simpleRequestActions();
    const srv = createService({ request: requestActions })
    const [appraisalEmp, setAppraisalEmp] = useState<ProbationEvaluationEmpList>()
    const [total, setTotal] = useState<ProbationEmpStatusTotal>()
    const [forceChange, setForceChange] = useState<number>(0)

    const [advanceSearchParams, setAdvanceSearchParams] = useState<AppraisalEmpAdvanceSearchParams>({
        status: 'ALL',
    })
    const [criteria, setCriteria] = useState<{ searchValue?: string; advanceSearch?: AppraisalEmpAdvanceSearchParams }>()
    useEffect(() => {
        srv.findProbationEmpStatusTotal().then((it: ProbationEmpStatusTotal) => {
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
    const onFilterStatusHandler = (values: LightFilterProp) => {
        setAdvanceSearchParams((v) => ({
            ...v,
            pendingFilter: (values?.pendingFilter || []).length > 0 ? values?.pendingFilter : undefined
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
    const cols = [
        {
            title: 'Form No #',
            sorter: 'formNo',
            flex: 1,
            width: 180,
            render: (_: any, r: any) => {
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
                            window.open(`/external/data-form/${ProbationEvaluationRequestFormNames.processDefKey}/${r.instanceId}`, '_blank')?.focus();
                        }}
                    />
                    <a onClick={() => {history.push(`/data-form/${ProbationEvaluationRequestFormNames.processDefKey}/${r.instanceId}`)}}>
                        {r.formNo}
                    </a>
                </Space>)
            },
        },
        {
            title: 'Employee No',
            dataIndex: 'empNo', sorter: 'empNo',
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
        { title: 'Modified By', sorter: 'lastModifiedBy', dataIndex: 'lastModifiedBy' },
        {
            title: 'Modified Date', sorter: 'lastModifiedDate', dataIndex: 'lastModifiedDate',
            render(_: any, r: any) {
                return r.lastModifiedDate && formatDateTime(r.lastModifiedDate,'DD-MMM-YYYY')
            }
        },
        {
            title: 'Status', width: '100px', render: (_: any, r: any) => <><Status text={r.status} /></>
        },{
            title: 'Due Date', sorter: 'requestedDate', dataIndex: 'requestedDate',
            with: 210,
            render(_: any, r: any) {
                return r.requestedDate && formatDate(r.requestedDate,'DD-MMM-YYYY')
            }
        },
    ]
    return <Spin spinning={requestActions.request?.loading}>
        <TableView<ProbationEvaluationEmpList, { searchValue?: string; advanceSearch?: AppraisalEmpAdvanceSearchParams }>
            // advanceSearch            
            cache
            scrollX
            addButtonLabel={'New Probation Evaluation Form'}
            displayOnly={!access.canCreateHrProbationEvaluationRequest}
            tableProps={{
                actionRef: actionRef,
                options: { reload: true, density: false, fullScreen: false, setting: false }
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
                        <Radio.Button value="REJECTED">Rejected</Radio.Button>
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
                                    { label: 'Requested', value: 'REQUESTED' },
                                    { label: 'Setting', value: 'SETTING' },
                                    { label: 'In progress', value: 'IN_PROGRESS' },
                                    { label: 'Reviewing', value: 'REVIEWING' }
                                ]}
                            />

                        </LightFilter>}
                </Space>
            }
            extraRightFilter={
                access.canAccessHRProbationEvaluationExportReport&&<ProbationReportModalForm trigger={<Button type="link" icon={<ExportOutlined/>}>Export</Button>} />
            }
            actionHandlers={{
                onAdd: createAppraisalFormHandler,
                // onAdd: onAdd,
                onFirstLoad: () => onRequestHandler(),
                onRequest: onRequestHandler,
            }}
            columns={cols}
        />
        <ProbationEvaluationQuickView refreshTable={refeshTable} probationEmp={appraisalEmp} open={modals.isVisible('QuickViewAppraisalForm')} onOpenModalChange={(v: any) => !v && modals.hideModal('QuickViewAppraisalForm')} />
        {modals.isVisible('CreateProbationForm') && <ProbationRequestModal
            open={modals.isVisible('CreateProbationForm')}
            onOpenChange={(v: any) => !v && modals.hideModal('CreateProbationForm')}
            refreshTable={refeshTable}
        />}
    </Spin>
}

export default ProbationList