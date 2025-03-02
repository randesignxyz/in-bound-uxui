import { simpleRequestActions } from "@/services/model"
import { SalespersonAPI } from "./service"
import React, { useEffect, useState } from "react";
import OrgChart from "./OrgChart";
import { Avatar, Button, Card, Space, Tree, Typography } from "antd";
import { DataNode } from "antd/es/tree";
import { DownOutlined, PlusOutlined, UserOutlined } from "@ant-design/icons";
import SalePersonTree from "./SalePersonTree";
import Search from "antd/es/input/Search";
import App from "./VerticalTree";
import DemoOrganizationChart from "./OrganizationChart";
import SalespersonHeirarchyForm from "./component/SalespersonHeirarchyForm";

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





interface TreeNode {
    key: string | number;
    title: string;
    children?: TreeNode[];
}


export default () => {
    const requestActions = simpleRequestActions();
    const [SaleOrgDataList, setSlaeOrgDataList] = useState<SalespersonOrg[]>();
    const [employees, setEmployees] = useState<Employee[]>([]);
    const [treeData, setTreeData] = useState<CustomDataNode[]>([]);
    const [direction, setDirection] = useState<{ dir: "vertical" | "horizontal" }>({ dir: "vertical" });
    const [salespersonState, setSalesperonState] = useState<{ visible?: { name: "MODAL", payloads?: SalespersonOrg } }>();
   
    const loadData = async () => {
        const salesOrg = await SalespersonAPI(requestActions).salesOrgList({});
   
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
                    <Button onClick={() => setSalesperonState({ visible: { name: "MODAL" } })}>Add</Button>
                ]}
            >

                <SalePersonTree
                    data={SaleOrgDataList}
                />


            </Card>

            {/* <SalespersonHeirarchyForm
                title={"Salesperson"}
                open={salespersonState?.visible?.name == "MODAL"}
                modalProps={{
                    onCancel: () => setSalesperonState({ visible: undefined })
                }}
            /> */}
        </>
    )
}