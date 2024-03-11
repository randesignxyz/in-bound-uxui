import { ProCard, ProDescriptions } from "@ant-design/pro-components"
import { Badge, Button, Col, Divider, Row, Space } from "antd"
import React, { useState } from "react";
import { InfoCircleOutlined } from "@ant-design/icons";
import CompanyDetail from "./company/CompanyDetail";
import { DocumentationDTO } from "../documentation/data";
import { formatDate } from "@/pages/utils";
import { expriationStatus } from "../core";
import ContractGeneralDetail from "./ContractGeneralDetail";
import ContractPurchaseDetail from "./ContractPurchaseDetail";
import ContractSalseDetail from "./ContractSalseDetail";

interface Props {
    document?: DocumentationDTO;
    actionRef?: any
}
export default ({ document, actionRef }: Props) => {
    const [companyState, setCompanyState] = useState<{
        visible?: {
            name: "MODAL";
            type: "ADD" | "EDIT";
            payload?: CompanyDTO;
        }
    }>();


    return (
        <>
            { 
                document?.documentation.contractCategory =="GENERAL" && (<ContractGeneralDetail document={document} actionRef={actionRef} />)||
                document?.documentation.contractCategory =="PURCHASE" && (<ContractPurchaseDetail document={document} actionRef={actionRef} />)||
                document?.documentation.contractCategory =="SALSE" && (<ContractSalseDetail document={document} actionRef={actionRef} />)
            }
            

            <CompanyDetail
                open={companyState?.visible?.name == "MODAL"}
                onClose={() => setCompanyState({ visible: undefined })}
                data={companyState?.visible?.payload}
            />
        </>
    )
}
