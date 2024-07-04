import { simpleRequestActions } from "@/services/model";
import { ProFormSelect, ProFormDependency } from "@ant-design/pro-components";
import { Col } from "antd";
import { CoreServiceAPI } from "../service";
import { useEffect, useState } from "react";
import DocLegalForm from "./DocLegalForm";
import DocGeneralForm from "./DocGeneralForm";
import { DocumentationDTO } from "./data";

interface Props{
    data?:DocumentationDTO
}
export default ({ data }:Props) => {
    const requestAction = simpleRequestActions();
    const [lookupData, setLookupData] = useState<LookupDataDTO[]>();
    const onLookupData = async()=>{
        const data =await CoreServiceAPI(requestAction).listLookupData({
            type:"DOC"
        });
        setLookupData(data);
      }
      useEffect(()=>{
         onLookupData();
      },[]);

    return (<>
        <Col span={24}>
            <ProFormSelect
                label="Please Select Document Type"
                name={"category"}
                initialValue={"GENERAL"}
                disabled={data?true:false}
                options={[
                    {
                        value: "GENERAL",
                        label: "General"
                    },
                    {
                        value: "LEGAL",
                        label: "Legal"
                    },
                ]}
            />
        </Col>
            <ProFormDependency dependencies={["category"]} name={["category"]}>
                {({category})=>{
                    return category=="GENERAL" && (<DocGeneralForm lookupData={lookupData} />)|| <DocLegalForm lookupData={lookupData} />
                }}
            </ProFormDependency>
    </>)
}