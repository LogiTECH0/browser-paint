import { useRef, useEffect, useState } from 'react';
import './App.css';
import Brush from './img/brush.png';
import Eraser from './img/eraser.png';
import Clear from './img/clear.png';
import Download from './img/download.png';
import Fill from './img/fill.png';

function Tools({ onToolSelect, selectedTool }) { // панель інструментів
  const toolIcons = [
    { name: 'brush', icon: Brush },
    { name: 'eraser', icon: Eraser },
    { name: 'fill', icon: Fill },
    { name: 'clear', icon: Clear },
    { name: 'download', icon: Download }
  ];

  return (
    <div style={{ display: 'flex', flexWrap: 'wrap' }} className='tools'>
      {toolIcons.map((tool, index) => (
        <button
          key={index}
          style={{
            backgroundImage: `url(${tool.icon})`,
            backgroundSize: 'cover',
            width: '48px',
            height: '48px',
            border: selectedTool === tool.name ? '2px solid black' : '1px solid black',
            cursor: 'pointer'
          }}
          onClick={() => onToolSelect(tool.name)}
        />
      ))}
    </div>
  );
}
function colorStringToRGBA(color) {
  const tempCtx = document.createElement('canvas').getContext('2d');
  tempCtx.fillStyle = color;
  const computed = tempCtx.fillStyle; //rgb(r, g, b)
  if (computed.startsWith('#')) {
    const r = parseInt(computed.slice(1, 3), 16);
    const g = parseInt(computed.slice(3, 5), 16);
    const b = parseInt(computed.slice(5, 7), 16);
    return [r, g, b, 255];
  }
  
  const match = computed.match(/^rgb(a?)\((\d+),\s*(\d+),\s*(\d+)/i);
  if (match) {
    const r = parseInt(match[2], 10);
    const g = parseInt(match[3], 10);
    const b = parseInt(match[4], 10);
    return [r, g, b, 255];
  }

  const r = parseInt(computed.slice(1, 3), 16);
  const g = parseInt(computed.slice(3, 5), 16);
  const b = parseInt(computed.slice(5, 7), 16);
  return [r, g, b, 255];
}

function colorsMatch(c1, c2) { 
  return c1[0] === c2[0] &&
         c1[1] === c2[1] &&
         c1[2] === c2[2] &&
         c1[3] === c2[3];
}

function floodFill(imageData, x, y, targetColor, fillColor) { 
  const { data, width, height } = imageData;
  const stack = [[x, y]];

  while (stack.length) {
    const [cx, cy] = stack.pop();
    const pos = (cy * width + cx) * 4;

    if (!colorsMatch([
      data[pos], data[pos + 1], data[pos + 2], data[pos + 3]
    ], targetColor)) continue;

    data[pos] = fillColor[0];
    data[pos + 1] = fillColor[1];
    data[pos + 2] = fillColor[2];
    data[pos + 3] = fillColor[3];

    if (cx > 0) stack.push([cx - 1, cy]);
    if (cx < width - 1) stack.push([cx + 1, cy]);
    if (cy > 0) stack.push([cx, cy - 1]);
    if (cy < height - 1) stack.push([cx, cy + 1]);
  }
}

function Paint({ color, tool }) { // полотно для малювання
  const canvasRef = useRef(null);
  const ctxRef = useRef(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [prevPos, setPrevPos] = useState({ x: 0, y: 0 });
  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    canvas.width = 800;
    canvas.height = 600;

    ctx.fillStyle = "white";
    ctx.fillRect(0, 0, canvas.width, canvas.height); // початкове біле полотно

    ctxRef.current = ctx;
  }, []);
  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = ctxRef.current;

    if (!ctx) return;

    if (tool === 'clear') {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = 'white';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    } 

    if (tool === 'download') { // завантаження малюнка
      const canvas = canvasRef.current; 
      const tempCanvas = document.createElement('canvas');
      tempCanvas.width = canvas.width;
      tempCanvas.height = canvas.height;
      const tempCtx = tempCanvas.getContext('2d');
      tempCtx.fillStyle = 'white';
      tempCtx.fillRect(0, 0, tempCanvas.width, tempCanvas.height);
      tempCtx.drawImage(canvas, 0, 0);
      const link = document.createElement('a');
      link.download = 'drawing.png';
      link.href = tempCanvas.toDataURL('image/png'); // використання тимчасового полотна
      link.click();
    }
  }, [tool]);
  const handleFill = (e) => {
  if (tool !== 'fill') return;

  const canvas = canvasRef.current;
  const ctx = ctxRef.current;
  const rect = canvas.getBoundingClientRect();

  const x = Math.floor(e.clientX - rect.left);
  const y = Math.floor(e.clientY - rect.top);

  const fillColor = colorStringToRGBA(color); // <-- беремо колір із state
  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  const data = imageData.data;
  const startPos = (y * canvas.width + x) * 4;
  const targetColor = [
    data[startPos],
    data[startPos + 1],
    data[startPos + 2],
    data[startPos + 3]
  ];

  if (colorsMatch(targetColor, fillColor)) return;

  floodFill(imageData, x, y, targetColor, fillColor);
  ctx.putImageData(imageData, 0, 0);
};
  useEffect(() => { // гумка та пензлик
    const canvas = canvasRef.current;
    const ctx = ctxRef.current;

    const startDrawing = (e) => {
      setIsDrawing(true);
      setPrevPos(getMousePos(e));

      const ctx = ctxRef.current;
  
      if (tool === 'eraser') {
        ctx.globalCompositeOperation = 'destination-out'; // гумка!
        ctx.lineWidth = 12;
      } else {
        ctx.globalCompositeOperation = 'source-over'; // звичайний режим
        ctx.strokeStyle = color;
        ctx.lineWidth = 4;
      }
    };


    const draw = (e) => { // малювання
      if (!isDrawing) return;
      const currentPos = getMousePos(e);

      ctx.globalCompositeOperation = tool === 'eraser' ? 'destination-out' : 'source-over';
      ctx.strokeStyle = tool === 'eraser' ? 'white' : color; 
      ctx.lineWidth = tool === 'eraser' ? 12 : 4;


      ctx.beginPath();
      ctx.moveTo(prevPos.x, prevPos.y);
      ctx.lineTo(currentPos.x, currentPos.y);
      ctx.stroke();

      setPrevPos(currentPos);
    };

    const stopDrawing = () => {
      setIsDrawing(false);
      const ctx = ctxRef.current;
      ctx.globalCompositeOperation = 'source-over';
    };


    const getMousePos = (e) => {
      const rect = canvas.getBoundingClientRect();
      return {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
      };
    };

    canvas.addEventListener('mousedown', startDrawing);
    canvas.addEventListener('mousemove', draw);
    canvas.addEventListener('mouseup', stopDrawing);
    canvas.addEventListener('mouseleave', stopDrawing);

    return () => {
      canvas.removeEventListener('mousedown', startDrawing);
      canvas.removeEventListener('mousemove', draw);
      canvas.removeEventListener('mouseup', stopDrawing);
      canvas.removeEventListener('mouseleave', stopDrawing);
    };
  }, [color, tool, isDrawing, prevPos]);

  return (
    <div className='canvas'>
      <canvas ref={canvasRef} onClick={handleFill}></canvas>
    </div>
  );
}

