
import { ProTable } from "@ant-design/pro-components"
import { Button, message, Modal, Space, Typography,Card, Flex } from 'antd'; 
import { PlusCircleFilled,EditOutlined, EyeOutlined, PlusOutlined, DeleteOutlined } from "@ant-design/icons";
import LanguageModal from '../modal/LanguageModal';
import { useEffect,useState } from 'react';

import { ProfileData} from '../data';
import { FilesData, LanguageData,  SaveLanguage} from "../data.ess"; 
import { ProfileServicesEss } from '../service_ess'; 
import { simpleRequestActions } from '@/services/model';
import LanguageView from "../view/LanguageView";
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
    const [modalVisible, setModalVisible] = useState< { type: 'ADD'; payload: undefined } | { type: 'EDIT'; payload: LanguageData } >();
    const hideModal = (visble?: boolean) => !visble && setModalVisible(undefined);
    const requestActions = simpleRequestActions();
    const [languageList, setLanguageList] = useState<LanguageData[]>([]);
    const [languageOldList, setLanguageOldList] = useState<LanguageData[]>([]);
    const [languageNewList, setLanguageNewList] = useState<LanguageData[]>([]);
    
    const [languageOldImageList, setLanguageOldImageList] = useState<FilesData[]>([]);
    const [languageNewImageList, setLanguageNewImageList] = useState<FilesData[]>([]); 
    const [languageAllImageList, setLanguageAllImageList] = useState<FilesData[]>([]);
    
    const [createFileOther, selectedFileOther] = useState<any>();  
    const access = useAccess();  

    
    const [modalEducationViewVisible, setModalEducationViewVisible] = useState< { type: 'VIEW'; payload: LanguageData } >(); 
    const hideEducationViewModal = (visble?: boolean) => !visble && setModalEducationViewVisible(undefined); 

    useEffect(() => {
        initData();
    }, []);
    const initData = async () => {
        try {
            const list = await ProfileServicesEss.listLanguage(profile.id,profile.ess.id||0).query(requestActions);
            setLanguageList(list.data); 
            // old records edit 
            setLanguageOldList(list.oldData); 
            // new records add 
            setLanguageNewList(list.newData);             
            // image list 
            setLanguageOldImageList(list.fileOldData); 
            //
            setLanguageNewImageList(list.fileNewData); 
            // all image
            setLanguageAllImageList(list.fileAllData); 


        } catch (error: any) {
            message.error(error.message || 'Failed to load data.');
        }
    };
    const saveLanguageHandler = async (data: SaveLanguage) => {
        Modal.confirm({
          title: 'Created Language',
          content: 'Are you sure?',
          onOk: async () => {
            try {
                data.otherFile = createFileOther;
                data.isDelete = 0;
                data.openId = profile.ess.id||0;
                await ProfileServicesEss.saveLanguage(data)(requestActions);
            //   const list = await ProfileServicesEss.listLanguage(data.empId).query(requestActions);
            //   setLanguageList(list);
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
    const onDelete = async (data: SaveLanguage) => {
        Modal.confirm({
          title: 'Delete Language',
          content: 'Are you sure you want to delete items?',
          onOk: async () => {
            try {
                data.otherFile = [];
                data.isDelete = 1;
                data.type = "ADD";
                data.empId= profile.id;
                data.openId = profile.ess.id||0;
                await ProfileServicesEss.saveLanguage(data)(requestActions); 
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
    const onDeleteAdmin = async (data: SaveLanguage) => {
        Modal.confirm({
          title: 'Delete Language',
          content: 'Are you sure you want to delete items?',
          onOk: async () => {
            try {
                data.otherFile = [];
                data.isDelete = 1;
                data.type = "ADD";
                data.empId= profile.id; 
                await ProfileServicesEss.saveLanguageAdmin(data)(requestActions); 
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
    const onOpenForm = async (data:LanguageData,_type:string)=>{
        setModalVisible({ type: _type, payload: data });
        hideEducationViewModal(false);
    } 
    return <div>
        <Card>
            <Space direction={"vertical"} style={{width:'100%'}}>     
                <div style={{width:'100%',textAlign:'right'}}>
                    <Space direction='horizontal'> 
                        <Button style={{display:(is_admin==2&&empId>0&&access.canAccessHrESSViewOnly==false)?'':'none'}} onClick={() => setModalVisible({ type: 'ADD', payload: undefined })}
                            icon={<PlusCircleFilled />}
                            key="lnd2"
                            type="primary">Add</Button>

                        <Button danger onClick={() => setModalEducationViewVisible({ type: 'VIEW', payload: undefined})} 
                                                    style={{display:([7,5,4,3,2].find((element) => element == step))&&is_admin!=2?'':'none'}} type="primary"><EyeOutlined/> View edit</Button>

                        {profile!!.ess.id!!<=0?'':<Button style={{display: ([7,5,2].find((element) => element == step))&&is_admin==0?'':'none'}}
                            onClick={() => setModalVisible({ type: 'ADD', payload: undefined })}
                            icon={<PlusCircleFilled />}
                            key="lnd1"
                            type="primary">
                            Add
                        </Button>
                        }
                    </Space>
                </div> 
                <ProTable<LanguageData>
                    dataSource={languageList}
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
                            title: "Languages", dataIndex: "languageName"
                        },{
                            title: "Level", dataIndex: "levelName"
                        },{
                            title: "Type", dataIndex: "typeName"
                        },{
                            title: "Description", dataIndex: "description"
                        },
                        {   width: 100, hidden:access.canAccessHrESSViewOnly,
                            render: (dom, r) => {
                                return (<Flex vertical={false} justify='space-between'>
                                  {profile!!.ess.id!!<=0?'':<a style={{display: (is_admin==0&&empId==0&&[7,5,2].find((element) => element == profile!!.ess.stepId))?'':'none'}}
                                        onClick={() => setModalVisible({ type: 'EDIT', payload: r })} title='Edit'
                                    >
                                        <EditOutlined />
                                    </a>}
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
        <LanguageModal modalProps={{maskClosable:false}} 
            open={!!modalVisible?.type} 
            onOpenChange={(visible) => hideModal(visible)}
            profile={profile}
            data={modalVisible?.payload}
            files={modalVisible?.type=='EDIT'?languageOldImageList:languageNewImageList}
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
                return saveLanguageHandler({ ...data, id: modalVisible?.type=='EDIT'?modalVisible?.payload?.refId==null?modalVisible?.payload?.id: modalVisible?.payload?.refId :(modalVisible?.payload?.id||0), empId: profile.id,status:true,type:modalVisible?.type });
            }}
        />
        
        {/*  */}
        <LanguageView 
            open={!!modalEducationViewVisible?.type} 
            onOpenChange={(visible) => hideEducationViewModal(visible)} 
            oldData={languageOldList}
            newData={languageNewList}
            essProfileId={profile.id} 
            files={languageAllImageList}
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