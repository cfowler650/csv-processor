import React, { useState } from "react";
import "./home.css";
import icon from "../images/google-docs.svg";
import cloudImage from "../images/cloudimage.png";
import { useToasts } from "react-toast-notifications";

const Header = () => {
  return (
    <div className="header">
      <h1>Import CSV</h1>
    </div>
  );
};

const FileImporter = ({ _handleSelectFile, selectedFile }) => {
  return (
    <div>
      {/*TODO: change styles here so button doesnt jump */}
      <div className="fileImporter">
        <div className="instructions">
          Select file or drag and drop to upload a CSV file. You can import one
          csv file at a time.
        </div>
        {selectedFile && (
          <div className="selectedFile">
            <img className="selectedFileIcon" src={icon} />
            <div className="selected">{selectedFile}</div>
          </div>
        )}
      </div>
      <button className="btn" onClick={_handleSelectFile}>
        Select File
      </button>
    </div>
  );
};

const FileUploader = () => {
  return (
    <div className="fileUploader">
      <div className="cloudImgContainer">
        <img src={cloudImage} width="100%" />
      </div>
    </div>
  );
};

const Home = () => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [selectedFilePath, setSelectedFilePath] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const { addToast } = useToasts();

  const handleSelectFile = async (e) => {
    e.preventDefault();

    const response = await electron.fileApi.uploadFile();
    const { filePaths } = response;
    const [path] = filePaths;
    setSelectedFilePath(path);

    const pathArray = path?.split("/");
    const fileName = pathArray[pathArray.length - 1];
    if (response !== undefined) {
      setSelectedFile(fileName);
    }
  };

  const handleSaveFile = async (e) => {
    e.preventDefault();

    const res = await electron.fileApi.saveFile(selectedFilePath, setIsLoading);

    const { error } = res;

    if (error) {
      addToast(error, { appearance: "error" });
    } else {
      addToast("Saved Successfully", { appearance: "success" });
    }
  };

  return (
    <>
      <Header />
      <div className="grid">
        <FileImporter
          _handleSelectFile={handleSelectFile}
          selectedFile={selectedFile}
        />
        <FileUploader />
        <div className="footerButtonWrapper">
          <button
            //   disabled={!selectedFile}
            onClick={handleSaveFile}
            className={`btn ${isLoading && "button is-loading"}`}
          >
            Run
          </button>
        </div>
      </div>
    </>
  );
};

export default Home;
