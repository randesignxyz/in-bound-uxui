import { ProFormSelect, ProFormText, ProFormDigit, ProFormTextArea, ProFormDatePicker, ProFormCheckbox, ProFormDependency } from "@ant-design/pro-components";
import { Row, Col, Divider, Flex, Button, Input, Space, InputRef } from "antd";
import { CoreServiceAPI } from "../service";
import { DepartmentServiceAPI } from "../setting/components/department/service";
import { CompanySerivceAPI } from "./company/service";
import { simpleRequestActions } from "@/services/model";
import { PlusOutlined } from "@ant-design/icons";
import { useEffect, useRef, useState } from "react";
import ContractGeneral from "./ContractGeneral";
import ContractPurchase from "./ContractPurchase";
import ContractSales from "./ContractSales";
import { DocumentationDTO } from "../documentation/data";
interface Props{
  data?:DocumentationDTO
}

export default ({data}:Props) => {
    const requestAction = simpleRequestActions();
    const [lookupData, setLookupData] = useState<LookupDataDTO[]>();
    const onLookupData = async()=>{
        const data =await CoreServiceAPI(requestAction).listLookupData({
            type:"CONTRACT"
        });
        setLookupData(data);
      }

      useEffect(()=>{
         onLookupData();
      },[])



    return (<>
        <ProFormSelect
            label="Please Select Contract Type"
            initialValue={"GENERAL"}
            name={"category"}
            disabled={data?true:false}
            // options={lookupData?.filter(i=>i.type="DOC").map(o=>({label:o.name, value:o.id}))}
            options={[
              {
                value: "GENERAL",
                label: "General"
              },
              {
                value: "PURCHASE",
                label: "Purchase"
              },
              {
                value: "SALES",
                label: "Sales"
              },
            ]}
          />

          <ProFormDependency dependencies={["category"]} name={["category"]}>
            {({category})=>{
                return category ==="GENERAL" &&(<ContractGeneral lookupData={lookupData} />)||
                category==="PURCHASE" && (<ContractPurchase lookupData={lookupData}/>)||
                category ==="SALSE" &&(<ContractSales/>)
            }}
          </ProFormDependency>
    



    </>)
}