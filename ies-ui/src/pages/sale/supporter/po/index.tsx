import PageWrapper from "@/components/PageWrapper"
import { useQuery } from "@umijs/max"
import { SupporterServiceAPI } from "../services"
import { simpleRequestActions } from "@/services/model"
import { ProCard, ProColumns, ProTable } from "@ant-design/pro-components"
import { useEffect, useState } from "react"

type TableListItem = {
    createdAtRange?: number[];
    createdAt: number;
    code: string;
};

const DetailList: React.FC<any> = (props) => {
    const { ip } = props;


    const columns: ProColumns<any>[] = [
        {
            title: 'Issued Date',
            key: 'createdAt',
            dataIndex: 'createdDate',
            valueType: 'dateTime',
        },
        {
            title: 'Old Date',
            key: 'code',
            width: 80,
            dataIndex: 'oldValue',
            valueType: 'code',
        },
        {
            title: 'New Data',
            key: 'option',
            width: 80,
            valueType: 'option',

            render: () => [<a key="a">预警</a>],
        },
    ];

    // useEffect(() => {
    //     const source = [];
    //     for (let i = 0; i < 15; i += 1) {
    //         source.push({
    //             createdAt: Date.now() - Math.floor(Math.random() * 10000),
    //             code: `const getData = async params => {
    //       const data = await getData(params);
    //       return { list: data.data, ...data };
    //     };`,
    //             key: i,
    //         });
    //     }

    //     setTableListDataSource(source);
    // }, [ip]);
    console.log(ip);

    return (
        <ProTable
            columns={columns}
            dataSource={ip}
            pagination={{
                pageSize: 3,
                showSizeChanger: false,
            }}
            rowKey="id"
            toolBarRender={false}
            search={false}
        />
    );
};


export default () => {
    const requestActions = simpleRequestActions();
    const { data, isFetching, refetch } = useQuery({
        queryKey: ["As"],
        queryFn: () => SupporterServiceAPI(requestActions).page({}),
        refetchOnWindowFocus: false,
        retry: 2
    })
    const [ip, setIp] = useState<any>();
    console.log(ip);

    return (
        <ProCard>
            <ProCard>
                {/* <ProTable
                    options={false}
                    dataSource={data?.items}
                    onSe
                    columns={[
                        {
                            title: "PO Code",
                            render: (_, r) => r?.entry?.purchaseOrderCode
                        },
                        {
                            title: "Type",
                            dataIndex: "changeType"
                        },
                        {
                            title: "Issue By",
                            dataIndex: "createdBy"
                        },
                    ]}
                /> */}
                <PageWrapper

                    listView={{
                        type: "Table",
                        onRefresh: refetch,
                        props: {
                            dataSource: data?.items,
                            loading: isFetching,
                            rowKey: "id",
                            // rowSelection:{
                                
                            //     onChange:(selectedRowKeys, selectedRows, info)=> {
                            //         console.log(info);
                                    
                            //         // setIp(info)
                            //     },
                            // },
                            onRow: (record) => {
                                console.log(record);

                                return record
                            },
                            columns: [
                                {
                                    title:"id",
                                    dataIndex:"id"
                                },
                                {
                                    title: "PO Code",
                                    render: (_, r) => r?.entry?.purchaseOrderCode
                                },
                                {
                                    title: "Type",
                                    dataIndex: "changeType"
                                },
                                {
                                    title: "Issue By",
                                    dataIndex: "createdBy"
                                },
                            ]
                        }
                    }}
                />
            </ProCard>
            <ProCard title={ip}>
                <DetailList ip={ip} />
            </ProCard>
        </ProCard>


    )
}