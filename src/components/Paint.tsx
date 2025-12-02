import { useEffect, useRef, useState, useCallback } from "react";
import type { PaintProps } from "../types/Types";
import { colorStringToRGBA } from "../utils/ColorStringToRGBA";
import { colorsMatch } from "../utils/ColorsMatch";
import { floodFill } from "../utils/FloodFill";
import { useCoordsStore } from "../utils/ReadXY";

type RGBA = [number, number, number, number];

export function Paint({ color, tool }: PaintProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const ctxRef = useRef<CanvasRenderingContext2D | null>(null);
  const setFirst = useCoordsStore((s) => s.setFirst);
  const setSecond = useCoordsStore((s) => s.setSecond);
  const coords = useCoordsStore((s) => s.coords);
  const [isDrawing, setIsDrawing] = useState(false);
  const [prevPos, setPrevPos] = useState<{ x: number; y: number }>({
    x: 0,
    y: 0,
  });
  const [clickCount, setClickCount] = useState(0);
  const [textCoords, setTextCoords] = useState<{ x: number; y: number } | null>(
    null
  );
  const [textValue, setTextValue] = useState("");
  const [showTextInput, setShowTextInput] = useState(false);
  const [fontFamily, setFontFamily] = useState("Arial");

  useEffect(() => {
    const canvas = canvasRef.current!;
    const ctx = canvas.getContext("2d")!;

    const setupCanvas = () => {
      const dpr = window.devicePixelRatio || 1;
      const maxDisplayWidth = Math.min(
        800,
        Math.max(320, window.innerWidth - 32)
      );
      const displayWidth = maxDisplayWidth;
      const displayHeight = Math.round((displayWidth * 3) / 4);

      const temp = document.createElement("canvas");
      temp.width = canvas.width;
      temp.height = canvas.height;
      const tctx = temp.getContext("2d")!;
      tctx.drawImage(canvas, 0, 0);

      canvas.style.width = displayWidth + "px";
      canvas.style.height = displayHeight + "px";

      canvas.width = Math.round(displayWidth * dpr);
      canvas.height = Math.round(displayHeight * dpr);

      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      ctx.fillStyle = "white";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      if (temp.width && temp.height) {
        ctx.drawImage(
          temp,
          0,
          0,
          temp.width,
          temp.height,
          0,
          0,
          canvas.width,
          canvas.height
        );
      }

      ctxRef.current = ctx;
    };

    setupCanvas();
    window.addEventListener("resize", setupCanvas);
    return () => window.removeEventListener("resize", setupCanvas);
  }, []);

  // Clear та download
  useEffect(() => {
    const canvas = canvasRef.current!;
    const ctx = ctxRef.current!;
    if (tool === "clear") {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = "white";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    }
    if (tool === "download") {
      const tempCanvas = document.createElement("canvas");
      tempCanvas.width = canvas.width;
      tempCanvas.height = canvas.height;
      const tempCtx = tempCanvas.getContext("2d")!;
      tempCtx.fillStyle = "white";
      tempCtx.fillRect(0, 0, tempCanvas.width, tempCanvas.height);
      tempCtx.drawImage(canvas, 0, 0);
      const link = document.createElement("a");
      link.download = "drawing.png";
      link.href = tempCanvas.toDataURL("image/png");
      link.click();
    }
  }, [tool]);

  // Fill
  const handleFill = useCallback(
    (x: number, y: number) => {
      if (tool !== "fill") return;
      const canvas = canvasRef.current!;
      const ctx = ctxRef.current!;
      const fillColor: RGBA = colorStringToRGBA(color);
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);

      if (x < 0 || y < 0 || x >= imageData.width || y >= imageData.height)
        return;

      const pos = (y * imageData.width + x) * 4;
      const data = imageData.data;
      const targetColor: RGBA = [
        data[pos],
        data[pos + 1],
        data[pos + 2],
        data[pos + 3],
      ];

      if (colorsMatch(targetColor, fillColor)) return;

      floodFill({ imageData, x, y, targetColor, fillColor });
      ctx.putImageData(imageData, 0, 0);
    },
    [color, tool]
  );

  // обробник фігур
  const handleFigure = useCallback(
    (e: React.MouseEvent<HTMLCanvasElement>) => {
      if (!canvasRef.current) return;
      const rect = canvasRef.current.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      if (clickCount === 0) {
        setFirst(x, y);
        setClickCount(1);
        console.log("Перший клік:", x, y);
      } else {
        setSecond(x, y);
        setClickCount(0);
        console.log("Другий клік:", x, y);
      }
    },
    [clickCount, setFirst, setSecond]
  );

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const handleClickWrapper = (e: MouseEvent) => {
      if (tool === "circle" || tool === "square" || tool === "line") {
        handleFigure(e as unknown as React.MouseEvent<HTMLCanvasElement>);
      }
    };

    canvas.addEventListener("click", handleClickWrapper);

    return () => {
      canvas.removeEventListener("click", handleClickWrapper);
    };
  }, [tool, handleFigure]);
  useEffect(() => {
    if (!coords || !canvasRef.current) return;
    const ctx = canvasRef.current.getContext("2d");
    if (!ctx) return;

    ctx.strokeStyle = color;
    ctx.lineWidth = 4;

    if (
      tool === "circle" &&
      coords.x1 !== 0 &&
      coords.y1 !== 0 &&
      coords.x2 !== 0 &&
      coords.y2 !== 0
    ) {
      const centerX = (coords.x1 + coords.x2) / 2;
      const centerY = (coords.y1 + coords.y2) / 2;
      const radiusX = Math.abs(coords.x1 - coords.x2) / 2;
      const radiusY = Math.abs(coords.y1 - coords.y2) / 2;

      ctx.beginPath();
      ctx.ellipse(centerX, centerY, radiusX, radiusY, 0, 0, Math.PI*2 );
      ctx.stroke();

      setFirst(0, 0);
      setSecond(0, 0);
    }
    // лінія
    if (
      tool === "line" &&
      coords.x1 !== 0 &&
      coords.y1 !== 0 &&
      coords.x2 !== 0 &&
      coords.y2 !== 0
    ) {
      ctx.beginPath();
      ctx.moveTo(coords.x1, coords.y1)
      ctx.lineTo(coords.x2, coords.y2);
      ctx.stroke();

      setFirst(0, 0);
      setSecond(0, 0);
    }

    if (
      tool === "square" &&
      coords.x1 !== 0 &&
      coords.y1 !== 0 &&
      coords.x2 !== 0 &&
      coords.y2 !== 0
    ) {
      const left = Math.min(coords.x1, coords.x2);
      const top = Math.min(coords.y1, coords.y2);
      const width = Math.abs(coords.x2 - coords.x1);
      const height = Math.abs(coords.y2 - coords.y1);

      ctx.strokeRect(left, top, width, height);
      setFirst(0, 0);
      setSecond(0, 0);
    }
  }, [coords, tool, color, setFirst, setSecond]);

  // обробник тексту
  const handleTextClick = useCallback(
    (e: MouseEvent) => {
      if (tool !== "text" || !canvasRef.current) return;

      const rect = canvasRef.current.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      setTextCoords({ x, y });
      setShowTextInput(true);
    },
    [tool]
  );

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    canvas.addEventListener("click", handleTextClick);
    return () => {
      canvas.removeEventListener("click", handleTextClick);
    };
  }, [handleTextClick]);

  const handleTextSubmit = () => {
    if (!canvasRef.current || !textCoords) return;
    const ctx = canvasRef.current.getContext("2d");
    if (!ctx) return;

    ctx.fillStyle = color;
    ctx.font = `20px ${fontFamily}`;

    document.fonts.ready.then(() => {
      ctx.fillText(textValue, textCoords.x, textCoords.y);
    });

    setTextValue("");
    setTextCoords(null);
    setShowTextInput(false);
  };

  // Малювання та гумка
  useEffect(() => {
    const canvas = canvasRef.current!;
    const ctx = ctxRef.current!;

    const getMousePos = (e: MouseEvent | TouchEvent) => {
      const rect = canvas.getBoundingClientRect();
      let clientX: number;
      let clientY: number;
      if ("touches" in e && e.touches.length) {
        clientX = e.touches[0].clientX;
        clientY = e.touches[0].clientY;
      } else {
        const mouse = e as MouseEvent;
        clientX = mouse.clientX;
        clientY = mouse.clientY;
      }
      return { x: clientX - rect.left, y: clientY - rect.top };
    };

    const startDrawing = (e: MouseEvent | TouchEvent) => {
      e.preventDefault?.();
      if (tool === "circle" || tool === "square" || tool === "text" || tool === 'line') return;
      if (tool === "fill") {
        const { x, y } = getMousePos(e);
        handleFill(Math.floor(x), Math.floor(y));
        return;
      }
      setIsDrawing(true);
      setPrevPos(getMousePos(e));
      if (tool === "eraser") {
        ctx.globalCompositeOperation = "destination-out";
        ctx.lineWidth = 12;
      } else {
        ctx.globalCompositeOperation = "source-over";
        ctx.strokeStyle = color;
        ctx.lineWidth = 4;
      }
    };

    const draw = (e: MouseEvent | TouchEvent) => {
      e.preventDefault?.();
      if (!isDrawing) return;
      const currentPos = getMousePos(e);
      ctx.globalCompositeOperation =
        tool === "eraser" ? "destination-out" : "source-over";
      ctx.strokeStyle = tool === "eraser" ? "white" : color;
      ctx.lineWidth = tool === "eraser" ? 12 : 4;
      ctx.beginPath();
      ctx.moveTo(prevPos.x, prevPos.y);
      ctx.lineTo(currentPos.x, currentPos.y);
      ctx.stroke();
      setPrevPos(currentPos);
    };

    const stopDrawing = (e?: Event) => {
      e?.preventDefault?.();
      setIsDrawing(false);
      ctx.globalCompositeOperation = "source-over";
    };

    // Події
    canvas.addEventListener("mousedown", startDrawing);
    canvas.addEventListener("mousemove", draw);
    canvas.addEventListener("mouseup", stopDrawing);
    canvas.addEventListener("mouseleave", stopDrawing);
    canvas.addEventListener("touchstart", startDrawing, { passive: false });
    canvas.addEventListener("touchmove", draw, { passive: false });
    canvas.addEventListener("touchend", stopDrawing);
    canvas.addEventListener("touchcancel", stopDrawing);

    return () => {
      canvas.removeEventListener("mousedown", startDrawing);
      canvas.removeEventListener("mousemove", draw);
      canvas.removeEventListener("mouseup", stopDrawing);
      canvas.removeEventListener("mouseleave", stopDrawing);
      canvas.removeEventListener("touchstart", startDrawing);
      canvas.removeEventListener("touchmove", draw);
      canvas.removeEventListener("touchend", stopDrawing);
      canvas.removeEventListener("touchcancel", stopDrawing);
    };
  }, [color, tool, isDrawing, prevPos, handleFill]);

  return (
    <div className="canvas">
      {showTextInput && (
        <div
          className="text-modal-overlay"
          onClick={() => setShowTextInput(false)}
        >
          <div
            className="text-modal"
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
          >
            <button
              className="text-modal-close"
              onClick={() => setShowTextInput(false)}
              aria-label="Close"
            >
              ×
            </button>
            <label htmlFor="modalTextInput">Enter your text:</label>
            <input
              id="modalTextInput"
              className="text-modal-input"
              type="text"
              autoFocus
              value={textValue}
              onChange={(e) => setTextValue(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") handleTextSubmit();
              }}
            />
            <select
              value={fontFamily}
              onChange={(e) => setFontFamily(e.target.value)}
              className="text-modal-option"
            >
              <option value="Arial" className="arial">Arial</option>
              <option value="Comic Neue" className="comic-neue">Comic Neue</option>
              <option value="Inter" className="inter">Inter</option>
              <option value="Rubik" className="rubik">Rubik</option>
              <option value="Roboto Condensed" className="roboto-condensed">Roboto Condensed</option>
            </select>
            <button className="text-modal-confirm" onClick={handleTextSubmit}>
              Add Text
            </button>
          </div>
        </div>
      )}
      <canvas ref={canvasRef}></canvas>
    </div>
  );
}
