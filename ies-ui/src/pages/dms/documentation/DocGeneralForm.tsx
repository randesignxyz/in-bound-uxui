import { ProFormText, ProFormSelect, ProFormTextArea } from "@ant-design/pro-components";
import { Row, Col, Space } from "antd";
import { CoreServiceAPI } from "../service";
import { DepartmentServiceAPI } from "../setting/components/department/service";
import { simpleRequestActions } from "@/services/model";

interface Props {
    lookupData?: LookupDataDTO[];
}
export default ({ lookupData }: Props) => {
    const requestAction = simpleRequestActions();
    return (
        <>
            <Row
                gutter={16}
            >
                <Col span={6}>
                    <ProFormText
                        label={"Document Number"}
                        name={"docNumber"}
                        rules={[
                            {
                                min: 4,
                                max: 100
                            }
                        ]}
                    />
                </Col>
                <Col span={18}>
                    <ProFormText
                        label={"Document Name"}
                        name={"docName"}
                        rules={[{ required: true }]}
                    />
                </Col>

                <Col span={12}>
                    <ProFormSelect
                        rules={[{ required: true }]}
                        label={"OpCo"}
                        name={"opCo"}
                        showSearch
                        fieldProps={{
                            filterOption:false
                        }}
                        request={async () => {
                            const data = await CoreServiceAPI(requestAction).orgUnitList();
                            return data.map(v => ({ label: <Space  size={"small"}><span>{v.name}</span><span style={{color:"gray"}}>{v.description}</span></Space>, value: v.id }))
                        }}
                    />
                </Col>
                <Col span={12}>
                    <ProFormSelect
                        name={"department"}
                        rules={[{ required: true }]}
                        label="Department"
                        showSearch
                        fieldProps={{
                            filterOption:false
                        }}
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