import React from "react";
import {
  Box,
  Container,
  Typography,
  Grid,
  Link,
  IconButton,
  Divider,
} from "@mui/material";
import {
  GitHub as GitHubIcon,
  Twitter as TwitterIcon,
  LinkedIn as LinkedInIcon,
  Security as SecurityIcon,
  Email as EmailIcon,
} from "@mui/icons-material";

const Footer = () => {
  const footerLinks = {
    Product: ["Features", "API Documentation", "Pricing", "Changelog"],
    Resources: ["Documentation", "Tutorials", "Blog", "Support"],
    Company: ["About Us", "Careers", "Contact", "Partners"],
    Legal: ["Privacy Policy", "Terms of Service", "Security", "Compliance"],
  };

  return (
    <Box
      component="footer"
      sx={{
        position: "relative",
        zIndex: 1,
        mt: 12,
        pt: 8,
        pb: 4,
        background:
          "linear-gradient(180deg, transparent 0%, rgba(15, 15, 26, 0.95) 100%)",
        borderTop: "1px solid rgba(255, 255, 255, 0.05)",
      }}
    >
      <Container maxWidth="lg">
        <Grid container spacing={4}>
          {/* Brand Section */}
          <Grid item xs={12} md={4}>
            <Box
              sx={{ display: "flex", alignItems: "center", gap: 1.5, mb: 2 }}
            >
              <Box
                sx={{
                  width: 40,
                  height: 40,
                  borderRadius: "10px",
                  background:
                    "linear-gradient(135deg, #FF6B35 0%, #F7C815 100%)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <SecurityIcon sx={{ color: "#1a1a2e", fontSize: 24 }} />
              </Box>
              <Typography
                variant="h6"
                sx={{
                  fontFamily: '"Space Grotesk", sans-serif',
                  fontWeight: 700,
                  background: "linear-gradient(135deg, #FF6B35, #F7C815)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                }}
              >
                HoneyGuard
              </Typography>
            </Box>
            <Typography
              variant="body2"
              color="text.secondary"
              sx={{ mb: 3, maxWidth: 300 }}
            >
              AI-powered scam detection system protecting users from online
              fraud through intelligent honeypot technology.
            </Typography>
            <Box sx={{ display: "flex", gap: 1 }}>
              {[TwitterIcon, LinkedInIcon, EmailIcon].map((Icon, index) => (
                <IconButton
                  key={index}
                  size="small"
                  sx={{
                    color: "text.secondary",
                    border: "1px solid rgba(255, 255, 255, 0.1)",
                    "&:hover": {
                      color: "primary.main",
                      borderColor: "primary.main",
                      background: "rgba(255, 107, 53, 0.1)",
                    },
                  }}
                >
                  <Icon fontSize="small" />
                </IconButton>
              ))}
            </Box>
          </Grid>

          {/* Links Sections */}
          {Object.entries(footerLinks).map(([title, links]) => (
            <Grid item xs={6} sm={3} md={2} key={title}>
              <Typography
                variant="subtitle2"
                sx={{ fontWeight: 600, mb: 2, color: "text.primary" }}
              >
                {title}
              </Typography>
              <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
                {links.map((link) => (
                  <Link
                    key={link}
                    href="#"
                    underline="none"
                    sx={{
                      color: "text.secondary",
                      fontSize: "0.875rem",
                      transition: "color 0.2s",
                      "&:hover": { color: "primary.main" },
                    }}
                  >
                    {link}
                  </Link>
                ))}
              </Box>
            </Grid>
          ))}
        </Grid>

        <Divider sx={{ my: 4, borderColor: "rgba(255, 255, 255, 0.1)" }} />

        <Box
          sx={{
            display: "flex",
            flexDirection: { xs: "column", sm: "row" },
            justifyContent: "space-between",
            alignItems: "center",
            gap: 2,
          }}
        >
          <Typography variant="body2" color="text.secondary">
            © 2026 HoneyGuard. All rights reserved.
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Made with ❤️ for a safer internet
          </Typography>
        </Box>
      </Container>
    </Box>
  );
};

export default Footer;
