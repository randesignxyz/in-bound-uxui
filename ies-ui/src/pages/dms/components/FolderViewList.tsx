import React, { useEffect, useRef, useState } from 'react';
import { Dropdown, Flex, MenuProps, Space, TreeDataNode, message } from 'antd';
import { FolderServiceAPI } from '../folder/service';
import { simpleRequestActions } from '@/services/model';
import { BankOutlined, DeleteOutlined, EditOutlined, EllipsisOutlined, FolderAddOutlined, FolderOutlined } from '@ant-design/icons';
import { ActionType } from '@ant-design/pro-components';
import { history, useParams } from '@umijs/max';
import { Modal, Spin } from 'antd/lib';
import FolderEntryForm from '../folder/EntryForm';
import { DataNode, FolderCreate } from '../folder/data';
import { LibraryServiceAPI } from '../setting/components/library/service';
import { LibraryDTO } from '../setting/components/library/data';
import DocumentModalForm from '../documentation/EntryForm';
import { DocumentServiceAPI } from '../documentation/service';
import { DMSPaths } from '..';
import { DocumentationAdvanceSearch, DocumentationCreate } from '../documentation/data';
import DirectoryTree from 'antd/es/tree/DirectoryTree';
import ContractFormEntry from '../contract/ContractFormEntry';


interface Props {
    onSearch: (param: DocumentationAdvanceSearch) => void,
    activeKey?: boolean;
    moveDoc?: boolean;
    onMove?: () => void;
    setLibrary:(libraryId?:number) => void;
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
    }))
}



export default ({ onSearch, activeKey, moveDoc, onMove,setLibrary , ...props }: Props) => {

    const requestAction = simpleRequestActions();
    const [folder, setFolder] = useState<LibraryDTO>();
    const actionRef = useRef<ActionType>();
    const params = useParams();

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

    const [treeData, setTreeData] = useState<DataNode[]>([
        {
            title: "Document",
            key: "000",
            isLeaf: false
        }
    ]);

    const [treeFolderList, setTreeFolderList] = useState<DataNode[]>([]);
    const testGetFolder = async () => {
        const folder = await FolderServiceAPI(requestAction).list({
            searchValue: "",
            advanceSearch: {

            }
        })

        const dd = makeTree(folder.map(o => ({ key: o.id.toString(), id: o.id, title: o.name, parentId: o.parentId, code: o.code, libraryId:o.code=="LIBRARY"?o.id:o.libraryId })));
        setTreeFolderList(dd);
        setLibrary(folder[0]?.id);
        history.push(`${DMSPaths.workspace}/library/${folder[0]?.id}`)
    }


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

        });
        setFolder(data?.filter(it => it.type == "own")[0]);
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
                            libraryId:recrd?.code=="LIBRARY"?recrd?.key:recrd?.libraryId?.toString() 
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
                        blockNode
                        key={"doprdown-1"}
                        defaultExpandAll
                        selectedKeys={[parseInt(params["*"] || "").toString()]}
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
                folderId={documentModalState?.visible?.folderId}
                division={documentModalState?.visible?.division}
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
                    setFolderState((v) => ({ visible: undefined }));
                    testGetFolder()
                    actionRef.current?.reloadAndRest?.();
                }}
            />

            <ContractFormEntry
                open={contractState?.visible?.name == "MODAL"}
                onSave={() => {
                }}
                onCancel={() => setContractState({ visible: undefined })}
            />
        </>
    );
};

