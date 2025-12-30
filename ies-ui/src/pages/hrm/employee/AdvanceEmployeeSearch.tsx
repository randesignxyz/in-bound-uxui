
import { simpleRequestActions } from '@/services/model';
import ProForm, { ProFormSelect } from '@ant-design/pro-form';
import { Drawer, DrawerProps, Flex } from 'antd';
import { useForm } from 'antd/lib/form/Form';
import { MultiRequest } from '@/services/apiGateway';

import { BU, Department, EmployeeAdvanceSearchParams, EmployeeListItem, SubDepartment } from '../data';
import { useEffect, useState } from 'react';
import { EmployeeServices } from '../services';

interface Props extends DrawerProps {
  dataItem?: EmployeeListItem | undefined;
  onSearch: (params: EmployeeAdvanceSearchParams) => void;
  onReset: () => void;
}

const AdvanceEmployeeSearch: React.FC<Props> = ({
  dataItem,
  onSearch,
  onReset,
  ...props
}) => {
  const requestActions = simpleRequestActions();
  const [form] = useForm<EmployeeAdvanceSearchParams>();
  const [data, setData] = useState<{
    buList: BU[];
    departmentList: Department[];
    subDepartmentList: SubDepartment[];
  }>();

  useEffect(() => {
    initData();
  }, [dataItem]);
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
      buList: rs.buList,
      departmentList: rs.deptList,
      subDepartmentList: rs.subDeptList,
    });
  }

  return (
    <Drawer {...props} title="Advanced Search" width={400}>
      <ProForm
        form={form}
        onFinish={(values) => {
          onSearch({
            buId: values.buId,
            department: values.department,
          });
        }}
        onReset={() => {
          form.resetFields();
          onReset();
        }}
        submitter={{
          searchConfig: { submitText: "Search", resetText: "Clear" },
          resetButtonProps: { type: "primary" },
        }}
      >
        <ProFormSelect label="Company" name={'bu'} shouldUpdate allowClear
          options={data?.buList.map((it) => ({ label: it.name, value: it.id }))}
        />
        <ProFormSelect label="Function" name={'department'} showSearch allowClear
          options={data?.departmentList?.map((it) => ({ label: it.name, value: it.id }))}
        />

      </ProForm>
    </Drawer>
  );
};

export default AdvanceEmployeeSearch;
