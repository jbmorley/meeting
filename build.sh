#!/bin/bash

script_dir="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
root_dir="$script_dir"

browserify -t reactify main.js -o bundle.js
