async function handleSubmit(event) {
    event.preventDefault()
    
    let shortname = document.querySelector("#shortname").value
    
    // get option values from local storage
    // TODO, redirect to option page, if any of them is null
    let serverHost = await chrome.storage.local.get(["server-host"])
    let authToken = await chrome.storage.local.get(["admin-token"])

    // get current URL
    let [tab] = await chrome.tabs.query({ active: true, lastFocusedWindow: true })
    let currentURL = tab.url

    fetch(`https://${serverHost}/api/shortlink`, {
        method: "POST",
        mode: "no-cors",
        headers: {
            "x-api-key": authToken
        },
        body: JSON.stringify({
            "name": shortname,
            "target": currentURL
        })
    }).then((r) => {
        if (r.ok) {
            console.log("ok")
        } else {
            console.log("not ok")
        }
    })
}

let form = document.querySelector("form")
form.addEventListener("submit", handleSubmit)