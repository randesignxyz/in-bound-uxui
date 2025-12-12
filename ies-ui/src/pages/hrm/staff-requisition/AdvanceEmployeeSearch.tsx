import React, { useEffect, useState } from "react";
import { Drawer } from "antd";
import ProForm, { ProFormSelect } from "@ant-design/pro-form";
import { useForm } from "antd/lib/form/Form";

import { simpleRequestActions } from "@/services/model";
import { MultiRequest } from "@/services/apiGateway";
import { EmployeeServices } from "../services";

import { BU, Department, SubDepartment, StaffRequisitionAdvanceSearchParams } from "../data";

interface Props {
  open: boolean;
  onClose: () => void;
  onSearch: (params: StaffRequisitionAdvanceSearchParams) => void;
  onReset: () => void;
}

const AdvanceSearchDrawer: React.FC<Props> = ({ open, onClose, onSearch, onReset }) => {
  const requestActions = simpleRequestActions();
  const [form] = useForm<StaffRequisitionAdvanceSearchParams>();

  const [data, setData] = useState<{ buList: BU[]; departmentList: Department[]; subDepartmentList: SubDepartment[] }>();

  useEffect(() => {
    initData();
  }, []);

  const initData = async () => {
    const rs = await MultiRequest<{ buList: BU[]; deptList: Department[]; subDeptList: SubDepartment[] }>([
      EmployeeServices.listBu.queryParams,
      EmployeeServices.listDepartment.queryParams,
      EmployeeServices.listSubDepartment.queryParams,
    ])(requestActions);

    setData({ buList: rs.buList, departmentList: rs.deptList, subDepartmentList: rs.subDeptList });
  };

  return (
    <Drawer title="Advanced Search" width={400} destroyOnClose open={open} onClose={onClose}>
      <ProForm
        form={form}
        submitter={{
          searchConfig: { submitText: "Search" },
          resetButtonProps: false,
          onSubmit: async () => {
            const values = await form.validateFields();
            onSearch(values);
          },
        }}
        onReset={onReset}
      >
        <ProFormSelect label="Company" name="bu" allowClear options={data?.buList?.map((it) => ({ label: it.name, value: it.id }))} />
        <ProFormSelect label="Function" name="department" allowClear showSearch options={data?.departmentList?.map((it) => ({ label: it.name, value: it.id }))} />
        <ProFormSelect label="Sub-Function" name="subDepartment" allowClear showSearch options={data?.subDepartmentList?.map((it) => ({ label: it.name, value: it.id }))} />
      </ProForm>
    </Drawer>
  );
};

export default AdvanceSearchDrawer;
