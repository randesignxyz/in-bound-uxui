import React, { useMemo } from 'react';
import { Flex, AutoComplete, Input, Table, Button, Space, message, Card } from 'antd';
import type { EditableFormInstance, ProColumns } from '@ant-design/pro-components';
import { EditableProTable } from '@ant-design/pro-components';
import { DataSetupItemEntry } from '../master-data/data';
import { FormSection2, IosSection2Params } from './data';
import { DeleteOutlined } from '@ant-design/icons';
import numeral from 'numeral';
import moment from 'moment';



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
    editableFormRef?: React.Ref<EditableFormInstance<IosSection2Params>> | any;
    formSetting: FormSection2
}

const Section2Form: React.FC<Props> = ({ dataSource, readOnly = false, objective, kpi, actionPlan, onValueChange, weighTage, editableFormRef, formSetting }) => {



    const totalRecords = useMemo(() => {
        return (dataSource ?? []).length;
    }, [dataSource]);
    const columns: ProColumns<IosSection2Params>[] = [
        {
            title: 'No.',
            dataIndex: 'no',
            key: 'no',
            width: 50,
            align: 'center',
            onCell: () => ({ style: { backgroundColor: '#f5f4f4', fontWeight: 'bold' } }),
            editable: false,
            render(dom, entity, index, action, schema) {

                return <div style={{ position: "sticky", left: 0 }}>{index + 1}</div>;
            },
        },
        {
            title: 'OBJECTIVE',
            dataIndex: 'obj',
            key: 'obj',
            width: 300,
            onCell: () => ({ style: { verticalAlign: 'top' } }),
            formItemProps: {
                rules: [{ required: true, message: 'Please enter objectives' }]
            },
            // editable: (_, record) => !(record.id == 0),
            editable: (_, r) => !["1", "2", "3"].includes(r.key),
            renderFormItem: (item, { record, ...rest }, form) => {

                return (
                    <AutoComplete
                        allowClear
                        style={{ width: '100%', height: "100%" }}
                        options={objective?.map(item => ({
                            value: `${item.nameEn}'\n'${item.descriptionEn}`,
                            label: (
                                <div style={{
                                    whiteSpace: 'pre-wrap',
                                    wordBreak: 'break-word',
                                    borderBottom: "1px solid #f0f0f0",
                                    paddingBottom: 5,
                                    marginBottom: 5
                                }}>
                                    {`${item.nameEn}'\n'${item.descriptionEn}`}
                                </div>
                            )
                        }))}
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
            // editable: (_, record) => !(record.id == 0),
            editable: (_, r) => !["1", "2", "3"].includes(r.key),
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
                            value: item.descriptionEn,
                            label: (
                                <div style={{
                                    whiteSpace: 'pre-wrap',
                                    maxWidth: 400,
                                    wordBreak: 'break-word',
                                    borderBottom: "1px solid #f0f0f0",
                                    paddingBottom: 5,
                                    marginBottom: 5
                                }}>
                                    {item.descriptionEn}
                                </div>
                            )
                        }))}
                    >
                        <Input.TextArea
                            {...rest}
                            placeholder="Enter action plan"
                            autoSize={{ minRows: 3, }}
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
            // editable: (_, record) => !(record.id == 0),
            editable: (_, r) => !["1", "2", "3"].includes(r.key),
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
                            value: item.descriptionEn,
                            label: (
                                <div style={{
                                    whiteSpace: 'pre-wrap',
                                    wordBreak: 'break-word',
                                    borderBottom: "1px solid #f0f0f0",
                                    paddingBottom: 5,
                                    marginBottom: 5
                                }}>
                                    {item.descriptionEn}
                                </div>
                            )
                        }))}

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
            // title: `WEIGHT (${numeral(dataSource?.reduce((acc, item) => acc + (item?.weight ?? 0), 0))?.format('0.00')}%)`,
            title: `WEIGHT`,
            dataIndex: 'weight',
            key: 'weight',
            width: 20,
            align: 'center',
            valueType: "digit",
            formItemProps: {
            },
            fieldProps: {
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
            hidden: formSetting?.midYear,
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
            valueType: 'select',
            hidden: formSetting?.selfRating,
            valueEnum: {
                '1': { text: '1', status: 'Success' },
                '2': { text: '2', status: 'Processing' },
                '3': { text: '3', status: 'Error' },
                '4': { text: '4', status: 'Error' },
                '5': { text: '5', status: 'Error' },
            },
            fieldProps: {
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
            align: 'center',
            hidden: formSetting?.yearEndRating,
            valueType: 'select',
            valueEnum: {
                '1': { text: '1', status: 'Success' },
                '2': { text: '2', status: 'Processing' },
                '3': { text: '3', status: 'Error' },
                '4': { text: '4', status: 'Error' },
                '5': { text: '5', status: 'Error' },
            },
            editable: false,
            onHeaderCell: () => ({
                style: { backgroundColor: '#ddebf7' },
            }),

            fieldProps: {
                min: 1,
                max: 5,
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
            hidden: formSetting?.justification,
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


    const totalWeight = dataSource?.reduce((acc, item) => acc + (item?.weight ?? 0), 0)

    return (
        <Card size='small'>
            <Flex vertical gap={8}>
                <div style={{ backgroundColor: '#bf9000', padding: '8px 16px', color: 'white' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontWeight: 'bold', fontSize: '16px' }}>
                        <span>SECTION II: "HOW" PART (APPROACH/BEHAVIORS)</span>
                        <span>(Weightage: {numeral(weighTage * 100)?.format('0')}%)</span>
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
                    recordCreatorProps={((totalRecords >= 7) || readOnly) ? false : {
                        newRecordType: 'dataSource',
                        position: 'bottom',
                        record: () => ({
                            key: Date.now().toString(),
                            no: (dataSource?.length || 0) + 1,
                            initial: true,
                            id: undefined,
                            startedDate: moment()?.startOf('year')?.toDate(),
                            dueDate: moment()?.endOf('year')?.toDate(),
                        } as unknown as IosSection2Params),
                        creatorButtonText: ' Add'
                    }}
                    editable={!readOnly ? {
                        type: 'multiple',
                        editableKeys: readOnly ? [] : dataSource?.map(l => l.key),
                        actionRender: (row, config, defaultDom) => {

                            const disable = ["1", "2", "3"].includes(row.key);

                            return [<Space size={0}>
                                <Button
                                    type="link"
                                    danger
                                    icon={<DeleteOutlined />}
                                    disabled={disable}
                                    onClick={() => config?.onDelete?.(row.key, row)}
                                />
                            </Space>]
                        },
                    } : undefined}

                    bordered
                    size="small"
                    summary={(pageData) => {

                        return (
                            <Table.Summary.Row style={{ backgroundColor: '#f5f4f4', fontWeight: 'bold' }}>
                                <Table.Summary.Cell index={0} colSpan={2} align="right" >
                                    Total Weight
                                    {/* Section II: Average Score x {numeral(weighTage * 100)?.format('0')}% */}
                                </Table.Summary.Cell>
                                <Table.Summary.Cell index={1} colSpan={3} align="right">
                                    {numeral(totalWeight ?? 0)?.format('0 ') + ' %'}
                                </Table.Summary.Cell>
                                <Table.Summary.Cell index={2} colSpan={3} align="right">
                                    {/* {finalYearEnd.toFixed(2)} */}
                                </Table.Summary.Cell>
                            </Table.Summary.Row>
                        );
                    }}
                />
            </Flex>
        </Card>
    );
};

export default Section2Form;
