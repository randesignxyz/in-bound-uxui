import React, { useEffect, useRef, useState } from 'react';
import { Button, Divider, Drawer, DrawerProps, Dropdown, MenuProps, Space, Tree } from 'antd';
import type { DirectoryTreeProps } from 'antd/es/tree';
import { FolderServiceAPI } from '../folder/service';
import { simpleRequestActions } from '@/services/model';
import { BankOutlined, DeleteOutlined, DownOutlined, EditOutlined, FileAddOutlined, FolderAddOutlined, PlusOutlined, ShareAltOutlined, UserOutlined } from '@ant-design/icons';
import EntryForm from '../folder/EntryForm';
import { ActionType } from '@ant-design/pro-components';
import { MenuItemType } from 'rc-menu/lib/interface';
import { LibraryDTO } from '../setting/components/library/data';
import { history } from '@umijs/max';
import { Modal } from 'antd/lib';
import { DataNode, FolderCreate, FolderDTO } from '../folder/data';

const { DirectoryTree } = Tree;

interface Props extends DrawerProps {
    onSearch: (param: GlobleSearch) => void
}

interface MenuItemComp extends MenuItemType {

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



export default ({ onSearch, ...props }: Props) => {
    const requestAction = simpleRequestActions();


    const [folderSelect, setFolderSelect] = useState<DataNode>();
    const [folder, setFolder] = useState<FolderDTO>();
    const [libraryState, setLibraryState] = useState<{
        visible?: {
            name: "modal";
            type: "ADD" | "EDIT",
            payload?: {
                record: LibraryDTO
            }
        }
    }>();
    const [treeData, setTreeData] = useState<DataNode[]>([]);

    const onSelect: DirectoryTreeProps['onSelect'] = (keys, info) => {
        onSearch({
            searchValue: "",
            folderId: parseInt(keys[0].toString())
        });
        setFolderSelect({
            key: info.node.key.toString(),
            title: info.node.title?.toString(),
        })

    };

    const onExpand: DirectoryTreeProps['onExpand'] = async (keys, info) => {


        if (info.expanded) {

            const ss = await FolderServiceAPI(requestAction).page({
                criteria: {
                    searchValue: "",
                    advanceSearch: { parentId: parseInt(info.node.key.toString()) }
                }
            });
            setTreeData((origin) =>
                updateTreeData(origin, info.node.key,
                    ss.items?.map(it => ({
                        key: it.id.toString(),
                        title: it.name,
                        isLeaf: it.totalFolder > 0 ? false : true
                    }))
                ),
            );


        }
    };

    const actionRef = useRef<ActionType>();

    const loadData = async () => {
        const data = await FolderServiceAPI(requestAction).page({
            criteria: {
                searchValue: "",
                advanceSearch: {
                    parentId: 0
                }
            }
        });
        setFolder(data.items.filter(it => it.type == "LIBRARY")[0])
        setTreeData(
            data.items?.map(it => ({
                key: it.id.toString(),
                title: it.name,
                isLeaf: it.totalFolder > 0 ? false : true
                
            }))
        );

    }
    const [stateFolder, setStateFolder] = useState<{
        visible?: {
            name: "modal";
            type: "ADD" | "EDIT";
            data?: DataNode
        }
    }>();

    useEffect(() => {
        loadData();
    }, [actionRef]);




    const items = (recrd?:DataNode): MenuProps["items"] => [
        {
            key: "1",
            label: "Upload File",
            icon: <FileAddOutlined />,
            onClick: () => history.push("/dms/document/create/*")
        },
        {
            key: "2",
            label: "New Folder",
            icon: <FolderAddOutlined />,
            onClick: () => setStateFolder({ visible: { name: 'modal', type: 'ADD', data: folderSelect } })
        },
        {
            key: "3",
            label: "Rename Folder",
            icon: <EditOutlined />,
            onClick: () => setStateFolder({ visible: { name: 'modal', type: 'EDIT', data: folderSelect } })
        },
        {
            type:"divider"
        },
        {
            key: "4",
            label: "Delete",
            danger:true,
            icon: <DeleteOutlined />,
            onClick: () => {
                Modal.confirm({
                    title:"Delete Folder",
                    content:`This will permanently delete the ${folderSelect?.title} folder.`,
                    onOk:async()=>{
                        FolderServiceAPI(requestAction).delete(parseInt(folderSelect?.key || ""));
                        actionRef.current?.reloadAndRest?.();
                    }
                })
            }
        },
    ];

    return (
        <>
            <Drawer
                {...props}
            >
                <Space
                    style={{
                        width: "100%",
                        justifyContent: "space-between",

                    }}
                >
                    <Button
                        icon={<BankOutlined />}
                        type='link'
                        disabled={
                            folder ? true : false
                        }
                        onClick={() => setLibraryState({ visible: { name: 'modal', type: 'ADD', } })}
                    >
                        New own library
                    </Button>
                    <Dropdown

                        menu={{
                            items: items(),
                            disabled: folderSelect ? false : true
                        }}
                    >
                        <a>{folderSelect?.title ? folderSelect?.title : "Folder"} <DownOutlined /></a>
                    </Dropdown>
                </Space>
                <hr />
                <p><BankOutlined />Document</p>
                <DirectoryTree
                    showLine
                    
                    onSelect={onSelect}
                    onExpand={onExpand}
                    expandAction={"click"}
                    treeData={treeData}
                    onDoubleClick={() => {
                    }}
                    filterTreeNode={()=>true}
                    onRightClick={(e) => {
                        setFolderSelect({ key: e.node?.key.toString(), title: e.node?.title?.toString() });
                    }}
                />
                <br /><br />
                <Divider />
                <p><ShareAltOutlined /> SHARED TEAM FOLDERS</p>
                    <Tree<DataNode>
                       
                        treeData={[
                            {
                                key:"1",
                                title:"13",
                                icon:<ShareAltOutlined/>
                            }
                        ]}

                        titleRender={(r)=>{
                            return (
                                <>
                                    <Space>
                                        <UserOutlined/>
                                        <span>Hello</span>
                                    </Space>
                                    <Button onClick={()=>{console.log(r);
                                    }}>S</Button>
                                    
                                </>
                            )
                        }}

                    />
                <Button style={{ justifyContent: "center" }} icon={<PlusOutlined />} type='link' >New Group</Button>

            </Drawer>
            <EntryForm
                open={stateFolder?.visible?.name === "modal"}
                onCancel={() => setStateFolder((v) => ({ ...v, visible: undefined }))}
                type={stateFolder?.visible?.type}
                data={folderSelect}
                onSave={async (data: FolderCreate) => {
                    await FolderServiceAPI(requestAction).save(data);
                    setStateFolder((v) => ({ ...v, visible: undefined }))
                }}
            />
          
        </>
    );
};

