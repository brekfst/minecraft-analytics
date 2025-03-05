/**
 * Utilities for parsing and displaying Minecraft text with color codes
 * Minecraft uses § (section sign) as a formatting code
 * Format: §[code][text]
 * 
 * Color codes:
 * §0: black
 * §1: dark blue
 * §2: dark green
 * §3: dark aqua
 * §4: dark red
 * §5: dark purple
 * §6: gold
 * §7: gray
 * §8: dark gray
 * §9: blue
 * §a: green
 * §b: aqua
 * §c: red
 * §d: light purple
 * §e: yellow
 * §f: white
 * 
 * Formatting codes:
 * §k: obfuscated
 * §l: bold
 * §m: strikethrough
 * §n: underline
 * §o: italic
 * §r: reset
 */

// Map of Minecraft color codes to CSS colors
const colorMap = {
    '0': '#000000', // black
    '1': '#0000AA', // dark blue
    '2': '#00AA00', // dark green
    '3': '#00AAAA', // dark aqua
    '4': '#AA0000', // dark red
    '5': '#AA00AA', // dark purple
    '6': '#FFAA00', // gold
    '7': '#AAAAAA', // gray
    '8': '#555555', // dark gray
    '9': '#5555FF', // blue
    'a': '#55FF55', // green
    'b': '#55FFFF', // aqua
    'c': '#FF5555', // red
    'd': '#FF55FF', // light purple
    'e': '#FFFF55', // yellow
    'f': '#FFFFFF', // white
  };
  
  // Map of formatting codes to CSS styles
  const formatMap = {
    'k': 'minecraft-obfuscated', // Custom class for obfuscated text
    'l': 'font-bold',
    'm': 'line-through',
    'n': 'underline',
    'o': 'italic',
    'r': '' // Reset is handled separately
  };
  
  /**
   * Parse a Minecraft formatted string with color and format codes
   * and convert it to HTML with CSS
   * 
   * @param {string} text - Minecraft formatted text with § codes
   * @returns {string} HTML string with spans and CSS classes
   */
  export const parseMotd = (text) => {
    if (!text) return '';
    
    // Replace § with a marker we can split on (some APIs might already send § as &sect;)
    const normalized = text.replace(/§/g, '§').replace(/&sect;/g, '§');
    
    // Split by the marker
    const parts = normalized.split('§');
    
    if (parts.length === 1) {
      // No formatting codes, return as is
      return parts[0];
    }
    
    // Current styles being applied
    let currentColor = 'f'; // Default to white
    let currentFormats = [];
    
    // HTML result
    let result = '';
    
    // Process first part (before any formatting)
    if (parts[0]) {
      result += `<span>${escapeHtml(parts[0])}</span>`;
    }
    
    // Process remaining parts (each starting with a formatting code)
    for (let i = 1; i < parts.length; i++) {
      if (!parts[i]) continue;
      
      const code = parts[i].charAt(0).toLowerCase();
      const text = parts[i].substring(1);
      
      // Handle reset code
      if (code === 'r') {
        currentColor = 'f'; // Reset to white
        currentFormats = []; // Clear all formatting
      }
      // Handle color codes (which also reset formatting)
      else if (colorMap[code]) {
        currentColor = code;
        currentFormats = []; // Colors reset formatting
      }
      // Handle formatting codes
      else if (formatMap[code]) {
        if (!currentFormats.includes(code)) {
          currentFormats.push(code);
        }
      }
      
      // Generate CSS class and style
      let styles = `color: ${colorMap[currentColor] || '#FFFFFF'};`;
      let classes = currentFormats.map(f => formatMap[f]).filter(Boolean).join(' ');
      
      // Add the text with proper styling
      if (text) {
        result += `<span class="${classes}" style="${styles}">${escapeHtml(text)}</span>`;
      }
    }
    
    // Add a special CSS class for the obfuscated animation
    if (result.includes('minecraft-obfuscated')) {
      result = `<style>
        @keyframes minecraft-obfuscated {
          0% { opacity: 0.6; }
          50% { opacity: 1; }
          100% { opacity: 0.6; }
        }
        .minecraft-obfuscated {
          animation: minecraft-obfuscated 0.5s infinite;
        }
      </style>` + result;
    }
    
    return result;
  };
  
  /**
   * Escape HTML special characters
   * 
   * @param {string} text - Raw text to escape
   * @returns {string} HTML-escaped text
   */
  const escapeHtml = (text) => {
    return text
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  };
  
  /**
   * Strip Minecraft formatting codes from text
   * 
   * @param {string} text - Minecraft formatted text with § codes
   * @returns {string} Plain text without formatting codes
   */
  export const stripMotdCodes = (text) => {
    if (!text) return '';
    
    // Replace § with a marker we can split on (some APIs might already send § as &sect;)
    const normalized = text.replace(/§/g, '§').replace(/&sect;/g, '§');
    
    // Remove all color and formatting codes
    return normalized.replace(/§[0-9a-fk-or]/gi, '');
  };
  
  export default {
    parseMotd,
    stripMotdCodes
  };