function Colors({ onColorSelect }) { // вибір кольорів
  const colors = [
    '#330000','#660000','#990000', '#CC0000', '#FF0000', '#FF3333', '#FF6666', '#FF9999','#FFCCCC',
    '#331900','#663300','#994C00', '#CC6600', '#FF8000', '#FF9933', '#FFB266', '#FFCC99','#FFE5CC',
    '#333300','#666600','#999900', '#CCCC00', '#FFFF00', '#FFFF33', '#FFFF66', '#FFFF99','#FFFFCC',
    '#193300','#336600','#4C9900', '#66CC00', '#80FF00', '#99FF33', '#B2FF66', '#CCFF99','#E5FFCC',
    '#003300','#006600','#009900', '#00CC00', '#00FF00', '#33FF33', '#66FF66', '#99FF99','#CCFFCC',
    '#003319','#006633','#00994C', '#00CC66', '#00FF80', '#33FF99', '#66FFB2', '#99FFCC','#CCFFE5',
    '#003333','#006666','#009999', '#00CCCC', '#00FFFF', '#33FFFF', '#66FFFF', '#99FFFF','#CCFFFF',
    '#001933','#003366','#004C99', '#0066CC', '#0080FF', '#3399FF', '#66B2FF', '#99CCFF','#CCE5FF',
    '#000033','#000066','#000099', '#0000CC', '#0000FF', '#3333FF', '#6666FF', '#9999FF','#CCCCFF',
    '#190033','#330066','#4C0099', '#6600CC', '#8000FF', '#9933FF', '#B266FF', '#CC99FF','#E5CCFF',
    '#330033','#660066','#990099', '#CC00CC', '#FF00FF', '#FF33FF', '#FF66FF', '#FF99FF','#FFCCFF',
    '#330019','#660033','#99004C', '#CC0066', '#FF0080', '#FF3399', '#FF66B2', '#FF99CC','#FFCCE5',
    '#000000','#202020','#404040', '#606060', '#808080', '#A0A0A0', '#C0C0C0', '#E0E0E0','#FFFFFF'
  ];

  return (
    <div style={{ display: 'flex', flexWrap: 'wrap' }} className='colors'>
      {colors.map((color) => (
        <button
          key={color}
          style={{
            backgroundColor: color,
            width: '32px',
            height: '32px',
            border: '1px solid black',
            cursor: 'pointer',
          }}
          onClick={() => onColorSelect(color)}
        />
      ))}
    </div>
  );
}

