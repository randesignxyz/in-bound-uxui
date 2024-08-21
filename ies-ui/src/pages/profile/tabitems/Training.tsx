import { ProTable } from "@ant-design/pro-components"
import { Button, message, Modal, Space, Typography,Card } from 'antd'; 
import { EditOutlined, EyeOutlined, PlusCircleFilled, PlusOutlined } from "@ant-design/icons";
import TrainingModal from '../modal/TrainingModal';
import { useEffect,useState } from 'react';
import { ProfileData} from '../data';
import { TrainingData,  SaveTraining, FilesData } from "../data.ess";  
import { simpleRequestActions } from '@/services/model';
import { ProfileServicesEss } from '../service_ess'; 
import TrainingView from "../view/TrainingView";
import { formatYear } from "@/pages/utils";


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
    const [modalVisible, setModalVisible] = useState< { type: 'ADD'; payload: undefined } | { type: 'EDIT'; payload: TrainingData } >();
    const hideModal = (visble?: boolean) => !visble && setModalVisible(undefined);
    const requestActions = simpleRequestActions();
    const [trainingList, setTrainingList] = useState<TrainingData[]>([]);
    const [trainingOldList, setTrainingOldList] = useState<TrainingData[]>([]);
    const [trainingNewList, setTrainingNewList] = useState<TrainingData[]>([]);
    
    const [trainingOldImageList, setTrainingOldImageList] = useState<FilesData[]>([]);
    const [trainingNewImageList, setTrainingNewImageList] = useState<FilesData[]>([]); 
    const [trainingAllImageList, setTrainingAllImageList] = useState<FilesData[]>([]);
    
    const [createFileOther, selectedFileOther] = useState<any>();  
    
    
    const [modalEducationViewVisible, setModalEducationViewVisible] = useState< { type: 'VIEW'; payload: TrainingData } >(); 
    const hideEducationViewModal = (visble?: boolean) => !visble && setModalEducationViewVisible(undefined); 
    
    
    useEffect(() => {
        initData();
    }, []);
    const initData = async () => {
        try {
            const list = await ProfileServicesEss.listTraining(profile.id).query(requestActions);
            setTrainingList(list.data); 
            // old records edit 
            setTrainingOldList(list.oldData); 
            // new records add 
            setTrainingNewList(list.newData);             
            // image list 
            setTrainingOldImageList(list.fileOldData); 
            //
            setTrainingNewImageList(list.fileNewData); 
            // all image
            setTrainingAllImageList(list.fileAllData); 

        } catch (error: any) {
            message.error(error.message || 'Failed to load data.');
        }
    };
    const saveTrainingHandler = async (data: SaveTraining) => {
        Modal.confirm({
          title: 'Save Training',
          content: 'Are you sure?',
          onOk: async () => {
            try {
                data.otherFile = createFileOther;
                await ProfileServicesEss.saveTraining(data)(requestActions);
                // const list = await ProfileServicesEss.listTraining(data.empId).query(requestActions);
                // setTrainingList(list);
                // call back fun
                cb.onLoadData();
                initData();
                hideModal();
            } catch (error: any) {
              message.error(error.message || 'Failed to Training.');
            }
          },
        });
    };
      
    // open form emergency
    const onOpenForm = async (data:TrainingData,_type:string)=>{
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
                <ProTable<TrainingData>
                    dataSource={trainingList}
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
                            title: "Training Courses", dataIndex: "trainingCourse"
                        },{
                            title: "Year", dataIndex: "year",
                            render:(dom, r) => {
                                return formatYear(r.year)
                            }
                        },{
                            title: "description", dataIndex: "description"
                        },
                        {   width: 100,
                            render: (dom, r) => {
                                return (<>
                                  {profile!!.ess==null?'':<a style={{display: (is_admin==0&&empId==0)?'':'none'}}
                                    onClick={() => setModalVisible({ type: 'EDIT', payload: r })} 
                                  >
                                    <EditOutlined/>
                                  </a>} 
                                    <a style={{display: (is_admin==2&&empId>0)?'':'none'}} 
                                        onClick={() => setModalVisible({ type: 'EDIT', payload: r })}>
                                        <EditOutlined />
                                    </a>  </>
                                );
                              },
                        } 
                    ]}
                />
            </Space>
        </Card>
        
        <TrainingModal
            open={!!modalVisible?.type} 
            onOpenChange={(visible) => hideModal(visible)}
            profile={profile}
            data={modalVisible?.payload}
            files={modalVisible?.type=='EDIT'?trainingOldImageList:trainingNewImageList}
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
                return saveTrainingHandler({ ...data, id: modalVisible?.type=='EDIT'?modalVisible?.payload?.trainingId:(modalVisible?.payload?.id||0), empId: profile.id,status:true,type:modalVisible?.type });
            }}
        /> 
        {/*  */}
        <TrainingView 
            open={!!modalEducationViewVisible?.type} 
            onOpenChange={(visible) => hideEducationViewModal(visible)} 
            oldData={trainingOldList}
            newData={trainingNewList}
            essProfileId={profile.id} 
            files={trainingAllImageList}
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