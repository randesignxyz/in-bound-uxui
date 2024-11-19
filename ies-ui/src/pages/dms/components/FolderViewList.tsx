import React, { useEffect, useRef, useState } from 'react';
import { Affix, Button, Dropdown, Flex, MenuProps, Space, message } from 'antd';
import { FolderServiceAPI } from '../folder/service';
import { simpleRequestActions } from '@/services/model';
import { BankFilled, DeleteOutlined, EditOutlined, FileTextOutlined, FolderAddOutlined, FolderFilled, UserOutlined } from '@ant-design/icons';
import { ActionType } from '@ant-design/pro-components';
import { Modal, Spin } from 'antd/lib';
import FolderEntryForm from '../folder/EntryForm';
import { DataNode, FolderCreate } from '../folder/data';
import DocumentModalForm from '../documentation/EntryForm';
import { DocumentServiceAPI } from '../documentation/service';
import { DocumentationAdvanceSearch, DocumentationCreate } from '../documentation/data';
import DirectoryTree from 'antd/es/tree/DirectoryTree';
import { useAccess } from '@/.umi/plugin-access';
interface Props {
    onSearch: (param: DocumentationAdvanceSearch) => void,
    activeKey?: boolean;
    moveDoc?: boolean;
    onMove?: () => void;
    onFolderSelected: () => void
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

const makeTree = (items: any[], key = 0, link = 'parentId'): any => {
    return items.filter(item => {
        return item[link] === key
    }).map(item => ({
        ...item,
        children: makeTree(items, item.id)
    }));
}
export default ({ onSearch, activeKey, moveDoc, onMove, onFolderSelected, ...props }: Props) => {
    const requestAction = simpleRequestActions();
    const actionRef = useRef<ActionType>();
    const access = useAccess();
    const [folderSelected, setFolderSelected] = useState<string>();
    const [documentModalState, setDocumentState] = useState<{
        visible?: {
            name: "MODAL";
            type: "ADD" | "EDIT";
            folderId: number;
            payload?: DocumentationCreate;
            libraryId?: number;
            division: "DOC" | "CONTRACT"
        }
    }>();

    const [treeFolderList, setTreeFolderList] = useState<DataNode[]>([]);
    const loadFolder = async () => {
        const folder = await FolderServiceAPI(requestAction).list({
            searchValue: "",
            advanceSearch: {
            }
        })
        const dd = makeTree(folder.map(o => ({
            key: o.id.toString(),
            id: o.id,
            title: o.name,
            parentId: o.parentId,
            code: o.code,
            libraryId: o.code == "LIBRARY" ? o.id : o.libraryId,
            type: o.type
        })));
        setTreeFolderList(dd);
        if (access.canAccessDMSAdminMenu) {
            onSearch({ libraryId: 0 })
        }
        else {
            const lId = folder.find((o) => o.code == "LIBRARY" && o.type == "personal")
            onSearch({ libraryId: lId?.id });
            setFolderSelected(`${lId?.id}`)
        }
    }
    const [folderState, setFolderState] = useState<{
        visible?: {
            name: "MODAL";
            type?: "ADD" | "EDIT";
            data?: DataNode,
            libraryId?: string;
            code: "LIBRARY" | "FOLDER",
        }
    }>();
    useEffect(() => {
        loadFolder();
    }, [actionRef]);
    const itemsAction = (recrd?: DataNode): MenuProps["items"] => {
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
                            libraryId: recrd?.code == "LIBRARY" ? recrd?.key : recrd?.libraryId?.toString()
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
                            libraryId: recrd?.key
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
                    Modal.confirm({
                        title: "Delete Folder",
                        content: `This will permanently delete the ${recrd?.title} folder.`,
                        onOk: () => {
                            FolderServiceAPI(requestAction).delete(parseInt(recrd?.key || "")).then(o => {
                                message.success("Success!");
                                loadFolder()
                                actionRef.current?.reloadAndRest?.();
                            });
                        }
                    })
                }
            },
        ];
    }

    return (
        <>
            <Spin spinning={requestAction.request?.loading}>
                <Affix offsetTop={70}>
                    {access.canAccessDMSAdminMenu && <Button
                        onClick={() => {
                            onFolderSelected?.();
                            setFolderSelected("")
                            onSearch({
                                libraryId: 0,
                                folderId: 0,
                                folderType: ""
                            })
                        }}
                        type={folderSelected ? "default" : "primary"}
                        style={{ width: "100%", margin: "10px 0" }} icon={<FileTextOutlined />}>All Documents</Button>}
                </Affix>

                {treeFolderList.length != 0 &&
                    <DirectoryTree
                        key={"doprdown-1"}
                        defaultExpandAll
                        blockNode
                        checkStrictly
                        selectedKeys={[folderSelected || ""]}
                        expandAction={"doubleClick"}
                        onSelect={(e, { selectedNodes }) => {
                            setFolderSelected(`${e[0]}`);
                            onFolderSelected?.();
                            onSearch({
                                libraryId: selectedNodes[0]?.libraryId,
                                folderId: parseInt(selectedNodes[0]?.key),
                                folderType: selectedNodes[0]?.code
                            });
                        }}
                        treeData={treeFolderList}
                        defaultExpandedKeys={treeFolderList.map(o => o.key) || []}
                        onDrop={(info) => {
                            const drag = info.dragNode.key;
                            const node = info.node.key;
                            FolderServiceAPI(requestAction).move({
                                moveId: parseInt(drag.toString()),
                                moveToId: parseInt(node.toString()),
                                code: info.node.code || ""
                            });
                            actionRef.current?.reload();
                        }}
                        icon={<>{ }</>}
                        titleRender={(items: DataNode) => {
                            return (
                                <Dropdown
                                    key={"dropdoan"}
                                    trigger={["contextMenu"]}
                                    menu={{
                                        items: itemsAction(items),
                                        style: {
                                            width: 200,
                                            float: "right",
                                        }
                                    }}
                                >
                                    <Flex
                                        justify='space-between'
                                        align='baseline'
                                    >
                                        <Space size={6} style={{ whiteSpace: "nowrap", padding: "3px 0" }} >
                                            {
                                                (items.type == "department") && <BankFilled style={{ color: "#54aeff" }} /> ||
                                                (items.type == "personal" && <UserOutlined style={{ color: "#54aeff" }} />) ||
                                                <FolderFilled style={{ color: "#f3d534" }} />
                                            }
                                            <span>{items.title?.toString()}</span>
                                        </Space>
                                    </Flex>
                                </Dropdown>
                            )
                        }}
                    />
                }
            </Spin >
            < DocumentModalForm
                open={documentModalState?.visible?.name === "MODAL"}
                type={documentModalState?.visible?.type}
                libraryId={documentModalState?.visible?.libraryId}
                onCancel={() => setDocumentState(v => ({ ...v, visible: undefined }))}
                division={documentModalState?.visible?.division}
                onSave={async (data: DocumentationCreate) => {
                    const response = await DocumentServiceAPI(requestAction).save(data) as unknown as ({
                        data: DocumentationCreate;
                        message: string
                    });
                }}
            />
            < FolderEntryForm
                open={folderState?.visible?.name == "MODAL"}
                onCancel={() => setFolderState((v) => ({ visible: undefined }))}
                code={folderState?.visible?.code}
                data={folderState?.visible?.data}
                libraryId={folderState?.visible?.libraryId}
                type={folderState?.visible?.type}
                onSave={(data: FolderCreate) => {
                    Modal.confirm({
                        title: "Save Folder",
                        content: "are you sure? this input is corrected!",
                        onOk: async () => {
                            await FolderServiceAPI(requestAction).save(data) as ({
                                data: string;
                                message: string
                            });
                            message.success("Success");
                            setFolderState((v) => ({ visible: undefined }));
                            loadFolder()
                            actionRef.current?.reloadAndRest?.();
                        }
                    });
                }}
            />
        </>
    );
};

