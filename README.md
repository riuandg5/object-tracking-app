# object-tracking-app

An attempt to integrate [OpenCV.js](https://docs.opencv.org/4.x/d5/d10/tutorial_js_root.html) in React app to test object tracking in video.

## How to run the app?

Pre-requisite: Node.js, NPM

```sh
# git clone this repo and run the following commands
$ npm install
$ npm run dev       # to start development server

$ npm run build     # to build the project
$ nom run preview   # to run the local server to view the built project
```

Project template was generated using [Vite](https://vitejs.dev/).

## About the project

### Objective:

Develop a web-based tool that enables users to visualize a video and interact with it by marking a specific area of interest within the video frame using a mouse. Once a region is marked by drawing a rectangle, the tool should track the selected object or area throughout the video using object detection techniques.

### Key Features:

-   A web interface that allows users to upload or select a video to be played within the browser.
-   The ability to pause the video and draw a rectangle over a portion of the video frame to select an area or object.
-   Once an area is selected, apply object detection and tracking to follow the marked area across the video frames.
-   Display the tracking in real-time as the video plays, showing the rectangle moving with the tracked object.
-   Include controls to adjust the tracking parameters (optional) and reset or change the marked area.

### Challenges Faced:

-   Opencv.js is the biggest limitation as only a few tracking algorithms and models have been translated to Javascript world. In this project I am using [CamShift Tracker](https://docs.opencv.org/4.x/df/def/tutorial_js_meanshift.html). But in [Python, and C++](https://docs.opencv.org/3.4/d2/d0a/tutorial_introduction_to_tracker.html) we have more and better general purpose trackers as well as application specific trackers.

### Todos:

-   Include Saturation and calculate 2D histogram as in current implementation, I am only using Hue component of the HSV color space that is object to be tracked should have a single shade of color for better results.

-   Make number of bins in the color tunable as it depends on lightning conditions.
-   Make termination criteria tunable.

https://github.com/riuandg5/object-tracking-app/assets/34133332/4be08059-fa33-434e-9f5c-a055589228ac
