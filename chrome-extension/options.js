function handleSubmit(event) {
    event.preventDefault()

    event.submitter.setAttribute("aria-busy", "true")
    
    let serverHost = document.querySelector("#server-host")?.value
    let adminToken = document.querySelector("#admin-token")?.value

    let errMsg = document.querySelector("#errMsg")

    // check token
    fetch(`https://${serverHost}/api/auth-ok`, {
        method: "GET",
        headers: {
            "x-api-key": adminToken
        }
    }).then(async (r) => {
        if (r.ok) {
            // store correct token
            chrome.storage.local.set({ "admin-token": adminToken }).then(() => {
                console.log("Admin token saved successfully")    
            })

            // store server host
            chrome.storage.local.set({ "server-host": serverHost }).then(() => {
                console.log("Server host saved successfully")
            })

            // request permissions to host for setting the login cookie
            chrome.permissions.request({ origins: ["https://" + serverHost + "/"] }, (granted) => {
                if (granted) {
                    chrome.storage.local.set({ "setting-cookies-allowed": true }).then(() => {
                        console.log("Setting cookies allowed (saved successfully)")
                    })
                    chrome.cookies.set({
                        name: "url-shortener-token",
                        value: adminToken,
                        domain: serverHost,
                        path: "/",
                        httpOnly: true,
                        secure: true,
                        sameSite: "strict",
                        url: `https://${serverHost}/api/login`
                    }, (newCookie) => {
                        if (!newCookie) {
                            console.error("Setting login cookie failed!")
                        } else {
                            console.log("Login cookie set successfully :)")
                        }
                    })
                }
                event.submitter.removeAttribute("aria-busy")
                errMsg.innerHTML = "Success, you may close this window now!"
            })
        } else {
            event.submitter.removeAttribute("aria-busy")
            errMsg.innerHTML = await r.text()
        }
    }).catch((e) => {
        event.submitter.removeAttribute("aria-busy")
        errMsg.innerHTML = e.message
    })
}

let form = document.querySelector("form")
form?.addEventListener("submit", handleSubmit)