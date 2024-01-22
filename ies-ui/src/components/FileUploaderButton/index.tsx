//TOD: to replace ImportFileButton

import { getServiceUrl } from "@/services/ApiUrl";
import { CloudUploadOutlined, ImportOutlined } from "@ant-design/icons";
import { Button, Upload, UploadFile, UploadProps } from "antd";
import { UploadChangeParam } from "antd/lib/upload";
import { useState } from "react";

export default ({icon, label, onChangeHandler, config }: ({
    label?: string
    icon?: React.ReactNode
    onChangeHandler?: (file: UploadFile) => void
    config: {
        type: 'ImportData'
        importedKey: string
    } | {
        type: 'UploadFile'
        service: "FileService" | 'WorkflowService'
    }
})) => {
    const [loading, setLoading] = useState(false)
    const token = localStorage.getItem("accessToken")
    const getUrl = () => {
        if (config.type == 'ImportData') {
            return  `${getServiceUrl('FILE')}/import?key=${config.importedKey}`
        } else {
            if(config.service == 'WorkflowService') {
                return `${getServiceUrl('WORK_FLOW')}/uploader/upload`
            }
            return `${getServiceUrl('FILE')}/upload`
        }
    }
    //uploading/done
    const handleChange: UploadProps['onChange'] = async (info: UploadChangeParam<UploadFile>) => {
        
        try {
            onChangeHandler?.(info.file)    
        }finally {
            setLoading(false)
        }
      
        setLoading(info.file.status == 'uploading')
       
        
    };

    return <Upload
    headers={
      token ? {
        'Authorization': `Bearer ${token}`
      } : {}
    }
    onChange = {handleChange}
    action={getUrl()}
    showUploadList={false}>
    <Button loading = {loading} type="link" icon={icon || <CloudUploadOutlined />}>
      {label}
    </Button>
  </Upload>


}