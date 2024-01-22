import { formatDate, formatDateTime, getColorStatus, toReadable } from "@/pages/utils";
import { VisitScheduleDetail } from "@/services/crm/data";
import { CheckCircleTwoTone, ClockCircleOutlined, EditOutlined } from "@ant-design/icons";
import { ProCard, ProDescriptions } from "@ant-design/pro-components";
import { Button, Space, Tag } from "antd";
import moment from "moment";
import { useAccess } from "umi";
import EditContractVerification from "../../contract/contract-verification/EditContractVerification";

export default ({ detail, refresh }: { detail?: VisitScheduleDetail;   refresh?: ()=> void  }) => {

    const access = useAccess()
    
    return <div> {detail?.contracts?.sort((a, b)=> moment(b?.expireDate).dayOfYear()- moment(a?.expireDate).dayOfYear()).map(it => {
        const contractChecked = detail.contractCheckedList.find(i => i.contractId == it.id)
        return <ProCard
            bordered key={`contract-${it.id}`}
            size='small'
            title={[it.contractNo, it.contractType.name].filter(it => it).join(" - ")}
            subTitle={<Tag color = { getColorStatus(it.status) } >{toReadable(it.status )}</Tag>}
            extra={contractChecked ? <Space>
                {access.crmAdmin && <EditContractVerification refresh = {refresh} contract={it} data={contractChecked} trigger={<Button type="link" icon = {<EditOutlined/>}/>}/> }
                <Tag color="success" icon={<CheckCircleTwoTone />}>Verified</Tag>
                </Space> : it.status!='EXPIRED' && <Tag color="processing" icon={<ClockCircleOutlined spin />}>Pending</Tag>}
        >

            <ProDescriptions style={{ width: '100%' }} column={1}>
                <ProDescriptions.Item>
                    <ProDescriptions size="small">
                        <ProDescriptions.Item label="Brand"> {it.brand.name}</ProDescriptions.Item>
                        <ProDescriptions.Item label="Contract Date">{formatDate(it.effectiveDate)} to {formatDate(it.expireDate) }</ProDescriptions.Item>
                    </ProDescriptions>
                </ProDescriptions.Item>
                <ProDescriptions.Item label="Terms"> {it.terms?.name}</ProDescriptions.Item>
                
                {contractChecked && <ProDescriptions.Item>
                    <ProDescriptions size="small">
                        <ProDescriptions.Item label="Compliance">{contractChecked.compliance.name}</ProDescriptions.Item>
                        <ProDescriptions.Item label="Status">{contractChecked.status?.name}</ProDescriptions.Item>
                        <ProDescriptions.Item label="Checked By">{contractChecked.checkedBy}</ProDescriptions.Item>
                        <ProDescriptions.Item label="Checked By">{formatDateTime(contractChecked.checkedDate)}</ProDescriptions.Item>
                        <ProDescriptions.Item span={2} label="Remarks">{contractChecked.remarks}</ProDescriptions.Item>
                    </ProDescriptions>
                </ProDescriptions.Item>}
            </ProDescriptions>

        </ProCard>
    })} </div>
}