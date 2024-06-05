import { FileSearchOutlined, ReloadOutlined } from "@ant-design/icons"
import { ProCard } from "@ant-design/pro-components"
import { Button, Flex, Input, Segmented } from "antd"
import { SegmentedLabeledOption } from "antd/lib/segmented"
import { useState } from "react"
import ActionBar from "../ActionBar"
import { MenuItemType } from "antd/lib/menu/hooks/useItems"

export default ({ statuses, actionButtons, actions, advanceSearchButton, onOpenAdvanceSearch, onRefresh, onSearch, onStatusChanged }: {
    statuses: { option: SegmentedLabeledOption & { default?: true }, subOptions?: (SegmentedLabeledOption & { default?: true })[] }[],
    advanceSearchButton?: React.ReactElement;
    actionButtons?: React.ReactElement[],
    actions?: (Omit<MenuItemType, 'onClick' | 'itemIcon'> & { icon?: React.ReactNode, onClick?: () => void })[];
    onSearch?: (keywords?: string) => void;
    onStatusChanged?: (status?: string) => void;
    onOpenAdvanceSearch?: () => void;
    onRefresh?: () => void;

}) => {
    const [subStatuses, setSubStatuses] = useState<(SegmentedLabeledOption & { default?: true })[]>(statuses.find(it => it.option.default)?.subOptions || [])

    return <ProCard size="small">
        <Flex >
            <Flex>
                <Flex>
                    <Input.Search onSearch={onSearch} />
                </Flex>
                {(onOpenAdvanceSearch || advanceSearchButton) && <Flex>
                    {advanceSearchButton || <Button icon={<FileSearchOutlined />} onClick={onOpenAdvanceSearch} />}
                </Flex>}
                <Flex style={{ marginLeft: 20 }}>

                    {statuses && <Segmented defaultValue={statuses.find(it => it.option.default)?.option.value} onChange={(value) => {
                        onStatusChanged?.(value as string)
                        setSubStatuses(statuses.find(it => it.option.value == value)?.subOptions || [])
                    }} options={statuses.map(it =>
                        it.option
                    )} />}

                </Flex>
                {subStatuses.length > 0 ? <Flex style={{ marginLeft: 20 }}>
                    <Segmented options={subStatuses} />
                </Flex> : <></>}
            </Flex>
            <Flex flex={1} justify="flex-end">
                <ActionBar actionButtons={actionButtons} actions={actions || []} numOfActionOnBar={3} />
                <Button type="link" onClick={onRefresh} icon={<ReloadOutlined />} />
            </Flex>
        </Flex>

    </ProCard>
}