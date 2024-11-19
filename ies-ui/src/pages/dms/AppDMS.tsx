import { Affix, Button, Divider, Flex } from "antd"
import FolderViewList from "./components/FolderViewList";
import { useEffect, useState } from "react";
import { DMSPaths } from ".";
import { ShareAltOutlined, SettingOutlined, TeamOutlined } from "@ant-design/icons";
import { DocumentationAdvanceSearch, DocumentationSearchByFolder } from "./documentation/data";
import { Access, history, useAccess, useParams } from "@umijs/max";
import TeamsViewList from "./setting/teams/TeamsViewList";
import DocumentMainPage from "./documentation/MainPage";
import ShareListView from "./share/ShareListView";

const APPDMS: React.FC = () => {
    const param = useParams();
    const access = useAccess();
    const view = param["view"];
    const [paramByFolder, setParamByFolder] = useState<DocumentationAdvanceSearch>();
    const [sidbarState, setSidbarState] = useState<boolean>(false);
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
            padding: 10,
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            marginTop: view == undefined ? "30px" : "",
            scrollbarWidth: "thin",
        },
    );
    useEffect(() => {

    }, [paramByFolder])

    return (
        <>
            <div
                style={menuStyleState}
                onContextMenu={(e)=>e.preventDefault()}
            >
                <FolderViewList activeKey={view == "library" ? true : false}
                    onSearch={(param: DocumentationSearchByFolder) => setParamByFolder(param)}
                    onFolderSelected={() => {
                        history.push(`${DMSPaths.dms}`);
                    }}
                />
                <Affix   >
                    <div style={{ backgroundColor: "white" }}>
                        <Divider plain orientation="left">Other</Divider>

                        <Flex vertical gap={12} >
                            <Button icon={<ShareAltOutlined />} type={view == "share" ? "primary" : "default"} onClick={() => history.push(`${DMSPaths.dms}/share`)} >Shared</Button>
                            <Button icon={<TeamOutlined />} type={view == "team" ? "primary" : "default"} onClick={() => history.push(`${DMSPaths.dms}/team`)} >Team</Button>
                            <Access accessible={access.canAccessDMSAdminMenu}><Button icon={<SettingOutlined />} onClick={() => history.push(`${DMSPaths.setting}/department`)} >Setting</Button></Access>
                        </Flex>
                    </div>
                </Affix>
            </div>
            <div
                style={
                    sidbarState ? { marginLeft: 0, transition: "all 0.5s" } :
                        {
                            marginLeft: "310px",
                            transition: "all 0.5s",
                            marginTop: view == undefined ? "10px" : ""
                        }}
            >
                {
                    (view === "team" && <TeamsViewList isCurrentUser={true} actionKey={view} />) ||
                    (view === "share" && <ShareListView actionKey={view} />) ||
                    (view === undefined && <DocumentMainPage paramSearch={paramByFolder} />)
                }

            </div>
        </>
    )
}

export default APPDMS


