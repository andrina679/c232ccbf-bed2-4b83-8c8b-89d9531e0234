// Cookie management functions
function setCookie(name, value, days = 365) {
    const date = new Date();
    date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
    const expires = "expires=" + date.toUTCString();
    document.cookie = name + "=" + encodeURIComponent(value) + ";" + expires + ";path=/";
}

function getCookie(name) {
    const nameEQ = name + "=";
    const ca = document.cookie.split(';');
    for (let i = 0; i < ca.length; i++) {
        let c = ca[i];
        while (c.charAt(0) === ' ') c = c.substring(1, c.length);
        if (c.indexOf(nameEQ) === 0) {
            return decodeURIComponent(c.substring(nameEQ.length, c.length));
        }
    }
    return null;
}

function deleteCookie(name) {
    document.cookie = name + "=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
}

// Story management
let stories = [];
let currentEditingIndex = null;
let currentStoryForCopy = null;
let variableValues = {};

// Load stories from cookies on page load
function loadStories() {
    const storiesData = getCookie('stories');
    if (storiesData) {
        try {
            stories = JSON.parse(storiesData);
        } catch (e) {
            stories = [];
        }
    } else {
        // Add sample stories if no data exists
        stories = [
            {
                title: "Welcome Email Template",
                text: `Dear {{name}},

Welcome to {{company}}! We're thrilled to have you join our team as a {{position}}.

Your start date is {{startDate}}, and you'll be working in the {{department}} department. Your manager, {{managerName}}, will reach out to you soon to discuss your onboarding schedule.

Please feel free to reach out if you have any questions before your start date. We're looking forward to working with you!

Best regards,
{{hrName}}
Human Resources Manager`,
                variables: {
                    name: "",
                    company: "",
                    position: "",
                    startDate: "",
                    department: "",
                    managerName: "",
                    hrName: ""
                }
            },
            {
                title: "Meeting Invitation",
                text: `Hi {name},

I hope this message finds you well. I'd like to schedule a meeting to discuss {topic}.

Proposed time: {date} at {time}
Duration: {duration}
Location: {location}

Please let me know if this works for you, or suggest an alternative time.

Looking forward to our discussion!

Best,
{senderName}`,
                variables: {
                    name: "",
                    topic: "",
                    date: "",
                    time: "",
                    duration: "",
                    location: "",
                    senderName: ""
                }
            },
            {
                title: "Product Launch Announcement",
                text: `🎉 Exciting News! 🎉

We're thrilled to announce the launch of {{productName}}!

After {{developmentTime}} of hard work, our team at {{companyName}} is proud to present this innovative solution that will {{benefit}}.

Key Features:
- {{feature1}}
- {{feature2}}
- {{feature3}}

Available starting {{launchDate}} at {{price}}.

Learn more at {{website}}

Thank you for your continued support!

The {{companyName}} Team`,
                variables: {
                    productName: "",
                    developmentTime: "",
                    companyName: "",
                    benefit: "",
                    feature1: "",
                    feature2: "",
                    feature3: "",
                    launchDate: "",
                    price: "",
                    website: ""
                }
            }
        ];
        saveStories();
    }
    renderStories();
}

// Theme management
function setTheme(theme) {
    document.body.className = `theme-${theme}`;
    setCookie('theme', theme);
    window.location.hash = `theme=${theme}`;
    showToast(`${theme.charAt(0).toUpperCase() + theme.slice(1)} mode activated! ✨`);
}

function loadTheme() {
    // Check URL hash first
    const hash = window.location.hash.substring(1);
    const params = new URLSearchParams(hash);
    const urlTheme = params.get('theme');
    
    // Use URL theme if available, otherwise use cookie, otherwise default to 'dark'
    const theme = urlTheme || getCookie('theme') || 'dark';
    
    // Validate theme
    const validThemes = ['dark', 'light', 'girly'];
    const finalTheme = validThemes.includes(theme) ? theme : 'dark';
    
    document.body.className = `theme-${finalTheme}`;
    
    // Update URL hash if not already set
    if (!urlTheme) {
        window.location.hash = `theme=${finalTheme}`;
    }
    
    // Save to cookie
    setCookie('theme', finalTheme);
}

function saveStories() {
    setCookie('stories', JSON.stringify(stories));
}

