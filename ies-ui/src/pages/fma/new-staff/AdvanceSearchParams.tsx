import ProForm, { ProFormSelect } from "@ant-design/pro-form";
import { DatePicker, Drawer, DrawerProps, Form } from 'antd';
import { simpleRequestActions } from "@/services/model";
import { MultiRequest } from '@/services/apiGateway';
import { BU, Department, SubDepartment } from '../../hrm/data';
import { useEffect, useState } from "react";
import { EmployeeServices } from "../../hrm/services";
import { SearchParams } from '@/pages/fma/new-staff/data.types';
import dayjs from 'dayjs';


interface Props extends DrawerProps {
  dataItem?: SearchParams;
  onSearch: (params: SearchParams) => void;
  onReset: () => void;
}

const AdvanceEmployeeSearch: React.FC<Props> = ({
                                                  dataItem,
                                                  onSearch,
                                                  onReset,
                                                  ...props
                                                }) => {
  const requestActions = simpleRequestActions();
  const [form] = Form.useForm();
  const RangePicker = DatePicker.RangePicker;
  const [data, setData] = useState<{
    buList: BU[];
    departmentList: Department[];
    subDepartmentList: SubDepartment[];
  }>({
    buList: [],
    departmentList: [],
    subDepartmentList: [],
  });

  useEffect(() => {
    initData();
  }, []);

  useEffect(() => {
    if (dataItem) {
      form.setFieldsValue({
        ...dataItem,
        dateRange:
          dataItem.startDate && dataItem.endDate
            ? [dayjs(dataItem.startDate), dayjs(dataItem.endDate)]
            : undefined,
      });
    }
  }, [dataItem, form]);

  const initData = async () => {
    const rs = await MultiRequest<{
      buList: BU[];
      deptList: Department[];
      subDeptList: SubDepartment[];
    }>([
      EmployeeServices.listBu.queryParams,
      EmployeeServices.listDepartment.queryParams,
      EmployeeServices.listSubDepartment.queryParams,
    ])(requestActions);

    setData({
      buList: rs.buList ?? [],
      departmentList: rs.deptList ?? [],
      subDepartmentList: rs.subDeptList ?? [],
    });
  };

  const handleSubmit = async () => {
    const values = await form.validateFields();

    const { dateRange, ...rest } = values;

    let startDate: string | undefined;
    let endDate: string | undefined;

    if (dateRange && dateRange.length === 2) {
      startDate = dateRange[0].format("YYYY-MM-DD");
      endDate = dateRange[1].format("YYYY-MM-DD");
    }

    onSearch({
      ...rest,
      startDate,
      endDate,
    });
  };

  return (
    <Drawer {...props} title="Advanced Search">
      <ProForm
        form={form}
        submitter={{
          searchConfig: {
            submitText: "Search",
            resetText: "Reset",
          },
          onSubmit: handleSubmit,
          onReset: async () => {
            form.resetFields();
            onReset();
          },
        }}
      >
        {/* Date Range */}
        <Form.Item name="dateRange" label="Select Date">
          <RangePicker style={{ width: "100%" }} />
        </Form.Item>

        {/* Company */}
        <ProFormSelect
          label="Company"
          name="buIds"
          mode="multiple"
          allowClear
          placeholder="Select companies"
          options={data.buList.map((it) => ({
            label: it.name,
            value: it.id,
          }))}
        />

        {/* Function */}
        <ProFormSelect
          label="Function"
          name="depIds"
          mode="multiple"
          allowClear
          showSearch
          placeholder="Select functions"
          options={data.departmentList.map((it) => ({
            label: it.name,
            value: it.id,
          }))}
        />
      </ProForm>
    </Drawer>
  );
};

export default AdvanceEmployeeSearch;
