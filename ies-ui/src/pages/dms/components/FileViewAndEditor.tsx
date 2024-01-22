
import { Viewer, Worker } from "@react-pdf-viewer/core";
import { defaultLayoutPlugin } from "@react-pdf-viewer/default-layout";
import { useState } from "react"
import "@react-pdf-viewer/core/lib/styles/index.css";
import "@react-pdf-viewer/default-layout/lib/styles/index.css"

const PDFViewer = ()  =>{

    const [pdfFile, setpdfFile] = useState(null);
    const [viewPDF, setViewPDF] = useState(null);

    const fileType=["application/pdf","application/vnd.openxmlformats-officedocument.wordprocessingml.document"] ;
    const handlerChange = (e:any)=>{
        
        
        let selectedFile = e.target.files[0];
        
        if(selectedFile){
            if(selectedFile && fileType.includes(selectedFile.type)){
                let render = new FileReader();
                render.readAsDataURL(selectedFile);
                render.onload = (e) =>{
                    // setpdfFile(e.target?.result);
                }
            }
            else {
                setpdfFile(null);
            }
        }
        else{
            console.log("please select");
            
        }
    }

    // const handlerSubmit = (e) =>{
    //     console.log(e);
        
    //     e.preventDefault();
    //     if(pdfFile !== null){
    //         setViewPDF(pdfFile);

    //     }
    //     else{
    //         setViewPDF(null);
    //     }
    // }
    const newPlugin = defaultLayoutPlugin()
    return (
        <div>
            {/* <form> */}
                <input type="file" onChange={handlerChange} />
                {/* <button type="submit" onClick={handlerSubmit}>View PDF</button> */}
            {/* </form> */}

            <h2>PDF Viewer</h2>
                <div
                    style={{
                        height:500
                    }}
                >
                    <Worker workerUrl="https://unpkg.com/pdfjs-dist@2.4.456/build/pdf.worker.min.js"
                    
                    >
                        {viewPDF && <>
                        <Viewer
                            
                            fileUrl={viewPDF}
                            plugins={[newPlugin]}
                        /></>}
                        {!viewPDF && <>No Data</>}
                    </Worker>
                </div>
        </div>
    )
}

export default PDFViewer