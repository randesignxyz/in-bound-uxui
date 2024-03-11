import { simpleRequestActions } from "@/services/model";
import { ProFormCheckbox, ProFormDatePicker, ProFormDigit, ProFormSelect, ProFormText, ProFormTextArea } from "@ant-design/pro-components"
import { Col, Divider, Row } from "antd"
import { DepartmentServiceAPI } from "../setting/components/department/service";
import { CoreServiceAPI } from "../service";

interface Props {
    lookupData?: LookupDataDTO[]
}

const ContractPurchase: React.FC<Props> = ({ lookupData }) => {
    const requestAction = simpleRequestActions();


    return (
        <>
            <Divider plain orientation="left">Contruct Information</Divider>
            <Row gutter={12}>

                <Col span={6}>
                    <ProFormText
                        name={"docNumber"}
                        label="Contract Number"
                        rules={[{ required: true, max: 20 }]}
                    />
                </Col>
                <Col span={18}>
                    <ProFormText
                        label="Contract Title"
                        name={"docName"}
                        rules={[{ required: true }]}
                    />
                </Col>
            </Row>
            <Row gutter={12}>
                <Col span={8}>
                    <ProFormSelect
                        label="Vendor Name"
                        name={"vendorName"}
                        rules={[{ required: true }]}
                        showSearch
                        debounceTime={500}
                        fieldProps={{
                            filterOption: false
                        }}
                        request={async (k: { keyWords: string }) => {
                            const data = await CoreServiceAPI(requestAction).pageVendor({
                                criteria: {
                                    searchValue: k.keyWords || ""
                                }
                            });

                            return data.items?.map(o => ({
                                value: o.id,
                                label: o.name
                            }))
                        }}
                    />
                </Col>
                <Col span={5}>
                    <ProFormSelect
                        label="OpCo"
                        name={"opCo"}
                        rules={[{ required: true }]}
                        request={async () => {
                            const data = await CoreServiceAPI(requestAction).orgUnitList();
                            return data.map(v => ({ label: v.name, value: v.id }))
                        }}
                    />
                </Col>
                <Col span={5}>
                    <ProFormSelect
                        label="Function"
                        name={"department"}
                        showSearch
                        rules={[{ required: true }]}
                        request={async (k: { keyWords: string }) => {
                            const data = await DepartmentServiceAPI(requestAction).page({
                                criteria: {
                                    searchValue: k.keyWords || ""
                                }
                            });
                            return data.items.map(o => ({ value: o.id, label: o.name }))
                        }}
                    />
                </Col>
                <Col span={6}>
                    <ProFormSelect
                        label="Currency"
                        name={"currency"}
                        showSearch
                        rules={[{ required: true }]}
                        options={lookupData?.filter(o=>o.code==="CURRENCY").map(ob=>({value:ob.id, label:ob.name}))}
                    />
                </Col>
                <Col span={24}>
                    <ProFormTextArea
                        name={"description"}
                        label="Contract Short Description"
                    />
                </Col>
            </Row>

            <Divider plain orientation="left">Term and Condiction</Divider>
            <Row gutter={12}>
                <Col span={5}>
                    <ProFormSelect
                        label="Type"
                        showSearch
                        name={"type"}
                        rules={[{required:true}]}
                        options={lookupData?.filter(it => it.code === "TYPE").map(o => ({ value: o.id, label: o.name }))}
                    />
                </Col>
                <Col span={5}>
                    <ProFormDatePicker
                        name={"effectiveDate"}
                        label="Effective Date"
                        width={"md"}
                        rules={[{ required: true }]}
                    />
                </Col>
                <Col span={5}>
                    <ProFormDatePicker
                        name={"expiryDate"}
                        label="Expiry Date"
                        width={"md"}
                        rules={[{ required: true }]}
                    />
                </Col>

                <Col span={6}>
                    <ProFormDigit
                        name={"noticePeriod"}
                        label="Notice Peroid Day"
                        addonAfter={"days"}
                        rules={[{ required: true, }]}
                    />
                </Col>

                <Col span={3}>
                    <ProFormCheckbox
                        initialValue={true}
                        labelAlign="left"
                        label="Sen Email"
                        name={"sendEmail"}
                    />
                </Col>
            </Row>
            <Row gutter={16}>
                <Col span={8}>
                    <ProFormText
                        label="Warranty"
                        name={"warranty"}
                        rules={[{ required: true, }]}
                    />
                </Col>
                <Col span={8}>
                    <ProFormText
                        label="Penalty Clause"
                        name={"penaltyClause"}
                        rules={[{ required: true, }]}
                    />
                </Col>
                <Col span={8}>
                    <ProFormText
                        label="Term of Payment"
                        name={"termPayment"}
                        rules={[{ required: true, }]}
                    />
                </Col>
            </Row>

            <Divider plain orientation="left">Accountant</Divider>
            <Row gutter={16}>
                <Col span={8}>
                    <ProFormDigit
                        label="Total Amount"
                        name="totalAmount"
                    />
                </Col>
                <Col span={8}>
                    <ProFormDigit
                        label="Final Amount"
                        name={"finalAmount"}
                    />
                </Col>
                <Col span={8}>
                    <ProFormText
                        label="PO"
                        name={"po"}
                    />
                </Col>
                <Col span={6}>
                    <ProFormDigit
                        label="Paid"
                        name={"paid"}
                    />
                </Col>
                <Col span={6}>
                    <ProFormDigit
                        label="Balance"
                        name={"balance"}
                    />
                </Col>
                <Col span={12}>
                    <ProFormText
                        label="Comments"
                        name={"comments"}
                    />
                </Col>
            </Row>
        </>
    )
}

export default ContractPurchase