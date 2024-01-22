import { getServiceUrl } from "@/services/ApiUrl"
import { DataResponse } from "@/services/shared/data"
import { ImportOutlined } from "@ant-design/icons"
import { Button, Upload, UploadProps, message } from "antd"
import { UploadChangeParam, UploadFile } from "antd/lib/upload"
import { useState } from "react"


//Import file to file service and triger data transfer to DB
//TOD: Consolidate with Upload file button


interface Props<T extends { id: number }> {
  label?: string
  importedKey: string
  onDataResponse?: (data: DataResponse<T>) => void;
  onHandleChange?: (status?: String) => void
}

export default <T extends { id: number }>({ onHandleChange, onDataResponse, importedKey, label }: Props<T>) => {

  const token = localStorage.getItem("accessToken")
  const uploadUrl = () => `${getServiceUrl('FILE')}/import?key=${importedKey}`
  //uploading/done
  const handleChange: UploadProps['onChange'] = async (info: UploadChangeParam<UploadFile>) => {

    onHandleChange?.(info.file.status)

    if (info.file.error) {
      const {
        detail
      } = info.file.response
      message.error(detail)
      return
    }

    if (info.file.response) {
      const rs = info.file.response as DataResponse<T>
      onDataResponse?.(rs)

    }
  };

  return <Upload
    headers={
      token ? {
        'Authorization': `Bearer ${token}`
      } : {}
    }
    onChange={handleChange}
    action={uploadUrl()}
    showUploadList={false}>
    <Button type="link" icon={<ImportOutlined />}>
      {label || 'Import'}
    </Button>
  </Upload>
}