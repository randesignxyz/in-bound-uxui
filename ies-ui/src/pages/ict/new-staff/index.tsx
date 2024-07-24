import BaseCrud from "@/components/base-crud"
import { history } from "@umijs/max";
import { ITNewStaffFormNames, NewStaffItemDetail, NewStaffListItem, SavePayLoad, SearchParams } from "./data.types"
import { createService } from "./services"
import { simpleRequestActions } from "@/services/model"
import { ExportOutlined, PlusOutlined } from "@ant-design/icons";
import RequestForm from "./ItNewStaffRequestForm";
import { formatDateTime, toReadable } from "@/pages/utils";
import Status from "@/components/Status";
import { Button, Flex } from "antd";

export default () => {

    const requestActions = simpleRequestActions();
    const srv = createService(requestActions)

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
            addNewAction: {
                label: 'New Request',
                icon: <PlusOutlined />,
                key: 'new-request',
                onRenderComp(props) {
                    return <RequestForm  {...props} />
                },
            },

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
        }} title={"ICT - New Staff Support Rquest"}

    />
}