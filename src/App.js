import { useRef, useEffect, useState } from 'react';
import './App.css';

function Paint({ color }) {
  const canvasRef = useRef(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [prevPos, setPrevPos] = useState({ x: 0, y: 0 });
  useEffect(() => {
  const canvas = canvasRef.current;
  const ctx = canvas.getContext('2d');

  const startDrawing = (e) => {
    setIsDrawing(true);
    setPrevPos(getMousePos(e));
  };

  const draw = (e) => {
    if (!isDrawing) return;
    const currentPos = getMousePos(e);

    ctx.strokeStyle = color;   
    ctx.lineWidth = 3;
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
  }, [color, isDrawing, prevPos]);

  return (
    <div className='canvas'>
      <canvas ref={canvasRef} width={800} height={600}></canvas>
    </div>
  );
}
function ColorsNBrushes({ onColorSelect }) {
  const colors = [
    'red', 'orange', 'yellow', 'lime', 'green', 'deepskyblue',
    'blue', 'purple', 'pink', 'black', 'gray', 'white'
  ];

  return (
    <div style={{ display: 'flex', flexWrap: 'wrap' }} className='colors'>
      {colors.map((color) => (
        <button
          key={color}
          id={color}
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
  return (
    <div>
      <div style={{ textAlign: 'center' }}>
        <h1>BROWSER PAINT</h1>
        <h2>you can draw whatever you want here :3</h2>
      </div>
      <div className="paint-layout">
        <Paint color={selectedColor} />
        <div>
          <ColorsNBrushes onColorSelect={setSelectedColor} />
        </div>
      </div>
      <div style={{ textAlign: 'center' }} className='creds'>
        <h2>Credits</h2>
        <a href='https://github.com/LogiTECH0'>Github</a>
      </div>
    </div>
  );
}
