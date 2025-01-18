let rules = {
    blockedExtensions: [".pdf", ".docx"],
    allowedWebsites: ["https://www.google.com/"] 
};

chrome.runtime.onInstalled.addListener(() => {
    console.log("Extension installed");
    chrome.storage.sync.get("rules", (data) => {
        if (data.rules) {
            rules = data.rules;
            console.log("Rules loaded from storage:", rules);
        } else {
            console.log("No rules found. Using default rules.");
            chrome.storage.sync.set({ rules });
        }
    });
});

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.type === "updateRules") {
        rules = message.rules;
        chrome.storage.sync.set({ rules }, () => {
            console.log("Rules updated:", rules);
            sendResponse({ success: true });
        });
        return true; 
    }
});

chrome.downloads.onDeterminingFilename.addListener((item, suggest) => {
    const fileExtension = `.${item.filename.split(".").pop()}`; // Extract file extension
    const isBlockedExtension = rules.blockedExtensions.includes(fileExtension);
    const isUnapprovedWebsite = !rules.allowedWebsites.some((site) =>
        item.referrer && item.referrer.startsWith(site)
    );

    console.log("Download detected:", item);
    console.log("Blocked Extension:", isBlockedExtension, "Unapproved Website:", isUnapprovedWebsite);

    if (isBlockedExtension && isUnapprovedWebsite) {
        chrome.notifications.create({
            type: "basic",
            iconUrl: "icons/icon128.png",
            title: "Download Blocked",
            message: `The file "${item.filename}" cannot be downloaded on this website.`,
        });

        chrome.downloads.cancel(item.id, () => {
            if (chrome.runtime.lastError) {
                console.error("Error canceling download:", chrome.runtime.lastError);
            }
        });
    } else {
        suggest(); 
    }
});

chrome.webRequest.onBeforeRequest.addListener(
    (details) => {
        const isUnapprovedWebsite = !rules.allowedWebsites.some(
            (site) => details.initiator && details.initiator.startsWith(site)
        );

        console.log("Upload detected:", details);
        console.log("Is upload on unapproved website?", isUnapprovedWebsite);

        if (isUnapprovedWebsite) {
            chrome.notifications.create({
                type: "basic",
                iconUrl: "icons/icon128.png",
                title: "Upload Blocked",
                message: "File uploads are not allowed on this website.",
            });
            return { cancel: true };
        }
    },
    { urls: ["<all_urls>"], types: ["xmlhttprequest"] }, 
    ["blocking"]
);

chrome.runtime.onStartup.addListener(() => {
    console.log("Extension started");
});

console.log("Service Worker loaded successfully.");
