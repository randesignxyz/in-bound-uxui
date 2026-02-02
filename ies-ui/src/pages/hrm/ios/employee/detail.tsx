import { Card, Flex } from "antd"
import React from "react"

interface Props {
    id: number;

}
const EmpoyeeIosDetail: React.FC<Props> = ({ id }) => {
    return <>
        <Flex>
            <Card title={"General information"}>

            </Card>
        </Flex>
    </>
}

export default EmpoyeeIosDetail