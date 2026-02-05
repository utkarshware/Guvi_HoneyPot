import React from "react";
import { Button, CircularProgress } from "@mui/material";
import { motion } from "framer-motion";

const AnimatedButton = ({
  children,
  loading = false,
  icon,
  variant = "contained",
  fullWidth = false,
  ...props
}) => {
  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      style={{ width: fullWidth ? "100%" : "auto" }}
    >
      <Button
        variant={variant}
        fullWidth={fullWidth}
        disabled={loading}
        startIcon={loading ? null : icon}
        sx={{
          position: "relative",
          overflow: "hidden",
          "&::after": {
            content: '""',
            position: "absolute",
            top: 0,
            left: "-100%",
            width: "100%",
            height: "100%",
            background:
              "linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent)",
            transition: "left 0.5s ease-in-out",
          },
          "&:hover::after": {
            left: "100%",
          },
        }}
        {...props}
      >
        {loading ? <CircularProgress size={24} color="inherit" /> : children}
      </Button>
    </motion.div>
  );
};

export default AnimatedButton;
