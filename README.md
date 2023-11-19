# VerneMQ Admin Interface
## Limitations
* Currently, there is no support for authentication and authorization plugins.
* There is no support for some build-in plugins as bridge.

## Installation
In order to further develop the Admin UI or to create a new build pnpm is necessary.
* Download https://pnpm.io/
* Execute pnpm build
* pnpm should download all dependencies and sucessfully create a build

## Development setup
* Start the development server with pnpm dev
* As there is no real backend, you need to adjust vite.config.ts accordingly, so it points to a real VerneMQ node. Currently, there is no backend mockup, so you need test against a real broker.

## Create a build
A new build that can be tested with the backend vmq-admin-ui plugin can be created as follows:

pnpm build

aferwards there should be a new build in the dists directory which can be used with the vmq-admin-ui backend.

## Credits
The VerneMQ API is based on the following template: vitify-next.

