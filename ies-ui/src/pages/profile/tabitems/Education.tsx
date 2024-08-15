import { ProTable } from "@ant-design/pro-components"
import { Button, message, Modal, Space, Typography,Card } from 'antd'; 
import { PlusCircleFilled,EditOutlined, EyeOutlined, PlusOutlined } from "@ant-design/icons";
import EducationModal from '../modal/EducationModal';
import { useEffect,useState } from 'react';

import { ProfileData} from '../data';
import { EducationData, FilesData} from "../data.ess"; 
import { ProfileServicesEss } from '../service_ess'; 
import { simpleRequestActions } from '@/services/model';
import EducationView from "../view/EducationView";
import PersonalViewEditModal from "../modal/PersonalViewEditModal";

interface Props {
    profile: ProfileData;
    step: any;
    is_admin:number;
    empId:number;
    cb:{ 
        onLoadData: () => void;  
    };
  }

export default ({ profile ,step,is_admin,empId,cb}: Props) => {    
    const [modalVisible, setModalVisible] = useState< { type: 'ADD'; payload: undefined } | { type: 'EDIT'; payload: EducationData } >();
    const [modalEducationViewVisible, setModalEducationViewVisible] = useState< { type: 'VIEW'; payload: EducationData } >(); 
    const hideEducationViewModal = (visble?: boolean) => !visble && setModalEducationViewVisible(undefined); 
    
    //
    const hideModal = (visble?: boolean) => !visble && setModalVisible(undefined); 

    const requestActions = simpleRequestActions();
    const [educationList, setEducationList] = useState<EducationData[]>([]);
    const [educationOldList, setEducationOldList] = useState<EducationData[]>([]);
    const [educationNewList, setEducationNewList] = useState<EducationData[]>([]);

    const [educationOldImageList, setEducationOldImageList] = useState<FilesData[]>([]);
    const [educationNewImageList, setEducationNewImageList] = useState<FilesData[]>([]); 
    const [educationAllImageList, setEducationAllImageList] = useState<FilesData[]>([]);
    
    const [createFileOther, selectedFileOther] = useState<any>();  
    useEffect(() => {
        initData();
    }, [profile]);
    //
    const initData = async () => {
        try {
            // 
            const list = await ProfileServicesEss.listEducation(profile.id).query(requestActions);
            setEducationList(list.data);  
            // old records edit 
            setEducationOldList(list.oldData); 
            // new records add
            setEducationNewList(list.newData);               
            // image list 
            setEducationOldImageList(list.fileOldData); 
            //
            setEducationNewImageList(list.fileNewData); 
            // all image
            setEducationAllImageList(list.fileAllData); 

        } catch (error: any) {
            message.error(error.message || 'Failed to load data.');
        }
    };
    const saveEducationHandler = async (data: EducationData) => {
        Modal.confirm({
          title: 'Created eduction',
          content: 'Are you sure?',
          onOk: async () => {
            try {
                data.otherFile = createFileOther;
                await ProfileServicesEss.saveEducation(data)(requestActions); 
                // call back fun
                cb.onLoadData();
                initData();
                hideModal();
            } catch (error: any) {
              message.error(error.message || 'Failed to created.');
            }
          },
        });
    };

    var lng = ["N/A","Khmer" ,"English","Chineses","Thai","Janpanese","Vietnamese"];  
 
    // open form emergency
    const onOpenForm = async (data:EducationData,_type:string,)=>{
        setModalVisible({ type: _type, payload: data });
        hideEducationViewModal(false);
    }
    return <div>
        <Card>
            <Space direction={"vertical"} style={{width:'100%'}}>
                <div style={{width:'100%',textAlign:'right'}}> 
                    <Space direction='horizontal'>
                        <Button style={{display:(is_admin==2&&empId>0)?'':'none'}} onClick={() => setModalVisible({ type: 'ADD', payload: undefined })}><PlusCircleFilled/> Add</Button>

                        <Button danger onClick={() => setModalEducationViewVisible({ type: 'VIEW', payload: null})} 
                            style={{display:step>=2&&empId==0?'':'none'}}><EyeOutlined/> View edit</Button> 

                        <Button style={{display: (step==2||step==7||step==5)&&is_admin==0?'':'none'}}
                            onClick={() => setModalVisible({ type: 'ADD', payload: null })}
                            icon={<PlusOutlined />}
                            key="1"
                            type="primary">
                            Add
                        </Button>
                    </Space>
                </div>
                <ProTable<EducationData>
                    dataSource={educationList}
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
                            title: "Degree", dataIndex: "degreeId",render: (dom, r) => {return lng[r.degreeId]}
                        },{
                            title: "Major/Subject", dataIndex: "marjorSubject"
                        },{
                            title: "Education Center", dataIndex: "educationCenter"
                        },{
                            title: "Country of Education Center", dataIndex: "countryEducationCenter",render: (dom, r) => {return lng[r.countryEducationCenter]}
                        },{
                            title: "Status", dataIndex: "statusId",render: (dom, r) => {return lng[r.statusId]}
                        },
                        {   width: 100,
                            render: (dom, r) => {
                                return (<>
                                  <a style={{display: (is_admin==0&&empId==0)?'':'none'}} 
                                  onClick={() => setModalVisible({ type: 'EDIT', payload: r })}>
                                    <EditOutlined />
                                  </a>
                                  <a style={{display: (is_admin==2&&empId>0)?'':'none'}} 
                                  onClick={() => setModalVisible({ type: 'EDIT', payload: r })}>
                                    <EditOutlined />
                                  </a></>
                                );
                              },
                        }
                    ]}
                />
            </Space>
        </Card>
        {/*  */}
        <EducationModal
            open={!!modalVisible?.type} 
            onOpenChange={(visible) => hideModal(visible)}
            profile={profile}
            data={modalVisible?.payload}
            files={modalVisible?.type=='EDIT'?educationOldImageList:educationNewImageList}
            type={modalVisible?.type!!}
            isAdmin={is_admin}
            empId={empId}
            cb={{
                onLoadMenu: (tid) => { 
                    selectedFileOther(tid);
                },
                onReload:()=>{
                    hideModal();
                    initData();
                }
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
            onFinish={(data) => {
                return saveEducationHandler({ ...data, id: modalVisible?.type=='EDIT'?modalVisible?.payload?.educationId:(modalVisible?.payload?.id||0), empId: profile.id,type:modalVisible?.type });
            }}
        />
        {/*  */}
        <EducationView 
            open={!!modalEducationViewVisible?.type} 
            onOpenChange={(visible) => hideEducationViewModal(visible)} 
            oldData={educationOldList}
            newData={educationNewList}
            essProfileId={profile.id}
            files={educationAllImageList}
            cb={{
                onOpenEditForm: (id,type) => { 
                    onOpenForm(id,type);
                },
            }}
            isAdmin={is_admin}
            onFinishFailed={(error) => {
                message.error(
                    <Space direction="vertical" align="start">
                    {error.errorFields.map((it) => (
                        <div>{it.errors.join(', ')}</div>
                    ))}
                    </Space>,
                );
            }} 
        /> 

    </div>
}