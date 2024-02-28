import { useRef } from "react";

import "./FileDropZone.css";

export default function FileDropZone({ setVideoFile }) {
    const fileInputRef = useRef();

    function handleFiles(files) {
        if (files.length > 1) {
            console.log("[Error] please upload a single file!");
        } else if (files[0].type !== "video/mp4") {
            console.log("[Error] only MP4 files are supported!");
        } else {
            setVideoFile(files[0]);
        }
    }

    return (
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
            <p>
                Drag and drop your video file here, or <br />
                <button
                    type="button"
                    onClick={() => fileInputRef.current.click()}
                >
                    click here to select
                </button>
            </p>
        </div>
    );
}
