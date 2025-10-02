/**
 * Unified Color System
 * Based on the web app's tailwind configuration
 * All mobile app views should use these colors for consistency
 */
const colors = {
    // ============================================
    // PRIMARY COLORS (from Tailwind config)
    // ============================================
    
    // Colores primarios
    "primary-black": "#000000",      // Negro
    "primary-red": "#C70039",        // Rojo (errores)
    "primary-blue": "#104eba",       // Azul principal (imagen/logo)
    "primary-dark": "#323232",       // Gris (logo/texto)
    
    // Colores secundarios
    "secondary-green": "#9ad64a",    // Verde
    "primary-blue-dark": "#042257ff",
    "primary-red-dark": "#99002bff",
    
    // ============================================
    // MATICES (shades/tints hacia blanco)
    // ============================================
    
    // Para primary-black (#000000)
    "primary-black-80": "#333333",
    "primary-black-60": "#666666",
    "primary-black-40": "#999999",
    "primary-black-20": "#CCCCCC",
    "primary-black-10": "#E6E6E6",
    
    // Para primary-red (colors.error)
    "primary-red-80": "#E0335C",
    "primary-red-60": "#F0667F",
    "primary-red-40": "#F599A3",
    "primary-red-20": "#FABCC6",
    "primary-red-10": "#FDDDE3",
    
    // Para primary-blue (#104eba)
    "primary-blue-80": "#1a60c2",
    "primary-blue-60": "#4a80d1",
    "primary-blue-40": "#7ba0df",
    "primary-blue-20": "#adc0ed",
    "primary-blue-10": "#d6e0f6",
    
    // Para primary-dark (#323232)
    "primary-dark-80": "#5B5B5B",
    "primary-dark-60": "#848484",
    "primary-dark-40": "#ADADAD",
    "primary-dark-20": "#D6D6D6",
    "primary-dark-10": "#EBEBEB",
    
    // Para secondary-green (#9ad64a)
    "secondary-green-80": "#B3E066",
    "secondary-green-60": "#C9E899",
    "secondary-green-40": "#DFEFCC",
    "secondary-green-20": "#F5F7E6",
    "secondary-green-10": "#FAFBF3",
    
    // ============================================
    // CONVENIENCE ALIASES (easier to use)
    // ============================================
    
    // Primary Brand Colors (unified with web tailwind config)
    // The mobile app now uses the same primary-blue as the web (#104eba)
    primary: "#104eba",              // Unified primary-blue (web & mobile)
    primaryLight: "#1a60c2",         // primary-blue-80
    primaryDark: "#042257ff",        // primary-blue-dark
    secondary: "#9ad64a",            // secondary-green
    
    // Basic Colors
    white: "#FFFFFF",
    black: "#000000",
    transparent: "transparent",
    
    // Text Colors
    textPrimary: "#000000",          // Maps to primary-black
    textSecondary: "#323232",        // Maps to primary-dark
    textLight: "#666666",            // Maps to primary-black-60
    textMuted: "#848484",            // Maps to primary-dark-60
    textOnPrimary: "#FFFFFF",
    
    // Background Colors
    background: "#FFFFFF",
    backgroundDark: "#323232",       // Maps to primary-dark
    backgroundLight: "#F8F9FA",
    backgroundGray: "#FAFAFA",
    backgroundMuted: "#F0F0F0",
    
    // Gray Scale (using primary-black shades)
    gray100: "#E6E6E6",              // primary-black-10
    gray200: "#E2E8F0",
    gray300: "#CCCCCC",              // primary-black-20
    gray400: "#999999",              // primary-black-40
    gray500: "#848484",              // primary-dark-60
    gray600: "#666666",              // primary-black-60
    gray700: "#333333",              // primary-black-80
    gray800: "#323232",              // primary-dark
    gray900: "#000000",              // primary-black
    
    // Status Colors
    success: "#9ad64a",              // Maps to secondary-green
    warning: "#FFC107",
    error: "#C70039",                // Maps to primary-red
    info: "#104eba",                 // Maps to primary-blue
    
    // ============================================
    // LEGACY COLORS (maintain backward compatibility)
    // ============================================
    
    limon: "#9FE86F",
    rata: "#5E5E5E",
    marino: "#0050C2",
    blanco: "#FFFFFF",
    azul: "#104eba",                 // Now matches primary-blue
    rosa: "#FE308E",
    negro: "#000000",                // Matches primary-black
    amarillo: "#FAEA00",
    gris: "#AFBCBF",
    grisbg: "#FAFAFA",
    grisclaro: "#EEF2F5",
    azulTop: "#2477C7",
    azulBot: "#2B92E5",
    azulClaro: "#2DFFFF",
    azulMarino: "#104eba",           // Now matches primary-blue
    rojo: "#C70039",                 // Now matches primary-red
    urgente: "#D21313",
    urgentecnico: "#FF9238",
    azulfuerte: "#1E477A",
    
    // State Colors
    enProceso: "#52A5FF",
    iniciado: "#5773FF",
    recoleccion: "#6E6BFF",
    cancelado: "#FF8585",
    pausado: "#E5BE01",
    rechazado: "#FFBD99",
    pendiente: "#02AC66",
    finalizado: "#FF8585",
    pagado: "#EEF2F5",
    serviciopendiente: "#02AC66",
    servicioiniciado: "#5773FF",
    serviciopausado: "#E5BE01",
    servicioreanudado: "#52A5FF",
    servicioterminado: "#FF8585",
    noreparado: "#D21313",
    agendado: "#CC7FB5",
    botones: "#104eba",              // Now matches primary-blue
    gris2: "#848484",                // Now matches primary-dark-60
    cotizacion: "#6DC36D",
    detalle: "#AA77C3",
    
    // Additional commonly used colors
    darkBlue: "#042257ff",           // Maps to primary-blue-dark
    lightBlue: "#d6e0f6",            // Maps to primary-blue-10
    orange: "#FF9800",
    purple: "#8D288E",
    gold: "#FFD700",
    lightGray: "#E6E6E6",            // Maps to primary-black-10
    mediumGray: "#CCCCCC",           // Maps to primary-black-20
    darkGray: "#848484",             // Maps to primary-dark-60
    
    // Border Colors
    border: "#E0E0E0",
    borderLight: "#EBEBEB",          // Maps to primary-dark-10
    borderDark: "#CCCCCC",           // Maps to primary-black-20
    
    // Shadow Colors
    shadow: "rgba(0, 0, 0, 0.1)",
    shadowDark: "rgba(0, 0, 0, 0.3)",
    shadowLight: "rgba(0, 0, 0, 0.05)",
}

export default colors;