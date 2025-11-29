import Brush from '../img/brush.png';
import Eraser from '../img/eraser.png';
import Clear from '../img/clear.png';
import Download from '../img/download.png';
import Fill from '../img/fill.png';
import Text from '../img/text.png';
import Circle from '../img/circle.png';
import Square from '../img/square.png';
import type { Tool } from '../types/Types';


export function Tools({ onToolSelect, selectedTool }: Tool) { // панель інструментів
  const toolIcons = [
    { name: 'brush', icon: Brush },
    { name: 'eraser', icon: Eraser },
    { name: 'fill', icon: Fill },
    { name: 'circle', icon: Circle },
    { name: 'square', icon: Square },
    { name: 'text', icon: Text },
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