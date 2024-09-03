import { ProCard } from "@ant-design/pro-components"
import { Descriptions, Tag, Typography } from "antd/lib"
import { AppraisalEmp } from "../data.types"
import { formatDate, toReadable } from "@/pages/utils"

interface Props {
    dataDetail?: AppraisalEmp
}
export default({dataDetail}: Props) => {

    return <ProCard collapsible defaultCollapsed bordered headerBordered size='small' title="Submission Info" direction="row" style={{marginBottom:'10px'}}>
    <Descriptions size='small' column={3}>
        <Descriptions.Item label="Emp Name">{dataDetail?.empName}</Descriptions.Item>
        <Descriptions.Item label="Business Unit">{dataDetail?.buName}</Descriptions.Item>
        <Descriptions.Item label="Created Date">{formatDate(dataDetail?.createdDate)}</Descriptions.Item>

        <Descriptions.Item label="Emp No">{dataDetail?.empNo}</Descriptions.Item>
        <Descriptions.Item label="Email">{dataDetail?.empEmail}</Descriptions.Item>       
        <Descriptions.Item label="Created By">{dataDetail?.createdBy}</Descriptions.Item>

        <Descriptions.Item label="Function">{dataDetail?.departmentName}</Descriptions.Item>
        <Descriptions.Item label="Sub Function">{dataDetail?.subDepartmentName}</Descriptions.Item>
        <Descriptions.Item label="Appraiser">{dataDetail?.reportTo}</Descriptions.Item>
        <Descriptions.Item label="Job Title"  span={2}>{dataDetail?.jobTitle}</Descriptions.Item>
        <Descriptions.Item label="Status"><div>
            <Tag><Typography.Text type={ dataDetail?.status  == 'COMPLETED' ? 'success' : 'warning'}> {toReadable(dataDetail?.status )}</Typography.Text></Tag>
            {dataDetail?.actionStatus&& dataDetail?.currentDrafted&&<sup style={{
                            zIndex:'auto',
                            minWidth:'20px',
                            padding:'0px 6px 1px 6px',
                            color:'white',
                            fontWeight:'400',
                            fontSize:'10px',
                            lineHeight:'20px',
                            borderRadius:'10px',
                            whiteSpace:'nowrap' , 
                            textAlign:'center', 
                            backgroundColor:'#faad14fa',
                    }}>{toReadable(dataDetail?.actionStatus)}</sup>}
            </div>
        </Descriptions.Item>
    </Descriptions>
</ProCard>
}