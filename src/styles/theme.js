import {createTheme} from '@mui/material/styles';
import {brand, neutral, status} from './tokens';

// Enterprise design language: calm, dense, low-chroma surfaces; colour is
// reserved for action and status. 6px radii, hairline borders, minimal shadow.
const theme = createTheme({
  palette: {
    mode: 'light',
    primary: {main: brand.primary[600], dark: brand.primary[700], light: brand.primary[50], contrastText: '#fff'},
    secondary: {main: brand.accent[700], light: brand.accent[50]},
    success: {main: status.success.main, light: status.success.bg},
    warning: {main: status.warning.main, light: status.warning.bg},
    error: {main: status.error.main, light: status.error.bg},
    info: {main: status.info.main, light: status.info.bg},
    background: {default: neutral[25], paper: neutral[0]},
    text: {primary: neutral[900], secondary: neutral[600]},
    divider: neutral[100],
    grey: {50: neutral[50], 100: neutral[100], 200: neutral[200], 400: neutral[400], 600: neutral[600], 800: neutral[800], 900: neutral[900]},
  },
  shape: {borderRadius: 6},
  typography: {
    fontFamily: '"Inter", "Helvetica Neue", Arial, sans-serif',
    fontSize: 13,
    h1: {fontSize: '1.5rem', fontWeight: 600, lineHeight: 1.3},
    h2: {fontSize: '1.25rem', fontWeight: 600},
    h3: {fontSize: '1.0625rem', fontWeight: 600},
    subtitle1: {fontWeight: 500},
    overline: {fontWeight: 600, letterSpacing: '0.06em'},
    button: {textTransform: 'none', fontWeight: 500},
  },
  components: {
    MuiButton: {defaultProps: {disableElevation: true, size: 'small'}},
    MuiTextField: {defaultProps: {size: 'small', variant: 'outlined'}},
    MuiTable: {defaultProps: {size: 'small'}},
    MuiPaper: {defaultProps: {variant: 'outlined'}, styleOverrides: {root: {backgroundImage: 'none'}}},
    MuiAppBar: {
      defaultProps: {elevation: 0, color: 'inherit'},
      styleOverrides: {root: {borderBottom: `1px solid ${neutral[100]}`, backgroundColor: neutral[0]}},
    },
    MuiChip: {defaultProps: {size: 'small'}},
    MuiDrawer: {styleOverrides: {paper: {borderRight: `1px solid ${neutral[100]}`}}},
    MuiTooltip: {defaultProps: {arrow: true}},
  },
});

export default theme;
