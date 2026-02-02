import React from 'react';
import { Flex, AutoComplete, Input, Table, Button, Space, message } from 'antd';
import type { EditableFormInstance, ProColumns } from '@ant-design/pro-components';
import { EditableProTable } from '@ant-design/pro-components';
import { DataSetupItemEntry } from '../master-data/data';
import { IosSection2Params } from './data';
import { DeleteOutlined } from '@ant-design/icons';
import numeral from 'numeral';



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

const renderStatus = (status: string) => {
    let color = 'default';
    if (status === 'Completed') color = 'green';
    else if (status === 'On-Track') color = 'blue';
    else if (status === 'At Risk') color = 'orange';

    return <span style={{ color: color === 'orange' ? '#fa8c16' : color, fontWeight: 500 }}>{status}</span>;
};

interface Props {

    dataSource?: IosSection2Params[];
    readOnly?: boolean;
    objective?: DataSetupItemEntry[];
    kpi?: DataSetupItemEntry[];
    actionPlan?: DataSetupItemEntry[];
    onValueChange?: (data: any) => void;
    weighTage: number;
    editableFormRef?: React.Ref<EditableFormInstance<IosSection2Params>>
}

const Section2Form: React.FC<Props> = ({ dataSource, readOnly = false, objective, kpi, actionPlan, onValueChange, weighTage, editableFormRef }) => {
    const columns: ProColumns<IosSection2Params>[] = [
        {
            title: 'No.',
            dataIndex: 'no',
            key: 'no',
            width: 50,
            align: 'center',
            onCell: () => ({ style: { backgroundColor: '#d9d9d9', fontWeight: 'bold' } }),
            editable: false,
            render(dom, entity, index, action, schema) {
                return <div style={{ position: "sticky", left: 0 }}>{index + 1}</div>;
            },
        },
        {
            title: 'OBJECTIVES',
            dataIndex: 'obj',
            key: 'obj',
            width: 300,
            onCell: () => ({ style: { verticalAlign: 'top' } }),
            formItemProps: {
                rules: [{ required: true, message: 'Please enter objectives' }]
            },
            renderFormItem: (item, { record, ...rest }, form) => {

                return (
                    <AutoComplete
                        allowClear
                        style={{ width: '100%', height: "100%" }}
                        options={objective?.map(item => ({
                            value: item.code,
                            label: (
                                <div style={{
                                    whiteSpace: 'pre-wrap',
                                    wordBreak: 'break-word',
                                    borderBottom: "1px solid #f0f0f0",
                                    paddingBottom: 5,
                                    marginBottom: 5
                                }}>
                                    {`${item.nameEn} ${item.descriptionEn}`}
                                </div>
                            )
                        }))}
                        // onSelect={(value, option) => {
                        //     console.log(option);
                        //     form.setFieldValue(item.dataIndex, option?.label?.props?.children);
                        //     rest.onChange?.(option?.label?.props?.children)
                        //     // dataSource.filter(item => item.key === record.key).map(o => ({ ...o, objectives: option?.label?.props?.children }))
                        //     onValueChange(dataSource);
                        //     // // 👇 force label text into TextArea

                        // }}
                        filterOption={(inputValue, option) =>
                            String(option?.value).toUpperCase().indexOf(inputValue.toUpperCase()) !== -1
                        }
                    >
                        <Input.TextArea
                            {...rest}
                            placeholder="Enter objective"
                            autoSize={{ minRows: 3 }}
                        />
                    </AutoComplete>
                );
            },
        },
        {
            title: 'ACTION PLAN',
            dataIndex: 'actionPlan',
            key: 'actionPlan',
            width: 300,
            onCell: () => ({ style: { verticalAlign: 'top' } }),
            formItemProps: {
                rules: [{ required: true, message: 'Please enter action plan' }]
            },
            renderFormItem: (item, { record, ...rest }, form) => {
                return (
                    <AutoComplete
                        allowClear
                        style={{ width: '100%', height: "100%" }}
                        options={actionPlan?.map(item => ({
                            value: item.code,
                            // value: item.nameEn,
                            label: (
                                <div style={{
                                    whiteSpace: 'pre-wrap',
                                    maxWidth: 400,
                                    wordBreak: 'break-word',
                                    borderBottom: "1px solid #f0f0f0",
                                    paddingBottom: 5,
                                    marginBottom: 5
                                }}>
                                    {item.nameEn}
                                </div>
                            )
                        }))}
                        onSelect={(_, option) => {
                            // 👇 force label text into TextArea
                            form.setFieldValue(item.dataIndex, option.value);
                        }}
                    // filterOption={(inputValue, option) =>
                    //     String(option?.value).toUpperCase().indexOf(inputValue.toUpperCase()) !== -1
                    // }
                    >
                        <Input.TextArea
                            {...rest}
                            placeholder="Enter action plan"
                            autoSize={{ minRows: 3, }}

                        // bordered={false}

                        />
                    </AutoComplete>
                );
            },
            render: (_, record) => <div style={{ whiteSpace: 'pre-wrap' }}>{record.actionPlan}</div>,
        },
        {
            title: 'KPI',
            dataIndex: 'kpi',
            key: 'kpi',
            width: 300,
            onCell: () => ({ style: { verticalAlign: 'top' } }),
            formItemProps: {
                rules: [{ required: true, message: 'Please enter kpi' }]
            },
            renderFormItem: (item, { record, ...rest }, form) => {
                return (
                    <AutoComplete
                        allowClear
                        style={{ width: '100%', height: "100%" }}
                        options={kpi?.map(item => ({
                            value: item.nameEn,
                            label: (
                                <div style={{
                                    whiteSpace: 'pre-wrap',
                                    wordBreak: 'break-word',
                                    borderBottom: "1px solid #f0f0f0",
                                    paddingBottom: 5,
                                    marginBottom: 5
                                }}>
                                    {item.nameEn}
                                </div>
                            )
                        }))}
                        filterOption={(inputValue, option) =>
                            String(option?.value).toUpperCase().indexOf(inputValue.toUpperCase()) !== -1
                        }
                    >
                        <Input.TextArea
                            placeholder="Enter KPI"
                            autoSize={{ minRows: 3 }}
                            style={{
                                resize: "inherit"
                            }}
                            {...rest}
                        />
                    </AutoComplete>
                );
            },
            render: (_, record) => <div style={{ whiteSpace: 'pre-wrap' }}>{record?.kpi}</div>,
        },
        {
            title: `WEIGHT (${numeral(dataSource?.reduce((acc, item) => acc + (item?.weight ?? 0), 0))?.format('0.00')}%)`,
            dataIndex: 'weight',
            key: 'weight',
            width: 20,
            align: 'center',
            valueType: "digit",
            formItemProps: {
                rules: [
                    { required: true, message: 'Please enter weight' },
                    { type: 'number', min: 0.1, max: 100, message: 'Please enter 0.1% - 100%' }
                ],

            },
            fieldProps: {
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
                placeholder: "",
                format: 'MMM-YYYY',
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
                placeholder: "",
                format: 'MMM-YYYY',
            }
        },
        {
            title: 'MID-YEAR REVIEW',
            dataIndex: 'midYearReview',
            key: 'midYearReview',
            width: 40,
            align: 'center',
            valueType: 'select',
            editable: false,
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
            title: 'SELF-EVAL',
            dataIndex: 'selfEvaluation',
            key: 'selfEvaluation',
            width: 20,
            align: 'center',
            valueType: 'digit',
            formItemProps: {
                rules: [
                    { required: true, message: 'Please enter self evaluation' },
                    { type: 'number', min: 1, max: 5, message: 'Please enter 1-5' },],
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
            onHeaderCell: () => ({
                style: { backgroundColor: '#ddebf7' }
            }),
        },
        {
            title: 'YEAR-END REVIEW',
            dataIndex: 'yearEndReview',
            key: 'yearEndReview',
            width: 20,
            disable: true,
            align: 'center',
            valueType: 'digit',
            onHeaderCell: () => ({
                style: { backgroundColor: '#ddebf7' },
            }),
            formItemProps: {
                rules: [
                    { type: 'number', min: 1, max: 5, message: 'Please enter 1-5' }
                ]
            },
            fieldProps: {
                min: 1,
                max: 5,            // logical limit
                controls: false,
                placeholder: '',
                rules: [
                    {
                        pattern: /^\d+$/,
                        min: 1,
                        max: 5,
                        required: true,
                        message: 'Please enter a valid number',
                    },
                ],
                style: {
                    textAlign: 'center',
                    width: 60,
                },
            },
        },
        {
            title: 'JUSTIFICATION',
            dataIndex: 'justification',
            key: 'justification',
            width: 300,
            valueType: 'textarea',
            onHeaderCell: () => ({
                style: { backgroundColor: '#ddebf7' }
            }),
        },
        {
            valueType: 'option',
            width: 5,
            fixed: 'right',
        },
    ];


    return (
        <Flex vertical gap={8}>
            <div style={{ backgroundColor: '#bf9000', padding: '8px 16px', color: 'white' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontWeight: 'bold', fontSize: '16px' }}>
                    <span>SECTION II: "HOW" PART (APPROACH/BEHAVIORS)</span>
                    <span>(Weightage: {numeral(weighTage * 100)?.format('0.00')}%)</span>
                </div>
            </div>
            <div style={{ fontSize: '12px', fontStyle: 'italic', marginTop: '4px' }}>
                What employee is expected to behave at workplace, mindset and attributes to hold
                <br />
                *At least 4 objectives required for management level
            </div>
            <EditableProTable<IosSection2Params>
                columns={columns}
                rowKey="key"
                value={dataSource}
                className={"thin-scrollbar-cust"}
                editableFormRef={editableFormRef}
                onValuesChange={(values) => {
                    const wieght = values.reduce((total, item) => total + (item.weight || 0), 0);

                    if (wieght > 100) {
                        message.error('Weightage should not be more than 100');
                        return;
                    }
                    onValueChange?.(values)
                }}
                recordCreatorProps={readOnly ? false : {
                    newRecordType: 'dataSource',
                    position: 'bottom',
                    record: () => ({ key: Date.now().toString(), no: (dataSource?.length || 0) + 1 } as unknown as IosSection2Params),
                }}
                editable={!readOnly ? {
                    type: 'multiple',
                    editableKeys: dataSource?.map(item => item.key),
                    actionRender: (row, config, defaultDom) => {
                        const isDelete = row.id == 0;
                        return [<Space size={0}>
                            <Button
                                type="link"
                                danger
                                icon={<DeleteOutlined />}
                                disabled={isDelete}
                                onClick={() => config?.onDelete?.(row.key, row)}
                            />
                        </Space>]
                    },
                } : undefined}

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
                                Section II: Average Score x {numeral(weighTage * 100)?.format('0.00')}%
                            </Table.Summary.Cell>
                            <Table.Summary.Cell index={1} colSpan={6} align="right">
                                {finalSelfEval.toFixed(2)}
                            </Table.Summary.Cell>
                            <Table.Summary.Cell index={2} colSpan={1} align="right">
                                {/* <ProFormDigit
                                    name={"finalYearEnd"}
                                /> */}
                                {finalYearEnd.toFixed(2)}
                            </Table.Summary.Cell>
                        </Table.Summary.Row>
                    );
                }}
            />
        </Flex>
    );
};

export default Section2Form;
