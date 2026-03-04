import {
    ActionType,
    PageContainer,
} from "@ant-design/pro-components";

import {
    DndContext,
    DragEndEvent,
    PointerSensor,
    useSensor,
} from "@dnd-kit/core";

import {
    SortableContext,
    arrayMove,
    horizontalListSortingStrategy,
    useSortable,
} from "@dnd-kit/sortable";

import { FloatButton, TabPaneProps, Dropdown, Button, Badge } from "antd";
import React, { useEffect, useRef, useState } from "react";
import { CSS } from "@dnd-kit/utilities";
import {
    FileAddOutlined,
    FileTextOutlined,
    UnorderedListOutlined,
    PlusOutlined,
} from "@ant-design/icons";

import { SortOrder } from "antd/lib/table/interface";
import FilterBar from "./FilterBar";
import { ListViewProps, TabRenderProps, TableViewProps } from "./type";
import TableView from "./TableView";
import { uniqueId } from "lodash";

interface Props<
    ListDataType extends Record<string, any> & {
        id: number | string;
        code?: string;
    },
    FilterType extends Record<string, any>,
    ValueType
> {
    tabRender?: (item?: ListDataType) => TabRenderProps[];
    listView:
    | TableViewProps<ListDataType, FilterType, ValueType>
    | ListViewProps<ListDataType, FilterType, ValueType>;

    defaultTabs?: {
        action: string;
        multiple?: boolean;
        removable?: boolean;
        tabLabel?: React.ReactNode;
    }[];
    defaultTabClosable?: boolean;
    addOptions?: {
        label?: React.ReactNode;
        action: string;
        icon?: React.ReactNode;
        tabLabel?: React.ReactNode;
        focusTab?: boolean;
        multiple?: boolean;
        defaultOpen?: boolean;
        removable?: boolean;
        hideAddButton?: boolean;
    }[];
    addOptionsMode?: "dropdown" | "inline";
    addOptionsPosition?: "left" | "right";
    customAddButton?: {
        label?: React.ReactNode;
        action?: string;
        icon?: React.ReactNode;
        tabLabel?: React.ReactNode;
    };
}

interface DraggableTabPaneProps
    extends React.HTMLAttributes<HTMLDivElement> {
    "data-node-key": string;
}

const DraggableTabNode = ({
    className,
    ...props
}: DraggableTabPaneProps) => {
    const { attributes, listeners, setNodeRef, transform, transition } =
        useSortable({
            id: props["data-node-key"],
        });

    const style: React.CSSProperties = {
        ...props.style,
        transform: CSS.Translate.toString(transform),
        transition,
        cursor: "grab",
    };

    return React.cloneElement(
        props.children as React.ReactElement,
        {
            ref: setNodeRef,
            style,
            ...attributes,
            ...listeners,
        }
    );
};

export const PageWrapperContext = React.createContext<{
    onAddTab?: (item: any, props?: TabRenderProps, key?: React.Key) => void;
    tabRender?: (item?: any) => TabRenderProps[];
}>({});

export default function PageWrapper<
    ListDataType extends Record<string, any> & {
        id: string | number;
        code?: string;
    },
    FilterType extends Record<string, any> & {
        searchValue?: string;
        status?: string;
        subStatus?: string;
        subStatus2?: string;
    },
    ValueType
