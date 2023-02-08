async function handleSubmit(event) {
    event.preventDefault()
    
    let shortname = document.querySelector("#shortname")?.value
    
    // get option values from local storage
    // TODO, redirect to option page, if any of them is null
    let storage = await chrome.storage.local.get(["server-host", "admin-token"])

    // get current URL
    let [tab] = await chrome.tabs.query({ active: true, lastFocusedWindow: true })
    let currentURL = tab.url

    fetch(`https://${storage["server-host"]}/api/shortlink`, {
        method: "POST",
        headers: {
            "x-api-key": storage["admin-token"]
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
form?.addEventListener("submit", handleSubmit)