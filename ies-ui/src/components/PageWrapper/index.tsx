import {
    ActionType, PageContainer, ParamsType, ProCard,
    ProColumns, ProListProps, ProTable, ProTableProps
} from "@ant-design/pro-components"
import { DndContext, DragEndEvent, PointerSensor, useSensor } from "@dnd-kit/core";
import {
    SortableContext, arrayMove,
    horizontalListSortingStrategy, useSortable
} from "@dnd-kit/sortable";
import {
    Alert, Button, Flex,
    FloatButton, Input,
    Segmented,
    TabPaneProps, Typography
} from "antd";
import React, { useEffect, useRef } from "react";
import { useState } from "react";
import { CSS } from '@dnd-kit/utilities';
import {
    ExportOutlined, FileSearchOutlined,
    FileTextOutlined, ReloadOutlined, UnorderedListOutlined
} from "@ant-design/icons";
import { MenuItemType } from "rc-menu/lib/interface";
import { SortOrder } from "antd/lib/table/interface";
import { SegmentedLabeledOption, SegmentedOptions } from "antd/es/segmented";
import { useParams } from "@umijs/max";
import { ViewType } from "../DataCrud/CrudWrapper";
import ActionBar from "../ActionBar";

type TabRenderProps = {
    value?: React.ReactNode;
    onOpenIconClick?: () => void;
    tabLabel: React.ReactNode;
    tabIcon?: React.ReactNode;
    panel: React.ReactNode;
}

interface Props<ListDataType extends Record<string, any>, FilterType extends Record<string, any>, ValueType> {
    title?: string;
    detailViewRender?: (id: number, target: 'page-tab' | 'browser-tab', item?: ListDataType, key?: React.Key) => React.ReactNode;
    listView: ({
        type: "Table"
        props: Omit<ProTableProps<ListDataType, ParamsType, ValueType>, 'columns'> & {
            quickView?: boolean
            columns: (ProColumns<ListDataType, ValueType> & { tabRender?: (item: ListDataType) => TabRenderProps })[];
            fullView?: {
                onOpen: (item: ListDataType) => void
            }

            primaryCol?: ProColumns<ListDataType, ValueType>
        }
    } | {
        type: "List",
        props: Omit<ProListProps<ListDataType, ParamsType, ValueType>, 'columns'> & { columns: string[] }
    }) & {
        onColumnLinkRender?: (id: number, target: 'page-tab' | 'browser-tab', item?: ListDataType, key?: React.Key) => {
            value?: React.ReactNode,
            tabLabel: React.ReactNode,
            tabIcon?: React.ReactNode,
            panel: React.ReactNode
        };
        statuses?: { option: SegmentedLabeledOption, subOptions?: SegmentedOptions[] }[]
        actionButtons?: React.ReactElement[],
        actionNumShown?: number;
        actions?: (Omit<MenuItemType, 'onClick' | 'itemIcon'> & { icon?: React.ReactNode, onClick?: () => void })[];
        onFilter?: (filter?: FilterType, page?: {
            pageSize?: number;
            current?: number;
        }, sort?: Record<string, SortOrder>) => void;
        advanceSearchButton?: React.ReactElement;
        onOpenAdvanceSearch?: () => void;
        onRefresh?: () => void;
    };
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


export default <ListDataType extends Record<string, any> & { id: number, code?: string }, FilterType
    extends Record<string, any> & { searchValue?: string; status?: string; }, ValueType>({
        listView,
        detailViewRender,
    }: Props<ListDataType, FilterType, ValueType>) => {

    const params = useParams()
    const view: ViewType = (params['view'] as ViewType) || undefined
    const id = params['*']
    const [forceReload, setForceReload] = useState(0)
    const actionRef = useRef<ActionType>()
    const [filterData, setFilterData] = useState<FilterType>()
    const [tableInfo, setTableInfo] = useState<{
        pageSize?: number;
        current?: number;
        sort: Record<string, SortOrder>
    }>()

    const filterBar = <ProCard size="small">
        <Flex >
            <Flex>
                <Flex>
                    <Input.Search onSearch={value => {
                        setFilterData(v => ({ ...v, searchValue: value }) as any)
                        reloadList(true)
                    }} />
                </Flex>
                {listView.onOpenAdvanceSearch && <Flex>
                    {listView.advanceSearchButton || <Button icon={<FileSearchOutlined />} onClick={listView.onOpenAdvanceSearch} />}
                </Flex>}
                <Flex style={{ marginLeft: 20 }}>

                    {listView.statuses && <Segmented onChange={(value) => {
                        setFilterData(v => ({ ...v, status: value }) as any)
                        reloadList(true)
                    }} options={listView.statuses.map(it =>
                        it.option
                    )} />}

                </Flex>
            </Flex>
            <Flex flex={1} justify="flex-end">
                <ActionBar actionButtons={listView.actionButtons} actions={listView.actions || []} numOfActionOnBar={3} />
                <Button type="link" onClick={listView.onRefresh} icon={<ReloadOutlined />} />
            </Flex>
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

    const addTab = (item: ListDataType, props?: TabRenderProps, key?: React.Key) => {

        const gKey = `${key?.toString() || 'default'}-${item.id}`
        if (tabList.some(it => it.key == gKey)) {
            setActiveKey({ key: gKey, item: item })
        } else {
            setTabList(v => [...v, {
                tab: props?.tabLabel || item.code,
                key: gKey,
                icon: props?.tabIcon || <FileTextOutlined />,
                children: props?.panel
            }])
            setActiveKey({ key: gKey, item: item })
        }

    }
    useEffect(() => {
        listView.onFilter?.(filterData, { pageSize: tableInfo?.pageSize, current: tableInfo?.current }, tableInfo?.sort)
    }, [forceReload])

    const reloadList = (resetPageIndex?: boolean | undefined) => {
        if (listView.props.actionRef) {
            (listView.props.actionRef as any).current?.reload(resetPageIndex);
            return
        }
        actionRef.current?.reload(resetPageIndex);

    }
    if (view == 'list') {
        return <PageContainer title={false}
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
            {activeKey.key == 'list' && listView.type == 'Table' &&
                <ProTable<ListDataType, ParamsType, ValueType>
                    size="small"
                    manualRequest={true}
                    actionRef={actionRef}
                    {...listView.props}
                    request={async (params, sort) => {
                        setTableInfo({ ...params, current: params.current, pageSize: params.pageSize, sort })
                        setForceReload(v => v + 1)
                        return []
                    }}

                    rowKey={listView.props.rowKey || 'id'}
                    columns={listView.props.columns?.map(it => {
                        return {
                            ...it, render: it.tabRender ? (_: any, r: ListDataType) => {
                                const render = it.tabRender?.(r)
                                const valComp = <Typography.Link onClick={() => addTab(r, render, it.key)}>{render?.value}</Typography.Link>
                                if (render?.onOpenIconClick) {
                                    return <Flex>
                                        <Button type="link" size="small" onClick={render?.onOpenIconClick} icon={<ExportOutlined />} />
                                        {valComp}
                                    </Flex>
                                }
                                return valComp
                            } : it.render
                        }
                    })}
                    search={false}
                    options={false}
                />}

            <FloatButton.BackTop />
        </PageContainer>
    }

    if (view == 'detail') {
        return detailViewRender?.(id as unknown as number, 'browser-tab')
    }
    return <Alert type="error" message="Not supported." />
}