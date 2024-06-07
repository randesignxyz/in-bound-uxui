import { ProTable } from "@ant-design/pro-components";
import { TabRenderProps, TableViewProps } from "./type";
import { Button, Flex, Typography } from "antd";
import { ExportOutlined } from "@ant-design/icons";

export default <ListDataType extends Record<string, any> & { id: number, code?: string }, FilterType
    extends { searchValue?: string; status?: string; }, ValueType>(
        { listView, onAddTab }:
            { listView: TableViewProps<ListDataType, FilterType, ValueType>; onAddTab: (item: ListDataType, props?: TabRenderProps, key?: React.Key) => void }
    ) => {
    return <ProTable<ListDataType, {}, ValueType>
        size="small"
        manualRequest={true}
        {...listView.props}
        rowKey={listView.props.rowKey || 'id'}
        columns={listView.props.columns?.map(it => {
            return {
                ...it, render: it.tabRender ? (_: any, r: ListDataType) => {
                    const render = it.tabRender?.(r)
                    const valComp = <Typography.Link onClick={() => onAddTab(r, render, it.key)}>{render?.value}</Typography.Link>
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
    />
} 