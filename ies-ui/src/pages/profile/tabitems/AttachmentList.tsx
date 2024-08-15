
import { ProTable } from "@ant-design/pro-components"  
import { PlusCircleFilled,EditOutlined, DownloadOutlined } from "@ant-design/icons"
import { Button, message, Modal, Space, Typography,Card } from 'antd';
import ExperienceModal from '../modal/ExperienceModal';
import { useEffect,useState } from 'react';
import { ProfileData} from '../data';
import { ExperienceData,  FilesData,  SaveExperience } from "../data.ess"; 
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
                                return <ImagePreview
                                    version={2}
                                    width={'30px'}
                                    key={r.id}
                                    fileId={r.id || ''}
                                    // fileName={r.file_name}
                                />
                            }
                        },
                        {
                            title: "File Name", dataIndex: "fileName"
                        },{
                            title: "Type", dataIndex: "fileType"
                        },{
                            title: "Created Date", render: (_, r) => <>{formatDateTime(r.createdDate)}</>  
                        },{
                            render: (_, r) =>{ 
                                // 
                                if(r.fileType=="text/csv"||r.fileType=="application/pdf"||r.fileType=="application/vnd.ms-excel"||r.fileType=="application/vnd.openxmlformats-officedocument.wordprocessingml.document"){  
                                    return(
                                        <Button
                                            icon={<DownloadOutlined />}
                                            type="link"
                                            onClick={async () => {  downloadUploadFileV2()(r?.id || "", r.fileType || ""); }}
                                        />
                                    )
                                }
                                else{
                                    return(<></>)
                                }
                            }
                        }
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