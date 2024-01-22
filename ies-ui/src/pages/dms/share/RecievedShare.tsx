import { formatDate } from "@/pages/utils";
import { FileExcelOutlined, FileJpgOutlined, FilePdfOutlined, FileWordOutlined, EllipsisOutlined, ArrowRightOutlined, DownloadOutlined, HistoryOutlined, ShareAltOutlined, EditOutlined, DeleteOutlined, InfoCircleOutlined } from "@ant-design/icons";
import { ProTable } from "@ant-design/pro-components"
import { Dropdown, Button, MenuProps } from "antd";
import { formateFileType, formateBytes } from "../core";
import { simpleRequestActions } from "@/services/model";
import { ShareServiceAPI } from "./service";
import { downloadUploadFileV2 } from "@/services/apiGateway";
import { ShareDTO } from "./data";
import { useState } from "react";
import Detail from "./Detail";
import { history } from "@umijs/max";
import { DMSPaths } from "..";
import { HistoryServiceAPI } from "../history/service";


export default () => {

    const requestAction = simpleRequestActions();
    const services = ShareServiceAPI(requestAction);
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
                onClick: () => history.push(`${DMSPaths.document}/detail/${record.document?.id}`)
            },
            {
                key: "2",
                label: "Download",
                itemIcon: <DownloadOutlined />,
                disabled: (preview || record.attachment==null?true:false),
                onClick: async () => {
                    HistoryServiceAPI(requestAction).save({
                        instantId:record.document.id,
                        action:"DOWNLOAD",
                        actionType:"DOCUMENT",
                        remark:"download from share recipient"
                    }).then(it=>{
                        downloadUploadFileV2()(record.attachment?.fileId || "", record?.document?.title);
                    });
                    // await 
                }
            },
            {
                key: "3",
                label: "Share",
                itemIcon: <ShareAltOutlined />,
                disabled: preview || viewer,
                onClick: async () => {
                    await downloadUploadFileV2()(record.attachment?.fileId || "", record?.document?.title);
                }
            },
            {
                key: "4",
                label: "Edit",
                itemIcon: <EditOutlined />,
                disabled: preview || viewer,
                onClick: async () => {
                    await downloadUploadFileV2()(record.attachment?.fileId || "", record?.document?.title);
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
    return (
        <>
            <ProTable<ShareDTO>
                headerTitle={"Shared List"}
                search={false}
                request={async () => {
                    const data = await services.page({
                        criteria: { searchValue: "" }

                    });

                    return Promise.resolve({
                        data: data.items,
                        success: true
                    });
                }}
                columns={[
                    {
                        title: "Name",
                        sorter: "title",
                        render: (_, r) => (
                            <Button
                                type="link"
                                onClick={() => setDetailState({ visible: { name: "MODAL", payload: r } })}
                            >
                                {
                                    formateFileType(r?.attachment?.fileType) == "EXCEL" && <FileExcelOutlined /> ||
                                    formateFileType(r?.attachment?.fileType) == "JPG" && <FileJpgOutlined /> ||
                                    formateFileType(r?.attachment?.fileType) == "PDF" && <FilePdfOutlined /> ||
                                    formateFileType(r?.attachment?.fileType) == "PNG" && <FileJpgOutlined /> ||
                                    formateFileType(r?.attachment?.fileType) == "WORD" && <FileWordOutlined />
                                }
                                {r.document.title}
                            </Button>)
                    },
                    {
                        title:"Shared by",
                        dataIndex:"createdBy"
                    },
                    
                    {
                        title: "Expiry Date",
                        render: (_, r) => formatDate(r.expirationDate)
                    },
                    {
                        title: "Shared Date",
                        dataIndex: "createdDate",
                        valueType: "date"
                    },
                    {
                        title: "Size",
                        render: (_, r) => formateBytes(r.attachment?.fileSize, 2)
                    },
                    {
                        title:"Remark",
                        dataIndex:"description"
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



            />

            <Detail
                onCancel={() => setDetailState(v => ({ ...v, visible: undefined }))}
                open={detailState?.visible?.name === "MODAL"}
                data={detailState?.visible?.payload}
            />
        </>
    )
}