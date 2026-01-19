import React, { useState } from 'react';
import { Card, Table, Typography, Tag, Flex, Button, Space, message } from 'antd';
import type { ProColumns } from '@ant-design/pro-components';
import { EditableProTable } from '@ant-design/pro-components';
import { DeleteOutlined, EditOutlined } from '@ant-design/icons';
import { Moment } from 'moment';

const { Text } = Typography;

interface DataType {
    key: string;
    no: number;
    objectives: string;
    actionPlan: string;
    kpi: string;
    weight: string;
    startDate?: Moment;
    dueDate?: Moment;
    midYearReview: string;
    selfEvaluation: number;
    yearEndReview: number;
    justification: string;
}

const defaultData: DataType[] = [
    {
        key: '1',
        no: 1,
        objectives: '',
        actionPlan: '',
        kpi: '',
        weight: '',
        startDate: undefined,
        dueDate: undefined,
        midYearReview: '',
        selfEvaluation: 0,
        yearEndReview: 0,
        justification: '',
    },
    {
        key: '2',
        no: 2,
        objectives: '',
        actionPlan: '',
        kpi: '',
        weight: '',
        startDate: undefined,
        dueDate: undefined,
        midYearReview: '',
        selfEvaluation: 0,
        yearEndReview: 0,
        justification: '',
    },
    {
        key: '3',
        no: 3,
        objectives: '',
        actionPlan: '',
        kpi: '',
        weight: '',
        startDate: undefined,
        dueDate: undefined,
        midYearReview: '',
        selfEvaluation: 0,
        yearEndReview: 0,
        justification: '',
    },
    {
        key: '4',
        no: 4,
        objectives: '',
        actionPlan: '',
        kpi: '',
        weight: '',
        startDate: undefined,
        dueDate: undefined,
        midYearReview: '',
        selfEvaluation: 0,
        yearEndReview: 0,
        justification: '',
    },
];

const renderStatus = (status: string) => {
    let color = 'default';
    if (status === 'Completed') color = 'green';
    else if (status === 'On-Track') color = 'blue';
    else if (status === 'At Risk') color = 'orange';

    return <span style={{ color: color === 'orange' ? '#fa8c16' : color, fontWeight: 500 }}>{status}</span>;
};

