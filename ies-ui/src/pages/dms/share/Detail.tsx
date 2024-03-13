import { Avatar, Card, Space, Flex } from "antd";
import { ShareDTO } from "./data";
import { UserOutlined } from "@ant-design/icons";
import { convertDuration } from "../core";
import { useEffect, useState } from "react";
import { formatDate, formatDateTime } from "@/pages/utils";
import { DrawerForm, DrawerFormProps } from "@ant-design/pro-components";

interface Props extends DrawerFormProps {
    onCancel: () => void;
    data?: ShareDTO
}

const ShareDetailDrawer: React.FC<Props> = ({ onCancel, data, ...props }: Props) => {
    const [fileurl, setFileUrl] = useState<string>();
    useEffect(() => {
        setFileUrl(undefined)
        //    props.open && (data?.attachment?.fileType=="image/png"  || data?.attachment?.fileType=="application/pdf")  && getUploadFileObjectUrlV2()(data?.attachment?.fileId || "").then(setFileUrl)
        //    props.open && getUploadFileObjectUrlV2()(data?.attachment?.fileId || "").then(setFileUrl)
    }, [props.open]);
    return (
        <DrawerForm
            {...props}
            resize={{
                maxWidth: window.innerWidth * 0.8,
                minWidth: 600,
            }}
            title={`#${data?.document?.documentation?.docName}`}
            drawerProps={{
                onClose: onCancel,
                
                className:"ant-pro-layout-content"
            }}
            submitter={false}
        >
            <Flex
                gap={"middle"}
                vertical
            >
                <Card
                    size="small"
                >
                    <Flex
                        gap={"middle"}
                        justify="space-between"
                    >
                        <Space>
                            <Avatar icon={<UserOutlined />} />
                            <Flex
                                vertical
                            >
                                <h3>{data?.createdBy}</h3>
                                <span><span style={{ color: "gray" }}>Updated:</span> {formatDateTime(data?.lastModifiedDate)}</span>
                            </Flex>
                        </Space>

                    </Flex>
                </Card>
                <Card
                    title="Meta Data"
                    size="small"
                >
                    <Flex
                        gap={"small"}
                        justify="space-between"
                    >
                        <Flex
                            vertical
                        >
                            <span style={{ color: "gray" }}>Sharing Date</span>
                            <span>{formatDateTime(data?.createdDate)}</span>
                        </Flex>
                        <Flex
                            vertical
                        >
                            <span style={{ color: "gray" }}>Expiration Date</span>
                            <span>{formatDate(data?.expirationDate)}</span>
                            <span>{convertDuration(data?.expirationDate)}</span>
                        </Flex>
                    </Flex>
                    <span>{data?.description}</span>
                </Card>
                <Card
                    size="small"
                >
                    <iframe
                        src={fileurl}
                        style={{
                            width: "100%",
                            height: "600px"
                        }}
                    />
                </Card>
            </Flex>
        </DrawerForm>
    )
}

export default ShareDetailDrawer