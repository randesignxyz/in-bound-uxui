
import { ParamsType, ProColumns, ProTableProps } from "@ant-design/pro-components";
import { MenuItemType } from "antd/lib/menu/hooks/useItems"
import { SegmentedLabeledOption } from "antd/lib/segmented";
import { SortOrder } from "antd/lib/table/interface";

export type TabRenderProps = {
    value?: React.ReactNode;
    onOpenIconClick?: () => void;
    tabLabel: React.ReactNode;
    tabIcon?: React.ReactNode;
    panel: React.ReactNode;
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
    actionButtons?: React.ReactElement[],
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
        quickView?: boolean
        columns: (ProColumns<ListDataType, ValueType>)[];
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
        columns: (ProColumns<ListDataType, ValueType> & { tabRender?: (item: ListDataType) => TabRenderProps })[];
        fullView?: {
            onOpen: (item: ListDataType) => void
        }

        primaryCol?: ProColumns<ListDataType, ValueType>
    }
} 