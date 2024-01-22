import { outletType } from "@/services/crm/data";
import { LookupData, LookupDataItem } from "@/services/data";
import { ProFormField, ProFormSelect, ProFormTextArea } from "@ant-design/pro-form";
import { Col, Row } from "antd";

interface Props {
    layoutConfig: {
        supplySource?: boolean
    }
    
    outletTypeList?: outletType[];
    lookupDataList?: LookupData[];
    seList?: LookupDataItem[];
    supplySourceList?: LookupDataItem[];
}

const BasicEntryForm: React.FC<Props> = ({ layoutConfig, outletTypeList, lookupDataList, seList, supplySourceList }) => {
    return (
        <div>
            <Row gutter={40}>
                <Col flex='400px'>

                    <ProFormField help={<span />} rules={[{ required: true }]} label='Customer Name (KH)' name='internalName' />
                    <ProFormField help={<span />} label='Customer Name (Latin)' name='name' />
                    <ProFormField help={<span />} label='Owner Name (KH)' name='ownerName' />
                    <ProFormTextArea fieldProps={{ rows: 1 }} label="Remarks" name='description' />
                </Col>

                <Col flex='400px'>
                    <ProFormSelect
                        name={'divisionId'}
                        label="Division"
                        showSearch
                        rules={[{ required: true }]}

                        options={lookupDataList?.filter(it => it.type == 'CUSTOMER_DIVISION')?.map(it => {
                            return { value: it.id, label: it.name }
                        })} />
                    <ProFormSelect
                        name='outletTypeId'
                        help={<span />}
                        rules={[{ required: true }]}
                        label="Outlet Type"
                        showSearch
                        fieldProps={{
                            optionLabelProp: "label",
                            filterOption: (input, option) => (option?.label?.toString() || '').toLowerCase().indexOf(input.toLowerCase()) >= 0,
                        }}

                        options={outletTypeList?.map(it => {
                            return { value: it.id, label: it.name }
                        })}
                    />
                    <ProFormField label="Main Channel" name='mainChannel' readonly />
                    <ProFormField label="Sub Channel" name='subChannel' readonly />
                </Col>
                <Col flex='Auto'>
                </Col>
            </Row>

        </div>
    )
}

export default BasicEntryForm