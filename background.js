// Background service worker for Extensions Manager
// Future functionality can be added here,
// such as settings storage or notification handling

chrome.runtime.onInstalled.addListener(() => {
	console.log('Extensions Manager installed and ready to use!');
}); 