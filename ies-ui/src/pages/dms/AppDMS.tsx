import { Button } from "antd"
import FolderViewList from "./components/FolderViewList";
import { useEffect, useState } from "react";
import DocumentListView from "./documentation/DocumentListView";
import { DMSPaths } from ".";
import RecievedShare from "./share/RecievedShare";
import { ShareAltOutlined, MenuFoldOutlined, SettingOutlined, BellOutlined, TeamOutlined, FileOutlined } from "@ant-design/icons";
import { DocumentationSearchByFolder } from "./documentation/data";
import { Access, history, useAccess, useParams } from "@umijs/max";
import TeamsViewList from "./setting/teams/TeamsViewList";
import { Tabs } from "antd/lib";
import ReminderListView from "./reminder/ReminderListView";

const APPDMS: React.FC = () => {
    const param = useParams();
    const access = useAccess();
    const view = param["view"];
    const [paramByFolder, setParamByFolder] = useState<DocumentationSearchByFolder>();
    const [sidbarState, setSidbarState] = useState<boolean>(false);
    const [folderId, setFolderId] = useState<number>();
    const [menuStyleState, setMenuStyleState] = useState<React.CSSProperties>(
        {
            height: "90%",
            width: "300px",
            position: "fixed",
            zIndex: "1",
            left: 30,
            backgroundColor: "white",
            overflow: "auto",
            borderRadius: 5,
            boxShadow: "-1px 1px 25px -1px lightgray",
            padding: 10
        }
    );
    // useEffect(() => {
    // }, []);
    const onTableSelectd = (e: string) => {
        if (e == "library") {
            history.push(`${DMSPaths.workspace}/${e}`);
        }
        else {
            history.push(`${DMSPaths.workspace}/${e}`);
            setFolderId(0);
        }
    }

    return (
        <>
            <div
                style={menuStyleState}
            >
                <FolderViewList activeKey={view == "library" ? true : false}
                    setFolder={setFolderId}
                    onSearch={(param: DocumentationSearchByFolder) => setParamByFolder(param)}
                    onFolderSelected={() => {
                        onTableSelectd("library")
                    }}
                />
            </div>
            <div
                style={
                    sidbarState ? { marginLeft: 0, transition: "all 0.5s" } :
                        {
                            marginLeft: "310px",
                            transition: "all 0.5s",
                        }}
            >
                <Tabs
                    activeKey={folderId ? "library" : view}
                    onChange={onTableSelectd}
                    type="line"
                    tabBarExtraContent={{
                        left: <Button style={{ marginRight: 30 }} type="link" onClick={(e) => {
                            if (sidbarState) {
                                setSidbarState(false)
                                setMenuStyleState((v) => ({ ...v, marginLeft: 0 }));
                            } else {
                                setSidbarState(true)
                                setMenuStyleState((v) => ({ ...v, marginLeft: -350, transition: "all 0.5s" }));
                            }
                        }} icon={<MenuFoldOutlined />} />,
                        right: <Access accessible={access.canAccessDMSAdminMenu}>
                            <Button icon={<SettingOutlined />} type="link" onClick={() => history.push(`${DMSPaths.setting}/department`)} />
                        </Access>
                    }}
                    items={[
                        {
                            key: "library",
                            label: "Docuemnts",
                            icon: <FileOutlined />,
                            children: <DocumentListView paramSearch={paramByFolder} libraryId={folderId || 0} folderId={paramByFolder?.folderId} />
                        },
                        {
                            key: "share",
                            label: "Shared",
                            icon: <ShareAltOutlined />,
                            children: <RecievedShare />
                        },
                        {
                            key: "reminder",
                            label: "Reminders",
                            icon: <BellOutlined />,
                            children: <ReminderListView />,
                        },
                        {
                            key: "team",
                            label: "Teams",
                            icon: <TeamOutlined />,
                            children: <TeamsViewList isCurrentUser={true} actionKey={view} />
                        },
                    ]}
                />
            </div>
        </>
    )
}

export default APPDMS


