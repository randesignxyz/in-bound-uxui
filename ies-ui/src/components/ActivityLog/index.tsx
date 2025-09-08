import { formatDateTime } from "@/pages/utils";
import { Endpoint } from "@/services/API";
import { fetchDataListService } from "@/services/apiGateway"
import { simpleRequestActions } from "@/services/model";
import { FieldTimeOutlined } from "@ant-design/icons";
import { ProList } from "@ant-design/pro-components";
import { Spin } from "antd"
import moment from "moment";
import { Moment } from "moment";
import { useEffect, useState } from "react"


type ActivityListParam = {
    objectName: string;
    objectId: number;
}

export type ActivityLog = {
    activityType: string;
    activityDate: Moment,
    login: string;
    remarks?: string;
}

type StyleActivity ={
    avatar:React.CSSProperties
}

export default ({ objectName, objectId, endpoint, forceUpdate, styles }: { objectName: string, objectId: number, endpoint: Endpoint; forceUpdate?: number, styles?:StyleActivity }) => {

    const requestActions = simpleRequestActions()

    const [data, setData] = useState<ActivityLog[]>()
    const list = (objectName: string, objectId: number) => fetchDataListService<ActivityLog, { objectName: string; objectId: number; }>({
        actionName: 'list-activity-log',
        endpoint: endpoint,
        payload: {
            objectName,
            objectId
        }

    })

    useEffect(() => {

        (async () => {
            const rs = await list(objectName, objectId).query(requestActions)
            setData(rs)
        })()
    }, [objectId, forceUpdate])

    return <Spin spinning={requestActions.request?.loading}> <ProList<ActivityLog>
        dataSource={data}
        metas={{
            avatar: { render: () => <FieldTimeOutlined style={styles?.avatar} /> },
            title: { dataIndex: 'activityType' },
            subTitle: { render: (_, r) => `by ${r.login} ${moment(moment(r.activityDate)).fromNow()}` },
            description: { dataIndex: 'remarks' },
            actions: { render: (_, r) => [formatDateTime(moment(r.activityDate))] }
        }}
    />
    </Spin>
}