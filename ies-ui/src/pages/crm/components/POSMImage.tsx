import { Drawer, DrawerProps, Image } from "antd";
import React, {  } from "react";
import { ContractPOSMItem } from "../contract/types";
import ImageViewer from "./ImageViewer";


interface Props extends DrawerProps {
    pomsInfo?: ContractPOSMItem,
    imageId?: string[];
    version?: number
}

const POSMImage: React.FC<Props> = ({ imageId, version, pomsInfo, ...props }) => {
    return (
        <Drawer
            {...props}
            width={700}
            title={"Posm"}
        >
            <Image.PreviewGroup>
                {
                    pomsInfo?.attachment?.map(p => {
                        return <ImageViewer
                            fileId={p}
                            fileName={p}
                        />
                    })
                }
            </Image.PreviewGroup>
        </Drawer>
    )
}

export default POSMImage