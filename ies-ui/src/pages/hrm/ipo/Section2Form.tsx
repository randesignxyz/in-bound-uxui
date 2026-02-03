import React, { useState } from 'react';
import { Card, Table, Typography, Tag, Flex } from 'antd';
import type { ProColumns } from '@ant-design/pro-components';
import { EditableProTable } from '@ant-design/pro-components';
import { MasterDataItem } from '../master-data/data';

const { Text } = Typography;


export interface DataType {
    key: string;
    no: number;
    objectives: string;
    actionPlan: string;
    kpi: string;
    weight: string;
    startDate: string;
    dueDate: string;
    midYearReview: string;
    selfEvaluation: number;
    yearEndReview: number;
    justification: string;
}

const defaultData: DataType[] = [
    // {
    //     key: '1',
    //     no: 1,
    //     objectives: 'RESULT-ORIENTATION\nTo improve your ability to focus on achieving key results, meeting deadlines, and delivering high-quality outcomes.',
    //     actionPlan: 'Deliver task or work on agreed deadlines\nCommit and deliver high-quality results',
    //     kpi: '% of Tasks delivered on deadlines: 100%\n% of High Quality Task: 100%',
    //     weight: '30%',
    //     startDate: 'Jan-25',
    //     dueDate: 'Dec-25',
    //     midYearReview: 'Completed',
    //     selfEvaluation: 0,
    //     yearEndReview: 0,
    //     justification: '',
    // },
    // {
    //     key: '2',
    //     no: 2,
    //     objectives: 'LEADING TEAM\nTo drive team productivity and deliverables aligned with function and company\'s goals.',
    //     actionPlan: 'Conduct effective monthly meeting with team members\nProvide 1:1 Performance Feedback with each employee quarterly\nProvide 1:1 Coaching session with each employee quarterly\nDevelop and mentor at least 1 high-potential member in team',
    //     kpi: '100% Sprint Meeting Completion\n# of Quarterly 1:1 Feedback Session\n# of Quarterly 1:1 Coaching Session\n# of Successor: 01',
    //     weight: '20%',
    //     startDate: 'Jan-25',
    //     dueDate: 'Dec-25',
    //     midYearReview: 'On-Track',
    //     selfEvaluation: 0,
    //     yearEndReview: 0,
    //     justification: '',
    // },
    // {
    //     key: '3',
    //     no: 3,
    //     objectives: 'COMMUNICATION (HORENSO)\nTo enhance communication skills by ensuring regular updates and alignment with stakeholders and team members.',
    //     actionPlan: 'Actively update, inform and report work progress to line managers and team daily\nTake initiatives to improve work process by consulting with line managers and stakeholders',
    //     kpi: '# of Initiatives/Improvements: 02\n# of Daily update: 01',
    //     weight: '20%',
    //     startDate: 'Jan-25',
    //     dueDate: 'Dec-25',
    //     midYearReview: 'Completed',
    //     selfEvaluation: 0,
    //     yearEndReview: 0,
    //     justification: '',
    // },
    // {
    //     key: '4',
    //     no: 4,
    //     objectives: 'PROBLEM SOLVING\nTo improve your ability to solve problems efficiently, considering both immediate needs and long-term solutions.',
    //     actionPlan: 'Ability to identify root causes of problem effectively\nAbility to come up with effective solutions\nProactively work on agreed solutions until it produce results and impact',
    //     kpi: '# of Problems Identified: 03\n# of Solutions Executed: 05',
    //     weight: '30%',
    //     startDate: 'Jan-25',
    //     dueDate: 'Dec-25',
    //     midYearReview: 'On-Track',
    //     selfEvaluation: 0,
    //     yearEndReview: 0,
    //     justification: '',
    // },
];

const renderStatus = (status: string) => {
    let color = 'default';
    if (status === 'Completed') color = 'green';
    else if (status === 'On-Track') color = 'blue';
    else if (status === 'At Risk') color = 'orange';

    return <span style={{ color: color === 'orange' ? '#fa8c16' : color, fontWeight: 500 }}>{status}</span>;
};

interface Props {
    data?: DataType[];
    readOnly?: boolean;
    masterDate: MasterDataItem[]
}

