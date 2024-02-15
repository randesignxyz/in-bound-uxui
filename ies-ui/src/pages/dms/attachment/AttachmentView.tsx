import { simpleRequestActions } from "@/services/model"
import { ActionType, ProList } from "@ant-design/pro-components"
import { Button, Flex } from "antd"
import { DeleteOutlined, DownloadOutlined, EyeOutlined, ReloadOutlined } from "@ant-design/icons"
import { downloadUploadFileV2 } from "@/services/apiGateway"
import { formateBytes } from "../core"
import { HistoryServiceAPI } from "../history/service"
import { Attachment } from "../documentation/data"
import { Modal } from "antd/lib"
import { AttachmentServiceAPI } from "./service"
import { useEffect, useRef, useState } from "react"
import QuickViewFile from "./QuickViewFile"
import { formatDate } from "@/pages/utils"

interface Props {
    docId?: number;
    exActionRef?:any ;
    key?:string;
}

export default ({ docId, exActionRef, key }: Props) => {
    const requestAction = simpleRequestActions();
    const actionRef = useRef<ActionType>();
    console.log(key);
    
    const [state, setState] = useState<{
        visible?: {
            name: "DRAWER",
            payloads: Attachment;
        }
    }>();
    const onLoadAttachment = async () => {
        const data = await AttachmentServiceAPI(requestAction).list(docId);
        return Promise.resolve({
            data: data,
            success: true
        })
    }
    useEffect(() => {
        docId  !=null  && onLoadAttachment();
    }, [docId]);

    return (<>
        <ProList<Attachment>
            actionRef={actionRef}
            toolBarRender={() => {
                return [
                    <Button icon={<ReloadOutlined />} type="link" onClick={() => actionRef.current?.reload?.()} />
                ]
            }}
            request={onLoadAttachment}
            metas={{
                title: {
                    dataIndex: "fileName"
                },
                description: {
                    dataIndex: "fileType",
                    render: (_, r) => (<>
                        <p>Upload by: {r.createdBy}</p>
                    </>)
                },
                content: {
                    dataIndex: "createdDate",
                    valueType: "dateTime",
                    render: (_, r) => (<Flex vertical>
                        <span>{formatDate(r.createdDate)}</span>
                        <span>{formateBytes(r.fileSize || 0, 2)}</span>
                    </Flex>)
                },
                actions: {
                    render: (_, r) => [

                        <Button
                            type="link"
                            onClick={() => setState({ visible: { name: "DRAWER", payloads: r } })}
                            icon={<EyeOutlined />}
                        // disabled={r.fileExtension =="pdf"?false:true}
                        >View</Button>
                        ,
                        <Button
                            icon={<DownloadOutlined />}
                            type="link"
                            onClick={async () => {
                                HistoryServiceAPI(requestAction).save({
                                    instantId: docId,
                                    action: "files was downloaded",
                                    actionType: "Download",
                                    source: "DOCUMENTATION",

                                }).then(it => {
                                    downloadUploadFileV2()(r?.fileId || "", r.fileName || "");
                                });
                            }}
                        >Download</Button>,
                        <Button
                            danger
                            type="link"
                            icon={<DeleteOutlined />}
                            onClick={async () => {
                                Modal.confirm({
                                    title: "Delete Attachment",
                                    content: "Do you want to continue",
                                    onOk: () => {
                                        AttachmentServiceAPI(requestAction).delete(r.id);
                                        actionRef.current?.reloadAndRest?.()
                                    }
                                })
                            }}
                        >Delete</Button>,
                    ]
                }
            }}
        />

        <QuickViewFile
            open={state?.visible?.name === "DRAWER"}
            onClose={() => setState(v => ({ ...v, visible: undefined }))}
            attachment={state?.visible?.payloads}
        />
    </>
    )
}
