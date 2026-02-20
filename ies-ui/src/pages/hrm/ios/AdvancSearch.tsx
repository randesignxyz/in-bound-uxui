
import { MultiRequest } from "@/services/apiGateway";

import { useQuery } from "@umijs/max";
import { useForm } from "antd/es/form/Form"
import { EmployeeServices } from "../services";
import { simpleRequestActions } from "@/services/model";
import { BU, Department, SubDepartment } from "../data";
import { useEffect, useState } from "react";
import { Drawer, DrawerProps } from "antd";
import ProForm, { ProFormSelect } from "@ant-design/pro-form";

interface Props extends DrawerProps {
    // onClose: () => void;
    param: any;
    onSearch: (params: any) => void;
    onReset: () => void;
}

const AdvancSearch: React.FC<Props> = ({onReset,onSearch, param, ...props }) => {
    const requestAction = simpleRequestActions();
    const [form] = useForm<any>();
    const [subDepartmentList, setSubDepartmentList] = useState<string[]>([]);
    const { data, isFetching, refetch } = useQuery({
        queryKey: ["company"],
        queryFn: () => MultiRequest<{
            buList: BU[];
            deptList: Department[];
            subDeptList: SubDepartment[];
        }>([
            EmployeeServices.listBu.queryParams,
            EmployeeServices.listDepartment.queryParams,
            EmployeeServices.listSubDepartment.queryParams,
        ])(requestAction),
        enabled: props.open,
        cacheTime: 1,
        refetchOnWindowFocus: false,
    });
    useEffect(() => {
        props.open && form.resetFields()
        param && form.setFieldsValue(param)
        const subDeptList = data?.subDeptList.map(it => it.name)||[]
        setSubDepartmentList(subDeptList.filter((item,index)=> subDeptList.indexOf(item)===index)?? [])
    }, [props.open]);
    return (<Drawer {...props} title="Advanced Search" >
     
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
                name={"buIds"}
                showSearch
                allowClear
                label={"Company"}
                mode="multiple"
                options={data?.buList.map((it) => ({
                    label: it.name,
                    value: it.id,
                }))}
            />
            <ProFormSelect
                name={"depIds"}
                showSearch
                label={"Department"}
                mode="multiple"
                allowClear
                options={data?.deptList.map((it) => ({
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
                options={subDepartmentList.filter((item,index)=> subDepartmentList.indexOf(item)===index).map((it) => ({
                    label: it,
                    value: it,
                }))}
            />
            
        </ProForm>

        </Drawer>
    )
}

export default AdvancSearch