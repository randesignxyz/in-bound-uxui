import React, { useEffect, useRef, useState } from 'react';
import { Button, Dropdown, Flex, MenuProps, Space, TreeDataNode, message } from 'antd';
import { FolderServiceAPI } from '../folder/service';
import { simpleRequestActions } from '@/services/model';
import { BankOutlined, DeleteOutlined, EditOutlined, EllipsisOutlined, FileAddOutlined, FolderAddOutlined, FolderOutlined, PlusOutlined } from '@ant-design/icons';
import { ActionType } from '@ant-design/pro-components';
import { history, useAccess } from '@umijs/max';
import { Modal, Spin } from 'antd/lib';
import FolderEntryForm from '../folder/EntryForm';
import { DataNode, FolderCreate } from '../folder/data';
import { LibraryServiceAPI } from '../setting/components/library/service';
import LibraryModalEntry from '../setting/components/library/LibraryModalEntry';
import { LibraryCreate, LibraryDTO } from '../setting/components/library/data';
import DocumentModalForm from '../documentation/EntryForm';
import { DocumentServiceAPI } from '../documentation/service';
import { DMSPaths } from '..';
import TeamModalForm from '../team/TeamModalForm';
import { DocumentationAdvanceSearch, DocumentationCreate } from '../documentation/data';
import DirectoryTree from 'antd/es/tree/DirectoryTree';



interface Props {
    onSearch: (param: DocumentationAdvanceSearch) => void,
    activeKey?: boolean;
    moveDoc?: boolean;
    onMove?: () => void;
}
const updateTreeData = (list: DataNode[], key: React.Key, children: DataNode[]): DataNode[] => list.map((node) => {
    if (node.key === key) {
        return {
            ...node,
            children,
        };
    }
    if (node.children) {
        return {
            ...node,
            children: updateTreeData(node.children, key, children),
        };
    }
    return node;
});

