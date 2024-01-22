import { ProCard, ProDescriptions } from "@ant-design/pro-components"
import { Terms } from "../../types"

export default ({ data }: { data: Terms }) => {
    return <ProCard>
        <ProDescriptions<Terms>

            columns={[
                { label: "Terms", dataIndex: 'terms' }
            ]} dataSource = {data} />
    </ProCard>
}