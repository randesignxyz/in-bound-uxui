
import { ProTable } from "@ant-design/pro-components"  
import { PlusCircleFilled,EditOutlined, EyeOutlined, PlusOutlined, DeleteOutlined } from "@ant-design/icons"
import { Button, message, Modal, Space, Typography,Card, Flex } from 'antd';
import ExperienceModal from '../modal/ExperienceModal';
import { useEffect,useState } from 'react';
import { ProfileData} from '../data';
import { ExperienceData,  FilesData,  SaveExperience } from "../data.ess"; 
import { ProfileServicesEss } from '../service_ess'; 
import { simpleRequestActions } from '@/services/model';
import ExperienceView from "../view/ExperienceView";
import { formatDate, formatDateTime } from "@/pages/utils";


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
                data.otherFile = createFileOther||[];
                data.isDelete = 0; 
                
                var startDate = data.experienceDate[0];
                var endDate = data.experienceDate[1];

                data.startDate = startDate;
                data.endDate = endDate;  

                await ProfileServicesEss.saveExperience(data)(requestActions); 
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
    const onDelete = async (data: ExperienceData) => {
        Modal.confirm({
          title: 'Delete Experience',
          content: 'Are you sure you want to delete items?',
          onOk: async () => {
            try {
                data.otherFile = [];
                data.isDelete = 1;
                data.type = "ADD";
                data.empId= profile.id;
                await ProfileServicesEss.saveExperience(data)(requestActions); 
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
    
    const onDeleteAdmin = async (data: ExperienceData) => {
        Modal.confirm({
          title: 'Delete Experience',
          content: 'Are you sure you want to delete items?',
          onOk: async () => {
            try {
                data.otherFile = [];
                data.isDelete = 1;
                data.type = "ADD";
                data.empId= profile.id;
                await ProfileServicesEss.saveExperienceAdmin(data)(requestActions); 
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
                        <Button style={{display:(is_admin==2&&empId>0)?'':'none'}} onClick={() => setModalVisible({ type: 'ADD', payload: undefined })}
                                icon={<PlusCircleFilled />}
                                key="1"
                                type="primary">Add</Button>
                    
                        <Button danger onClick={() => setModalEducationViewVisible({ type: 'VIEW', payload: null})} 
                            style={{display:([7,5,4,3,2].find((element) => element == profile!!.ess.stepId))&&is_admin!=2?'':'none'}}
                                type="primary"><EyeOutlined/> View edit</Button>

                        {profile!!.ess.id!!<=0?'':<Button style={{display: ([7,5,2].find((element) => element == step))&&is_admin==0?'':'none'}}
                                onClick={() => setModalVisible({ type: 'ADD', payload: null })}
                                icon={<PlusCircleFilled />}
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
                            title: "Company Name", width: '250px',dataIndex: "companyName"
                        },{
                            title: "Location", render: (_, r) => {
                                if(r.countryId==76){var location = (r.provinceName==null?"":r.provinceName)+", "+(r.countryName==null?"":r.countryName)}
                                else{var location = (r.locationRemark==null?"":r.locationRemark)};
                                return location;
                        }
                        }, {
                            title: "Started Position", width: '250px',dataIndex: 'startPosition'
                        },{
                            title: "Ended Position", width: '250px',dataIndex: 'endPosition'
                        },{
                            title: "Started Date", width: '150px',dataIndex: 'startDate',
                            render:(_, r) => {
                                return formatDate(r.startDate)
                            }
                        },{
                            title: "Ended Date", width: '150px',dataIndex: 'endDate',
                            render:(_, r) => {
                                return formatDate(r.endDate)
                            }
                        },
                        {   width: 100,
                            render: (_, r) => {
                                return (<Flex vertical={false} justify='space-between'>
                                  {profile!!.ess.id!!<=0?'':<a style={{display: (is_admin==0&&empId==0&&[7,5,2].find((element) => element == profile!!.ess.stepId))?'':'none'}}
                                        onClick={() => setModalVisible({ type: 'EDIT', payload: r })} title='Edit'
                                    >
                                        <EditOutlined/>
                                    </a> }
                                    <a style={{display: (is_admin==2&&empId>0)?'':'none'}} 
                                        onClick={() => setModalVisible({ type: 'EDIT', payload: r })} title='Edit'>
                                        <EditOutlined />
                                    </a>
                                    <a style={{display: (is_admin==2&&empId>0)?'':'none',color:'red'}} title="Remove" 
                                        onClick={() => onDeleteAdmin(r)}>
                                        <DeleteOutlined />
                                    </a>
                                    </Flex>
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
                return saveExperienceHandler({ ...data, id: modalVisible?.type=='EDIT'?modalVisible?.payload?.experienceId==null?modalVisible?.payload?.id: modalVisible?.payload?.experienceId :(modalVisible?.payload?.id||0), empId: profile.id,status:true,type: modalVisible?.type});
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
            step={step}
            cb={{
                onOpenEditForm: (id,type) => { 
                    onOpenForm(id,type);
                },
                onDelete:(data)=>{
                    onDelete(data);
                }
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