import "./App.css";

import React, { useState, useEffect } from "react";
import { Button } from "@mui/material";
import SaveIcon from "@mui/icons-material/Save";
import AddIcon from "@mui/icons-material/Add";

import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { solarizedlight } from "react-syntax-highlighter/dist/esm/styles/prism";

function App() {
  const [keyDescContent, setKeyDescContent] = useState(null);
  const [isHoveringButton, setIsHoveringButton] = useState(false);
  const [textareaContent, setTextareaContent] = useState("");
  const [pasteContent, setPasteContent] = useState("");

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

  const handleTextareaChange = (event) => {
    setTextareaContent(event.target.value);
  };

  const handleSave = (content) => {
    const payload = {
      content: content,
    };

    fetch("http://localhost:3000/api/paste-create", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    })
      .then((response) => response.json())
      .then((data) => {
        console.log("Paste created successfully:", data);
        setPasteContent(content);
        const shareCode = data.share_code; // get shareCode from API response
        window.location.href = `/${shareCode}`;
      })
      .catch((error) => {
        console.error("Error creating paste:", error);
      });
  };

  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.ctrlKey && event.key === "s") {
        event.preventDefault(); // Prevent the default browser save action
        handleSave(textareaContent);
      }
    };

    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [textareaContent]);

  useEffect(() => {
    const url = window.location.href;
    const shareCode = url.substring(url.lastIndexOf("/") + 1);

    if (shareCode) {
      fetch(`http://localhost:3000/api/paste-fetch?share_code=${shareCode}`)
        .then((response) => response.json())
        .then((data) => {
          if (data.pasteEntry) {
            setPasteContent(data.pasteEntry.content);
          }
        })
        .catch((error) => {
          console.error("Error fetching paste:", error);
        });
    }
  }, []);

  return (
    <div className={`App ${pasteContent ? "pasteViewer" : "pasteCreator"}`}>
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
            onClick={() => handleSave(textareaContent)}
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

      {pasteContent ? null : <div id="linenos">&gt;</div>}

      {pasteContent ? (
        <SyntaxHighlighter
          language="java"
          style={solarizedlight}
          showLineNumbers
        >{pasteContent}</SyntaxHighlighter>
      ) : (
        <textarea
          spellCheck="false"
          value={textareaContent}
          onChange={handleTextareaChange}
        ></textarea>
      )}
    </div>
  );
}

export default App;
