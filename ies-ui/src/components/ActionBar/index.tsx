import { MoreOutlined } from "@ant-design/icons";
import { Button, Divider, Dropdown, Flex } from "antd";
import { MenuDividerType, MenuItemType } from "rc-menu/lib/interface";
import React from "react";

type MenuType = (Omit<MenuItemType, 'onClick' | 'itemIcon'> & { icon?: React.ReactNode, onClick?: () => void })

export type ActionBarType = (MenuType | MenuDividerType) & { visible?: boolean }

export default ({ actionButtons, actions, numOfActionOnBar }: {
    actionButtons?: React.ReactElement[],
    actions: ActionBarType[];
    numOfActionOnBar?: number
}) => {
    const shownList = actions.slice(0, numOfActionOnBar || 0) || []
    const moreList = actions?.slice(numOfActionOnBar || 0)
    return <Flex >
        {actionButtons}
        {(shownList.filter(it => (it as MenuDividerType).type != 'divider')).map(it => {

            const item = it as MenuType
            return < Button key={item.key} type="link" icon={item.icon} onClick={item.onClick} > {item.label}</Button>

        })}
        {
            moreList.length > 0 && <Dropdown menu={{
                items: moreList
            }}>
                <Button type="link" icon={<MoreOutlined />} />
            </Dropdown>
        }
    </Flex >
}