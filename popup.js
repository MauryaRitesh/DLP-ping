document.addEventListener("DOMContentLoaded", () => {
    const extensionInput = document.getElementById("extension-input");
    const websiteInput = document.getElementById("website-input");
    const extensionList = document.getElementById("extension-list");
    const websiteList = document.getElementById("website-list");
    const extensionToggle = document.getElementById("extension-toggle");
    const addExtensionButton = document.getElementById("add-extension");
    const addWebsiteButton = document.getElementById("add-website");

    chrome.storage.sync.get("rules", (data) => {
        const rules = data.rules || {
            blockedExtensions: [".pdf", ".docx", ".xls"],
            allowedWebsites: ["https://example.com"],
            enabled: true
        };

        populateExtensionList(rules.blockedExtensions);
        populateWebsiteList(rules.allowedWebsites);
        extensionToggle.checked = rules.enabled;

        addExtensionButton.addEventListener("click", () => {
            const newExtension = extensionInput.value.trim();
            if (newExtension && !rules.blockedExtensions.includes(newExtension)) {
                rules.blockedExtensions.push(newExtension);
                chrome.storage.sync.set({ rules }, () => {
                    populateExtensionList(rules.blockedExtensions);
                    extensionInput.value = ''; // Clear the input
                });
            }
        });

        addWebsiteButton.addEventListener("click", () => {
            const newWebsite = websiteInput.value.trim();
            if (newWebsite && !rules.allowedWebsites.includes(newWebsite)) {
                rules.allowedWebsites.push(newWebsite);
                chrome.storage.sync.set({ rules }, () => {
                    populateWebsiteList(rules.allowedWebsites);
                    websiteInput.value = ''; // Clear the input
                });
            }
        });

        extensionToggle.addEventListener("change", () => {
            rules.enabled = extensionToggle.checked;
            chrome.storage.sync.set({ rules });
        });

        function populateExtensionList(extensions) {
            extensionList.innerHTML = '';
            extensions.forEach((extension) => {
                const li = document.createElement("li");
                li.textContent = extension;
                const removeButton = document.createElement("button");
                removeButton.textContent = "Remove";
                removeButton.addEventListener("click", () => {
                    const index = rules.blockedExtensions.indexOf(extension);
                    if (index > -1) {
                        rules.blockedExtensions.splice(index, 1);
                        chrome.storage.sync.set({ rules }, () => {
                            populateExtensionList(rules.blockedExtensions);
                        });
                    }
                });
                li.appendChild(removeButton);
                extensionList.appendChild(li);
            });
        }

        function populateWebsiteList(websites) {
            websiteList.innerHTML = '';
            websites.forEach((website) => {
                const li = document.createElement("li");
                li.textContent = website;
                const removeButton = document.createElement("button");
                removeButton.textContent = "Remove";
                removeButton.addEventListener("click", () => {
                    const index = rules.allowedWebsites.indexOf(website);
                    if (index > -1) {
                        rules.allowedWebsites.splice(index, 1);
                        chrome.storage.sync.set({ rules }, () => {
                            populateWebsiteList(rules.allowedWebsites);
                        });
                    }
                });
                li.appendChild(removeButton);
                websiteList.appendChild(li);
            });
        }
    });
});
