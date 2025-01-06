import { Affix, Button, Divider, Flex, FloatButton, theme } from "antd"
import FolderViewList from "./components/FolderViewList";
import { useEffect, useState } from "react";
import { DMSPaths } from ".";
import { ShareAltOutlined, SettingOutlined, TeamOutlined } from "@ant-design/icons";
import { DocumentationAdvanceSearch, DocumentationSearchByFolder } from "./documentation/data";
import { Access, history, useAccess, useParams, useModel } from "@umijs/max";
import TeamsViewList from "./setting/teams/TeamsViewList";
import DocumentMainPage from "./documentation/MainPage";
import ShareListView from "./share/ShareListView";
import { PageContainer } from "@ant-design/pro-components";
import Setting from "./setting";

const APPDMS: React.FC = () => {
    const param = useParams();
    const access = useAccess();
    const view = param["view"];
    const [paramByFolder, setParamByFolder] = useState<DocumentationAdvanceSearch>();
    const [sidbarState, setSidbarState] = useState<boolean>(false);
    const { initialState, setInitialState } = useModel('@@initialState');


    const [menuStyleState, setMenuStyleState] = useState<React.CSSProperties>(
        {
            height: "100%",
            width: "300px",
            position: "fixed",
            zIndex: "1",
            backgroundColor: "white",
            overflow: "auto",
            left:30,
            borderRadius: 5,
            // border:"1px solid",
            boxShadow: "-1px 1px 5px -1px lightgray",
            padding: 10,
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            // marginBottom:40,
            // marginTop: view == undefined ? "30px" : "",
            scrollbarWidth: "thin",
            paddingBottom:50
        },
    );
    useEffect(() => {
    }, [paramByFolder])

    return (
        <>
            <div
                style={
                    initialState?.settings?.contentWidth == "Fluid" ? {
                        height: "100%",
                        width: "300px",
                        position: "fixed",
                        zIndex: "1",
                        backgroundColor: "white",
                        overflow: "auto",
                        marginLeft:20,
                        borderRadius: 5,
                        // boxShadow: "-1px 1px 5px -1px lightgray",
                        padding: 10,
                        display: "flex",
                        flexDirection: "column",
                        justifyContent: "space-between",
                        // marginTop: view == undefined ? "30px" : "",
                        scrollbarWidth: "thin",
                        paddingBottom:50
                    } : menuStyleState
                }
                onContextMenu={(e) => e.preventDefault()}
            >
                <FolderViewList activeKey={view == "library" ? true : false}
                    onSearch={(param: DocumentationSearchByFolder) => setParamByFolder({
                        ...param,
                        filterType: access.canAccessDMSAdminMenu ? "ADMIN" : "USER"
                    })}
                    onFolderSelected={() => {
                        history.push(`${DMSPaths.dms}`);
                    }}
                />
                    <div style={{ backgroundColor: "white" }}>
                        <Divider plain orientation="left">Other</Divider>

                        <Flex vertical gap={12} >
                            <Button icon={<ShareAltOutlined />} type={view == "share" ? "primary" : "default"} onClick={() => history.push(`${DMSPaths.dms}/share`)} >Shared</Button>
                            <Button icon={<TeamOutlined />} type={view == "team" ? "primary" : "default"} onClick={() => history.push(`${DMSPaths.dms}/team`)} >Team</Button>
                            <Access accessible={access.canAccessDMSAdminMenu}><Button icon={<SettingOutlined />} onClick={() => history.push(`${DMSPaths.setting}/department`)} >Setting</Button></Access>
                        </Flex>
                    </div>
            </div>
            <div
                // style={
                //     sidbarState ? { marginLeft: 0, transition: "all 0.5s" } :
                //         {
                //             marginLeft: "310px",
                //             transition: "all 0.5s",
                //         }}
                style={{
                    marginLeft:310
                }}
            >
               
                {
                    (view === "team" && <PageContainer   title={false}  > <TeamsViewList isCurrentUser={true} actionKey={view} /></PageContainer>) ||
                    (view === "share" &&<PageContainer   title={false}  >   <ShareListView actionKey={view} />  </PageContainer> ) ||
                    (view === "setting" &&<PageContainer   title={false}  >   <Setting  />  </PageContainer> ) ||
                    (view === undefined && paramByFolder && <DocumentMainPage paramSearch={paramByFolder} />)
                }
              
                <FloatButton.BackTop />
            </div>
        </>
    )
}

export default APPDMS