function renderStories() {
    const container = document.getElementById('storiesContainer');
    
    if (stories.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <h2>No stories yet</h2>
                <p>Click "Add New Story" to create your first story!</p>
            </div>
        `;
        return;
    }
    
    container.innerHTML = stories.map((story, index) => {
        const displayText = highlightVariables(story.text);
        return `
            <div class="story-card">
                <div class="story-header">
                    <h3 class="story-title">${escapeHtml(story.title)}</h3>
                </div>
                <div class="story-text">${displayText}</div>
                <div class="story-actions">
                    <button class="btn btn-copy" onclick="openVariableEditor(${index})">📋 Copy</button>
                    <button class="btn btn-edit" onclick="editStory(${index})">✏️ Edit</button>
                    <button class="btn btn-delete" onclick="deleteStory(${index})">🗑️ Delete</button>
                </div>
            </div>
        `;
    }).join('');
}

function highlightVariables(text) {
    // Escape HTML first
    text = escapeHtml(text);
    // Highlight variables with {varname} or {{varname}}
    text = text.replace(/\{\{([^}]+)\}\}/g, '<span class="variable">{{$1}}</span>');
    text = text.replace(/\{([^}]+)\}/g, '<span class="variable">{$1}</span>');
    return text;
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

function extractVariables(text) {
    const variables = new Set();
    // Match both {varname} and {{varname}}
    const regex = /\{\{?([^}]+)\}?\}/g;
    let match;
    while ((match = regex.exec(text)) !== null) {
        variables.add(match[1]);
    }
    return Array.from(variables);
}

// Modal functions
function showAddStoryModal() {
    currentEditingIndex = null;
    document.getElementById('modalTitle').textContent = 'Add New Story';
    document.getElementById('storyTitle').value = '';
    document.getElementById('storyText').value = '';
    updateVariablesInModal();
    document.getElementById('storyModal').style.display = 'block';
}

function updateVariablesInModal() {
    const text = document.getElementById('storyText').value;
    const variables = extractVariables(text);
    const container = document.getElementById('storyVariablesEdit');
    
    if (variables.length === 0) {
        container.innerHTML = '<p class="info-text">Variables will appear here automatically as you type them in the story text</p>';
        return;
    }
    
    // Get current story's variable values if editing
    let currentVars = {};
    if (currentEditingIndex !== null && stories[currentEditingIndex]) {
        currentVars = stories[currentEditingIndex].variables || {};
    }
    
    container.innerHTML = variables.map(varName => `
        <div class="variable-item">
            <label>${escapeHtml(varName)}</label>
            <input type="text" 
                   id="default_var_${varName}" 
                   placeholder="Default value (optional)"
                   value="${escapeHtml(currentVars[varName] || '')}">
        </div>
    `).join('');
}

function closeStoryModal() {
    document.getElementById('storyModal').style.display = 'none';
}

function editStory(index) {
    currentEditingIndex = index;
    const story = stories[index];
    document.getElementById('modalTitle').textContent = 'Edit Story';
    document.getElementById('storyTitle').value = story.title;
    document.getElementById('storyText').value = story.text;
    updateVariablesInModal();
    document.getElementById('storyModal').style.display = 'block';
}

// Add event listener to story text to update variables dynamically
document.addEventListener('DOMContentLoaded', function() {
    const storyTextarea = document.getElementById('storyText');
    if (storyTextarea) {
        storyTextarea.addEventListener('input', updateVariablesInModal);
    }
});

function saveStory() {
    const title = document.getElementById('storyTitle').value.trim();
    const text = document.getElementById('storyText').value.trim();
    
    if (!title || !text) {
        showToast('Please fill in both title and story text');
        return;
    }
    
    // Extract variables and their default values
    const variables = extractVariables(text);
    const variableDefaults = {};
    
    variables.forEach(varName => {
        const input = document.getElementById(`default_var_${varName}`);
        if (input) {
            variableDefaults[varName] = input.value.trim();
        }
    });
    
    const story = { 
        title, 
        text,
        variables: variableDefaults
    };
    
    if (currentEditingIndex !== null) {
        stories[currentEditingIndex] = story;
        showToast('Story updated successfully! ✅');
    } else {
        stories.push(story);
        showToast('Story added successfully! 🎉');
    }
    
    saveStories();
    renderStories();
    closeStoryModal();
}

function deleteStory(index) {
    if (confirm('Are you sure you want to delete this story?')) {
        stories.splice(index, 1);
        saveStories();
        renderStories();
        showToast('Story deleted! 🗑️');
    }
}

function clearAllData() {
    if (confirm('Are you sure you want to delete all stories? This cannot be undone.')) {
        stories = [];
        saveStories();
        renderStories();
        showToast('All data cleared! 🧹');
    }
}

// Variable editor
function openVariableEditor(index) {
    currentStoryForCopy = index;
    const story = stories[index];
    const variables = extractVariables(story.text);
    
    const container = document.getElementById('variablesContainer');
    
    if (variables.length === 0) {
        // No variables, just copy the story as-is
        copyToClipboard(story.text);
        showToast('Story copied to clipboard! 📋');
        return;
    }
    
    // Reset variable values
    variableValues = {};
    
    // Set default values from story
    variables.forEach(varName => {
        if (story.variables && story.variables[varName]) {
            variableValues[varName] = story.variables[varName];
        } else {
            variableValues[varName] = '';
        }
    });
    
    renderVariableEditor(variables);
    updatePreview();
    
    document.getElementById('variableModal').style.display = 'block';
}

function renderVariableEditor(variables) {
    const container = document.getElementById('variablesContainer');
    
    container.innerHTML = variables.map(varName => `
        <div class="variable-item">
            <label>${escapeHtml(varName)}</label>
            <input type="text" 
                   id="var_${varName}" 
                   placeholder="Enter value for ${escapeHtml(varName)}"
                   value="${escapeHtml(variableValues[varName] || '')}"
                   oninput="updateVariableValue('${varName}', this.value)">
        </div>
    `).join('');
}

function updateVariableValue(varName, value) {
    variableValues[varName] = value;
    updatePreview();
}

function updatePreview() {
    if (currentStoryForCopy === null) return;
    
    const story = stories[currentStoryForCopy];
    let text = story.text;
    
    // Replace variables with current values
    Object.keys(variableValues).forEach(varName => {
        const value = variableValues[varName] || `<span class="variable">{${varName}}</span>`;
        const escapedVarName = escapeRegex(varName);
        
        // Replace both {varname} and {{varname}}
        text = text.replace(new RegExp(`\\{\\{${escapedVarName}\\}\\}`, 'g'), value);
        text = text.replace(new RegExp(`\\{${escapedVarName}\\}`, 'g'), value);
    });
    
    document.getElementById('storyPreview').innerHTML = escapeHtml(text).replace(/\n/g, '<br>');
}

function closeVariableModal() {
    document.getElementById('variableModal').style.display = 'none';
    currentStoryForCopy = null;
}

function copyStoryWithVariables() {
    if (currentStoryForCopy === null) return;
    
    const story = stories[currentStoryForCopy];
    let text = story.text;
    
    // Replace variables with current values
    Object.keys(variableValues).forEach(varName => {
        const value = variableValues[varName] || `{${varName}}`; // Keep original if empty
        const escapedVarName = escapeRegex(varName);
        
        // Replace both {varname} and {{varname}}
        text = text.replace(new RegExp(`\\{\\{${escapedVarName}\\}\\}`, 'g'), value);
        text = text.replace(new RegExp(`\\{${escapedVarName}\\}`, 'g'), value);
    });
    
    copyToClipboard(text);
    showToast('Story copied to clipboard! 📋✨');
    closeVariableModal();
}

function escapeRegex(string) {
    return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function copyToClipboard(text) {
    const textarea = document.createElement('textarea');
    textarea.value = text;
    textarea.style.position = 'fixed';
    textarea.style.opacity = '0';
    document.body.appendChild(textarea);
    textarea.select();
    document.execCommand('copy');
    document.body.removeChild(textarea);
}

function showToast(message) {
    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.textContent = message;
    document.body.appendChild(toast);
    
    setTimeout(() => {
        document.body.removeChild(toast);
    }, 3000);
}

// Close modals when clicking outside
window.onclick = function(event) {
    const storyModal = document.getElementById('storyModal');
    const variableModal = document.getElementById('variableModal');
    
    if (event.target === storyModal) {
        closeStoryModal();
    }
    if (event.target === variableModal) {
        closeVariableModal();
    }
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', function() {
    loadTheme();
    loadStories();
});
