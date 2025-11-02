# Theme System Documentation

## Overview
This app uses a simple, centralized theme system that makes it easy to add new color schemes. Themes can be visible (with buttons) or hidden (accessible only via URL).

## Current Themes

### Visible Themes
- 🌙 **Dark** - Purple dark theme
- ☀️ **Light** - Clean light theme
- 💖 **Girly** - Pink/rose theme
- 🤖 **Cyberpunk** - Neon cyberpunk theme

### Hidden Themes (URL Only)
- 🟢 **Matrix** - Classic Matrix green theme
  - Access via: `?theme=matrix`

## How Themes Work
Your selected theme is automatically saved using cookies and will persist across sessions.

## Accessing Hidden Themes
Hidden themes don't appear in the theme switcher buttons but can be activated by adding `?theme=themeid` to the URL.

For example:
- `http://yoursite.com/?theme=matrix` - Activates the Matrix theme
- Once activated, the theme is saved and will persist even without the URL parameter

## Adding a New Theme

### Step 1: Add CSS Variables (in `styles.css`)
Copy an existing theme block and customize the colors:

```css
/* YOUR THEME NAME */
body.theme-yourthemeid {
    --bg-primary: #0a0e27;        /* Main background */
    --bg-secondary: #1a1f3a;      /* Secondary background */
    --bg-card: #252b48;           /* Card backgrounds */
    --text-primary: #e4e4e7;      /* Main text */
    --text-secondary: #a1a1aa;    /* Muted text */
    --accent-primary: #8b5cf6;    /* Primary accent (buttons) */
    --accent-secondary: #a78bfa;  /* Secondary accent */
    --border-color: #3f3f46;      /* Borders */
    --input-bg: #18181b;          /* Input backgrounds */
    --shadow: rgba(0, 0, 0, 0.5); /* Shadows */
    --variable-bg: #4c1d95;       /* Variable tag background */
    --variable-color: #e9d5ff;    /* Variable tag text */
}
```

### Step 2: Register the Theme (in `script.js`)
Add your theme to the `AVAILABLE_THEMES` array:

**For a visible theme (with button):**
```javascript
const AVAILABLE_THEMES = [
    { id: 'dark', name: 'Dark', icon: '🌙', hidden: false },
    { id: 'light', name: 'Light', icon: '☀️', hidden: false },
    { id: 'yourthemeid', name: 'Your Theme Name', icon: '🎨', hidden: false }
];
```

**For a hidden theme (URL only):**
```javascript
const AVAILABLE_THEMES = [
    { id: 'dark', name: 'Dark', icon: '🌙', hidden: false },
    { id: 'light', name: 'Light', icon: '☀️', hidden: false },
    // Hidden themes
    { id: 'yourthemeid', name: 'Your Theme Name', icon: '🔒', hidden: true }
];
```

**That's it!** Your theme will work throughout the app.
- Visible themes appear as buttons in the theme switcher
- Hidden themes can only be accessed via `?theme=yourthemeid` in the URL

## Tips for Creating Themes
- Use a color palette generator for consistent colors
- Test both light and dark backgrounds for readability
- Ensure sufficient contrast between text and background
- Variable tags should stand out but not be overwhelming
- Shadows should match your theme's overall tone
- Hidden themes are great for Easter eggs or experimental themes

## Theme Persistence
Themes are saved in browser cookies for 1 year, so users don't need to re-select their theme each visit. This works for both visible and hidden themes!
