import { CollaboratorDTO, FolderDTO } from "@/pages/dms/folder/data";
import { FolderServiceAPI } from "@/pages/dms/folder/service";
import { simpleRequestActions } from "@/services/model";
import { DeleteOutlined, UserOutlined } from "@ant-design/icons";
import { ActionType, ProDescriptions, ProList } from "@ant-design/pro-components";
import { Badge, Button, Card, Drawer, Flex } from "antd"
import { DrawerProps, Modal } from "antd/lib";
import { useEffect, useRef } from "react";
interface Props extends DrawerProps {
    data?: FolderDTO
}
const LibraryDetail: React.FC<Props> = ({ data, ...props }) => {
    const requestActions = simpleRequestActions();
    const services = FolderServiceAPI(requestActions);
    const actionRef = useRef<ActionType>();
    useEffect(()=>{
        actionRef.current?.reload?.()
    },[props.open]);
    return (
        <Drawer
            {...props}
            title="Library Infomation"
            width={700}
        >
            <Flex vertical gap={12}>
                <Card>
                    <ProDescriptions<FolderDTO>
                        dataSource={data}
                        columns={[
                            {
                                title: "Name",
                                dataIndex: "name",
                            },
                            {
                                title: "Department",
                                render: (_, r) => r.department?.name
                            },
                            {
                                title: "Folders",
                                dataIndex: "totalFolder"
                            },
                            {
                                title: "Location",
                                dataIndex: "location"
                            },
                            {
                                title: "Description",
                                dataIndex: "description"
                            },
                        ]}
                    />
                </Card>
                <ProList<CollaboratorDTO>
                    headerTitle="Collaborators"
                    size="small"
                    request={async ()=>{
                        const response = await services.collaboratorList(data?.id || 0);
                        return Promise.resolve({
                            data:response,
                            success:true
                        });
                    }}
                    actionRef={actionRef}
                    metas={{
                        avatar: {
                            render: (_, r) => <UserOutlined twoToneColor={"#03A9F4"} />
                        },
                        title: {
                            render: (_, r) => r.people.fullName
                        },
                        subTitle: {
                            render: (_, r) => <Badge text={r.createdBy} />
                        },
                        content: {
                            dataIndex: "createdDate",
                            valueType: "date"
                        },
                        description: {
                            render: (_, r) => r.people.email
                        },
                        actions: {
                            render: (_, r) => [
                                <Button
                                    danger
                                    type="link"
                                    icon={<DeleteOutlined />}
                                    onClick={() => {
                                        Modal.confirm({
                                            title: "Remove user as collaborator",
                                            content: "are you sure?",
                                            onOk: () => {
                                                FolderServiceAPI(requestActions).removeCollaborator(r.id);
                                            }
                                        })
                                    }}
                                />
                            ]
                        }
                    }}
                />
            </Flex>
        </Drawer>
    )
}

export default LibraryDetail