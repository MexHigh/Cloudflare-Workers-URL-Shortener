chrome.runtime.onStartup.addListener(async () => {
    let storage = await chrome.storage.local.get(["server-host", "admin-token", "setting-cookies-allowed"])
    if (storage["setting-cookies-allowed"]) {
        chrome.cookies.set({
            name: "url-shortener-token",
            value: storage["admin-token"],
            domain: storage["server-host"],
            path: "/",
            httpOnly: true,
            secure: true,
            sameSite: "strict",
            url: `https://${storage["server-host"]}/api/login`
        }, (newCookie) => {
            if (!newCookie) {
                console.error("Setting login cookie failed!")
            } else {
                console.log("Login cookie set successfully :)")
            }
        })
    }
})