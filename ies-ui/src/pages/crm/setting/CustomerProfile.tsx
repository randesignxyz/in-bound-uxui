import { CrmServiceAPI } from "@/services/crm/services";
import { simpleRequestActions } from "@/services/model";
import { ArrowRightOutlined } from "@ant-design/icons";
import { ProForm, ProFormSelect } from "@ant-design/pro-components";
import { useQuery } from "@umijs/max";
import { Button, Card, Flex } from "antd";
import { useForm } from "antd/es/form/Form";
import { CrmServices } from "../services";


export default () => {
    const requestAction = simpleRequestActions();
    const api = CrmServiceAPI();
    const [form] = useForm();
    const { data, isFetching, refetch } = useQuery({
        queryKey: ["customer-profile"],
        queryFn: () => CrmServices.listRelationshipData().query()
    })

    return <Card>
        <ProForm layout="horizontal" submitter={false}>
            <Flex justify="space-between" gap={12} align="baseline" >
                <div style={{ flex: 1 }}>
                    <ProFormSelect
                        name={"target"}
                        label="Target"
                        mode="multiple"
                        fieldProps={{
                            style: {
                                width: "100%",
                            },
                        }}
                        request={async () => {
                            const data = await CrmServices.listLookupData(["SALE_MAIN_CHANNEL", "SALE_SUB_CHANNEL"]).query()
                            return data?.map((item: any) => ({
                                label: item.name,
                                value: item.id,
                            }))
                        }}
                    // options={[
                    //     { label: "Target 1", value: "target1" },
                    //     { label: "Target 2", value: "target2" },
                    //     { label: "Target 3", value: "target3" },
                    // ]}
                    />
                </div>
                <ArrowRightOutlined />
                <div style={{ flex: 1 }}>
                    <ProFormSelect
                        name={"destination"}
                        label="Destination"
                        fieldProps={{
                            style: {
                                width: "100%",
                            },
                        }}
                        options={[
                            { label: "Destination 1", value: "destination1" },
                            { label: "Destination 2", value: "destination2" },
                            { label: "Destination 3", value: "destination3" },
                        ]}
                    />
                </div>
                <Button>Transfer</Button>
            </Flex>
        </ProForm>
    </Card>
};