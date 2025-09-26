# Arosport Mobile App - Unified Colors and Styles Guide

This guide explains how to use the unified color and style system in the Arosport mobile application.

## Overview

The app now uses a centralized color and style system to ensure consistency across all components and make maintenance easier. Instead of hardcoded colors like `#00BAFF` or `#2E2E2E`, we use semantic color names from a centralized palette.

## Files Structure

```
src/styles/
├── colors.js    # Centralized color definitions
├── styles.js    # Common reusable styles
└── README.md    # This documentation
```

## How to Use Colors

### Import the colors object

```javascript
import colors from '../styles/colors';
```

### Use semantic color names

```javascript
// OLD WAY ❌
const styles = StyleSheet.create({
  container: {
    backgroundColor: '#2E2E2E',
    color: '#FFFFFF',
  },
  button: {
    backgroundColor: '#00BAFF',
    borderColor: '#02B9FA',
  }
});

// NEW WAY ✅
const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.backgroundDark,
    color: colors.white,
  },
  button: {
    backgroundColor: colors.primary,
    borderColor: colors.primaryLight,
  }
});
```

## Available Colors

### Primary Brand Colors
- `colors.primary` - Main blue (#00BAFF) - most used brand color
- `colors.primaryLight` - Light blue variant (#02B9FA)
- `colors.primaryDark` - Darker blue (#0086BA)
- `colors.secondary` - Secondary blue (#2A82B7)

### Basic Colors
- `colors.white` - Pure white (#FFFFFF)
- `colors.black` - Pure black (#000000)
- `colors.transparent` - Transparent

### Text Colors
- `colors.textPrimary` - Primary text color (#000000)
- `colors.textSecondary` - Secondary text color (#333333)
- `colors.textLight` - Light text color (#666666)
- `colors.textMuted` - Muted text color (#888888)
- `colors.textOnPrimary` - Text on primary backgrounds (#FFFFFF)

### Background Colors
- `colors.background` - Main background (#FFFFFF)
- `colors.backgroundDark` - Dark background (#2E2E2E)
- `colors.backgroundLight` - Light background (#F8F9FA)
- `colors.backgroundGray` - Gray background (#FAFAFA)
- `colors.backgroundMuted` - Muted background (#F0F0F0)

### Gray Scale
- `colors.gray100` to `colors.gray900` - Complete gray scale

### Status Colors
- `colors.success` - Success state (#4CAF50)
- `colors.warning` - Warning state (#FFC107)
- `colors.error` - Error state (#FB4648)
- `colors.info` - Info state (#2196F3)

### Additional Colors
- `colors.purple` - Purple accent (#8D288E)
- `colors.orange` - Orange accent (#FF9800)
- `colors.gold` - Gold accent (#FFD700)
- `colors.lightBlue` - Light blue (#E6F7FF)
- `colors.darkGray` - Dark gray (#838080)

## How to Use Common Styles

### Import the common styles

```javascript
import commonStyles from '../styles/styles';
```

### Use predefined styles

```javascript
// Container styles
<View style={commonStyles.container}>
<View style={commonStyles.containerDark}>
<View style={commonStyles.containerCenter}>

// Button styles
<TouchableOpacity style={commonStyles.buttonPrimary}>
<TouchableOpacity style={commonStyles.buttonSecondary}>
<TouchableOpacity style={commonStyles.buttonOutline}>

// Text styles
<Text style={commonStyles.textPrimary}>
<Text style={commonStyles.heading1}>
<Text style={commonStyles.textButton}>

// Card styles
<View style={commonStyles.card}>
<View style={commonStyles.cardDark}>

// Layout helpers
<View style={[commonStyles.row, commonStyles.center]}>
<View style={[commonStyles.column, commonStyles.spaceBetween]}>
```

## Migration Examples

### Example 1: Screen Component

```javascript
// Before
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#2E2E2E',
    padding: 16,
  },
  text: {
    color: '#FFFFFF',
    fontSize: 16,
  }
});

// After
import colors from '../styles/colors';
import commonStyles from '../styles/styles';

const styles = StyleSheet.create({
  container: {
    ...commonStyles.containerDark,
    padding: 16,
  },
  text: {
    ...commonStyles.textWhite,
  }
});
```

### Example 2: Button Component

```javascript
// Before
const styles = StyleSheet.create({
  button: {
    backgroundColor: '#00BAFF',
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 24,
    alignItems: 'center',
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  }
});

// After
import colors from '../styles/colors';
import commonStyles from '../styles/styles';

const styles = StyleSheet.create({
  button: commonStyles.buttonPrimary,
  buttonText: commonStyles.textButton,
});
```

## Best Practices

1. **Always use semantic colors** instead of hardcoded hex values
2. **Import colors at the top** of each component file
3. **Use common styles** when available to maintain consistency
4. **Extend common styles** rather than redefining them
5. **Keep color usage consistent** across similar components

## Legacy Support

All existing color names are still available for backward compatibility:
- `colors.azulMarino` → Use `colors.primary` instead
- `colors.blanco` → Use `colors.white` instead  
- `colors.negro` → Use `colors.black` instead

## Benefits

- **Consistency**: All components use the same color values
- **Maintainability**: Change colors in one place, apply everywhere
- **Readability**: Semantic names are easier to understand
- **Flexibility**: Easy to implement themes or design changes
- **Performance**: No impact on app performance

## Contributing

When adding new components or updating existing ones:

1. Always import and use `colors` from `../styles/colors`
2. Use semantic color names that describe the purpose, not the appearance
3. Check if a common style already exists before creating new ones
4. Follow the established naming conventions
5. Update this documentation if you add new colors or styles

## Examples in the Codebase

Check these components for reference:
- `src/screens/DetallesInvitacion.js`
- `src/componentes/Estadisticas.js`
- `src/componentes/Activos/Reta.js`
- `src/componentes/Activos/SeisLoco.js`
- `src/componentes/ActivosSets.js`
- `src/componentes/ParejasSeisLoco.js`
- `src/componentes/GameTypes.js`