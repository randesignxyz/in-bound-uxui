import { ProCard, ProTable } from "@ant-design/pro-components"
import { Button, message, Modal, Space, Typography,Card , Flex} from 'antd'; 
import { DeleteOutlined, EditOutlined, EyeOutlined, PlusCircleFilled, PlusOutlined } from "@ant-design/icons";
import { useEffect,useState } from 'react';
import { ProfileData} from '../data';
import { TrainingData,  SaveTraining, FilesData } from "../data.ess";  
import { simpleRequestActions } from '@/services/model';
import { ProfileServicesEss } from '../service_ess'; 
import TrainingView from "../view/TrainingView";
import CertificationView from "../view/CertificationView";
import { formatDate, formatMonth, formatYear } from "@/pages/utils";
import TrainingModal from '../modal/TrainingModal';
import CertificationModal from "../modal/CertificationModal";
import { useAccess } from '@umijs/max';


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

    
    const access = useAccess();  


    const [modalVisible, setModalVisible] = useState< { type: 'ADD'; payload: undefined } | { type: 'EDIT'; payload: TrainingData } >();
    const hideModal = (visble?: boolean) => !visble && setModalVisible(undefined);

    const [modalCertificateVisible, setModalCertificateVisible] = useState< { type: 'ADD'; payload: undefined } | { type: 'EDIT'; payload: TrainingData } >();
    const hideCertificateModal = (visble?: boolean) => !visble && setModalCertificateVisible(undefined);

    const requestActions = simpleRequestActions();
    const [trainingList, setTrainingList] = useState<TrainingData[]>([]);
    const [certificateList, setCertificateList] = useState<TrainingData[]>([]);

    const [trainingOldList, setTrainingOldList] = useState<TrainingData[]>([]);
    const [trainingNewList, setTrainingNewList] = useState<TrainingData[]>([]);
    //     
    const [certificateOldList, setCertificateOldList] = useState<TrainingData[]>([]);
    const [certificateNewList, setCertificateNewList] = useState<TrainingData[]>([]);
    
    const [trainingOldImageList, setTrainingOldImageList] = useState<FilesData[]>([]);
    const [trainingNewImageList, setTrainingNewImageList] = useState<FilesData[]>([]); 
    
    const [certificateOldImageList, setCertificateOldImageList] = useState<FilesData[]>([]);
    const [certificateNewImageList, setCertificateNewImageList] = useState<FilesData[]>([]); 


    const [trainingAllImageList, setTrainingAllImageList] = useState<FilesData[]>([]);
    
    const [createFileOther, selectedFileOther] = useState<any>();  
    
    // training
    const [modalTrainingViewVisible, setModalTrainingViewVisible] = useState< { type: 'VIEW'; payload: undefined } >(); 
    const hideTrainingViewModal = (visble?: boolean) => !visble && setModalTrainingViewVisible(undefined); 
    // certification
    const [modalCertificationViewVisible, setModalCertificationViewVisible] = useState< { type: 'VIEW'; payload: undefined } >(); 
    const hideCertificationViewModal = (visble?: boolean) => !visble && setModalCertificationViewVisible(undefined);  
    
    useEffect(() => {
        initData();
    }, []);
    const initData = async () => {
        try {
            const list = await ProfileServicesEss.listTraining(profile.id).query(requestActions);
            setTrainingList(list.data); 
            setCertificateList(list.dataCert);
            // old records edit 
            setTrainingOldList(list.oldData); 
            setCertificateOldList(list.oldDataCert); 
            // new records add 
            setTrainingNewList(list.newData);   
            setCertificateNewList(list.newDataCert);             
            // image list 
            setTrainingOldImageList(list.fileOldData); 
            setCertificateOldImageList(list.fileOldCertData); 
            //
            setTrainingNewImageList(list.fileNewData); 
            setCertificateNewImageList(list.fileNewCertData); 
            // all image
            setTrainingAllImageList(list.fileAllData); 

        } catch (error: any) {
            message.error(error.message || 'Failed to load data.');
        }
    };
    const saveTrainingHandler = async (data: SaveTraining) => {
        // attachment files
        if(createFileOther.length==0){  
            message.error('Please do select attachment files.');
            return false;
        } 
        // submit
        Modal.confirm({
          title: 'Save Training',
          content: 'Are you sure?',
          onOk: async () => {
            try {
                data.otherFile = createFileOther;
                data.isDelete = 0;
                var fromyear = data.year[0];
                var toyear = data.year[1];
                data.year = fromyear;
                data.toYear = toyear; 
                data.traincert=1;

                await ProfileServicesEss.saveTraining(data)(requestActions); 
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
    const saveCertificatedHandler = async (data: SaveTraining) => {
        // attachment files
        if(createFileOther.length==0){  
            message.error('Please do select attachment files.');
            return false;
        } 
        // submit
        Modal.confirm({
          title: 'Save Certificate',
          content: 'Are you sure?',
          onOk: async () => {
            try {
                data.otherFile = createFileOther||[];
                data.isDelete = 0; 
                data.toYear = '';
                data.traincert=2;

                await ProfileServicesEss.saveTraining(data)(requestActions); 
                // call back fun
                cb.onLoadData();
                initData();
                hideCertificateModal();
            } catch (error: any) {
              message.error(error.message || 'Failed to Certificate.');
            }
          },
        });
    };
    const onDelete = async (data: SaveTraining) => {
        Modal.confirm({
          title: 'Delete training',
          content: 'Are you sure you want to delete items?',
          onOk: async () => {
            try {
                data.otherFile = [];
                data.isDelete = 1;
                data.type = "ADD";
                data.empId= profile.id;
                await ProfileServicesEss.saveTraining(data)(requestActions); 
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
    const onDeleteAdmin = async (data: SaveTraining) => {
        Modal.confirm({
          title: 'Delete training',
          content: 'Are you sure you want to delete items?',
          onOk: async () => {
            try {
                data.otherFile = [];
                data.isDelete = 1;
                data.type = "ADD";
                data.empId= profile.id;
                await ProfileServicesEss.saveTrainingAdmin(data)(requestActions); 
                // call back fun
                cb.onLoadData();
                initData();
                hideCertificateModal();
            } catch (error: any) {
              message.error(error.message || 'Failed to created.');
            }
          },
        });
    };
      
    // open form emergency
    const onOpenForm = async (data:TrainingData,_type:string)=>{
        setModalVisible({ type: _type, payload: data });
        hideTrainingViewModal(false);
    }
    // open form emergency
    const onOpenCertificatedForm = async (data:TrainingData,_type:string)=>{
        setModalCertificateVisible({ type: _type, payload: data });
        hideCertificationViewModal(false);
    }
     
    var type = ["" ,"Training","Certification"];
    return <div>
        <Card> 
            <Space direction={"vertical"} style={{width:'100%'}} hidden={access.canAccessHrVissibleTraining}>
                <div style={{width:'100%',textAlign:'right'}}> 
                    <Space direction='horizontal'>
                        <Button style={{display:(is_admin==2&&empId>0)?'':'none'}} onClick={() => setModalVisible({ type: 'ADD', payload: undefined })}
                            icon={<PlusCircleFilled />}
                            key="lnd8"
                            type="primary"> Add Training</Button>
                        <Button style={{display:(is_admin==2&&empId>0)?'':'none'}} onClick={() => setModalCertificateVisible({ type: 'ADD', payload: undefined })}
                            icon={<PlusCircleFilled />}
                            key="lnd7"
                            type="primary"> Add Certification</Button>
                        {/*  */}
                        <Button danger onClick={() => setModalTrainingViewVisible({ type: 'VIEW', payload: undefined})} 
                            style={{display:([7,5,4,3,2].find((element) => element == profile!!.ess.stepId))&&is_admin!=2?'':'none'}} type="primary"><EyeOutlined/> View Training Edit</Button> 
                        {/*  */}
                        <Button danger onClick={() => setModalCertificationViewVisible({ type: 'VIEW', payload: undefined})} 
                            style={{display:([7,5,4,3,2].find((element) => element == profile!!.ess.stepId))&&is_admin!=2?'':'none'}} type="primary"><EyeOutlined/> View Certification Edit </Button> 
                         {/*  */}
                        {profile!!.ess.id!!<=0?'':<Button style={{display: ([7,5,2].find((element) => element == step))&&is_admin==0?'':'none'}}
                                onClick={() => setModalVisible({ type: 'ADD', payload: undefined })}
                                icon={<PlusCircleFilled />}
                                key="lnd6"
                                type="primary">
                                Add Training
                            </Button>
                        }
                        {profile!!.ess.id!!<=0?'':<Button style={{display: ([7,5,2].find((element) => element == step))&&is_admin==0?'':'none'}}
                                onClick={() => setModalCertificateVisible({ type: 'ADD', payload: undefined })}
                                icon={<PlusCircleFilled />}
                                key="lnd5"
                                type="primary">
                                Add Certification
                            </Button>
                        }
                    </Space>
                </div>
                {/* training */}
                <ProCard bordered>
                    <Typography.Title level={5}>Training </Typography.Title> 
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
                                title: "Courses", dataIndex: "trainingCourse",width:250
                            },{
                                title: "Institution", dataIndex: "institution",width:250
                            },{
                                title: "Date", 
                                dataIndex: "year",
                                render:(dom, r) => {
                                    return (formatDate(r.year) +" - "+ formatDate(r.toYear));
                                }
                            },{
                                title: "Duration(Hours)", dataIndex: "duration"
                            },{
                                title: "Description", dataIndex: "description"
                            }, 
                            {   width: 100,
                                render: (dom, r) => {
                                    return (<Flex vertical={false} justify='space-between'>
                                    {profile!!.ess.id!!<=0?'':<a style={{display: (is_admin==0&&empId==0&&[7,5,2].find((element) => element == profile!!.ess.stepId))?'':'none'}}
                                        onClick={() => setModalVisible({ type: 'EDIT', payload: r })} title='Edit'
                                        >
                                            <EditOutlined/>
                                        </a>} 
                                        <a style={{display: (is_admin==2&&empId>0)?'':'none'}} 
                                            onClick={() => setModalVisible({ type: 'EDIT', payload: r })} title='Edit'>
                                            <EditOutlined />
                                        </a>
                                        <a style={{display: (is_admin==2&&empId>0)?'':'none',color:'red'}} title="Remove"
                                            onClick={() => onDeleteAdmin(r)}>
                                            <DeleteOutlined />
                                        </a></Flex>
                                    );
                                },
                            } 
                        ]}
                    />
                </ProCard>
                {/* cource */}
                <ProCard bordered>                    
                    <Space direction="horizontal">
                        <Typography.Title level={5}>Professional Certification</Typography.Title><Typography.Title style={{fontSize:'11px',color:"gray"}}>(Professional's competency with international standards, industry specifications or technical rules - e.g., ACCA, Project Management Professional, SHRM-CP/SCP, ITIL, etc.)</Typography.Title>  
                    </Space>
                    <ProTable<TrainingData>
                        dataSource={certificateList}
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
                                title: "Courses", dataIndex: "trainingCourse",width:250
                            },{
                                title: "Institution", dataIndex: "institution",width:250
                            },{
                                title: "In Year", 
                                dataIndex: "year",
                                render:(dom, r) => {
                                    return formatMonth(r.year)
                                }
                            },{
                                title: "Description", dataIndex: "description"
                            },
                            {   width: 100,
                                render: (dom, r) => {
                                    return (<Flex vertical={false} justify='space-between'>
                                    {profile!!.ess.id!!<=0?'':<a style={{display: (is_admin==0&&empId==0&&[7,5,2].find((element) => element == profile!!.ess.stepId))?'':'none'}}
                                        onClick={() => setModalCertificateVisible({ type: 'EDIT', payload: r })} 
                                        >
                                            <EditOutlined/>
                                        </a>} 
                                        <a style={{display: (is_admin==2&&empId>0)?'':'none'}} 
                                            onClick={() => setModalCertificateVisible({ type: 'EDIT', payload: r })}>
                                            <EditOutlined />
                                        </a>
                                        <a style={{display: (is_admin==2&&empId>0)?'':'none',color:'red'}} title="Remove"
                                            onClick={() => onDeleteAdmin(r)}>
                                            <DeleteOutlined />
                                        </a></Flex>
                                    );
                                },
                            } 
                        ]}
                    />
                </ProCard>
            </Space>
            
            <Space direction={"vertical"} style={{width:'100%'}} hidden={!access.canAccessHrVissibleTraining}>
                <div style={{textAlign:'center',fontSize:'24px', padding:'30px',color:'gray'}}>Your training record will be uploaded soon!!!</div> 
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
                return saveTrainingHandler({ ...data, id: modalVisible?.type=='EDIT'?modalVisible?.payload?.trainingId==null?modalVisible?.payload?.id: modalVisible?.payload?.trainingId:(modalVisible?.payload?.id||0), empId: profile.id,status:true,type:modalVisible?.type!!,typeId:1 });
            }}
        /> 
        
        
        <CertificationModal
            open={!!modalCertificateVisible?.type} 
            onOpenChange={(visible) => hideCertificateModal(visible)}
            profile={profile}
            data={modalCertificateVisible?.payload}
            files={modalCertificateVisible?.type=='EDIT'?certificateOldImageList:certificateNewImageList}
            type={modalCertificateVisible?.type!!}
            isAdmin={is_admin}
            empId={empId}
            cb={{
                onLoadMenu: (tid) => { 
                    selectedFileOther(tid);
                },
                onReload:()=>{
                    hideCertificateModal();
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
                return saveCertificatedHandler({ ...data, 
                    id: modalCertificateVisible?.type=='EDIT'?(modalCertificateVisible?.payload?.trainingId==null?modalCertificateVisible?.payload?.id: modalCertificateVisible?.payload?.trainingId):modalCertificateVisible?.payload?.id||0, 
                    empId: profile.id,status:true,type:modalCertificateVisible?.type!!,typeId:2 });
            }}
        /> 
        {/* training */}
        <TrainingView 
            open={!!modalTrainingViewVisible?.type} 
            onOpenChange={(visible) => hideTrainingViewModal(visible)} 
            oldData={trainingOldList}
            newData={trainingNewList}
            essProfileId={profile.id} 
            files={trainingAllImageList}
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
        {/* certification */}
        <CertificationView 
            open={!!modalCertificationViewVisible?.type} 
            onOpenChange={(visible) => hideCertificationViewModal(visible)} 
            oldData={certificateOldList}
            newData={certificateNewList}
            essProfileId={profile.id} 
            files={trainingAllImageList}
            step={step}
            cb={{
                onOpenEditForm: (id,type) => { 
                    onOpenCertificatedForm(id,type);
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