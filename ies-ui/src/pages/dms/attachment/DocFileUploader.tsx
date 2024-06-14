
import { useEffect, useState } from "react";
import { simpleRequestActions } from "@/services/model";
import { InboxOutlined } from "@ant-design/icons";
import { getServiceUrl } from "@/services/ApiUrl";
import Dragger from "antd/lib/upload/Dragger";
import { UploadFile } from "antd/es/upload/interface";
import { kc } from '@/auth';


export type UploadType = UploadFile<string> & { title?: string; description?: string };

interface Props {
    required?: boolean;
    accept?: string;
    docTypeId?: number;
    service?: 'WORK_FLOW' | 'FILE';
    multi?: boolean;
    onGetFile?: (uploadFile: UploadFile[]) => void;
    maxCount?: number;
}

const DocFileUploader: React.FC<Props> = ({ required = false, onGetFile, multi, maxCount, accept, docTypeId, service = "FILE" }) => {
    const requestActions = simpleRequestActions();
    const [fileExtension, setFileExtension] = useState<string[]>();
    const token = localStorage.getItem('accessToken');
    const [fileList, setFileList] = useState<UploadType[]>([]);
    const [forceReload, setForceReload] = useState(1);


    useEffect(() => {

    }, [docTypeId]);

    useEffect(() => {
        fileList.every((it) => it.status == 'done') && onGetFile?.(fileList);
    }, [forceReload]);

    const uploadUrl = () => {
        if ((service = 'FILE')) {
            return `${getServiceUrl('FILE')}/upload`;
        } else {
            return `${getServiceUrl('WORK_FLOW')}/uploader/upload`;
        }
    };

    return (<>
        <Dragger
            headers={token ? { Authorization: `Bearer ${token}`, } : {}}
            accept={fileExtension?.toString() || accept}
            action={uploadUrl}
            multiple={multi ? true : false}
            onChange={({ file, fileList }) => {
                setFileList(fileList.map((it) => ({ ...it, url: '#' })));
                if (file.status == 'done') {
                    if (!file.response) {
                        setFileList((v) => v.filter((it) => it.uid != file.uid));
                    } else {
                    }
                }
                setForceReload((v) => v + 1);
            }}
            maxCount={maxCount}
        >
            <p className="ant-upload-drag-icon">
                <InboxOutlined />
            </p>
            <p className="ant-upload-text">Click or drag file to this area to upload</p>
        </Dragger>
        {
            required ? <div className="ant-form-item-explain-error" style={{ color: "#ff4d4f" }}>Please click or drag this field is required</div> : ""
        }
    </>)
}

export default DocFileUploader