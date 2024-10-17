
import { ProTable } from "@ant-design/pro-components"  
import { FileExcelOutlined,FilePdfOutlined, DownloadOutlined,FileWordOutlined,FileOutlined,FileZipOutlined } from "@ant-design/icons"
import { Button, message, Modal, Space, Typography,Card, Flex } from 'antd'; 
import { useEffect,useState } from 'react';
import { ProfileData} from '../data';
import { FilesData } from "../data.ess"; 
import { ProfileServicesEss } from '../service_ess'; 
import { simpleRequestActions } from '@/services/model';
import ImagePreview from "@/components/ImagePreview";
import { formatDate, formatDateTime } from "@/pages/utils";
import { downloadUploadFileV2 } from "@/services/apiGateway";


interface Props {
    profile: ProfileData;
    step: any;
    is_admin:number;
  }

export default ({ profile ,step,is_admin}: Props) => {
    const [modalVisible, setModalVisible] = useState< { type: 'ADD'; payload: undefined } | { type: 'EDIT'; payload: FilesData } >();
    const hideModal = (visble?: boolean) => !visble && setModalVisible(undefined);
    const requestActions = simpleRequestActions();
    const [imageList, setImageList] = useState<FilesData[]>([]);
    
    const [createFileOther, selectedFileOther] = useState<any>();  

    useEffect(() => {
        initData();
    }, []);
    const initData = async () => {
        try {
            const list = await ProfileServicesEss.listImageProfile(profile.id,0,0,0).query(requestActions);
            setImageList(list); 
        } catch (error: any) {
            message.error(error.message || 'Failed to load data.');
        }
    };
 
    return <div>
        <Card>
            <Space direction={"vertical"} style={{width:'100%'}}>
                {/* <div style={{width:'100%',textAlign:'right'}}>
                    <Button style={{display: is_admin==1?'':'none'}}
                        onClick={() => setModalVisible({ type: 'ADD', payload: null })}
                        icon={<PlusCircleFilled />}
                        key="1"
                        type="primary">
                        Add
                    </Button>
                </div> */}
                <ProTable<FilesData>
                    dataSource={imageList}
                    search={false}
                    pagination={false}
                    size='small'
                    options={{
                        density: false,
                        fullScreen: false,
                        setting: false,
                        reload: false
                    }}
                    columns={[
                        {
                            title: "Image",  
                            render: (dom, r) => { //downloadUploadFileV2()(r?.fileId || "", r.fileName || "");
                                switch(r.fileType){
                                    case "text/csv":
                                        return <FileOutlined />;
                                    case "application/pdf":
                                        return <FilePdfOutlined />;
                                    case "application/vnd.ms-excel":
                                        return <FileExcelOutlined />;
                                    case "application/vnd.openxmlformats-officedocument.wordprocessingml.document":
                                        return <FileWordOutlined />; 
                                    case "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet":
                                        return <FileExcelOutlined />;
                                    case "application/x-zip-compressed":
                                        return <FileZipOutlined />;                                    
                                    case "application/x-compressed":
                                        return <FileZipOutlined />;    
                                    default:
                                        return <ImagePreview
                                            version={2}
                                            width={'30px'}
                                            key={r.id}
                                            fileId={r.id || ''}
                                            // fileName={r.file_name}
                                        />
                                }
                            }
                        },
                        {
                            title: "File Name", 
                            dataIndex: "fileName",
                            render: (_, r) =>{ 
                                // 
                                if(r.fileType=="text/csv"||
                                    r.fileType=="application/pdf"||
                                    r.fileType=="application/vnd.ms-excel"||
                                    r.fileType=="application/vnd.openxmlformats-officedocument.wordprocessingml.document"||
                                    r.fileType=="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"||
                                    r.fileType=="application/x-zip-compressed"||
                                    r.fileType=="application/x-compressed"
                                ){  
                                    return(<Flex>{r.fileName}
                                        <Button title="download"
                                            icon={<DownloadOutlined />}
                                            type="link"
                                            onClick={async () => {  downloadUploadFileV2()(r?.id || "", r.fileType || ""); }}
                                        />
                                        </Flex>
                                    )
                                }
                                else{
                                    return(<>{r.fileName}</>)
                                }
                            }
                        },{
                            title: "Type", dataIndex: "fileType"
                        },{
                            title: "Created Date", render: (_, r) => <>{formatDateTime(r.createdDate)}</>  
                        },{
                            title: "Created By",
                            dataIndex: "createdBy",
                        },{
                            title: "Located", 
                            render: (_, r) =>{ 
                                // 1: personal;2:emergency;3:education;4:language;5:training;6:workingexperience
                                switch (r.type) {
                                    case '1':
                                        return 'Personal Information'
                                    case '3':
                                        return 'Education'
                                    case '4':
                                        return 'Language'
                                    case '5':
                                        return 'Training/Certification'
                                    case '6':
                                        return 'Work Experiences' 
                                    default: return 'N/A'
                                }
 
                            }
                        },
                    ]}
                />
            </Space>
        </Card>
        
        {/* <ExperienceModal
            open={!!modalVisible?.type}
            // lookupList={lookupDataList}
            onOpenChange={(visible) => hideModal(visible)}
            data={modalVisible?.payload}
            cb={{
                onLoadMenu: (tid) => { 
                    selectedFileOther(tid);
                },
            }}
            onFinishFailed={(error) => {
            message.error(
                <Space direction="vertical" align="start">
                {error.errorFields.map((it) => (
                    <div>{it.errors.join(', ')}</div>
                ))}
                </Space>,
            );
            }}
            // onFinish={(data) => {
            //     return saveImageHandler({ ...data, id: modalVisible?.payload?.id, empId: profile.id,status:true });
            // }}
        /> */}
    </div>
}