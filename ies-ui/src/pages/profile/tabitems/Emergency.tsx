
import { Button, message, Modal, Space, Typography,Card, Flex } from 'antd';  
import { ProDescriptions, ProTable } from '@ant-design/pro-components';
import { DeleteOutlined, EditOutlined, EyeOutlined, PlusCircleFilled, PlusOutlined } from "@ant-design/icons"; 
import { ProfileData} from '../data';
import { EmergencyData,  FilesData,  SaveEmergency } from "../data.ess"; 
import { ProfileServicesEss } from '../service_ess'; 
import { simpleRequestActions } from '@/services/model';
import EmergencyModal from '../modal/EmergencyModal';
import { useAccess } from '@umijs/max'; 
import { useEffect,useState } from 'react';
import EmergencyView from '../view/EmergencyView';

interface Props {
    profile: ProfileData;
    step: any;
    is_admin:number;
    empId:number;
    cb:{ 
        onLoadData: () => void;  
    };
  }

export default ({ profile,step,is_admin,empId,cb}: Props) => {
    const [modalVisible, setModalVisible] = useState< { type: 'ADD'; payload: undefined } | { type: 'EDIT'; payload: EmergencyData } | { type: 'NEWEDIT'; payload: EmergencyData }>(); 
    const hideModal = (visble?: boolean) => !visble && setModalVisible(undefined); 
    const requestActions = simpleRequestActions(); 
    const access = useAccess();  

    
    const [modalEducationViewVisible, setModalEducationViewVisible] = useState<{ type: 'VIEW'; payload: EmergencyData } >(); 
    const hideEducationViewModal = (visble?: boolean) => !visble && setModalEducationViewVisible(undefined); 
    
    const [createFileOther, selectedFileOther] = useState<any>();  
    //     
    const [emergencyList, setEmergencyList] = useState<EmergencyData[]>([]);
    const [emergencyOldList, setEmergencyOldList] = useState<EmergencyData[]>([]);
    const [emergencyNewList, setEmergencyNewList] = useState<EmergencyData[]>([]);
    const [emergencyOldImageList, setEmergencyOldImageList] = useState<FilesData[]>([]);
    const [emergencyNewImageList, setEmergencyNewImageList] = useState<FilesData[]>([]);
    const [emergencyAllImageList, setEmergencyAllImageList] = useState<FilesData[]>([]);
    // 
    useEffect(() => {
      initData();
    }, []);
    const initData = async () => {
        try {
            const list = await ProfileServicesEss.listEmergency(profile.id,profile.ess.id||0).query(requestActions);
            setEmergencyList(list.data);  
            // old records edit
            // const dataOld = await ProfileServicesEss.listEmergencyModify(profile.id,1).query(requestActions);
            setEmergencyOldList(list.oldData); 
            // new records add
            // const dataNew = await ProfileServicesEss.listEmergencyModify(profile.id,2).query(requestActions);
            setEmergencyNewList(list.newData); 
            // image list
            // const data = await ProfileServicesEss.listEmergencyImage(profile.id,2).query(requestActions);
            setEmergencyOldImageList(list.fileOldData); 
            // const data = await ProfileServicesEss.listEmergencyImage(profile.id,2).query(requestActions);
            setEmergencyNewImageList(list.fileNewData); 
            // all image
            setEmergencyAllImageList(list.fileAllData); 
            
        } catch (error: any) {
            message.error(error.message || 'Failed to load data.');
        }
    };
    //
    const saveEmergencyHandler = async (data: SaveEmergency) => {
        Modal.confirm({
          title: 'Save Emergency',
          content: 'Are you sure?',
          onOk: async () => {
            try { 
                data.otherFile = createFileOther||[];
                data.isDelete = 0;
                data.openId = profile.ess.id||0;
                await ProfileServicesEss.saveEmergency(data)(requestActions); 
                // call back fun
                cb.onLoadData();
                initData();
                hideModal();
            } catch (error: any) {
              message.error(error.message || 'Failed to save.');
            }
          },
        });
    };
    
    const onDelete = async (data: SaveEmergency) => {
        Modal.confirm({
          title: 'Delete emergency',
          content: 'Are you sure you want to delete items?',
          onOk: async () => {
            try {
                data.otherFile = [];
                data.isDelete = 1;
                data.type = "ADD";
                data.empId= profile.id;
                data.openId = profile.ess.id||0;
                await ProfileServicesEss.saveEmergency(data)(requestActions); 
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
    const onDeleteAdmin = async (data: SaveEmergency) => {
        Modal.confirm({
          title: 'Delete emergency',
          content: 'Are you sure you want to delete items?',
          onOk: async () => {
            try {
                data.otherFile = [];
                data.isDelete = 1;
                data.type = "ADD";
                data.empId= profile.id;
                await ProfileServicesEss.saveEmergencyAdmin(data)(requestActions); 
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
    const onOpenForm = async (data:EmergencyData,_type:string,)=>{ 
        setModalVisible({ type: _type, payload: data });
        hideEducationViewModal(false);
    }
    //   
    return <div>
        <Card> 
          <Space direction={"vertical"} style={{width:'100%'}}> 
            <div style={{width:'100%',textAlign:'right'}}>
                <Space direction='horizontal'>
                    <Button style={{display:(is_admin==2&&empId>0&&access.canAccessHrESSViewOnly==false)?'':'none'}} onClick={() => setModalVisible({ type: 'ADD', payload: undefined })}
                        icon={<PlusCircleFilled />}
                        key="1"
                        type="primary">Add</Button>
                    
                    <Button danger onClick={() => setModalEducationViewVisible({ type: 'VIEW', payload: profile.emergency})} 
                        style={{display:([7,5,4,3,2].find((element) => element == profile!!.ess.stepId))&&is_admin!=2?'':'none'}}
                        type="primary"><EyeOutlined/> View edit</Button>

                    {profile!!.ess.id!!<=0?'':<Button style={{display: ([7,5,2].find((element) => element == step))&&is_admin==0?'':'none'}}
                            onClick={() => setModalVisible({ type: 'ADD', payload: undefined })}
                            icon={<PlusCircleFilled />}
                            key="1"
                            type="primary">
                            Add
                        </Button>
                    }
                </Space>
           
            </div>  
            <ProTable<EmergencyData>
                dataSource={emergencyList}
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
                        title: "Emergency Name", dataIndex: "emergencyName"
                    },{
                        title: "Emergency Contact Relation", dataIndex: "emergencyContactRelationName" 
                    },{
                        title: "Emergency Phone", dataIndex: "emergencyPhone"
                    },{
                        title: "Emergency Address", render: (dom, r) => {
                            var homeNo = (r.homeNo==''?'':"#"+r.homeNo);
                            var street = (r.street==''?'':", Str. "+r.street);
                            var villageId = (r.villageId==''?', ': ", "+r.villageId+", ");  
                            return homeNo + street + villageId+r.communeName+", "+r.districtName+", "+r.provinceName;
                        }
                    }, 
                    {   width: '70px', hidden:access.canAccessHrESSViewOnly,
                        render: (dom, r) => {
                            return ( <Flex vertical={false} justify='space-between'>
                                    {profile!!.ess.id!!<=0?'':<a style={{display: (is_admin==0&&empId==0&&[7,5,2].find((element) => element == profile!!.ess.stepId))?'':'none'}} 
                                        onClick={() => setModalVisible({ type: 'EDIT', payload: r })} title='Edit'>
                                        <EditOutlined />
                                    </a> }
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

        <EmergencyModal modalProps={{maskClosable:false}} 
            open={!!modalVisible?.type}
            locations={profile?.essLocation}
            onOpenChange={(visible) => hideModal(visible)}
            profile={profile}
            data={modalVisible?.payload}
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
                return saveEmergencyHandler({ ...data, id: modalVisible?.type=='EDIT'?modalVisible?.payload?.emergecyId==null?modalVisible?.payload?.id:modalVisible?.payload?.emergecyId:(modalVisible?.payload?.id||0), empId: profile.id,status:true, type: modalVisible?.type });
            }}
        />
        
        {/*  */}
        <EmergencyView 
            open={!!modalEducationViewVisible?.type} 
            onOpenChange={(visible) => hideEducationViewModal(visible)} 
            oldData={emergencyOldList}
            newData={emergencyNewList}
            essProfileId={profile.id}
            files={emergencyAllImageList}
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