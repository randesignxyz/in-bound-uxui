import { formatDateTime } from "@/pages/utils";
import { FileExcelOutlined, FileJpgOutlined, FilePdfOutlined, FileWordOutlined, ArrowRightOutlined, DownloadOutlined, ShareAltOutlined, EditOutlined, HeartOutlined, EllipsisOutlined } from "@ant-design/icons";
import { ActionType, ProTable } from "@ant-design/pro-components"
import { Button, Dropdown, MenuProps } from "antd";
import { formateFileType, formateBytes } from "../core";
import { simpleRequestActions } from "@/services/model";
import { FavoriteServiceAPI } from "./service";
import { useRef } from "react";
import { DocumentationDTO } from "../documentation/data";
import { DMSPaths } from "..";
import { history } from "@umijs/max";


export default () =>{

    const requestAction = simpleRequestActions();
    const actionRef = useRef<ActionType>();

    const actionItem =(record:DocumentationDTO):MenuProps["items"] =>[
        {
            key: "1",
            label: "View",
            itemIcon: <ArrowRightOutlined />,
        },
        {
            key: "2",
            label: "Download",
            itemIcon: <DownloadOutlined />,
            onClick: async () => {
            }
        },
        {
            key: "3",
            label: "Share",
            itemIcon: <ShareAltOutlined />,
            onClick: async () => {
                // await downloadUploadFileV2()(record.attachment.fileId || "", record?.document?.title);
            }
        },
        {
            key: "4",
            label: "Edit",
            itemIcon: <EditOutlined />,
            onClick: async () => {
                // await downloadUploadFileV2()(record.attachment.fileId || "", record?.document?.title);
            }
        },
        {
            key: "fave",
            label: "Unfavorite",
            itemIcon: <HeartOutlined />,
            onClick: async () => {
               await FavoriteServiceAPI(requestAction).save({
                id:record.favorite?.id,
                documentId:record.favorite?.documentId
               });
               actionRef.current?.reload?.();
            }
        },
        
        // {
        //     type: "divider"
        // },
        // {
        //     key: "5",
        //     label: "Delete",
        //     danger:true,
        //     itemIcon: <DeleteOutlined />,
        //     onClick: async () => {
        //         // await downloadUploadFileV2()(record.attachment?.fileId || "", record?.document?.title);
        //     }
        // },
        // {
        //     key: "6",
        //     label: "History",
        //     itemIcon: <HistoryOutlined />,
        // },
       
    ]
    return (
        <>
            <ProTable<DocumentationDTO>
                search={false}
                request={async()=>{
                    const data = await FavoriteServiceAPI(requestAction).page({
                        criteria:{searchValue:""}
                        
                    });

                    return Promise.resolve({
                        data:data.items,
                        success:true
                    });
                }}
                actionRef={actionRef}
                columns={[
                    {
                        title: "Name",
                        sorter: "title",
                        render: (_, r) => (
                            <Button
                                type="link"
                                onClick={() => history.push(`${DMSPaths.document}/detail/${r.id}`)}
                            >
                                {
                                    formateFileType(r?.attachment?.fileType) == "EXCEL" && <FileExcelOutlined /> ||
                                    formateFileType(r?.attachment?.fileType) == "JPG" && <FileJpgOutlined /> ||
                                    formateFileType(r?.attachment?.fileType) == "PDF" && <FilePdfOutlined /> ||
                                    formateFileType(r?.attachment?.fileType) == "PNG" && <FileJpgOutlined /> ||
                                    formateFileType(r?.attachment?.fileType) == "WORD" && <FileWordOutlined />
                                }
                                {r.title}
                            </Button>)
                    },
                    {
                        title: "Created By",
                        dataIndex: "createdBy"
                    },
                    {
                        title: "Date modified",
                        render: (_, r) => formatDateTime(r.lastModifiedDate, 'DD/MM/YYYY H:m')
                    },
                    {
                        title: "type",
                        render: (_, r) => formateFileType(r?.attachment?.fileType)
                    },
                    {
                        title: "Size",
                        render: (_, r) => formateBytes(r?.attachment?.fileSize, 2)
                    },
                    {
                        valueType:"option",
                        render:(_,r)=>{
                         
                            return (<>
                                    <Dropdown
                                        menu={{
                                            items:actionItem(r),
                                            style:{
                                                width:200
                                            }
                                        }}
                                    >
                                        <a><EllipsisOutlined/></a>
                                    </Dropdown>
                            </>)
                        }
                    }
                ]}

            />

            {/* <Detail
                onCancel={()=>setDetailState(v=>({...v,visible:undefined}))}
                open={detailState?.visible?.name==="MODAL"}
                data={detailState?.visible?.payload}
            /> */}
        </>
    )
}