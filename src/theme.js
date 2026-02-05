import { createTheme, alpha } from "@mui/material/styles";

const theme = createTheme({
  palette: {
    mode: "dark",
    primary: {
      main: "#FF6B35",
      light: "#ff8555",
      dark: "#e55a25",
      contrastText: "#fff",
    },
    secondary: {
      main: "#F7C815",
      light: "#f9d645",
      dark: "#d4ab00",
      contrastText: "#000",
    },
    background: {
      default: "#0f0f1a",
      paper: "#1a1a2e",
    },
    text: {
      primary: "#ffffff",
      secondary: "rgba(255, 255, 255, 0.7)",
    },
    error: {
      main: "#ff4757",
    },
    warning: {
      main: "#ffa502",
    },
    success: {
      main: "#2ed573",
    },
    info: {
      main: "#70a1ff",
    },
    divider: "rgba(255, 255, 255, 0.12)",
  },
  typography: {
    fontFamily:
      '"Inter", "Space Grotesk", -apple-system, BlinkMacSystemFont, sans-serif',
    h1: {
      fontFamily: '"Space Grotesk", sans-serif',
      fontWeight: 700,
      fontSize: "3.5rem",
      letterSpacing: "-0.02em",
    },
    h2: {
      fontFamily: '"Space Grotesk", sans-serif',
      fontWeight: 600,
      fontSize: "2.5rem",
      letterSpacing: "-0.01em",
    },
    h3: {
      fontFamily: '"Space Grotesk", sans-serif',
      fontWeight: 600,
      fontSize: "2rem",
    },
    h4: {
      fontFamily: '"Space Grotesk", sans-serif',
      fontWeight: 600,
      fontSize: "1.5rem",
    },
    h5: {
      fontWeight: 600,
      fontSize: "1.25rem",
    },
    h6: {
      fontWeight: 600,
      fontSize: "1rem",
    },
    body1: {
      fontSize: "1rem",
      lineHeight: 1.7,
    },
    body2: {
      fontSize: "0.875rem",
      lineHeight: 1.6,
    },
    button: {
      fontWeight: 600,
      textTransform: "none",
    },
  },
  shape: {
    borderRadius: 16,
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          padding: "12px 24px",
          fontSize: "1rem",
          boxShadow: "none",
          "&:hover": {
            boxShadow: "0 8px 25px rgba(255, 107, 53, 0.3)",
          },
        },
        contained: {
          background: "linear-gradient(135deg, #FF6B35 0%, #F7C815 100%)",
          "&:hover": {
            background: "linear-gradient(135deg, #ff8555 0%, #f9d645 100%)",
          },
        },
        outlined: {
          borderWidth: 2,
          "&:hover": {
            borderWidth: 2,
          },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          background:
            "linear-gradient(145deg, rgba(26, 26, 46, 0.9) 0%, rgba(22, 33, 62, 0.9) 100%)",
          backdropFilter: "blur(20px)",
          border: "1px solid rgba(255, 255, 255, 0.1)",
          borderRadius: 24,
          boxShadow: "0 8px 32px rgba(0, 0, 0, 0.3)",
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: "none",
        },
      },
    },
    MuiTab: {
      styleOverrides: {
        root: {
          textTransform: "none",
          fontWeight: 600,
          fontSize: "1rem",
          minHeight: 64,
          "&.Mui-selected": {
            color: "#FF6B35",
          },
        },
      },
    },
    MuiTabs: {
      styleOverrides: {
        indicator: {
          height: 3,
          borderRadius: 2,
          background: "linear-gradient(90deg, #FF6B35, #F7C815)",
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          "& .MuiOutlinedInput-root": {
            borderRadius: 12,
            "&:hover .MuiOutlinedInput-notchedOutline": {
              borderColor: "#FF6B35",
            },
            "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
              borderColor: "#FF6B35",
              borderWidth: 2,
            },
          },
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          fontWeight: 500,
        },
      },
    },
  },
});

export default theme;
