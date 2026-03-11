import { ProTable } from "@ant-design/pro-components";
import { TabRenderProps, TableViewProps } from "./type";
import { Button, Flex, Space, Tooltip, Typography } from "antd";
import { omit } from "lodash";

/** Always: text on top, buttons below left-aligned */
const ActionCell = ({
    label,
    firstButtons,
    lastButtons,
}: {
    label: React.ReactNode;
    firstButtons: React.ReactNode[];
    lastButtons: React.ReactNode[];
}) => (
    <div>
        <div style={{ whiteSpace: 'nowrap' }}>{label}</div>
        <Space size={0}>
            {firstButtons}
            {lastButtons}
        </Space>
    </div>
);

export default <ListDataType extends Record<string, any> & { id: number | string, code?: string }, FilterType
    extends { searchValue?: string; status?: string; }, ValueType>(
        { listView, tabRender, onAddTab, stickyOffsetHeader }: {
            listView: TableViewProps<ListDataType, FilterType, ValueType>;
            onAddTab: (item: ListDataType, props?: TabRenderProps, key?: React.Key) => void;
            tabRender?: (item: ListDataType) => TabRenderProps[];
            stickyOffsetHeader?: number;
        }
    ) => {
    return <ProTable<ListDataType, {}, ValueType>
        size="small"
        manualRequest={true}
        {...listView.props}
        rowKey={listView.props.rowKey || 'id'}
        columns={[listView.props.actionButtonsColumnRender ? {
            width: 10,
            render: (_, r) => {
                const render = listView.props.actionButtonsColumnRender?.(r)!!
                return <Space size={0}>
                    {
                        render.map((it, index) => <Tooltip title={it.tooltip} key={`action-tooltip-${r.id}-${index}`}>{
                            !it.actionType ? <Button key={`action-${r.id}-${index}`} {...(omit(it, 'actionType'))} /> : <Button
                                key={`action-bt-${r.id}-${index}`} {...(omit(it, 'actionType'))}
                                onClick={() => {
                                    const renderer = tabRender?.(r).find(it1 => it1.action == it.actionType)
                                    onAddTab(r, renderer)
                                }} />
                        }</Tooltip>)
                    }
                </Space>
            }
        } : { hideInTable: true }, ...listView.props.columns?.map(col => {
            return {
                ...col,
                ellipsis: col.ellipsis ?? false,
                // Prevent header text from wrapping (e.g. "Sub-Sec.", "Order Date")
                onHeaderCell: () => ({ style: { whiteSpace: 'nowrap' as const } }),
                render: col.actionProps ? (_: any, r: ListDataType) => {
                    const actionProps = col.actionProps?.(r)
                    const render = tabRender?.(r).find(it1 => it1.action == actionProps?.type)
                    const valComp = (
                        <Typography.Link onClick={() => onAddTab(r, render)}>
                            {actionProps?.label}
                        </Typography.Link>
                    )

                    if ((actionProps?.actionButtons?.length || 0) > 0) {
                        const firstBtns = actionProps!.actionButtons!
                            .filter(b => !b.hiden && (!b.position || b.position === 'first'))
                            .map((b, idx) => <Button {...b} key={`${r.id}-first-${idx}`} />)

                        const lastBtns = actionProps!.actionButtons!
                            .filter(b => !b.hiden && b.position === 'last')
                            .map((b, idx) => <Button {...b} key={`${r.id}-last-${idx}`} />)

                        return (
                            <ActionCell
                                label={valComp}
                                firstButtons={firstBtns}
                                lastButtons={lastBtns}
                            />
                        )
                    }
                    return valComp
                } : col.render
            }
        })]}
        search={false}
        options={false}
        sticky={stickyOffsetHeader !== undefined ? { offsetHeader: stickyOffsetHeader } : undefined}
    />
}
