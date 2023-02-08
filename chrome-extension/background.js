chrome.storage.onChanged.addListener((changes, namespace) => {
    for (let [key, { oldValue, newValue }] of Object.entries(changes)) {
        console.log(
            `Storage key "${key}" in namespace "${namespace}" changed.`,
            `Old value was "${oldValue}", new value is "${newValue}".`
        )

        // check if plugin is completely configured
        /*if (key === "admin-token" || key === "server-host") {
            let adminToken = await chrome.storage.local.get("admin-token")
            let serverHost = await chrome.storage.local.get("server-host")
            if (adminToken && serverHost) {
                chrome.action.setPopup({ popup: "popup.html" })
            }
        }*/
    }
})