export default function App() { // головний компонент
  const [selectedColor, setSelectedColor] = useState('black');
  const [tool, setTool] = useState('brush');
  const [showChangelog, setShowChangelog] = useState(false);

  const handleToolSelect = (name) => {
  setTool(name);
  if (name === 'clear' || name === 'download') {
     setTimeout(() => setTool('brush'), 0);
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
      <div style={{ textAlign: 'center' }}>
        <h1>BROWSER PAINT</h1>
        <h2>you can draw whatever you want here :3</h2>
      </div>
      <div className="paint-layout">
        <div>
          <Tools onToolSelect={handleToolSelect} selectedTool={tool} />
          <Paint color={selectedColor} tool={tool} />
        </div>
        <Colors onColorSelect={setSelectedColor} />
      </div>
      <div style={{ textAlign: 'center' }} className='creds'>
        <h2>Credits</h2>
        <a href='https://github.com/LogiTECH0'>Github</a>
        <a href='https://t.me/ukrainian_dev'>Telegram</a>
      </div>
      {showChangelog && (
        <div className="changelog-overlay" onClick={closeChangelog}>
          <div className="changelog-modal" onClick={(e) => e.stopPropagation()} role="dialog" aria-modal="true">
            <button className="changelog-close" onClick={closeChangelog} aria-label="Close">×</button>
            <h3>🖌️ Browser Paint v1.1.0 — Update</h3>
            <div className="changelog-content">
              <ul>
                <li>✨ Added a new <strong>Fill tool</strong> — paint areas just like in MS Paint.</li>
                <li>🎨 Expanded color palette with more shades and variety.</li>
                <li>🧽 Improved eraser and export (white background in downloads).</li>
                <li>🐞 Fixed color-related bugs — no more forced black fills or color resets.</li>
                <li>⚡ General performance and stability improvements.</li>
              </ul>
              <p><strong>Author:</strong> Delured · <strong>Date:</strong> Oct 26, 2025</p>
            </div>
            <h3>🖌️ Browser Paint v1.1.0 — Оновлення</h3>
            <div className="changelog-content">
              <ul>
                <li>✨ Додано новий інструмент <strong>заливку (Fill)</strong> — тепер можна фарбувати області як у справжньому Paint.</li>
                <li>🎨 Розширено палітру кольорів — ще більше відтінків для малювання.</li>
                <li>🧽 Покращено роботу гумки та збереження з білим фоном.</li>
                <li>🐞 Виправлено баги з чорним кольором заливки та зниканням кольорів після перемикання інструментів.</li>
                <li>⚡ Загальна оптимізація та стабільність.</li>
              </ul>
              <p><strong>Автор:</strong> Delured · <strong>Дата:</strong> 26.10.2025</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
