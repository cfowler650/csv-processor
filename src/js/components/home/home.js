import React, { useEffect, useState } from "react";
import "./home.css";
import icon from "../images/google-docs.svg";
import cloudImage from "../images/cloudimage.svg";
import logo from "../images/logo.png";
import { useToasts } from "react-toast-notifications";

const Header = () => {
  return (
    <div className="header">
      <div className="header-img">
        <img src={logo} width="100%" />
      </div>
    </div>
  );
};

const FileImporter = ({ selectedFile }) => {
  return (
    <div>
      {/*TODO: change styles here so button doesnt jump */}
      <div className="fileImporter">
        {/* <div className="instructions">
          Select file or drag and drop to upload a CSV file. You can import one
          csv file at a time.
        </div> */}
        {selectedFile && (
          <div className="selectedFile">
            <img className="selectedFileIcon" src={icon} />
            <div className="selected">{selectedFile}</div>
          </div>
        )}
      </div>
    </div>
  );
};

const FileUploader = ({ _handleSelectFile }) => {
  const [dragOver, setDragOver] = useState(null);
  useEffect(() => {
    const el = document.querySelector(".fileUploader");
    el.ondragover = () => {
      setDragOver(true);
      return false;
    };
    el.ondragleave = () => {
      setDragOver(false);
      return false;
    };
    el.ondragend = () => {
      return false;
    };
    // el.ondrop = () => {
    //   // e.preventDefault();
    //   setDragOver(false);
    //   console.log("draggeeddrop");

    //   let dragAndDropPath = "";
    //   for (let f of e.dataTransfer.files) {
    //     dragAndDropPath = f.path;
    //   }

    //   _handleSelectFile(dragAndDropPath);

    //   // return false;
    // };

    el.ondrop = (e) => {
      e?.preventDefault();
      setDragOver(false);
      let dragAndDropPath = e?.dataTransfer?.files[0]?.path;
      _handleSelectFile(dragAndDropPath);
      return false;
    };
  }, []);
  console.log(dragOver);
  return (
    <>
      <div className="fileUploader">
        <div
          className={`fileUploaderContainer ${dragOver && "fileUploaderDrag"}`}
        >
          <div className="cloud">
            <div className="cloudImgContainer">
              <img className="cloudImg" src={cloudImage} width="100%" />
            </div>
          </div>

          <div className="dragDropText">
            <span>Drag & Drop files here</span>
          </div>

          <div className="orText">
            <span>or</span>
          </div>

          <div className="buttonContainer">
            <button className="btn" onClick={_handleSelectFile}>
              Select File
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

const Home = () => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [selectedFilePath, setSelectedFilePath] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const { addToast } = useToasts();

  const handleSelectFile = async (dragAndDropPath) => {
    if (typeof dragAndDropPath === typeof "string") {
      setSelectedFilePath(dragAndDropPath);
      console.log(dragAndDropPath, "draganddropat");
      const pathArray = dragAndDropPath?.split("/");
      const fileName = pathArray[pathArray.length - 1];
      if (fileName) {
        setSelectedFile(fileName);
      }
    }

    if (typeof dragAndDropPath !== typeof "string") {
      const response = await electron.fileApi.uploadFile();
      const { filePaths } = response;
      const [path] = filePaths;
      setSelectedFilePath(path);
      const pathArray = path?.split("/");
      const fileName = pathArray[pathArray.length - 1];
      if (response !== undefined) {
        setSelectedFile(fileName);
      }
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
        <FileImporter selectedFile={selectedFile} />
        <FileUploader _handleSelectFile={handleSelectFile} />
        <div className="footerButtonWrapper">
          <button
            disabled={!selectedFile}
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
