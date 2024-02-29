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

const MARKER_COLOR = "#39FF14";
const MARKER_WIDTH = 4;

export default function ObjectTracker({ videoFile }) {
    const [isVideoPlaying, setIsVideoPlaying] = useState(false);
    const [isVideoEnded, setIsVideoEnded] = useState(false);
    const [videoCurrentTime, setVideoCurrentTime] = useState(0);
    const [videoDuration, setVideoDuration] = useState(0);

    const [isDrawingMarker, setIsDrawingMarker] = useState(false);
    const [markerStartPoint, setMarkerStartPoint] = useState({ x: 0, y: 0 });
    const [markerEndPoint, setMarkerEndPoint] = useState({ x: 0, y: 0 });
    const [isValidMarker, setIsValidMarker] = useState(false);

    const [isTracking, setIsTracking] = useState(false);

    const videoRef = useRef(null);
    const canvasRef = useRef(null);
    const contextRef = useRef(null);

    const isVideoEndedRef = useRef(isVideoEnded);
    const isValidMarkerRef = useRef(isValidMarker);

    useEffect(() => {
        const canvas = canvasRef.current;
        contextRef.current = canvas.getContext("2d");
    }, []);

    useEffect(() => {
        isVideoEndedRef.current = isVideoEnded;
        isValidMarkerRef.current = isValidMarker;
    }, [isVideoEnded, isValidMarker]);

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

    function handleVideoPlayToggle() {
        const video = videoRef.current;
        isVideoPlaying ? video.pause() : video.play();
        setIsVideoPlaying(!isVideoPlaying);
    }

    function handleVideoTimeUpdate() {
        const video = videoRef.current;
        setVideoCurrentTime(video.currentTime);
    }

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

    function handleVideoEnded() {
        setIsVideoPlaying(false);
        setIsVideoEnded(true);
    }

    function handleVideoSeek(e) {
        const newTime = e.target.value;
        const video = videoRef.current;
        video.currentTime = newTime;

        if (newTime !== videoDuration) {
            setIsVideoEnded(false);
        }
    }

    function formatTime(time) {
        function zeroPrefix(num) {
            return num % 10 == num ? "0" + num : num;
        }
        const hr = zeroPrefix(parseInt(time / 3600));
        const min = zeroPrefix(parseInt((time % 3600) / 60));
        const sec = zeroPrefix(parseInt(time % 60));
        return `${hr}:${min}:${sec}`;
    }

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

    function handleMouseMoveOnCanvas(e) {
        if (!isDrawingMarker) return;
        const canvas = canvasRef.current;
        const rect = canvas.getBoundingClientRect();
        setMarkerEndPoint({
            x: Math.floor(e.clientX - rect.left),
            y: Math.floor(e.clientY - rect.top),
        });
    }

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

    function handleResetMark() {
        setMarkerEndPoint({ x: markerStartPoint.x, y: markerStartPoint.y });
        setIsValidMarker(false);
        setIsTracking(false);

        const video = videoRef.current;
        video.pause();
        setIsVideoPlaying(false);
    }

    function startTracking() {
        const video = videoRef.current;
        const canvas = canvasRef.current;
        const context = contextRef.current;
        context.strokeStyle = MARKER_COLOR;
        context.lineWidth = MARKER_WIDTH;

        setIsTracking(true);

        if (isVideoEnded) {
            setIsVideoEnded(false);
            video.currentTime = 0;
        }
        video.play();
        setIsVideoPlaying(true);

        const cap = new cv.VideoCapture(video);
        const frame = new cv.Mat(video.height, video.width, cv.CV_8UC4);
        cap.read(frame);

        let trackWindow = new cv.Rect(
            Math.min(markerStartPoint.x, markerEndPoint.x),
            Math.min(markerStartPoint.y, markerEndPoint.y),
            Math.abs(markerStartPoint.x - markerEndPoint.x),
            Math.abs(markerStartPoint.y - markerEndPoint.y)
        );

        const roi = frame.roi(trackWindow);
        const hsvRoi = new cv.Mat();
        cv.cvtColor(roi, hsvRoi, cv.COLOR_RGBA2RGB);
        cv.cvtColor(hsvRoi, hsvRoi, cv.COLOR_RGB2HSV);

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

        const roiHist = new cv.Mat();
        const hsvRoiVec = new cv.MatVector();
        hsvRoiVec.push_back(hsvRoi);
        cv.calcHist(hsvRoiVec, [0], mask, roiHist, [180], [0, 180]);
        cv.normalize(roiHist, roiHist, 0, 255, cv.NORM_MINMAX);

        roi.delete();
        hsvRoi.delete();
        mask.delete();
        low.delete();
        high.delete();
        hsvRoiVec.delete();

        const termCrit = new cv.TermCriteria(
            cv.TERM_CRITERIA_EPS | cv.TERM_CRITERIA_COUNT,
            10,
            1
        );

        const hsv = new cv.Mat(video.height, video.width, cv.CV_8UC3);
        const hsvVec = new cv.MatVector();
        hsvVec.push_back(hsv);
        const dst = new cv.Mat();
        let trackBox = null;

        function processVideo() {
            try {
                if (isVideoEndedRef.current || !isValidMarkerRef.current) {
                    setIsTracking(false);

                    frame.delete();
                    dst.delete();
                    hsvVec.delete();
                    roiHist.delete();
                    hsv.delete();
                    return;
                }

                cap.read(frame);

                cv.cvtColor(frame, hsv, cv.COLOR_RGBA2RGB);
                cv.cvtColor(hsv, hsv, cv.COLOR_RGB2HSV);
                cv.calcBackProject(hsvVec, [0], roiHist, dst, [0, 180], 1);

                [trackBox, trackWindow] = cv.CamShift(
                    dst,
                    trackWindow,
                    termCrit
                );

                const pts = cv.rotatedRectPoints(trackBox);

                context.clearRect(0, 0, canvas.width, canvas.height);

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

                requestAnimationFrame(processVideo);
            } catch (err) {
                console.log(err);
            }
        }

        requestAnimationFrame(processVideo);
    }

    return (
        <div id="object-tracker">
            <div className="video-container">
                <video
                    ref={videoRef}
                    onTimeUpdate={handleVideoTimeUpdate}
                    onLoadedMetadata={handleVideoLoadedMetadata}
                    onEnded={handleVideoEnded}
                    muted
                >
                    <source src={URL.createObjectURL(videoFile)} />
                </video>
                <canvas
                    ref={canvasRef}
                    onMouseDown={handleMouseDownOnCanvas}
                    onMouseMove={handleMouseMoveOnCanvas}
                    onMouseUp={handleMouseUpOnCanvas}
                />
            </div>

            <div className="video-controls">
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
                <span id="video-time">
                    {formatTime(videoCurrentTime)} / {formatTime(videoDuration)}
                </span>
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
    );
}
