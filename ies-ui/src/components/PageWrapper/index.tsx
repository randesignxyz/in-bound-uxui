import { ActionType, PageContainer, ParamsType, ProCard, ProColumns, ProForm, ProFormSelect, ProTable, ProTableProps, QueryFilter } from "@ant-design/pro-components"
import { DndContext, DragEndEvent, PointerSensor, useSensor } from "@dnd-kit/core";
import { SortableContext, arrayMove, horizontalListSortingStrategy, useSortable } from "@dnd-kit/sortable";
import { Button, Card, Dropdown, Flex, FloatButton, Input, MenuItemProps, Radio, Segmented, Space, TabPaneProps, TablePaginationConfig, Typography, message } from "antd";
import React, { useEffect, useRef } from "react";
import { useState } from "react";
import { CSS } from '@dnd-kit/utilities';
import { ExportOutlined, EyeFilled, MoreOutlined, ReloadOutlined, UnorderedListOutlined } from "@ant-design/icons";
import { MenuItemType } from "rc-menu/lib/interface";
import { SortOrder } from "antd/lib/table/interface";
import { SegmentedLabeledOption, SegmentedOptions } from "antd/es/segmented";

interface Props<ListDataType extends Record<string, any>, FilterType extends Record<string, any>, ValueType> {
    title?: string;
    listView: ({
        type: "Table"
        props: ProTableProps<ListDataType, ParamsType, ValueType> & {
            quickView?: boolean
            fullView?: boolean
            primaryCol?: ProColumns<ListDataType, ValueType>
        }
    } | {
        type: "List",
    }) & {
        statuses?: { option: SegmentedLabeledOption, subOptions: SegmentedOptions[] }[]
        actionNumShown?: number;
        actions?: (Omit<MenuItemType, 'onClick' | 'itemIcon'> & { icon?: React.ReactNode, onClick?: () => void })[];
        onFilter?: (filter?: FilterType, page?: {
            pageSize?: number;
            current?: number;
        }, sort?: Record<string, SortOrder>) => void;
        onRefresh?: () => void;
    }

    detailViewRender?: (item: ListDataType) => React.ReactNode,

}

interface DraggableTabPaneProps extends React.HTMLAttributes<HTMLDivElement> {
    'data-node-key': string;
}

const DraggableTabNode = ({ className, ...props }: DraggableTabPaneProps) => {
    const { attributes, listeners, setNodeRef, transform, transition } = useSortable({
        id: props['data-node-key'],
    });

    const style: React.CSSProperties = {
        ...props.style,
        transform: CSS.Translate.toString(transform),
        transition,
        cursor: 'move',
    };

    return React.cloneElement(props.children as React.ReactElement, {
        ref: setNodeRef,
        style,
        ...attributes,
        ...listeners,
    });
};


