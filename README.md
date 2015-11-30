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
brew install nodejs
brew install npm
npm install -g browserify
npm install -g nodemon

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

To run the project locally for testing, you can run the development server using the following command:

```bash
scripts/build serve
```

This simply runs the `build/service.js` file under `nodemon`. Since this uses `nodemon`, the service will be loaded when the project is rebuild using `scripts/build build`.

### Deploying

Deployment is performed using Ansible which can be configured in the `ansible` directory.

From the root directory of the project:

```bash
scripts/build deploy
```

Meeting currently makes use of upstart to configure Node.js as a service on Ubuntu systems as described in [this article](http://kvz.io/blog/2009/12/15/run-nodejs-as-a-service-on-ubuntu-karmic/).

_The current meeting service is configured to listen on port 3000 so you will likely need to add a firewall exception for this or configure a reverse proxy. Ultimately, it should be possible to change the service port within the Ansible configuration and the default will be set to port 80 as one might expect._
