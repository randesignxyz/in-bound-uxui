
import { ContractDetail } from "@/services/crm/data";
import { Col, Form, Input, Row } from "antd";
import TextArea from "antd/lib/input/TextArea";
import moment from "moment";
import React from "react"
import { InitData, LayoutConfig } from "../model";
import "@/pages/index.less";
import { duration, formatDate } from "@/pages/utils";
import TermView from "./TermView";
import ProForm from "@ant-design/pro-form";

const layout = {
    labelCol: { span: 6 },
    wrapperCol: { span: 16 },
};

interface Props {
    initalData?: InitData;
    data?: ContractDetail;
    layoutConfig?: LayoutConfig;
}

const ContractInfo: React.FC<Props> = ({ initalData, data, layoutConfig }) => {
    return <Form {...layout}  >
        <ProForm.Group title='Info'/>
        <Row gutter={10}>
            <Col flex='500px'>
                <Form.Item label="Contact No">
                    <Input value={data?.contractNo || "Not Assigned"} />
                </Form.Item>
                <Form.Item label="Contact Status">
                    <Input value={data?.contractSubType.name} />
                </Form.Item>
                <Form.Item label="Contact Type">
                    <Input value={[data?.contractType.name, data?.subContractType.name].filter(it => it).join("/")} />
                </Form.Item>
                <Form.Item label="Budget Code">
                    <Input value={data?.subContractType.budgetCode} />
                </Form.Item>
            </Col>
            <Col flex='500px'>
                <Form.Item label="Effective Date">
                    <Input value={formatDate(moment(data?.effectiveDate))} />
                </Form.Item>
                <Form.Item label="Expiry Date">
                    <Input value={formatDate(moment(data?.expireDate))} />
                </Form.Item>
                <Form.Item  {...layout} label='Duration'>
                    <Input value={duration(moment(data?.effectiveDate), moment(data?.expireDate))} />
                </Form.Item>
                <Form.Item  {...layout} label='Remarks'>
                    <TextArea value={data?.remarks} />
                </Form.Item>

            </Col>
            <Col flex = "Auto"/>
        </Row>
        <ProForm.Group title='Term'/>
        <TermView data={data} layoutConfig={layoutConfig} />


    </Form>
}
export default ContractInfo