export default <ListDataType extends Record<string, any> & { id: number, code?: string }, FilterType extends Record<string, any> & { searchValue?: string; status?: string; }, ValueType>({
    listView,
    detailViewRender,

}: Props<ListDataType, FilterType, ValueType>) => {

    const [forceReload, setForceReload] = useState(0)
    const actionRef = useRef<ActionType>()
    const [filterData, setFilterData] = useState<FilterType>()
    const [tableInfo, setTableInfo] = useState<{
        pageSize?: number;
        current?: number;
        sort: Record<string, SortOrder>
    }>()

    const actionRender = () => {
        const shownList = listView.actions?.slice(0, listView.actionNumShown || 3) || []
        const moreList = listView.actions?.slice(listView.actionNumShown || 3)
        return <Flex flex={1} justify="flex-end">
            {(shownList).map(it => <Button key={it.key} type="link" icon={it.icon} onClick={it.onClick}>{it.label}</Button>)}
            {moreList && <Dropdown menu={{
                items: moreList.map(it => ({
                    key: it.key,
                    label: it.label,
                    icon: it.icon,
                    onClick: it.onClick
                }))
            }}>
                <Button type="link" icon={<MoreOutlined />} />
            </Dropdown>}
            <Button type="link" onClick={listView.onRefresh} icon={<ReloadOutlined />} />
        </Flex>
    }
    const filterBar = <ProCard size="small">
        <Flex>
            <Flex> <Input.Search onSearch={value => {
                setFilterData(v => ({ ...v, searchValue: value }) as any)
                actionRef.current?.reload(true)
            }} /></Flex>
            <Flex>

                {listView.statuses && <Segmented onChange={(value) => {
                    setFilterData(v => ({ ...v, status: value }) as any)
                    actionRef.current?.reload(true)
                }} options={listView.statuses.map(it =>
                    it.option
                )} />}

            </Flex>
            {actionRender()}
        </Flex>
    </ProCard>

    const [tabList, setTabList] = useState<(TabPaneProps & {
        key?: React.Key;
        data?: ListDataType
    })[]>([
        {
            tab: "List", key: 'list', tabKey: 'list', closable: false,
            icon: <UnorderedListOutlined />,
            children: filterBar
        }
    ])
    const [activeKey, setActiveKey] = useState<{ key: string, item?: ListDataType }>({ key: 'list' })

    const sensor = useSensor(PointerSensor, { activationConstraint: { distance: 10 } });

    const onDragEnd = ({ active, over }: DragEndEvent) => {
        if (active.id !== over?.id) {
            setTabList((prev) => {
                const activeIndex = prev.findIndex((i) => i.key === active.id);
                const overIndex = prev.findIndex((i) => i.key === over?.id);
                return arrayMove(prev, activeIndex, overIndex);
            });
        }
    };

    const viewActionCols: ProColumns<ListDataType, ValueType>[] = listView.type == 'Table' && (listView.props.quickView || listView.props.fullView) ? [
        {
            width: 30,
            render: (_, r) => <Space>
                {listView.props.quickView && <Button type="link" size="small" icon={<EyeFilled />} />}
                {listView.props.fullView && <Button type="link" size="small" icon={<ExportOutlined />} />}
            </Space>,
        }
    ] : []

    const primaryCols: ProColumns<ListDataType, ValueType>[] = listView.type == 'Table' && listView.props.primaryCol ? [{
        ...listView.props.primaryCol,
        render: (dom, entity, index, action, schema) => listView.props.primaryCol?.render?.(dom, entity, index, action, schema) || <Flex>
            <Typography.Link copyable onClick={() => {
                if (tabList.some(it => it.key == entity.code)) {
                    entity.code && setActiveKey({ key: entity.code, item: entity })
                } else {
                    setTabList(v => [...v, {
                        tab: entity.code,
                        key: entity.code,
                        children: detailViewRender?.(entity)
                    }])
                    entity.code && setActiveKey({ key: entity.code, item: entity })
                }
            }}> {entity.code} </Typography.Link>

        </Flex>
    }] : []


    useEffect(() => {
        listView.onFilter?.(filterData, { pageSize: tableInfo?.pageSize, current: tableInfo?.current }, tableInfo?.sort)
        console.log('Refresh');
    }, [forceReload])

    return (
        <PageContainer title={false}
            tabProps={{
                type: 'editable-card',
                defaultActiveKey: 'list',
                activeKey: activeKey.key,
                renderTabBar: (tabBarProps, DefaultTabBar) => (
                    <DndContext sensors={[sensor]} onDragEnd={onDragEnd}>
                        <SortableContext items={tabList.map((i) => i.key as string)} strategy={horizontalListSortingStrategy}>
                            <DefaultTabBar {...tabBarProps}>
                                {(node) => (
                                    <DraggableTabNode {...node.props} key={node.key}>
                                        {node}
                                    </DraggableTabNode>
                                )}
                            </DefaultTabBar>
                        </SortableContext>
                    </DndContext>
                ),
                hideAdd: true,
                onChange(activeKey) {
                    setActiveKey({ key: activeKey, item: tabList.find(it => it.key == activeKey)?.data })
                },
                onEdit: (e, action) => {
                    if (action == 'remove') {
                        setTabList(v => v.filter(it => it.key != e.toString()))
                        setActiveKey({ key: 'list' })
                    }
                },
            }} tabList={tabList}>
            {activeKey.key == 'list' && listView.type == 'Table' && <ProTable<ListDataType, ParamsType, ValueType>
                size="small"
                manualRequest={true}

                {...listView.props}
                request={async (params, sort) => {
                    setTableInfo({ ...params, current: (params.current || 1) - 1, sort })
                    setForceReload(v => v + 1)
                    return []
                }
                }
                actionRef={actionRef}
                rowKey={listView.props.rowKey || 'id'}
                columns={[...viewActionCols, ...primaryCols, ...(listView.props.columns || [])]}
                search={false}
                options={false}
            />}

            <FloatButton.BackTop />
        </PageContainer>
    )
}