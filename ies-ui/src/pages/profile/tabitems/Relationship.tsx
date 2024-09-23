
import { ProTable } from "@ant-design/pro-components"
import { Button, message, Modal, Space, Typography,Card, Flex } from 'antd'; 
import { PlusCircleFilled,EditOutlined, EyeOutlined, PlusOutlined, DeleteOutlined } from "@ant-design/icons";
import RelationshipModal from '../modal/RelationshipModal';
import { useEffect,useState } from 'react';

import { ProfileData} from '../data';
import { FilesData, RelationshipData} from "../data.ess"; 
import { ProfileServicesEss } from '../service_ess'; 
import { simpleRequestActions } from '@/services/model';
import RelationshipView from "../view/RelationshipView";
import { formatDate } from "@/pages/utils";

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
    const [modalVisible, setModalVisible] = useState< { type: 'ADD'; payload: undefined } | { type: 'EDIT'; payload: RelationshipData } >();
    const hideModal = (visble?: boolean) => !visble && setModalVisible(undefined);
    const requestActions = simpleRequestActions();
    const [relationshipList, setRelationshipList] = useState<RelationshipData[]>([]);
    const [relationshipOldList, setRelationshipOldList] = useState<RelationshipData[]>([]);
    const [relationshipNewList, setRelationshipNewList] = useState<RelationshipData[]>([]); 
    
    const [modalRelationshipViewVisible, setModalRelationshipViewVisible] = useState< { type: 'VIEW'; payload: RelationshipData } >(); 
    const hideRelationshipViewModal = (visble?: boolean) => !visble && setModalRelationshipViewVisible(undefined); 

    useEffect(() => {
        initData();
    }, []);
    const initData = async () => {
        try {
            const list = await ProfileServicesEss.listRelationship(profile.id).query(requestActions);
            setRelationshipList(list.data); 
            // old records edit 
            setRelationshipOldList(list.oldData); 
            // new records add 
            setRelationshipNewList(list.newData);      


        } catch (error: any) {
            message.error(error.message || 'Failed to load data.');
        }
    };
    const saveRelationshipHandler = async (data: RelationshipData) => {
        Modal.confirm({
          title: 'Created Family Memember',
          content: 'Are you sure?',
          onOk: async () => {
            try { 
                data.isDelete = 0;
                await ProfileServicesEss.saveRelationship(data)(requestActions); 
                cb.onLoadData();
                initData();
                hideModal();
            } catch (error: any) {
              message.error(error.message || 'Failed to created.');
            }
          },
        });
    };
    const onDelete = async (data: RelationshipData) => {
        Modal.confirm({
          title: 'Delete Family Memember',
          content: 'Are you sure you want to delete items?',
          onOk: async () => {
            try { 
                data.isDelete = 1;
                data.type = "ADD";
                data.empId= profile.id;
                await ProfileServicesEss.saveRelationship(data)(requestActions); 
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
    
    const onDeleteAdmin = async (data: RelationshipData) => {
        Modal.confirm({
          title: 'Delete Family Memember',
          content: 'Are you sure you want to delete items?',
          onOk: async () => {
            try { 
                data.isDelete = 1;
                data.type = "ADD";
                data.empId= profile.id;
                await ProfileServicesEss.saveRelationshipAdmin(data)(requestActions); 
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
    const onOpenForm = async (data:RelationshipData,_type:string)=>{
        setModalVisible({ type: _type, payload: data });
        hideRelationshipViewModal(false);
    } 
    return <div>
        <Card>
            <Space direction={"vertical"} style={{width:'100%'}}>
                <div style={{width:'100%',textAlign:'right'}}>
                    <Space direction='horizontal'> 
                        <Button style={{display:(is_admin==2&&empId>0)?'':'none'}} onClick={() => setModalVisible({ type: 'ADD', payload: undefined })}icon={<PlusCircleFilled />}
                        key="lnd3"
                        type="primary">Add</Button>

                        <Button danger onClick={() => setModalRelationshipViewVisible({ type: 'VIEW', payload: undefined})} 
                            style={{display:([7,5,4,3,2].find((element) => element == step))&&is_admin!=2?'':'none'}}
                            type="primary"><EyeOutlined/> View edit</Button>

                        {profile!!.ess.id!!<=0?'':<Button style={{display: ([7,5,2].find((element) => element == step))&&is_admin==0?'':'none'}}
                                onClick={() => setModalVisible({ type: 'ADD', payload: undefined })}
                                icon={<PlusCircleFilled />}
                                key="lnd4"
                                type="primary">
                                Add
                            </Button>
                        }
                    </Space>
                </div>
                <ProTable<RelationshipData>
                    dataSource={relationshipList}
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
                            title: "Full Name", dataIndex: "relationshipName"
                        },{
                            title: "Relationship", dataIndex: "typeName"
                        },{
                            title: "Occupation", dataIndex: "occupationName"
                        },{
                            title: "Date of Birth", dataIndex: "dateOfBirth",render: (dom, r) => {return formatDate(r.dateOfBirth)}
                        },
                        // {
                        //     title: "Description", dataIndex: "description"
                        // },
                        {   width: 100, 
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
        <RelationshipModal
            open={!!modalVisible?.type} 
            onOpenChange={(visible) => hideModal(visible)}
            profile={profile}
            data={modalVisible?.payload} 
            type={modalVisible?.type!!}
            isAdmin={is_admin}
            empId={empId}
            cb={{ 
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
                return saveRelationshipHandler({ ...data, id: modalVisible?.type=='EDIT'?modalVisible?.payload?.refId==null?modalVisible?.payload?.id: modalVisible?.payload?.refId :(modalVisible?.payload?.id||0), empId: profile.id,status:true,type:modalVisible?.type });
            }}
        />
        
        {/*  */}
        <RelationshipView 
            open={!!modalRelationshipViewVisible?.type} 
            onOpenChange={(visible) => hideRelationshipViewModal(visible)} 
            oldData={relationshipOldList}
            newData={relationshipNewList}
            essProfileId={profile.id}  
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