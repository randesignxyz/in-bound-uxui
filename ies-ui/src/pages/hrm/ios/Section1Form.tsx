import React, { useMemo } from 'react';
import { Card, Table, Flex, Button, Space, message } from 'antd';
import type { EditableFormInstance, ProColumns } from '@ant-design/pro-components';
import { EditableProTable, ProFormDigit } from '@ant-design/pro-components';
import { DeleteOutlined } from '@ant-design/icons';
import { IosSection1Params } from './data';
import moment from 'moment';
import numeral from 'numeral';



const renderStatus = (status: string) => {
    let color = 'default';
    if (status === 'Completed') color = 'green';
    else if (status === 'On-Track') color = 'blue';
    else if (status === 'At Risk') color = 'orange';

    return <span style={{ color: color === 'orange' ? '#fa8c16' : color, fontWeight: 500 }}>{status}</span>;
};

interface Props {
    dataSource?: IosSection1Params[];
    readOnly?: boolean;
    weighTage: number | 0;
    onValuesChange?: (values: IosSection1Params[]) => void;
    editableFormRef?: React.Ref<EditableFormInstance<IosSection1Params>>
}

const Section1Form: React.FC<Props> = ({ dataSource, readOnly = false, onValuesChange, editableFormRef, weighTage }) => {

    console.log(dataSource);

    const totalWeight = useMemo(() => {
        return numeral(
            (dataSource ?? []).reduce((acc, item) => acc + (item?.weight ?? 0), 0)
        ).format("0.00");
    }, [dataSource]);

    const columns: ProColumns<IosSection1Params>[] = [
        {
            title: 'No.',
            dataIndex: 'no',
            key: 'no',
            width: 20,
            align: 'center',
            fixed: 'left',
            onCell: () => ({ style: { backgroundColor: '#f5f4f4ff', fontWeight: 'bold' } }),
            editable: false,
            render(dom, entity, index, action, schema) {
                return <div style={{ left: 0 }}>{index + 1}</div>;
            },
        },
        {
            title: 'OBJECTIVES',
            dataIndex: 'objectives',
            key: 'objectives',
            width: 300,
            valueType: 'textarea',
            fieldProps: {
                rows: 6,
            },
            formItemProps: {
                rules: [
                    {
                        required: true,
                        message: 'Please enter objectives'
                    }
                ],
            }
        },
        {
            title: 'ACTION PLAN',
            dataIndex: 'actionPlan',
            key: 'actionPlan',
            width: 300,
            valueType: 'textarea',
            render: (_, record) => <div style={{ whiteSpace: 'pre-wrap' }}>{record.actionPlan}</div>,
            fieldProps: {
                rows: 6,
                style: {
                    fontSize: '13px'
                }
            },
            formItemProps: {
                rules: [
                    {
                        required: true,
                        message: 'Please enter objectives'
                    }
                ],
            }
        },
        {
            title: 'KPI',
            dataIndex: 'kpi',
            key: 'kpi',
            width: 300,
            valueType: 'textarea',
            render: (_, record) => <div style={{ whiteSpace: 'pre-wrap' }}>{record.kpi}</div>,
            fieldProps: {
                rows: 6,
                style: {
                    fontSize: '13px'
                }
            },
            formItemProps: {
                rules: [
                    {
                        required: true,
                        message: 'Please enter objectives'
                    }
                ],
            }
        },
        {
            title: `WEIGHT (${totalWeight}%)`,
            dataIndex: 'weight',
            key: 'weight',
            width: 20,
            align: 'center',
            valueType: "digit",
            // onCell: () => ({ style: { border: '1px solid #ff4d4f', borderRadius: '5px' } }),
            formItemProps: {
                rules: [
                    { type: 'number', min: 0.1, max: 100, message: 'Please enter 0.1% - 100%' }
                ],

            },
            fieldProps: {
                // step: 0.1,
                // precision: 1,
                rows: 6,
                suffix: "%",
                controls: false,
                placeholder: "0.1",
                style: {
                    textAlign: 'right',
                    width: 65
                },
            },
        },
        {
            title: 'START DATE',
            dataIndex: 'startedDate',
            key: 'startedDate',
            width: 120,
            align: 'center',
            valueType: 'dateMonth',
            fieldProps: {
                format: 'MMM-YYYY',
            },
            formItemProps: {
                rules: [
                    {
                        required: true,
                        message: 'Please enter objectives'
                    }
                ],
            }
        },
        {
            title: 'DUE DATE',
            dataIndex: 'dueDate',
            key: 'dueDate',
            width: 120,
            align: 'center',
            valueType: 'dateMonth',
            fieldProps: {
                format: 'MMM-YYYY',
            },
            formItemProps: {
                rules: [
                    {
                        required: true,
                        message: 'Please enter objectives'
                    }
                ],
            }
        },
        {
            title: 'MID-YEAR REVIEW',
            dataIndex: 'midYearReview',
            key: 'midYearReview',
            width: 80,
            align: 'center',
            valueType: 'select',
            valueEnum: {
                'Completed': { text: 'Completed', status: 'Success' },
                'On-Track': { text: 'On-Track', status: 'Processing' },
                'At Risk': { text: 'At Risk', status: 'Error' },
            },
            render: (_, record) => renderStatus(record?.midYearReview),
            onHeaderCell: () => ({
                style: { backgroundColor: '#fff2cc', fontSize: 12 }
            }),
        },
        {
            title: 'SELF-EVALUATION',
            dataIndex: 'selfEvaluation',
            key: 'selfEvaluation',
            width: 20,
            align: 'center',
            valueType: 'digit',
            initialValue: moment().startOf('year'),
            onHeaderCell: () => ({
                style: { backgroundColor: '#ddebf7', fontSize: 12 }
            }),
            formItemProps: {
                rules: [{ type: 'number', min: 1, max: 5, message: 'Please enter 1-5' },],
            },
            fieldProps: {
                precision: 0,
                step: 1,
                controls: false,
                placeholder: "0",
                style: {
                    textAlign: 'center',
                    width: 60,
                },
            },
        },
        {
            title: 'YEAR-END REVIEW',
            dataIndex: 'yearEndReview',
            key: 'yearEndReview',
            width: 20,
            align: 'center',
            valueType: 'digit',
            initialValue: moment().endOf('year'),
            onHeaderCell: () => ({
                style: { backgroundColor: '#ddebf7', fontSize: 12 }
            }),
            formItemProps: {
                // rules: [
                //     {
                //         // pattern: /^\f+$/,
                //         min: 0.1,
                //         max: 100,
                //         message: 'Please enter a valid number',
                //     },
                // ],
            },
            fieldProps: {
                min: 0,
                max: 100,
                controls: false,
                placeholder: "",

                style: {
                    textAlign: 'right',
                    width: 60
                },
            },
        },
        {
            title: 'JUSTIFICATION',
            dataIndex: 'justification',
            key: 'justification',
            width: 400,
            valueType: 'textarea',
            fieldProps: {
                rows: 6,
            },
            onHeaderCell: () => ({
                style: { backgroundColor: '#ddebf7', fontSize: 12 }
            }),
        },
        {
            // title: 'Action',
            valueType: 'option',
            width: 5,
            fixed: 'right',

        },
    ];

    return (
        <Card size='small'>
            <Flex vertical gap={8}>
                <div style={{ backgroundColor: '#bf9000', padding: '8px 16px', color: 'white' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontWeight: 'bold', fontSize: '16px' }}>
                        <span>SECTION I: "WHAT" PART (RESULTS)</span>
                        <span>(Weightage: {numeral(weighTage * 100)?.format('0.00')}%)</span>
                    </div>
                </div>
                <div style={{ fontSize: '12px', fontStyle: 'italic', marginTop: '4px' }}>
                    What employee is expected to achieve in the whole fiscal year in term of results related to sub-function, function and/or business based on their role
                    <br />
                    *At least 3 objectives required for staff level
                </div>
                <EditableProTable<IosSection1Params>
                    columns={columns}
                    editableFormRef={editableFormRef}
                    rowKey="key"
                    className='thin-scrollbar-cust'
                    value={dataSource}
                    // onDataSourceChange={onValuesChange}
                    onValuesChange={async (values) => {
                        const wieght = values?.reduce((total, item) => total + (item.weight || 0), 0);
                        if (wieght > 100) {
                            message.error('Weightage should not be more than 100');
                            return;
                        }
                        onValuesChange?.(values)
                    }}
                    // recordCreatorProps={{
                    //     newRecordType: 'dataSource',
                    //     position: 'bottom',
                    //     record: () => ({ key: Date.now().toString() } as IosSection1Params),
                    // }}
                    recordCreatorProps={false}
                    editable={{
                        type: 'multiple',
                        editableKeys: dataSource?.map((item) => item.key),
                        actionRender: (row, config, defaultDom) => {
                            return [<Space size={0}>
                                <Button
                                    type="link"
                                    danger
                                    icon={<DeleteOutlined />}
                                    onClick={() => config?.onDelete?.(row.key, row)}
                                />
                            </Space>]
                        },
                    }}
                    bordered
                    size="small"
                    summary={(pageData) => {
                        let totalSelfEval = 0;
                        let totalYearEnd = 0;
                        let count = 0;

                        pageData.forEach(({ selfEvaluation, mEvaluation }) => {
                            totalSelfEval += Number(selfEvaluation || 0);
                            totalYearEnd += Number(mEvaluation || 0);
                            count++;
                        });

                        // Weighted calc
                        const weightedSelfEval = pageData?.reduce((acc, curr) => acc + (Number(curr.selfEvaluation || 0) * (parseFloat((curr.weight || 0).toString()) / 100)), 0);
                        const finalSelfEval = weightedSelfEval * (weighTage || 0); // =SUMPRODUCT(J28:J31,$F$28:$F$31)*70%

                        const weightedYearEnd = pageData?.reduce((acc, curr) => acc + (Number(curr.mEvaluation || 0) * (parseFloat((curr.weight || 0).toString()) / 100)), 0);
                        const finalYearEnd = weightedYearEnd * (weighTage || 0);

                        return (
                            <Table.Summary.Row style={{ backgroundColor: '#d9d9d9', fontWeight: 'bold' }}>
                                <Table.Summary.Cell index={0} colSpan={3} align="right" >
                                    Section I: Average Score x {numeral(weighTage * 100)?.format('0.00')}%
                                </Table.Summary.Cell>
                                <Table.Summary.Cell index={1} colSpan={6} align="right">
                                    {finalSelfEval.toFixed(2)}
                                </Table.Summary.Cell>
                                <Table.Summary.Cell index={2} colSpan={1} align="right">
                                    {finalYearEnd.toFixed(2)}
                                    <ProFormDigit
                                        name={"finalYearEnd"}
                                        hidden
                                        initialValue={finalYearEnd}
                                    />
                                </Table.Summary.Cell>
                            </Table.Summary.Row>
                        );
                    }}
                />
            </Flex>
        </Card>
    );
};

export default Section1Form;
