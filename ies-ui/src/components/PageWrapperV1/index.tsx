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
    CloseOutlined,
    FullscreenOutlined,
    FullscreenExitOutlined,
    ColumnWidthOutlined
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
        allowFloating?: boolean;
        fullScreen?: boolean;
        defaultViewMode?: 'normal' | 'half-left' | 'half-right' | 'full';
    }[];
    addOptionsMode?: "dropdown" | "inline";
    addOptionsPosition?: "left" | "right";
    customAddButton?: {
        label?: React.ReactNode;
        action?: string;
        icon?: React.ReactNode;
        tabLabel?: React.ReactNode;
    };
    stickyHeader?: boolean;
    showFullScreenButton?: boolean;
    showNewWindowButton?: boolean;
}

interface DraggableTabPaneProps
    extends React.HTMLAttributes<HTMLDivElement> {
    "data-node-key": string;
}

const DraggableWindow = ({ title, onClose, children, isActive, onClick, zIndex, defaultViewMode = 'normal' }: any) => {
    const [position, setPosition] = useState({
        x: Math.max(50, window.innerWidth / 2 - 400),
        y: Math.max(50, 100)
    });
    const [size, setSize] = useState({ width: 800, height: 600 });
    const [viewMode, setViewMode] = useState<'normal' | 'half-left' | 'half-right' | 'full'>(defaultViewMode);
    const [isInteracting, setIsInteracting] = useState(false);

    const draggingRef = useRef(false);
    const startPosRef = useRef({ x: 0, y: 0 });

    // Custom Resizing Refs
    const resizingRef = useRef<{ dir: string, startX: number, startY: number, startW: number, startH: number, startL: number, startT: number } | null>(null);

    const handleMouseDown = (e: React.MouseEvent) => {
        if (viewMode !== 'normal') return; // no drag in full/half screen
        draggingRef.current = true;
        setIsInteracting(true);
        startPosRef.current = {
            x: e.clientX - position.x,
            y: e.clientY - position.y
        };
    };

    const handleResizeStart = (e: React.MouseEvent, dir: string) => {
        if (viewMode !== 'normal') return;
        resizingRef.current = {
            dir,
            startX: e.clientX,
            startY: e.clientY,
            startW: size.width,
            startH: size.height,
            startL: position.x,
            startT: position.y
        };
        setIsInteracting(true);
        e.stopPropagation();
    };

    useEffect(() => {
        const handleMouseMove = (e: MouseEvent) => {
            if (resizingRef.current) {
                const { dir, startX, startY, startW, startH, startL, startT } = resizingRef.current;
                const dx = e.clientX - startX;
                const dy = e.clientY - startY;

                let newW = startW;
                let newH = startH;
                let newL = startL;
                let newT = startT;

                if (dir.includes('e')) {
                    newW = Math.max(400, startW + dx);
                }
                if (dir.includes('w')) {
                    const diff = Math.min(startW - 400, dx); // Prevent shifting beyond minWidth limitation
                    newW = startW - diff;
                    newL = startL + diff;
                }
                if (dir.includes('s')) {
                    newH = Math.max(300, startH + dy);
                }
                if (dir.includes('n')) {
                    const diff = Math.min(startH - 300, dy); // Prevent shifting beyond minHeight limitation
                    newH = startH - diff;
                    newT = startT + diff;
                }

                setSize({ width: newW, height: newH });
                setPosition({ x: newL, y: newT });
                return;
            }

            if (!draggingRef.current) return;
            const newX = e.clientX - startPosRef.current.x;
            const newY = e.clientY - startPosRef.current.y;

            // Constrain to window bounds
            const maxX = window.innerWidth - 100; // at least 100px visible
            const maxY = window.innerHeight - 100;

            setPosition({
                x: Math.min(Math.max(0, newX), maxX),
                y: Math.min(Math.max(0, newY), maxY)
            });
        };
        const handleMouseUp = () => {
            draggingRef.current = false;
            resizingRef.current = null;
            setIsInteracting(false);
        };
        window.addEventListener('mousemove', handleMouseMove);
        window.addEventListener('mouseup', handleMouseUp);
        return () => {
            window.removeEventListener('mousemove', handleMouseMove);
            window.removeEventListener('mouseup', handleMouseUp);
        };
    }, []);

    const isFull = viewMode === 'full';
    const isHalfLeft = viewMode === 'half-left';
    const isHalfRight = viewMode === 'half-right';
    const isHalf = isHalfLeft || isHalfRight;

    return (
        <div
            onMouseDownCapture={onClick}
            style={{
                position: 'fixed',
                left: isFull || isHalfLeft ? 0 : isHalfRight ? '50vw' : position.x,
                top: isFull || isHalf ? 0 : position.y,
                width: isFull ? '100vw' : isHalf ? '50vw' : size.width,
                height: isFull || isHalf ? '100vh' : size.height,
                minWidth: '400px',
                minHeight: '300px',
                maxWidth: '100vw',
                maxHeight: '100vh',
                backgroundColor: '#fff',
                boxShadow: isActive ? '0 8px 24px rgba(0,0,0,0.25)' : '0 4px 12px rgba(0,0,0,0.15)',
                zIndex: zIndex,
                display: 'flex',
                flexDirection: 'column',
                border: isActive ? '1px solid #1890ff' : '1px solid #d9d9d9',
                borderRadius: isFull || isHalf ? 0 : 8,
                overflow: 'hidden',
                transform: 'translateZ(0)', // Maps position: fixed children (like FooterToolbar) to this container instead of the screen!
                transition: draggingRef.current || resizingRef.current ? 'none' : 'left 0.3s cubic-bezier(0.2, 0, 0, 1), top 0.3s cubic-bezier(0.2, 0, 0, 1), width 0.3s cubic-bezier(0.2, 0, 0, 1), height 0.3s cubic-bezier(0.2, 0, 0, 1)'
            }}
        >
            {/* Custom Resize Handles (Hidden if in half/full screen modes) */}
            {viewMode === 'normal' && Object.entries({
                'n': { top: 0, left: 16, right: 16, height: 8, cursor: 'ns-resize' },
                's': { bottom: 0, left: 16, right: 16, height: 8, cursor: 'ns-resize' },
                'e': { top: 16, bottom: 16, right: 0, width: 8, cursor: 'ew-resize' },
                'w': { top: 16, bottom: 16, left: 0, width: 8, cursor: 'ew-resize' },
                'nw': { top: 0, left: 0, width: 16, height: 16, cursor: 'nwse-resize' },
                'ne': { top: 0, right: 0, width: 16, height: 16, cursor: 'nesw-resize' },
                'sw': { bottom: 0, left: 0, width: 16, height: 16, cursor: 'nesw-resize' },
                'se': { bottom: 0, right: 0, width: 16, height: 16, cursor: 'nwse-resize' }
            }).map(([dir, style]) => (
                <div
                    key={dir}
                    onMouseDown={(e) => handleResizeStart(e, dir)}
                    style={{ position: 'absolute', zIndex: 9999, ...style }}
                />
            ))}

            <div
                onMouseDown={handleMouseDown}
                onDoubleClick={() => setViewMode(prev => prev === 'full' ? 'normal' : 'full')}
                style={{
                    padding: '8px 16px',
                    borderBottom: '1px solid #f0f0f0',
                    cursor: viewMode === 'normal' ? 'move' : 'default',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    backgroundColor: isActive ? '#e6f7ff' : '#fafafa',
                    userSelect: 'none'
                }}
            >
                <div style={{ fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: 8 }}>
                    {title}
                </div>
                <div style={{ display: 'flex', gap: 8 }}>
                    <Button
                        size="small"
                        icon={<ColumnWidthOutlined style={{ transform: isHalfRight ? 'rotate(180deg)' : 'none', transition: '0.3s' }} />}
                        onClick={(e) => {
                            e.stopPropagation();
                            setViewMode(v => v === 'normal' ? 'half-left' : v === 'half-left' ? 'half-right' : 'normal');
                        }}
                        title="Toggle Half Screen (Left/Right)"
                    />
                    <Button
                        size="small"
                        icon={isFull ? <FullscreenExitOutlined /> : <FullscreenOutlined />}
                        onClick={(e) => { e.stopPropagation(); setViewMode(v => v === 'full' ? 'normal' : 'full'); }}
                        title="Full Screen"
                    />
                    <Button size="small" type="link" danger icon={<CloseOutlined />} ghost onClick={(e) => { e.stopPropagation(); onClose(); }} />
                </div>
            </div>
            <div style={{ flex: 1, padding: 16, overflow: 'auto', backgroundColor: '#f0f2f5', minHeight: 0, pointerEvents: isInteracting ? 'none' : 'auto' }}>
                <div style={{ backgroundColor: '#fff', minHeight: '100%', padding: 24, borderRadius: 8 }}>
                    {children}
                </div>
            </div>
        </div>
    );
};

