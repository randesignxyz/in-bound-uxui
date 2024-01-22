import React, { useEffect, useState } from "react";
import { Attachment } from "../documentation/data";
import { getUploadFileObjectUrlV2 } from "@/services/apiGateway";
import { request } from "@umijs/max";
import { getServiceUrl } from "@/services/ApiUrl";
import { Image } from "antd";
import DocViewer, { DocViewerRenderers } from "react-doc-viewer";

interface Props {
  attachment?: Attachment
}

const DocViewerControlOverDisplayedDocument: React.FC<Props> = ({ attachment }) => {
  const [fileurl, setFileUrl] = useState<string>();

  useEffect(() => {
    const blob = request<Blob>(`${getServiceUrl('FILE')}/file/${attachment?.fileId}`, {
      responseType: 'blob',
    }).then(i=>{
      let render = new FileReader();
      render.readAsDataURL(i);
      // setFileUrl(render);
      render.onload = ()=>{
        setFileUrl(render.result as string);
      }
      
    }
    );
    // console.log(fileurl?.arrayBuffer());

    
    
  }, [attachment]);
  return (
    <>
      <h3>{attachment?.fileName}</h3>
      <>
      <DocViewer
        style={{height:300}}
        documents={[
          {
            uri:fileurl ||"",
            fileType:attachment?.fileType,
          }
        ]}
        pluginRenderers={DocViewerRenderers}
      />
       
    
      </>
    </>
  )
}

export default DocViewerControlOverDisplayedDocument