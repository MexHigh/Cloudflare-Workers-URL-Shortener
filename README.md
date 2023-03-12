# Cloudflare Workers URL Shortener

A link shortener completely built using Cloudflare Workers and KV. It is suitable for the free tier, as writes only occur when creating a new short URL.

The URL Shortener also comes with a simple and mobile-optimized admin dashboard (build with [PicoCSS](https://picocss.com/)) and chrome browser extension to shorten the link of the page you are currently visiting with one click. 

## How to use it?

The admin dashboard is located at `https://<host>/admin`.

When you create a new shortlink (either via the admin dashboard or the browser extension) the short name for the link will be available at `https://<host>/<short-name>`. When someone visits this URL, a redirect to the long URL is issued. Nothing about a user will be logged. 

## How to deploy your own?

- [Download Wrangler](https://developers.cloudflare.com/workers/wrangler/install-and-update/)
- Login Wrangler with `wrangler login`
- Create a KV namespace either [with Wrangler](https://developers.cloudflare.com/workers/wrangler/workers-kv/#create-a-kv-namespace-with-wrangler) or via the Cloudflare Dashboard
- Create the key `admin-token` inside the newly created KV and set any string as value (THIS IS YOUR LOGIN SECRET)
- Adjust `name`, `account_id`, `routes` to your likings and set `kv_namespaces[0].id` to the KV namespace ID
- Run `wrangler publish`
- Move to your instance and login using the value set in `admin-token`

## How to use the browser extension?

- Enable developer mode in your [browsers extension settings](chrome://extensions/)
- Choose "Load unpacked extension"
- Choose the folder `chrome-extension` in this repository

The first time you click the extensions icon, it promts you to configure your server URL and admin token. This settings will persist in your browser but are configured to not be synced using your google account.

After the initial configuration, the extension also sets a login session cookie for the admin dashboard on each browser restart, so you don't need to login manually :) 
