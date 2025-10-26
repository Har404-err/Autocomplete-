# Gemini Code Autocomplete Plugin for Acode

This plugin integrates Google's powerful Gemini AI into the Acode editor to provide real-time, context-aware code completions. It uses the official Acode Plugin SDK to seamlessly offer suggestions as you type.

## Features

- **Intelligent Suggestions**: Get smart code completions for various languages.
- **Multi-Language Support**: Works with JavaScript, JSX, TypeScript, TSX, HTML, and CSS.
- **Seamless Integration**: Suggestions appear in Acode's native autocomplete popup, labeled "Gemini AI".

---

## ⚠️ Requirements

- **Acode App**: This plugin is designed exclusively for the [Acode code editor on Android](https://play.google.com/store/apps/details?id=com.foxdebug.acode).
- **Gemini API Key**: You **must** have a Google Gemini API key. This service is subject to Google's pricing and terms of use.

---

## Installation and Setup Guide

Follow these steps carefully to install and configure the plugin.

### Step 1: Get a Gemini API Key

1.  Go to the Google AI Studio website: [https://aistudio.google.com/](https://aistudio.google.com/)
2.  Sign in with your Google account.
3.  Click on the "**Get API key**" button on the top left.
4.  Choose "**Create API key in new project**".
5.  **Copy the generated API key**. It's a long string of letters and numbers. Keep it safe.

### Step 2: Install the Plugin in Acode

1.  Open your device's file manager.
2.  Navigate to the Acode plugins folder. This is usually located at `Internal Storage/Acode/plugins/`.
3.  Create a new folder inside `plugins` and name it exactly `gemini-code-autocomplete`.
4.  Download the three plugin files (`plugin.json`, `main.js`, `readme.md`) and place them directly inside the `gemini-code-autocomplete` folder you just created.

### Step 3: Activate and Configure the Plugin

1.  Completely close and restart the Acode app to make it recognize the new plugin.
2.  Go to **Acode Menu** > **Settings** > **Plugins**.
3.  Find **Gemini Code Autocomplete** in the list and **enable** the toggle switch next to it.
4.  Tap on the plugin name (**Gemini Code Autocomplete**) to open its settings.
5.  In the "Gemini API Key" field, **paste the API key** you copied from Google AI Studio.
6.  Restart Acode one more time for the key to take effect. The plugin is now ready!

---

## How to Use

Simply open a supported file (`.js`, `.jsx`, `.ts`, `.tsx`, `.html`, `.css`) and start typing. When you pause, the plugin will fetch a suggestion from Gemini. The suggestion will appear in the autocomplete popup, marked with "Gemini AI". Tap the suggestion to insert it into your code.

A small "Gemini is thinking..." toast message will appear at the bottom of the screen when a suggestion is being fetched.

## Troubleshooting

- **No suggestions appear**:
    - Double-check that you have enabled the plugin in Acode settings.
    - Verify that your API key is pasted correctly and has no extra spaces.
    - Ensure you have a stable internet connection.
    - Check the Acode console for error messages (Menu > Console).
- **"Invalid API Key" error**: Your API key is incorrect or has been revoked. Generate a new one from Google AI Studio and update it in the plugin settings.

---

*This is a third-party plugin and is not officially affiliated with Google or Acode.*
