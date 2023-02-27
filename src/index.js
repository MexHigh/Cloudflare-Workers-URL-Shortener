import indexHTML from "./frontend/index.html"
import adminHTML from "./frontend/admin.html"
import adminLoginHTML from "./frontend/admin_login.html"
import notFoundHTML from "./frontend/404.html"
import picoCSS from "./frontend/pico.min.css"

const cookieName = "url-shortener-token"
const cookieAppendices = "Path=/; Secure; HttpOnly; SameSite=Strict"

const corsHeaders = { 
	"access-control-allow-origin": "*",
	"access-control-allow-headers": "x-api-key"
}
const corsResponse = (allowedMethods) => {
	return new Response(null, { status: 200, headers: {
			"Allow": allowedMethods,
			...corsHeaders
		}
	})
}

function getCookieValue(cookies, name) {
	const value = `; ${cookies}`
	const parts = value.split(`; ${name}=`)
	if (parts.length === 2) 
		return parts.pop().split(';').shift()
	else
		return null
}

function isValidShortname(inShortname) {
	return inShortname.match(/^[a-zA-Z][a-zA-Z0-9-]+$/g)
}

function isValidHttpUrl(inURL) {
	let url
	try {
		url = new URL(inURL)
	} catch {
		return false
	}
	return url.protocol === "http:" || url.protocol === "https:" || url.protocol === "ts3server:"
}

function getTokenFromCookieOrHeader(request) {
	let cookies = request.headers.get("Cookie")
	if (cookies) {
		let val = getCookieValue(cookies, cookieName)
		if (val === null) { // cookie with that value does not exist
			return request.headers.get("x-api-key") || null
		}
		return val 
	}
	// else: no cookies present
	return request.headers.get("x-api-key") || null
}

