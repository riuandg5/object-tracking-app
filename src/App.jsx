import { useState } from "react";

import FileDropZone from "./FileDropZone/FileDropZone";
import ObjectTracker from "./ObjectTracker/ObjectTracker";

import "./App.css";

function App() {
    const [videoFile, setVideoFile] = useState(null);
    const [errorMessages, setErrorMessages] = useState([]);

    function addErrorMessage(error) {
        const errorMessageId = new Date().getTime();
        const newErrorMessage = {
            id: errorMessageId,
            text: error,
        };
        setErrorMessages([...errorMessages, newErrorMessage]);

        setTimeout(() => {
            setErrorMessages((preErrorMessages) =>
                preErrorMessages.filter((msg) => msg.id !== errorMessageId)
            );
        }, 3000);
    }

    return (
        <>
            {errorMessages.length > 0 && (
                <div id="flasherror-container">
                    {errorMessages.map((msg) => (
                        <div key={msg.id} className="flasherror">
                            {msg.text}
                        </div>
                    ))}
                </div>
            )}

            {!videoFile ? (
                <FileDropZone
                    setVideoFile={setVideoFile}
                    addErrorMessage={addErrorMessage}
                />
            ) : (
                <ObjectTracker videoFile={videoFile} />
            )}
        </>
    );
}

export default App;
