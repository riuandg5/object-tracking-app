import { useRef } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faFileArrowUp } from "@fortawesome/free-solid-svg-icons";

import "./FileDropZone.css";

// FileDropZone component for handling file uploads
export default function FileDropZone({ setVideoFile, addErrorMessage }) {
    // Reference to the file input element
    const fileInputRef = useRef();

    // Function to handle file uploads
    function handleFiles(files) {
        // Check if more than one file is uploaded
        if (files.length > 1) {
            addErrorMessage("[Error] please upload a single file!");
        }
        // Check if the uploaded file is not an MP4 file
        else if (files[0].type !== "video/mp4") {
            addErrorMessage("[Error] only MP4 files are supported!");
        }
        // If no errors, set the video file
        else {
            setVideoFile(files[0]);
        }
    }

    return (
        <>
            <h1 className="head-info">Add a video file to proceed with</h1>

            <div
                className="file-drop-zone"
                // Prevent default behavior when a file is dragged over the drop zone
                onDragEnter={(e) => {
                    e.preventDefault();
                }}
                // Prevent default behavior when a file is dragged over the drop zone
                onDragOver={(e) => {
                    e.preventDefault();
                }}
                // Handle file drop
                onDrop={(e) => {
                    e.preventDefault();
                    handleFiles(e.dataTransfer.files);
                }}
            >
                <input
                    ref={fileInputRef}
                    type="file"
                    // Handle file selection
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
                        // Trigger file input click when the button is clicked
                        onClick={() => fileInputRef.current.click()}
                    >
                        click here to select
                    </button>
                </p>
            </div>
        </>
    );
}
