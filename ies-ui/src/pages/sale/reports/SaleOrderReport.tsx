import FormModalComp, { FormModalProps } from '@/components/FormModal';
import { CrmServiceAPI, InitVisitScheduleParamsType } from '@/services/crm/services';
import { LookupData, LookupDataItem } from '@/services/data';
import { simpleRequestActions } from '@/services/model';
import { SaleServiceAPI } from '@/services/sale/services';
import ProForm, { ProFormDateRangePicker, ProFormRadio, ProFormSelect } from '@ant-design/pro-form';
import { Card, message, Spin } from 'antd';
import { useForm } from 'antd/lib/form/Form';
import moment from 'moment';
import { useEffect, useState } from 'react';

const layout = {
  labelCol: { span: 6 },
  wrapperCol: { span: 18 },
};

const SaleOrderReport: React.FC<FormModalProps> = ({ ...props }) => {
  const requestActions = simpleRequestActions();
  const crmServices = CrmServiceAPI(requestActions);
  const saleService = SaleServiceAPI(requestActions);

  const [selectedReportType, setSelectedReportType] = useState('normal');

  const [optionCustomerType, setOptionCustomerType] = useState<
    { label: string; value: number }[] | undefined
  >();

  const [optionStatus, setOptionStatus] = useState<{ label: string; value: string }[]>();

  const dataStatus = [
    { label: 'Pending', value: 'Pending' },
    { label: 'Posted', value: 'Posted' },
    { label: 'Failed', value: 'Failed' },
    { label: 'Closed', value: 'Closed' },
  ];

  const [state, setState] = useState<{
    seList?: LookupDataItem[];
    selectedSoStatus?: string[];
    selectedCustomerType?: number[];
    lookupDataCustomerTypeList?: LookupData[];
  }>();

  const [form] = useForm<{
    reportType: string;
    salespersonId?: number[];
    orderedDate?: moment.Moment[];
    postedDate?: moment.Moment[];
    customerType?: number[];
    soStatus?: string[];
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
          //   distributorList: it.distributorList,
          lookupDataCustomerTypeList: it.lookupDataList,
          selectedCustomerType: undefined,
          selectedSoStatus: undefined,
        });

        setOptionCustomerType(
          it.lookupDataList
            ?.filter((it) => ['Other'].indexOf(it.code) === -1)
            .map((it) => ({ label: it.name, value: it.id })),
        );
        setOptionStatus(dataStatus);
        // _getCustomerType();
      });

    // form.resetFields();
  }, [props.open]);

  // useEffect(() => {
  //   // console.log('do first');
  //   const isShow =
  //     selectedReportType === 'normal' ||
  //     selectedReportType === 'raw' ||
  //     selectedReportType === 'posted';
  //   setIsEnabled(isShow);
  //   const isShowStatus =
  //     selectedReportType === 'normal' ||
  //     selectedReportType === 'raw' ||
  //     selectedReportType === 'indirect';
  //   setIsEnabledStatus(isShowStatus);
  //   // if (form.__INTERNAL__.name) {
  //   //   if (!isShowStatus) {
  //   //     // setState({ ...state, selectedSoStatus: ["Posted"] });
  //   //     form.setFieldsValue({ soStatus: ['Posted'] });
  //   //   } else {
  //   //     form.setFieldsValue({ soStatus: [] });
  //   //   }
  //   // } else {
  //   //   console.log('Hello');
  //   // }
  // }, [selectedReportType]);

  const onDowloadReportHandler = async () => {
    try {
      const dataForm = await form.validateFields();
      const reportName= 'so-report'
      // console.log(`${reportName}-${moment().format('YYYY-MM-DD HH-mm-ss')}.xlsx`)
      await saleService.downloadSoReport({
        fileName: 'so-report',
        reportName: `${reportName}-${moment().format('YYYY-MM-DD HH:mm:ss')}.xlsx`,
        type: 'EXCEL',
        data: {
          reportType: dataForm.reportType,
          salespersonId: dataForm.salespersonId,
          orderedDate: dataForm.orderedDate,
          postedDate: dataForm.postedDate,
          customerTypeId: dataForm.customerType,
          soStatus: dataForm.soStatus,
          //   distributorId: dataForm.distributorId,
        },
      });
      message.success('Report generated successfully.');
    } catch (error) {
      message.error('Failed to generated report.');
    }
  };
  const onFormvalueChanged = (changedValues: any, values: any) => {
    const { reportType, soStatus, customerType } = changedValues;
    if (reportType && 'reportType' in changedValues) {
      setSelectedReportType(reportType);
      _setFieldValueForm(values);
      const isDisabledCustomerType = reportType === 'indirect';
      const isDisabledStatus = reportType === 'posted';
      if (isDisabledStatus) {
        form.setFieldsValue({ soStatus: ['Posted'] });

        setOptionCustomerType(
          state?.lookupDataCustomerTypeList
            ?.filter((it) => ['Other', 'INDIRECT'].indexOf(it.code) === -1)
            .map((it) => ({ label: it.name, value: it.id })),
        );
        return;
      }
      if (isDisabledCustomerType) {
        form.setFieldsValue({
          customerType: [102], // Indirect
        });
        setOptionCustomerType(
          state?.lookupDataCustomerTypeList
            ?.filter((it) => ['INDIRECT'].indexOf(it.code) !== -1)
            .map((it) => ({ label: it.name, value: it.id })),
        );

        setOptionStatus(dataStatus.filter((it) => it.value !== 'Posted'));
        return;
      }

      setOptionCustomerType(
        state?.lookupDataCustomerTypeList
          ?.filter((it) => ['Other'].indexOf(it.code) === -1)
          .map((it) => ({ label: it.name, value: it.id })),
      );

      setOptionStatus(dataStatus);

      // const isShow = reportType === 'normal' || reportType === 'raw' || reportType === 'posted';
      // setIsEnabled(isShow);
      // if (_disabledStatus()) {
      //   if (state?.selectedCustomerType && state?.selectedSoStatus) {
      //     form.setFieldsValue({
      //       customerType: state.selectedCustomerType,
      //       soStatus: state.selectedSoStatus,
      //     });
      //   } else if (state?.selectedSoStatus) {
      //     form.setFieldsValue({ soStatus: state.selectedSoStatus });
      //   } else if (state?.selectedCustomerType) {
      //     form.setFieldsValue({ customerType: state.selectedCustomerType });
      //   } else {
      //     _setFieldValueForm(changedValues);
      //   }
      // } else {
      //   _setFieldValueForm(values);
      // }
    }
    if (soStatus && 'soStatus' in changedValues) {
      setState({ ...state, selectedSoStatus: soStatus });
    }
    if (customerType && 'customerType' in changedValues) {
      setState({ ...state, selectedCustomerType: customerType });
    }
  };

  const _setFieldValueForm = (values: any) => {
    const { soStatus, customerType } = values;
    if (customerType && soStatus) {
      setState({ ...state, selectedCustomerType: customerType, selectedSoStatus: soStatus });
      form.setFieldsValue({ customerType: undefined, soStatus: undefined });
    } else if (customerType) {
      setState({ ...state, selectedCustomerType: customerType });
      form.setFieldsValue({ customerType: undefined });
    } else if (soStatus) {
      setState({ ...state, selectedSoStatus: soStatus });
      form.setFieldsValue({ soStatus: undefined });
    }
  };

  // const _getCustomerType = () => {
  //   const customerTypes = state?.lookupDataCustomerTypeList?.filter((it) => it.code !== 'Other');
  //   const reportType = form.getFieldValue('reportType');
  //   console.log(reportType);
  //   if (reportType === 'posted') {
  //     const result = customerTypes
  //       ?.filter((it) => it.code !== 'INDIRECT')
  //       .map((it) => ({ label: it.name, value: it.id }));
  //     setOptionCustomerType(result);
  //   } else if (reportType === 'raw' || reportType === 'normal') {
  //     const result = customerTypes?.map((it) => ({ label: it.name, value: it.id }));
  //     setOptionCustomerType(result);
  //   } else {
  //   }
  //   // customerTypes = customerTypes?.filter((it) => it.code !== 'Indirect');
  //   // const result = customerTypes?.map((it) => ({ label: it.name, value: it.id }));
  //   // setOptionCustomerType(result);
  // };

  const _disabledStatus = (): boolean => {
    return selectedReportType === 'posted';
  };

  const _disabledCustomerType = (): boolean => {
    return selectedReportType === 'indirect';
  };

  return (
    <FormModalComp
      confirmLoading={requestActions.request?.loading}
      {...props}
      onResetForm={() => form.resetFields()}
      onSubmit={onDowloadReportHandler}
    >
      <Spin spinning={requestActions.request?.loading}>
        <Card>
          <ProForm
            submitter={false}
            layout="horizontal"
            {...layout}
            form={form}
            onValuesChange={onFormvalueChanged}
          >
            <ProFormRadio.Group
              label="Report Type"
              name="reportType"
              rules={[{ required: true }]}
              initialValue={selectedReportType}
              options={[
                { value: 'normal', label: 'Normal' },
                { value: 'raw', label: 'Raw' },
                { value: 'posted', label: 'Posted SO' },
                { value: 'indirect', label: 'Indirect SO' },
              ]}
            />
            <ProFormSelect
              mode="multiple"
              disabled={_disabledCustomerType()}
              label="Customer Type"
              name="customerType"
              width="md"
              showSearch
              allowClear
              options={optionCustomerType}
            />
            <ProFormSelect
              mode="multiple"
              disabled={_disabledStatus()}
              label="S.O Status"
              name="soStatus"
              width="md"
              showSearch
              allowClear
              options={optionStatus}
            />
            {/* <ProFormDateRangePicker
              rules={[{ required: true }]}
              label="Ordered Date Start-End"
              name="orderedDate"
            /> */}
            <ProFormDateRangePicker
              rules={[{ required: true }]}
              label="Ordered Date Start-End"
              name="orderedDate"
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
        </Card>
      </Spin>
    </FormModalComp>
  );
};

export default SaleOrderReport;
