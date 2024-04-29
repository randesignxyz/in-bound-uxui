import { Button, Segmented } from "antd"
import FolderViewList from "./components/FolderViewList";
import { useEffect, useState } from "react";
import DocumentListView from "./documentation/DocumentListView";
import { DMSPaths } from ".";
import RecievedShare from "./share/RecievedShare";
import FavoriteView from "./favorite/FavoriteView";
import { ShareAltOutlined, MenuFoldOutlined, FolderOutlined, SettingOutlined, BellOutlined, TeamOutlined } from "@ant-design/icons";
import ReminderListView from "./reminder/ReminderListView";
import { DocumentationSearchByFolder } from "./documentation/data";
import { Access, history, useAccess, useParams } from "@umijs/max";
import TeamsViewList from "./setting/teams/TeamsViewList";

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
            // top: "10%",
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
            <div
                style={menuStyleState}
            >
                <FolderViewList activeKey={view == "library" ? true : false}
                    setLibrary={setLibraryId}
                    onSearch={(param: DocumentationSearchByFolder) => setParamByFolder(param)} />
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
                        accessKey={view}
                        options={[
                            {
                                value: "library",
                                label: "Document",
                                icon: <FolderOutlined />,
                            },
                            {
                                value: "share",
                                label:"Shared",
                                icon: <ShareAltOutlined />,
                            },
                            {
                                value: "reminder",
                                label:"Reminders",
                                icon: <BellOutlined />,
                            },
                            {
                                value: "team",
                                label: "Teams",
                                icon: <TeamOutlined />
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
                    view === "library" && (<DocumentListView paramSearch={paramByFolder} libraryId={libraryId || 0} />) ||
                    view === "share" && (<RecievedShare  />) ||
                    view === "favorite" && (<FavoriteView />) ||
                    // view === "contract" && (<ContractListView />) ||
                    view === "reminder" && (<ReminderListView />) ||
                    view === "team" && (<TeamsViewList isCurrentUser={true} actionKey={view} />)
                }
            </div>
        </>
    )
}

export default APPDMS


