import { FormOutlined, HeartOutlined } from "@ant-design/icons"
import { history } from "@umijs/max"
import { Menu } from "antd"
import { DMSPaths } from "..";
interface Props{
    activeKey?:string;
}
export default ({activeKey }:Props) => {
    return (<>
        <Menu
            selectedKeys={[activeKey||""]}
            style={{
                marginTop:-15
            }}
            items={[
                {
                    key: "draft",
                    label: "Drafted",
                    icon:<FormOutlined/>,
                    onClick: () => history.push(`${DMSPaths.workspace}/draft`)
                },
                {
                    key: "favorite",
                    label: "Favorites",
                    icon:<HeartOutlined/>,
                    onClick: () => history.push(`${DMSPaths.workspace}/favorite`)
                },
            ]}
        >
        </Menu>
    </>)
}