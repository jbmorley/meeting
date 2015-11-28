# Meeting

Suite of applications for performing distributed group video conferences and managing shared meeting boards.

## Development

All development thus-far has been performed on OS X. It is anticipated that the same mechanisms described here will also work on Linux systems.

### Dependencies

From the root directory of the project:

```bash
# submodules
git submodule update --init --recursive

# global requirements
brew install ansible
npm install -g browserify

# local requirements
npm install
```

See the [React documentation](http://facebook.github.io/react/docs/getting-started.html#using-react-from-npm) for further notes on installation.

### Building

From the root directory of the project:

```bash
scripts/build build
```

### Running

```bash
node service.js
```

### Deploying

Deployment is performed using Ansible which can be configured in the `ansible` directory.

From the root directory of the project:

```bash
scripts/build deploy
```
