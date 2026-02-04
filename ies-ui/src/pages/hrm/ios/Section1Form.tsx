import React, { useMemo } from 'react';
import { Card, Table, Flex, Button, Space, message } from 'antd';
import type { EditableFormInstance, ProColumns } from '@ant-design/pro-components';
import { EditableProTable, ProFormDigit } from '@ant-design/pro-components';
import { DeleteOutlined } from '@ant-design/icons';
import { FormSection1, IosSection1Params } from './data';
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
    editableFormRef?: React.Ref<EditableFormInstance<IosSection1Params>> | any;
    formSetting: FormSection1;
}

const Section1Form: React.FC<Props> = ({ dataSource, readOnly = false, onValuesChange, editableFormRef, weighTage, formSetting }) => {

    const totalRecords = useMemo(() => {
        return (dataSource ?? []).length;
    }, [dataSource]);

    console.log(dataSource);



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
            title: 'OBJECTIVE',
            dataIndex: 'obj',
            key: 'obj',
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
                // placeholder: "",
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
            title: `WEIGHT`,
            dataIndex: 'weight',
            key: 'weight',
            width: 20,
            align: 'center',
            valueType: "digit",
            formItemProps: {
                rules: [
                    { type: 'number', min: 0.1, max: 100, message: 'Please enter 0.1% - 100%' }
                ],

            },
            fieldProps: {
                rows: 6,
                suffix: "%",
                controls: false,
                placeholder: "0",
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
            dataIndex: 'mid',
            key: 'mid',
            width: 80,
            align: 'center',
            hidden: formSetting?.midYear,
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
            hidden: formSetting?.selfRating,
            align: 'center',
            valueType: 'select',
            valueEnum: {
                '1': { text: '1', status: 'Success' },
                '2': { text: '2', status: 'Processing' },
                '3': { text: '3', status: 'Error' },
                '4': { text: '4', status: 'Error' },
                '5': { text: '5', status: 'Error' },
            },
            onHeaderCell: () => ({
                style: { backgroundColor: '#ddebf7', fontSize: 12 }
            }),

            fieldProps: {
                precision: 0,
                step: 1,
                allowClear: false,
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
            hidden: formSetting?.yearEndRating,
            align: 'center',
            valueType: 'digit',
            initialValue: moment().endOf('year'),
            onHeaderCell: () => ({
                style: { backgroundColor: '#ddebf7', fontSize: 12 }
            }),
            formItemProps: {
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
            hidden: formSetting?.justification,
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
                        <span>(Weightage: {numeral(weighTage * 100)?.format('0')}%)</span>
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
                    key={dataSource?.toString()}
                    rowKey="key"
                    className='thin-scrollbar-cust'
                    value={dataSource}
                    onValuesChange={async (values) => {
                        const wieght = values?.reduce((total, item) => total + (item.weight ?? 0), 0);
                        if (wieght > 100) {
                            message.error('Weightage should not be more than 100');
                            return dataSource
                        }
                        onValuesChange?.(values)
                    }}
                    recordCreatorProps={((totalRecords >= 5) || readOnly) ? false : {
                        newRecordType: 'dataSource',
                        creatorButtonText: ' Add',
                        record: () => ({
                            key: (totalRecords + 1).toString(),
                            id: totalRecords + 1,
                            iosEmpRequestId: null,
                            obj: null,
                            actionPlan: null,
                            weight: null,
                            startedDate: moment() ?? undefined,
                            dueDate: moment() ?? undefined,
                            initail: false,
                        }),
                    }}
                    editable={{
                        type: 'multiple',
                        editableKeys: readOnly ? [] : dataSource?.map((item) => item.key),

                        actionRender: (row, config, defaultDom) => {
                            const disable = ["1", "2", "3"].includes(row.key)
                            return [<Space size={0}>
                                <Button
                                    type="link"
                                    danger
                                    icon={<DeleteOutlined />}
                                    onClick={() => config?.onDelete?.(row.key, row)}
                                    disabled={disable}
                                />
                            </Space>]
                        },
                    }}
                    bordered
                    size="small"
                    summary={(pageData) => {
                        const totalWeight = pageData?.reduce((acc, item) => acc + (item?.weight ?? 0), 0)
                        return (
                            <Table.Summary.Row style={{ backgroundColor: '#d9d9d9', fontWeight: 'bold' }}>
                                <Table.Summary.Cell index={0} colSpan={2} align="right" >
                                    Total Weight
                                </Table.Summary.Cell>
                                <Table.Summary.Cell index={1} colSpan={3} align="right">
                                    {numeral(totalWeight ?? 0)?.format('0 ') + ' %'}
                                </Table.Summary.Cell>
                                <Table.Summary.Cell index={2} colSpan={3} align="right">
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
