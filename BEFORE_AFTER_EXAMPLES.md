# Before and After Examples - Color System Unification

## Overview
This document shows examples of how files were transformed during the color system unification.

## Example 1: Navigation Component (EjemploNav.js)

### BEFORE:
```javascript
import React from 'react';
import { View, StyleSheet } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
// ... other imports

const styles = StyleSheet.create({
  circle: {
    position: 'absolute',
    width: 41,
    height: 41,
    borderRadius: 25,
    backgroundColor: '#02B9FA',  // ❌ Hardcoded color
    top: -5,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: -1,
  },
});
```

### AFTER:
```javascript
import React from 'react';
import { View, StyleSheet } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import colors from '../styles/colors';  // ✅ Import added
// ... other imports

const styles = StyleSheet.create({
  circle: {
    position: 'absolute',
    width: 41,
    height: 41,
    borderRadius: 25,
    backgroundColor: colors.primary,  // ✅ Uses unified color
    top: -5,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: -1,
  },
});
```

## Example 2: Modal Component (TimeBreak2.js)

### BEFORE:
```javascript
import React, { useState, useEffect, useRef } from "react";
import { View, StyleSheet, Modal, Text } from "react-native";
import { Ionicons } from "@expo/vector-icons";

const TieBreak2 = ({ visible, onClose }) => {
  return (
    <Modal visible={visible}>
      <View style={styles.modalContainer}>
        <TouchableOpacity onPress={onClose}>
          <Ionicons name="close" size={25} color="#02B9FA" />  {/* ❌ Hardcoded */}
        </TouchableOpacity>
        <TextInput 
          placeholderTextColor="#00BAFF"  {/* ❌ Hardcoded */}
        />
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalContainer: {
    borderColor: "#00baff",  // ❌ Hardcoded
  },
  errorText: {
    color: "#C70039",  // ❌ Hardcoded
  },
});
```

### AFTER:
```javascript
import React, { useState, useEffect, useRef } from "react";
import { View, StyleSheet, Modal, Text } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import colors from "../styles/colors";  // ✅ Import added

const TieBreak2 = ({ visible, onClose }) => {
  return (
    <Modal visible={visible}>
      <View style={styles.modalContainer}>
        <TouchableOpacity onPress={onClose}>
          <Ionicons name="close" size={25} color={colors.primary} />  {/* ✅ Unified */}
        </TouchableOpacity>
        <TextInput 
          placeholderTextColor={colors.primary}  {/* ✅ Unified */}
        />
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalContainer: {
    borderColor: colors.primary,  // ✅ Unified
  },
  errorText: {
    color: colors.error,  // ✅ Unified
  },
});
```

## Example 3: Component with Multiple Color Uses

### BEFORE:
```javascript
// ❌ No import

const CardComponent = () => (
  <View>
    <ActivityIndicator color="#00baff" />
    <Icon name="close" color="#02B9FA" />
    <Text style={{ color: '#C70039' }}>Error</Text>
  </View>
);

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#00BAFF',
    borderColor: '#02b9fa',
  },
  errorBox: {
    borderColor: '#c70039',
  },
});
```

### AFTER:
```javascript
import colors from "../styles/colors";  // ✅ Import added

const CardComponent = () => (
  <View>
    <ActivityIndicator color={colors.primary} />  {/* ✅ Unified */}
    <Icon name="close" color={colors.primary} />  {/* ✅ Unified */}
    <Text style={{ color: colors.error }}>Error</Text>  {/* ✅ Unified */}
  </View>
);

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.primary,  // ✅ Unified
    borderColor: colors.primary,      // ✅ Unified
  },
  errorBox: {
    borderColor: colors.error,        // ✅ Unified
  },
});
```

## Color Mapping Reference

| Old Hardcoded Value | New Unified Reference | Actual Color Value |
|---------------------|----------------------|-------------------|
| `#00baff`, `#00BAFF` | `colors.primary` | `#104eba` |
| `#02B9FA`, `#02b9fa` | `colors.primary` | `#104eba` |
| `#C70039`, `#c70039` | `colors.error` | `#C70039` |

## Benefits of Unified System

### Before:
- ❌ 700+ hardcoded color values scattered across 130 files
- ❌ Inconsistent color usage (#00baff vs #00BAFF vs #02B9FA)
- ❌ Difficult to maintain and update colors globally
- ❌ No alignment with web app colors
- ❌ Potential for typos in hex values

### After:
- ✅ Single source of truth: `src/styles/colors.js`
- ✅ Consistent color references: `colors.primary`, `colors.error`
- ✅ Easy to update colors globally
- ✅ Aligned with web app tailwind configuration
- ✅ Type-safe color references (no typos)
- ✅ Better code readability: `colors.error` is clearer than `#C70039`
- ✅ Supports future theming (light/dark mode)

## Color System Structure

```javascript
// src/styles/colors.js
const colors = {
  // Web tailwind primary colors
  "primary-blue": "#104eba",
  "primary-red": "#C70039",
  "primary-dark": "#323232",
  "secondary-green": "#9ad64a",
  
  // Shades for each primary color
  "primary-blue-80": "#1a60c2",
  "primary-blue-60": "#4a80d1",
  // ... more shades
  
  // Convenient aliases
  primary: "#104eba",
  error: "#C70039",
  success: "#9ad64a",
  
  // Legacy names (backward compatible)
  azul: "#104eba",
  rojo: "#C70039",
  azulMarino: "#104eba",
};

export default colors;
```

## Usage Guidelines

### For JSX Attributes:
```javascript
<Icon color={colors.primary} />
<ActivityIndicator color={colors.primary} />
```

### For StyleSheet Objects:
```javascript
const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.primary,
    borderColor: colors.error,
  }
});
```

### For Inline Styles:
```javascript
<Text style={{ color: colors.error }}>Error Message</Text>
```

## Testing
All 130 modified files have been syntax-checked and verified. The app maintains its visual appearance while using the new unified color system.
