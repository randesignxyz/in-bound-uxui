import { simpleRequestActions } from '@/services/model';
import ProForm, { ProFormSelect } from '@ant-design/pro-form';
import { Drawer, DrawerProps } from 'antd';
import { useForm } from 'antd/lib/form/Form';
import { MultiRequest } from '@/services/apiGateway';
import { BU, Department, EmployeeAdvanceSearchParams, EmployeeListItem, SubDepartment } from '../data';
import { useEffect, useState } from 'react';
import { EmployeeServices } from '../services';

interface Props extends DrawerProps {
  dataItem?: EmployeeListItem | undefined;
  onSearch: (params: EmployeeAdvanceSearchParams) => void;
  onReset: () => void;
  onChange: (params: EmployeeAdvanceSearchParams) => void; // notify parent about selected filters
}

const AdvanceEmployeeSearch: React.FC<Props> = ({
                                                  dataItem,
                                                  onSearch,
                                                  onReset,
                                                  onChange,
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
  };

  return (
    <Drawer {...props}>
      <ProForm
        form={form}
        onReset={() => {
          onReset();
          onChange({});
        }}
        onValuesChange={(_, allValues) => {
          onChange(allValues);
        }}
        submitter={{
          submitText: 'Search',
          resetText: 'Reset',
          onSubmit: async () => {
            const values = await form.validateFields();
            onSearch(values); // trigger search in parent
            onChange(values); // update advanceSearchParams in parent
          },
        }}
      >
        <ProFormSelect
          label="Company"
          name="bu"
          shouldUpdate
          allowClear
          options={data?.buList.map((it) => ({ label: it.name, value: it.id }))}
        />
        <ProFormSelect
          label="Function"
          name="department"
          showSearch
          allowClear
          options={data?.departmentList?.map((it) => ({ label: it.name, value: it.id }))}
        />
      </ProForm>
    </Drawer>
  );
};

export default AdvanceEmployeeSearch;
