// theme.js

// 
 export const darkColors = {
    primary: '#FF6B35',
    success: '#2EC4B6',
    danger: '#FF5630',
    background: '#12161A',
    surface: '#1C232B',
    textMain: '#FFFFFF',
    textMuted: '#8F9CA7',
    border: '#2C353F',
    meshGradient: 'radial-gradient(circle at 0% 0%, rgba(255, 107, 53, 0.15) 0%, transparent 35%), radial-gradient(circle at 100% 100%, rgba(46, 196, 182, 0.1) 0%, transparent 40%), #12161A'
};

export const lightColors = {
primary: '#FF007F',        // Neon Pink
    success: '#39FF14',        // Neon Green
    danger: '#FF1493',         // Deep Pink
    background: '#0D0D0D',     // Pitch Black
    surface: '#1A1A1A',        // Dark Grey
    textMain: '#FFFFFF',       // Crisp White
    textMuted: '#A0A0A0',      // Light Grey
    border: '#333333',         // Darker border
    meshGradient: 'radial-gradient(circle at 0% 0%, rgba(255, 0, 127, 0.15) 0%, transparent 40%), #0D0D0D'
};

//  check karo ki user ne pehle se kya select kiya hai (LocalStorage se)
// Agar kuch select nahi hai, toh automatic true (Dark Mode) rahega
const isDark = localStorage.getItem("appTheme") !== "light";

const activeColors = isDark ? darkColors : lightColors;

//  vahi purana 'theme' object jise baaki files use kar rahi hain
export const theme = {
    // Ye dynamic nahi hai, sirf default initial state ke liye hai
    colors: localStorage.getItem("appTheme") !== "light" ? darkColors : lightColors,
    transitions: { smooth: 'all 0.3s ease-in-out' }
};