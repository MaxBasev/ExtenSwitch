// Background service worker for ExtenSwitch
// Future functionality can be added here,
// such as settings storage or notification handling

chrome.runtime.onInstalled.addListener(() => {
	console.log('ExtenSwitch installed and ready to use!');
}); 