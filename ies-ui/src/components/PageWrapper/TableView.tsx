import { ProTable } from "@ant-design/pro-components";
import { TabRenderProps, TableViewProps } from "./type";
import { Button, Flex, Space, Tooltip, Typography } from "antd";
import { omit } from "lodash";

export default <ListDataType extends Record<string, any> & { id: number, code?: string }, FilterType
    extends { searchValue?: string; status?: string; }, ValueType>(
        { listView, tabRender, onAddTab }: {
            listView: TableViewProps<ListDataType, FilterType, ValueType>;
            onAddTab: (item: ListDataType, props?: TabRenderProps, key?: React.Key) => void;
            tabRender?: (item: ListDataType) => TabRenderProps[];
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
                            !it.actionType ? <Button key={`action-${r.id}-${index}`} {...it} /> : <Button
                                key={`action-bt-${r.id}-${index}`} {...(omit(it, 'tabRender'))}
                                onClick={() => {
                                    const renderer = tabRender?.(r).find(it1 => it1.action == it.actionType)
                                    onAddTab(r, renderer)
                                }} />
                        }</Tooltip>)
                    }
                </Space>
            }
        } : { hidden: true }, ...listView.props.columns?.map(it => {
            return {
                ...it, render: it.actionProps ? (_: any, r: ListDataType) => {
                    const actionProps = it.actionProps?.(r)
                    const render = tabRender?.(r).find(it1 => it1.action == actionProps?.type)
                    const valComp = <Typography.Link onClick={() => onAddTab(r, render,)}>{actionProps?.label}</Typography.Link>

                    if ((actionProps?.actionButtons?.length || 0) > 0) {
                        return <Space size={0}>
                            {actionProps?.actionButtons?.filter((it) => !it.hiden && (!it.position || it.position == 'first')).map((it, index) => <Button {...it} key={`${r.id}-${it.position}-${index}`} />)}
                            {valComp}
                            {actionProps?.actionButtons?.filter((it) => !it.hiden && it.position == 'last').map((it, index) => <Button {...it} key={`${r.id}-${it.position}-${index}`} />)}
                        </Space>
                    }
                    return valComp
                } : it.render
            }
        })]}
        search={false}
        options={false}
    />
} 