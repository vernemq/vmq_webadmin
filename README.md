# VerneMQ Admin Interface

## Status
* Alpha. Looking for contributions to push further development and complete functionality.
* Current VerneMQ releases have the needed backend plugin fully integrated but not the frontend (vmq_webadmin)

## Quickstart

Example Config (add to `vernemq.conf`):

```
plugins.vmq_web_ui = on
vmq_web_ui.admin.auth = password
vmq_web_ui.admin.user_name = admin
vmq_web_ui.admin.user_pwd = verne
vmq_web_ui.mgmt_api.port = 9800
vmq_web_ui.mgmt_api.scheme = http
vmq_web_ui.mgmt_api.key = abc

listener.http.default = 127.0.0.1:9800
listener.http.default.http_module.vmq_http_mgmt_api.auth.mode = noauth
listener.http.http_ui = 127.0.0.1:3001
listener.http.http_ui.http_module.vmq_http_pub.auth.mode = noauth
listener.http.http_ui.http_modules = vmq_web_ui
```

Check out this project (`git clone https://github.com/vernemq/vmq_webadmin `) and build it with `pnpm install & pnpm build`.
You can then copy the dist assets into VerneMQ. The location to copy to will be visible from `vmq-admin webui show`.

Example copy command:
```
sudo cp -R dist/* /usr/lib/vernemq/lib/vmq_web_ui-2.1.1/priv/www/ 
```
  
## Limitations
* Currently, there is no support for authentication and authorization plugins.
* There is no support for some build-in plugins as bridge.

## Installation
In order to further develop the Admin UI or to create a new build pnpm is necessary.
* Download https://pnpm.io/
* Execute pnpm install & pnpm build
* pnpm should download all dependencies and sucessfully create a build

## Development setup
* Start the development server with pnpm dev
* As there is no real backend, you need to adjust vite.config.ts accordingly, so it points to a real VerneMQ node. Currently, there is no backend mockup, so you need test against a real broker.

## Create a build
A new build that can be tested with the backend vmq-admin-ui plugin can be created as follows:

pnpm build

afterwards there should be a new build in the dists directory which can be used with the vmq-admin-ui backend.

## Credits
The VerneMQ API is based on the following template: vitify-next.

