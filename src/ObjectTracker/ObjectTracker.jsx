/* eslint-disable no-undef */
import { useRef, useState, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
    faPlay,
    faPause,
    faFilm,
    faObjectGroup,
    faMagnifyingGlass,
} from "@fortawesome/free-solid-svg-icons";

import "./ObjectTracker.css";

// Define the color and width of the marker
const MARKER_COLOR = "#39FF14";
const MARKER_WIDTH = 4;

// ObjectTracker component for tracking objects in a video
export default function ObjectTracker({ videoFile }) {
    // State for video playback status
    const [isVideoPlaying, setIsVideoPlaying] = useState(false);
    const [isVideoEnded, setIsVideoEnded] = useState(false);
    // State for video current time and duration
    const [videoCurrentTime, setVideoCurrentTime] = useState(0);
    const [videoDuration, setVideoDuration] = useState(0);

    // State for drawing marker
    const [isDrawingMarker, setIsDrawingMarker] = useState(false);
    // State for marker start points, end points, and validity
    const [markerStartPoint, setMarkerStartPoint] = useState({ x: 0, y: 0 });
    const [markerEndPoint, setMarkerEndPoint] = useState({ x: 0, y: 0 });
    const [isValidMarker, setIsValidMarker] = useState(false);

    // State for tracking status
    const [isTracking, setIsTracking] = useState(false);

    // References to the video and canvas elements and the canvas context
    const videoRef = useRef(null);
    const canvasRef = useRef(null);
    const contextRef = useRef(null);

    // References to the video ended and marker validity states
    const isVideoEndedRef = useRef(isVideoEnded);
    const isValidMarkerRef = useRef(isValidMarker);

    // Initialize the canvas context
    useEffect(() => {
        const canvas = canvasRef.current;
        contextRef.current = canvas.getContext("2d");
    }, []);

    // Update the video ended and marker validity references
    useEffect(() => {
        isVideoEndedRef.current = isVideoEnded;
        isValidMarkerRef.current = isValidMarker;
    }, [isVideoEnded, isValidMarker]);

    // Draw the marker on the canvas
    useEffect(() => {
        const canvas = canvasRef.current;
        const context = contextRef.current;
        context.strokeStyle = MARKER_COLOR;
        context.lineWidth = MARKER_WIDTH;
        context.clearRect(0, 0, canvas.width, canvas.height);
        if (
            markerStartPoint.x !== markerEndPoint.x &&
            markerStartPoint.y !== markerEndPoint.y
        ) {
            context.strokeRect(
                markerStartPoint.x,
                markerStartPoint.y,
                markerEndPoint.x - markerStartPoint.x,
                markerEndPoint.y - markerStartPoint.y
            );

            if (!isDrawingMarker) {
                setIsValidMarker(true);
            }
        } else {
            setIsValidMarker(false);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [markerEndPoint]);

    // Function to handle video play/pause toggle
    function handleVideoPlayToggle() {
        const video = videoRef.current;
        isVideoPlaying ? video.pause() : video.play();
        setIsVideoPlaying(!isVideoPlaying);
    }

    // Function to handle video time update
    function handleVideoTimeUpdate() {
        const video = videoRef.current;
        setVideoCurrentTime(video.currentTime);
    }

    // Function to handle video loaded metadata
    function handleVideoLoadedMetadata() {
        const video = videoRef.current;
        const canvas = canvasRef.current;

        setVideoDuration(video.duration);

        const width = video.videoWidth;
        const height = video.videoHeight;
        if (width && height) {
            const aspectRatio = width / height;
            video.width = Math.round(video.offsetWidth);
            video.height = Math.round(video.offsetWidth / aspectRatio);

            canvas.width = video.width;
            canvas.height = video.height;
        }
    }

    // Function to handle video ended
    function handleVideoEnded() {
        setIsVideoPlaying(false);
        setIsVideoEnded(true);
    }

    // Function to handle video seek
    function handleVideoSeek(e) {
        const newTime = e.target.value;
        const video = videoRef.current;
        video.currentTime = newTime;

        if (newTime !== videoDuration) {
            setIsVideoEnded(false);
        }
    }

    // Function to format time
    function formatTime(time) {
        function zeroPrefix(num) {
            return num % 10 == num ? "0" + num : num;
        }
        const hr = zeroPrefix(parseInt(time / 3600));
        const min = zeroPrefix(parseInt((time % 3600) / 60));
        const sec = zeroPrefix(parseInt(time % 60));
        return `${hr}:${min}:${sec}`;
    }

    // Function to handle mouse down on canvas
    function handleMouseDownOnCanvas(e) {
        if (isVideoPlaying) return;
        setIsDrawingMarker(true);
        const canvas = canvasRef.current;
        const rect = canvas.getBoundingClientRect();
        const coordinates = {
            x: Math.floor(e.clientX - rect.left),
            y: Math.floor(e.clientY - rect.top),
        };
        setMarkerStartPoint(coordinates);
        setMarkerEndPoint(coordinates);
    }

    // Function to handle mouse move on canvas
    function handleMouseMoveOnCanvas(e) {
        if (!isDrawingMarker) return;
        const canvas = canvasRef.current;
        const rect = canvas.getBoundingClientRect();
        setMarkerEndPoint({
            x: Math.floor(e.clientX - rect.left),
            y: Math.floor(e.clientY - rect.top),
        });
    }

    // Function to handle mouse up on canvas
    function handleMouseUpOnCanvas(e) {
        if (!isDrawingMarker) return;
        setIsDrawingMarker(false);

        const canvas = canvasRef.current;
        const rect = canvas.getBoundingClientRect();
        setMarkerEndPoint({
            x: Math.floor(e.clientX - rect.left),
            y: Math.floor(e.clientY - rect.top),
        });
    }

    // Function to handle reset mark
    function handleResetMark() {
        setMarkerEndPoint({ x: markerStartPoint.x, y: markerStartPoint.y });
        setIsValidMarker(false);
        setIsTracking(false);

        const video = videoRef.current;
        video.pause();
        setIsVideoPlaying(false);
    }

    // Function to start tracking the object in the video
    function startTracking() {
        // Get the video, canvas, and context references
        const video = videoRef.current;
        const canvas = canvasRef.current;
        const context = contextRef.current;

        // Set the stroke color and width for the marker
        context.strokeStyle = MARKER_COLOR;
        context.lineWidth = MARKER_WIDTH;

        // Set the tracking state to true
        setIsTracking(true);

        // If the video has ended, reset the video time to the start
        if (isVideoEnded) {
            setIsVideoEnded(false);
            video.currentTime = 0;
        }

        // Play the video and set the video playing state to true
        video.play();
        setIsVideoPlaying(true);

        // Create a new VideoCapture object with the video
        const cap = new cv.VideoCapture(video);

        // Create a new Mat object with the video dimensions
        const frame = new cv.Mat(video.height, video.width, cv.CV_8UC4);

        // Read the current frame from the video
        cap.read(frame);

        // Define the tracking window based on the marker start and end points
        let trackWindow = new cv.Rect(
            Math.min(markerStartPoint.x, markerEndPoint.x),
            Math.min(markerStartPoint.y, markerEndPoint.y),
            Math.abs(markerStartPoint.x - markerEndPoint.x),
            Math.abs(markerStartPoint.y - markerEndPoint.y)
        );

        // Create a region of interest (ROI) from the frame
        const roi = frame.roi(trackWindow);

        // Convert the ROI to HSV color space
        const hsvRoi = new cv.Mat();
        cv.cvtColor(roi, hsvRoi, cv.COLOR_RGBA2RGB);
        cv.cvtColor(hsvRoi, hsvRoi, cv.COLOR_RGB2HSV);

        // Create a mask for the ROI based on color range
        const mask = new cv.Mat();
        const lowScalar = new cv.Scalar(30, 30, 0);
        const highScalar = new cv.Scalar(180, 180, 180);
        const low = new cv.Mat(
            hsvRoi.rows,
            hsvRoi.cols,
            hsvRoi.type(),
            lowScalar
        );
        const high = new cv.Mat(
            hsvRoi.rows,
            hsvRoi.cols,
            hsvRoi.type(),
            highScalar
        );
        cv.inRange(hsvRoi, low, high, mask);

        // Calculate the histogram of the ROI
        const roiHist = new cv.Mat();
        const hsvRoiVec = new cv.MatVector();
        hsvRoiVec.push_back(hsvRoi);
        cv.calcHist(hsvRoiVec, [0], mask, roiHist, [180], [0, 180]);
        cv.normalize(roiHist, roiHist, 0, 255, cv.NORM_MINMAX);

        // Delete the temporary Mat objects
        roi.delete();
        hsvRoi.delete();
        mask.delete();
        low.delete();
        high.delete();
        hsvRoiVec.delete();

        // Define the termination criteria for the CamShift algorithm
        const termCrit = new cv.TermCriteria(
            cv.TERM_CRITERIA_EPS | cv.TERM_CRITERIA_COUNT,
            10,
            1
        );

        // Create a new Mat object for the HSV image and the back projection
        const hsv = new cv.Mat(video.height, video.width, cv.CV_8UC3);
        const hsvVec = new cv.MatVector();
        hsvVec.push_back(hsv);
        const dst = new cv.Mat();

        // Variable to hold the tracking box
        let trackBox = null;

        // Function to process each video frame
        function processVideo() {
            try {
                // If the video has ended or the marker is not valid, stop tracking
                if (isVideoEndedRef.current || !isValidMarkerRef.current) {
                    setIsTracking(false);

                    // Delete the Mat objects
                    frame.delete();
                    dst.delete();
                    hsvVec.delete();
                    roiHist.delete();
                    hsv.delete();
                    return;
                }

                // Read the current frame from the video
                cap.read(frame);

                // Convert the frame to HSV color space
                cv.cvtColor(frame, hsv, cv.COLOR_RGBA2RGB);
                cv.cvtColor(hsv, hsv, cv.COLOR_RGB2HSV);

                // Calculate the back projection of the histogram
                cv.calcBackProject(hsvVec, [0], roiHist, dst, [0, 180], 1);

                // Apply the CamShift algorithm to the back projection
                [trackBox, trackWindow] = cv.CamShift(
                    dst,
                    trackWindow,
                    termCrit
                );

                // Get the points of the rotated rectangle
                const pts = cv.rotatedRectPoints(trackBox);

                // Clear the canvas
                context.clearRect(0, 0, canvas.width, canvas.height);

                // Draw the rotated rectangle on the canvas
                for (let i = 0; i <= pts.length; i++) {
                    if (i === 0) {
                        context.beginPath();
                        context.moveTo(
                            Math.round(pts[i].x),
                            Math.round(pts[i].y)
                        );
                    } else if (i === pts.length) {
                        context.closePath();
                        context.stroke();
                    } else {
                        context.lineTo(
                            Math.round(pts[i].x),
                            Math.round(pts[i].y)
                        );
                    }
                }

                // Request the next animation frame
                requestAnimationFrame(processVideo);
            } catch (err) {
                console.log(err);
            }
        }

        // Start processing the video
        requestAnimationFrame(processVideo);
    }

    return (
        <>
            {/* Display instructions to mark the object if no valid marker is present */}
            {!isValidMarker && (
                <h1 className="head-info">
                    Mark the object in the video (at any time) by dragging
                    cursor over it
                </h1>
            )}
            {/* Display instructions to start tracking if a valid marker is present but tracking has not started */}
            {isValidMarker && !isTracking && (
                <h1 className="head-info">
                    Click on start tracking to proceed
                </h1>
            )}

            {/* Display tracking status if a valid marker is present and tracking has started */}
            {isValidMarker && isTracking && (
                <h1 className="head-info">Tracking...</h1>
            )}

            <div id="object-tracker">
                <div className="video-container">
                    {/* Video element with event handlers for time update, metadata loaded, and video ended */}
                    <video
                        ref={videoRef}
                        onTimeUpdate={handleVideoTimeUpdate}
                        onLoadedMetadata={handleVideoLoadedMetadata}
                        onEnded={handleVideoEnded}
                        muted
                    >
                        <source src={URL.createObjectURL(videoFile)} />
                    </video>
                    {/* Canvas element with event handlers for mouse down, mouse move, and mouse up */}
                    <canvas
                        ref={canvasRef}
                        onMouseDown={handleMouseDownOnCanvas}
                        onMouseMove={handleMouseMoveOnCanvas}
                        onMouseUp={handleMouseUpOnCanvas}
                    />
                </div>

                <div className="video-controls">
                    {/* Button to toggle video play/pause */}
                    <button
                        id="video-play-btn"
                        type="button"
                        onClick={handleVideoPlayToggle}
                    >
                        <FontAwesomeIcon
                            icon={isVideoPlaying ? faPause : faPlay}
                            size="2x"
                        />
                    </button>
                    {/* Display current time and duration of the video */}
                    <span id="video-time">
                        {formatTime(videoCurrentTime)} /{" "}
                        {formatTime(videoDuration)}
                    </span>
                    {/* Seekbar for the video */}
                    <input
                        id="video-seekbar"
                        type="range"
                        min="0"
                        max={videoDuration}
                        value={videoCurrentTime}
                        onChange={handleVideoSeek}
                    />
                </div>

                <div className="tracking-controls">
                    {/* Button to load a new file */}
                    <button
                        type="button"
                        style={{
                            backgroundColor: "#74c0fc",
                        }}
                        onClick={() => window.location.reload()}
                    >
                        New File
                        <FontAwesomeIcon
                            style={{ marginLeft: "1em" }}
                            icon={faFilm}
                        />
                    </button>
                    {/* Button to reset the marker if a valid marker is present */}
                    {isValidMarker && (
                        <button
                            type="button"
                            style={{
                                backgroundColor: "#ffd43b",
                            }}
                            onClick={handleResetMark}
                        >
                            Reset Mark
                            <FontAwesomeIcon
                                style={{ marginLeft: "1em" }}
                                icon={faObjectGroup}
                            />
                        </button>
                    )}
                    {/* Button to start tracking if a valid marker is present and tracking has not started */}
                    {isValidMarker && !isTracking && (
                        <button
                            type="button"
                            style={{
                                backgroundColor: "#63e6be",
                            }}
                            onClick={startTracking}
                        >
                            Start Tracking{" "}
                            {isValidMarker && isVideoEnded && "Again"}
                            <FontAwesomeIcon
                                style={{ marginLeft: "1em" }}
                                icon={faMagnifyingGlass}
                            />
                        </button>
                    )}
                </div>
            </div>
        </>
    );
}
