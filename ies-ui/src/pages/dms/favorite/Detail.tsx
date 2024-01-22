import { Avatar, Card, Drawer, DrawerProps, Space, Flex, Divider, Button } from "antd";
import { DownloadOutlined, UserOutlined } from "@ant-design/icons";
import { convertDuration, formateBytes } from "../core";
import { useEffect, useState } from "react";
import { formatDateTime } from "@/pages/utils";
import { downloadUploadFileV2, getUploadFileObjectUrlV2 } from "@/services/apiGateway";
import { ShareDTO } from "../share/data";


interface Props extends DrawerProps {
    onCancel: () => void;
    data?: ShareDTO
}


const ShareDetailDrawer: React.FC<Props> = ({ onCancel, data, ...props }: Props) => {
    useEffect(() => {
    }, [props.open]);
    const [fileurl, setFileUrl] = useState<string>();


    useEffect(() => {
        getUploadFileObjectUrlV2()(data?.attachment.fileId || "").then(setFileUrl)
    }, [props.open]);



    return (
        <Drawer
            onClose={onCancel}
            {...props}
            width={600}
            title={data?.document.title}
            extra={
                [
                    <Button
                        icon={<DownloadOutlined />}
                        type="link"
                        onClick={() => {
                            downloadUploadFileV2()(data?.attachment.fileId || "", data?.document.title || "");
                        }}
                    />
                ]
            }
        >
            <Flex
                gap={"middle"}
                vertical
            >


                <Card
                >
                    <Divider orientation="left" >Sender</Divider>
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
                                <span><span style={{ color: "lightgray" }}>Updated</span> {formatDateTime(data?.lastModifiedDate)}</span>
                            </Flex>
                        </Space>
                        <span>{formateBytes(data?.attachment.fileSize || 0, 2)}</span>

                    </Flex>
                    <Divider orientation="left" >Meta Data</Divider>
                    <Flex
                        gap={"small"}
                        justify="space-between"
                    >
                        <Flex
                            vertical
                        >
                            <span style={{ color: "lightgray" }}>Sharing Date</span>
                            <span>{formatDateTime(data?.createdDate)}</span>
                        </Flex>
                        <Flex
                            vertical
                        >
                            <span style={{ color: "lightgray" }}>Expiration Date</span>
                            <span>{convertDuration(data?.expirationDate)}</span>
                        </Flex>
                    </Flex>


                </Card>
            </Flex>
            <Card>
                <iframe
                    src={fileurl}
                        style={{
                            width:"100%",
                            height:"600px"
                        }}
                />
            </Card>


        </Drawer>
    )
}

export default ShareDetailDrawer