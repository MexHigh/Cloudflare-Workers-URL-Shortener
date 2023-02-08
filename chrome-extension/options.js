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

            event.submitter.removeAttribute("aria-busy")
            errMsg.innerHTML = "Success, you may close this window now!"
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