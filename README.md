# Distributed Communication Cell

All development thus-far has been performed on OS X. It is anticipated that the same mechanisms described here will also work on Linux systems.

## Dependencies

```bash
npm install -g browserify
npm install
```

## Building

```bash
browserify -t reactify main.js -o bundle.js
```

## Running

```bash
node service.js
```
