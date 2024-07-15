import { GridContent, ProCard } from "@ant-design/pro-components";
import { Flex, Layout, Menu, MenuProps, theme } from "antd"
import { useState } from "react";
import styles from './styles.less';
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
    }
]
export default () => {

    const [setting, setSetting] = useState<string>()

    const {
        token: { colorBgContainer, borderRadiusLG },
    } = theme.useToken();

    const onClick: MenuProps['onClick'] = (e) => {
        setSetting(e.key)
        console.log('click ', e);
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