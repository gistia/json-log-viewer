# json-log-viewer

[![npm version](https://badge.fury.io/js/json-log-viewer.svg)](https://badge.fury.io/js/json-log-viewer)

> Powerful terminal based viewer for JSON logs using ncurses.

![screenshot](screenshot.png)

**json-log-viewer** is a feature intensive viewer and analyze tool for JSON logs created by libraries like [https://github.com/winstonjs/winston](winston).

Features:

- completely operated by hotkeys
- powerful command line arguments
- sort by timestamp, level or message
- filter by any field or metadata
- search

## Install

```bash
npm install --global json-log-viewer
```

## Usage

```bash
jv application.log.2017-01-01 --sort -timestamp
```

## License

[MIT](http://vjpr.mit-license.org)
