import { StyleSheet } from 'react-native';
import colors from './colors';

const commonStyles = StyleSheet.create({
  // Container Styles
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  containerDark: {
    flex: 1,
    backgroundColor: colors.backgroundDark,
  },
  containerCenter: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background,
  },
  containerCenterDark: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.backgroundDark,
  },
  
  // Button Styles
  buttonPrimary: {
    backgroundColor: colors.primary,
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonSecondary: {
    backgroundColor: colors.secondary,
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonOutline: {
    backgroundColor: 'transparent',
    borderWidth: 2,
    borderColor: colors.primary,
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonRounded: {
    backgroundColor: colors.primary,
    borderRadius: 50,
    paddingVertical: 12,
    paddingHorizontal: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  
  // Text Styles
  textPrimary: {
    color: colors.textPrimary,
    fontSize: 16,
  },
  textSecondary: {
    color: colors.textSecondary,
    fontSize: 14,
  },
  textLight: {
    color: colors.textLight,
    fontSize: 14,
  },
  textMuted: {
    color: colors.textMuted,
    fontSize: 12,
  },
  textWhite: {
    color: colors.white,
    fontSize: 16,
  },
  textButton: {
    color: colors.white,
    fontSize: 16,
    fontWeight: 'bold',
  },
  textButtonOutline: {
    color: colors.primary,
    fontSize: 16,
    fontWeight: 'bold',
  },
  
  // Heading Styles
  heading1: {
    fontSize: 32,
    fontWeight: 'bold',
    color: colors.textPrimary,
  },
  heading2: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.textPrimary,
  },
  heading3: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.textPrimary,
  },
  heading4: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  
  // Card Styles
  card: {
    backgroundColor: colors.white,
    borderRadius: 8,
    padding: 16,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardDark: {
    backgroundColor: colors.backgroundDark,
    borderRadius: 8,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.gray700,
  },
  
  // Input Styles
  input: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
    fontSize: 16,
    backgroundColor: colors.white,
  },
  inputFocused: {
    borderColor: colors.primary,
    borderWidth: 2,
  },
  
  // Modal Styles
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: 24,
    margin: 20,
    alignItems: 'center',
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 1,
    shadowRadius: 8,
    elevation: 5,
  },
  
  // Layout Helpers
  row: {
    flexDirection: 'row',
  },
  column: {
    flexDirection: 'column',
  },
  center: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  spaceBetween: {
    justifyContent: 'space-between',
  },
  spaceAround: {
    justifyContent: 'space-around',
  },
  alignCenter: {
    alignItems: 'center',
  },
  justifyCenter: {
    justifyContent: 'center',
  },
  
  // Spacing
  margin8: { margin: 8 },
  margin16: { margin: 16 },
  margin24: { margin: 24 },
  marginVertical8: { marginVertical: 8 },
  marginVertical16: { marginVertical: 16 },
  marginHorizontal8: { marginHorizontal: 8 },
  marginHorizontal16: { marginHorizontal: 16 },
  padding8: { padding: 8 },
  padding16: { padding: 16 },
  padding24: { padding: 24 },
  paddingVertical8: { paddingVertical: 8 },
  paddingVertical16: { paddingVertical: 16 },
  paddingHorizontal8: { paddingHorizontal: 8 },
  paddingHorizontal16: { paddingHorizontal: 16 },
  
  // Borders
  border: {
    borderWidth: 1,
    borderColor: colors.border,
  },
  borderTop: {
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  borderBottom: {
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  borderRadius8: {
    borderRadius: 8,
  },
  borderRadius16: {
    borderRadius: 16,
  },
  borderRadius50: {
    borderRadius: 50,
  },
  
  // Loading Styles
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.backgroundDark,
  },
  loadingModal: {
    backgroundColor: colors.white,
    padding: 24,
    borderRadius: 12,
    alignItems: 'center',
    minWidth: 200,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: colors.primary,
    fontWeight: '500',
  },
});

export default commonStyles;