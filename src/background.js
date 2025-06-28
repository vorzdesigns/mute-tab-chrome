'use strict'
let stateAllTabs = false;

chrome.commands.onCommand.addListener(async (command) => {
	try {
		switch (command) {
			case "mute_tab_current":
				const [currentTab] = await chrome.tabs.query({ active: true, currentWindow: true });
				if (currentTab) {
					await chrome.tabs.update(currentTab.id, { muted: !currentTab.mutedInfo.muted });
				}
				break;

			case "mute_tab_all":
				stateAllTabs = !stateAllTabs;
				const windows = await chrome.windows.getAll({ populate: true });
				for (const window of windows) {
					for (const tab of window.tabs) {
						if (tab.audible || tab.mutedInfo.muted) {
							await chrome.tabs.update(tab.id, { muted: stateAllTabs });
						}
					}
				}
				break;

			case "mute_tab_all_except_current":
				const [activeTab] = await chrome.tabs.query({ active: true, currentWindow: true });
				const allWindows = await chrome.windows.getAll({ populate: true });
				
				for (const window of allWindows) {
					for (const tab of window.tabs) {
						if (tab.audible) {
							await chrome.tabs.update(tab.id, { muted: true });
						}
					}
				}
				
				if (activeTab) {
					await chrome.tabs.update(activeTab.id, { muted: false });
				}
				break;

			default:
				break;
		}
	} catch (error) {
		console.error('Error in command handler:', error);
	}
});
