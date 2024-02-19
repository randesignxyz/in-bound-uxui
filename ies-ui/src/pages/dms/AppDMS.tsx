import { Button, Segmented } from "antd"
import FolderViewList from "./components/FolderViewList";
import { useEffect, useState } from "react";
import DocumentListView from "./documentation/DocumentListView";
import { DMSPaths } from ".";
import RecievedShare from "./share/RecievedShare";
import FavoriteView from "./favorite/FavoriteView";
import { ShareAltOutlined, MenuFoldOutlined, FolderOutlined, SettingOutlined, BellOutlined } from "@ant-design/icons";
import ReminderListView from "./reminder/ReminderListView";
import { DocumentationSearchByFolder } from "./documentation/data";
import { Access, history, useAccess, useParams } from "@umijs/max";
import ContractListView from "./contract/ContractListView";
import { MenuProps } from "antd/lib";

const APPDMS: React.FC = () => {
    const param = useParams();
    const access = useAccess();
    const view = param["view"];
    const [paramByFolder, setParamByFolder] = useState<DocumentationSearchByFolder>();
    const [sidbarState, setSidbarState] = useState<boolean>(false);
    const [divisionState, setDivisionState] = useState<string>("DOC");
    const [libraryId, setLibraryId] = useState<number>();
    const [menuStyleState, setMenuStyleState] = useState<React.CSSProperties>(
        {
            height: "90%",
            width: "300px",
            position: "fixed",
            zIndex: "1",
            top: "1០%",
            left: 30,
            backgroundColor: "white",
            overflow: "auto",
            borderRadius: 5,
            boxShadow: "-1px 1px 25px -1px lightgray",
            padding: 10

        }
    );
    useEffect(() => {
    }, []);


    return (
        <>
            {/* <Flex align="baseline" >
                <Button type="link" onClick={(e) => {

                    if (sidbarState) {
                        setSidbarState(false)
                        setMenuStyleState((v) => ({ ...v, marginLeft: 0 }));
                    } else {

                        setSidbarState(true)
                        setMenuStyleState((v) => ({ ...v, marginLeft: -350, transition: "all 0.5s" }));
                    }
                }} icon={<MenuFoldOutlined />} />
                <Segmented
                    style={{ width: "100%", marginTop: "-100px" }}
                    defaultValue={view}
                    block
                    options={[
                        {
                            value: "library",
                            label: "Documents",
                            icon: <FolderOutlined />
                        
                        },
                        {
                            value: "contract",
                            label: "Contract",
                            icon: <AuditOutlined />
                        },
                        {
                            value: "received-share",
                            label: "Shareds",
                            icon: <ShareAltOutlined />
                        },
                        {
                            value: "reminder",
                            label: "Reminders",
                            icon: <ClockCircleOutlined />
                        },
                        {
                            value: "team",
                            label: <Dropdown
                                arrow
                                menu={{
                                    items,
                                    style:{
                                        width:200
                                    }
                                }}
                            ><a>Helo</a></Dropdown>,
                            icon: <ClockCircleOutlined />
                        },
                    ]}

                    onChange={(e) =>{
                        history.push(`${DMSPaths.workspace}/${e}`)
                        setDivisionState(e.toString())
                    }}
                />

                <Button icon={<SettingOutlined />} type="link"   onClick={() => history.push(`${DMSPaths.setting}/department`)} />
            </Flex> */}

            <div
                style={menuStyleState}
            >
                <FolderViewList activeKey={view == "library" ? true : false}
                    setLibrary={setLibraryId}
                    onSearch={(param: DocumentationSearchByFolder) => setParamByFolder(param)} />
                {/* <Collapse
                    ghost
                    bordered={false}
                    defaultActiveKey={["1", "other", "3", "4"]}
                    items={[
                        // {
                        //     key: "1",
                        //     label: <Space><ClusterOutlined />Your Workspace </Space>,
                        //     children: 
                        //     />
                        // },
                        // {
                        //     key: "3",
                        //     label: <Space><HistoryOutlined /> Quick Access</Space>,
                        //     // children: <QuickAccess activeKey={view} />
                        //     children: (
                        //         <Menu
                        //             selectedKeys={[view || ""]}
                        //             style={{
                        //                 marginTop: -15,
                        //                 width: "100%",
                        //             }}
                        //             mode="inline"
                        //             items={[
                        //                 {
                        //                     key: "draft",
                        //                     label: "Drafted",
                        //                     icon: <FormOutlined />,
                        //                     onClick: () => history.push(`${DMSPaths.workspace}/draft`)
                        //                 },
                        //                 {
                        //                     key: "favorite",
                        //                     label: "Favorites",
                        //                     icon: <HeartOutlined />,
                        //                     onClick: () => history.push(`${DMSPaths.workspace}/favorite`)
                        //                 },
                        //                 // {
                        //                 //     key: "expire",
                        //                 //     label: "Expiring Soon",
                        //                 //     icon:<ClockCircleOutlined/>,
                        //                 //     onClick: () => history.push(`${DMSPaths.workspace}/expire`)
                        //                 // },
                        //             ]}
                        //         ></Menu>
                        //     )
                        // },
                        {
                            key: "other",
                            label: <Space><ShareAltOutlined />Others</Space>,
                            children: (
                                <Menu
                                    selectedKeys={[view || ""]}
                                    theme='light'
                                    style={{
                                        width: "100%",
                                        marginTop: -15
                                    }}
                                    mode='inline'
                                    items={[
                                        {
                                            key: "received-share",
                                            label: "Shareds",
                                            icon: <NodeCollapseOutlined />,
                                            onClick: () => history.push(`${DMSPaths.workspace}/received-share`)
                                        },
                                        {
                                            key: "reminder",
                                            label: "Reminder",
                                            icon: <ClockCircleOutlined />,
                                            onClick: () => history.push(`${DMSPaths.workspace}/reminder`),
                                            theme: "light"
                                        },
                                        // {
                                        //     key: "trash",
                                        //     label: "Trash",
                                        //     icon: <DeleteOutlined />,
                                        //     onClick: () => history.push(`${DMSPaths.workspace}/trash`),
                                        //     theme: "light"
                                        // },
                                    ]}
                                />
                            )
                        },
                        // {
                        //     key: "4",
                        //     label: "Contracts",
                        //     children: (
                        //         <Menu
                        //             selectedKeys={[view || ""]}
                        //             theme='light'
                        //             style={{
                        //                 width: "100%",
                        //                 marginTop: -15
                        //             }}
                        //             mode='inline'
                        //             items={[
                        //                 {
                        //                     key: "contract",
                        //                     label: "My Request",
                        //                     icon: <AuditOutlined />,
                        //                     onClick: () => history.push(`${DMSPaths.workspace}/contract`)
                        //                 },
                        //                 // {
                        //                 //     key: "my",
                        //                 //     label: "Contracts",
                        //                 //     icon: <FileDoneOutlined />,
                        //                 //     onClick: () => history.push(`${DMSPaths.workspace}/reminder`),
                        //                 //     theme: "light"
                        //                 // },
                        //             ]}
                        //         />
                        //     )
                        // },
                        {
                            key: "setting",
                            showArrow: false,
                            label: <Button
                                style={{
                                    width: "100%",

                                }}
                                onClick={() => history.push(`${DMSPaths.setting}/department`)}
                            >Setting</Button>
                        },

                    ]}
                /> */}
            </div>
            <div
                style={
                    sidbarState ? { marginLeft: 0, transition: "all 0.5s" } :
                        {
                            marginLeft: "300px",
                            padding: "10px",
                            transition: "all 0.5s"
                        }}
            >
                <div style={{ display: "flex", width: "100%", margin: "5px 0" }}>
                    <Button type="link" onClick={(e) => {

                        if (sidbarState) {
                            setSidbarState(false)
                            setMenuStyleState((v) => ({ ...v, marginLeft: 0 }));
                        } else {

                            setSidbarState(true)
                            setMenuStyleState((v) => ({ ...v, marginLeft: -350, transition: "all 0.5s" }));
                        }
                    }} icon={<MenuFoldOutlined />} />
                    <Segmented
                        style={{ width: "100%" }}
                        defaultValue={view}

                        options={[
                            {
                                value: "library",
                                label: "Document",
                                icon: <FolderOutlined />,

                            },
                            {
                                value: "received-share",
                                label: "Shareds",
                                icon: <ShareAltOutlined />
                            },
                            {
                                value: "reminder",
                                label: "Reminders",
                                icon: <BellOutlined />
                            },
                        ]}
                        onChange={(e) => {
                            if (e == "library") {
                                history.push(`${DMSPaths.workspace}/${e}/${libraryId}`)
                                setDivisionState(e.toString());
                            }
                            else {
                                history.push(`${DMSPaths.workspace}/${e}`)
                                setDivisionState(e.toString());
                            }

                        }}
                    />
                    <Access accessible={access.canAccessDMSAdminMenu}>
                        <Button icon={<SettingOutlined />} type="link" onClick={() => history.push(`${DMSPaths.setting}/department`)} />
                    </Access>
                </div>
                {
                    view === "library" && (<DocumentListView paramSearch={paramByFolder} libraryId={libraryId||0} />) ||
                    view === "received-share" && (<RecievedShare />) ||
                    view === "favorite" && (<FavoriteView />) ||
                    view === "contract" && (<ContractListView />) ||
                    view === "reminder" && (<ReminderListView />)
                    // view === "trash" && (<DocumentListView paramSearch={paramByFolder} division="DOC" />)

                }
            </div>
        </>
    )
}

export default APPDMS


