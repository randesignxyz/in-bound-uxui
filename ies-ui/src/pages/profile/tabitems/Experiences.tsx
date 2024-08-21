
import { ProTable } from "@ant-design/pro-components"  
import { PlusCircleFilled,EditOutlined, EyeOutlined, PlusOutlined } from "@ant-design/icons"
import { Button, message, Modal, Space, Typography,Card } from 'antd';
import ExperienceModal from '../modal/ExperienceModal';
import { useEffect,useState } from 'react';
import { ProfileData} from '../data';
import { ExperienceData,  FilesData,  SaveExperience } from "../data.ess"; 
import { ProfileServicesEss } from '../service_ess'; 
import { simpleRequestActions } from '@/services/model';
import ExperienceView from "../view/ExperienceView";
import { formatDateTime } from "@/pages/utils";


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
    const [modalVisible, setModalVisible] = useState< { type: 'ADD'; payload: undefined } | { type: 'EDIT'; payload: ExperienceData } >();
    const hideModal = (visble?: boolean) => !visble && setModalVisible(undefined);
    const requestActions = simpleRequestActions();
    const [experienceList, setExperienceList] = useState<ExperienceData[]>([]);
    const [experienceOldList, setExperienceOldList] = useState<ExperienceData[]>([]);
    const [experienceNewList, setExperienceNewList] = useState<ExperienceData[]>([]);
    
    const [experienceOldImageList, setExperienceOldImageList] = useState<FilesData[]>([]);
    const [experienceNewImageList, setExperienceNewImageList] = useState<FilesData[]>([]); 
    const [experienceAllImageList, setExperienceAllImageList] = useState<FilesData[]>([]);
    
    const [createFileOther, selectedFileOther] = useState<any>();  

    
    const [modalEducationViewVisible, setModalEducationViewVisible] = useState< { type: 'VIEW'; payload: ExperienceData } >(); 
    const hideEducationViewModal = (visble?: boolean) => !visble && setModalEducationViewVisible(undefined); 

    useEffect(() => {
        initData();
    }, []);
    const initData = async () => {
        try {
            const list = await ProfileServicesEss.listExperience(profile.id).query(requestActions);
            setExperienceList(list.data); 
            // old records edit 
            setExperienceOldList(list.oldData); 
            // new records add 
            setExperienceNewList(list.newData);             
            // image list 
            setExperienceOldImageList(list.fileOldData); 
            //
            setExperienceNewImageList(list.fileNewData); 
            // all image
            setExperienceAllImageList(list.fileAllData); 

        } catch (error: any) {
            message.error(error.message || 'Failed to load data.');
        }
    };

    const saveExperienceHandler = async (data: ExperienceData) => {
        Modal.confirm({
          title: 'Save Experience',
          content: 'Are you sure?',
          onOk: async () => {
            try {
                data.otherFile = createFileOther;
                await ProfileServicesEss.saveExperience(data)(requestActions);
            //   const list = await ProfileServicesEss.listExperience(data.empId).query(requestActions);
            //   setExperienceList(list);
                // call back fun
                cb.onLoadData();
                initData();
                hideModal();
            } catch (error: any) {
              message.error(error.message || 'Failed to Experience.');
            }
          },
        });
    };
      
    // open form emergency
    const onOpenForm = async (data:ExperienceData,_type:string)=>{
        setModalVisible({ type: _type, payload: data });
        hideEducationViewModal(false);
    }
    return <div>
        <Card>
            <Space direction={"vertical"} style={{width:'100%'}}>
                <div style={{width:'100%',textAlign:'right'}}>
                    <Space direction='horizontal'>
                        <Button style={{display:(is_admin==2&&empId>0)?'':'none'}} onClick={() => setModalVisible({ type: 'ADD', payload: undefined })}><PlusOutlined/> Add</Button>
                    
                        <Button danger onClick={() => setModalEducationViewVisible({ type: 'VIEW', payload: null})} 
                            style={{display:(step>=2&&is_admin!=2)?'':'none'}}><EyeOutlined/> View edit</Button>

                        {profile!!.ess==null?'':<Button style={{display: (step==2||step==7||step==5)&&is_admin==0?'':'none'}}
                                onClick={() => setModalVisible({ type: 'ADD', payload: null })}
                                icon={<PlusOutlined />}
                                key="1"
                                type="primary">
                                Add
                            </Button>
                        }
                    </Space>
                </div>
                <ProTable<ExperienceData>
                    dataSource={experienceList}
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
                            title: "Company Name", dataIndex: "companyName"
                        },{
                            title: "Location", dataIndex: "location"
                        }, {
                            title: "Started Position", dataIndex: 'startPosition'
                        },{
                            title: "Ended Position", dataIndex: 'endPosition'
                        },{
                            title: "Started Date", dataIndex: 'startDate',
                            render:(dom, r) => {
                                return formatDateTime(r.startDate)
                            }
                        },{
                            title: "Ended Date", dataIndex: 'endDate',
                            render:(dom, r) => {
                                return formatDateTime(r.endDate)
                            }
                        },
                        {   width: 100,
                            render: (dom, r) => {
                                return (<>
                                  {profile!!.ess==null?'':<a style={{display: (is_admin==0&&empId==0)?'':'none'}}
                                    onClick={() => setModalVisible({ type: 'EDIT', payload: r })} 
                                  >
                                    <EditOutlined/>
                                  </a> }
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
        
        <ExperienceModal
            open={!!modalVisible?.type} 
            onOpenChange={(visible) => hideModal(visible)}
            profile={profile}
            data={modalVisible?.payload} 
            files={modalVisible?.type=='EDIT'?experienceOldImageList:experienceNewImageList}
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
                return saveExperienceHandler({ ...data, id: modalVisible?.type=='EDIT'?modalVisible?.payload?.experienceId:(modalVisible?.payload?.id||0), empId: profile.id,status:true,type: modalVisible?.type});
            }}
        />
        
        {/*  */}
        <ExperienceView 
            open={!!modalEducationViewVisible?.type} 
            onOpenChange={(visible) => hideEducationViewModal(visible)}
            // data={modalEducationViewVisible?.payload}
            oldData={experienceOldList}
            newData={experienceNewList}
            essProfileId={profile.id}
            files={experienceAllImageList}
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