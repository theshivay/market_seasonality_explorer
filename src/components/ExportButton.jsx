import React, { useState } from 'react';
import {
  IconButton,
  Tooltip,
  Button
} from '@mui/material';
import {
  GetApp,
  FileDownload
} from '@mui/icons-material';
import ExportMenu from './ExportMenu';

const ExportButton = ({ 
  calendarElement, 
  calendarData, 
  analysisData,
  variant = 'icon', // 'icon' or 'button'
  color = 'primary',
  size = 'medium'
}) => {
  const [anchorEl, setAnchorEl] = useState(null);

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  if (variant === 'button') {
    return (
      <>
        <Button
          onClick={handleClick}
          color={color}
          size={size}
          startIcon={<FileDownload />}
          variant="outlined"
        >
          Export
        </Button>
        <ExportMenu
          anchorEl={anchorEl}
          open={Boolean(anchorEl)}
          onClose={handleClose}
          calendarElement={calendarElement}
          calendarData={calendarData}
          analysisData={analysisData}
        />
      </>
    );
  }

  return (
    <>
      <Tooltip title="Export Calendar">
        <IconButton
          onClick={handleClick}
          color={color}
          size={size}
        >
          <GetApp />
        </IconButton>
      </Tooltip>
      <ExportMenu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleClose}
        calendarElement={calendarElement}
        calendarData={calendarData}
        analysisData={analysisData}
      />
    </>
  );
};

export default ExportButton;