const DraggableTabNode = ({
    className,
    onLongPress,
    tabKey,
    ...props
}: DraggableTabPaneProps & { onLongPress?: (key: string) => void, tabKey?: string }) => {
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

    const handlePointerDown = (e: any) => {
        // Preserve dnd-kit standard behavior
        if (listeners && listeners.onPointerDown) {
            listeners.onPointerDown(e);
        }

        if (onLongPress && tabKey) {
            const timer = setTimeout(() => {
                onLongPress(tabKey);
                window.removeEventListener('pointerup', clearTimer);
                window.removeEventListener('pointermove', onMove);
            }, 600); // 600ms trigger

            const clearTimer = () => {
                clearTimeout(timer);
                window.removeEventListener('pointermove', onMove);
            };

            const initialX = e.clientX;
            const initialY = e.clientY;

            const onMove = (moveEvent: any) => {
                if (Math.abs(moveEvent.clientX - initialX) > 5 || Math.abs(moveEvent.clientY - initialY) > 5) {
                    clearTimer();
                    window.removeEventListener('pointerup', clearTimer);
                }
            };

            window.addEventListener('pointerup', clearTimer, { once: true });
            window.addEventListener('pointermove', onMove);
        }
    };

    return React.cloneElement(
        props.children as React.ReactElement,
        {
            ref: setNodeRef,
            style,
            ...attributes,
            ...listeners,
            onPointerDown: handlePointerDown, // Apply our custom interceptor
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
    stickyHeader,
    showFullScreenButton,
    showNewWindowButton,
}: Props<ListDataType, FilterType, ValueType>) {
    const actionRef = useRef<ActionType>();
    const defaultTabsInitialized = useRef(false);
    const wrapperRef = useRef<HTMLDivElement>(null);
    const [isFullscreenState, setIsFullscreenState] = useState(false);

    const [forceReload, setForceReload] = useState(0);
    const [filterData, setFilterData] = useState<FilterType>();
    const [tableInfo, setTableInfo] = useState<{
        pageSize?: number;
        current?: number;
        sort: Record<string, SortOrder>;
    }>();

    useEffect(() => {
        const handleFullscreenChange = () => {
            setIsFullscreenState(!!document.fullscreenElement);
        };
        document.addEventListener('fullscreenchange', handleFullscreenChange);
        return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
    }, []);

    const [tabList, setTabList] = useState<
        (TabPaneProps & {
            key?: React.Key;
            data?: ListDataType;
            isModified?: boolean;
            allowFloating?: boolean;
            fullScreen?: boolean;
            defaultViewMode?: 'normal' | 'half-left' | 'half-right' | 'full';
        })[]
    >([]);

    const [activeKey, setActiveKey] = useState<string>("list");
    const [floatingTabs, setFloatingTabs] = useState<string[]>([]);
    const [activeFloatingTab, setActiveFloatingTab] = useState<string | null>(null);

    const handleLongPress = (key: string) => {
        if (key === "list") return; // The list view itself stays fixed
        setFloatingTabs(prev => {
            if (prev.includes(key)) return prev;
            return [...prev, key];
        });
        setActiveFloatingTab(key);
        setActiveKey("list"); // Move background view to list
    };

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

    const createTab = (props: TabRenderProps, options?: { closable?: boolean; tabLabel?: React.ReactNode; focusTab?: boolean; multiple?: boolean; allowFloating?: boolean; fullScreen?: boolean; defaultViewMode?: 'normal' | 'half-left' | 'half-right' | 'full' }) => {
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
                    fullScreen: options?.fullScreen ?? props.fullScreen ?? false,
                    defaultViewMode: options?.defaultViewMode ?? props.defaultViewMode,
                    closable: options?.closable ?? true,
                    allowFloating: ((options?.fullScreen ?? props.fullScreen) || (options?.defaultViewMode || props.defaultViewMode)) ? true : (options?.allowFloating ?? props.allowFloating ?? false),
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
    }, []);  // Only initialize once — listView props flow through TableView/FilterBar re-renders naturally

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

        // ensure default loads correct active tab based on view mode
        setActiveKey("list");
        defaultTabsInitialized.current = true;
    }, []);

    return (
        <PageWrapperContext.Provider
            value={{ tabRender }}
        >
            <style>{`
                .ies-fullscreen-wrapper:fullscreen {
                    background: var(--ant-layout-body-background, #f0f2f5) !important;
                    height: 100vh !important;
                    overflow: auto !important;
                    scrollbar-width: auto !important;
                }
                .ies-fullscreen-wrapper:fullscreen::-webkit-scrollbar {
                    width: 8px !important;
                    height: 8px !important;
                }
                .ies-fullscreen-wrapper:fullscreen::-webkit-scrollbar-thumb {
                    background-color: #bbb !important;
                    border-radius: 4px !important;
                }
            `}</style>
            <div ref={wrapperRef} className="ies-fullscreen-wrapper">
                <PageContainer
                    title={false}
                    breadcrumbRender={false}
                    tabProps={{
                        type: "editable-card",
                        activeKey,
                        hideAdd: addOptionsMode === "inline",

                        tabBarExtraContent: (() => {
                            const hasAddOptions = addOptionsMode === "inline" && addOptions && addOptionsPosition === "right";

                            const addOptionsContent = hasAddOptions ? (
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
                                                    createTab(addTabConfig, { tabLabel: opt.tabLabel, focusTab: opt.focusTab, multiple: opt.multiple, allowFloating: opt.allowFloating, fullScreen: opt.fullScreen, defaultViewMode: opt.defaultViewMode });
                                            }}
                                        >
                                            <div className="ant-tabs-tab-btn" style={{ display: "flex", alignItems: "center", gap: 8 }}>
                                                {opt.icon}
                                                {opt.label}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : null;

                            const newWindowContent = showNewWindowButton ? (
                                <div className="ant-tabs-nav-list" style={{ display: "flex", alignItems: "flex-end", paddingLeft: 8 }}>
                                    <div
                                        className="ant-tabs-tab"
                                        style={{ cursor: "pointer", margin: 0, padding: "8px 16px" }}
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            window.open(window.location.href, "_blank");
                                        }}
                                    >
                                        <div className="ant-tabs-tab-btn" style={{ display: "flex", alignItems: "center", gap: 8, color: "var(--ant-primary-color, #1890ff)" }}>
                                            <FullscreenOutlined />
                                            {/* <span>New Page</span> */}
                                        </div>
                                    </div>
                                </div>
                            ) : null;

                            const fullScreenContent = showFullScreenButton ? (
                                <div className="ant-tabs-nav-list" style={{ display: "flex", alignItems: "flex-end", paddingLeft: 8 }}>
                                    <div
                                        className="ant-tabs-tab"
                                        style={{ cursor: "pointer", margin: 0, padding: "8px 16px" }}
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            if (!document.fullscreenElement) {
                                                if (wrapperRef.current) {
                                                    wrapperRef.current.requestFullscreen().catch(() => { });
                                                }
                                            } else {
                                                if (document.exitFullscreen) {
                                                    document.exitFullscreen();
                                                }
                                            }
                                        }}
                                    >
                                        <div className="ant-tabs-tab-btn" style={{ display: "flex", alignItems: "center", gap: 8, color: "var(--ant-primary-color, #1890ff)" }}>
                                            {isFullscreenState ? <FullscreenExitOutlined /> : <FullscreenOutlined />}
                                            {/* <span>Full Screen</span> */}
                                        </div>
                                    </div>
                                </div>
                            ) : null;

                            if (!addOptionsContent && !newWindowContent && !fullScreenContent) return undefined;

                            return {
                                right: (
                                    <div style={{ display: "flex", alignItems: "center" }}>
                                        {addOptionsContent}
                                        {newWindowContent}
                                        {fullScreenContent}
                                    </div>
                                )
                            };
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
                                            if (addTabConfig) createTab(addTabConfig, {
                                                tabLabel: optConfig?.tabLabel,
                                                focusTab: optConfig?.focusTab,
                                                multiple: optConfig?.multiple,
                                                allowFloating: optConfig?.allowFloating,
                                                fullScreen: optConfig?.fullScreen,
                                                defaultViewMode: optConfig?.defaultViewMode
                                            });
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
                                            const tabItem = tabList.find(t => t.key === node.key);

                                            return (
                                                <DraggableTabNode
                                                    {...node.props}
                                                    key={node.key}
                                                    tabKey={node.key as string}
                                                    onLongPress={tabItem?.allowFloating ? handleLongPress : undefined}
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
                                if (addTabConfig) createTab(addTabConfig, {
                                    tabLabel: optConfig?.tabLabel,
                                    focusTab: optConfig?.focusTab,
                                    multiple: optConfig?.multiple,
                                    allowFloating: optConfig?.allowFloating,
                                    fullScreen: optConfig?.fullScreen,
                                    defaultViewMode: optConfig?.defaultViewMode
                                });
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
                        let baseTabList = tabList
                            .filter(t => !floatingTabs.includes(t.key as string))
                            .map(t => ({
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
                            {listView.onExtraFilterRender && (
                                <div>
                                    {listView.onExtraFilterRender(filterData)}
                                </div>
                            )}
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

                    {floatingTabs.map((key, index) => {
                        const tab = tabList.find(t => t.key === key);
                        if (!tab) return null;
                        return (
                            <DraggableWindow
                                key={key}
                                defaultViewMode={tab.defaultViewMode || (tab.fullScreen ? 'full' : 'normal')}
                                title={tab.tab}
                                isActive={activeFloatingTab === key}
                                zIndex={activeFloatingTab === key ? 999 : 900 + index} // Keep under 1050 so Antd Select dropdown overlays still show on top
                                onClick={() => setActiveFloatingTab(key)}
                                onClose={() => {
                                    setFloatingTabs(v => v.filter(k => k !== key));
                                    setActiveKey(key);
                                }}
                            >
                                {tab.children}
                            </DraggableWindow>
                        );
                    })}

                    <FloatButton.BackTop />
                </PageContainer>
            </div>
        </PageWrapperContext.Provider>
    );
}