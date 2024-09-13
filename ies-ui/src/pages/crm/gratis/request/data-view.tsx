import { simpleRequestActions } from "@/services/model"
import { ProCard } from "@ant-design/pro-components"
import { Button, Descriptions, Space, Spin, Tooltip } from "antd"
import { useEffect, useState } from "react"
import { GratisServices } from "../services"
import { useSafeState } from "ahooks"
import { CriteriaExportReport, IncentiveSettlement } from "../types"
import { formatDate } from "@/pages/utils"
import { DownloadData, downloadReport1 } from "@/services/apiGateway"
import { replace } from "lodash"
import { SelectOutlined } from "@ant-design/icons"

export default ({ processInstaceId, forceReload }: { processInstaceId: string, forceReload?: number }) => {
    const requestActions = simpleRequestActions()
    const [data, setData] = useSafeState<IncentiveSettlement>()
    const [fileurl, setFileUrl] = useState<string>();
    const [loading, setLoading] = useState<boolean>(false)
    useEffect(() => {
        loadData()
    }, [])
    const loadData = async () => {
        const rs = await GratisServices.fetchSettlementDetailByInstId(processInstaceId).query(requestActions)
        setData(rs)
        setLoading(true)
        const r = await downloadReport1<CriteriaExportReport>(requestActions)(dataReport({ id: rs?.id, label: rs?.label, status: rs?.status, contractTypeCode: rs?.contractType?.code }, 'PDF'))
        setFileUrl(r)
        setLoading(false)
    }
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
    return <Spin spinning={loading}>
        <Space direction="vertical" style={{ width: '100%' }}>
            <ProCard title={`Settlement Label: ${data?.label}`} headerBordered size='small'>
                <Descriptions column={4}>
                    <Descriptions.Item label="Agreetment Type">{data?.contractType?.name}</Descriptions.Item>
                    <Descriptions.Item label="Created By">{data?.createdBy}</Descriptions.Item>
                    <Descriptions.Item label="Created Date">{formatDate(data?.createdDate)}</Descriptions.Item>
                    <Descriptions.Item label="Remarks">{data?.description}</Descriptions.Item>
                    <Descriptions.Item label="For the period From" >{`${formatDate(data?.startedDate, 'MMM YYYY')} To ${formatDate(data?.endedDate, 'MMM YYYY')}`}</Descriptions.Item>
                </Descriptions>
            </ProCard>
            {/* <ProCard size='small' style={{padding:0,margin:0,height:'35px'}}
                extra={
                    <Space size={1}>
                        <Tooltip title="View data in new browser tab.">
                        <Button
                            type="link"
                            size="small"
                            icon={<SelectOutlined />}
                            onClick={async () => {
                            window.open(`../../crm/gratis/detail/${data?.id||0}`, '_blank')?.focus();
                            }}
                        />
                        </Tooltip>
                    </Space>
                }
            /> */}
            <iframe src={fileurl}
                allowFullScreen
                loading='eager'
                style={{
                    width: "100%",
                    height: "550px",
                    margin: 0
                }}
            />
        </Space>
    </Spin>
}