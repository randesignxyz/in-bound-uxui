import mammoth from 'mammoth';
import React, { useState, useEffect } from 'react';


interface Props{
    base64?:string;
}

const ViewBase64WordDocument = ({base64}:Props) => {
  const [content, setContent] = useState('');

  useEffect(() => {
    // Assuming you have a Base64 string representing a Word document
    const base64Data = base64;
    if(base64Data){
        const decodeBase64 = async () => {
            const arrayBuffer = Uint8Array.from(atob(base64Data), (c) => c.charCodeAt(0)).buffer;
            const result = await mammoth.extractRawText({ arrayBuffer });
            setContent(result.value);
          };
      
          
          decodeBase64();
    }

    
  }, [base64]);

  console.log(base64);
  
  return (
    <div>
      <p>{content}</p>
    </div>
  );
};

export default ViewBase64WordDocument;
