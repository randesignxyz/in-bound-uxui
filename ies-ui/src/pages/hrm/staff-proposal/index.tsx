import BaseCrud from "@/components/base-crud"
import { history } from "@umijs/max";
import { SavePayLoad, SearchParams, StaffProposalDetail, StaffProposalFormNames, StaffProposalListItem } from "./data.types"
import { createService } from "./services"
import { simpleRequestActions } from "@/services/model"
import { ExportOutlined, PlusOutlined } from "@ant-design/icons";
import { formatDateTime, toReadable } from "@/pages/utils";
import StaffProposalRequestForm from "./StaffProposalRequestForm";
import { useAccess } from "@umijs/max";
import Status from "@/components/Status";
import { Button, Flex } from "antd";

export default () => {

    const requestActions = simpleRequestActions();
    const srv = createService(requestActions)
    const access = useAccess()
    return <BaseCrud<StaffProposalListItem, StaffProposalDetail, SearchParams, SavePayLoad >

        services={srv}
        listView={{

            columns: () => [
                {
                    title: 'Form #', sorter: 'formNo', render(_, entity) {
                        return <Flex gap={5}><Button
                            size="small"
                            type="link"
                            title="Open in new tab"
                            icon={<ExportOutlined />}
                            onClick={() => {
                                window
                                    .open(
                                        `/external/data-form/${StaffProposalFormNames.processDefKey}/${entity.processInstId}`,
                                    )
                                    ?.focus();
                            }}
                        /> <a onClick={() => { history.push(`/data-form/${StaffProposalFormNames.processDefKey}/${entity.processInstId}`) }}>{entity.formNo}</a>
                        </Flex>
                    },
                },
                { title: 'Requested By', sorter: 'requestedBy', dataIndex: 'requestedBy' },
                {
                    title: 'Requested Date', sorter: 'requestedDate', render(_, entity) {
                        return formatDateTime(entity.requestedDate)
                    },
                },
                { title: 'Employee', dataIndex: 'empName', sorter: 'empName' },
                { title: 'Job Title', dataIndex: 'jobTitle', sorter: 'jobTitle' },
                { title: 'BU', dataIndex: 'bu', sorter: 'bu' },
                { title: 'Function', dataIndex: 'department', sorter: 'function' },
                { title: 'Report To', dataIndex: 'reportTo' },
                { title: 'Status', render: (_, r) => <Status text={r.status} /> },
            ],
            quickSearch: true,
            addNewAction: access.canRequestHrStaffProposal ? {
                label: 'New Request',
                icon: <PlusOutlined />,
                key: 'new-request',
                onRenderComp(props) {
                    return <StaffProposalRequestForm{...props}
                        formKey={StaffProposalFormNames.processDefKey}
                    />
                },
            } : undefined,

            statusProps: {
                defaultValue: "ALL",
                options: [
                    { label: "All", value: "ALL" },
                    { label: "Pending", value: "PENDING" },
                    { label: "Completed", value: "COMPLETED" },
                    { label: "Rejected", value: "REJECTED" },
                    { label: "Canceled", value: "CANCELED" },
                ]
            },
            subStatusProps: undefined,
            onBeforeSearch: undefined
        }} title={"Staff Proposal Rquest"}

    />
}