import BaseCrud from "@/components/base-crud"
import { history } from "@umijs/max";
import { FMANewStaffFormNames, NewStaffItemDetail, NewStaffListItem, SavePayLoad, SearchParams } from "./data.types"
import { createService } from "./services"
import { simpleRequestActions } from "@/services/model"
import { ExportOutlined, PlusOutlined } from "@ant-design/icons";
import { formatDateTime, toReadable } from "@/pages/utils";
import FMANewStaffRequestForm from "./FMANewStaffRequestForm";
import { useAccess } from "@umijs/max";
import Status from "@/components/Status";
import { Button, Flex } from "antd";

export default () => {

    const requestActions = simpleRequestActions();
    const srv = createService(requestActions)
    const access = useAccess()
    // const actionRef = useRef<ActionType>();

    return <BaseCrud<NewStaffListItem, NewStaffItemDetail, SearchParams, SavePayLoad >
        services={srv}
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
                                        `/external/data-form/${FMANewStaffFormNames.processDefKey}/${entity.processInstId}`,
                                    )
                                    ?.focus();
                            }}
                        /><a onClick={() => { history.push(`/data-form/${FMANewStaffFormNames.processDefKey}/${entity.processInstId}`) }}>{entity.formNo}</a></Flex>
                    },
                },
                { title: 'Requested By', sorter: 'requestedBy', dataIndex: 'requestedBy' },
                {
                    title: 'Requested Date', align: 'right', sorter: 'requestedDate', render(_, entity) {
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
            addNewAction: access.canRequestFMANewStaffRequest ? {
                label: 'New Request',
                icon: <PlusOutlined />,
                key: 'new-request',
                onRenderComp(props) {
                    return <FMANewStaffRequestForm  {...props} />
                },
            } : undefined,

            statusProps: {
                defaultValue: "ALL",
                options: [
                    { label: "All", value: "ALL" },
                    { label: "Pending", value: "PENDING" },
                    { label: "Completed", value: "COMPLETED" },
                    { label: "Rejected", value: "REJECTED" },
                ]
            },
        }} title={"FMA - New Staff Support Request"}

    />
}