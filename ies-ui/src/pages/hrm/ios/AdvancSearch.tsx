
import { MultiRequest } from "@/services/apiGateway";
import { DrawerForm, DrawerFormProps, ProFormSelect } from "@ant-design/pro-components"
import { useQuery } from "@umijs/max";
import { useForm } from "antd/es/form/Form"
import { EmployeeServices } from "../services";
import { simpleRequestActions } from "@/services/model";
import { BU, Department } from "../data";
import { useEffect } from "react";

interface Props extends DrawerFormProps {
    onCancel: () => void;
    param: any
}

const AdvancSearch: React.FC<Props> = ({ onCancel, param, ...props }) => {
    const requestAction = simpleRequestActions();
    const [form] = useForm();
    const { data, isFetching, refetch } = useQuery({
        queryKey: ["company"],
        queryFn: () => MultiRequest<{
            buList: BU[];
            deptList: Department[];
        }>([
            EmployeeServices.listBu.queryParams,
            EmployeeServices.listDepartment.queryParams,
        ])(requestAction),
        enabled: props.open,
        cacheTime: 1,
        refetchOnWindowFocus: false,
    });
    useEffect(() => {
        props.open && form.resetFields()
        param && form.setFieldsValue(param)
    }, [props.open]);
    return (
        <DrawerForm
            {...props}
            form={form}
            title={"Advance Search"}
            drawerProps={{
                onClose: onCancel,
                width: 500
            }}

            submitter={{
                searchConfig: {
                    submitText: "Search",
                    resetText: "Reset",
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


        </DrawerForm>
    )
}

export default AdvancSearch