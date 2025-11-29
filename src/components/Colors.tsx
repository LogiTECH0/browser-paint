import type { Color } from "../types/Types";

export function Colors({ onColorSelect }: Color) { // вибір кольорів
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