import { formatDateTime } from "@/pages/utils";
import { FileExcelOutlined, FileJpgOutlined, FilePdfOutlined, FileWordOutlined } from "@ant-design/icons";
import { ProTable } from "@ant-design/pro-components";
import { Button } from "antd";
import { formateFileType, formateBytes } from "../core";
import { simpleRequestActions } from "@/services/model";
import { DocumentServiceAPI } from "../documentation/service";
import { DocumentationDTO } from "../documentation/data";
import { DMSPaths } from "..";
import { history } from "@umijs/max";


export default () =>{
    const requestAction = simpleRequestActions();
    
    return ( 
        <ProTable<DocumentationDTO>
                search={false}
                request={async()=>{
                    const data = await DocumentServiceAPI(requestAction).page({
                        criteria:{
                            searchValue:"",
                            advanceSearch:{
                                status:"Draft"
                            }
                    }
                    });
                    // return data
                    return Promise.resolve({
                        data:data.items,
                        // success:true
                    });
                }}
                // actionRef={ac}
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
                    // {
                    //     title: "Shared",
                    //     render: (_, r) => {
                    //         if (r.share > 0) {
                    //             return <Button icon={<ShareAltOutlined />} type="link" onClick={() => setShareDrawerState({ visible: { name: "DRAWER", type: "DETAIL", docId: r.id } })} />
                    //         }
                    //         else {
                    //             return ""
                    //         }
                    //     }
                    // },
                ]}

            />
    )
}