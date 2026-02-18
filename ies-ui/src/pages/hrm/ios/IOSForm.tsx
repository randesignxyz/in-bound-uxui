import { Button, Flex, message, Modal, Space, Spin } from "antd"
import IPOHeaderForm from "./IOSHeaderForm"
import Section2Form from "./Section2Form"
import Section3Form from "./Section3Form"
import { useEffect, useRef, useState } from "react"
import { ActionType, EditableFormInstance, FooterToolbar, ModalForm, ProForm, ProFormTextArea } from "@ant-design/pro-components"
import { useForm } from "antd/es/form/Form"
import { simpleRequestActions } from "@/services/model"
import { EmployeeMasterIOS } from "./employee/data"
import { useQuery } from "@umijs/max"
import { DataSetupService } from "../master-data/service"
import { IosRequestPayload, IosSection1Params, IosSection2Params, IosSection3Params } from "./data"
import { IOSService } from "./service"
import moment from "moment"
import Section1Form from "./Section1Form"
import StepActionActivity from "./employee/StepActionActivity"


interface Props {
    id?: number;
    onCancel?: () => void;
}

const IOSForm: React.FC<Props> = ({ id, onCancel, }) => {
    const [form] = useForm<IosRequestPayload>();
    const [detail, setDetail] = useState<EmployeeMasterIOS>();
    const [forceKey, setForceKey] = useState(0);
    const requestAction = simpleRequestActions();
    const actionRef = useRef<ActionType>();
    const section1Ref = useRef<EditableFormInstance<IosSection1Params>>();
    const section2Ref = useRef<EditableFormInstance<IosSection2Params>>();
    const section3Ref = useRef<EditableFormInstance<IosSection3Params>>();

    const [submitState, setSubmitState] = useState<{ visible?: { actionType: string, open: boolean, entry: any } }>();

    const [section1State, setSection1State] = useState<IosSection1Params[]>([]);
    const [section2State, setSection2State] = useState<IosSection2Params[]>([]);
    const [section3State, setSection3State] = useState<IosSection3Params[]>(Array.from({ length: 1 }).map((_, i) => ({
        key: (i + 1).toString(),
        id: i + 1,
        iosEmpRequestId: null,
        achieve: '',
        strength: '',
        develop: '',
    })));

    const { data: lookup } = useQuery({
        queryKey: ["master-data"],
        queryFn: () => DataSetupService.listDataSetup({ criteria: { advanceSearch: { code: ["OBJECTIVES", "ACTION-PLAN", "KPI", "WEIGHT"] } } }).query(requestAction),
        refetchOnWindowFocus: false
    });

    const { data: iosData, isFetching: iosFetching } = useQuery({
        queryKey: ["ios-data", id],
        queryFn: async () => {
            const iosData = await IOSService.detail({ id: id }).query(requestAction);
            iosData && setDetail({ ...iosData.iosEmpRequest as unknown as EmployeeMasterIOS });
            iosData && sections1(iosData.section1, iosData.iosWorkFlow?.actions?.length ?? 0);
            iosData && sections2(iosData.section2);
            iosData && sections3(iosData.section3);
            iosData && form.setFieldValue("comment", iosData?.iosEmpRequest?.comment)
            setForceKey(prev => prev + 1);
            return iosData;
        },
        refetchOnWindowFocus: false,
    });

    const total1Weight = section1State.reduce((acc, item) => acc + (item.weight ?? 0), 0)
    const total2Weight = section2State.reduce((acc, item) => acc + (item.weight ?? 0), 0)

    const onSave = async (type: string) => {
        const dataForm = await form.validateFields();
        try{
             await section1Ref.current?.validateFields();
        }catch{
            message.warning('SECTION I: "WHAT" PART (RESULTS) is required.')
            return;
        }
        try{
             await section2Ref.current?.validateFields();
        }catch{
            message.warning('SECTION II: "HOW" PART (APPROACH/BEHAVIORS) is required.')
            return;
        }
         try{
              await section3Ref.current?.validateFields();
        }catch{
            message.warning('SECTION III: PERFORMANCE SUMMARY is required.')
            return;
        }
        const totalWeightSec1 = section1State.reduce((acc, item) => acc + (item.weight ?? 0), 0)
        const totalWeightSec2 = section2State.reduce((acc, item) => acc + (item.weight ?? 0), 0)

        if (type == "SUBMITTED" && totalWeightSec1 !== 100) {
            message.error("Total weight of section 1 must be 100")
            return;
        }

        if (type == "SUBMITTED" && totalWeightSec2 !== 100) {
            message.error("Total weight of section 2 must be 100")
            return;
        }

        const entry: IosRequestPayload = {
            ...dataForm,
            iosMasterListId: detail?.id,
            iosEmpRequestId: id,
            action: type,
            payload: {
                ...dataForm,
                section1: section1State.filter(p => p.obj != null).map((i, index) => ({ ...i, sort: index + 1, startedDate: moment(i.startedDate), dueDate: moment(i.dueDate) })),
                section2: section2State.map((i, index) => ({ ...i, sort: index + 1, startedDate: moment(i.startedDate), dueDate: moment(i.dueDate), objTitle: i.obj })),
                section3: section3State.map((i, index) => ({ ...i, sort: index + 1 }))
            }
        }
        if (type !== "DRAFTED") {
            setSubmitState({ visible: { actionType: type, open: true, entry: entry } })
        } else {
            Modal.confirm({
                title: "Confirmation",
                content: `Are you sure you want to ${type} this record?`,
                onOk: async () => {
                    const entry: IosRequestPayload = {
                        ...dataForm,
                        iosMasterListId: detail?.id,
                        iosEmpRequestId: id,
                        action: type,
                        payload: {
                            ...dataForm,
                            section1: section1State.filter(p => p.obj != null).map((i, index) => ({ ...i, sort: index + 1, startedDate: moment(i.startedDate), dueDate: moment(i.dueDate) })),
                            section2: section2State.map((i, index) => ({ ...i, sort: index + 1, startedDate: moment(i.startedDate), dueDate: moment(i.dueDate), objTitle: i.obj })),
                            section3: section3State.map((i, index) => ({ ...i, sort: index + 1 }))
                        }
                    }
                    const res = await IOSService.update(entry)(requestAction);
                    if (res.id == 0 || res.id == undefined) {
                        message.error(res.message)
                        return;
                    }
                    message.success(`${type} successfully`)
                    onCancel?.()
                }
            })
        }


        // const entry: IosRequestPayload = {
        //     ...dataForm,
        //     iosMasterListId: detail?.id,
        //     iosEmpRequestId: id,
        //     action: type,
        //     payload: {
        //         ...dataForm,
        //         section1: section1State.filter(p => p.obj != null).map((i, index) => ({ ...i, sort: index + 1, startedDate: moment(i.startedDate), dueDate: moment(i.dueDate) })),
        //         section2: section2State.map((i, index) => ({ ...i, sort: index + 1, startedDate: moment(i.startedDate), dueDate: moment(i.dueDate), objTitle: i.obj })),
        //         section3: section3State.map((i, index) => ({ ...i, sort: index + 1 }))
        //     }
        // }


        // Modal.confirm({
        //     title: "Confirmation",
        //     content: `Are you sure you want to ${type} this record?`,
        //     onOk: async () => {
        //         const entry: IosRequestPayload = {
        //             ...dataForm,
        //             iosMasterListId: detail?.id,
        //             iosEmpRequestId: id,
        //             action: type,
        //             payload: {
        //                 ...dataForm,
        //                 section1: section1State.filter(p => p.obj != null).map((i, index) => ({ ...i, sort: index + 1, startedDate: moment(i.startedDate), dueDate: moment(i.dueDate) })),
        //                 section2: section2State.map((i, index) => ({ ...i, sort: index + 1, startedDate: moment(i.startedDate), dueDate: moment(i.dueDate), objTitle: i.obj })),
        //                 section3: section3State.map((i, index) => ({ ...i, sort: index + 1 }))
        //             }
        //         }
        //         const res = await IOSService.update(entry)(requestAction);
        //         if (res.id == 0 || res.id == undefined) {
        //             message.error(res.message)
        //             return;
        //         }
        //         message.success(`${type} successfully`)
        //         onCancel?.()
        //     }
        // })
    }

    const actionPlan = lookup?.find(i => i.code === "ACTION-PLAN")?.items?.filter(i => i.access?.some(access => access.trim().toLowerCase() === detail?.jobLevel?.trim().toLowerCase() || access.trim().toLowerCase() === "all"));
    const objective = lookup?.find(i => i.code === "OBJECTIVES")?.items?.filter(i => i.access?.some(access => access.trim().toLowerCase() === detail?.jobLevel?.trim().toLowerCase() || access.trim().toLowerCase() === "all"));
    const kpi = lookup?.find(i => i.code === "KPI")?.items?.filter(i => i.access?.some(access => access.trim().toLowerCase() === detail?.jobLevel?.trim().toLowerCase() || access.trim().toLowerCase() === "all"));


    const readOnly = iosData?.iosWorkFlow?.actions?.some(action => ["DRAFTED", "SUBMITTED", "ENDORSED"].includes(action.code))

    const sections1 = (section1: any[], action: number) => {

        const filledSection1: IosSection2Params[] = Array.from({ length: ((action == 0) || iosData?.iosWorkFlow?.actions?.some(action => ["APPROVED", "RETURNED"].includes(action.code))) ? section1.length : 5 }, (_, index) => {
            const item = section1?.[index];
            return {
                key: (index + 1).toString(),
                ...(item || {}),
                dueDate:  item?.dueDate ?? moment().endOf('year'),
                startedDate: item?.startedDate ?? moment().startOf('year'),
                weight: (item?.weight == 0) ? undefined : item?.weight
            };
        });

        setSection1State(filledSection1);
    }
    const sections2 = (section2: any[]) => {
        const filledSection2: IosSection2Params[] = section2.map((o, index) => (
            {
                ...o,
                dueDate:  o?.dueDate ?? moment().endOf('year'),
                startedDate:  o?.startedDate ?? moment().startOf('year'),
                key: (index + 1).toString(),
                weight: (o.weight == 0) ? undefined : o.weight
            }
        ));
        setSection2State(filledSection2);
    }
    const sections3 = (section3: any[]) => {
        const filledSection3: IosSection3Params[] = section3.map((o, index) => (
            {
                ...o,
                key: (index + 1).toString(),
            }
        ));
        setSection3State(filledSection3);
    }

    const weightageSection1 = section1State?.reduce((acc, item) => acc + (item.weight ?? 0), 0);
    const weightageSection2 = section2State?.reduce((acc, item) => acc + (item.weight ?? 0), 0);


    return (
        <>
            <Spin spinning={iosFetching}>
                <ProForm
                    form={form}
                    submitter={((iosData?.iosWorkFlow?.actions?.length ?? 0) <= 0) ? false : {
                        render: () => {
                            return (
                                <FooterToolbar portalDom={false}>
                                    <Space>
                                        {readOnly && <Button key="cancel" type="default" danger onClick={() => onCancel?.()}>Cancel</Button>}
                                        {
                                            iosData?.iosWorkFlow?.actions?.map(action => {
                                                return (
                                                    <Space>
                                                        <Button key={action.code} type={action.code === "DRAFTED" ? "dashed" : "primary"}
                                                            disabled={["SUBMITTED", "ENDORSED"].includes(action.code) && !(total1Weight == 100) && !(total2Weight == 100)}
                                                            onClick={() => onSave(action.code)}
                                                        >{action.name}</Button>
                                                    </Space>
                                                )
                                            })
                                        }
                                    </Space>
                                </FooterToolbar>
                            )
                        }
                    }}
                >
                    <Flex vertical gap={16}>
                        <StepActionActivity
                            employeeName={iosData?.iosEmpRequest?.empName ?? ""}
                            stepItems={{
                                current: (iosData?.status == "COMPLETED") ? 4 : iosData?.iosWorkFlow?.currentLevel ?? 0,
                                items: [
                                    iosData?.iosEmpRequest?.empName ?? undefined,
                                    iosData?.iosEmpRequest?.appraiser1 ? `LM1-${iosData?.iosEmpRequest?.appraiser1}` : undefined,
                                    iosData?.iosEmpRequest?.appraiser2 ? `LM2-${iosData?.iosEmpRequest?.appraiser2}` : undefined,
                                    "Completed"
                                ].filter(o => o)
                            }}
                        />
                        <IPOHeaderForm
                            basiceInfo={detail}
                            jobLevel={detail?.jobLevelId}
                        />

                        <Section1Form
                            dataSource={section1State}
                            onValuesChange={(values) => {
                                setSection1State(values)
                            }}
                            readOnly={!readOnly}
                            actionRef={actionRef}
                            weighTage={iosData?.weightageSection1 ?? 0}
                            editableFormRef={section1Ref}
                            formSetting={{
                                midYear: true,
                                selfRating: true,
                                yearEndRating: true,
                                justification: true,
                                weightage: true,
                            }}
                        />
                        <Section2Form
                            dataSource={section2State}
                            objective={objective}
                            actionPlan={actionPlan}
                            editableFormRef={section2Ref}
                            kpi={kpi}
                            readOnly={!readOnly}
                            weighTage={iosData?.weightageSection2 ?? 0}
                            onValueChange={(values) => {
                                setSection2State(values)
                            }}
                            formSetting={{
                                midYear: true,
                                selfRating: true,
                                yearEndRating: true,
                                justification: true,
                                weightage: true,
                            }}
                        />
                        <Section3Form
                            dataSource={section3State}
                            onValueChange={(values) => {
                                setSection3State(values)
                            }}
                            formSetting={{
                                showComment: true
                            }}
                            readOnly={!readOnly}
                            finalScore={((weightageSection1 ?? 0) + (weightageSection2 ?? 0))}
                        />
                    </Flex>
                </ProForm>
            </Spin>

            <ModalForm
                open={submitState?.visible?.open}
                title="Submit Confirmation"
                width={500}
                modalProps={{
                    onCancel: () => {
                        setSubmitState({ visible: undefined })
                    },
                    okText: "Submit",
                    cancelText: "Cancel"
                }}
                onFinish={async (param) => {
                    const res = await IOSService.update({
                        ...submitState?.visible?.entry,
                        comment: param.comment,
                        payload: {
                            ...submitState?.visible?.entry?.payload,
                        }
                    })(requestAction);
                    if (res.id == 0 || res.id == undefined) {
                        message.error(res.message)
                        return;
                    }
                    message.success(`Successfully`)
                    setSubmitState({ visible: undefined })
                    onCancel?.()

                }}
            >
                <ProFormTextArea
                    name="comment"
                    placeholder={"Comments"}
                />

            </ModalForm>
        </>
    )
}

export default IOSForm
