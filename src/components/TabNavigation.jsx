import React from "react";
import { Box, Tabs, Tab, Paper, Badge } from "@mui/material";
import { motion } from "framer-motion";
import {
  AudioFile as AudioIcon,
  Screenshot as ScreenshotIcon,
  QuestionAnswer as QnAIcon,
  Dashboard as DashboardIcon,
} from "@mui/icons-material";

const TabNavigation = ({ activeTab, onTabChange }) => {
  const tabs = [
    { label: "Audio Analysis", icon: <AudioIcon /> },
    { label: "Screenshot Analysis", icon: <ScreenshotIcon /> },
    { label: "Fraud Q&A", icon: <QnAIcon /> },
    { label: "Session Dashboard", icon: <DashboardIcon /> },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
    >
      <Paper
        elevation={0}
        sx={{
          background:
            "linear-gradient(145deg, rgba(26, 26, 46, 0.8) 0%, rgba(22, 33, 62, 0.8) 100%)",
          backdropFilter: "blur(20px)",
          border: "1px solid rgba(255, 255, 255, 0.1)",
          borderRadius: 4,
          mb: 4,
          overflow: "hidden",
        }}
      >
        <Tabs
          value={activeTab}
          onChange={onTabChange}
          centered
          sx={{
            "& .MuiTabs-flexContainer": {
              gap: { xs: 0, md: 4 },
            },
          }}
        >
          {tabs.map((tab, index) => (
            <Tab
              key={tab.label}
              icon={tab.icon}
              label={tab.label}
              iconPosition="start"
              sx={{
                flex: { xs: 1, md: "none" },
                minWidth: { xs: "auto", md: 180 },
                py: 2,
                color: "text.secondary",
                "&.Mui-selected": {
                  color: "primary.main",
                },
                "& .MuiSvgIcon-root": {
                  mr: 1,
                  transition: "transform 0.3s",
                },
                "&:hover .MuiSvgIcon-root": {
                  transform: "scale(1.1)",
                },
              }}
            />
          ))}
        </Tabs>
      </Paper>
    </motion.div>
  );
};

export default TabNavigation;