export default ({ onSearch, activeKey, moveDoc, onMove, ...props }: Props) => {

    const requestAction = simpleRequestActions();
    const [folder, setFolder] = useState<LibraryDTO>();
    const actionRef = useRef<ActionType>();
    const access = useAccess();
 
    const [documentModalState, setDocumentState] = useState<{
        visible?: {
            name: "MODAL";
            type: "ADD" | "EDIT";
            folderId: number;
            payload?: DocumentationCreate;
            libraryId?: number;
        }
    }>();

    const [treeData, setTreeData] = useState<DataNode[]>([
        {
            title: "Document",
            key: "000",
            isLeaf: false
        }
    ]);

    const onExpand = async (node: TreeDataNode & DataNode) => {
        const data = node?.code == "LIBRARY" ? 1 : 0
        const ss = await FolderServiceAPI(requestAction).page({
            criteria: {
                searchValue: "",
                advanceSearch: {
                    parentId: data == 1 ? 0 : parseInt(node.key.toString()),
                    libraryId: data == 1 ? parseInt(node.key.toString()) : undefined,
                }
            }
        });
        setTreeData((origin) =>
            updateTreeData(origin, node?.key,
                ss.items?.map((it, index) => {
                    return ({
                        key: it.id.toString(),
                        title: it.name,
                        isLeaf: it.totalFolder > 0 ? false : true,
                        libraryId: node.libraryId
                    })
                })
            ),
        );
    };
    const loadData = async () => {
        const data = await LibraryServiceAPI(requestAction).list({
            isAdmin: access.canAccessDMSAdminMenu,

        });
        setFolder(data?.filter(it => it.type == "own")[0])
        setTreeData(
            data.map(it => ({
                key: it.id?.toString(),
                title: it.name,
                isLeaf: it.totalFolder > 0 ? false : true,
                type: it.type,
                code: "LIBRARY",
                libraryId: it.id
            }))
        )
    }
    const [folderState, setFolderState] = useState<{
        visible?: {
            name: "MODAL";
            type?: "ADD" | "EDIT";
            data?: DataNode,
            libraryId?: number;
            code: "LIBRARY" | "FOLDER",

        }
    }>();

    const [libraryState, setLibraryState] = useState<{
        visible?: {
            name: "MODAL";
            type?: "ADD" | "EDIT";
            code: string;
            libraryId?: number;
            data?: DataNode
        }
    }>();

    const [teamShareState, setTeamShareState] = useState<{
        visible?: {
            name: "MODAL";
            type?: "ADD" | "EDIT";
        }
    }>();




    useEffect(() => {
        loadData();
    }, [actionRef]);


    const itemsAction = (recrd?: DataNode): MenuProps["items"] => {
        if (recrd?.code == "LIBRARY") {
            return [
                {
                    key: "2",
                    label: "New Folder",
                    icon: <FolderAddOutlined />,
                    onClick: () => {
                        setFolderState({
                            visible: {
                                name: 'MODAL',
                                type: 'ADD',
                                code: "FOLDER",
                                data: recrd,
                                libraryId: recrd?.code == "LIBRARY" ? parseInt(recrd.key) : 0
                            }
                        })
                    }
                },
                {
                    key: "3",
                    label: "Rename Folder",
                    icon: <EditOutlined />,
                    onClick: () => {
                        setLibraryState({
                            visible: {
                                code: "LIBRARY",
                                name: "MODAL",
                                type: "EDIT",
                                data: recrd,
                                libraryId: recrd?.code == "LIBRARY" ? parseInt(recrd.key) : 0
                            }
                        })
                    }

                },
            ]
        }
        else {


            return [
                {
                    key: "1",
                    label: "Create Document",
                    icon: <FileAddOutlined />,
                    disabled: recrd?.code == "LIBRARY" ? true : false,
                    onClick: () => {
                        setDocumentState({ visible: { name: "MODAL", type: "ADD", folderId: parseInt(recrd?.key || ""), libraryId: recrd?.libraryId } })
                    }
                },
                {
                    key: "2",
                    label: "New Folder",
                    icon: <FolderAddOutlined />,
                    onClick: () => {
                        setFolderState({
                            visible: {
                                name: 'MODAL',
                                type: 'ADD',
                                code: "FOLDER",
                                data: recrd,
                                libraryId: recrd?.code == "LIBRARY" ? parseInt(recrd.key) : 0
                            }
                        })
                    }
                },
                {
                    key: "3",
                    label: "Rename Folder",
                    icon: <EditOutlined />,
                    onClick: () => {
                        setFolderState({
                            visible: {
                                name: 'MODAL',
                                type: 'EDIT',
                                code: "FOLDER",
                                data: recrd,
                                libraryId: parseInt(recrd?.key || "")
                            }
                        })
                    }

                },

                {
                    type: "divider"
                },
                {
                    key: "5",
                    label: "Delete",
                    danger: true,
                    icon: <DeleteOutlined />,
                    onClick: () => {
                        console.log(recrd);

                        Modal.confirm({
                            title: "Delete Folder",
                            content: `This will permanently delete the ${recrd?.title} folder.`,
                            onOk: async () => {

                                FolderServiceAPI(requestAction).delete(parseInt(recrd?.key || ""));
                                actionRef.current?.reloadAndRest?.();
                            }
                        })
                    }
                },

            ];
        }
    }
    return (
        <>

            <Spin spinning={requestAction.request?.loading}>
                {!moveDoc && (<>
                    {!folder && (
                        <Button
                            style={{ width: "100%", margin: "10px 0" }}
                            icon={<PlusOutlined />}
                            onClick={() => setLibraryState({ visible: { name: 'MODAL', type: 'ADD', code: "own" } })}
                        >Your Own Library</Button>
                    )}
                </>)}

                <DirectoryTree
                    blockNode
                    key={"doprdown-1"}
                    onExpand={(_, info) => {
                        return onExpand(info.node)
                    }}
                    expandAction={"doubleClick"}
                    defaultExpandAll={true || !moveDoc}
                    onSelect={(e, { selectedNodes }) => {
                        if (selectedNodes[0]?.code == "LIBRARY") {
                            history.push(`${DMSPaths.workspace}/library`)
                        }
                        onSearch({ folderId: parseInt(selectedNodes[0]?.key), folderType: selectedNodes[0]?.code })
                    }}
                    treeData={treeData}
                    draggable
                    
                    onClick={() => {
                        history.push(`${DMSPaths.workspace}/library`)
                    }}
                    onDrop={(info) => {
                        const drag = info.dragNode.key;
                        const node = info.node.key;
                        FolderServiceAPI(requestAction).move({
                            moveId: parseInt(drag.toString()),
                            moveToId: parseInt(node.toString()),
                            code: info.node.code || ""
                        });
                        actionRef.current?.reload();
                        loadData()
                    }}
                    showLine
                    icon={<></>}
                    titleRender={(items: DataNode) => {
                        return (
                            <Flex
                                gap={12}
                                justify='space-between'
                            >
                                <Space size={12} style={{ whiteSpace: "nowrap" }}>
                                    {
                                        (items.code == "LIBRARY" && <BankOutlined />) ||
                                        <FolderOutlined />
                                    }
                                    <span>{items.title?.toString()}
                                        {/* <span style={{ color: "gray" }}> {`${items.code === "LIBRARY" ? `(${items.type})` : ''}`}</span> */}
                                    </span>
                                </Space>
                                {
                                    !moveDoc && (
                                        <Dropdown
                                            key={"dropdoan"}
                                            trigger={["hover"]}

                                            menu={{
                                                items: itemsAction(items),

                                                style: {
                                                    width: 200,
                                                    float: "right",
                                                }
                                            }}
                                        >
                                            <a><EllipsisOutlined /></a>
                                        </Dropdown>
                                    )
                                }

                            </Flex>
                        )
                    }}
                />
            </Spin>

            < LibraryModalEntry
                open={libraryState?.visible?.name === "MODAL"}
                onCancel={() => setLibraryState(v => ({ ...v, visible: undefined }))}
                code={libraryState?.visible?.code}
                isAdmin={false}
                libraryId={libraryState?.visible?.libraryId}
                onSave={async (data: LibraryCreate) => {
                    const response = await LibraryServiceAPI(requestAction).save(data) as ({
                        data: string;
                        message: string;
                    });
                    message.success("Success")
                    actionRef.current?.reloadAndRest?.();
                    setLibraryState((v) => ({ ...v, visible: undefined }));
                }}
            />
            < DocumentModalForm
                open={documentModalState?.visible?.name === "MODAL"}
                type={documentModalState?.visible?.type}
                libraryId={documentModalState?.visible?.libraryId}
                onCancel={() => setDocumentState(v => ({ ...v, visible: undefined }))}
                folderId={documentModalState?.visible?.folderId}
                onSave={async (data: DocumentationCreate) => {
                    const response = await DocumentServiceAPI(requestAction).save(data) as unknown as ({
                        data: DocumentationCreate;
                        message: string
                    });
                    history.push(`${DMSPaths.document}/detail/${response.data?.id}`)
                }}
            />
            < FolderEntryForm
                open={folderState?.visible?.name == "MODAL"}
                onCancel={() => setFolderState((v) => ({ visible: undefined }))}
                code={folderState?.visible?.code}
                data={folderState?.visible?.data}
                libraryId={folderState?.visible?.libraryId}
                type={folderState?.visible?.type}
                onSave={async (data: FolderCreate) => {
                    const response = await FolderServiceAPI(requestAction).save(data) as ({
                        data: string;
                        message: string
                    });
                    message.success("Success");
                    setFolderState((v) => ({ visible: undefined }))
                    actionRef.current?.reloadAndRest?.();


                }}
            />

            < TeamModalForm
                open={teamShareState?.visible?.name == "MODAL"}
                onCancel={() => setTeamShareState(v => ({ ...v, visible: undefined }))}
            />



        </>
    );
};

