function handleSubmit(event) {
    event.preventDefault()

    event.submitter.setAttribute("aria-busy", "true")
    
    let serverHost = document.querySelector("#server-host").value
    let adminToken = document.querySelector("#admin-token").value

    // check token
    fetch(`https://${serverHost}/api/login`, {
        method: "GET",
        mode: "no-cors",
        headers: {
            "x-api-key": adminToken
        }
    }).then((r) => {
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
        } else {
            console.log("Wrong credentials")
            // TODO richtige GUI dafür machen
        }
    })
}

let form = document.querySelector("form")
form.addEventListener("submit", handleSubmit)