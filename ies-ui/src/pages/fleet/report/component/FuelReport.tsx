import { DownOutlined, ExportOutlined, FileExcelFilled, FilePdfOutlined, PrinterOutlined, ReloadOutlined } from "@ant-design/icons"
import { ProForm, ProFormText, ProFormSelect, ProFormDatePicker, ProTable, ActionType } from "@ant-design/pro-components"
import { Card, Space, Button, Dropdown } from "antd"
import { MenuProps } from "rc-menu"
import { simpleRequestActions } from "@/services/model"
import { FuelServiceAPI } from "../../fuel/service"
import { FuelDTO } from "../../fuel/data"
import { useRef } from "react"



export default () => {
    const requestActions = simpleRequestActions();
    const actionRef = useRef<ActionType>();
    const items: MenuProps["items"] = [
        {
            key: "1",
            label: "Excel",
            itemIcon: <FileExcelFilled />
        },
        {
            key: "2",
            label: "PDF",
            itemIcon: <FilePdfOutlined />
        },
    ]

    const dateIitem: MenuProps["items"] = [
        {
            key: "1",
            label: "Dialy",
            itemIcon: <FileExcelFilled />
        },
        {
            key: "2",
            label: "Monthly",
            itemIcon: <FilePdfOutlined />
        },
        {
            key: "3",
            label: "Yearly",
            itemIcon: <FilePdfOutlined />
        },
    ]

    return (
        <ProTable<FuelDTO>
            showHeader={false}
            headerTitle={false}
            options={false}
            searchFormRender={(props, defualtDom) => {
                return (
                    <Card
                        bodyStyle={{ padding: "3px 10px", margin: 0 }}
                    >
                        <ProForm
                            submitter={false}
                        >
                            <div
                                style={{
                                    display: "flex",
                                    justifyContent: "space-between"
                                }}
                            >
                                <Space>
                                    <ProFormText
                                        name={"searchValue"}
                                        label={"Search"}
                                    />
                                    <ProFormSelect
                                        label="Driver"
                                    />

                                    <ProFormDatePicker.Month
                                        label="Date"
                                        addonBefore={<Dropdown
                                            menu={{
                                                items: dateIitem,
                                                style: {
                                                    width: 200
                                                }
                                            }}
                                        >
                                            <Button type="primary" icon={<DownOutlined />}>Type</Button>
                                        </Dropdown>}
                                    />
                                    <Button type="primary" icon={<PrinterOutlined />}>Print</Button>
                                    <Dropdown
                                        menu={{
                                            items,
                                            style: {
                                                width: 200
                                            }
                                        }}
                                    >
                                        <Button type="primary" icon={<ExportOutlined />}>Export <DownOutlined /></Button>
                                    </Dropdown>
                                </Space>
                                <Space>
                                    <ReloadOutlined/>
                                </Space>
                            </div>


                        </ProForm >

                    </Card >
                )
            }}
            actionRef={actionRef}
            request={async () => {
                const data = await FuelServiceAPI(requestActions).page({
                    criteria: { searchValue: "", advanceSearch: {} }
                });


                return Promise.resolve({
                    data: data.items,
                    success: true
                });

            }}
            columns={[
                {
                    title: "No",
                    render: (_, r) => 1
                },
                {
                    title: "Truck",
                    dataIndex: "plateNumber"
                },
            ]}

        />
    )
}