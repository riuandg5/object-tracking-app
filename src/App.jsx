import { useState } from "react";

import FileDropZone from "./FileDropZone/FileDropZone";
import ObjectTracker from "./ObjectTracker/ObjectTracker";

import "./App.css";

function App() {
    // State for storing the video file
    const [videoFile, setVideoFile] = useState(null);
    // State for storing error messages
    const [errorMessages, setErrorMessages] = useState([]);

    // Function to add an error message
    function addErrorMessage(error) {
        // Create a unique id for the error message
        const errorMessageId = new Date().getTime();
        const newErrorMessage = {
            id: errorMessageId,
            text: error,
        };
        // Add the new error message to the state
        setErrorMessages([...errorMessages, newErrorMessage]);

        // Remove the error message after 3 seconds
        setTimeout(() => {
            setErrorMessages((preErrorMessages) =>
                preErrorMessages.filter((msg) => msg.id !== errorMessageId)
            );
        }, 3000);
    }

    return (
        <>
            {/* Display error messages if any */}
            {errorMessages.length > 0 && (
                <div id="flasherror-container">
                    {errorMessages.map((msg) => (
                        <div key={msg.id} className="flasherror">
                            {msg.text}
                        </div>
                    ))}
                </div>
            )}

            {/* If no video file is selected, display the FileDropZone component, else display the ObjectTracker component */}
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
