# Changelog

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