const Section2Form: React.FC<Props> = ({ data, readOnly = false, masterDate }) => {
    const [editableKeys, setEditableRowKeys] = useState<React.Key[]>([]);
    const [dataSource, setDataSource] = useState<DataType[]>(defaultData);

    React.useEffect(() => {
        if (data) {
            setDataSource(data);
            if (readOnly) {
                setEditableRowKeys([]);
            }
        }
    }, [data, readOnly]);

    const columns: ProColumns<DataType>[] = [
        {
            title: 'No.',
            dataIndex: 'no',
            key: 'no',
            width: 50,
            align: 'center',
            onCell: () => ({ style: { backgroundColor: '#d9d9d9', fontWeight: 'bold' } }),
            fixed: 'left',
            editable: false,
        },
        {
            title: 'OBJECTIVES',
            dataIndex: 'objectives',
            key: 'objectives',
            width: 300,
            valueType: 'select',
            request: async () => {
                return masterDate.filter(item => item.typeCode === "OBJECTIVES").map(item => ({
                    label: item.nameEn,
                    value: item.code
                }));
            }
        },
        {
            title: 'ACTION PLAN',
            dataIndex: 'actionPlan',
            key: 'actionPlan',
            width: 300,
            valueType: 'select',
            render: (_, record) => <div style={{ whiteSpace: 'pre-wrap' }}>{record.actionPlan}</div>,
            request: async () => {
                return masterDate.filter(item => item.typeCode === "ACTION_PLAN").map(item => ({
                    label: item.nameEn,
                    value: item.code
                }));
            }
        },
        {
            title: 'KPI',
            dataIndex: 'kpi',
            key: 'kpi',
            // width: 200,
            valueType: 'select',
            render: (_, record) => <div style={{ whiteSpace: 'pre-wrap' }}>{record.kpi}</div>,
            request: async () => {
                return masterDate.filter(item => item.typeCode === "KPI").map(item => ({
                    label: item.nameEn,
                    value: item.code
                }));
            }
        },
        {
            title: 'WEIGHT',
            dataIndex: 'weight',
            key: 'weight',
            // width: 80,
            align: 'center',
            editable: false,
        },
        {
            title: 'START DATE',
            dataIndex: 'startDate',
            key: 'startDate',
            // width: 100,
            align: 'center',
            valueType: 'date',
            editable: false,
        },
        {
            title: 'DUE DATE',
            dataIndex: 'dueDate',
            key: 'dueDate',
            // width: 100,
            align: 'center',
            valueType: 'date',
            editable: false,
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
            width: 120,
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
            title: 'Option',
            valueType: 'option',
            width: 100,
            hidden: readOnly,
            fixed: 'right',
            render: (text, record, _, action) => [
                <a
                    key="editable"
                    onClick={() => {
                        action?.startEditable?.(record.key);
                    }}
                >
                    Edit
                </a>,
                <a
                    key="delete"
                    onClick={() => {
                        setDataSource(dataSource.filter((item) => item.key !== record.key));
                    }}
                >
                    Delete
                </a>,
            ],
        },
    ];

    return (
        <Flex vertical gap={8}>
            <div style={{ backgroundColor: '#bf9000', padding: '8px 16px', color: 'white' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontWeight: 'bold', fontSize: '16px' }}>
                    <span>SECTION II: "HOW" PART (APPROACH/BEHAVIORS)</span>
                    <span>(Weightage: 30%)</span>
                </div>
            </div>
            <div style={{ fontSize: '12px', fontStyle: 'italic', marginTop: '4px' }}>
                What employee is expected to behave at workplace, mindset and attributes to hold
                <br />
                *At least 3 objectives required for staff level
            </div>
            <EditableProTable<DataType>
                columns={columns}
                rowKey="key"
                scroll={{ x: 'max-content' }}
                value={dataSource}
                onChange={(values) => setDataSource([...values])}
                recordCreatorProps={readOnly ? false : {
                    newRecordType: 'dataSource',
                    position: 'bottom',
                    record: () => ({ key: Date.now().toString(), no: dataSource.length + 1 } as DataType),
                }}
                editable={!readOnly ? {
                    type: 'multiple',
                    editableKeys,
                    onChange: setEditableRowKeys,
                } : undefined}

                bordered
                size="small"
            />
        </Flex>
    );
};

export default Section2Form;
