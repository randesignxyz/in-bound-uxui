import { ProDescriptions } from "@ant-design/pro-components"
import { Button, Card, Space } from "antd";
import { useEffect, useState } from "react";
import { Drawer, DrawerProps } from "antd/lib";
import { EditOutlined } from "@ant-design/icons";

interface Props extends DrawerProps {
    comId?: number;
    data?: CompanyDTO;
}

export default ({ comId, data, ...props }: Props) => {
    const [editState, setEditState] = useState<string[]>([]);

    useEffect(() => {
    }, [comId]);
    return (
        <Drawer
            {...props}
            width={600}
            title={`Company Profile #${data?.companyNumber}`}
            extra={[
                <Button type="link" icon={<EditOutlined/>} 
                    onClick={()=>{
                        setEditState([
                            "groupId",
                            "name",
                            "companyNumber",
                            "taxId",
                            "websiteUrl",
                            "companyType",
                            "phone",
                            "address1",
                            "address2",
                            "city",
                            "state",
                            "postalCode",
                            "country",
                        ])
                    }}
                />
            ]}
        >
            <Space
                direction="vertical"
                size={20}
            >
                
                <Card>
                    <ProDescriptions
                        dataSource={data}
                        editable={{
                           editableKeys:editState,
                           actionRender:()=>[]
                        }}
                        onDataSourceChange={(s)=>{
                            console.log(s);
                            
                        }}
                        
                        labelStyle={{
                            width: 150
                        }}
                        column={1}
                        columns={[
                            {
                                title: "Company Name",
                                dataIndex: "name",
                                
                            },
                            {
                                title: "Company Number",
                                dataIndex: "companyNumber"
                            },
                            {
                                title: "Company Group",
                                dataIndex: "groupId"
                            },
                            {
                                title: "Company Tax ID",
                                dataIndex: "taxId"
                            },
                            {
                                title: "Website URL",
                                dataIndex: "websiteUrl"
                            },
                            {
                                title: "Company Type",
                                dataIndex: "companyType"
                            },
                            {
                                title: "Phone",
                                dataIndex: "phone"
                            },
                            {
                                title: "status",
                                dataIndex: "status"
                            },
                            {
                                valueType:"group",
                                title:"Address",
                                editable:false
                            },
                            {
                                title: "Address 1",
                                dataIndex: "address1"
                            },
                            {
                                title: "Address 2",
                                dataIndex: "address2"
                            },
                            {
                                title: "City",
                                dataIndex: "city"
                            },
                            {
                                title: "State",
                                dataIndex: "state"
                            },
                            {
                                title: "Postal Code",
                                dataIndex: "postalCode"
                            },
                            {
                                title: "Country",
                                dataIndex: "country"
                            },
                        ]}

                    />
                </Card>
                <Card>
                    {/* <ProDescriptions
                        dataSource={data}
                        title="Address"
                        column={1}
                        columns={[
                            {
                                title: "Address 1",
                                dataIndex: "address1"
                            },
                            {
                                title: "Address 2",
                                dataIndex: "address2"
                            },
                            {
                                title: "City",
                                dataIndex: "city"
                            },
                            {
                                title: "State",
                                dataIndex: "state"
                            },
                            {
                                title: "Postal Code",
                                dataIndex: "postalCode"
                            },
                            {
                                title: "Country",
                                dataIndex: "country"
                            },
                        ]}
                    /> */}
                </Card>
            </Space>

        </Drawer>
    )
}