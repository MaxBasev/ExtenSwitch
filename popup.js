document.addEventListener('DOMContentLoaded', () => {
	// Get references to DOM elements
	const extensionsList = document.getElementById('extensions-list');
	const searchInput = document.getElementById('search-input');
	const filterTabs = document.querySelectorAll('.filter-tab');
	const aboutBtn = document.getElementById('about-btn');
	const profilesBtn = document.getElementById('profiles-btn');

	// Store all extensions list and current filter values
	let allExtensions = [];
	let currentSearchQuery = '';
	let currentFilter = 'enabled';

	// Function to show notification
	const showNotification = (message) => {
		// Create notification element if it doesn't exist
		let notification = document.querySelector('.notification');
		if (!notification) {
			notification = document.createElement('div');
			notification.className = 'notification';
			document.querySelector('.container').appendChild(notification);
		}

		// Set message and show notification
		notification.textContent = message;
		notification.classList.add('show');

		// Hide notification after 3 seconds
		setTimeout(() => {
			notification.classList.remove('show');
		}, 3000);
	};

	// Function to show info message about deprecated Chrome Apps
	const showDeprecatedAppsInfo = () => {
		// Check if we've already shown this message
		chrome.storage.local.get(['deprecatedInfoShown'], (result) => {
			if (!result.deprecatedInfoShown) {
				// Create info message container
				const infoContainer = document.createElement('div');
				infoContainer.className = 'info-container';

				infoContainer.innerHTML = `
					<div class="info-header">
						<span class="info-icon">ⓘ</span>
						<h3>Important Information</h3>
						<button class="info-close-btn">×</button>
					</div>
					<div class="info-content">
						<p>Some Chrome Apps shown in this list may appear as deprecated and cannot be launched on Windows, Mac, or Linux.</p>
						<p>Google has phased out support for Chrome Apps on these platforms. These apps will still appear in your list until they are uninstalled or removed from Chrome's store.</p>
						<p><a href="https://support.google.com/chrome/?p=chrome_app_deprecation" target="_blank">Learn more</a></p>
					</div>
				`;

				// Insert at the beginning of the container
				const container = document.querySelector('.container');
				container.insertBefore(infoContainer, container.firstChild);

				// Add close button handler
				const closeBtn = infoContainer.querySelector('.info-close-btn');
				closeBtn.addEventListener('click', () => {
					infoContainer.classList.add('closing');

					// Remove after animation completes
					setTimeout(() => {
						infoContainer.remove();
					}, 300);

					// Save that we've shown the message
					chrome.storage.local.set({ deprecatedInfoShown: true });
				});
			}
		});
	};

	// Function to load and display extensions
	const loadExtensions = () => {
		chrome.management.getAll(extensions => {
			// Filter out current extension and deprecated Chrome Apps
			const currentExtensionId = chrome.runtime.id;
			allExtensions = extensions.filter(ext => {
				// Skip current extension
				if (ext.id === currentExtensionId) return false;

				// Skip deprecated Chrome Apps that are not actually installed
				// or are system apps that user cannot interact with
				if (
					(ext.type === 'hosted_app' || ext.type === 'packaged_app' || ext.type === 'legacy_packaged_app') &&
					(!ext.mayDisable || ext.installType === 'admin' || ext.installType === 'sideload')
				) {
					return false;
				}

				// Include all other extensions
				return true;
			});

			// Sort extensions: enabled first, then alphabetically
			allExtensions = allExtensions.sort((a, b) => {
				if (a.enabled !== b.enabled) {
					return b.enabled - a.enabled;
				}
				return a.name.localeCompare(b.name);
			});

			// Check if there are any Chrome Apps in the list
			const hasDeprecatedApps = allExtensions.some(ext =>
				ext.type === 'hosted_app' || ext.type === 'packaged_app' || ext.type === 'legacy_packaged_app'
			);

			// If we have Chrome Apps, show the info message
			if (hasDeprecatedApps) {
				showDeprecatedAppsInfo();
			}

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
			const canLaunch = extension.enabled &&
				// Check if it's not a known deprecated Chrome App
				(extension.id !== "lbfehkoinhhcknnbdgnnmjhiladcgbol" && extension.id !== "mgndgikekgjfcpckkfioiadnlibdjbkf") &&
				// Check if it's a launchable type
				(extension.type === 'hosted_app' || extension.type === 'packaged_app' || extension.type === 'legacy_packaged_app' || extension.homepageUrl);

			// Check if we should show store button (has public Chrome Web Store URL)
			const hasStoreUrl = extension.homepageUrl &&
				(extension.homepageUrl.includes('chrome.google.com/webstore') ||
					extension.homepageUrl.includes('chromewebstore.google.com'));

			// Check if it's a deprecated Chrome App
			const isDeprecatedApp = (extension.type === 'hosted_app' || extension.type === 'packaged_app' || extension.type === 'legacy_packaged_app');

			extensionElement.innerHTML = `
        <img class="extension-icon" src="${iconUrl}" alt="${extension.name}">
        <div class="extension-info">
          <div class="extension-name">
            ${extension.name}
            ${isDeprecatedApp ? '<span class="deprecated-label">DEPRECATED</span>' : ''}
          </div>
        </div>
        <div class="extension-actions">
          ${hasStoreUrl ? `<button class="launch-btn" title="View in Chrome Web Store">▶</button>` : ''}
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

			// Add handler for store button
			if (hasStoreUrl) {
				const launchBtn = extensionElement.querySelector('.launch-btn');
				launchBtn.addEventListener('click', () => {
					// Open the Chrome Web Store page for this extension
					chrome.tabs.create({ url: extension.homepageUrl });
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

	// Function to show about dialog
	const showAboutDialog = () => {
		// Create about dialog if it doesn't exist
		let aboutDialog = document.querySelector('.about-dialog:not(.profiles-dialog)');
		if (!aboutDialog) {
			aboutDialog = document.createElement('div');
			aboutDialog.className = 'about-dialog';

			aboutDialog.innerHTML = `
				<div class="dialog-content">
					<h2 class="dialog-title">About</h2>
					<p class="about-version">Version ${chrome.runtime.getManifest().version}</p>
					<p class="about-description">
						Toggle your Chrome extensions with one click. Fast, clean, and ideal for switching between multiple wallets or decluttering your toolbar.
					</p>
					<div class="about-links">
						<a href="https://chromewebstore.google.com/detail/pkgomffofapfpgmebfcdjnchjleflpcn?utm_source=item-share-cb" target="_blank"><i class="icon-store"></i>Chrome Web Store</a>
						<a href="https://maxbasev.com" target="_blank"><i class="icon-blog"></i>Blog</a>
						<a href="https://www.instagram.com/maxbasev" target="_blank"><i class="icon-instagram"></i>Instagram</a>
						<a href="https://twitter.com/maxbasev" target="_blank"><i class="icon-twitter"></i>Twitter</a>
						<a href="https://github.com/maxbasev" target="_blank"><i class="icon-github"></i>GitHub</a>
						<a href="https://www.fiverr.com/maxbasev" target="_blank"><i class="icon-fiverr"></i>Fiverr</a>
					</div>
					<p class="copyright">© 2025 MaxBasev</p>
				</div>
			`;

			document.querySelector('.container').appendChild(aboutDialog);

			// Add close button handler when clicking outside
			aboutDialog.addEventListener('click', (e) => {
				if (e.target === aboutDialog) {
					aboutDialog.classList.remove('show');
				}
			});
		}

		// Show the dialog
		aboutDialog.classList.add('show');
	};

	// Add click handler for about button
	if (aboutBtn) {
		aboutBtn.addEventListener('click', showAboutDialog);
	}

	// --- Profiles Logic ---

	// Function to load profiles from storage
	const getProfiles = (callback) => {
		chrome.storage.local.get(['ext_profiles'], (result) => {
			callback(result.ext_profiles || []);
		});
	};

	// Function to save profile
	const saveProfile = (name) => {
		if (!name || !name.trim()) return;

		// Get all currently enabled extensions
		const enabledExtensions = allExtensions
			.filter(ext => ext.enabled)
			.map(ext => ext.id);

		getProfiles((profiles) => {
			// Check if name exists
			const existingIndex = profiles.findIndex(p => p.name.toLowerCase() === name.toLowerCase());

			const newProfile = {
				name: name.trim(),
				extensions: enabledExtensions,
				timestamp: Date.now(),
				count: enabledExtensions.length
			};

			let updatedProfiles;
			if (existingIndex >= 0) {
				// Update existing
				updatedProfiles = [...profiles];
				updatedProfiles[existingIndex] = newProfile;
			} else {
				// Add new
				updatedProfiles = [...profiles, newProfile];
			}

			// Save to storage
			chrome.storage.local.set({ ext_profiles: updatedProfiles }, () => {
				showNotification(`Profile "${newProfile.name}" saved!`);
				renderProfilesList();
				// Clear input
				const input = document.getElementById('new-profile-name');
				if (input) input.value = '';
			});
		});
	};

	// Function to delete profile
	const deleteProfile = (name) => {
		getProfiles((profiles) => {
			const updatedProfiles = profiles.filter(p => p.name !== name);
			chrome.storage.local.set({ ext_profiles: updatedProfiles }, () => {
				renderProfilesList();
			});
		});
	};

	// Function to apply profile
	const applyProfile = (profile) => {
		const targetIds = new Set(profile.extensions);
		let changedCount = 0;

		allExtensions.forEach(ext => {
			const shouldBeEnabled = targetIds.has(ext.id);

			if (ext.enabled !== shouldBeEnabled) {
				// Only change if different
				chrome.management.setEnabled(ext.id, shouldBeEnabled);
				changedCount++;
			}
		});

		showNotification(`Profile "${profile.name}" applied!`);

		// Close dialog
		const dialog = document.querySelector('.profiles-dialog');
		if (dialog) dialog.classList.remove('show');
	};

	// Function to render profiles list in dialog
	const renderProfilesList = () => {
		const listContainer = document.querySelector('.profiles-list');
		if (!listContainer) return;

		getProfiles((profiles) => {
			listContainer.innerHTML = '';

			if (profiles.length === 0) {
				listContainer.innerHTML = '<div class="empty-profiles">No profiles saved yet. <br>Create one to save current state.</div>';
				return;
			}

			// Sort by newest first
			profiles.sort((a, b) => b.timestamp - a.timestamp).forEach(profile => {
				const item = document.createElement('div');
				item.className = 'profile-item';
				item.innerHTML = `
					<div class="profile-name" title="${profile.name}">${profile.name} (${profile.count} est.)</div>
					<div class="profile-actions">
						<button class="profile-btn btn-apply" title="Apply this profile">Apply</button>
						<button class="profile-btn btn-delete" title="Delete profile">✕</button>
					</div>
				`;

				// Handlers
				item.querySelector('.btn-apply').addEventListener('click', () => applyProfile(profile));
				item.querySelector('.btn-delete').addEventListener('click', () => {
					if (confirm(`Delete profile "${profile.name}"?`)) {
						deleteProfile(profile.name);
					}
				});

				listContainer.appendChild(item);
			});
		});
	};

	// Function to show profiles dialog
	const showProfilesDialog = () => {
		let profilesDialog = document.querySelector('.profiles-dialog');

		if (!profilesDialog) {
			profilesDialog = document.createElement('div');
			profilesDialog.className = 'about-dialog profiles-dialog'; // Reuse about-dialog styles for modal

			profilesDialog.innerHTML = `
				<div class="dialog-content">
					<h2 class="dialog-title">Profiles</h2>
					<p class="about-version">Save current state as a snapshot</p>

					<div class="profiles-list">
						<!-- Profiles will be injected here -->
					</div>

					<div class="create-profile-form">
						<input type="text" id="new-profile-name" class="create-profile-input" placeholder="Profile name (e.g. Work)">
						<button id="create-profile-btn" class="btn-create">Save</button>
					</div>
				</div>
			`;

			document.querySelector('.container').appendChild(profilesDialog);

			// Close on backdrop click
			profilesDialog.addEventListener('click', (e) => {
				if (e.target === profilesDialog) {
					profilesDialog.classList.remove('show');
				}
			});

			// Create handler
			const createBtn = profilesDialog.querySelector('#create-profile-btn');
			const input = profilesDialog.querySelector('#new-profile-name');

			const handleCreate = () => {
				const name = input.value;
				if (name) saveProfile(name);
			};

			createBtn.addEventListener('click', handleCreate);
			input.addEventListener('keypress', (e) => {
				if (e.key === 'Enter') handleCreate();
			});
		}

		// Update list and show
		renderProfilesList();
		profilesDialog.classList.add('show');
	};

	// Add click handler for profiles button
	if (profilesBtn) {
		profilesBtn.addEventListener('click', showProfilesDialog);
	}
}); 