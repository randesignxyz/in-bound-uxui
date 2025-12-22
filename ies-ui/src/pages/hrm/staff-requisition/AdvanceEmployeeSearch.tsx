import ProForm, { ProFormSelect } from "@ant-design/pro-form";
import { Drawer, DrawerProps } from "antd";
import { useForm } from "antd/lib/form/Form";
import { simpleRequestActions } from "@/services/model";
import { MultiRequest } from "@/services/apiGateway";
import { BU, Department, StaffRequisitionAdvanceSearchParams } from "../data";
import { useEffect, useState } from "react";
import { EmployeeServices } from "../services";

interface Props extends DrawerProps {
  dataItem?: StaffRequisitionAdvanceSearchParams;
  onSearch: (params: StaffRequisitionAdvanceSearchParams) => void;
  onReset: () => void;
}

const AdvanceEmployeeSearch: React.FC<Props> = ({
                                                  dataItem,
                                                  onSearch,
                                                  onReset,
                                                  ...props
                                                }) => {
  const requestActions = simpleRequestActions();
  const [form] = useForm<StaffRequisitionAdvanceSearchParams>();

  const [data, setData] = useState<{
    buList: BU[];
    departmentList: Department[];
  }>({
    buList: [],
    departmentList: [],
  });

  useEffect(() => {
    initData();
  }, []);

  useEffect(() => {
    if (dataItem) {
      form.setFieldsValue(dataItem);
    }
  }, [dataItem, form]);

  const initData = async () => {
    const rs = await MultiRequest<{
      buList: BU[];
      deptList: Department[];
    }>([
      EmployeeServices.listBu.queryParams,
      EmployeeServices.listDepartment.queryParams,
    ])(requestActions);

    setData({
      buList: rs.buList,
      departmentList: rs.deptList,
    });
  };

  return (
    <Drawer {...props} title="Advanced Search">
      <ProForm
        form={form}
        onReset={() => {
          form.resetFields();
          onReset();
        }}
        submitter={{
          searchConfig: {
            submitText: "Search",
            resetText: "Reset",
          },
          onSubmit: async () => {
            const values = await form.validateFields();
            onSearch(values);
          },
        }}
      >
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

        <ProFormSelect
          label="Function"
          name="departmentIds"
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
