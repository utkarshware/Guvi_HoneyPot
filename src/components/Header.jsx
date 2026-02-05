import React, { useState, useEffect } from "react";
import {
  AppBar,
  Toolbar,
  Typography,
  Box,
  Button,
  IconButton,
  Drawer,
  List,
  ListItem,
  ListItemText,
  useMediaQuery,
  useTheme,
  Avatar,
  Menu,
  MenuItem,
  Divider,
  Chip,
} from "@mui/material";
import {
  Menu as MenuIcon,
  Security as SecurityIcon,
  Logout as LogoutIcon,
  Person as PersonIcon,
  Key as KeyIcon,
} from "@mui/icons-material";
import { motion } from "framer-motion";
import { useAuth } from "../context/AuthContext";

const Header = () => {
  const { user, apiKey, logout } = useAuth();
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleProfileClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    handleClose();
    logout();
  };

  const copyApiKey = () => {
    navigator.clipboard.writeText(apiKey);
    handleClose();
  };

  const navItems = ["Features", "API Docs", "About"];

  return (
    <AppBar
      position="fixed"
      elevation={0}
      sx={{
        background: scrolled ? "rgba(15, 15, 26, 0.95)" : "transparent",
        backdropFilter: scrolled ? "blur(20px)" : "none",
        borderBottom: scrolled ? "1px solid rgba(255, 255, 255, 0.1)" : "none",
        transition: "all 0.3s ease-in-out",
      }}
    >
      <Toolbar sx={{ justifyContent: "space-between", py: 1 }}>
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
            <Box
              sx={{
                width: 45,
                height: 45,
                borderRadius: "12px",
                background: "linear-gradient(135deg, #FF6B35 0%, #F7C815 100%)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                boxShadow: "0 4px 15px rgba(255, 107, 53, 0.4)",
              }}
            >
              <SecurityIcon sx={{ color: "#1a1a2e", fontSize: 28 }} />
            </Box>
            <Box>
              <Typography
                variant="h6"
                sx={{
                  fontFamily: '"Space Grotesk", sans-serif',
                  fontWeight: 700,
                  background: "linear-gradient(135deg, #FF6B35, #F7C815)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  letterSpacing: "-0.5px",
                }}
              >
                HoneyGuard
              </Typography>
              <Typography
                variant="caption"
                sx={{ color: "text.secondary", fontSize: "0.65rem" }}
              >
                AI Scam Detection
              </Typography>
            </Box>
          </Box>
        </motion.div>

        {isMobile ? (
          <>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <IconButton onClick={handleProfileClick}>
                <Avatar
                  sx={{
                    width: 36,
                    height: 36,
                    background: "linear-gradient(135deg, #FF6B35, #F7C815)",
                    fontSize: "1rem",
                  }}
                >
                  {user?.name?.charAt(0).toUpperCase()}
                </Avatar>
              </IconButton>
              <IconButton color="inherit" onClick={() => setMobileOpen(true)}>
                <MenuIcon />
              </IconButton>
            </Box>
            <Drawer
              anchor="right"
              open={mobileOpen}
              onClose={() => setMobileOpen(false)}
              PaperProps={{
                sx: {
                  background: "rgba(26, 26, 46, 0.98)",
                  backdropFilter: "blur(20px)",
                  width: 280,
                },
              }}
            >
              <List sx={{ pt: 4 }}>
                {navItems.map((item) => (
                  <ListItem
                    button
                    key={item}
                    onClick={() => setMobileOpen(false)}
                    sx={{ py: 2, px: 4 }}
                  >
                    <ListItemText
                      primary={item}
                      primaryTypographyProps={{ fontWeight: 600 }}
                    />
                  </ListItem>
                ))}
                <Divider sx={{ my: 2 }} />
                <ListItem button onClick={handleLogout} sx={{ py: 2, px: 4 }}>
                  <ListItemText
                    primary="Logout"
                    primaryTypographyProps={{
                      fontWeight: 600,
                      color: "error.main",
                    }}
                  />
                </ListItem>
              </List>
            </Drawer>
          </>
        ) : (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
          >
            <Box sx={{ display: "flex", alignItems: "center", gap: 3 }}>
              {navItems.map((item) => (
                <Typography
                  key={item}
                  sx={{
                    cursor: "pointer",
                    fontWeight: 500,
                    color: "text.secondary",
                    transition: "color 0.2s",
                    "&:hover": { color: "primary.main" },
                  }}
                >
                  {item}
                </Typography>
              ))}
              <Chip
                label={`API: ${apiKey?.slice(0, 8)}...`}
                size="small"
                sx={{
                  background: "rgba(255, 107, 53, 0.15)",
                  border: "1px solid rgba(255, 107, 53, 0.3)",
                  cursor: "pointer",
                }}
                onClick={copyApiKey}
              />
              <IconButton onClick={handleProfileClick}>
                <Avatar
                  sx={{
                    width: 40,
                    height: 40,
                    background: "linear-gradient(135deg, #FF6B35, #F7C815)",
                  }}
                >
                  {user?.name?.charAt(0).toUpperCase()}
                </Avatar>
              </IconButton>
            </Box>
          </motion.div>
        )}

        {/* Profile Menu */}
        <Menu
          anchorEl={anchorEl}
          open={Boolean(anchorEl)}
          onClose={handleClose}
          PaperProps={{
            sx: {
              background: "rgba(26, 26, 46, 0.98)",
              backdropFilter: "blur(20px)",
              border: "1px solid rgba(255, 255, 255, 0.1)",
              borderRadius: 2,
              minWidth: 200,
              mt: 1,
            },
          }}
        >
          <Box sx={{ px: 2, py: 1.5 }}>
            <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
              {user?.name}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {user?.email}
            </Typography>
          </Box>
          <Divider sx={{ borderColor: "rgba(255, 255, 255, 0.1)" }} />
          <MenuItem onClick={handleClose} sx={{ gap: 1.5 }}>
            <PersonIcon fontSize="small" />
            Profile Settings
          </MenuItem>
          <MenuItem onClick={copyApiKey} sx={{ gap: 1.5 }}>
            <KeyIcon fontSize="small" />
            Copy API Key
          </MenuItem>
          <Divider sx={{ borderColor: "rgba(255, 255, 255, 0.1)" }} />
          <MenuItem
            onClick={handleLogout}
            sx={{ gap: 1.5, color: "error.main" }}
          >
            <LogoutIcon fontSize="small" />
            Logout
          </MenuItem>
        </Menu>
      </Toolbar>
    </AppBar>
  );
};

export default Header;
