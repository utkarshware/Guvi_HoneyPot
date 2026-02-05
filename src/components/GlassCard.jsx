import React from "react";
import { Card, CardContent, Box } from "@mui/material";
import { motion } from "framer-motion";

const GlassCard = ({
  children,
  sx = {},
  hover = true,
  glow = false,
  ...props
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      whileHover={hover ? { y: -5, transition: { duration: 0.2 } } : {}}
    >
      <Card
        sx={{
          position: "relative",
          overflow: "hidden",
          transition: "all 0.3s ease-in-out",
          ...(hover && {
            "&:hover": {
              boxShadow: "0 20px 40px rgba(0, 0, 0, 0.4)",
              border: "1px solid rgba(255, 107, 53, 0.3)",
            },
          }),
          ...(glow && {
            "&::before": {
              content: '""',
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              height: "2px",
              background:
                "linear-gradient(90deg, transparent, #FF6B35, #F7C815, transparent)",
            },
          }),
          ...sx,
        }}
        {...props}
      >
        <CardContent sx={{ p: 3 }}>{children}</CardContent>
      </Card>
    </motion.div>
  );
};

export default GlassCard;
