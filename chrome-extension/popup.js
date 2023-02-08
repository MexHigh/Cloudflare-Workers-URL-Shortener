// get all required elements
let unconfiguredBanner = document.querySelector("#unconfiguredBanner")
let shortnameInput = document.querySelector("#shortname")
let submitButton = document.querySelector("#submit")
let toAdminPage = document.querySelector("#toAdminPage")
let form = document.querySelector("form")
let errMsg = document.querySelector("#errMsg")

// get option values from local storage
let storage = await chrome.storage.local.get(["server-host", "admin-token"])

async function handleSubmit(event) {
    event.preventDefault()

    event.submitter.setAttribute("aria-busy", "true")

    // get current URL
    let [tab] = await chrome.tabs.query({ active: true, lastFocusedWindow: true })
    let currentURL = tab.url

    fetch(`https://${storage["server-host"]}/api/shortlink`, {
        method: "POST",
        headers: {
            "x-api-key": storage["admin-token"]
        },
        body: JSON.stringify({
            "name": shortnameInput.value,
            "target": currentURL
        })
    }).then(async (r) => {
        event.submitter.removeAttribute("aria-busy")
        if (r.ok) {
            errMsg.innerHTML = `Success: <a target="_blank" href="https://${storage["server-host"]}/${shortnameInput.value}">s.leon.wtf/${shortnameInput.value}</a>`
        } else {
            errMsg.innerHTML = await r.text()
        }
    }).catch((e) => {
        event.submitter.removeAttribute("aria-busy")
        errMsg.innerHTML = e.message
    })
}

// show banner if extension is unconfigured
if (!storage["server-host"] || !storage["admin-token"]) {
    unconfiguredBanner.hidden = false
    shortnameInput.disabled = true
    submitButton.disabled = true

    // set click listener for option page link
    document.querySelector("#toOptionsPage")?.addEventListener("click", (event) => {
        event.preventDefault()
        chrome.runtime.openOptionsPage()
    })
} else {
    // set admin page link
    toAdminPage.href = `https://${storage["server-host"]}/admin`

    // add submit listener for adding shortlinks
    form?.addEventListener("submit", handleSubmit)
}