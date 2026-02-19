import React, { useState } from 'react';
import { 
  AppBar, Toolbar, Typography, Button, Menu, MenuItem, Box, IconButton,Stack 
} from '@mui/material';
import LanguageIcon from '@mui/icons-material/Language';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import LogoutIcon from '@mui/icons-material/Logout';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import { translations } from '../../utils/translations';


const Navbar = ({ currentLang, setLanguage }) => {
  const [anchorEl, setAnchorEl] = useState(null);
  const t = translations[currentLang];

  const handleOpenMenu = (event) => setAnchorEl(event.currentTarget);
  
  const handleCloseMenu = (langCode) => {
    if (langCode) setLanguage(langCode);
    setAnchorEl(null);
  };

  return (
    <AppBar position="fixed" sx={{ backgroundColor: '#006A7B', boxShadow: 1, zIndex: 1200 }}>
      <Toolbar>
        {/* LOGO */}
        <Typography variant="h6" sx={{ fontWeight: 'bold', display: 'flex', alignItems: 'center' }}>
          openIMIS 
          <Typography variant="caption" sx={{ ml: 0.5, mt: 0.5, fontWeight: 'normal', fontSize: '0.7rem' }}>
            24.10
          </Typography>
        </Typography>

        {/* SPacer */}
        <Box sx={{ flexGrow: 1 }} />

        {/* RIGHT SIDE ICONS */}
        <Stack direction="row" spacing={1} alignItems="center">
            {/* Language Selector */}
            <Button
                color="inherit"
                onClick={handleOpenMenu}
                startIcon={<LanguageIcon />}
                endIcon={<KeyboardArrowDownIcon />}
                sx={{ textTransform: 'uppercase', fontWeight: 'bold', fontSize: '0.85rem' }}
            >
                {currentLang === 'en' ? t.nav_english : t.nav_bangla}
            </Button>
            
            <Menu 
                anchorEl={anchorEl} 
                open={Boolean(anchorEl)} 
                onClose={() => handleCloseMenu(null)}
            >
                <MenuItem onClick={() => handleCloseMenu('en')}>English</MenuItem>
                <MenuItem onClick={() => handleCloseMenu('bn')}>বাংলা (Bangla)</MenuItem>
            </Menu>

            {/* Icons from the screenshot */}
            <IconButton color="inherit" size="small"><LogoutIcon fontSize="small" /></IconButton>
            <IconButton color="inherit" size="small"><HelpOutlineIcon fontSize="small" /></IconButton>
            
            {/* Profile */}
            <Button color="inherit" endIcon={<AccountCircleIcon />} sx={{ textTransform: 'none', fontWeight: 'bold' }}>
                Asma
            </Button>
        </Stack>
      </Toolbar>
    </AppBar>
  );
};

export default Navbar;