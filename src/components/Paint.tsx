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
  const [prevPos, setPrevPos] = useState({ x: 0, y: 0 });

  const [clickCount, setClickCount] = useState(0);

  const [textCoords, setTextCoords] = useState<{ x: number; y: number } | null>(
    null
  );
  const [textValue, setTextValue] = useState("");
  const [showTextInput, setShowTextInput] = useState(false);
  const [fontFamily, setFontFamily] = useState("Arial");

  // ---------------------- Universal Position ---------------------- //
  const getPos = (e: MouseEvent | TouchEvent) => {
    const rect = canvasRef.current!.getBoundingClientRect();
    const clientX =
      "touches" in e ? e.touches[0].clientX : (e as MouseEvent).clientX;
    const clientY =
      "touches" in e ? e.touches[0].clientY : (e as MouseEvent).clientY;
    return { x: clientX - rect.left, y: clientY - rect.top };
  };

  // ---------------------- Responsive Canvas ---------------------- //
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

      // save
      const temp = document.createElement("canvas");
      temp.width = canvas.width;
      temp.height = canvas.height;
      const tctx = temp.getContext("2d")!;
      tctx.drawImage(canvas, 0, 0);

      // scale
      canvas.style.width = displayWidth + "px";
      canvas.style.height = displayHeight + "px";
      canvas.width = Math.round(displayWidth * dpr);
      canvas.height = Math.round(displayHeight * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      // white background
      ctx.fillStyle = "white";
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // restore
      if (temp.width) {
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

  // ---------------------- Clear & Download ---------------------- //
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

  // ---------------------- Fill Bucket ---------------------- //
  const handleFill = useCallback(
    (x: number, y: number) => {
      if (tool !== "fill") return;
      const canvas = canvasRef.current!;
      const ctx = ctxRef.current!;
      const fillColor: RGBA = colorStringToRGBA(color);
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);

      const pos = (y * imageData.width + x) * 4;
      const data = imageData.data;
      const targetColor: RGBA = [
        data[pos],
        data[pos + 1],
        data[pos + 2],
        data[pos + 3],
      ];

      if (!colorsMatch(targetColor, fillColor)) {
        floodFill({ imageData, x, y, targetColor, fillColor });
        ctx.putImageData(imageData, 0, 0);
      }
    },
    [color, tool]
  );

  // ---------------------- Shapes ---------------------- //
  const handleFigure = useCallback(
    (e: MouseEvent | TouchEvent) => {
      if (!["circle", "square", "line"].includes(tool)) return;

      e.preventDefault?.();
      const { x, y } = getPos(e);

      if (clickCount === 0) {
        setFirst(x, y);
        setClickCount(1);
      } else {
        setSecond(x, y);
        setClickCount(0);
      }
    },
    [clickCount, tool, setFirst, setSecond]
  );

  // Draw shapes when coords change
  useEffect(() => {
    if (!coords || !canvasRef.current) return;
    const ctx = canvasRef.current.getContext("2d")!;
    ctx.strokeStyle = color;
    ctx.lineWidth = 4;

    if (coords.x1 && coords.y1 && coords.x2 && coords.y2) {
      if (tool === "circle") {
        const cx = (coords.x1 + coords.x2) / 2;
        const cy = (coords.y1 + coords.y2) / 2;
        const rx = Math.abs(coords.x1 - coords.x2) / 2;
        const ry = Math.abs(coords.y1 - coords.y2) / 2;
        ctx.beginPath();
        ctx.ellipse(cx, cy, rx, ry, 0, 0, Math.PI * 2);
        ctx.stroke();
      }

      if (tool === "line") {
        ctx.beginPath();
        ctx.moveTo(coords.x1, coords.y1);
        ctx.lineTo(coords.x2, coords.y2);
        ctx.stroke();
      }

      if (tool === "square") {
        const left = Math.min(coords.x1, coords.x2);
        const top = Math.min(coords.y1, coords.y2);
        const w = Math.abs(coords.x2 - coords.x1);
        const h = Math.abs(coords.y2 - coords.y1);
        ctx.strokeRect(left, top, w, h);
      }

      setFirst(0, 0);
      setSecond(0, 0);
    }
  }, [coords, tool, color, setFirst, setSecond]);

  // ---------------------- Text Tool ---------------------- //
  const handleTextClick = useCallback(
    (e: MouseEvent | TouchEvent) => {
      if (tool !== "text") return;
      e.preventDefault?.();
      const { x, y } = getPos(e);
      setTextCoords({ x, y });
      setShowTextInput(true);
    },
    [tool]
  );

  const handleTextSubmit = () => {
    if (!canvasRef.current || !textCoords) return;
    const ctx = canvasRef.current.getContext("2d")!;
    ctx.fillStyle = color;
    ctx.font = `20px ${fontFamily}`;

    document.fonts.ready.then(() => {
      ctx.fillText(textValue, textCoords.x, textCoords.y);
    });

    setTextValue("");
    setTextCoords(null);
    setShowTextInput(false);
  };

  // ---------------------- Drawing + Eraser ---------------------- //
  useEffect(() => {
    const canvas = canvasRef.current!;
    const ctx = ctxRef.current!;

    const start = (e: MouseEvent | TouchEvent) => {
      e.preventDefault?.();

      if (["circle", "square", "line", "text"].includes(tool)) return;

      if (tool === "fill") {
        const { x, y } = getPos(e);
        handleFill(Math.floor(x), Math.floor(y));
        return;
      }

      setIsDrawing(true);
      setPrevPos(getPos(e));

      ctx.globalCompositeOperation =
        tool === "eraser" ? "destination-out" : "source-over";
      ctx.lineWidth = tool === "eraser" ? 12 : 4;
      ctx.strokeStyle = tool === "eraser" ? "white" : color;
    };

    const draw = (e: MouseEvent | TouchEvent) => {
      if (!isDrawing) return;
      e.preventDefault?.();

      const current = getPos(e);
      ctx.beginPath();
      ctx.moveTo(prevPos.x, prevPos.y);
      ctx.lineTo(current.x, current.y);
      ctx.stroke();

      setPrevPos(current);
    };

    const stop = () => setIsDrawing(false);

    canvas.addEventListener("mousedown", start);
    canvas.addEventListener("mousemove", draw);
    canvas.addEventListener("mouseup", stop);
    canvas.addEventListener("mouseleave", stop);

    canvas.addEventListener("touchstart", start, { passive: false });
    canvas.addEventListener("touchmove", draw, { passive: false });
    canvas.addEventListener("touchend", stop);
    canvas.addEventListener("touchcancel", stop);

    canvas.addEventListener("click", handleFigure);
    canvas.addEventListener("touchstart", handleFigure, { passive: false });

    canvas.addEventListener("click", handleTextClick);
    canvas.addEventListener("touchstart", handleTextClick, { passive: false });

    return () => {
      canvas.removeEventListener("mousedown", start);
      canvas.removeEventListener("mousemove", draw);
      canvas.removeEventListener("mouseup", stop);
      canvas.removeEventListener("mouseleave", stop);

      canvas.removeEventListener("touchstart", start);
      canvas.removeEventListener("touchmove", draw);
      canvas.removeEventListener("touchend", stop);
      canvas.removeEventListener("touchcancel", stop);

      canvas.removeEventListener("click", handleFigure);
      canvas.removeEventListener("touchstart", handleFigure);

      canvas.removeEventListener("click", handleTextClick);
      canvas.removeEventListener("touchstart", handleTextClick);
    };
  }, [
    tool,
    isDrawing,
    prevPos,
    color,
    handleFill,
    handleFigure,
    handleTextClick,
  ]);

  return (
    <div className="canvas">
      {showTextInput && (
        <div
          className="text-modal-overlay"
          onClick={() => setShowTextInput(false)}
        >
          <div className="text-modal" onClick={(e) => e.stopPropagation()}>
            <button
              className="text-modal-close"
              onClick={() => setShowTextInput(false)}
            >
              ×
            </button>
            <label>Enter your text:</label>
            <input
              autoFocus
              value={textValue}
              onChange={(e) => setTextValue(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleTextSubmit()}
              className="text-modal-input"
            />
            <select
              value={fontFamily}
              onChange={(e) => setFontFamily(e.target.value)}
              className="text-modal-option"
            >
              {" "}
              <option value="Arial">Arial</option>{" "}
              <option value="Comic Neue">Comic Neue</option>{" "}
              <option value="Inter">Inter</option>{" "}
              <option value="Rubik">Rubik</option>{" "}
              <option value="Roboto Condensed">Roboto Condensed</option>{" "}
            </select>{" "}
            <button onClick={handleTextSubmit} className="text-modal-confirm">
              Add Text
            </button>{" "}
          </div>{" "}
        </div>
      )}{" "}
      <canvas ref={canvasRef}></canvas>{" "}
    </div>
  );
}
