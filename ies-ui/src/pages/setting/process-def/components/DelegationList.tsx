import { Button, Flex } from "antd"
import DelegationForm from "./DelegationForm"
import { PlusCircleFilled } from "@ant-design/icons"
import { ProList } from "@ant-design/pro-components"
import { Delegation, SaveFirstLevelApproval } from "@/services/process-workflow/data"
import { useState } from "react"

export default ({ destination }: { destination?: SaveFirstLevelApproval; }) => {

    const [delegationList, setDelegationList] = useState<Delegation[]>([])

    return <>
        <Flex justify='flex-end'>
            <Flex>
                <DelegationForm destination={destination} onAdd={data => {
                    setDelegationList(v => [...v, data])
                }} trigger={<Button type='link' icon={<PlusCircleFilled />} />} />
            </Flex>
        </Flex>
        <ProList<Delegation> dataSource={delegationList} metas={{
            title: {
                render: (_, entity) => entity.user.userName
            }
        }} />
    </>
}