import { useRef, useEffect, useState } from 'react';
import './App.css';
import Brush from './img/brush.png';
import Eraser from './img/eraser.png';
import Clear from './img/clear.png';
import Download from './img/download.png';

function Tools({ onToolSelect }) {
  const toolIcons = [
    { name: 'brush', icon: Brush },
    { name: 'eraser', icon: Eraser },
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
            border: '1px solid black',
            cursor: 'pointer'
          }}
          onClick={() => onToolSelect(tool.name)}
        />
      ))}
    </div>
  );
}

function Paint({ color, tool }) {
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
      ctx.fillStyle = "white";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    }

    if (tool === 'download') {
      const link = document.createElement('a');
      link.download = 'drawing.png';
      link.href = canvas.toDataURL('image/png');
      link.click();
    }
  }, [tool]);
  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = ctxRef.current;

    const startDrawing = (e) => {
      setIsDrawing(true);
      setPrevPos(getMousePos(e));
    };

    const draw = (e) => {
      if (!isDrawing) return;
      const currentPos = getMousePos(e);

      ctx.strokeStyle = tool === 'eraser' ? 'white' : color;
      ctx.lineWidth = tool === 'eraser' ? 8 : 4
      ctx.lineCap = 'round';

      ctx.beginPath();
      ctx.moveTo(prevPos.x, prevPos.y);
      ctx.lineTo(currentPos.x, currentPos.y);
      ctx.stroke();

      setPrevPos(currentPos);
    };

    const stopDrawing = () => setIsDrawing(false);

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
      <canvas ref={canvasRef}></canvas>
    </div>
  );
}

function Colors({ onColorSelect }) {
  const colors = [
    'red', 'orange', 'yellow', 'lime', 'green', 'deepskyblue',
    'blue', 'purple', 'pink', 'black', 'gray', 'white'
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

export default function App() {
  const [selectedColor, setSelectedColor] = useState('black');
  const [tool, setTool] = useState('brush');

  return (
    <div>
      <div style={{ textAlign: 'center' }}>
        <h1>BROWSER PAINT</h1>
        <h2>you can draw whatever you want here :3</h2>
      </div>
      <div className="paint-layout">
        <div>
          <Tools onToolSelect={setTool} />
          <Paint color={selectedColor} tool={tool} />
        </div>
        <Colors onColorSelect={setSelectedColor} />
      </div>
      <div style={{ textAlign: 'center' }} className='creds'>
        <h2>Credits</h2>
        <a href='https://github.com/LogiTECH0'>Github</a>
      </div>
    </div>
  );
}
