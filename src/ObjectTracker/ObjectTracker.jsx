import { useRef, useState } from "react";

import "./ObjectTracker.css";

export default function ObjectTracker({ videoFile }) {
    const [isVideoPlaying, setIsVideoPlaying] = useState(false);
    const [videoCurrentTime, setVideoCurrentTime] = useState(0);
    const [videoDuration, setVideoDuration] = useState(0);

    const videoRef = useRef(null);

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

        setVideoDuration(video.duration);

        const width = video.videoWidth;
        const height = video.videoHeight;
        if (width && height) {
            const aspectRatio = width / height;
            video.width = Math.round(video.offsetWidth);
            video.height = Math.round(video.offsetWidth / aspectRatio);
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
            </div>
        </div>
    );
}
