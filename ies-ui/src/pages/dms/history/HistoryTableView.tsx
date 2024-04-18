import { HistoryDTO } from "./data"
import { FieldTimeOutlined } from "@ant-design/icons";
import { ActionType, ProList } from "@ant-design/pro-components";
import { HistoryServiceAPI } from "./service";
import { simpleRequestActions } from "@/services/model";
import { formatDateTime } from "@/pages/utils";
import moment from "moment";
import { useRef } from "react";
import { Tag } from "antd";

interface Props {
    intantId?: number;
    source:"CONTRACTS"|"DOCUMENTATION"
}

export default ({ intantId, source }: Props) => {
    const requestAction = simpleRequestActions();
    const services = HistoryServiceAPI(requestAction)
    const actionRef = useRef<ActionType>();
    const onRequestHandler =async (params?:{
        current?:number,
        pageSizee?:number,  
    }) =>{
        const data = await services.page({
            criteria: {
                advanceSearch: {
                    actionType: "",
                    instantId: intantId,
                    source:source
                }
            },
            pagination:{
                pageSize: params?.pageSizee,
                current: params?.current,
            }
        });
        return Promise.resolve({
            data: data.items,
            success: true,
            total:data.total
        })
    }
    return (
        <ProList<HistoryDTO>
            pagination={{
                pageSize: 10,
                pageSizeOptions:[10]
            }}
            metas={{
                avatar: {render: () => <FieldTimeOutlined />},
                title: {render: (_,r )=> (<><Tag color="blue">{r.actionType}</Tag> <span style={{color:"gray"}}>{r.action} by: {r.actionBy}</span></>)},
                subTitle: {render: (_,r )=> `${moment(moment(r.actionDate)).fromNow()}`},
                description: {dataIndex: 'remark'},
                actions:{
                    render:(_,r)=>[
                        <a key="invite">{formatDateTime(r.actionDate)}</a>,
                    ]
                }
            }}
            actionRef={actionRef}
            request={(e)=>{
                return onRequestHandler({
                    pageSizee:e.pageSize,
                    current:e.current
                })
            }}
        />
    )
}