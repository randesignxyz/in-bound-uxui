import { MoreOutlined } from "@ant-design/icons";
import { Button, ButtonProps, Divider, Dropdown, Flex, Space } from "antd";
import { MenuDividerType, MenuItemType } from "rc-menu/lib/interface";
import React from "react";
import { isReactNode } from "@/pages/utils";
import { omit } from "lodash";

type MenuType = (Omit<MenuItemType, 'onClick' | 'itemIcon'> & { icon?: React.ReactNode, onClick?: () => void })

export type ActionBarType = (MenuType | MenuDividerType) & { visible?: boolean }

export default ({ actionButtons, actions, onAddTab, numOfActionOnBar }: {
    actionButtons?: (React.ReactNode | (ButtonProps & {
        key?: React.Key;
        addNewTab?: true;
        tooltip?: string;

    }))[],
    onAddTab?: () => void;
    actions: ActionBarType[];
    numOfActionOnBar?: number
}) => {
    const shownList = actions.slice(0, numOfActionOnBar || 0) || []
    const moreList = actions?.slice(numOfActionOnBar || 0)
    return <Flex  >
        {actionButtons?.map((it, index) => {
            if (isReactNode(it)) {
                return it
            } else {
                return !it.addNewTab ? <Button  {...(omit(it, 'addNewTab'))} key={`action-bar-${index}`} /> : <Button  {...(omit(it, 'addNewTab'))} key={`action-bar-${index}`}
                    onClick={() => it.addNewTab && onAddTab?.()}
                />
            }
        })}

        {
            (shownList.filter((it) => (it as MenuDividerType).type != 'divider')).map((it, index) => {
                const item = it as MenuType
                return < Button key={`bt-${index}`} type="link" icon={item.icon} onClick={item.onClick} > {item.label}</Button>

            })
        }

        {
            moreList.length > 0 && <Dropdown menu={{
                items: moreList
            }}>
                <Button type="link" icon={<MoreOutlined />} />
            </Dropdown>
        }
    </Flex >
}