const SectionForm: React.FC = () => {
    const [editableKeys, setEditableRowKeys] = useState<React.Key[]>(() => defaultData.map((item) => item.key));
    const [dataSource, setDataSource] = useState<DataType[]>(defaultData);
    const [errorRowKey, setErrorRowKey] = useState<string | null>(null);

    const columns: ProColumns<DataType>[] = [
        {
            title: 'No.',
            dataIndex: 'no',
            key: 'no',
            width: 20,
            align: 'center',
            onCell: () => ({ style: { backgroundColor: '#f5f4f4ff', fontWeight: 'bold' } }),
            editable: false,
        },
        {
            title: 'OBJECTIVES',
            dataIndex: 'objectives',
            key: 'objectives',
            // width: 150,
            valueType: 'textarea',
        },
        {
            title: 'ACTION PLAN',
            dataIndex: 'actionPlan',
            key: 'actionPlan',
            // width: 300,
            valueType: 'textarea',
            render: (_, record) => <div style={{ whiteSpace: 'pre-wrap' }}>{record.actionPlan}</div>,
        },
        {
            title: 'KPI',
            dataIndex: 'kpi',
            key: 'kpi',
            // width: 200,
            valueType: 'textarea',
            render: (_, record) => <div style={{ whiteSpace: 'pre-wrap' }}>{record.kpi}</div>,
        },
        {
            title: 'WEIGHT',
            dataIndex: 'weight',
            key: 'weight',
            width: 30,
            align: 'center',
            valueType: "digit",
            fieldProps: {
                min: 0,
                max: 100,
                style: {
                    textAlign: 'center',
                },
            },
            // onCell: (record) => ({
            //     style: {
            //         border: record.key === errorRowKey ? '1px solid red' : undefined,
            //     },
            // }),
        },
        {
            title: 'START DATE',
            dataIndex: 'startDate',
            key: 'startDate',
            width: 150,
            align: 'center',
            valueType: 'dateMonth',
            fieldProps: {
                format: 'MMM-YYYY',
            }
        },
        {
            title: 'DUE DATE',
            dataIndex: 'dueDate',
            key: 'dueDate',
            width: 150,
            align: 'center',
            valueType: 'date',
            fieldProps: {
                format: 'DD-MMM-YYYY',
            }
        },
        {
            title: 'MID-YEAR REVIEW',
            dataIndex: 'midYearReview',
            key: 'midYearReview',
            // width: 120,
            align: 'center',
            valueType: 'select',
            valueEnum: {
                'Completed': { text: 'Completed', status: 'Success' },
                'On-Track': { text: 'On-Track', status: 'Processing' },
                'At Risk': { text: 'At Risk', status: 'Error' },
            },
            render: (_, record) => renderStatus(record.midYearReview),
            onHeaderCell: () => ({
                style: { backgroundColor: '#fff2cc' }
            }),
        },
        {
            title: 'SELF-EVALUATION',
            dataIndex: 'selfEvaluation',
            key: 'selfEvaluation',
            // width: 120,
            align: 'center',
            valueType: 'digit',
            onHeaderCell: () => ({
                style: { backgroundColor: '#ddebf7' }
            }),
        },
        {
            title: 'YEAR-END REVIEW',
            dataIndex: 'yearEndReview',
            key: 'yearEndReview',
            // width: 120,
            align: 'center',
            valueType: 'digit',
            onHeaderCell: () => ({
                style: { backgroundColor: '#ddebf7' }
            }),
        },
        {
            title: 'JUSTIFICATION',
            dataIndex: 'justification',
            key: 'justification',
            width: 200,
            valueType: 'textarea',
            onHeaderCell: () => ({
                style: { backgroundColor: '#ddebf7' }
            }),
        },
        {
            title: 'Action',
            valueType: 'option',
            width: 50,
            // fixed: 'right',
            render: (text, record, _, action) => [
                <Space size={0}>
                    <Button
                        type='link'
                        icon={<EditOutlined />}
                        onClick={() => action?.startEditable?.(record.key)}
                    />
                    <Button
                        type='link'
                        danger
                        icon={<DeleteOutlined />}
                        onClick={() => setDataSource(dataSource.filter((item) => item.key !== record.key))}
                    />
                </Space>
            ],
        },
    ];

    const handleValuesChange = (record: DataType, dataSource: DataType[]) => {
        setDataSource(dataSource);

        const totalWeight = dataSource.reduce((sum, item) => {
            return sum + (parseFloat(item.weight || '0') || 0);
        }, 0);

        if (totalWeight > 100) {
            setErrorRowKey(record.key);
            // Only show message if not already in error state to avoid spam
            if (!errorRowKey) {
                message.error('Total weight cannot exceed 100%');
            }
        } else {
            setErrorRowKey(null);
        }
    };

    return (
        <Flex vertical gap={8}>
            <div style={{ backgroundColor: '#bf9000', padding: '8px 16px', color: 'white' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontWeight: 'bold', fontSize: '16px' }}>
                    <span>SECTION I: "WHAT" PART (RESULTS)</span>
                    <span>(Weightage: 70%)</span>
                </div>
            </div>
            <div style={{ fontSize: '12px', fontStyle: 'italic', marginTop: '4px' }}>
                What employee is expected to achieve in the whole fiscal year in term of results related to sub-function, function and/or business based on their role
                <br />
                *At least 3 objectives required for staff level
            </div>
            <EditableProTable<DataType>
                columns={columns}
                rowKey="key"
                scroll={{ x: 'max-content' }}

                value={dataSource}
                onValuesChange={(values) => setDataSource([...values])}
                recordCreatorProps={{
                    newRecordType: 'dataSource',
                    position: 'bottom',
                    record: () => ({ key: Date.now().toString(), no: dataSource.length + 1 } as DataType),
                }}
                editable={{
                    type: 'multiple',
                    editableKeys,
                    onChange: setEditableRowKeys,
                    onValuesChange: handleValuesChange,
                }}
                bordered
                size="small"
                summary={(pageData) => {
                    let totalSelfEval = 0;
                    let totalYearEnd = 0;
                    let count = 0;

                    pageData.forEach(({ selfEvaluation, yearEndReview }) => {
                        totalSelfEval += Number(selfEvaluation || 0);
                        totalYearEnd += Number(yearEndReview || 0);
                        count++;
                    });

                    // Weighted calc
                    const weightedSelfEval = pageData.reduce((acc, curr) => acc + (Number(curr.selfEvaluation || 0) * (parseFloat(curr.weight || '0') / 100)), 0);
                    const finalSelfEval = weightedSelfEval * 0.7; // =SUMPRODUCT(J28:J31,$F$28:$F$31)*70%

                    const weightedYearEnd = pageData.reduce((acc, curr) => acc + (Number(curr.yearEndReview || 0) * (parseFloat(curr.weight || '0') / 100)), 0);
                    const finalYearEnd = weightedYearEnd * 0.7;

                    return (
                        <Table.Summary.Row style={{ backgroundColor: '#d9d9d9', fontWeight: 'bold' }}>
                            <Table.Summary.Cell index={0} colSpan={8} align="right">
                                Section I: Average Score x 70%
                            </Table.Summary.Cell>
                            <Table.Summary.Cell index={1} align="center">
                                {finalSelfEval.toFixed(2)}
                            </Table.Summary.Cell>
                            <Table.Summary.Cell index={2} colSpan={3} align="center">
                                {finalYearEnd.toFixed(2)}
                            </Table.Summary.Cell>
                        </Table.Summary.Row>
                    );
                }}
            />
        </Flex>
    );
};

export default SectionForm;
