import { Button, Collapse, Menu, Space, notification } from "antd"
import FolderViewList from "./components/FolderViewList";
import { useEffect, useState } from "react";
import DocumentListView from "./documentation/DocumentListView";
import { DMSPaths } from ".";
import RecievedShare from "./share/RecievedShare";
import FavoriteView from "./favorite/FavoriteView";
import { ClusterOutlined, ShareAltOutlined, NodeCollapseOutlined, HistoryOutlined, ClockCircleOutlined } from "@ant-design/icons";
import QuickAccess from "./components/QuickAccess";
import ReminderListView from "./reminder/ReminderListView";
import DraftListView from "./quickaccess/DraftListView";
import { DocumentationSearchByFolder } from "./documentation/data";
import { history, useAccess, useParams } from "@umijs/max";
import { NotificationPlacement } from "antd/lib/notification/interface";
import { simpleRequestActions } from "@/services/model";
import { ReminderServiceAPI } from "./reminder/service";
import { ReminderDTO } from "./reminder/data";

const APPDMS: React.FC = () => {
    const param = useParams();
    const view = param["view"];
    const access = useAccess();
    const requestAction = simpleRequestActions();
    const [paramByFolder, setParamByFolder] = useState<DocumentationSearchByFolder>();

    useEffect(() => {
        // onReminderNotificationData();
    }, []);

    return (
        <>
           
            <div
                style={{
                    height: "90%",
                    width: "300px",
                    position: "fixed",
                    zIndex: "1",
                    top: "10%",
                    left: 30,
                    backgroundColor: "white",
                    overflow: "auto",
                    borderRadius: 5,
                    boxShadow: "-1px 1px 25px -1px lightgray",
                }}
            >
                <Collapse
                    ghost
                    bordered={false}
                    defaultActiveKey={["1", "2", "3"]}
                    items={[
                        {
                            key: "1",
                            label: <Space><ClusterOutlined />Your Workspace</Space>,
                            children: <FolderViewList activeKey={view == "library" ? true : false} onSearch={(param: DocumentationSearchByFolder) => setParamByFolder(param)} />
                        },
                        {
                            key: "3",
                            label: <Space><HistoryOutlined /> Quick Access</Space>,
                            children: <QuickAccess activeKey={view} />
                        },
                        {
                            key: "2",
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
                                    ]}
                                />
                            )
                        },
                    ]}
                />
                {access.canAccessDMSAdminMenu && (<div>
                    <Button
                        style={{
                            width: "100%",
                            bottom: 10,
                            position: "absolute"

                        }}
                        onClick={() => history.push(`${DMSPaths.setting}/department`)}
                    >Setting</Button>
                </div>)}
            </div>
            <div
                style={{
                    marginLeft: "300px",
                    padding: "10px"
                }}
            >
                {
                    view === "library" && (<DocumentListView paramSearch={paramByFolder} />) ||
                    view === "received-share" && (<RecievedShare />) ||
                    view === "favorite" && (<FavoriteView />) ||
                    view === "draft" && (<DraftListView />) ||
                    view === "reminder" && (<ReminderListView />)

                }
            </div>
        </>
    )
}

export default APPDMS


