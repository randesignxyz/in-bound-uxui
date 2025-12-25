import { formatDate } from "@/pages/utils";
import { simpleRequestActions } from "@/services/model";
import { ProCard, ProDescriptions, ProList } from "@ant-design/pro-components"
import { Button, Checkbox, message, Space, Spin } from "antd"
import { useEffect, useState } from "react";
import { StaffRequisitionRequest } from "../../data";
import { EmployeeServices } from "../../services";
import { AttachmentFile } from "@/services/data";
import { FileServiceAPI } from "@/services/files/service";
import { downloadUploadFileV2 } from "@/services/apiGateway";
import { EyeFilled, FileOutlined } from "@ant-design/icons";
import FilePreview from "@/components/Attachment/FilePreview";

export default ({ processInstanceId, setAttachFiles, onSetStatus }: {
    processInstanceId: string,
    onSetStatus: (status: string) => void;
    setAttachFiles: (files: string[]) => void
}) => {

    const requestActions = simpleRequestActions();
    const [data, setData] = useState<StaffRequisitionRequest>()
    const [attachmentFiles, setAttachmentFiles] = useState<AttachmentFile[]>([]);
    const fielServices = FileServiceAPI(requestActions);
    useEffect(() => {
        loadData()
    }, [])

    const loadData = async () => {
        try {
            const rs = await EmployeeServices.fetchStaffRequisitionRequest(processInstanceId).query(requestActions)
            onSetStatus(rs.status)
            setData(rs)
            if (rs.attachedFiles) {
                setAttachFiles(rs.attachedFiles || [])
                const fileInfoList = await fielServices.list(rs.attachedFiles || [])
                setAttachmentFiles(fileInfoList)
            }
        } catch (error: any) {
            message.error(error.message || 'Failed to fetch data.')
        }
    }

    return (
        <Spin spinning={requestActions.request?.loading}>
            <Space style={{ width: '100%' }} direction="vertical">
                <ProCard title='Details of Position Hired' size='small' >
                    <ProDescriptions >
                        <ProDescriptions.Item label="Position Hired" valueType={'text'}>{data?.positionHired?.name}</ProDescriptions.Item>
                        <ProDescriptions.Item label="Business">{data?.bu.name}</ProDescriptions.Item>
                        <ProDescriptions.Item label="Function">{data?.department.name}</ProDescriptions.Item>
                        <ProDescriptions.Item label="Sub-Function">{data?.subDepartment?.name}</ProDescriptions.Item>
                        <ProDescriptions.Item label="Section">{data?.section}</ProDescriptions.Item>
                        <ProDescriptions.Item label="Team">{data?.team}</ProDescriptions.Item>
                        <ProDescriptions.Item label="Direct Supervisor">{[data?.directReportTo.code, data?.directReportTo.name].join(" - ")}</ProDescriptions.Item>
                        <ProDescriptions.Item label="Working Shift">{data?.workingShift.name}</ProDescriptions.Item>
                        {!data?.otherSegment && <ProDescriptions.Item span={2} label="Employee Segment">{data?.segment.name}</ProDescriptions.Item>}
                        {data?.otherSegment && <ProDescriptions.Item span={2} label="Employee Segment">{data?.otherSegment}</ProDescriptions.Item>}
                        <ProDescriptions.Item label="Type of Contract">{data?.contractType.name}</ProDescriptions.Item>
                        {(data?.contractDates?.length || 0) > 0 && <ProDescriptions.Item label="Contract Period">{data?.contractDates?.map(it => formatDate(it))?.join(" to ")}</ProDescriptions.Item>}
                    </ProDescriptions>
                </ProCard>
                <ProCard title='Type of Requisition' size='small'>
                    <ProDescriptions>
                        <ProDescriptions.Item label="Type">
                            <ProDescriptions.Item valueType={'checkbox'}><Checkbox checked={data?.requisitionType.id == 2041} >Replacement</Checkbox></ProDescriptions.Item>
                            <ProDescriptions.Item valueType={'checkbox'}><Checkbox checked={data?.requisitionType.id == 2042} >New Position</Checkbox></ProDescriptions.Item>
                        </ProDescriptions.Item>
                        {data?.requisitionType.id == 2041 && <ProDescriptions.Item label="Employee to be replaced">{[data?.replacedEmp?.code, data?.replacedEmp?.name].filter(it => it).join(" - ")}</ProDescriptions.Item>}
                        {data?.requisitionType.id == 2042 && <ProDescriptions.Item label="Hiring Reason" valueType={'textarea'}>{data?.hiredReason}</ProDescriptions.Item>}
                        {data?.requisitionType.id == 2042 && <ProDescriptions.Item label="Headcount" valueType={'textarea'}>{data?.headcount}</ProDescriptions.Item>}
                        {data?.requisitionType.id == 2042 && <ProDescriptions.Item label="Location" valueType={'textarea'}>{data?.location?.name}</ProDescriptions.Item>}
                        <ProDescriptions.Item label="Preferred start date">{formatDate(data?.expectedJoinDate)}</ProDescriptions.Item>
                        <ProDescriptions.Item label="Suggested sourcing">{data?.suggestedSourcing}</ProDescriptions.Item>

                    </ProDescriptions>

                </ProCard>

                {data?.proposedBudget && <ProCard title='HR' size='small'>
                    <ProDescriptions>
                        <ProDescriptions.Item label="Proposed Budget">{data?.proposedBudget}</ProDescriptions.Item>
                    </ProDescriptions>
                </ProCard>}

                <ProCard title='Job Description File' size='small'>
                    <ProList<AttachmentFile>
                        dataSource={attachmentFiles}
                        showActions="hover"
                        loading={requestActions.request?.loading}
                        metas={{
                            avatar: {
                                render: () => <FileOutlined />
                            },
                            title: {
                                render: (_, r) => (<Space>
                                    <a title='Download the file' onClick={() => downloadUploadFileV2()(r.id, r.fileName)}>{r.fileName}</a>
                                    {(r.fileType.includes("image", 0) || r.fileType.includes("application/pdf", 0)) && <FilePreview fileInfo={r} trigger={<Button title='Preview the file' type='link' icon={<EyeFilled />} />} />}
                                </Space>
                                ),
                            },
                        }}
                    />
                </ProCard>
            </Space>
        </Spin>)
}
