import { ActionType, ProColumns } from "@ant-design/pro-components";
import { history, useAccess } from "@umijs/max";
import { Button, Flex, Space } from "antd";
import { useRef } from "react";
import PageWrapper from "@/components/PageWrapper";
import { TabRenderProps } from "@/components/PageWrapper/type";
import Status from "@/components/Status";
import { simpleRequestActions } from "@/services/model";
import { ExportOutlined, PlusOutlined } from "@ant-design/icons";
import { formatDateTime, toReadable } from "@/pages/utils";
import Export from "./Export";
import RequestForm from "./ItNewStaffRequestForm";
import { ITNewStaffFormNames, NewStaffItemDetail, NewStaffListItem, SavePayLoad, SearchParams } from "./data.types";
import { createService } from "./services";

export default () => {
    const access = useAccess()
    const requestActions = simpleRequestActions();
    const srv = createService(requestActions)
    const actionRef = useRef<ActionType>();

    const tabRender = (item?: NewStaffListItem): TabRenderProps[] => {
        return [
            {
                action: 'add',
                tabLabel: "New Request",
                tabIcon: <PlusOutlined />,
                panel: (props) => <RequestForm {...props as any} />
            }
        ]
    }

    const columns: ProColumns<NewStaffListItem, any>[] = [
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
    ]

    return <PageWrapper<NewStaffListItem, SearchParams, any>
        tabRender={tabRender}
        listView={{
            type: "Table",
            title: "ICT - New Staff Support Request",
            statuses: [
                {
                    option: {
                        label: "All", value: "ALL", default: true
                    },
                },
                {
                    option: {
                        label: "Pending", value: "PENDING"
                    },
                },
                {
                    option: {
                        label: "Completed", value: "COMPLETED"
                    },
                },
                {
                    option: {
                        label: "Rejected", value: "REJECTED"
                    },
                }
            ],
            actionButtons: [
                access.canRequestItNewStaffRequestExport && <Export key="export-btn" />
            ],
            props: {
                actionRef: actionRef,
                columns: columns,
                request: async (params, sort) => {
                    return srv.fetchPaging({
                        pagination: {
                            current: params.current,
                            pageSize: params.pageSize
                        },
                        criteria: {
                            keyword: params.keyword,
                            status: params.status as string,
                        },
                        sort: sort,
                    }).then(rs => {
                        return {
                            data: rs.items,
                            success: true,
                            total: rs.total
                        }
                    })
                }
            }
        }}

    />
}
