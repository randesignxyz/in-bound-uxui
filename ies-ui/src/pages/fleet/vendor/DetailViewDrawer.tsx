import { ProDescriptions } from "@ant-design/pro-components";
import { Card, Drawer, DrawerProps, Space } from 'antd';

interface Props extends DrawerProps {
    data?: VendorDTO;
}
export default ({ data, ...props }: Props) => {
    return (
        <>
            <Drawer
                {...props}
                width={800}
                title={`Information about ${data?.name}`}
                styles={{
                    body:{
                        backgroundColor:"#fafafa"
                    }
                }}
            >
                <Space direction="vertical" size={12}>
                <Card
                    title="Infomation"
                    size="small"
                >
                    <ProDescriptions
                        dataSource={data}
                        contentStyle={{ fontWeight: "bold" }}
                        column={3}
                        columns={[
                            {
                                key: "code",
                                title: "Code",
                                dataIndex: "code"
                            },
                            {
                                key: "name_en",
                                title: "Name",
                                dataIndex: "name"
                            },
                            {
                                key: "group",
                                title: "Group",
                                dataIndex: "group"
                            },
                            {
                                key: "type",
                                title: "Type",
                                dataIndex: "type"
                            }
                        ]}
                    />
                </Card>
                <Card
                    size="small"
                    title="Contact"
                >
                    <ProDescriptions
                     contentStyle={{fontWeight:"bold"}}
                        dataSource={data}
                        columns={[
                            {
                                key: "phone",
                                title: "Phone1",
                                dataIndex: "phone"
                            },
                            {
                                key: "phone1",
                                title: "Phone2",
                                dataIndex: "phone1"
                            },
                        ]}
                    />
                </Card>
                <Card
                    size="small"
                    title="Address"
                >
                    <ProDescriptions
                    dataSource={data}
                        contentStyle={{fontWeight:"bold"}}
                        columns={[
                            {
                                key: "address",
                                title: "Address",
                                dataIndex: "address",
                                span:3
                            },
                        ]}
                    />
                </Card>
                <Card
                    size="small"
                    title="Specialist"
                >
                    <ProDescriptions
                         contentStyle={{fontWeight:"bold"}}
                        dataSource={data}
                        columns={[
                            {
                                key: "specialist",
                                title: "Specialist",
                                dataIndex: "specialist",
                                span:3
                            },
                        ]}
                    />
                </Card>
                </Space>
            </Drawer>
        </>
    )
}