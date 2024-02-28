import { useRef, useState, useEffect } from "react";

import "./ObjectTracker.css";

const MARKER_COLOR = "#39FF14";
const MARKER_WIDTH = 4;

export default function ObjectTracker({ videoFile }) {
    const [isVideoPlaying, setIsVideoPlaying] = useState(false);
    const [videoCurrentTime, setVideoCurrentTime] = useState(0);
    const [videoDuration, setVideoDuration] = useState(0);

    const [isDrawingMarker, setIsDrawingMarker] = useState(false);
    const [markerStartPoint, setMarkerStartPoint] = useState({ x: 0, y: 0 });
    const [markerEndPoint, setMarkerEndPoint] = useState({ x: 0, y: 0 });
    const [isValidMarker, setIsValidMarker] = useState(false);

    const videoRef = useRef(null);
    const canvasRef = useRef(null);
    const contextRef = useRef(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        contextRef.current = canvas.getContext("2d");
    }, []);

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

    function handleVideoSeek(e) {
        const newTime = e.target.value;
        const video = videoRef.current;
        video.currentTime = newTime;
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

        const video = videoRef.current;
        video.pause();
        setIsVideoPlaying(false);
    }

    return (
        <div id="object-tracker">
            <div className="video-container">
                <video
                    ref={videoRef}
                    onTimeUpdate={handleVideoTimeUpdate}
                    onLoadedMetadata={handleVideoLoadedMetadata}
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
                    {isVideoPlaying ? "Pause" : "Play"}
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
                <button type="button" onClick={() => window.location.reload()}>
                    New File
                </button>
                {isValidMarker && (
                    <button type="button" onClick={handleResetMark}>
                        Reset Mark
                    </button>
                )}
            </div>
        </div>
    );
}
