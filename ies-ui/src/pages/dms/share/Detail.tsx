import { Avatar, Card, Space, Flex, Divider } from "antd";
import { ShareDTO } from "./data";
import { UserOutlined } from "@ant-design/icons";
import { convertDuration, formateBytes } from "../core";
import { useEffect, useState } from "react";
import { formatDate, formatDateTime } from "@/pages/utils";
import { downloadUploadFileV2, getUploadFileObjectUrlV2 } from "@/services/apiGateway";
import { DrawerForm, DrawerFormProps } from "@ant-design/pro-components";


interface Props extends DrawerFormProps {
    onCancel: () => void;
    data?: ShareDTO
}




const ShareDetailDrawer: React.FC<Props> = ({ onCancel, data, ...props }: Props) => {

    const [fileurl, setFileUrl] = useState<string>();

    useEffect(() => {
        setFileUrl(undefined)
       props.open && (data?.attachment?.fileType=="image/png"  || data?.attachment?.fileType=="application/pdf")  && getUploadFileObjectUrlV2()(data?.attachment?.fileId || "").then(setFileUrl)
    }, [props.open]);


    const onDownload = async()=>{
        await downloadUploadFileV2()(data?.attachment?.fileId || "", data?.document?.title || "");
    }


    return (
        <DrawerForm
        
            
            {...props}
            // width={600}
            resize={{
                maxWidth: window.innerWidth * 0.8,
                minWidth: 600,
            }}
            title={data?.document?.title}
            drawerProps={{
                onClose:onCancel
            }}
            submitter={false}
            // extra={
            //     [
            //         <Button
            //             icon={<DownloadOutlined />}
            //             type="link"
            //             onClick={onDownload}
            //         />
            //     ]
            // }
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
                        <span>{formateBytes(data?.attachment?.fileSize || 0, 2)}</span>

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
                            <span>{formatDate(data?.expirationDate)}</span>
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


        </DrawerForm>
    )
}

export default ShareDetailDrawer