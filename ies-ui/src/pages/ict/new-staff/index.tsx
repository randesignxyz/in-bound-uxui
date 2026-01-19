import BaseCrud from "@/components/base-crud"
import { history, useAccess } from "@umijs/max";
import { ITNewStaffFormNames, NewStaffItemDetail, NewStaffListItem, SavePayLoad, SearchParams } from "./data.types"
import { createService } from "./services"
import { simpleRequestActions } from "@/services/model"
import { ExportOutlined, PlusOutlined } from "@ant-design/icons";
import RequestForm from "./ItNewStaffRequestForm";
import { formatDateTime, toReadable } from "@/pages/utils";
import Status from "@/components/Status";
import { Button, Flex, Space } from "antd";
import Export from "./Export";

export default () => {
    const access = useAccess()
    const requestActions = simpleRequestActions();
    const srv = createService(requestActions)

    return <BaseCrud<NewStaffListItem, NewStaffItemDetail, SearchParams, SavePayLoad >
        
        listView={{
            columns: () => [
                {
                    title: 'Form No', sorter: 'formNo', render(_, entity) {
                        return <Flex gap={5}><Button
                            size="small"
                            type="link"
                            title="Open in new tab"
                            icon={<ExportOutlined />}
                            onClick={() => {
                                window
                                    .open(
                                        `/external/data-form/${ITNewStaffFormNames.processDefKey}/${entity.processInstId}`,
                                    )
                                    ?.focus();
                            }}
                        /><a onClick={() => { history.push(`/data-form/${ITNewStaffFormNames.processDefKey}/${entity.processInstId}`) }}>{entity.formNo}</a>
                        </Flex>
                    },
                },
                { title: 'Requested By', sorter: 'requestedBy', dataIndex: 'requestedBy' },
                {
                    title: 'Requested Date', sorter: 'requestedDate', render(_, entity) {
                        return formatDateTime(entity.requestedDate)
                    },
                },
                { title: 'Employee ID.', dataIndex: "empNo", sorter: 'empNo' },
                { title: 'Employee Name', dataIndex: "empName", sorter: 'empName' },
                { title: 'Employee Name (KH)', dataIndex: "empLocalName" },
                { title: 'Function', dataIndex: "department", sorter: 'dept' },
                { title: 'Job Title', dataIndex: "jobTitle", sorter: 'jobTitle' },
                { title: 'Status', render: (_, r) => <Status text={toReadable(r.status)} />, sorter: 'status' },
            ],
            quickSearch: true,
            extra: (
                <Space>
                {access.canRequestItNewStaffRequestExport && <Export />}
                </Space>
            ),
            addNewAction: access.canRequestITNewStaffRequest?{
                label: 'New Request',
                icon: <PlusOutlined />,
                key: 'new-request',
                onRenderComp(props) {
                    return <RequestForm  {...props} />
                },
            }:undefined,

            statusProps: {
                defaultValue: "ALL",
                options: [
                    { label: "All", value: "ALL" },
                    { label: "Pending", value: "PENDING" },
                    { label: "Completed", value: "COMPLETED" },
                    { label: "Rejected", value: "REJECTED" },
                ]
            },
            subStatusProps: undefined,
            onBeforeSearch: undefined
        }} services={srv} title={"ICT - New Staff Support Rquest"}

    />
}