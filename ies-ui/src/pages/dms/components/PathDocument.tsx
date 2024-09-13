import { ProDescriptions } from "@ant-design/pro-components";
import { Breadcrumb, Card, Drawer, DrawerProps, Space } from "antd";
import { DocumentationDTO } from "../documentation/data";
interface Props extends DrawerProps {
    data?: DocumentationDTO
}
export default ({ data, ...props }: Props) => {
    return (
        <Drawer
            {...props}
            width={500}
            title="Path Infomation"
        >
            <Space
                size={20}
                direction="vertical"
            >
                <Card>
                    <ProDescriptions
                        dataSource={data?.library}
                        column={2}
                        columns={[
                            {
                                title: "Libray Name",
                                dataIndex: "name",
                            },
                            {
                                title: "Library Type",
                                dataIndex: "type",
                            },
                            {
                                title: "Location",
                                dataIndex: "location",
                            },
                        ]}
                    />
                </Card>
                <Card>
                    <ProDescriptions
                        dataSource={data}
                        column={2}
                        columns={[
                            {
                                title: "Path",
                                render: (_, r) => <Breadcrumb items={r.path?.map(p => ({ key: p.id, title: p.name }))} separator=">" />,
                                span:2
                            },
                            {
                                title: "Current Folder",
                                render:(_,r)=>r?.path?.at(-1)?.name,
                                span:2
                            },
                            {
                                title: "Location",
                                render:(_,r)=>r.path?.at(-1)?.location
                            },
                        ]}
                    />
                </Card>
            </Space>
        </Drawer>
    )
}