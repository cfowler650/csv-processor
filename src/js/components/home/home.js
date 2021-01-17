import React, { useState } from "react";

import "./home.css";
import icon from "../images/google-docs.svg";
import cloudImage from "../images/cloudimage.png";

const Header = () => {
  return (
    <div className="header">
      <h1>Import CSV</h1>
    </div>
  );
};

const getFilePath = async () => {
  console.log("fired");
  const res = await electron.fileApi.uploadFile();
  return res;
};

const FileImporter = ({ _handleSelectFile, selectedFile }) => {
  return (
    <div className="selectFileContainer">
      {selectedFile && (
        <div>
          <img src={icon} />
          {selectedFile}
        </div>
      )}
      <button onClick={_handleSelectFile} className="btn importBtn">
        Select File
      </button>
    </div>
  );
};

const FileUploader = () => {
  return (
    <div className="fileUploaderWrapper">
      <div className="dragDropSection">
        <div className="imgWrapper">
          <img src={cloudImage} width="100%" />
        </div>
      </div>
    </div>
  );
};

const Home = () => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [selectedFilePath, setSelectedFilePath] = useState(null);
  const handleSelectFile = async (e) => {
    e.preventDefault();
    const response = await getFilePath();
    const { filePaths } = response;
    const [firstPath] = filePaths;
    setSelectedFilePath(firstPath);
    const pathArray = firstPath?.split("/");
    const fileName = pathArray[pathArray.length - 1];

    if (response !== undefined) {
      setSelectedFile(fileName);
    }
  };

  const handleSaveFile = async (e) => {
    e.preventDefault();
    const res = await electron.fileApi.saveFile(selectedFilePath);
  };

  return (
    <>
      <Header />
      <div className="homeContainer">
        <div className="topDescription">
          Select file or drag and drop to upload a CSV file. You can import one
          csv file at a time.
        </div>
        <FileImporter
          _handleSelectFile={handleSelectFile}
          selectedFile={selectedFile}
        />
        <FileUploader />
        <button
          //   disabled={!selectedFile}
          onClick={handleSaveFile}
          className="btn runBtn"
        >
          Run
        </button>
      </div>
    </>
  );
};

export default Home;
