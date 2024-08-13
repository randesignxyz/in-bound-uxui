import React, { useEffect, useRef, useState } from 'react';
import { Button, Dropdown, Flex, MenuProps, Space, message } from 'antd';
import { FolderServiceAPI } from '../folder/service';
import { simpleRequestActions } from '@/services/model';
import { BankOutlined, DeleteOutlined, EditOutlined, EllipsisOutlined, FileTextOutlined, FolderAddOutlined, FolderOutlined, UserOutlined } from '@ant-design/icons';
import { ActionType } from '@ant-design/pro-components';
import { useAccess, useParams } from '@umijs/max';
import { Modal, Spin } from 'antd/lib';
import FolderEntryForm from '../folder/EntryForm';
import { DataNode, FolderCreate } from '../folder/data';
import DocumentModalForm from '../documentation/EntryForm';
import { DocumentServiceAPI } from '../documentation/service';
import { DocumentationAdvanceSearch, DocumentationCreate } from '../documentation/data';
import DirectoryTree from 'antd/es/tree/DirectoryTree';
interface Props {
    onSearch: (param: DocumentationAdvanceSearch) => void,
    activeKey?: boolean;
    moveDoc?: boolean;
    onMove?: () => void;
    setFolder: (libraryId?: number) => void;
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
    }));
}
export default ({ onSearch, activeKey, moveDoc, onMove, setFolder: setFolderId, onFolderSelected, ...props }: Props) => {
    const requestAction = simpleRequestActions();
    const actionRef = useRef<ActionType>();
    const access = useAccess();
    const param = useParams();
    const view = param["view"];
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
        setFolderId(folder[0]?.id);
        setFolderSelected(folder[0]?.id.toString());
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
    const [contractState, setContractState] = useState<{
        visible?: {
            name: "MODAL";
            type?: "ADD" | "EDIT";
            folderId: number;
            payload?: DocumentationCreate;
            libraryId?: number;
        }
    }>();

    useEffect(() => {
        testGetFolder();
       
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
                        onOk: async () => {
                            FolderServiceAPI(requestAction).delete(parseInt(recrd?.key || ""));
                            actionRef.current?.reloadAndRest?.();
                        }
                    })
                }
            },
        ];
    }
    return (
        <>
            <Spin spinning={requestAction.request?.loading}>
             
                {treeFolderList.length &&
                    <DirectoryTree
                        key={"doprdown-1"}
                        defaultExpandAll
                        selectedKeys={view != "library" ? [] : [(folderSelected || "")]}
                        expandAction={"doubleClick"}
                        onSelect={(e, { selectedNodes }) => {
                            setLibrary(selectedNodes[0].libraryId);
                            history.push(`${DMSPaths.workspace}/library/${e[0]}`)

                            onSearch({
                                library: selectedNodes[0]?.libraryId,
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
                            loadData()
                        }}
                        showLine
                        icon={<></>}
                        blockNode
                        titleRender={(items: DataNode) => {
                            return (
                                <Flex
                                    gap={12}
                                    justify='space-between'
                                    align='baseline'
                                >
                                    <Space size={12} style={{ whiteSpace: "nowrap", }}>
                                        {
                                            (items.type == "department") && <BankOutlined /> ||
                                            (items.type == "personal" && <UserOutlined />) ||
                                            <FolderOutlined />
                                        }
                                        <span>{items.title?.toString()}
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
                }
            </Spin>
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
                onSave={async (data: FolderCreate) => {
                    const response = await FolderServiceAPI(requestAction).save(data) as ({
                        data: string;
                        message: string
                    });
                    message.success("Success");
                    setFolderState((v) => ({ visible: undefined }));
                    testGetFolder()
                    actionRef.current?.reloadAndRest?.();
                }}
            />

            <ContractFormEntry
                open={contractState?.visible?.name == "MODAL"}
                onSave={() => {
                }}
            />
        </>
    );
};

