import { Button, Card, Flex, Table } from "antd"
import IPOHeaderForm from "./IPOHeaderForm"
import SectionForm from "./SectionForm"
import Section2Form from "./Section2Form"
import Section3Form from "./Section3Form"
import { useEffect, useState } from "react"
import { MasterDataService } from "../master-data/service"
import { MasterDataItem } from "../master-data/data"
import { FooterToolbar, ProForm } from "@ant-design/pro-components"
import { Footer } from "antd/es/layout/layout"

interface Props {

}
const IPOForm: React.FC<Props> = ({ }) => {
    const [masterData, setMasterData] = useState<MasterDataItem[]>([]);
    const getMasterData = async () => {
        const res = await MasterDataService.getItemsByCode(["OBJECTIVES", "RATING_SCALE", "KPI"]);
        setMasterData(res);
    }

    useEffect(() => {
        getMasterData();
    }, []);

    return (
        <>
            <ProForm
                submitter={{
                    render: () => {
                        return (
                            <FooterToolbar portalDom={false}>
                                <Button type="default" danger>Cancel</Button>
                                <Button type="dashed"> Save as Draft</Button>
                                <Button type="primary">Submit</Button>
                            </FooterToolbar>
                        )
                    }
                }}
            >
                {/* <Card size="small" > */}
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
                    <Section2Form masterDate={masterData} />
                    <Section3Form />
                </Flex>
            </ProForm>
            {/* </Card> */}
        </>
    )
}

export default IPOForm
