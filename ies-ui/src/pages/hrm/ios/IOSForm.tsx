import { Button, Flex, message, Modal, Space } from "antd"
import IPOHeaderForm from "./IOSHeaderForm"
import Section2Form from "./Section2Form"
import Section3Form from "./Section3Form"
import { useEffect, useRef, useState } from "react"
import { EditableFormInstance, FooterToolbar, ProForm, ProFormSelect } from "@ant-design/pro-components"
import { useForm } from "antd/es/form/Form"
import { simpleRequestActions } from "@/services/model"
import { EmployeeIOSAPI } from "./employee/service"
import { EmployeeMasterIOS } from "./employee/data"
import { useQuery } from "@umijs/max"
import { DataSetupService } from "../master-data/service"
import { IosRequestPayload, IosSection1Params, IosSection2Params, IosSection3Params } from "./data"
import { IOSService } from "./service"
import moment from "moment"
import Section1Form from "./Section1Form"


interface Props {
    actions?: { name: string, id: number }[];
    id?: number;
}

const IPOForm: React.FC<Props> = ({ actions, id }) => {
    const [form] = useForm<IosRequestPayload>();
    const [employee, setEmployee] = useState<EmployeeMasterIOS[]>([]);
    const [detail, setDetail] = useState<EmployeeMasterIOS>();
    const requestAction = simpleRequestActions();
    const section1Ref = useRef<EditableFormInstance<IosSection1Params>>();
    const section2Ref = useRef<EditableFormInstance<IosSection2Params>>();
    const section3Ref = useRef<EditableFormInstance<IosSection3Params>>();



    const [section1, setSection1] = useState<IosSection1Params[]>(Array.from({ length: 8 }).map((_, i) => ({
        key: (i + 1).toString(),
        id: i + 1,
        iosEmpRequestId: null,
        obj: '',
        actionPlan: '',
        kpi: '',
        weight: undefined,
        startedDate: moment().startOf('year'),
        dueDate: moment().endOf('year'),
        mid: '',
        selfEvaluation: 0,
        mEvaluation: 0,
        justification: '',
    }
    )))
    const [section2, setSection2] = useState<IosSection2Params[]>();
    const [section3, setSection3] = useState<IosSection3Params[]>(Array.from({ length: 1 }).map((_, i) => ({
        key: (i + 1).toString(),
        id: i + 1,
        iosEmpRequestId: null,
        achieve: '',
        strength: '',
        develop: '',
    })));


    const { data: lookup, isFetching, refetch } = useQuery({
        queryKey: ["master-data"],
        queryFn: () => DataSetupService.listDataSetup({ criteria: { advanceSearch: { code: ["OBJECTIVES", "ACTION-PLAN", "KPI"] } } }).query(requestAction),
        refetchOnWindowFocus: false
    });

    const { data: iosData, isFetching: iosFetching, refetch: iosRefetch } = useQuery({
        queryKey: ["ios-data", id],
        queryFn: () => IOSService.detail({ id: id }).query(requestAction),
        refetchOnWindowFocus: false,
    });

    const onSave = async (type: string | "Draft" | "Submit") => {
        const dataForm = await form.validateFields();
        await section1Ref.current?.validateFields();
        await section2Ref.current?.validateFields();
        await section3Ref.current?.validateFields();

        Modal.confirm({
            title: "Confirmation",
            content: `Are you sure you want to ${type} this record?`,
            onOk: async () => {
                const entry: IosRequestPayload = {
                    ...dataForm,
                    iosMasterListId: detail?.id,
                    action: type,
                    payload: {
                        section1: section1.map(i => ({ ...i, startedDate: moment(i.startedDate), dueDate: moment(i.dueDate) })),
                        section2: section2.map(i => ({ ...i, startedDate: moment(i.startedDate), dueDate: moment(i.dueDate) })),
                        section3: section3
                    }
                }
                if ((actions?.length ?? 0) <= 0) {
                    const res = await IOSService.save(entry)(requestAction);
                    if (res.id == 0 || res.id == undefined) {
                        message.error(res.message)
                        return;
                    }
                    message.success(`${type} successfully`)
                }
                else {
                    const res = await IOSService.update(entry)(requestAction);
                    if (res.id == 0 || res.id == undefined) {
                        message.error(res.message)
                        return;
                    }
                    message.success(`${type} successfully`)
                }
            }
        })
    }

    const actionPlan = lookup?.find(i => i.code === "ACTION-PLAN")?.items?.filter(i => i.access?.some(access => access.trim().toLowerCase() === detail?.jobLevel?.trim().toLowerCase() || access.trim().toLowerCase() === "all"));
    const objective = lookup?.find(i => i.code === "OBJECTIVES")?.items?.filter(i => i.access?.some(access => access.trim().toLowerCase() === detail?.jobLevel?.trim().toLowerCase() || access.trim().toLowerCase() === "all"));
    const kpi = lookup?.find(i => i.code === "KPI")?.items?.filter(i => i.access?.some(access => access.trim().toLowerCase() === detail?.jobLevel?.trim().toLowerCase() || access.trim().toLowerCase() === "all"));

    const section1Weightage = detail?.initData?.weighTage?.find(i => i.section == "1" && i.jobLevelId == detail?.jobLevelId)?.weight;
    const section2Weightage = detail?.initData?.weighTage?.find(i => i.section == "2" && i.jobLevelId == detail?.jobLevelId)?.weight
        ;


    // useEffect(() => {

    //     detail && setSection2(detail?.initData?.section2.map((i, index) => ({ ...i, key: (index + 1).toString(), startedDate: moment().startOf('year'), dueDate: moment().endOf('year') })))
    // }, [detail]);

    useEffect(() => {
        iosData && setDetail({ ...iosData.iosEmpRequest });
        // iosData && setSection1(iosData.section1.map((o, index) => ({ ...o, key: (index + 1).toString() })));
        iosData && setSection2(iosData.section2.map((o, index) => ({ ...o, dueDate: moment(o.dueDate).endOf('year'), startedDate: moment(o.startedDate).startOf('year'), key: (index + 1).toString() })));
        // iosData && setSection3(;
    }, [iosData])



    return (
        <>
            <ProForm
                form={form}
                submitter={{
                    render: () => {
                        return (
                            <FooterToolbar portalDom={false}>
                                <Button type="default" danger>Cancel</Button>
                                {
                                    actions?.map(action => {
                                        return (
                                            <Button key={action.code} type="primary"
                                                onClick={() => onSave(action.name)}
                                            >{action.name}</Button>
                                        )
                                    }) ?? <Space><Button type="dashed"
                                        onClick={() => onSave("DRAFTED")}
                                    > Save as Draft</Button>
                                        <Button type="primary"
                                            onClick={() => onSave("SUBMITTED")}
                                        >Submit</Button></Space>
                                }

                            </FooterToolbar>
                        )
                    }
                }}
            >
                {/* <Card size="small" > */}
                <Flex vertical gap={16}>
                    <ProFormSelect
                        name={"employee"}
                        label={""}
                        // hidden={detail?.jobLevel?.toUpperCase() == "STAFF"}
                        hidden={true}
                        onChange={(e) => {
                            const obj = employee.find(o => o.id == e)
                            setDetail(obj);
                        }}
                        showSearch
                        request={async ({ keyword }) => {
                            const data = await EmployeeIOSAPI.page({
                                criteria: { searchValue: keyword }
                            }).query(requestAction)

                            if (data) {
                                setEmployee(data)
                                if (data.length === 1) {
                                    const item = data[0];
                                    form.setFieldValue("employee", item.id)
                                    setDetail(item)
                                }
                            }
                            return data?.map((p) => ({ value: p.id, label: p.empName }))
                        }}
                    />
                    <IPOHeaderForm
                        basiceInfo={detail}
                        jobLevel={detail?.jobLevelId}
                    />
                    <Section1Form
                        dataSource={section1 ?? []}
                        onValuesChange={(values) => {
                            setSection1(values)
                        }}
                        weighTage={section1Weightage || 0}
                        editableFormRef={section1Ref}

                    />
                    <Section2Form
                        dataSource={section2 ?? []}
                        objective={objective}
                        actionPlan={actionPlan}
                        editableFormRef={section2Ref}
                        kpi={kpi}
                        weighTage={section2Weightage || 0}
                        onValueChange={(values) => {
                            setSection2(values)
                        }} />
                    <Section3Form
                        dataSource={section3}
                        onValueChange={(values) => {
                            setSection3(values)
                        }}
                    // finalScore={section1.reduce((acc, item) => acc + (item.se || 0), 0) + section2.reduce((acc, item) => acc + (item.weight || 0), 0)}
                    />
                </Flex>
            </ProForm>
            {/* </Card> */}
        </>
    )
}

export default IPOForm
