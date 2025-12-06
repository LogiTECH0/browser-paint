import { useState } from "react";
import "./App.css";
import { Colors } from "./components/Colors";
import { Tools } from "./components/Tools";
import { Paint } from "./components/Paint";

export default function App() {
  // головний компонент
  const [selectedColor, setSelectedColor] = useState("black");
  const [tool, setTool] = useState("brush");
  const [showChangelog, setShowChangelog] = useState(false);

  const handleToolSelect = (name: string) => {
    setTool(name);
    if (name === "clear" || name === "download") {
      setTimeout(() => setTool("brush"), 0);
    }
  };

  const openChangelog = () => setShowChangelog(true);
  const closeChangelog = () => setShowChangelog(false);

  return (
    <div>
      <button
        type="button"
        className="changelog-anchor"
        onClick={openChangelog}
        aria-label="Open changelog"
      >
        Changelog
      </button>
      <div style={{ textAlign: "center" }}>
        <h1>CHROMIFY</h1>
        <h2>you can draw whatever you want here :)</h2>
      </div>
      <div className="paint-layout">
        <div>
          <Tools onToolSelect={handleToolSelect} selectedTool={tool} />
          <Paint color={selectedColor} tool={tool} />
        </div>
        <Colors onColorSelect={setSelectedColor} />
      </div>
      <div style={{ textAlign: "center" }} className="creds">
        <h2>Credits</h2>
        <a href="https://github.com/LogiTECH0">Github</a>
        <a href="https://t.me/ukrainian_dev">Telegram</a>
        <a href="https://buymeacoffee.com/BrimTECH">Donate</a>
      </div>
      {showChangelog && (
        <div className="changelog-overlay" onClick={closeChangelog}>
          <div
            className="changelog-modal"
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
          >
            <button
              className="changelog-close"
              onClick={closeChangelog}
              aria-label="Close"
            >
              ×
            </button>
            <br></br>
            <br></br>
            <h3>🆕 v1.2.3 — Mobile Adaptation</h3>
            <div className="changelog-content">
              <h2>🚀 New Features</h2>
              <ul>
                <li>
                  🖥 <strong>Mobile adaptation:</strong> Now you can freely use Chromify from any point of the world in your smartphone!
                </li>
              </ul>
              <h2>🛠 Fixes & Improvements</h2>
              <ul>
                <li>🐞 Fixed bug where fill could work incorrectly.</li>
                <li>
                  ⚡ Improved design which plays a big role in recognision of Chromify
                </li>
              </ul>
              <p>
                <strong>Author:</strong> Delured · <strong>Date:</strong> Dec
                06, 2025
              </p>
            </div>

            <br></br>
            <br></br>
            <br></br>

            <h3>🆕 v1.2.3 — Мобільна адаптація</h3>
            <div className="changelog-content">
              <h2>🚀 Нові можливості</h2>
              <ul>
                <li>
                  🖥 <strong>Мобільна адаптація</strong> Тепер можна вільно користуватись Chromify з будь якої точки світу, прямо у телефоні!
                </li>
              </ul>
              <h2>🛠 Виправлення та покращення</h2>
              <ul>
                <li>🐞 Виправлено баг, коли заповнення було некоректним.</li>
                <li>
                  ⚡ Поліпшений дизайн, що грає велику роль у впізнаванні Chromify.
                </li>
              </ul>
              <p>
                <strong>Автор:</strong> Delured · <strong>Дата:</strong>{" "}
                06.12.2025
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
