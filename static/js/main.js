document.addEventListener('DOMContentLoaded', () => {
    // Mode Switching
    const navQuick = document.getElementById('nav-quick');
    const navDeep = document.getElementById('nav-deep');
    const navRename = document.getElementById('nav-rename');

    const panelQuick = document.getElementById('panel-quick');
    const panelDeep = document.getElementById('panel-deep');
    const panelRename = document.getElementById('panel-rename');

    // Quick Clean Elements
    const folderListContainer = document.getElementById('folder-list');
    const cleanBtn = document.getElementById('clean-btn');
    const addFolderBtn = document.getElementById('add-folder-btn');

    // Deep Clean Elements
    const driveDropdown = document.getElementById('drive-dropdown');
    const driveCurrent = document.getElementById('drive-current');
    const driveOptions = document.getElementById('drive-options');
    const scanDriveBtn = document.getElementById('scan-drive-btn');
    const deepScanResults = document.getElementById('deep-scan-results');
    const deepCleanBtn = document.getElementById('deep-clean-btn');
    const deepStatsInfo = document.getElementById('deep-stats-info');
    const deepDrivePath = document.getElementById('deep-drive-path');

    // Bulk Rename Elements
    const renameSelectBtn = document.getElementById('rename-select-folder-btn');
    const renamePathText = document.getElementById('rename-selected-path');
    const renameBaseInput = document.getElementById('rename-base-name');
    const renameNoSpacesToggle = document.getElementById('rename-no-spaces');
    const renamePreviewText = document.getElementById('rename-preview');
    const renameExecuteBtn = document.getElementById('rename-execute-btn');

    // Common Overlays
    const progressOverlay = document.getElementById('progress-overlay');
    const resultOverlay = document.getElementById('result-overlay');
    const closeResultBtn = document.getElementById('close-result');

    const renameResultOverlay = document.getElementById('rename-result-overlay');
    const renameResultMessage = document.getElementById('rename-result-message');
    const closeRenameResultBtn = document.getElementById('close-rename-result');

    // Stats
    const statTotalFreed = document.getElementById('stat-total-freed');
    const statTotalCleans = document.getElementById('stat-total-cleans');
    const statTotalFiles = document.getElementById('stat-total-files');
    const statLastCleaned = document.getElementById('stat-last-cleaned');
    const statPotentialSavings = document.getElementById('stat-potential-savings');

    let quickFoldersData = [];
    let quickExpandedFolders = new Set();

    let deepScanData = [];
    let deepSelectedExts = new Set();
    let currentDeepDrive = "";

    let currentRenamePath = "";

    // Init
    async function init() {
        await fetchAnalytics();
        await fetchQuickFolders();
        await fetchDrives();
    }

    // --- Mode Switching ---
    const resetPanels = () => {
        [panelQuick, panelDeep, panelRename].forEach(p => p.style.display = 'none');
        [navQuick, navDeep, navRename].forEach(n => n.classList.remove('active'));
    };

    navQuick.onclick = () => {
        resetPanels();
        navQuick.classList.add('active');
        panelQuick.style.display = 'flex';
        updateGlobalCalculations();
    };

    navDeep.onclick = () => {
        resetPanels();
        navDeep.classList.add('active');
        panelDeep.style.display = 'flex';
        updateGlobalCalculations();
    };

    navRename.onclick = () => {
        resetPanels();
        navRename.classList.add('active');
        panelRename.style.display = 'flex';
        statPotentialSavings.textContent = "N/A";
    };

    // --- Bulk Rename ---
    renameSelectBtn.onclick = async () => {
        if (window.pywebview && window.pywebview.api) {
            const path = await window.pywebview.api.select_folder();
            if (path) {
                currentRenamePath = path;
                renamePathText.textContent = path;
                updateRenameExecuteBtn();
            }
        }
    };

    const updatePreview = () => {
        const val = renameBaseInput.value.trim() || "MyFile";
        const noSpaces = renameNoSpacesToggle.checked;
        if (noSpaces) {
            renamePreviewText.textContent = `${val}1.jpg`;
        } else {
            renamePreviewText.textContent = `${val} - 1.jpg`;
        }
        updateRenameExecuteBtn();
    };

    renameBaseInput.oninput = updatePreview;
    renameNoSpacesToggle.onchange = updatePreview;

    function updateRenameExecuteBtn() {
        renameExecuteBtn.disabled = !currentRenamePath || !renameBaseInput.value.trim();
    }

    renameExecuteBtn.onclick = async () => {
        progressOverlay.classList.add('active');
        document.getElementById('cleaning-status').textContent = "Renaming files...";

        try {
            const response = await fetch('/api/rename', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    folder: currentRenamePath,
                    base_name: renameBaseInput.value.trim(),
                    no_spaces: renameNoSpacesToggle.checked
                })
            });
            const result = await response.json();

            setTimeout(() => {
                progressOverlay.classList.remove('active');

                renameResultMessage.textContent = result.message;
                renameResultOverlay.classList.add('active');

                if (result.status === 'success') {
                    renameBaseInput.value = "";
                    currentRenamePath = "";
                    renamePathText.textContent = "No folder selected";
                    updateRenameExecuteBtn();
                }
            }, 800);
        } catch (e) {
            alert('Rename failed');
            progressOverlay.classList.remove('active');
        }
    };

    closeRenameResultBtn.onclick = () => {
        renameResultOverlay.classList.remove('active');
    };

    // --- Custom Dropdown Logic ---
    if (driveCurrent) {
        driveCurrent.onclick = () => {
            driveDropdown.classList.toggle('open');
        };
    }

    document.addEventListener('click', (e) => {
        if (driveDropdown && !driveDropdown.contains(e.target)) {
            driveDropdown.classList.remove('open');
        }
    });

    async function fetchDrives() {
        try {
            const response = await fetch('/api/drives');
            const drives = await response.json();
            if (!driveOptions) return;
            driveOptions.innerHTML = '';
            if (drives.length > 0) {
                setDrive(drives[0]);
                drives.forEach(drive => {
                    const div = document.createElement('div');
                    div.className = 'dropdown-option';
                    div.textContent = `Drive ${drive}`;
                    div.onclick = () => {
                        setDrive(drive);
                        driveDropdown.classList.remove('open');
                    };
                    driveOptions.appendChild(div);
                });
            }
        } catch (e) { console.error(e); }
    }

    function setDrive(drive) {
        currentDeepDrive = drive;
        if (driveCurrent) driveCurrent.textContent = `Drive ${drive}`;
    }

    if (scanDriveBtn) {
        scanDriveBtn.onclick = async () => {
            if (!currentDeepDrive) return;
            progressOverlay.classList.add('active');
            document.getElementById('cleaning-status').textContent = `Analyzing ${currentDeepDrive}...`;
            try {
                const response = await fetch('/api/deep-scan', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ drive: currentDeepDrive })
                });
                const result = await response.json();
                deepScanData = result.extensions;
                deepSelectedExts = new Set();
                progressOverlay.classList.remove('active');
                deepStatsInfo.style.display = 'block';
                deepDrivePath.textContent = currentDeepDrive + " Root Search";
                renderDeepResults();
                updateGlobalCalculations();
            } catch (e) {
                alert('Scan failed');
                progressOverlay.classList.remove('active');
            }
        };
    }

    function renderDeepResults() {
        if (!deepScanResults) return;
        deepScanResults.innerHTML = '';
        if (deepScanData.length === 0) {
            deepScanResults.innerHTML = '<div style="text-align: center; padding: 100px; opacity: 0.3;">No deletable files found.</div>';
            return;
        }
        const grid = document.createElement('div');
        grid.className = 'extension-grid';
        grid.style.display = 'grid';
        deepScanData.forEach(info => {
            const isSelected = deepSelectedExts.has(info.ext);
            const item = document.createElement('div');
            item.className = `ext-item ${isSelected ? '' : 'disabled'}`;
            item.innerHTML = `
                <div class="ext-info">
                    <span class="ext-dot">${info.ext}</span>
                    <span class="ext-size">${info.size_str}</span>
                </div>
                <span style="opacity: 0.5;">${isSelected ? '✔' : ''}</span>
            `;
            item.onclick = () => {
                if (deepSelectedExts.has(info.ext)) deepSelectedExts.delete(info.ext);
                else deepSelectedExts.add(info.ext);
                renderDeepResults();
                updateGlobalCalculations();
            };
            grid.appendChild(item);
        });
        deepScanResults.appendChild(grid);
    }

    // --- Quick Clean Logic ---
    async function fetchQuickFolders() {
        try {
            const response = await fetch('/api/folders');
            quickFoldersData = await response.json();
            quickFoldersData.forEach(folder => {
                if (!folder.hasOwnProperty('selected_exts')) folder.selected_exts = folder.extensions.map(e => e.ext);
                if (!folder.hasOwnProperty('active')) folder.active = true;
            });
            renderQuickFolders();
            updateGlobalCalculations();
        } catch (e) { console.error(e); }
    }

    function renderQuickFolders() {
        if (!folderListContainer) return;
        folderListContainer.innerHTML = '';
        quickFoldersData.forEach((folder, idx) => {
            const item = document.createElement('div');
            const isExpanded = quickExpandedFolders.has(idx);
            item.className = `folder-item ${isExpanded ? 'expanded' : ''}`;
            let currentFolderSelectedSize = 0;
            if (folder.path !== "RECYCLE_BIN") {
                folder.extensions.forEach(extInfo => {
                    if (folder.selected_exts.includes(extInfo.ext)) currentFolderSelectedSize += extInfo.size;
                });
            }
            const displaySizeStr = folder.path === "RECYCLE_BIN" ? folder.size_str : formatSize(currentFolderSelectedSize);
            const header = document.createElement('div');
            header.className = 'folder-header';
            header.onclick = () => {
                if (quickExpandedFolders.has(idx)) quickExpandedFolders.delete(idx);
                else quickExpandedFolders.add(idx);
                renderQuickFolders();
            };
            header.innerHTML = `
                <div class="folder-summary">
                    <span class="folder-name">${folder.name}</span>
                    <span class="folder-path">${folder.path}</span>
                </div>
                <div class="folder-meta">
                    <span class="folder-size-badge" style="${currentFolderSelectedSize === 0 && folder.path !== 'RECYCLE_BIN' ? 'opacity: 0.3;' : ''}">${displaySizeStr}</span>
                    <label class="checkbox-custom" onclick="event.stopPropagation()">
                        <input type="checkbox" ${folder.active ? 'checked' : ''} onchange="window.toggleQuickFolder(${idx})">
                        <span class="checkmark"></span>
                    </label>
                    ${folder.is_custom ? `<button class="btn-icon" onclick="event.stopPropagation(); window.removeQuickTarget('${folder.path}')">🗑️</button>` : '<div style="width: 20px;"></div>'}
                </div>
            `;
            const grid = document.createElement('div');
            grid.className = 'extension-grid';
            if (folder.extensions.length === 0) grid.innerHTML = '<div style="grid-column: 1/-1; opacity: 0.4; font-size: 0.8rem; text-align: center; padding: 20px;">No files found.</div>';
            else {
                folder.extensions.forEach(extInfo => {
                    const isSelected = folder.selected_exts.includes(extInfo.ext);
                    const extBtn = document.createElement('div');
                    extBtn.className = `ext-item ${isSelected ? '' : 'disabled'}`;
                    extBtn.innerHTML = `
                        <div class="ext-info"><span class="ext-dot">${extInfo.ext}</span><span class="ext-size">${extInfo.size_str}</span></div>
                        <span style="opacity: 0.5;">${isSelected ? '✔' : ''}</span>
                    `;
                    extBtn.onclick = (e) => { e.stopPropagation(); window.toggleQuickExt(idx, extInfo.ext); };
                    grid.appendChild(extBtn);
                });
            }
            item.appendChild(header);
            item.appendChild(grid);
            folderListContainer.appendChild(item);
        });
    }

    window.toggleQuickFolder = (idx) => {
        quickFoldersData[idx].active = !quickFoldersData[idx].active;
        renderQuickFolders();
        updateGlobalCalculations();
    };

    window.toggleQuickExt = (folderIdx, ext) => {
        const folder = quickFoldersData[folderIdx];
        folder.selected_exts = folder.selected_exts.includes(ext) ? folder.selected_exts.filter(e => e !== ext) : [...folder.selected_exts, ext];
        renderQuickFolders();
        updateGlobalCalculations();
    };

    window.removeQuickTarget = async (path) => {
        if (confirm('Stop monitoring this folder?')) {
            await fetch('/api/folders/remove', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ path }) });
            fetchQuickFolders();
        }
    };

    function updateGlobalCalculations() {
        let totalBytes = 0;
        const isQuick = navQuick && navQuick.classList.contains('active');
        const isDeep = navDeep && navDeep.classList.contains('active');

        if (isDeep) {
            deepScanData.forEach(info => { if (deepSelectedExts.has(info.ext)) totalBytes += info.size; });
            if (deepCleanBtn) deepCleanBtn.disabled = totalBytes === 0;
            if (statPotentialSavings) statPotentialSavings.textContent = formatSize(totalBytes);
        } else if (isQuick) {
            quickFoldersData.forEach(folder => {
                if (folder.active) folder.extensions.forEach(extInfo => { if (folder.selected_exts.includes(extInfo.ext)) totalBytes += extInfo.size; });
            });
            if (cleanBtn) {
                cleanBtn.disabled = totalBytes === 0 && !quickFoldersData.some(f => f.active && f.path === "RECYCLE_BIN");
                if (quickFoldersData.some(f => f.active && f.path === "RECYCLE_BIN")) cleanBtn.disabled = false;
            }
            if (statPotentialSavings) statPotentialSavings.textContent = formatSize(totalBytes);
        }
    }

    async function handleClean(isDeep = false) {
        let targets = isDeep ? [{ path: currentDeepDrive, allowed_exts: Array.from(deepSelectedExts) }] :
            quickFoldersData.filter(f => f.active && (f.selected_exts.length > 0 || f.path === "RECYCLE_BIN")).map(f => ({ path: f.path, allowed_exts: f.selected_exts }));

        if (targets.length === 0) return;
        progressOverlay.classList.add('active');
        document.getElementById('cleaning-status').textContent = isDeep ? "Deep cleaning drive..." : "Sweeping system folders...";
        try {
            const response = await fetch('/api/clean', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ targets }) });
            const result = await response.json();
            setTimeout(() => {
                progressOverlay.classList.remove('active');
                document.getElementById('res-space').textContent = result.freed_str;
                document.getElementById('res-files').textContent = result.deleted_count;
                resultOverlay.classList.add('active');
            }, 1200);
        } catch (error) {
            alert('Cleanup failed');
            progressOverlay.classList.remove('active');
        }
    }

    if (cleanBtn) cleanBtn.onclick = () => handleClean(false);
    if (deepCleanBtn) deepCleanBtn.onclick = () => handleClean(true);
    if (closeResultBtn) closeResultBtn.onclick = () => { resultOverlay.classList.remove('active'); statPotentialSavings.textContent = "0 B"; init(); };

    async function fetchAnalytics() {
        try {
            const response = await fetch('/api/analytics');
            const data = await response.json();
            statTotalFreed.textContent = data.total_freed_str; statTotalCleans.textContent = data.total_cleans; statTotalFiles.textContent = data.total_files;
            if (data.last_cleaned !== "Never") { const date = new Date(data.last_cleaned + "Z"); statLastCleaned.textContent = date.toLocaleString(); }
        } catch (e) { console.error(e); }
    }

    function formatSize(bytes) {
        if (bytes === 0) return '0 B';
        const units = ['B', 'KB', 'MB', 'GB', 'TB'];
        let i = 0; let b = bytes;
        while (b >= 1024 && i < units.length - 1) { b /= 1024; i++; }
        return `${b.toFixed(2)} ${units[i]}`;
    }

    if (addFolderBtn) {
        addFolderBtn.onclick = async () => {
            if (window.pywebview && window.pywebview.api) {
                const path = await window.pywebview.api.select_folder();
                if (path) {
                    await fetch('/api/folders/add', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ path }) });
                    fetchQuickFolders();
                }
            }
        };
    }

    init();
});
