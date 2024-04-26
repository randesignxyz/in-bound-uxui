import { formatDateTime } from "@/pages/utils";
import { ProList } from "@ant-design/pro-components";
import { Tag } from "antd";
import moment from "moment";
import { ActivityLogAdvanceSearchParam, ActivityLogDTO } from "../data";
import { AccessoryServiceAPI } from "../accessory/service";
import { simpleRequestActions } from "@/services/model";

interface Props{
    referenceStringId:string;
    logParam:ActivityLogAdvanceSearchParam
}

export default ({ referenceStringId, logParam , ...props }:Props) => {
    const requestActions = simpleRequestActions();
    const services = AccessoryServiceAPI(requestActions);
    return (
        <ProList<ActivityLogDTO>
            request={async (params = {} as Record<string, any>) => {
                const dataList = await services.pageActivityLog({
                    criteria: {
                        searchValue: "",
                        advanceSearch: {
                            source:logParam.source
                            // referenceIntId: data?.id
                        },
                    },
                    pagination: {
                        current: params.current,
                    }
                });
                return Promise.resolve({
                    data: dataList.items,
                    success: true
                })
            }}
            pagination={{
            }}
            // actionRef={actionRef}
            metas={{
                title: {
                    dataIndex: "activity"
                },
                subTitle: {
                    render: (_, r) => (<>
                        <Tag color="blue" bordered={false}>{`by ${r.createdBy} `}</Tag>
                        <Tag color="cyan" bordered={false}>{moment(moment(r.createdDate)).fromNow()}</Tag>
                    </>)
                },
                description: {
                    render: (_, r) => (<>
                        <span>{`${r.remark} `}</span>
                    </>
                    )
                },
                actions: {
                    render: (_, r) => <a>{formatDateTime(r.createdDate)}</a>
                }
            }}
        />
    )
}