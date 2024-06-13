import {
    ActionType, PageContainer,
} from "@ant-design/pro-components"

import {
    DndContext,
    DragEndEvent,
    PointerSensor,
    useSensor
} from "@dnd-kit/core";

import {
    SortableContext, arrayMove,
    horizontalListSortingStrategy, useSortable
} from "@dnd-kit/sortable";

import {
    FloatButton,
    TabPaneProps,
} from "antd";
import React, { useEffect, useRef } from "react";
import { useState } from "react";
import { CSS } from '@dnd-kit/utilities';
import {
    FileAddOutlined,
    FileTextOutlined,
    UnorderedListOutlined
} from "@ant-design/icons";

import { SortOrder } from "antd/lib/table/interface";
import FilterBar from "./FilterBar";
import { ListViewProps, TabRenderProps, TableViewProps } from "./type";
import TableView from "./TableView";
import { uniqueId } from "lodash";

interface Props<ListDataType extends Record<string, any> & { id: number, code?: string }, FilterType extends Record<string, any>, ValueType> {
    onNewRender?: (key: string) => React.ReactNode;
    listView: TableViewProps<ListDataType, FilterType, ValueType> | ListViewProps<ListDataType, FilterType, ValueType>
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
        cursor: 'grab',
    };

    return React.cloneElement(props.children as React.ReactElement, {
        ref: setNodeRef,
        style,
        ...attributes,
        ...listeners,
    });
};

export default <ListDataType extends Record<string, any> & { id: number, code?: string }, FilterType
    extends Record<string, any> & { searchValue?: string; status?: string; subStatus?: string }, ValueType>({
        onNewRender,
        listView,
    }: Props<ListDataType, FilterType, ValueType>) => {
    const [forceReload, setForceReload] = useState(0)
    const actionRef = useRef<ActionType>()
    const [filterData, setFilterData] = useState<FilterType>()
    const [tableInfo, setTableInfo] = useState<{
        pageSize?: number;
        current?: number;
        sort: Record<string, SortOrder>
    }>()
    const [tabList, setTabList] = useState<(TabPaneProps & {
        key?: React.Key;
        data?: ListDataType
    })[]>([])

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

    const newTab = (props?: TabRenderProps) => {
        const gKey = `default-${uniqueId("add")}`
        setTabList(v => [...v, props ? {
            tab: props.tabLabel || "new",
            key: gKey,
            icon: props.tabIcon || <FileAddOutlined />,
            children: props.panel(() => { removeTab(gKey) }, gKey,)
        } : {
            tab: "new",
            key: gKey,
            icon: <FileAddOutlined />,
            children: onNewRender?.(gKey)
        }])
        setActiveKey({ key: gKey })
    }

    const addTab = (item: ListDataType, props?: TabRenderProps, key?: React.Key) => {
        const gKey = `${key?.toString() || 'default'}-${item.id}`
        if (tabList.some(it => it.key == gKey)) {
            setActiveKey({ key: gKey, item: item })
        } else {
            setTabList(v => [...v, {
                tab: props?.tabLabel || item.code,
                key: gKey,
                icon: props?.tabIcon || <FileTextOutlined />,
                children: props?.panel(() => { removeTab(gKey) }, gKey)
            }])
            setActiveKey({ key: gKey, item: item })
        }
    }

    const removeTab = (key: string) => {
        setTabList(v => v.filter(it => it.key != key))
        setActiveKey({ key: 'list' })
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

    useEffect(() => {
        setTabList([{
            tab: listView.title || "List",
            key: 'list',
            tabKey: 'list',
            closable: false,

            icon: <UnorderedListOutlined />,
            children: <FilterBar
                onStatusRender={listView.onStatusRender}
                statuses={listView.statuses || []}
                actionButtons={listView.actionButtons}
                actions={listView.actions}
                advanceSearchButton={listView.advanceSearchButton}
                onRefresh={listView.onRefresh}
                onAddTab={newTab}
                onSearch={keyworkds => {
                    setFilterData(v => ({ ...v, searchValue: keyworkds }) as any)
                    reloadList(true)
                }}
                onStatusChanged={status => {
                    setFilterData(v => ({ ...v, status: status }) as any)
                    reloadList(true)
                }}
                onSubStatusChanged={value => {
                    setFilterData(v => ({ ...v, subStatus: value }) as any)
                    reloadList(true)
                }}
                onOpenAdvanceSearch={listView.onOpenAdvanceSearch} />
        }])
    }, [])
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
            hideAdd: !onNewRender,

            onChange(activeKey) {
                setActiveKey({ key: activeKey, item: tabList.find(it => it.key == activeKey)?.data })
            },
            onEdit: (e, action) => {
                if (action == 'remove') {
                    removeTab(e.toString())
                } else {
                    newTab()
                }
            },
        }} tabList={tabList}>

        {activeKey.key == 'list' && listView.type == 'Table' && <>
            {listView.onExtraFilterRender?.(filterData)}
            <TableView listView={{
                ...listView, props: {
                    ...listView.props,
                    actionRef: listView.props.actionRef || actionRef,
                    request: async (params, sort) => {
                        setTableInfo({ ...params, current: params.current, pageSize: params.pageSize, sort })
                        setForceReload(v => v + 1)
                        return []
                    }
                }
            }} onAddTab={addTab} /> </>}

        <FloatButton.BackTop />
    </PageContainer>
}