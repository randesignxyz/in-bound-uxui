import { formatDate } from "@/pages/utils";
import { EllipsisOutlined, ArrowRightOutlined, DownloadOutlined, HistoryOutlined, ShareAltOutlined, EditOutlined, InfoCircleOutlined } from "@ant-design/icons";
import { ActionType } from "@ant-design/pro-components"
import { Dropdown, Button, MenuProps, message, Badge } from "antd";
import { shareStatus } from "../core";
import { simpleRequestActions } from "@/services/model";
import { ShareServiceAPI } from "./service";
import { ReceiveShareAdvanceSearchParam, ShareDTO } from "./data";
import { useRef, useState } from "react";
import Detail from "./Detail";
import { history, useModel } from "@umijs/max";
import { DMSPaths } from "..";
import TableView, { TableViewSearchParams } from "@/components/DataCrud/TableView";
import { Paging } from "@/services/API";


export default () => {

    const requestAction = simpleRequestActions();
    const services = ShareServiceAPI(requestAction);
    const actionRef = useRef<ActionType>();
    const [detailState, setDetailState] = useState<{
        visible?: {
            name: "MODAL";
            payload?: ShareDTO
        }
    }>();

    const actionItem = (record: ShareDTO): MenuProps["items"] => {

        const preview = record.accessible == "previewer" ? true : false;
        const viewer = record.accessible == "viewer" ? true : false;
        return [
            {
                key: "1",
                label: "Quick View",
                itemIcon: <ArrowRightOutlined />,
                onClick: () => setDetailState({ visible: { name: "MODAL", payload: record } })
            },
            {  
                key: "detail",
                label: "Detail",
                itemIcon: < InfoCircleOutlined />,
                disabled: preview,
                onClick: () => history.push(`${DMSPaths.dms}/share/detail/${record.id}`)
            },
            {
                key: "2",
                label: "Download",   
                itemIcon: <DownloadOutlined />,
                disabled: (preview || record.attachment==null?true:false),
                onClick: async () => {
                    // HistoryServiceAPI(requestAction).save({
                    //     instantId:record.document.id,
                    //     action:"DOWNLOAD",   
                    //     actionType:"DOCUMENT",
                    //     remark:"download from share recipient"
                    // }).then(it=>{
                    //     // downloadUploadFileV2()(record.attachment?.fileId || "", record?.document?.title);
                    // });
                }
            },
            {
                key: "3",
                label: "Share",
                itemIcon: <ShareAltOutlined />,
                disabled: preview || viewer,
                onClick: async () => {
                    // await downloadUploadFileV2()(record.attachment?.fileId || "", record?.document?.title);
                }
            },
            {
                key: "4",
                label: "Edit",
                itemIcon: <EditOutlined />,
                disabled: preview || viewer,
                onClick: async () => {
                    // await downloadUploadFileV2()(record.attachment?.fileId || "", record?.document?.title);
                }
            },

            {
                type: "divider"
            },
            // {
            //     key: "5",
            //     label: "Delete",
            //     danger: true,
            //     itemIcon: <DeleteOutlined />,
            //     disabled: preview || viewer,
            //     onClick: async () => {
            //         await services.delete()
            //     }
            // },
            {
                key: "6",
                label: "History",
                disabled: preview || viewer,
                itemIcon: <HistoryOutlined />,
            },
        ]
    }
    const cacheList = useModel('dataList');
    const onRequestHandler = async (params: TableViewSearchParams<ReceiveShareAdvanceSearchParam>) => {
        try {
            return services.page(params).then((it) => {
                return cacheList.cacheDataList({
                    type: 'dms-share',
                    criteria: params,
                    data: it,
                });
            }) as Promise<Paging<ShareDTO>>;
        } catch (error: any) {
            message.error(error.message);
            return Promise.reject();
        }
    }

    return (
        <>
            <TableView<ShareDTO, {searchValue:string}>
                cache
                displayOnly
                columns={[
                    {
                        title:"Document Name",
                        dataIndex:"title",
                        sorter:"docName",
                        render:(_,r)=><Button type="link" size="small" onClick={()=>setDetailState({visible:{name:"MODAL", payload:r}})}>{r.document?.documentation?.docName}</Button>
                    },
                    {
                        title: "Shared by",
                        sorter: "createdBy",
                        dataIndex:"createdBy"
                    },
                    {   
                        title: "Expiry Date",
                        sorter:"expiry",
                        render: (_, r) => formatDate(r.expirationDate)
                    },
                    {
                        title: "Shared Date",
                        dataIndex: "createdDate",
                        valueType: "date",
                        sorter:"creatdDate"
                    },
                    {
                        title:"Status",
                        sorter:"status",
                        render:(_,r)=>{
                           
                            return (<>
                            <Badge status={shareStatus(r.expirationDate).status} text={shareStatus(r.expirationDate).title} />
                            </>)
                        }
                    },
                    {
                        title:"Remark",
                        sorter:"remark",
                        dataIndex:"description",
                        width:300
                    },

                    {
                        render: (_, r) => (<Dropdown
                            menu={{
                                items: actionItem(r),
                                style: {
                                    width: 200
                                }
                            }}
                        >
                            <a><EllipsisOutlined /></a>
                        </Dropdown>)
                    }
                ]}
                tableProps={{
                    actionRef:actionRef
                }}
                actionHandlers={{
                    onRequest: (criteria, pagination, sort) =>
                        onRequestHandler({
                            criteria: {
                                searchValue: criteria.searchValue || "",
                                sort,
                            },
                            pagination,
                        }),
                    onFirstLoad: () =>
                        cacheList.fetchDataList('dms-share').then((v) => {
                            if (v) {
                                return v.dataList;
                            } else {
                                return onRequestHandler({
                                    criteria: {
                                        searchValue: "",
                                    },
                                });
                            }
                        }) as Promise<Paging<ShareDTO>>,
                }}
            />

            <Detail
                onCancel={() => setDetailState(v => ({ ...v, visible: undefined }))}
                open={detailState?.visible?.name === "MODAL"}
                data={detailState?.visible?.payload}
            />
        </>
    )
}