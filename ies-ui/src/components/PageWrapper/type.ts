
import { ParamsType, ProColumns, ProTableProps } from "@ant-design/pro-components";
import { ButtonProps } from "antd";
import { MenuItemType } from "antd/lib/menu/hooks/useItems"
import { SegmentedLabeledOption } from "antd/lib/segmented";
import { SortOrder } from "antd/lib/table/interface";
import React from "react";

export type ActionType = 'add' | 'edit' | 'view' | 'copy' | 'action1' | 'action2' | 'action3'

export type TabRenderProps = {
    extra?: React.ReactNode;
    action?: ActionType;
    tabLabel: React.ReactNode;
    tabIcon?: React.ReactNode;
    tabKey?: React.Key;
    panel?: (props: {
        onCloseTab: () => void;
        key: React.Key,
        onAddTab: (actionType: ActionType, props?: TabRenderProps, key?: React.Key) => void,
        onUpdateTab: (actionType: ActionType, newItem?: any, props?: TabRenderProps, key?: React.Key) => void,
        onChangeTabLabel: (label: React.ReactElement) => void;
        // onActionTriggered?: (actionType: ActionType, props?: TabRenderProps, key?: React.Key) => void,
    }) => React.ReactNode;
}

export interface BastListViewProps<ListDataType extends Record<string, any> & { id: number, code?: string }, FilterType
    extends { searchValue?: string; status?: string; }, ValueType> {
    title?: string;
    onExtraFilterRender?: (params?: FilterType) => React.ReactNode;
    onColumnLinkRender?: (id: number, target: 'page-tab' | 'browser-tab', item?: ListDataType, key?: React.Key) => {
        value?: React.ReactNode,
        tabLabel: React.ReactNode,
        tabIcon?: React.ReactNode,
        panel: React.ReactNode
    };

    statuses?: { option: SegmentedLabeledOption & { default?: true }, subOptions?: (SegmentedLabeledOption & { default?: true })[] }[]
    onStatusRender?: React.ReactNode,
    actionButtons?: (React.ReactNode | (ButtonProps & {
        key?: React.Key;
        addNewTab?: true;
        tooltip?: string;
    }))[],

    actionNumShown?: number;

    actions?: (Omit<MenuItemType, 'onClick' | 'itemIcon'> & { icon?: React.ReactNode, onClick?: () => void })[];
    onFilter?: (params?: FilterType, page?: {
        pageSize?: number;
        current?: number;
    }, sort?: Record<string, SortOrder>) => void;

    advanceSearchButton?: React.ReactElement;
    onOpenAdvanceSearch?: () => void;
    onRefresh?: () => void;
}

export interface TableViewProps<ListDataType extends Record<string, any> & { id: number, code?: string }, FilterType
    extends { searchValue?: string; status?: string; }, ValueType> extends BastListViewProps<ListDataType, FilterType, ValueType> {
    type: "Table"
    props: Omit<ProTableProps<ListDataType, ParamsType, ValueType>, 'columns'> & {
        actionButtonsColumnRender?: (item: ListDataType) => (ButtonProps & {
            actionType?: ActionType;
            tooltip?: string;

        })[];
        columns: (ProColumns<ListDataType, ValueType> & {
            actionProps?: (item: ListDataType) => {
                actionButtons?: (ButtonProps & { position?: 'first' | 'last', hiden?: true })[];
                type: ActionType;
                label: string;
            };
            tabRender?: (item: ListDataType) => TabRenderProps;
        })[];
        fullView?: {
            onOpen: (item: ListDataType) => void
        }
        primaryCol?: ProColumns<ListDataType, ValueType>
    }
}

export interface ListViewProps<ListDataType extends Record<string, any> & { id: number, code?: string }, FilterType
    extends { searchValue?: string; status?: string; }, ValueType> extends BastListViewProps<ListDataType, FilterType, ValueType> {
    type: "Table"
    props: Omit<ProTableProps<ListDataType, ParamsType, ValueType>, 'columns'> & {
        quickView?: boolean
        columns: (ProColumns<ListDataType, ValueType> & {
            actionProps?: (item: ListDataType) => {
                type: ActionType;
                label: string;
                actionButtons?: (ButtonProps & { position?: 'first' | 'last', visible?: true })[];
            },
            tabRender?: (item: ListDataType) => TabRenderProps //TODO: to be removed
        })[];
        fullView?: {
            onOpen: (item: ListDataType) => void
        }

        primaryCol?: ProColumns<ListDataType, ValueType>
    }
} 