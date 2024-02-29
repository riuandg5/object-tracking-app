import { useRef } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faFileArrowUp } from "@fortawesome/free-solid-svg-icons";

import "./FileDropZone.css";

export default function FileDropZone({ setVideoFile, addErrorMessage }) {
    const fileInputRef = useRef();

    function handleFiles(files) {
        if (files.length > 1) {
            addErrorMessage("[Error] please upload a single file!");
        } else if (files[0].type !== "video/mp4") {
            addErrorMessage("[Error] only MP4 files are supported!");
        } else {
            setVideoFile(files[0]);
        }
    }

    return (
        <>
            <h1 className="head-info">Add a video file to proceed with</h1>

            <div
                className="file-drop-zone"
                onDragEnter={(e) => {
                    e.preventDefault();
                }}
                onDragOver={(e) => {
                    e.preventDefault();
                }}
                onDrop={(e) => {
                    e.preventDefault();
                    handleFiles(e.dataTransfer.files);
                }}
            >
                <input
                    ref={fileInputRef}
                    type="file"
                    onChange={(e) => {
                        e.preventDefault();
                        handleFiles(e.target.files);
                    }}
                />
                <FontAwesomeIcon
                    icon={faFileArrowUp}
                    size="5x"
                    style={{ color: "#74C0FC" }}
                />
                <p>
                    Drag and drop your video file here, or <br />
                    <button
                        type="button"
                        style={{
                            backgroundColor: "#74c0fc",
                        }}
                        onClick={() => fileInputRef.current.click()}
                    >
                        click here to select
                    </button>
                </p>
            </div>
        </>
    );
}
