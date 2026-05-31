// theme.js

// 
const darkColors = {
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

const lightColors = {
    primary: '#FF6B35',       
    success: '#2EC4B6',       
    danger: '#FF5630',        
    
    
    background: '#F0F4F8',    
    surface: '#E1E8F0',      
    
    textMain: '#1C232B',      
    textMuted: '#5A6A77',     
    border: '#CFD8E3',        
    
    // Gradient me bhi thoda soft blue aur orange ka touch
    meshGradient: 'radial-gradient(circle at 0% 0%, rgba(255, 107, 53, 0.08) 0%, transparent 35%), radial-gradient(circle at 100% 100%, rgba(46, 196, 182, 0.05) 0%, transparent 40%), #F0F4F8'
};

//  check karo ki user ne pehle se kya select kiya hai (LocalStorage se)
// Agar kuch select nahi hai, toh automatic true (Dark Mode) rahega
const isDark = localStorage.getItem("appTheme") !== "light";

const activeColors = isDark ? darkColors : lightColors;

//  vahi purana 'theme' object jise baaki files use kar rahi hain
export const theme = {
    colors: activeColors, // Isme automatic sahi wala theme chale jayenge
    transitions: {
        smooth: 'all 0.3s ease-in-out'
    }
};