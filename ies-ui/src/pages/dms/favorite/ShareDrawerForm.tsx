import { DrawerForm, DrawerFormProps, ProFormDatePicker, ProFormSelect, ProFormText, ProFormTextArea, ProList } from "@ant-design/pro-components";
import { Avatar, Col, Divider, Row, Tag } from "antd";
import { useForm } from "antd/es/form/Form";
import { simpleRequestActions } from "@/services/model";
import { TeamOutlined, UserOutlined } from "@ant-design/icons";
import { formatDate } from "@/pages/utils";
import dayjs from 'dayjs';
import { TeamsServiceAPI } from "../setting/teams/service";
import { useEffect, useState } from "react";
import { Flex, Space } from "antd/lib";
import { ShareCreate, ShareDTO } from "../share/data";
import { ShareServiceAPI } from "../share/service";

interface Props extends DrawerFormProps {
    onSave: (data: ShareCreate) => void,
    onCancel: () => void,
    docId?: number;
    type?: string
}

const ShareDrawerForm: React.FC<Props> = ({ onSave, onCancel, docId, type, ...props }: Props) => {

    const requestAction = simpleRequestActions();
    const [form] = useForm<ShareCreate>();
    const [recipeintState, setRecipeintState] = useState<{
        recipeint?:boolean;
        group?:boolean;
    }>();

    useEffect(()=>{
        form.resetFields();
        setRecipeintState({group:false, recipeint:false})
    }, [props.open]);      
    return (
        <DrawerForm
            width={500}
            title="QUICK SHARE"
            form={form}
            {...props}
            drawerProps={{
                onClose: onCancel,
                
            }}
            submitter={{
                onSubmit:()=>{
                }
            }}
            onFinish={async () => {
                const dataForm = await form.validateFields();
                const entry = {
                    ...dataForm,
                    documentId: docId
                }
                onSave(entry)
            }}
        >
            {
                type === "DETAIL" && (
                    <ProList<ShareDTO>

                        style={{
                            margin: 0,
                            padding: 0
                        }}
                        cardProps={{
                            style: {
                                margin: 0,
                                padding: 0
                            }
                        }}
                        request={async () => {
                            const data = await ShareServiceAPI(requestAction).list(docId);
                            return Promise.resolve({
                                data: data,
                                success: true
                            })
                        }}
                        metas={{
                            avatar: {
                                valueType: "avatar",
                                render: (_, r) => <Avatar icon={r.type==="GROUP"?<TeamOutlined/>:<UserOutlined />} />
                            },
                            title: {
                                dataIndex: "recipient",
                            },
                            subTitle: {
                                render:(_,r)=><Tag color="gold">{r.type}</Tag>
                            },
                            description: {
                                render: (_, r) => (<Flex vertical>
                                        <Space >
                                            <p>Shared Date: </p>
                                            <p>{formatDate(r.createdDate)}</p>
                                        </Space>
                                        <Space >
                                            <p>Expiration Date: </p>
                                            <p>{formatDate(r.expirationDate)}</p>
                                        </Space>
                                        <p>{r.description}</p>
                                </Flex>)
                            },
                            actions:{
                                render:(_,r)=><Flex vertical><span>Accessible</span><Tag color="cyan" bordered={false}>{r.accessible}</Tag></Flex>
                            }
                        }}
                    />
                ) ||
                (
                    <>
                    <ProFormText
                        name={"recipient"}
                        label="Recipient"
                        placeholder={"username or user id"}
                        disabled={recipeintState?.recipeint}
                        fieldProps={{
                            onChange:(e)=>{
                               if (e.target.value !=''){
                                setRecipeintState({group:true})
                               }
                               else{
                                setRecipeintState({group:false})
                               }
                            }
                        }}
                    />
                      
                        <p>OR</p>
                    
                        <ProFormSelect
                            name={"groupId"}
                            label="User Group"
                            disabled={recipeintState?.group}
                            showSearch
                            fieldProps={{
                                onChange:(e)=>{
                                   if (e !=undefined){
                                    setRecipeintState({recipeint:true})
                                   }
                                   else{
                                    setRecipeintState({recipeint:false})
                                   }
                                }
                            }}
                            request={async () => {
                                const data = await TeamsServiceAPI(requestAction).page({
                                    criteria:{
                                        searchValue:""
                                    }
                                });
                                return data.items.map(v => ({
                                    value: v.id,
                                    label: v.name
                                }))
                            }}
                        />


                        <Divider orientation="left">Setting</Divider>

                        <Row gutter={16}>
                            <Col span={12}>
                                <ProFormDatePicker
                                    name={"expirationDate"}
                                    label="Expiration date"
                                    width={"md"}
                                    fieldProps={{
                                        disabledDate: (current: any) => {
                                            return current && current < dayjs().endOf('day');
                                        }
                                    }}
                                />
                            </Col>
                            <Col span={12}>
                                <ProFormDatePicker
                                    name={"effectiveDate"}
                                    label="Effective date"
                                    width={"md"}
                                />
                            </Col>
                        </Row>
                        <ProFormSelect
                            label="Accessible"
                            initialValue={"previewer"}
                            name={"accessible"}
                            rules={[
                                {required:true}
                            ]}
                            options={[
                                {
                                    value: "previewer",
                                    label: "Previewer"
                                },
                                {
                                    value: "viewer",
                                    label: "Viewer"
                                },
                                {
                                    value: "editor",
                                    label: "Editor"
                                },
                                {
                                    value: "upload-only",
                                    label: "Upload only"
                                },
                                {
                                    value: "custom",
                                    label: "Custom"
                                },
                            ]}
                        />
                        <ProFormTextArea
                            name={"description"}
                            label="Description"
                        />


                    </>

                )
            }

        </DrawerForm>
    )
}

export default ShareDrawerForm