export default {
	async fetch(request, env) {

		const authOk = async function (providedToken) {
			if (!providedToken) {
				return false
			}
			let correctToken = await env.DB.get("admin-token", { type: "text" })
			return providedToken === correctToken
		}

		try {
			const { method, headers } = request
			const { protocol, host, pathname, searchParams } = new URL(request.url)

			switch (pathname) {
				// styles CSS file
				case "/pico.min.css":
					{
						return new Response(picoCSS, {
							headers: { "content-type": "text/css;charset=UTF-8" }
						})
					}
				
				// index
				case "/":
					{
						return new Response(indexHTML, {
							headers: { "content-type": "text/html;charset=UTF-8" }
						})
					}

				// admin page
				case "/admin":
					{
						let cookies = headers.get("Cookie")
						if (!cookies) {
							return Response.redirect(protocol + "//" + host + "/admin/login")
						}
						let token = getCookieValue(cookies, cookieName)
						if (!token || !await authOk(token)) {
							return Response.redirect(protocol + "//" + host + "/admin/login")
						}

						return new Response(adminHTML, {
							headers: { "content-type": "text/html;charset=UTF-8" }
						})
					}

				case "/admin/login":
					{
						let cookies = headers.get("Cookie")
						let token = getCookieValue(cookies, cookieName)
						if (token && await authOk(token)) {
							return Response.redirect(protocol + "//" + host + "/admin")
						}

						return new Response(adminLoginHTML, {
							headers: { 
								"content-type": "text/html;charset=UTF-8",
								"set-cookie": `${cookieName}=; ${cookieAppendices}; Domain=.${host}; Max-Age=0`
							}
						})
					}

				case "/api/auth-ok":
					{
						if (method === "OPTIONS") {
							return corsResponse("GET")
						}

						if (method !== "GET") {
							return new Response("Method not allowed", { status: 405, headers: corsHeaders })
						}

						let token = getTokenFromCookieOrHeader(request)
						if (!token || !await authOk(token)) {
							return new Response("Unauthorized", { status: 401, headers: corsHeaders })
						}

						return new Response("Ok", { 
							status: 200,
							headers: corsHeaders
						})
					}

				case "/api/login":
					{
						if (method === "OPTIONS") {
							return corsResponse("GET")
						}

						if (method !== "GET") {
							return new Response("Method not allowed", { status: 405, headers: corsHeaders })
						}

						let token = getTokenFromCookieOrHeader(request)
						if (!token || !await authOk(token)) {
							return new Response("Unauthorized", { status: 401, headers: corsHeaders })
						}

						return new Response("Ok", { 
							status: 200,
							headers: {
								"set-cookie": `${cookieName}=${token}; ${cookieAppendices}; Domain=.${host};`,
								...corsHeaders
							}
						})
					}
				
				case "/api/logout":
					{
						if (method === "OPTIONS") {
							return corsResponse("GET")
						}

						if (method !== "GET") {
							return new Response("Method not allowed", { status: 405, headers: corsHeaders })
						}

						return new Response("Ok", { 
							status: 200,
							headers: {
								"set-cookie": `${cookieName}=; ${cookieAppendices}; Domain=.${host}; Max-Age=0`,
								...corsHeaders
							}
						})
					}

				case "/api/shortlink":
					// check method and authentication
					switch (method) {
						case "GET":
						case "POST":
						case "DELETE":
							{
								let token = getTokenFromCookieOrHeader(request)
								if (!token || !await authOk(token)) {
									return new Response("Unauthorized", { status: 401, headers: corsHeaders })
								}
								break
							}
						case "OPTIONS":
							return corsResponse("GET, POST, DELETE")
						default:
							return new Response("Method not allowed", { status: 405, headers: corsHeaders })
					}

					// routes
					switch (method) {
						case "GET":
							{
								let redirectMapping = await env.DB.get("redirect-mapping", { type: "json" })
								return new Response(JSON.stringify(redirectMapping), {
									status: 200,
									headers: {
										"content-type": "application/json", 
										...corsHeaders
									}
								})
							}

						case "POST": 
							{
								let body = await request.json()
								if (!body.name || !body.target) {
									return new Response("\"name\" or \"target\" is empty", { status: 400, headers: corsHeaders })
								}
								if (!isValidShortname(body.name)) {
									return new Response("\"name\" contains illegal characters", { status: 400, headers: corsHeaders })
								}
								if (!isValidHttpUrl(body.target)) {
									return new Response("\"target\" is not an URL", { status: 400, headers: corsHeaders })
								}
	
								let temp = await env.DB.get("redirect-mapping", { type: "json" })
								temp[body.name] = body.target
								await env.DB.put("redirect-mapping", JSON.stringify(temp))
	
								return new Response("Ok", { status: 201, headers: corsHeaders })
							}

						case "DELETE":
							{
								let body = await request.json()
								if (body.name === undefined) {
									return new Response("\"name\" is empty", { status: 400, headers: corsHeaders })
								}
	
								let temp = await env.DB.get("redirect-mapping", { type: "json" })
								if (!temp[body.name]) {
									return new Response("Shortname not found", { status: 404, headers: corsHeaders })
								}
								delete temp[body.name]
								await env.DB.put("redirect-mapping", JSON.stringify(temp))
	
								return new Response("Ok", { status: 200, headers: corsHeaders })
							}
					}
			}

			if (method !== "GET") {
				return new Response("Method not allowed", { status: 405 })
			}

			const pathnameParts = pathname.split("/")
			if (pathnameParts.length > 2 && pathnameParts[2] !== "") {
				return new Response(notFoundHTML, { 
					status: 404, 
					headers: {"content-type": "text/html;charset=UTF-8" }
				})
			}
			const shortlinkName = pathnameParts[1].replace("/", "")

			const redirectMapping = await env.DB.get("redirect-mapping", { type: "json" })
			if (!redirectMapping.hasOwnProperty(shortlinkName)) {
				return new Response(notFoundHTML, { 
					status: 404, 
					headers: {"content-type": "text/html;charset=UTF-8" }
				})
			}
			const targetURL = redirectMapping[shortlinkName]

			return Response.redirect(targetURL, 307)

		} catch (err) {
			return new Response(err.stack, { status: 500 })
		}
	}
}