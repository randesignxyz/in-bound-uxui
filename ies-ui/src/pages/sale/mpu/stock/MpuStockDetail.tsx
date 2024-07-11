import { PageContainer, ProDescriptions } from "@ant-design/pro-components"
import { history } from "@umijs/max"
import { Card, Flex } from "antd"

interface Props {
}

const MpuStockDetail: React.FC<Props> = () => {
    return (
        <PageContainer
            onBack={() => history.push("/sale/mpu_stock/list")}
            title="Stock Detail"
            subTitle="000099338"
        >
            <Flex
                gap={16}
            >
                <Card
                >
                    <ProDescriptions
                        columns={[
                            {
                                title: "Hello world ",
                                dataIndex: "as"    
                            }
                        ]}
                    />
                </Card>
            </Flex>
        </PageContainer>
    )
}
export default MpuStockDetail