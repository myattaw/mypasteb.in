import "./App.css";

import React, { useState } from "react";
import { Button } from "@mui/material";
import SaveIcon from "@mui/icons-material/Save";
import AddIcon from "@mui/icons-material/Add";

function App() {
  const [keyDescContent, setKeyDescContent] = useState(null);
  const [isHoveringButton, setIsHoveringButton] = useState(false);

  const handleMouseEnter = (label, shortcut) => {
    setKeyDescContent(
      <div>
        <div className="label">{label}</div>
        <div className="shortcut">{shortcut}</div>
      </div>
    );
    setIsHoveringButton(true);
  };

  const handleMouseLeave = () => {
    setKeyDescContent(null);
    setIsHoveringButton(false);
  };

  return (
    <div className="App">
      <div id="key-box">
        <div id="key-header-box">
          <h1>MYpasteb.in</h1>
        </div>
        <div id="key-footer-box">
          <Button
            className="save function"
            startIcon={<SaveIcon />}
            onMouseEnter={() => handleMouseEnter("Save", "control + s")}
            onMouseLeave={handleMouseLeave}
            style={{ color: "#c4dce3" }}
          >
            Save
          </Button>
          <Button
            className="new function"
            startIcon={<AddIcon />}
            onMouseEnter={() => handleMouseEnter("New", "control + n")}
            onMouseLeave={handleMouseLeave}
            style={{ color: "#c4dce3" }}
          >
            New
          </Button>
        </div>

        {isHoveringButton && <div id="key-desc-box">{keyDescContent}</div>}
      </div>
      <div id="linenos">&gt;</div>
      <textarea spellCheck="false"></textarea>
    </div>
  );
}

export default App;
