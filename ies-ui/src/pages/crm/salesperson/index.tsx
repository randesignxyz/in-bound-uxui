import { simpleRequestActions } from "@/services/model"
import { SalespersonOrgAPI } from "./service"
import React, { useEffect, useState } from "react";
import { Button, Card, Space, Spin, Tooltip } from "antd";
import SalePersonTree from "./SalePersonTree";
import { SyncOutlined, PlusOutlined } from "@ant-design/icons";

interface Employee {
    id: number;
    name: string;
    title: string;
    image?: string; // URL or path to employee image
    path?: string;
    subordinates?: Employee[];
}

const mapDataToEmployeeHierarchy = (data: any[]): Employee[] => {
    // Use Map instead of plain object for better performance with numeric keys
    const employeeMap = new Map<number, Employee>();

    // First pass: Create employee objects without subordinates
    data.forEach((item) => {
        employeeMap.set(item.saleId, {
            id: item.saleId,
            name: item.name || 'Unknown',
            title: item.position,
            path: (Math.random() * 100).toString(), // Consider using a more meaningful value
        });
    });

    // Second pass: Build hierarchy
    const rootEmployees: Employee[] = [];

    data.forEach((item) => {
        const currentEmployee = employeeMap.get(item.saleId);
        if (!currentEmployee) return; // Skip if employee wasn't created

        if (item.parentId === null) {
            rootEmployees.push(currentEmployee);
        } else {
            const parent = employeeMap.get(item.parentId);
            if (parent) {
                // Only add subordinates array if it doesn't exist
                if (!parent.subordinates) {
                    parent.subordinates = [];
                }
                parent.subordinates.push(currentEmployee);
            }
            // If no parent found, still add to root (orphaned employees)
            else {
                rootEmployees.push(currentEmployee);
            }
        }
    });

    // Clean up: Remove empty subordinates arrays
    employeeMap.forEach((employee) => {
        if (employee.subordinates?.length === 0) {
            delete employee.subordinates;
        }
    });

    return rootEmployees;
};

export default () => {
    const requestActions = simpleRequestActions();
    const [SaleOrgDataList, setSlaeOrgDataList] = useState<SalespersonOrg[]>();
    const [employees, setEmployees] = useState<Employee[]>([]);
    const [salespersonState, setSalesperonState] = useState<{ visible?: { name: "MODAL", payloads?: SalespersonOrg } }>();
    const loadData = async () => {
        const salesOrg = await SalespersonOrgAPI(requestActions).salesOrgList({});
        const employeeHierarchy = mapDataToEmployeeHierarchy(salesOrg);
        setEmployees(employeeHierarchy);
        setSlaeOrgDataList(salesOrg);
    }

    useEffect(() => {
        loadData()
    }, []);

    return (
        <>
            <Card
                title={"Salesperson Organization Unit"}
                size="small"
                extra={[
                    <Space>
                        <Tooltip title={"Sync Salesperson"}>
                            <Button type="link" onClick={()=>SalespersonOrgAPI(requestActions).syncExecStoreProcedureSalesperson()} size="small" icon={<SyncOutlined />} />
                        </Tooltip>
                        <Button type="link" onClick={() => setSalesperonState({ visible: { name: "MODAL" } })} size="small" icon={<PlusOutlined />} />
                    </Space>
                ]}
            >
                <Spin spinning={requestActions.request?.loading}>
                    <SalePersonTree
                        data={SaleOrgDataList}
                        onLoadData={()=>loadData()}
                    />
                </Spin>
            </Card>
        </>
    )
}