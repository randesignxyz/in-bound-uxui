import { Card, Flex, Table } from "antd"
import IPOHeaderForm from "./IPOHeaderForm"
import SectionForm from "./SectionForm"
import Section2Form from "./Section2Form"
import Section3Form from "./Section3Form"

interface Props {

}
const IPOForm: React.FC<Props> = ({ }) => {

    return (
        <>
            <Card size="small">
                <Flex vertical gap={16}>
                    <IPOHeaderForm
                        basiceInfo={{
                            employeeId: "002330",
                            employeeName: "Pheun Reach",
                            position: "Senior Developer, Application Development",
                            company: "OFL",
                            function: "ICT",
                            subFunction: "Application Development",
                            fmName: "KAUV Seth Pisal",
                            subFmName: "KHOM Thol"
                        }}
                    />
                    <SectionForm />
                    <Section2Form />
                    <Section3Form />
                </Flex>
            </Card>
        </>
    )
}

export default IPOForm
