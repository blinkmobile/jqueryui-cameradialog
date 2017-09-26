# Changelog

## Unreleased

### Fixed

- FORMS-276 Issues with iOS 11
    - setting [`video.srcObject`](https://developer.mozilla.org/en-US/docs/Web/API/HTMLMediaElement/srcObject) as [MediaStream](https://developer.mozilla.org/en-US/docs/Web/API/MediaStream)
    - populate camera options drop down after user has given permission to access camera.
    - trigger the camera to reload after the initial load if multiple cameras are available to ensure the correct camera is selected in the options drop down
    - test to use [`MediaDevices.enumerateDevices()`](https://developer.mozilla.org/en-US/docs/Web/API/MediaDevices/enumerateDevices) if available

## v1.0.5

- PLATFORM-1607 MediaStream.stop() is deprecated
  - Updated plugin to use `MediaStreamTrack.stop()`


## v1.0.4

### Fixed

- PLATFORM-1531: fix issues in Internet Explorer 8

    - `begin` ,`end`, `open` and `close` jQuery UI methods now all stop
      if there is no `getUserMedia`, hopefully preventing any possible IE issues

## v1.0.3

### Fixed

- test with [ESLint](http://eslint.org/)

- PLATFORM-1531: fix issues in Internet Explorer 8

    - no `getUserMedia()` in IE8, but at least it doesn't crash
