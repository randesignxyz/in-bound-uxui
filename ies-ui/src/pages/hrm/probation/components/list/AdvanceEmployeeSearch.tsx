import ProForm, { ProFormSelect } from "@ant-design/pro-form";
import { Drawer, DrawerProps } from "antd";
import { useForm } from "antd/lib/form/Form";
import { simpleRequestActions } from "@/services/model";
import { MultiRequest } from "@/services/apiGateway";
import { BU, Department } from "../../../data";
import { useEffect, useState } from "react";
import { EmployeeServices } from "../../../services";

interface Props extends DrawerProps {
  dataItem?: {
    buIds?: number[];
    depIds?: number[];
  };
  onSearch: (params: { buIds?: number[]; depIds?: number[] }) => void;
  onReset: () => void;
}

const AdvanceEmployeeSearch: React.FC<Props> = ({
                                                  dataItem,
                                                  onSearch,
                                                  onReset,
                                                  ...props
                                                }) => {
  const requestActions = simpleRequestActions();
  const [form] = useForm();

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

  // Sync form with current applied filters when drawer opens
  useEffect(() => {
    form.setFieldsValue({
      buIds: dataItem?.buIds || [],
      depIds: dataItem?.depIds || [],
    });
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
    <Drawer {...props} title="Advanced Search" width={400}>
      <ProForm
        form={form}
        onFinish={(values) => {
          onSearch({
            buIds: values.buIds,
            depIds: values.departmentIds,
          });
        }}
        onReset={() => {
          form.resetFields();
          onReset();
        }}
        submitter={{
          searchConfig: { submitText: "Search", resetText: "Reset" },
          resetButtonProps: { },
        }}
      >
        <ProFormSelect
          label="Company"
          name="buIds"
          mode="multiple"
          allowClear
          placeholder="Select companies"
          options={data.buList.map(it => ({ label: it.name, value: it.id }))}
        />

        <ProFormSelect
          label="Function"
          name="departmentIds"           // ← Now consistent!
          mode="multiple"
          allowClear
          showSearch
          placeholder="Select functions"
          options={data.departmentList.map(it => ({ label: it.name, value: it.id }))}
        />
      </ProForm>
    </Drawer>
  );
};

export default AdvanceEmployeeSearch;
