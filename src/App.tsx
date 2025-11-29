import { useState, useEffect } from "react";
import "./App.css";
import { Colors } from "./components/Colors";
import { Tools } from "./components/Tools";
import { Paint } from "./components/Paint";

export default function App() {
  // головний компонент
  const [selectedColor, setSelectedColor] = useState("black");
  const [tool, setTool] = useState("brush");
  const [showChangelog, setShowChangelog] = useState(false);
  const [showTouchHint, setShowTouchHint] = useState<boolean>(false);

  useEffect(() => {
    try {
      const dismissed: string | null =
        localStorage.getItem("touchHintDismissed");
      const isTouch =
        typeof window !== "undefined" &&
        ("ontouchstart" in window || navigator.maxTouchPoints > 0);
      if (isTouch && !dismissed) {
        queueMicrotask(() => setShowTouchHint(true));
      }
    } catch {
      console.log("error");
    }
  }, []);

  const dismissTouchHint = () => {
    try {
      localStorage.setItem("touchHintDismissed", "1");
    } catch {
      console.log("error");
    }
    setShowTouchHint(false);
  };

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
      {showTouchHint && (
        <div className="touch-hint-overlay" onClick={dismissTouchHint}>
          <div className="touch-hint" onClick={(e) => e.stopPropagation()}>
            <p style={{ margin: 0 }}>
              <strong>Tip:</strong> Touch the canvas to draw. Use the toolbar to
              switch tools.
            </p>
            <button onClick={dismissTouchHint}>Got it</button>
          </div>
        </div>
      )}
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
            <h3>🆕 v1.2.0 — Shape and Text</h3>
            <div className="changelog-content">
              <h2>🚀 New Features</h2>
              <ul>
                <li>
                  🔵 <strong>Circle & Square Tools:</strong> Draw perfect shapes
                  with two clicks!
                </li>
                <li>
                  ✏️ <strong>Text Tool:</strong> Add custom text anywhere using
                  a convenient modal input.
                </li>
                <li>
                  🎨 <strong>Color Support:</strong> Shapes and text now follow
                  your selected palette color.
                </li>
                <li>
                  🖥 <strong>Click-to-Draw Modal:</strong> Text appears only
                  after choosing the location and entering content.
                </li>
              </ul>
              <h2>🛠 Fixes & Improvements</h2>
              <ul>
                <li>🐞 Fixed bug where shapes could overlap incorrectly.</li>
                <li>
                  🧹 Cleaned up shape drawing logic for smoother experience.
                </li>
                <li>
                  ⚡ Improved tool switching to prevent accidental brush drawing
                  when using shapes or text.
                </li>
              </ul>
              <p>
                <strong>Author:</strong> Delured · <strong>Date:</strong> Nov
                29, 2025
              </p>
            </div>

            <br></br>
            <br></br>
            <br></br>

            <h3>🆕 v1.2.0 — Фігури та текст</h3>
            <div className="changelog-content">
              <h2>🚀 Нові можливості</h2>
              <ul>
                <li>
                  🔵 <strong>Інструменти коло та квадрат:</strong> Малюйте
                  ідеальні фігури за два кліки!
                </li>
                <li>
                  ✏️ <strong>Інструмент текст:</strong> Додавайте власний текст
                  будь-де через зручне модальне вікно.
                </li>
                <li>
                  🎨 <strong>Підтримка кольорів:</strong> Фігури та текст
                  використовують обраний колір палітри.
                </li>
                <li>
                  🖥 <strong>Модальне введення тексту:</strong> Текст з’являється
                  лише після вибору координат і введення контенту.
                </li>
              </ul>
              <h2>🛠 Виправлення та покращення</h2>
              <ul>
                <li>🐞 Виправлено баг, коли фігури накладалися некоректно.</li>
                <li>
                  🧹 Оптимізовано логіку малювання фігур для плавнішого досвіду.
                </li>
                <li>
                  ⚡ Поліпшене переключення інструментів, щоб уникнути
                  випадкового малювання пензлем під час роботи з фігурами або
                  текстом.
                </li>
              </ul>
              <p>
                <strong>Автор:</strong> Delured · <strong>Дата:</strong>{" "}
                29.11.2025
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
