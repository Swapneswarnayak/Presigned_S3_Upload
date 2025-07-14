import React, { useState, useCallback } from "react";
import {
  Upload,
  Button,
  Card,
  Row,
  Col,
  Image,
  message,
  Spin,
  Progress,
  Space,
  Typography,
  Divider,
  Alert,
  Tooltip,
} from "antd";
import {
  UploadOutlined,
  DeleteOutlined,
  EyeOutlined,
  CheckCircleOutlined,
  InfoCircleOutlined,
  LinkOutlined,
  CopyOutlined,
  PlusOutlined,
  FilePdfOutlined,
  FileImageOutlined,
} from "@ant-design/icons";
import axios from "axios";

const { Text, Title } = Typography;
const { Dragger } = Upload;

const S3FileUpload = ({
  url,
  handleRecallGetPresignedUrl,
  onUploadSuccess,
  onUploadError,
  allowedFileTypes = ["image/jpeg", "image/png", "application/pdf"],
  maxFileSize = 10 * 1024 * 1024, // 10MB
  wrapperStyle = {},
  loading
}) => {
  const [fileList, setFileList] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [previewImage, setPreviewImage] = useState("");
  const [previewTitle, setPreviewTitle] = useState("");
  const [previewVisible, setPreviewVisible] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const [uploadedUrl, setUploadedUrl] = useState("");

  const beforeUpload = (file) => {
    const isValidType = allowedFileTypes.includes(file.type);
    if (!isValidType) {
      message.error(`You can only upload ${allowedFileTypes.join(", ")} files`);
      return false;
    }

    const isLtSize = file.size <= maxFileSize;
    if (!isLtSize) {
      message.error(`File must be smaller than ${maxFileSize / 1024 / 1024}MB`);
      return false;
    }

    return true;
  };

  const handleChange = ({ file, fileList }) => {
    if (file.status !== "removed") {
      setFileList(fileList.slice(-1));
    }
  };

  const handleUpload = useCallback(async () => {
    if (fileList.length === 0) {
      message.warning("Please select a file first");
      return;
    }

    const file = fileList[0];

    try {
      setUploading(true);
      setUploadProgress(0);

      const config = {
        onUploadProgress: (progressEvent) => {
          const percentCompleted = Math.round(
            (progressEvent.loaded * 100) / progressEvent.total
          );
          setUploadProgress(percentCompleted);
        },
        headers: {
          "Content-Type": file.type,
        },
      };

      await axios.put(url, file.originFileObj, config);

      message.success(`${file.name} uploaded successfully`);
      setUploadSuccess(true);
      setUploadedUrl(url.split("?")[0]);
      if (onUploadSuccess) onUploadSuccess(url.split("?")[0]);
    } catch (error) {
      console.error("Upload error:", error);
      message.error(`Upload failed: ${error.message}`);
      if (onUploadError) onUploadError(error);
    } finally {
      setUploading(false);
      setUploadProgress(0);
    }
  }, [fileList, url, onUploadSuccess, onUploadError]);

  const handlePreview = async (file) => {
    if (file.type.includes("image")) {
      setPreviewTitle(file.name);
      const reader = new FileReader();
      reader.onload = (e) => {
        setPreviewImage(e.target.result);
        setPreviewVisible(true);
      };
      reader.readAsDataURL(file.originFileObj);
    } else if (file.type === "application/pdf") {
      // Open PDF in new tab
      const pdfUrl = URL.createObjectURL(file.originFileObj);
      window.open(pdfUrl, "_blank");
    } else {
      message.info("Preview available only for images and PDFs");
    }
  };

  const handleRemove = () => {
    setFileList([]);
    setUploadProgress(0);
    setUploadSuccess(false);
    setUploadedUrl("");
    handleRecallGetPresignedUrl();
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    message.success("URL copied to clipboard!");
  };

  const addNewFile = () => {
    setUploadSuccess(false);
    setUploadedUrl("");
    setFileList([]);
    handleRecallGetPresignedUrl();
  };

  const renderFilePreview = (file) => {
    if (!file) return null;

    if (file.type.includes("image")) {
      return (
        <Image
          src={URL.createObjectURL(file.originFileObj)}
          alt="Preview"
          style={{
            width: "100%",
            maxHeight: "350px",
            borderRadius: "8px",
            objectFit: "contain",
          }}
          preview={{
            visible: previewVisible,
            src: URL.createObjectURL(file.originFileObj),
            title: previewTitle,
            onVisibleChange: (visible) => setPreviewVisible(visible),
          }}
        />
      );
    }

    if (file.type === "application/pdf") {
      return (
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            height: "350px",
            border: "1px dashed #d9d9d9",
            borderRadius: "8px",
            backgroundColor: "#fafafa",
          }}
        >
          <FilePdfOutlined style={{ fontSize: "64px", color: "#ff4d4f" }} />
          <Text strong style={{ marginTop: "16px" }}>
            {file.name}
          </Text>
          <Text type="secondary">PDF Document</Text>
          <Button
            type="primary"
            onClick={() => handlePreview(file)}
            style={{ marginTop: "16px" }}
            icon={<EyeOutlined />}
          >
            View PDF
          </Button>
        </div>
      );
    }

    return (
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          height: "350px",
          border: "1px dashed #d9d9d9",
          borderRadius: "8px",
          backgroundColor: "#fafafa",
        }}
      >
        <FileImageOutlined style={{ fontSize: "64px", color: "#1890ff" }} />
        <Text strong style={{ marginTop: "16px" }}>
          {file.name}
        </Text>
        <Text type="secondary">File preview not available</Text>
      </div>
    );
  };

  const renderUploadedPreview = () => {
    if (!uploadedUrl) return null;

    if (uploadedUrl.toLowerCase().endsWith(".pdf")) {
      return (
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            height: "350px",
            border: "1px dashed #d9d9d9",
            borderRadius: "8px",
            backgroundColor: "#fafafa",
          }}
        >
          <FilePdfOutlined style={{ fontSize: "64px", color: "#ff4d4f" }} />
          <Text strong style={{ marginTop: "16px" }}>
            PDF Document
          </Text>
          <Button
            type="primary"
            onClick={() => window.open(uploadedUrl, "_blank")}
            style={{ marginTop: "16px" }}
            icon={<EyeOutlined />}
          >
            View PDF
          </Button>
        </div>
      );
    }

    if (
      uploadedUrl.toLowerCase().endsWith(".jpg") ||
      uploadedUrl.toLowerCase().endsWith(".jpeg") ||
      uploadedUrl.toLowerCase().endsWith(".png")
    ) {
      return (
        <div style={{ textAlign: "center" }}>
          <Image
            src={uploadedUrl}
            alt="Uploaded Preview"
            style={{
              width: "100%",
              maxHeight: "350px",
              borderRadius: "8px",
              objectFit: "contain",
            }}
            preview={{
              visible: previewVisible,
              src: uploadedUrl,
              title: "Uploaded File Preview",
              onVisibleChange: (visible) => setPreviewVisible(visible),
            }}
          />
          <div style={{ marginTop: "12px" }}>
            <Text type="secondary">Uploaded File Preview</Text>
          </div>
        </div>
      );
    }

    return (
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          height: "350px",
          border: "1px dashed #d9d9d9",
          borderRadius: "8px",
          backgroundColor: "#fafafa",
        }}
      >
        <FileImageOutlined style={{ fontSize: "64px", color: "#1890ff" }} />
        <Text strong style={{ marginTop: "16px" }}>
          Uploaded File
        </Text>
        <Text type="secondary">Preview not available</Text>
        <Button
          type="primary"
          onClick={() => window.open(uploadedUrl, "_blank")}
          style={{ marginTop: "16px" }}
          icon={<LinkOutlined />}
        >
          Open File
        </Button>
      </div>
    );
  };

  return (
    <div
      style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        minHeight: "100vh",
        padding: "24px",
        backgroundColor: "#f5f7fa",
      }}
    >
      <Card
        title={
          <Space>
            <Title level={4} style={{ margin: 0 }}>
              Presigned File Upload
            </Title>
          </Space>
        }
        style={{
          width: "100%",
          maxWidth: "1000px",
          boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)",
          borderRadius: "8px",
          ...wrapperStyle,
        }}
        headStyle={{
          borderBottom: "1px solid #f0f0f0",
          padding: "16px 24px",
        }}
        bodyStyle={{
          padding: "24px",
        }}
      >
        {uploadSuccess ? (
          <>
            <Alert
              message="File Uploaded Successfully!"
              type="success"
              showIcon
              style={{ marginBottom: 24 }}
            />

            <Row gutter={[32, 32]}>
              <Col xs={24} md={12}>
                <Card
                  style={{
                    border: "1px solid #f0f0f0",
                    borderRadius: "8px",
                  }}
                  bodyStyle={{ padding: "16px" }}

                >
                  <Space direction="vertical" style={{ width: "100%" }}>
                    <Row justify="space-between" align="middle">
                      <Col flex="auto">
                        <Text strong style={{ display: "block" }}>
                          Upload Complete
                        </Text>
                        <Text
                          type="secondary"
                          style={{ display: "block", marginTop: 4 }}
                        >
                          Your file is now available at:
                        </Text>
                      </Col>
                      <Col>
                        <Tooltip title="Remove">
                          <Button
                            icon={<DeleteOutlined />}
                            onClick={handleRemove}
                            size="middle"
                            danger
                          />
                        </Tooltip>
                      </Col>
                    </Row>

                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        backgroundColor: "#f8f9fa",
                        padding: "12px",
                        borderRadius: "4px",
                        borderLeft: "3px solid #52c41a",
                        marginTop: 12,
                      }}
                    >
                      <a
                        href={uploadedUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{
                          flex: 1,
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          whiteSpace: "nowrap",
                          marginRight: "12px",
                        }}
                      >
                        {uploadedUrl}
                      </a>
                      <Tooltip title="Copy URL">
                        <Button
                          icon={<CopyOutlined />}
                          onClick={() => copyToClipboard(uploadedUrl)}
                          type="text"
                        />
                      </Tooltip>
                    </div>

                    <Button
                      type="primary"
                      onClick={addNewFile}
                      block
                      icon={<PlusOutlined />}
                      size="large"
                      style={{
                        height: "48px",
                        marginTop: "24px",
                      }}
                    >
                      Add New File
                    </Button>
                  </Space>
                </Card>
              </Col>

              <Col xs={24} md={12}>
                {renderUploadedPreview()}
              </Col>
            </Row>
          </>
        ) : (
          <>
            {/* Instructions Section */}
            <div style={{ marginBottom: 24 }}>
              <Text strong style={{ display: "block", marginBottom: 8 }}>
                <InfoCircleOutlined style={{ marginRight: 8 }} />
                Upload Instructions
              </Text>
              <div
                style={{
                  backgroundColor: "#f8f9fa",
                  padding: "16px",
                  borderRadius: "4px",
                  borderLeft: "3px solid #1890ff",
                }}
              >
                <Space
                  direction="vertical"
                  size="small"
                  style={{ width: "100%" }}
                >
                  <Text>1. Drag and drop your file or click to browse</Text>
                  <Text>2. Supported formats: JPG, PNG, PDF (Max 10MB)</Text>
                  <Text>3. Click 'Upload to S3' to start the process</Text>
                  <Text>
                    4. Your file will be available at url which is a link you
                    can share
                  </Text>
                </Space>
              </div>
            </div>

            <Row gutter={[32, 32]}>
              <Col xs={24} md={12}>
                <Space direction="vertical" style={{ width: "100%" }}>
                  {/* Drag and Drop Area */}
                  <Dragger
                    fileList={fileList}
                    beforeUpload={beforeUpload}
                    onChange={handleChange}
                    onRemove={handleRemove}
                    showUploadList={false}
                    accept={allowedFileTypes.join(",")}
                    maxCount={1}
                    disabled={uploading}
                    style={{
                      padding: "40px 16px",
                      border: "2px dashed #d9d9d9",
                      borderRadius: "8px",
                      backgroundColor: "#fafafa",
                      marginBottom: "16px",
                    }}
                  >
                    <p className="ant-upload-drag-icon">
                      <UploadOutlined
                        style={{ fontSize: "32px", color: "#1890ff" }}
                      />
                    </p>
                    <p className="ant-upload-text" style={{ marginBottom: 4 }}>
                      Click or drag file to this area
                    </p>
                    <p className="ant-upload-hint" style={{ fontSize: "12px" }}>
                      Supported formats:{" "}
                      {allowedFileTypes.map((t) => t.split("/")[1]).join(", ")}{" "}
                      (Max {maxFileSize / 1024 / 1024}MB)
                    </p>
                  </Dragger>

                  {fileList.length > 0 && (
                    <Card
                      style={{
                        marginTop: "0px",
                        border: "1px solid #f0f0f0",
                        borderRadius: "8px",
                      }}
                      bodyStyle={{ padding: "16px" }}
                    >
                      <Space direction="vertical" style={{ width: "100%" }}>
                        <Row justify="space-between" align="middle">
                          <Col flex="auto">
                            <Text
                              strong
                              ellipsis
                              style={{ maxWidth: "200px", display: "block" }}
                            >
                              {fileList[0].name}
                            </Text>
                          </Col>
                          <Col>
                            <Space>
                              <Tooltip title="Preview">
                                <Button
                                  icon={<EyeOutlined />}
                                  onClick={() => handlePreview(fileList[0])}
                                  size="middle"
                                />
                              </Tooltip>
                              <Tooltip title="Remove">
                                <Button
                                  icon={<DeleteOutlined />}
                                  onClick={handleRemove}
                                  size="middle"
                                  danger
                                />
                              </Tooltip>
                            </Space>
                          </Col>
                        </Row>

                        <Row>
                          <Col span={24}>
                            <Text type="secondary">
                              Size: {(fileList[0].size / 1024).toFixed(2)} KB
                            </Text>
                          </Col>
                        </Row>

                        {uploading && (
                          <Row>
                            <Col span={24}>
                              <Progress
                                percent={uploadProgress}
                                status={
                                  uploadProgress === 100 ? "success" : "active"
                                }
                                strokeColor={
                                  uploadProgress === 100 ? "#52c41a" : "#1890ff"
                                }
                              />
                            </Col>
                          </Row>
                        )}

                        {!uploading && (
                          <Row>
                            <Col span={24}>
                              <Button
                                type="primary"
                                onClick={handleUpload}
                                block
                                icon={<UploadOutlined />}
                                loading={uploading}
                                size="large"
                                style={{
                                  height: "48px",
                                  marginTop: "12px",
                                }}
                              >
                                {uploadProgress === 100 ? (
                                  <span>
                                    <CheckCircleOutlined /> Upload Complete
                                  </span>
                                ) : (
                                  "Upload"
                                )}
                              </Button>
                            </Col>
                          </Row>
                        )}
                      </Space>
                    </Card>
                  )}
                </Space>
              </Col>

              <Col xs={24} md={12}>
                {fileList.length > 0 ? (
                  renderFilePreview(fileList[0])
                ) : (
                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      justifyContent: "center",
                      alignItems: "center",
                      height: "100%",
                      minHeight: "300px",
                      border: "2px dashed #f0f0f0",
                      borderRadius: "8px",
                      backgroundColor: "#fafafa",
                    }}
                  >
                    {uploading ? (
                      <Space direction="vertical" align="center">
                        <Spin size="large" />
                        <Text strong>Uploading your file...</Text>
                        <Text type="secondary">
                          {uploadProgress}% completed
                        </Text>
                      </Space>
                    ) : (
                      <Space direction="vertical" align="center">
                        <UploadOutlined
                          style={{ fontSize: "48px", color: "#1890ff" }}
                        />
                        <Text strong>File preview will appear here</Text>
                        <Text type="secondary">
                          Supported formats: JPG, PNG, PDF
                        </Text>
                      </Space>
                    )}
                  </div>
                )}
              </Col>
            </Row>
          </>
        )}

        <Divider style={{ margin: "24px 0" }} />

        {/* Presigned URL Section */}
        <div>
          <Text strong style={{ display: "block", marginBottom: 12 }}>
            <LinkOutlined style={{ marginRight: 8 }} />
            Presigned URL
          </Text>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              backgroundColor: "#f8f9fa",
              padding: "12px",
              borderRadius: "4px",
              borderLeft: "3px solid #1890ff",
            }}
          >
            <a
              href={url.split("?")[0]}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                flex: 1,
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
                marginRight: "12px",
              }}
            >
              {loading ? "Loading...." : url.split("?")[0] || "Server down Please try again Later"}
            </a>
            <Tooltip title="Copy URL">
              <Button
                icon={<CopyOutlined />}
                onClick={() => copyToClipboard(url.split("?")[0])}
                type="text"
              />
            </Tooltip>
          </div>
          <Text type="secondary" style={{ display: "block", marginTop: 8 }}>
            The files can be deleted manually at any time and will in any case
            be deleted automatically 6 days from now
          </Text>
          <Divider style={{ margin: "24px 0 12px" }} />
          <div style={{ textAlign: "center", padding: "8px 0" }}>
            <a
              href="https://swapneswarnayak.in"
              target="_blank"
              rel="noopener noreferrer"
              style={{
                color: "inherit",
                display: "inline-flex",
                alignItems: "center",
                gap: "4px"
              }}
            >
              <LinkOutlined />
              <span>Check Out My Portfolio ❤️ SWAPNESWAR NAYAK</span>
            </a>
          </div>

        </div>
      </Card>
    </div>
  );
};

export default S3FileUpload;
