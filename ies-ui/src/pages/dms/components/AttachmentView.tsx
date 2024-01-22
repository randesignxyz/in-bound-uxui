import { FileServiceAPI } from "@/services/files/service"
import { simpleRequestActions } from "@/services/model"
import { ProList } from "@ant-design/pro-components"
import { useEffect, useState } from "react"
import { AttachmentFile } from "@/services/data"
import ImagePreview from "@/components/ImagePreview"
import { Button, Tag } from "antd"
import { DownloadOutlined } from "@ant-design/icons"
import { downloadUploadFileV2, getUploadFileObjectUrlV2 } from "@/services/apiGateway"
import { formateBytes, formateFileType } from "../core"
import { HistoryServiceAPI } from "../history/service"
import { DocumentationDTO } from "../documentation/data"

interface Props{
    fileId?:string;
    fileSize?:number;
    record?:DocumentationDTO;
}

export default  ({fileId, fileSize, record }:Props) =>{
    const requestAction = simpleRequestActions();
    const [as, sets] = useState<any>();
    const [attachList, setAttachList] = useState<AttachmentFile[]>([]);
    const onLoadData = async() =>{
        const data =await FileServiceAPI(requestAction).list([fileId ||""]);
         getUploadFileObjectUrlV2()(fileId ||"").then(i=>sets(i))
        setAttachList(data);
    }


    
    useEffect(()=>{
        fileId  && onLoadData();
    },[fileId]);
    
    
    return (<>
                
                <ProList<AttachmentFile>
                    dataSource={attachList}
                    metas={{
                        avatar:{
                            render:(_,r)=>(<ImagePreview width={50} fileId={r.id} />),

                        },
                        title:{
                            dataIndex:"fileName"
                        },
                        subTitle:{
                            dataIndex:"fileType",
                            render:(_,r)=>(<Tag bordered={false} color="blue">{formateBytes(fileSize|| 0, 2)}</Tag>)
                        },
                        description:{
                            dataIndex:"fileType",
                            render:(_,r)=>formateFileType(r.fileType)
                        },
                        content:{
                            dataIndex:"createdDate",
                            valueType:"dateTime",
                        },  
                        actions:{
                            render:(_,r)=>[
                                <Button
                                    icon={<DownloadOutlined/>}
                                    type="link"
                                    onClick={async ()=>{
                                        HistoryServiceAPI(requestAction).save({
                                            instantId: record?.id,
                                            action: "DOWNLOAD",
                                            actionType: "DOCUMENT",
                                        }).then(it => {
                                            downloadUploadFileV2()(record?.attachment?.fileId || "", record?.title||r.fileName);
                                        });
                                    }}
                                />
                            ]
                        }
                    }}

                />
        </>
    )
}
