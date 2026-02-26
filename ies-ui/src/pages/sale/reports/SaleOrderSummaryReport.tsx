
import FormModalComp, { FormModalProps } from '@/components/FormModal';
import { getUrlReporting } from '@/pages/ReportUrl';
import { downloadGenericReport } from '@/services/apiGateway';
import { CrmServiceAPI, InitVisitScheduleParamsType } from '@/services/crm/services';
import { LookupData, LookupDataItem } from '@/services/data';
import { simpleRequestActions } from '@/services/model';
import { SaleServiceAPI } from '@/services/sale/services';
import { ProFormDateMonthRangePicker } from '@ant-design/pro-components';
import ProForm, { ProFormSelect } from '@ant-design/pro-form';
import { message } from 'antd';
import { useForm } from 'antd/lib/form/Form';
import moment from 'moment';
import { useEffect, useState } from 'react';


const SaleOrderSummaryReport: React.FC<FormModalProps> = ({ ...props }) => {
    const requestActions = simpleRequestActions();
    const crmServices = CrmServiceAPI(requestActions);
    const saleService = SaleServiceAPI(requestActions);


    const [optionCustomerType, setOptionCustomerType] = useState<
        { label: string; value: number }[] | undefined
    >();


    const [state, setState] = useState<{
        seList?: LookupDataItem[];
        selectedSoStatus?: string[];
        selectedCustomerType?: number[];
        lookupDataCustomerTypeList?: LookupData[];
    }>();

    const [form] = useForm<{
        salespersonId?: number[];
        customerType?: number[];
        dates?: moment.Moment[];
    }>();

    useEffect(() => {
        if (!props.open) return;
        const params: InitVisitScheduleParamsType[] = [
            { actionName: 'sale', responseKey: 'seList', payload: {} },
            {
                actionName: 'lookupDataList',
                responseKey: 'lookupDataList',
                payload: {
                    list: ['CUSTOMER_TYPE'],
                },
            },
        ];
        crmServices
            .initVisitScheduleData(params)
            .then((it: { seList?: LookupDataItem[]; lookupDataList?: LookupData[] }) => {
                setState({
                    ...state,
                    seList: it.seList,
                    lookupDataCustomerTypeList: it.lookupDataList,
                    selectedCustomerType: undefined,
                    selectedSoStatus: undefined,
                });

                setOptionCustomerType(
                    it.lookupDataList
                        ?.filter((it) => ['Other'].indexOf(it.code) === -1)
                        .map((it) => ({ label: it.name, value: it.id })),
                );
            });

    }, [props.open]);



    const onDowloadReportHandler = async () => {
        const dataForm = await form.validateFields();
        try {
            // const dataForm = await form.validateFields()
            const reportName = 'so-compatibility-summary-report';
            // console.log(`so-report-${moment().format('YYYY-MM-DD HH:mm:ss')}.xlsx`)
            // setLoading(true)
            await downloadGenericReport(requestActions)({
                fileName: `${reportName}-${moment().format('YYYY-MM-DD HH:mm:ss')}.xlsx`,
                type: 'EXCEL',
                data: {
                    reportName: reportName,
                    reportPath: getUrlReporting('sale'),
                    data: [
                        { key: 'customerType', value: dataForm.customerType?.join(','), type: 'string' },
                        { key: 'salespersonId', value: dataForm.salespersonId?.join(','), type: 'string' },
                        { key: 'startDate', value: dataForm.dates?.[0], type: 'string' },
                        { key: 'endDate', value: dataForm.dates?.[1], type: 'string' },


                    ],
                },
            }).then(() => {
                // setLoading(false)
            });
        } catch (error: any) {
            message.error(error.message || 'Failed to generate report.');
            // setLoading(false)
        }
    };



    return (
        <FormModalComp
            confirmLoading={requestActions.request?.loading}
            {...props}
            onResetForm={() => form.resetFields()}
            onSubmit={onDowloadReportHandler}


        ><ProForm
            submitter={false}
            layout="horizontal"
            labelCol={{ span: 5 }}
            wrapperCol={{ span: 18 }}
            labelAlign='left'
            form={form}

        >

                <ProFormDateMonthRangePicker
                    name={"dates"}
                    label="Date Range (Month)"
                    style={{ width: "100%" }}
                    fieldProps={{
                        onCalendarChange: (dates) => {
                            if (!dates || dates.length !== 2) return;
                            const [start, end] = dates;
                            if (start && end) {
                                const diff = end.diff(start, 'month', true);
                                if (diff > 1) {
                                    message.warning('Date range cannot exceed 1 month');
                                }
                            }
                        },
                        disabledDate: (current, { from }) => {
                            if (!from) return false;

                            const min = from.clone().subtract(1, 'month');
                            const max = from.clone().add(1, 'month');

                            return current.isBefore(min) || current.isAfter(max);
                        }
                    }}
                />
                <ProFormSelect
                    mode="multiple"
                    label="Customer Type"
                    name="customerType"
                    width="md"
                    showSearch
                    allowClear
                    options={optionCustomerType}
                />
                <ProFormSelect
                    mode="multiple"
                    label="Salesperson"
                    name="salespersonId"
                    width="md"
                    showSearch
                    allowClear
                    options={state?.seList?.map((it) => {
                        return { value: it.id, label: it.code?.concat(' - ', it.name) };
                    })}
                />
            </ProForm>
        </FormModalComp>
    );
};

export default SaleOrderSummaryReport;