>({
    tabRender,
    listView,
    defaultTabs,
    defaultTabClosable,
    addOptions,
    addOptionsMode = "dropdown",
    addOptionsPosition = "right",
    customAddButton,
}: Props<ListDataType, FilterType, ValueType>) {
    const actionRef = useRef<ActionType>();
    const defaultTabsInitialized = useRef(false);

    const [forceReload, setForceReload] = useState(0);
    const [filterData, setFilterData] = useState<FilterType>();
    const [tableInfo, setTableInfo] = useState<{
        pageSize?: number;
        current?: number;
        sort: Record<string, SortOrder>;
    }>();

    const [tabList, setTabList] = useState<
        (TabPaneProps & {
            key?: React.Key;
            data?: ListDataType;
            isModified?: boolean;
        })[]
    >([]);

    const [activeKey, setActiveKey] = useState<string>("list");

    useEffect(() => {
        listView.onFilter?.(filterData as FilterType, { pageSize: tableInfo?.pageSize, current: tableInfo?.current }, tableInfo?.sort);
    }, [forceReload]);

    const reloadList = (resetPageIndex?: boolean | undefined) => {
        if (listView.props.actionRef) {
            (listView.props.actionRef as any).current?.reload(resetPageIndex);
            return;
        }
        actionRef.current?.reload(resetPageIndex);
    };

    useEffect(() => {
        if (listView.disableSearch) {
            setFilterData((v) => {
                if (!v) return v;
                const { searchValue, ...rest } = v;
                return rest as FilterType;
            });
        }
    }, [listView.disableSearch]);

    const sensor = useSensor(PointerSensor, {
        activationConstraint: { distance: 10 },
    });

    const onDragEnd = ({ active, over }: DragEndEvent) => {
        if (active.id !== over?.id) {
            setTabList((prev) => {
                const activeIndex = prev.findIndex(
                    (i) => i.key === active.id
                );
                const overIndex = prev.findIndex(
                    (i) => i.key === over?.id
                );
                return arrayMove(prev, activeIndex, overIndex);
            });
        }
    };

    const removeTab = (key: string) => {
        setTabList((v) => v.filter((it) => it.key !== key));
        setActiveKey("list");
    };

    const changeTabLabel = (
        label: React.ReactNode,
        key: string
    ) => {
        setTabList((v) =>
            v.map((it) =>
                it.key === key ? { ...it, tab: label } : it
            )
        );
    };

    const markTabAsModified = (key: string, modified: boolean) => {
        setTabList((v) =>
            v.map((it) =>
                it.key === key ? { ...it, isModified: modified } : it
            )
        );
    };

    const createTab = (props: TabRenderProps, options?: { closable?: boolean; tabLabel?: React.ReactNode; focusTab?: boolean; multiple?: boolean }) => {
        const isFocusTab = options?.focusTab !== undefined ? options.focusTab : (props.focusTab !== undefined ? props.focusTab : (
            options?.multiple !== undefined ? !options.multiple : (props.multiple !== undefined ? !props.multiple : false)
        ));

        if (isFocusTab) {
            const actionPrefix = `default-${props.action}-`;
            const existingTab = tabList.find((t) => t.key === props.tabKey || (String(t.key).startsWith(actionPrefix)));
            if (existingTab) {
                setActiveKey(existingTab.key as string);
                return;
            }
        }

        const gKey =
            props.tabKey ||
            `default-${uniqueId(props.action + "-")}`;

        setTabList((v) => {
            let finalLabel = options?.tabLabel || props.tabLabel || "New";

            // Calculate running variable (sequence count) for multiple tabs of the same action
            const actionPrefix = `default-${props.action}-`;
            const existingCount = v.filter((it) => (it.key as string).startsWith(actionPrefix)).length;

            if (existingCount > 0) {
                finalLabel = `${finalLabel} ${existingCount + 1}`;
            }

            return [
                ...v,
                {
                    tab: finalLabel,
                    key: gKey as string,
                    closable: options?.closable ?? true,
                    icon: props.tabIcon || <FileAddOutlined />,
                    children: props.panel?.({
                        key: gKey,
                        currentTabKey: activeKey,
                        onCloseTab: () => removeTab(gKey as string),
                        onChangeTabLabel: (label) => changeTabLabel(label, gKey as string),
                        onAddTab: () => { },
                        onUpdateTab: () => { },
                        onMarkTabAsModified: (modified) => markTabAsModified(gKey as string, modified),
                    }),
                },
            ];
        });

        setActiveKey(gKey as string);
    };

    // ✅ Default List Tab
    useEffect(() => {
        setTabList((prev) => {
            const listTab = {
                tab: listView.title || "List",
                key: "list",
                closable: defaultTabClosable ?? false,
                icon: <UnorderedListOutlined />,
                children: (
                    <FilterBar
                        onStatusRender={listView.onStatusRender}
                        statuses={listView.statuses || []}
                        actionButtons={listView.actionButtons}
                        actions={listView.actions}
                        advanceSearchButton={listView.advanceSearchButton}
                        onRefresh={listView.onRefresh}
                        onAddTab={() => {
                            const addConfig = tabRender?.().find(
                                (it) => it.action === "add"
                            );
                            if (addConfig) createTab(addConfig);
                        }}
                        onSearch={
                            listView.disableSearch
                                ? undefined
                                : (keywords) => {
                                    setFilterData(
                                        (v) =>
                                        ({
                                            ...v,
                                            searchValue: keywords,
                                        } as any)
                                    );
                                    reloadList(true);
                                }
                        }
                        onStatusChanged={(status) => {
                            setFilterData((v) => ({ ...v, status: status } as any));
                            reloadList(true);
                        }}
                        onSubStatusChanged={(value) => {
                            setFilterData((v) => ({ ...v, subStatus: value } as any));
                            reloadList(true);
                        }}
                        onSubStatus2Changed={(value) => {
                            setFilterData((v) => ({ ...v, subStatus2: value } as any));
                            reloadList(true);
                        }}
                        onOpenAdvanceSearch={listView.onOpenAdvanceSearch}
                    />
                ),
            };

            if (prev.some((it) => it.key === "list")) {
                return prev.map((it) =>
                    it.key === "list" ? listTab : it
                );
            }

            return [listTab, ...prev];
        });
    }, [listView]);

    // ✅ Default Tabs On Load
    useEffect(() => {
        if (!tabRender || defaultTabsInitialized.current)
            return;

        const availableTabs = tabRender();

        const initializeTabs = (configs: any[]) => {
            configs?.forEach((config) => {
                const found = availableTabs.find((t) => t.action === config.action);
                if (found) createTab(found, { closable: config.removable, tabLabel: config.tabLabel });
            });
        };

        initializeTabs(defaultTabs || []);
        initializeTabs(addOptions?.filter(opt => opt.defaultOpen) || []);

        // ensure default loads list page at start
        setActiveKey("list");
        defaultTabsInitialized.current = true;
    }, []);

    return (
        <PageWrapperContext.Provider
            value={{ tabRender }}
        >
            <PageContainer
                title={false}
                breadcrumbRender={false}
                tabProps={{
                    type: "editable-card",
                    activeKey,
                    hideAdd: addOptionsMode === "inline",

                    tabBarExtraContent: (() => {
                        if (addOptionsMode !== "inline" || !addOptions || addOptionsPosition === "left") return undefined;
                        const content = (
                            <div className="ant-tabs-nav-list" style={{ display: "flex", gap: "2px", alignItems: "flex-end" }}>
                                {addOptions.filter(opt => !opt.hideAddButton).map((opt) => (
                                    <div
                                        key={opt.action}
                                        className="ant-tabs-tab"
                                        style={{ cursor: "pointer", margin: "0 2px" }}
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            const addTabConfig = tabRender?.().find(
                                                (t) => t.action === opt.action
                                            );
                                            if (addTabConfig)
                                                createTab(addTabConfig, { tabLabel: opt.tabLabel, focusTab: opt.focusTab, multiple: opt.multiple });
                                        }}
                                    >
                                        <div className="ant-tabs-tab-btn" style={{ display: "flex", alignItems: "center", gap: 8 }}>
                                            {opt.icon}
                                            {opt.label}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        );
                        return { right: content };
                    })(),
                    addIcon:
                        addOptionsMode !== "inline" && addOptions && addOptions.filter(opt => !opt.hideAddButton).length > 0 ? (
                            <Dropdown
                                menu={{
                                    items: addOptions.filter(opt => !opt.hideAddButton).map((opt) => ({
                                        key: opt.action,
                                        label: opt.label,
                                        icon: opt.icon,
                                    })),
                                    onClick: (e) => {
                                        e.domEvent.stopPropagation();
                                        const addTabConfig = tabRender?.().find(
                                            (t) => t.action === e.key
                                        );
                                        const optConfig = addOptions.find((o) => o.action === e.key);
                                        if (addTabConfig) createTab(addTabConfig, { tabLabel: optConfig?.tabLabel, focusTab: optConfig?.focusTab, multiple: optConfig?.multiple });
                                    },
                                }}
                                trigger={["click"]}
                            >
                                <span onClick={(e) => e.stopPropagation()}>
                                    <PlusOutlined />
                                </span>
                            </Dropdown>
                        ) : customAddButton ? (
                            <span style={{ display: "inline-flex", alignItems: "center", gap: 4 }}>
                                {customAddButton.icon || <PlusOutlined />}
                                {customAddButton.label}
                            </span>
                        ) : undefined,
                    renderTabBar: (tabBarProps, DefaultTabBar) => (
                        <DndContext
                            sensors={[sensor]}
                            onDragEnd={onDragEnd}
                        >
                            <SortableContext
                                items={tabList.map(
                                    (i) => i.key as string
                                )}
                                strategy={
                                    horizontalListSortingStrategy
                                }
                            >
                                <DefaultTabBar {...tabBarProps}>
                                    {(node) => {
                                        if (node.key && String(node.key).startsWith("__add_option_")) {
                                            return React.cloneElement(node as React.ReactElement, { key: node.key });
                                        }
                                        return (
                                            <DraggableTabNode
                                                {...node.props}
                                                key={node.key}
                                            >
                                                {node}
                                            </DraggableTabNode>
                                        );
                                    }}
                                </DefaultTabBar>
                            </SortableContext>
                        </DndContext>
                    ),
                    onChange: (key) => {
                        if (key.startsWith("__add_option_")) {
                            const action = (key as string).replace("__add_option_", "");
                            const addTabConfig = tabRender?.().find((t) => t.action === action);
                            const optConfig = addOptions?.find((o) => o.action === action);
                            if (addTabConfig) createTab(addTabConfig, { tabLabel: optConfig?.tabLabel, focusTab: optConfig?.focusTab, multiple: optConfig?.multiple });
                            return;
                        }
                        setActiveKey(key as string);
                    },
                    onEdit: (targetKey, action) => {
                        if (action === "remove") {
                            removeTab(targetKey as string);
                        }

                        if (action === "add" && addOptionsMode !== "inline") {
                            const addAction = customAddButton?.action || "add";
                            const addTabConfig = tabRender?.().find(
                                (t) => t.action === addAction
                            );

                            if (addTabConfig) createTab(addTabConfig, { tabLabel: customAddButton?.tabLabel });
                        }
                    },
                }}
                tabList={(() => {
                    const baseTabList = tabList.map(t => ({
                        ...t,
                        closable: t.isModified ? false : t.closable,
                        tab: t.isModified ? <Badge dot offset={[5, 2]}>{t.tab}</Badge> : t.tab
                    }));

                    if (addOptionsMode === "inline" && addOptions && addOptionsPosition === "left") {
                        const listIndex = baseTabList.findIndex(t => t.key === "list");
                        const insertIndex = listIndex >= 0 ? listIndex + 1 : 0;

                        const before = baseTabList.slice(0, insertIndex);
                        const after = baseTabList.slice(insertIndex);

                        return [
                            ...before,
                            ...addOptions.filter(opt => !opt.hideAddButton).map((opt) => ({
                                key: `__add_option_${opt.action}`,
                                tab: (
                                    <span style={{ display: "flex", alignItems: "center", gap: 8 }}>
                                        {opt.icon}
                                        {opt.label}
                                    </span>
                                ),
                                closable: false,
                            })),
                            ...after,
                        ];
                    }
                    return baseTabList;
                })()}
            >
                {activeKey === "list" && listView.type === "Table" && (
                    <>
                        {listView.onExtraFilterRender?.(filterData)}
                        <TableView
                            listView={{
                                ...listView,
                                props: {
                                    ...listView.props,
                                    actionRef: listView.props.actionRef || actionRef,
                                    request: async (params, sort) => {
                                        setTableInfo({
                                            ...params,
                                            current: params.current,
                                            pageSize: params.pageSize,
                                            sort,
                                        } as any);
                                        setForceReload((v) => v + 1);
                                        return [];
                                    },
                                },
                            } as TableViewProps<any, any, any>}
                            onAddTab={(_, props) => {
                                if (props) createTab(props);
                            }}
                            tabRender={tabRender}
                        />
                    </>
                )}

                <FloatButton.BackTop />
            </PageContainer>
        </PageWrapperContext.Provider>
    );
}