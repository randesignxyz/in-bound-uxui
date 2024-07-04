import { ProFormDatePicker, ProFormSelect, ProFormText, ProFormTextArea } from "@ant-design/pro-components"
import { Col, Row, Space } from "antd"
import { CoreServiceAPI } from "../service";
import { simpleRequestActions } from "@/services/model";
import { DepartmentServiceAPI } from "../setting/components/department/service";

interface Props {
    lookupData?: LookupDataDTO[];
}
export default ({ lookupData }: Props) => {
    const requestAction = simpleRequestActions();
    return (
        <>
            <Row gutter={12}>
                <Col span={6}>
                    <ProFormText
                        rules={[{ required: true }]}
                        label="Document Number"
                        name={"docNumber"}
                    />
                </Col>
                <Col span={18}>
                    <ProFormText
                        rules={[{ required: true }]}
                        label="Document Name"
                        name={"docName"}
                    />
                </Col>
                <Col span={8}>
                    <ProFormText
                        rules={[{ required: true }]}
                        label={"Organization"}
                        name={"institute"}
                      
                    />
                </Col>
                <Col span={8}>
                    <ProFormSelect
                        rules={[{ required: true }]}
                        label="Opcos"
                        name={"opCo"}
                        fieldProps={{
                            filterOption:false
                        }}
                        showSearch
                        request={async (k:{keyWords:string}) => {
                            const data = await CoreServiceAPI(requestAction).orgUnitList();
                            return data.map(v => ({ label: <Space  size={"small"}><span>{v.name}</span><span style={{color:"gray"}}>{v.description}</span></Space>, value: v.id }))
                        }}
                    />
                </Col>
                <Col span={8}>
                    <ProFormSelect
                        name={"department"}
                        rules={[{ required: true }]}
                        label="Function"
                        showSearch
                        request={async (k: { keyWords: string }) => {
                            const data = await DepartmentServiceAPI(requestAction).page({
                                criteria: {
                                    searchValue: k.keyWords || ""
                                }
                            });
                            return data.items?.map(v => ({ label: <Space  size={"small"}><span>{v.name}</span><span style={{color:"gray"}}>{v.description}</span></Space>, value: v.id }))
                        }}
                    />
                </Col>
                <Col span={8}>
                    <ProFormDatePicker
                        rules={[{ required: true }]}
                        name={"issuedDate"}
                        label="Issued Date"
                        width={"md"}
                    />
                </Col>
                <Col span={8}>
                    <ProFormDatePicker
                        rules={[{ required: true }]}
                        name={"expiryDate"}
                        label="Valid Date"
                        width={"md"}
                    />
                </Col>
                <Col span={24}>
                    <ProFormTextArea
                        name={"description"}
                        label="Description"
                    />
                </Col>
            </Row>
        </>
    )
}