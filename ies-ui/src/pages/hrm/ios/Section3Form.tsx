import React, { } from 'react';
import { Card, Flex } from 'antd';
import type { ProColumns } from '@ant-design/pro-components';
import { EditableProTable, ProFormText, ProFormTextArea } from '@ant-design/pro-components';
import { FormSection3, IosSection3Params } from './data';

interface Props {
    dataSource?: IosSection3Params[];
    readOnly?: boolean;
    onValueChange?: (values: IosSection3Params[]) => void;
    finalScore?: number | 0;
    formSetting: FormSection3;
}


const Section3Form: React.FC<Props> = ({ dataSource, readOnly = false, onValueChange, finalScore, formSetting }) => {

    const columns: ProColumns<IosSection3Params>[] = [
        {
            title: 'ACHIEVEMENTS',
            dataIndex: 'achieve',
            key: 'achieve',
            valueType: 'textarea',
            fieldProps: {
                rows: 8,
            },
            onHeaderCell: () => ({
                style: { backgroundColor: '#bfbfbf', fontWeight: 'bold' } // Gray header
            }),
        },
        {
            title: 'STRENGTHS',
            dataIndex: 'strength',
            key: 'strength',
            valueType: 'textarea',
            fieldProps: {
                rows: 8,
            },
            onHeaderCell: () => ({
                style: { backgroundColor: '#bfbfbf', fontWeight: 'bold' } // Gray header
            }),
        },
        {
            title: 'DEVELOPMENT AREA',
            dataIndex: 'develop',
            key: 'develop',
            valueType: 'textarea',
            onHeaderCell: () => ({
                style: { backgroundColor: '#bfbfbf', fontWeight: 'bold' } // Gray header
            }),
            fieldProps: {
                rows: 8,
            },
        },
    ];

    return (
        <Card size='small'>
            {
                !formSetting.showComment && (
                    <Flex vertical gap={8}>
                        {/* Header */}
                        <div style={{ backgroundColor: '#bf9000', padding: '8px 16px', color: 'white' }}>
                            <div style={{ display: 'flex', alignItems: 'center', fontWeight: 'bold', fontSize: '16px' }}>
                                <span>SECTION III: PERFORMANCE SUMMARY</span>
                            </div>
                        </div>
                        {/* Sub-header instructions */}
                        <div style={{ fontSize: '12px', fontStyle: 'italic', marginTop: '4px' }}>
                            What achievements employee has accomplished throughout the fiscal year, their strengths and their development areas.
                            <br />
                            *At least 3 items required
                        </div>

                        {/* Main Table */}
                        <EditableProTable<IosSection3Params>
                            columns={columns}
                            rowKey="key"
                            value={dataSource}
                            onValuesChange={onValueChange}
                            recordCreatorProps={false}
                            editable={{
                                type: 'multiple',
                                editableKeys: readOnly ? [] : dataSource?.map(item => item.key),
                            }}
                            bordered
                            size="small"
                            pagination={false}
                            scroll={{ x: 'max-content' }}
                        />

                        {/* Development Plan Confirmation Row (Simulated as a separate flex grid to match design) */}
                        <div style={{ border: '1px solid #f0f0f0', borderTop: 'none', display: 'flex', fontWeight: 'bold', fontSize: '14px' }}>
                            <div style={{ flex: 1, backgroundColor: '#bfbfbf', padding: '12px', borderRight: '1px solid #f0f0f0', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                DEVELOPMENT PLAN CONFIRMATION
                            </div>
                            <div style={{ flex: 1, padding: '12px', borderRight: '1px solid #f0f0f0', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                Individual Development Plan (IDP)
                            </div>
                            <div style={{ flex: 1, padding: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                Performance Improvement Plan (PIP)
                            </div>
                        </div>

                        {/* Final Score Box */}
                        <div style={{ marginTop: '16px', border: '1px solid black', display: 'flex', fontWeight: 'bold' }}>
                            <div style={{ padding: '16px', flex: 1, borderRight: '1px solid black' }}>
                                FINAL SCORE: (SECTION I + SECTION II)
                            </div>
                            <div style={{ padding: '16px', width: '150px', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                                {finalScore || 0}
                            </div>
                            <div style={{ padding: '16px', width: '100px', display: 'flex', justifyContent: 'center', alignItems: 'center', borderLeft: '1px solid black' }}>
                                /50
                            </div>
                        </div>
                    </Flex>) || (

                    <ProFormTextArea
                        name={"comment"}
                        placeholder={"Comments"}
                        fieldProps={{
                            rows: 6
                        }}
                    // label="Comments"
                    />
                )
            }
        </Card>
    );
};

export default Section3Form;
