import { simpleRequestActions } from "@/services/model";
import { ModalForm, ProColumns, ProTable } from "@ant-design/pro-components"
import { useEffect, useState } from "react"
import { createService } from "../../services";
import { AppraisalEmp, AppraisalEmpSubmitAllPayload, ValidatorMsg } from "../../data.types";
import { Button, Modal, Tooltip, Typography, message } from "antd";
import { Model } from "../../model";
import ConfirmSubmitModal from "./ConfirmSubmitModal";
import { DeleteOutlined } from "@ant-design/icons";
import { useAccess } from "@umijs/max";
const { Link } = Typography;

interface Props {
    open?: boolean
    onOpenModalChange: (v: boolean) => void,
    refreshTable: () => void
}
export default ({ open, onOpenModalChange, refreshTable }: Props) => {
    const access = useAccess()
    const requestActions = simpleRequestActions();
    const srv = createService({ request: requestActions })
    const [appraisalEmp, setAppraisalEmp] = useState<AppraisalEmp[]>()
    const [totalHeadCount, setTotalHeadCount] = useState<number>(0)
    const { actions, data, modals } = Model();
    const [loading, setLoading] = useState<boolean>(false)

    useEffect(() => {
        try {
            srv.findDraftedAppraisalEmpList().then(it => {
                setTotalHeadCount(it.totalHeadCount)
                setAppraisalEmp(it.items.filter(it => {
                    // var msg = data.validationMsgList(it)
                    // return msg.length==0
                    return true
                }).map(i => {
                    var status = actions.getStatus('DONE', i)
                    return {
                        ...i,
                        status: status.status,
                        actionStatus: status.actionStatus,
                        rated1: status.rated1,
                        rated2: status.rated2,
                        rated3: status.rated3,
                        rated4: status.rated4,
                        rated5: status.rated5
                    }
                }))
            })
        } catch (error: any) {
            message.error(error.message || 'Failed to load data.')
        }

    }, [])

    const removeHandler = (r: AppraisalEmp) => {
        setAppraisalEmp(v => {
            return v?.filter(it => it.id != r.id)
        })
    }
    const onSubmitAllHandler = async () => {
        var validtor = Array<{ id: number, title: string, msg: ValidatorMsg[] }>()
        appraisalEmp?.forEach(it => {
            var msg = data.validationMsgList(it)
            if (msg.length > 0) {
                validtor.push({ id: it.id, title: `${it.empNo}-${it.empName}`, msg: msg })
            }
        })
        if (validtor.length > 0) {
            Modal.warning({
                title: `Field's Required`,
                width: '50%',
                content: <div>{validtor.map(it => it.msg?.map(i => <div><b style={{ color: 'orange' }}>{it.title}: </b><span>{i.title} {i.msg}</span></div>))}</div>
            })
            return
        }
        modals.showModal('ConfirmPerformanceEvaluationSubmit')
    }
    const onFinishHandler = async () => {
        try {
            setLoading(true)
            await srv.submitAllAppraisalEmps(appraisalEmp?.map(
                it => {
                    return {
                        id: it.id,
                        status: it.status,
                        actionStatus: it.actionStatus,
                        rated1: it.rated1,
                        rated2: it.rated2,
                        rated3: it.rated3,
                        rated4: it.rated4,
                        rated5: it.rated5
                    } as AppraisalEmpSubmitAllPayload
                })).then(rs => {
                    message.success(`submitted`)
                    setLoading(false)
                    onOpenModalChange(false)
                    refreshTable()
                })
        } catch (error: any) {
            message.error(error.message || 'Failed')
        }
    }
    const cols: ProColumns<AppraisalEmp>[] = [
        {
            title: 'Employee',
            sorter: 'formNo',
            width: '150px',
            render(_: any, r: any) {
                var vali = data.validationMsgList(r)
                // return `${r.empNo}- ${r.empName}`
                return <Link type={(vali.length > 0) ? 'danger' : undefined}>
                    <Tooltip
                        title={(vali.length > 0) && vali.map(it => <div><b style={{ color: 'orange' }}>{it.title}: </b>{it.msg}</div>)}
                        overlayStyle={{ maxWidth: '500px' }}
                    >
                        {`${r.empNo}- ${r.empName}`}
                    </Tooltip>
                </Link>
            },
        },
        {
            title: 'Employee(KH)', sorter: 'internalName', render(_: any, entity: any) {
                return entity.internalName
            },
        },
        { title: 'Function', dataIndex: 'departmentName', sorter: 'function' },
        { title: 'Job Title', dataIndex: 'jobTitle', sorter: 'jobTitle' },
        { title: 'Self- Rating', dataIndex: 'rating1', sorter: 'rating1' },
        // {title: 'FM Rating', dataIndex: 'rating2', sorter: 'rating2' },
        { title: "Manager's Rating", dataIndex: 'rating3', sorter: 'rating3' }
    ]
    if (access.isAccessHrAppraisalAllowSubmitPartial) {
        cols.push({
            title: '',
            dataIndex: 'departmentName', sorter: 'function',
            width: '5px',
            render: (_: any, r: any) => <Button danger type='link' icon={<DeleteOutlined />} onClick={() => removeHandler(r)} />

        })
    }

    return <ModalForm
        title={`Performance Evaluation List - ${(appraisalEmp?.length || 0)}/${totalHeadCount}`}
        width={'85%'}
        open={open}
        onOpenChange={onOpenModalChange}
        submitter={{
            searchConfig: {
                submitText: 'Submit All',
            },
            submitButtonProps: {
                loading: loading,
                disabled: ((appraisalEmp?.length || 0) == 0 || appraisalEmp?.some(it => data.validationMsgList(it).length > 0) || (access.isAccessHrAppraisalAllowSubmitPartial ? false : (appraisalEmp?.length || 0) < totalHeadCount))
            }
        }}
        onFinish={() => onSubmitAllHandler()}
    >
        {appraisalEmp && <ProTable<AppraisalEmp>
            loading={requestActions.request?.loading}
            pagination={false}
            search={false}
            options={{
                density: false,
                search: false,
                reload: false,
                setting: false,
                fullScreen: false

            }}
            dataSource={appraisalEmp}
            columns={cols}
        />}
        {modals.isVisible('ConfirmPerformanceEvaluationSubmit') && <ConfirmSubmitModal onFinish={onFinishHandler} open={modals.isVisible('ConfirmPerformanceEvaluationSubmit')} onOpenModalChange={(v: any) => !v && modals.hideModal('ConfirmPerformanceEvaluationSubmit')} />}

    </ModalForm>
}