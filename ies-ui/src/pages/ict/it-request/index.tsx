import BaseCrud from "@/components/base-crud"
import { formatDateTime } from "@/pages/utils";
import { simpleRequestActions } from "@/services/model"
import { ExportOutlined, PlusOutlined } from "@ant-design/icons";
import { ITRequestDetail, ITRequestFormNames, ITRequestListItem, SearchParams } from "./data.types";
import RequestForm from "./RequestForm";
import { createService } from "./services";
import { useAccess, history } from "@umijs/max";
import moment from "moment";
import Status from "@/components/Status";
import { Button, Flex, Space } from "antd";


export default () => {

    const requestActions = simpleRequestActions();
    const srv = createService(requestActions)
    const access = useAccess()
    // const actionRef = useRef<ActionType>();

    // const statusColor = (status: string) => {
    //     if(status == 'PENDING'){
    //         return 'processing'
    //     }else if (status == "CANCELED" || status == "REJECTED" ) {
    //         return "error"
    //     }else {
    //         return "success"
    //     }
    // }
    return <BaseCrud<ITRequestListItem, ITRequestDetail, SearchParams, {} >

        listView={{
            statusProps: {
                defaultValue: 'ALL',
                options: [
                    { label: "All", value: "ALL" },
                    { label: "Pending", value: "PENDING" },
                    { label: "Completed", value: "COMPLETED" },
                    { label: "Rejected", value: "REJECTED" },
                ]
            },
            // actionRef: actionRef,
            addNewAction: access.canRequestITRequest ? {
                label: 'New Request',
                icon: <PlusOutlined />,
                key: 'new-request',
                onRenderComp(props) {
                    return <RequestForm  {...props} />
                },
            } : undefined,
            quickSearch: true,
            columns: () => [
                {
                    title: 'Form No', width: 160, sorter: 'formNo', render(_, entity) {
                        return <Flex gap={5}><Button
                            size="small"
                            type="link"
                            title="Open in new tab"
                            icon={<ExportOutlined />}
                            onClick={() => {
                                window
                                    .open(
                                        `/external/data-form/${ITRequestFormNames.processDefKey}/${entity.processInstanceId}`,
                                    )
                                    ?.focus();
                            }}
                        />
                            <a onClick={() => { history.push(`/data-form/${ITRequestFormNames.processDefKey}/${entity.processInstanceId}`) }}>{entity.formNo}</a>
                        </Flex>
                    },
                },
                { title: 'Requested By', sorter: 'requestedBy', dataIndex: 'requestedBy' },
                {
                    title: 'Requested Date', sorter: 'requestedDate', render(_, entity) {
                        return formatDateTime(entity.requestedDate)
                    },
                },
                { title: 'Reason', sorter: 'reason', dataIndex: 'reason' },
                { title: 'Completed By', sorter: 'completedBy', dataIndex: 'completedBy' },
                {
                    title: 'Completed Date', sorter: 'completedDate', render(_, entity,) {
                        return formatDateTime(entity.completedDate)
                    },
                },
                {
                    title: 'Task Time', sorter: 'reason', dataIndex: 'reason', render(_, entity) {
                        return entity.completedDate ? '' : moment(moment(entity.requestedDate)).fromNow()
                    }
                },
                {
                    title: 'Status', sorter: 'status', render(_, entity) {
                        return <Status text={entity.status} />
                    }
                },

            ]
        }} services={srv} title={"IT Rquest"} />

}

