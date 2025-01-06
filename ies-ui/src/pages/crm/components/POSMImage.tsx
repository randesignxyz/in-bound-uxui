import { Button, Card, Image, Modal, Result, Space, Spin, Typography } from "antd";
import React, { useEffect, useState } from "react";
import { ContractPOSMItem } from "../contract/types";
import ImageViewer from "./ImageViewer";
import ImageUploader from "@/pages/fleet/components/UploadImage";
import { CrmServiceAPI } from "@/services/crm/services";
import { simpleRequestActions } from "@/services/model";
import { ContractServices } from "../contract/services";
import { DrawerForm, DrawerFormProps } from "@ant-design/pro-components";
import { DeleteOutlined } from "@ant-design/icons";

interface Props extends DrawerFormProps {
    pomsInfo?: ContractPOSMItem,
    imageId?: string[];
    version?: number;
    source: "CUSTOMER" | "POSM",
    onClose: () => void
}

const POSMImage: React.FC<Props> = ({ imageId, version, source, onClose, pomsInfo, ...props }) => {
    const requestActions = simpleRequestActions();
    const [fileList, setFileList] = useState<{ id: number, imageId: string }[]>();
    const loadData = async () => {
        setFileList([]);
        const data = await ContractServices.listPOSMAttachment(pomsInfo?.id || 0).query(requestActions);
        setFileList(data)
    }
    useEffect(() => {
        loadData();
    }, [props.open]);

    return (
        <DrawerForm
            {...props}
            width={700}
            submitter={false}
            title={"Posm"}
            resize={{
                maxWidth: window.innerWidth * 0.8,
                minWidth: 600,
            }}
            drawerProps={{
                onClose: () => onClose?.(),
                extra: <>
                    {source == "POSM" && <ImageUploader
                        onSetFiles={async (e) => {
                            await CrmServiceAPI(requestActions).attachFiles({
                                attachTo: "POSM",
                                attachToId: pomsInfo?.id,
                                fileIdList: [e.at(-1)?.response]
                            });
                            loadData()
                        }}
                    />
                    }
                </>
            }}
        >
            <Spin spinning={requestActions.request?.loading}>
                {
                    fileList?.length ? (
                        <Image.PreviewGroup >
                            <Space wrap>
                                {
                                    fileList?.map(p => {
                                        return <Card
                                        cover={
                                            <ImageViewer
                                                fileId={p.imageId}
                                                fileName={p.imageId}
                                                width={""}
                                                height={200}
                                            />
                                        }
                                        size="small"
                                            styles={{
                                                header:{
                                                    border:"none"
                                                },
                                                body:{
                                                    padding:8
                                                },
                                                actions:{
                                                    padding:0,
                                                    margin:0
                                                },
                                            }}
                                        >
                                            <Space align="end">
                                                <Button icon={<DeleteOutlined/>} type="link" danger size="small"
                                                    onClick={()=>{
                                                        Modal.confirm({
                                                            title:"Delete Record",
                                                            content:"are you sure!",
                                                            onOk:async()=>{
                                                                await ContractServices.deleteAttachmentPosm({id:p.id})(requestActions);
                                                                loadData();
                                                            }
                                                        })
                                                    }}
                                                />
                                            </Space>
                                        </Card>
                                    })
                                }
                            </Space>
                        </Image.PreviewGroup>
                    ) :
                        <Result
                            icon={<></>}
                            title={<Typography.Text type="secondary">No Attachment</Typography.Text>}
                        />
                }
            </Spin>
        </DrawerForm>
    )
}
export default POSMImage 