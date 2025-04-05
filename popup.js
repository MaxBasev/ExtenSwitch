document.addEventListener('DOMContentLoaded', () => {
	// Get references to DOM elements
	const extensionsList = document.getElementById('extensions-list');
	const searchInput = document.getElementById('search-input');
	const filterTabs = document.querySelectorAll('.filter-tab');

	// Store all extensions list and current filter values
	let allExtensions = [];
	let currentSearchQuery = '';
	let currentFilter = 'all';

	// Function to load and display extensions
	const loadExtensions = () => {
		chrome.management.getAll(extensions => {
			// Filter out current extension
			const currentExtensionId = chrome.runtime.id;
			allExtensions = extensions.filter(ext => ext.id !== currentExtensionId);

			// Sort extensions: enabled first, then alphabetically
			allExtensions = allExtensions.sort((a, b) => {
				if (a.enabled !== b.enabled) {
					return b.enabled - a.enabled;
				}
				return a.name.localeCompare(b.name);
			});

			// Update filter counts
			updateFilterCounts();

			// Display extensions with current filters applied
			filterExtensions();
		});
	};

	// Function to update filter counts
	const updateFilterCounts = () => {
		// Count enabled and disabled extensions
		const enabledCount = allExtensions.filter(ext => ext.enabled).length;
		const disabledCount = allExtensions.length - enabledCount;

		// Update text in filters
		filterTabs.forEach(tab => {
			const filter = tab.dataset.filter;
			const countSpan = tab.querySelector('.count') || document.createElement('span');
			countSpan.className = 'count';

			switch (filter) {
				case 'all':
					countSpan.textContent = allExtensions.length;
					break;
				case 'enabled':
					countSpan.textContent = enabledCount;
					break;
				case 'disabled':
					countSpan.textContent = disabledCount;
					break;
			}

			if (!tab.querySelector('.count')) {
				tab.appendChild(countSpan);
			}
		});
	};

	// Function to render extensions list
	const renderExtensions = (extensions) => {
		// Clear current list
		extensionsList.innerHTML = '';

		if (extensions.length === 0) {
			const emptyMessage = document.createElement('div');
			emptyMessage.className = 'empty-message';
			emptyMessage.textContent = 'No extensions found';
			extensionsList.appendChild(emptyMessage);
			return;
		}

		extensions.forEach(extension => {
			// Create element for extension
			const extensionElement = document.createElement('div');
			extensionElement.className = 'extension-item';

			// Add icon
			const iconUrl = extension.icons ?
				extension.icons[extension.icons.length - 1].url :
				'images/default-icon.png';

			// Check if extension can be launched
			const canLaunch = extension.enabled && (extension.type === 'hosted_app' || extension.type === 'packaged_app' || extension.type === 'legacy_packaged_app' || extension.homepageUrl);

			extensionElement.innerHTML = `
        <img class="extension-icon" src="${iconUrl}" alt="${extension.name}">
        <div class="extension-info">
          <div class="extension-name">${extension.name}</div>
          <div class="extension-id">${extension.id}</div>
        </div>
        <div class="extension-actions">
          ${canLaunch ? `<button class="launch-btn" title="Launch extension">▶</button>` : ''}
          <label class="extension-toggle">
            <input type="checkbox" ${extension.enabled ? 'checked' : ''} data-id="${extension.id}">
            <span class="slider"></span>
          </label>
        </div>
      `;

			// Add handler for toggle
			const toggleInput = extensionElement.querySelector('input[type="checkbox"]');
			toggleInput.addEventListener('change', (e) => {
				const extensionId = e.target.dataset.id;
				const enabled = e.target.checked;

				// Enable or disable extension
				chrome.management.setEnabled(extensionId, enabled);
			});

			// Add click handler for opening extension settings
			const extensionInfo = extensionElement.querySelector('.extension-info');
			extensionInfo.addEventListener('click', () => {
				// Check if extension has options page
				if (extension.optionsUrl) {
					chrome.tabs.create({ url: extension.optionsUrl });
				} else {
					// If no options page, open extension management page
					chrome.tabs.create({ url: `chrome://extensions/?id=${extension.id}` });
				}
			});

			// Add class to show that it's clickable for settings
			if (extension.optionsUrl) {
				extensionInfo.classList.add('has-options');
				extensionInfo.title = 'Open extension settings';
			} else {
				extensionInfo.title = 'Open extension management page';
			}

			// Add handler for launch button
			if (canLaunch) {
				const launchBtn = extensionElement.querySelector('.launch-btn');
				launchBtn.addEventListener('click', () => {
					// Try to launch extension based on its type
					if (extension.type === 'hosted_app' || extension.type === 'packaged_app' || extension.type === 'legacy_packaged_app') {
						chrome.management.launchApp(extension.id);
					} else if (extension.homepageUrl) {
						chrome.tabs.create({ url: extension.homepageUrl });
					}
				});
			}

			// Add element to list
			extensionsList.appendChild(extensionElement);
		});
	};

	// Function to filter extensions by search query and category
	const filterExtensions = () => {
		let filteredExtensions = [...allExtensions];

		// Apply category filter
		if (currentFilter !== 'all') {
			const isEnabled = currentFilter === 'enabled';
			filteredExtensions = filteredExtensions.filter(ext => ext.enabled === isEnabled);
		}

		// Apply search query
		if (currentSearchQuery) {
			const lowerQuery = currentSearchQuery.toLowerCase();
			filteredExtensions = filteredExtensions.filter(ext =>
				ext.name.toLowerCase().includes(lowerQuery)
			);
		}

		// Display filtered extensions
		renderExtensions(filteredExtensions);
	};

	// Handler for search event
	searchInput.addEventListener('input', (e) => {
		currentSearchQuery = e.target.value;
		filterExtensions();
	});

	// Handler for filter tabs
	filterTabs.forEach(tab => {
		tab.addEventListener('click', () => {
			// Remove active class from all tabs
			filterTabs.forEach(t => t.classList.remove('active'));

			// Add active class to current tab
			tab.classList.add('active');

			// Set current filter
			currentFilter = tab.dataset.filter;

			// Apply filters
			filterExtensions();
		});
	});

	// Handler to update list when extension state changes
	chrome.management.onEnabled.addListener(loadExtensions);
	chrome.management.onDisabled.addListener(loadExtensions);
	chrome.management.onInstalled.addListener(loadExtensions);
	chrome.management.onUninstalled.addListener(loadExtensions);

	// Initialize: load extensions when popup opens
	loadExtensions();
}); 