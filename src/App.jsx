import { useState } from "react";

import FileDropZone from "./FileDropZone/FileDropZone";
import ObjectTracker from "./ObjectTracker/ObjectTracker";

import "./App.css";

function App() {
    const [videoFile, setVideoFile] = useState(null);

    return (
        <>
            {!videoFile ? (
                <FileDropZone setVideoFile={setVideoFile} />
            ) : (
                <ObjectTracker videoFile={videoFile} />
            )}
        </>
    );
}

export default App;
