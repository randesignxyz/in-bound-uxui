import { simpleRequestActions } from "@/services/model";
import { ProFormText, ProFormSelect, ProFormTextArea, ProFormDependency } from "@ant-design/pro-components";
import { Row, Col } from "antd";
import { CoreServiceAPI } from "../service";
import { CategoryServiceAPI } from "../setting/components/category/service";
import { DepartmentServiceAPI } from "../setting/components/department/service";
import { DocumentTypeServiceAPI } from "../setting/components/documentType/service";
import { useEffect, useState } from "react";
import DocLegalForm from "./DocLegalForm";
import DocGeneralForm from "./DocGeneralForm";
import { DocumentationDTO } from "./data";

interface Props{
    // lookupData:LookupDataDTO[];
    data?:DocumentationDTO
}
export default ({ data }:Props) => {
    const requestAction = simpleRequestActions();
    const [documentTypeHasExpire, setDocumentTypeHasExpire] = useState<DocumentTypeDTO[]>([]);
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
                // options={lookupData?.filter(i=>i.code=="CATEGORY").filter(ob=>ob.type=="DOC").map(o=>({label:o.name, value:o.id}))}
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