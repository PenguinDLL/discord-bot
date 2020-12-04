#!/bin/bash

# to install nvm, run `wget -qO- https://raw.githubusercontent.com/nvm-sh/nvm/v0.37.2/install.sh | bash`
# then install node with `nvm install node`
function start {
    nvm use node
    npm install
    node .
}

$1