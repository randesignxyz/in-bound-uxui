import React, { useState } from 'react';
import { Card, Table, Typography, Flex, Input } from 'antd';
import type { ProColumns } from '@ant-design/pro-components';
import { EditableProTable } from '@ant-design/pro-components';

const { Text } = Typography;

interface DataType {
    key: string;
    achievements: string;
    strengths: string;
    developmentArea: string;
}

const defaultData: DataType[] = [
    {
        key: '1',
        achievements: '1- Successfully delivered SFA Version I and II',
        strengths: '1- Strong technical skill both backend and frontend',
        developmentArea: '1- System Architecture Design, DevOps, System Security',
    },
    {
        key: '2',
        achievements: '2- Flexible Sale Promotion and Pricing Engine',
        strengths: '2- Hard working',
        developmentArea: '2- DBA and Mobile App to be Fullstack Development',
    },
    {
        key: '3',
        achievements: '3- Successfully implemented prospect customer',
        strengths: '3- Fast learner, easy to adopt new technology',
        developmentArea: '3- Task and Time Management',
    },
    {
        key: '4',
        achievements: '4- Successfully implemented customer verification',
        strengths: '4- Team work',
        developmentArea: '4- Team Lead',
    },
    {
        key: '5',
        achievements: '5-',
        strengths: '5-',
        developmentArea: '5-',
    },
];

const Section3Form: React.FC = () => {
    const [editableKeys, setEditableRowKeys] = useState<React.Key[]>([]);
    const [dataSource, setDataSource] = useState<DataType[]>(defaultData);

    const columns: ProColumns<DataType>[] = [
        {
            title: 'ACHIEVEMENTS',
            dataIndex: 'achievements',
            key: 'achievements',
            valueType: 'textarea',
            onHeaderCell: () => ({
                style: { backgroundColor: '#bfbfbf', fontWeight: 'bold' } // Gray header
            }),
            render: (_, record) => <div style={{ whiteSpace: 'pre-wrap' }}>{record.achievements}</div>,
        },
        {
            title: 'STRENGTHS',
            dataIndex: 'strengths',
            key: 'strengths',
            valueType: 'textarea',
            onHeaderCell: () => ({
                style: { backgroundColor: '#bfbfbf', fontWeight: 'bold' } // Gray header
            }),
            render: (_, record) => <div style={{ whiteSpace: 'pre-wrap' }}>{record.strengths}</div>,
        },
        {
            title: 'DEVELOPMENT AREA',
            dataIndex: 'developmentArea',
            key: 'developmentArea',
            valueType: 'textarea',
            onHeaderCell: () => ({
                style: { backgroundColor: '#bfbfbf', fontWeight: 'bold' } // Gray header
            }),
            render: (_, record) => <div style={{ whiteSpace: 'pre-wrap' }}>{record.developmentArea}</div>,
        },
    ];

    return (
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
            <EditableProTable<DataType>
                columns={columns}
                rowKey="key"
                value={dataSource}
                onChange={setDataSource}
                recordCreatorProps={{
                    newRecordType: 'dataSource',
                    position: 'bottom',
                    record: () => ({ key: Date.now().toString(), achievements: `${dataSource.length + 1}- `, strengths: `${dataSource.length + 1}- `, developmentArea: `${dataSource.length + 1}- ` } as DataType),
                }}
                editable={{
                    type: 'multiple',
                    editableKeys,
                    onChange: setEditableRowKeys,
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
                    0
                </div>
                <div style={{ padding: '16px', width: '100px', display: 'flex', justifyContent: 'center', alignItems: 'center', borderLeft: '1px solid black' }}>
                    /50
                </div>
            </div>
        </Flex>
    );
};

export default Section3Form;
