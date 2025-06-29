import React from "react";
import S3FileUpload from "../src/Page/S3FileUpload";
import { useEffect } from "react";
import axios from "axios";
import { useState } from "react";

const App = () => {
  const [url, setUrl] = useState("");
  useEffect(() => {
    getPresignedUrlS3();
  }, []);

  const getPresignedUrlS3 = async () => {
    try {
      const res = await axios.get("http://localhost:8000/url");
      setUrl(res?.data?.url);
    } catch (error) {
      console.log("error on getting presignedUrl : ", error);
    }
  };
  const handleRecallGetPresignedUrl = () => {
    getPresignedUrlS3();
  };
  return (
    <div>
      <S3FileUpload
        url={url}
        handleRecallGetPresignedUrl={handleRecallGetPresignedUrl}
        allowedFileTypes={["image/jpeg", "image/png", "application/pdf"]}
        maxFileSize={10 * 1024 * 1024} // 10MB
        wrapperStyle={{ marginTop: 24 }}
      />
    </div>
  );
};

export default App;
