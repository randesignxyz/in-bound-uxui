import { ProDescriptions } from "@ant-design/pro-components";
import { Card, Flex, Table, Typography } from "antd";
import { EmployeeMasterIOS } from "./employee/data";

const { Title, Paragraph } = Typography;

interface Props {
    basiceInfo?: EmployeeMasterIOS
    jobLevel?: number
}

const IPOHeaderForm: React.FC<Props> = ({ basiceInfo, jobLevel }) => {

    const ratingScaleData = [
        { rating: 5, label: "Outstanding", description: "Consistently delivers all objectives and action plans with high-quality results and a positive impact." },
        { rating: 4, label: "Exceed Expectations", description: "Exceeds in delivering all objectives and action plans required and expected for the job, demonstrating exceptional results." },
        { rating: 3, label: "Meet Expectations", description: "Consistently meets expectations in delivering objectives and action plans while following the standards and requirements for the role." },
        { rating: 2, label: "Need Improvements", description: "Delivers some objectives and action plans, but improvement is required." },
        { rating: 1, label: "Unsatisfactory", description: "Fails to meet the minimum objectives and action plans required for the role." },
    ];
    const columnLevel = [
        { title: "Employee ID", dataIndex: "empNo" },
        { title: "Employee Name", dataIndex: "empName" },
        { title: "Position", dataIndex: "jobTitle" },
        { title: "Company", dataIndex: "buName" },
        { title: "Function", dataIndex: "deptName" },
        { title: "Sub-Function", dataIndex: "subDeptName" },

        ...([2276, 2275, 2273].some(o => o === jobLevel)
            ? [
                { title: "Line Manager 1", dataIndex: "appraiser1" },
                { title: "Line Manager 2", dataIndex: "appraiser2" },
            ]
            : [
                { title: "FM Name", dataIndex: "appraiser2" },
                { title: "Sub-FM Name", dataIndex: "appraiser1" },
            ])
    ]


    return (
        <Flex vertical gap={16}>
            <Card size="small" title={"Employee Information"}>
                <ProDescriptions
                    column={{ xxl: 4, xl: 4, lg: 4, md: 2, sm: 1, xs: 1 }}
                    bordered={false}
                    size="small"
                    dataSource={basiceInfo}
                    labelStyle={{
                        width: '120px'
                    }}
                    columns={columnLevel}
                />
            </Card>


            <Card
                type="inner"
                title={"INSTRUCTION:"}
                style={{ borderColor: '#d9d9d9' }}
                size="small"
            >
                <Typography>
                    <Paragraph>
                        <ul>
                            <li>Information in this form and process is <strong>Private and Confidential</strong>.</li>
                            <li>Individual objectives shall be set by the employee's FM or eligible Sub-FM at the beginning of each fiscal year (January), and must be <span style={{ color: '#1890ff' }}>aligned with the company's business goals</span>, <span style={{ color: '#fa8c16' }}>the function's priorities</span> and the employee's development needs.</li>
                            <li>Objectives must be set using the <strong>SMART</strong> method, ensuring they are:
                                <ul>
                                    <li><strong>Specific:</strong> Clear and precise objectives that describe exactly what needs to be achieved.</li>
                                    <li><strong>Measurable:</strong> Objectives that can be tracked to assess progress and completion.</li>
                                    <li><strong>Achievable:</strong> Realistic goals, considering the employee's role, capabilities, and resources available.</li>
                                    <li><strong>Relevant:</strong> Objectives that align with the overall goals of the team, function, and business.</li>
                                    <li><strong>Time-bound:</strong> Clear deadlines or timeframes for completing each objective.</li>
                                </ul>
                            </li>
                            <li>Employees shall be provided with the opportunity to clarify, discuss, and adjust their objectives to align with functional and business goals if valid and necessary.</li>
                            <li>Performance review will be conducted twice per year:
                                <ul>
                                    <li>Mid-Year Review (June): To assess progress, provide feedback, and adjust objectives if necessary.</li>
                                    <li>Year-End Review (December): To evaluate overall performance and achievement of objectives.</li>
                                </ul>
                            </li>
                        </ul>
                    </Paragraph>
                </Typography>
            </Card>

            {/* Section 3: Rating Scale */}
            <Card
                type="inner"
                title="RATING SCALE:"
                size="small"
                style={{ borderColor: '#d9d9d9' }}
            >
                <Table
                    dataSource={ratingScaleData}
                    pagination={false}
                    rowKey="rating"
                    size="small"
                    showHeader={false}
                    columns={[
                        {
                            dataIndex: 'rating',
                            width: 50,
                            render: (text) => <strong>{text}</strong>,
                        },
                        {
                            dataIndex: 'label',
                            width: 200,
                            render: (text) => <strong>{text}</strong>,
                        },
                        {
                            dataIndex: 'description',
                        },
                    ]}
                />
            </Card>
        </Flex>
    )
}

export default IPOHeaderForm
