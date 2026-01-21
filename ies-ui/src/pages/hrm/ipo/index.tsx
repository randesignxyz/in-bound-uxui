import PageWrapper from "@/components/PageWrapper";
import IPOForm from "./IPOForm";
import IPODetail from "./detail";


const ipoData = [
    {
        id: "1",
        ipoCode: "IPO-2023-001",
        employeeId: "002330",
        employeeName: "Pheun Reach",
        position: "Senior Developer, Application Development",
        date: "2023-01-15",
        status: "Submitted"
    },
    {
        id: "2",
        ipoCode: "IPO-2023-002",
        employeeId: "002331",
        employeeName: "Sok Dara",
        position: "Network Engineer",
        date: "2023-01-16",
        status: "Draft"
    },
    {
        id: "3",
        ipoCode: "IPO-2023-003",
        employeeId: "002332",
        employeeName: "Chan Vithyea",
        position: "System Administrator",
        date: "2023-01-17",
        status: "Approved"
    },
    {
        id: "4",
        ipoCode: "IPO-2023-004",
        employeeId: "002333",
        employeeName: "Keo Kalyan",
        position: "QA Specialist",
        date: "2023-01-18",
        status: "Rejected"
    },
    {
        id: "5",
        ipoCode: "IPO-2023-005",
        employeeId: "002334",
        employeeName: "Meas Sophea",
        position: "Project Manager",
        date: "2023-01-19",
        status: "In Progress"
    }
];

export default () => {
    return (
        <PageWrapper
            tabRender={(item) => [
                {
                    tabKey: "add",
                    tabLabel: "Add IPO",
                    action: "add",
                    actionLabel: "Add IPO",
                    panel: ({ }) => <IPOForm />
                },
                {
                    tabKey: "detail",
                    tabLabel: "Detail IPO",
                    action: "view",
                    actionLabel: "Detail IPO",
                    panel: ({ }) => <IPODetail />
                }
            ]}
            listView={{
                type: "Table",
                props: {
                    dataSource: ipoData,
                    columns: [
                        {
                            title: "Ipo Code",
                            dataIndex: "ipoCode",
                            actionProps: (item) => ({
                                label: item.ipoCode,
                                action: "view",
                                type: "view",

                            })
                        },
                        {
                            title: "Employee ID",
                            dataIndex: "employeeId"
                        },
                        {
                            title: "Employee Name",
                            dataIndex: "employeeName"
                        },
                        {
                            title: "Position",
                            dataIndex: "position"
                        },
                        {
                            title: "Date",
                            dataIndex: "date"
                        },
                        {
                            title: "Status",
                            dataIndex: "status"
                        }
                    ]
                }
            }}
        />
    )
};
