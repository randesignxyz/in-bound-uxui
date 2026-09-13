import { FileSearchOutlined, ReloadOutlined } from "@ant-design/icons"
import { ProCard } from "@ant-design/pro-components"
import { Button, ButtonProps, Flex, Input, Segmented } from "antd"
import { SegmentedLabeledOption } from "antd/lib/segmented"
import { useEffect, useState } from "react"
import ActionBar from "../ActionBar"
import { MenuItemType } from "antd/lib/menu/interface"
// import { MenuItemType } from "antd/lib/menu/hooks/useItems"

export default ({
    statuses,
    actionButtons,
    onAddTab,
    actions,
    advanceSearchButton,
    onStatusRender,
    onOpenAdvanceSearch,
    onRefresh, onSearch,
    onStatusChanged,
    onSubStatusChanged,
    onSubStatus2Changed
}: {
    onStatusRender?: React.ReactNode,
    onAddTab?: () => void;
    statuses: { option: SegmentedLabeledOption & { default?: true }, subOptions?: (SegmentedLabeledOption & { default?: true } & { subOptions?: (SegmentedLabeledOption & { default?: true })[] })[] }[],
    advanceSearchButton?: React.ReactElement;
    actionButtons?: (React.ReactNode | (ButtonProps & {
        key?: React.Key;
        tooltip?: string;

    }))[],
    actions?: (Omit<MenuItemType, 'onClick' | 'itemIcon'> & { icon?: React.ReactNode, onClick?: () => void })[];
    onSearch?: (keywords?: string) => void;
    onStatusChanged?: (status: string | number) => void;
    onSubStatusChanged?: (status?: string | number) => void;
    onSubStatus2Changed?: (status?: string | number) => void;
    onOpenAdvanceSearch?: () => void;
    onRefresh?: () => void;

}) => {
    const [subStatuses, setSubStatuses] = useState<(SegmentedLabeledOption & { default?: true })[]>(statuses.find(it => it.option.default)?.subOptions || [])
    const [subStatuses2, setSubStatuses2] = useState<(SegmentedLabeledOption & { default?: true })[]>([])

    const [subStatusValue, setSubStatusValue] = useState<string | number>()
    const [subStatusValue2, setSubStatusValue2] = useState<string | number>()



    useEffect(() => {
        setSubStatusValue(statuses.find(it => it.option.default)?.subOptions?.find(it => it.default)?.value)
    }, [])

    return <ProCard size="small">
        <Flex >
            <Flex>
                <Flex >
                    {onSearch && <Input.Search allowClear onSearch={onSearch} />}

                </Flex>
                {(onOpenAdvanceSearch || advanceSearchButton) && <Flex>
                    {advanceSearchButton || <Button icon={<FileSearchOutlined />} onClick={onOpenAdvanceSearch} />}
                </Flex>}
                <Flex style={{ marginLeft: 20 }}>

                    {
                        statuses && !onStatusRender ?
                            <Segmented defaultValue={statuses.find(it => it.option.default)?.option.value} onChange={(value) => {
                                onStatusChanged?.(value)
                                const sub = statuses.find(it => it.option.value == value)?.subOptions || []
                                setSubStatusValue(sub.find(it => it.default)?.value)
                                onSubStatusChanged?.(sub.find(it => it.default)?.value)
                                setSubStatuses(v => sub)
                                // subStatus2
                                setSubStatuses2([])
                                setSubStatusValue2(undefined)
                                onSubStatus2Changed?.(undefined)
                            }} options={statuses.map(it =>
                                it.option
                            )} /> : onStatusRender

                    }
                </Flex>
                {subStatuses.length > 0 && !onStatusRender ? <Flex style={{ marginLeft: 20 }}>
                    <Segmented
                        options={subStatuses}
                        onChange={(value) => {
                            setSubStatusValue(value)
                            onSubStatusChanged?.(value)
                            // subStatus2
                            const subStatus2 = statuses.find(it => it.subOptions)?.subOptions?.find(it => it.value == value)?.subOptions
                            setSubStatuses2(subStatus2 || [])
                            console.log(value, subStatus2)
                            setSubStatusValue2(subStatus2?.find(it => it.default)?.value)
                            onSubStatus2Changed?.(subStatus2?.find(it => it.default)?.value)
                        }}
                        value={subStatusValue}
                        defaultValue={subStatuses.find(it => it.default)?.value || subStatuses.find(it => it)?.value}
                    />
                </Flex> : <></>}
                {subStatuses2.length > 0 && !onStatusRender ? <Flex style={{ marginLeft: 20 }}>
                    <Segmented
                        options={subStatuses2}
                        onChange={(value) => {
                            setSubStatusValue2(value)
                            onSubStatus2Changed?.(value)
                        }}
                        value={subStatusValue2}
                        defaultValue={subStatuses2.find(it => it.default)?.value || subStatuses2.find(it => it)?.value}
                    />
                </Flex> : <></>}
            </Flex>
            <Flex flex={1} justify="flex-end">
                <ActionBar actionButtons={actionButtons}
                    onAddTab={onAddTab}
                    actions={actions || []} numOfActionOnBar={3} />
                <Button type="link" onClick={onRefresh} icon={<ReloadOutlined />} />
            </Flex>
        </Flex>

    </ProCard >
}
