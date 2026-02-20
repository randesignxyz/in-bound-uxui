import ProForm, { ProFormSelect } from "@ant-design/pro-form";
import { Drawer, DrawerProps } from "antd";
import { useForm } from "antd/lib/form/Form";
import { simpleRequestActions } from "@/services/model";
import { MultiRequest } from '@/services/apiGateway';
import { BU, Department, SubDepartment } from '../../hrm/data';
import { useEffect, useState } from "react";
import { EmployeeServices } from "../../hrm/services";
import { IOSEmployeeSearchParams } from '@/pages/hrm/ios-upload/service/data';

interface Props extends DrawerProps {
  dataItem?: IOSEmployeeSearchParams;
  onSearch: (params: IOSEmployeeSearchParams) => void;
  onReset: () => void;
}

const AdvanceEmployeeSearch: React.FC<Props> = ({
                                                  dataItem,
                                                  onSearch,
                                                  onReset,
                                                  ...props
                                                }) => {
  const requestActions = simpleRequestActions();
  const [form] = useForm<IOSEmployeeSearchParams>();

  const [data, setData] = useState<{
    buList: BU[];
    departmentList: Department[];
    // subDepartmentList: SubDepartment[];
    subDepartmentList: string[];
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
      form.setFieldsValue(dataItem);
    }
  }, [dataItem, form]);

  const initData = async () => {
    const rs = await MultiRequest<{
      buList: BU[];
      deptList: Department[];
      subDeptList: SubDepartment[]; // ✅ match responseKey
    }>([
      EmployeeServices.listBu.queryParams,
      EmployeeServices.listDepartment.queryParams,
      EmployeeServices.listSubDepartment.queryParams,
    ])(requestActions);

    const subDeptList = rs.subDeptList.map(it => it.name)
    setData({
      buList: rs.buList ?? [],
      departmentList: rs.deptList ?? [],
      subDepartmentList: subDeptList.filter((item,index)=> subDeptList.indexOf(item)===index)?? [], // ✅ map correctly
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
        <ProFormSelect
          label="Sub-Function"
          name="subDepIds"
          placeholder="Select Sub-functions"
          mode="multiple"
          allowClear
          showSearch
          options={data.subDepartmentList.map((it) => ({
            label: it,
            value: it,
          }))}
        />
      </ProForm>
    </Drawer>
  );
};

export default AdvanceEmployeeSearch;
