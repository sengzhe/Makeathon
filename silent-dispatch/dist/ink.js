// A short-lived shadow follows the printed words beneath the text layer.
export function hauntWords(paragraph, paper) {
  const node = paragraph.firstChild;
  const range = document.createRange();
  const words = [];
  if (!node || node.nodeType !== Node.TEXT_NODE) return null;
  for (const match of node.textContent.matchAll(/\S+/g)) {
    range.setStart(node, match.index);
    range.setEnd(node, match.index + match[0].length);
    const rect = range.getBoundingClientRect();
    if (rect.width && rect.top > 0 && rect.bottom < innerHeight) words.push(rect);
  }
  if (words.length < 4) return null;
  const box = paragraph.getBoundingClientRect();
  const page = paper.getBoundingClientRect();
  const pad = 12;
  const canvas = document.createElement('canvas');
  canvas.className = 'ink-haunting';
  canvas.setAttribute('aria-hidden', 'true');
  canvas.style.left = `${box.left-page.left-pad}px`;
  canvas.style.top = `${box.top-page.top-pad}px`;
  const width = box.width + pad*2;
  const height = box.height + pad*2;
  const ratio = Math.min(devicePixelRatio || 1, 1.5);
  canvas.width = Math.ceil(width*ratio);
  canvas.height = Math.ceil(height*ratio);
  canvas.style.width = `${width}px`; canvas.style.height = `${height}px`;
  const ctx = canvas.getContext('2d');
  if (!ctx) return null;
  ctx.scale(ratio, ratio);
  paper.append(canvas);
  let index = Math.floor(Math.random()*words.length);
  let previous = -1;
  const path = [];
  for (let i=0;i<7;i++) {
    const rect=words[index];
    path.push({x:rect.left-box.left+pad,y:rect.top-box.top+pad,w:rect.width,h:rect.height});
    const nearby=words.map((r,j)=>({index:j,distance:Math.hypot(r.left+r.width/2-rect.left-rect.width/2,r.top-rect.top)}))
      .filter(candidate=>candidate.index!==index && candidate.index!==previous)
      .sort((a,b)=>a.distance-b.distance).slice(0,5);
    previous=index;
    index=nearby[Math.floor(Math.random()*nearby.length)].index;
  }
  const hop=1300;
  const unease=Math.random()*Math.PI*2;
  const duration=path.length*hop+900;
  const start=performance.now();
  let frame;
  let done;
  const finished=new Promise(resolve=>{done=resolve;});
  function cancel() { cancelAnimationFrame(frame); canvas.remove(); done(); }
  function draw(now) {
    const elapsed=now-start;
    if (elapsed>=duration) { cancel(); return; }
    ctx.clearRect(0,0,width,height);
    const position=Math.min(path.length-1,elapsed/hop);
    const current=Math.floor(position);
    const travel=position-current;
    const fade=Math.min(1,elapsed/550,(duration-elapsed)/900);
    // A slow, uneven tremor lives beneath each word before seeking the next.
    for(let i=Math.max(0,current-1);i<=current;i++) {
      const word=path[i];
      const strength=fade*(i===current ? .35+.65*Math.min(1,travel*5) : .25*Math.max(0,1-travel*3));
      const spread=.91+.06*Math.sin(elapsed*.0017+unease)+.03*Math.sin(elapsed*.0031+i);
      ctx.fillStyle=`rgba(13,13,11,${strength*.8})`;
      for(let j=0;j<13;j++) {
        const phase=elapsed*.0022+j*2.3+i+unease;
        const x=word.x+word.w*(-.02+j*.086)+Math.sin(phase*1.3)*1.3+Math.sin(elapsed*.0011+unease)*.7;
        const y=word.y+word.h*(.5+Math.sin(phase)*.065);
        const rx=Math.max(2,word.w/9)*spread*(.8+Math.sin(phase*.7)*.2);
        const ry=word.h*(.39+Math.sin(phase+1)*.08)*spread;
        ctx.beginPath();ctx.ellipse(x,y,rx,ry,Math.sin(phase)*.7,0,Math.PI*2);ctx.fill();
      }
      // Tendrils drift out of phase, giving the shadow an unsettled breathing rhythm.
      ctx.strokeStyle=`rgba(13,13,11,${strength*.65})`;
      ctx.lineWidth=.7;
      for(let j=0;j<4;j++) {
        const x=word.x+word.w*(j+1)/5;
        const y=word.y+word.h*.6;
        const twitch=.7*Math.sin(elapsed*.0027+j*3+i+unease)+.3*Math.sin(elapsed*.0013+j);
        ctx.beginPath();ctx.moveTo(x,y);
        ctx.bezierCurveTo(x+4*twitch,y-7,x-5,y+7*twitch,x+8*twitch,y-3);
        ctx.stroke();
      }
    }
    frame=requestAnimationFrame(draw);
  }
  frame=requestAnimationFrame(draw);
  return {cancel,finished};
}
