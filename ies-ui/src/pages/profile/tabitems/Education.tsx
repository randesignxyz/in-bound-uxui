import { ProTable } from "@ant-design/pro-components"
import { Button, message, Modal, Space, Typography,Card,Flex } from 'antd'; 
import { PlusCircleFilled,EditOutlined, EyeOutlined, PlusOutlined, DeleteOutlined } from "@ant-design/icons";
import EducationModal from '../modal/EducationModal';
import { useEffect,useState } from 'react';

import { ProfileData} from '../data';
import { EducationData, EssLookupData, FilesData, MarjorData} from "../data.ess"; 
import { ProfileServicesEss } from '../service_ess'; 
import { simpleRequestActions } from '@/services/model';
import EducationView from "../view/EducationView";
import { useAccess } from '@umijs/max'; 
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
    const [modalVisible, setModalVisible] = useState< { type: 'ADD'; payload: undefined } | { type: 'EDIT'; payload: EducationData } >();
    const [modalEducationViewVisible, setModalEducationViewVisible] = useState< { type: 'VIEW'; payload: EducationData } >(); 
    const hideEducationViewModal = (visble?: boolean) => !visble && setModalEducationViewVisible(undefined); 
    const access = useAccess();  
    
    //
    const hideModal = (visble?: boolean) => !visble && setModalVisible(undefined); 

    const requestActions = simpleRequestActions();
    const [educationList, setEducationList] = useState<EducationData[]>([]);
    const [educationOldList, setEducationOldList] = useState<EducationData[]>([]);
    const [educationNewList, setEducationNewList] = useState<EducationData[]>([]);
    const [marjorList, setMarjorList] = useState<MarjorData[]>([]);
    // const [degreeList, setDegreeList] = useState<EssLookupData[]>([]);
    // const [statusList, setStatusList] = useState<EssLookupData[]>([]);
    // const [coeiList, setCoeiList] = useState<EssLookupData[]>([]); 

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
            const list = await ProfileServicesEss.listEducation(profile.id,profile.ess.id||0).query(requestActions);
            setMarjorList(list.marjor);  
            // setDegreeList(list.degree);  
            // setStatusList(list.status);  
            // setCoeiList(list.coei);  
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
        console.log(data)
        // attachment files
        if(createFileOther.length==0){  
            message.error('Please do select attachment files.');
            return false;
        } 
        // submit
        Modal.confirm({
          title: 'Save eduction',
          content: 'Are you sure?',
          onOk: async () => {
            try {
                data.otherFile = createFileOther;
                data.isDelete = 0; 

                var educationYear = data.educationYear;
                
                data.fromYear = educationYear[0];
                data.toYear = educationYear[1]; 
                data.openId = profile.ess.id||0;

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
    const onDelete = async (data: EducationData) => {
        Modal.confirm({
          title: 'Delete eduction',
          content: 'Are you sure you want to delete items?',
          onOk: async () => {
            try {
                data.otherFile = [];
                data.isDelete = 1;
                data.type = "ADD";
                data.empId= profile.id; 
                data.openId = profile.ess.id||0;
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
    const onDeleteAdmin = async (data: EducationData) => {
        Modal.confirm({
          title: 'Delete eduction',
          content: 'Are you sure you want to delete items?',
          onOk: async () => {
            try {
                data.otherFile = [];
                data.isDelete = 1;
                data.type = "ADD";
                data.empId= profile.id; 
                await ProfileServicesEss.saveEducationAdmin(data)(requestActions); 
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
    const onOpenForm = async (data:EducationData,_type:string,)=>{
        setModalVisible({ type: _type, payload: data });
        hideEducationViewModal(false);
    }
    return <div>
        <Card>
            <Space direction={"vertical"} style={{width:'100%'}}>    
                <div style={{width:'100%',textAlign:'right'}}> 
                    <Space direction='horizontal'>
                        <Button style={{display:access.canAccessHrESSAddEditProfile==true&&is_admin==2?'':'none'}} onClick={() => setModalVisible({ type: 'ADD', payload: undefined })}
                                icon={<PlusCircleFilled />}
                                key="1"
                                type="primary"> Add</Button>

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
                            title: "Degree", dataIndex: "degreeName" 
                        },{
                            title: "Major/Subject", dataIndex: "majorName"
                        },{
                            title: "Education Institution", dataIndex: "educationCenter"
                        },{
                            title: "Country of Education Institution", dataIndex: "countryEducationCenterName" 
                        },{
                            title: "GPA", dataIndex: "gpa" 
                        },{
                            title: "Year", render: (_, r) => {return formatYear(r.fromYear)+" - "+ formatYear(r.toYear)}
                        },{
                            title: "Status", dataIndex: "statusName" 
                        },
                        {   width: 100,hidden:!access.canAccessHrESSAddEditProfile,
                            render: (dom, r) => {
                                return (<Flex vertical={false} justify='space-between'>
                                  {profile!!.ess.id!!<=0?'':<a style={{display: (is_admin==0&&empId==0&&[7,5,2].find((element) => element == profile!!.ess.stepId))?'':'none'}} 
                                    onClick={() => setModalVisible({ type: 'EDIT', payload: r })} title='Edit'>
                                        <EditOutlined />
                                    </a>}
                                    <a style={{display: (is_admin==2&&empId>0)?'':'none'}} title='Edit'
                                    onClick={() => setModalVisible({ type: 'EDIT', payload: r })}>
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
        {/*  */}
        <EducationModal modalProps={{maskClosable:false}} 
            open={!!modalVisible?.type} 
            onOpenChange={(visible) => hideModal(visible)}
            profile={profile}
            data={modalVisible?.payload}
            files={modalVisible?.type=='EDIT'?educationOldImageList:educationNewImageList}
            type={modalVisible?.type!!}
            isAdmin={is_admin}
            empId={empId}
            marjor={marjorList} 
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
                return saveEducationHandler({ ...data, id: modalVisible?.type=='EDIT'?modalVisible?.payload?.educationId==null?modalVisible?.payload?.id:modalVisible?.payload?.educationId:(modalVisible?.payload?.id||0), empId: profile.id,type:modalVisible?.type });
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