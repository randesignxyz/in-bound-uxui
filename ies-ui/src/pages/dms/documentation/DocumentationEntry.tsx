import { simpleRequestActions } from "@/services/model";
import { ProFormText, ProFormSelect, ProFormTextArea } from "@ant-design/pro-components";
import { Row, Col } from "antd";
import { CoreServiceAPI } from "../service";
import { CategoryServiceAPI } from "../setting/components/category/service";
import { DepartmentServiceAPI } from "../setting/components/department/service";
import { DocumentTypeServiceAPI } from "../setting/components/documentType/service";
import { useState } from "react";



export default () => {
    const requestAction = simpleRequestActions();
    const [documentTypeHasExpire, setDocumentTypeHasExpire] = useState<DocumentTypeDTO[]>([]);

    return (<>
        <Row
            gutter={16}
        >
            <Col span={10}>
                <ProFormText
                    label={"Document Title"}
                    name={"docName"}
                    rules={[{ required: true }]}
                />
            </Col>

            <Col span={6}>
                <ProFormText
                    label={"Document Number"}
                    name={"docNumber"}
                    rules={[
                        {
                            min: 4,
                            max: 20
                        }
                    ]}
                />

            </Col>
            <Col span={8}>
                <ProFormSelect
                    label={"Category"}
                    name={"category"}
                    showSearch
                    debounceTime={500}
                    request={async (k: { keyWords: string }) => {
                        const data = await CategoryServiceAPI(requestAction).page({
                            criteria: { searchValue: k.keyWords || "" }
                        });
                        return data.items.map(it => ({
                            label: it.name,
                            value: it.id
                        }));

                    }}
                />
            </Col>
            <Col span={8}>
                <ProFormSelect
                    rules={[{ required: true }]}
                    label={"Organization Unit"}
                    name={"buId"}
                    showSearch
                    request={async () => {
                        const data = await CoreServiceAPI(requestAction).orgUnitList();
                        return data.map(v => ({ label: v.name, value: v.id }))
                    }}
                />
            </Col>
            <Col span={8}>
                <ProFormSelect
                    name={"department"}
                    rules={[{ required: true }]}
                    label="Department"
                    request={async (k: { keyWords: string }) => {
                        const data = await DepartmentServiceAPI(requestAction).page({
                            criteria: {
                                searchValue: k.keyWords || ""
                            }
                        });

                        return data.items?.map(v => ({ label: v.name, value: v.id }))
                    }}
                />
            </Col>
            <Col span={8}>
                <ProFormSelect
                    rules={[{ required: true }]}
                    label="Document Type"
                    name={"docType"}
                    showSearch
                    request={async (k: { keyWords: string }) => {
                        const data = await DocumentTypeServiceAPI(requestAction).page({
                            criteria: { searchValue: k.keyWords || "" }
                        });
                        setDocumentTypeHasExpire(data.items);

                        return data.items.map((v) => ({ value: v.id, label: v.name }))
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
      
    </>)

}