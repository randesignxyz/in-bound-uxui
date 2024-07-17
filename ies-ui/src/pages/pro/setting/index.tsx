import { Flex, Menu, MenuProps, theme } from "antd"
import { useState } from "react";
import Sider from "antd/es/layout/Sider";
import { Content } from "antd/lib/layout/layout";

type MenuItem = Required<MenuProps>['items'][number];
const items: MenuItem[] = [
    {
        label: "Purchase Requisition",
        type: 'group',
        children: [
            { label: "Item", key: "pr-item" }
        ]
    },
    {
        label: "Purchase Order",
        type: 'group',
        children: [
            { label: "Setting", key: "po-setting" }
        ]
    }
]
export default () => {

    const [setting, setSetting] = useState<string>()

    const {
        token: { colorBgContainer },
    } = theme.useToken();

    const onClick: MenuProps['onClick'] = (e) => {
        setSetting(e.key)
    };

    return <Flex>
        <Sider style={{ background: colorBgContainer, height: '88vh' }} width={250} >
            <Menu
                mode="inline"
                onClick={onClick}
                items={items}
            />
        </Sider>
        <Content style={{ padding: '0 24px', minHeight: 280 }}>{setting}</Content>
    </Flex>

}