// Replace this function with any programmatic scene. Resolve when it ends.
// The caller owns the page transition, input lock, cleanup and focus restoration.
export async function playScene(stage, { reducedMotion = false } = {}) {
  const duration = reducedMotion ? 5000 : 14000;
  const photo = stage.querySelector('.scene-image');
  const caption = stage.querySelector('.scene-caption');
  const canvas = stage.querySelector('canvas');
  const progress = stage.querySelector('.scene-progress span');
  const context = canvas.getContext('2d');
  const animations = [];
  let frame;
  let width, height;
  function resize() {
    width=stage.clientWidth; height=stage.clientHeight;
    const ratio=Math.min(devicePixelRatio || 1,2);
    canvas.width=width*ratio; canvas.height=height*ratio;
    context?.setTransform(ratio,0,0,ratio,0,0);
  }
  resize();
  window.addEventListener('resize',resize);
  const animate=(element,keys,options)=>{const a=element.animate(keys,options);animations.push(a);return a;};
  const dust=Array.from({length:14},()=>({x:Math.random(),y:Math.random(),size:Math.random()*1.7+.3,depth:Math.random()+.2}));
  const start=performance.now();
  function draw(now) {
    if (!context) return;
    const t=(now-start)/1000;
    context.clearRect(0,0,width,height);
    // Independent near and far atmospheric planes create depth over the still.
    for(let i=0;i<3;i++) {
      const x=((i*.24+t*.012)%1.5-.25)*width;
      const y=height*(.30+.13*Math.sin(i*2+t*.14));
      const r=width*(.16+(i%3)*.05);
      const haze=context.createRadialGradient(x,y,0,x,y,r);
      haze.addColorStop(0,'rgba(205,203,195,.085)');haze.addColorStop(1,'rgba(205,203,195,0)');
      context.fillStyle=haze; context.fillRect(x-r,y-r,r*2,r*2);
    }
    for(const p of dust) {
      const x=((p.x+t*.008*p.depth)%1)*width;
      const y=((p.y-t*.012*p.depth)%1+1)%1*height;
      context.fillStyle=`rgba(232,225,207,${.12+p.depth*.16})`;
      context.beginPath();context.arc(x,y,p.size,0,Math.PI*2);context.fill();
    }
    frame=requestAnimationFrame(draw);
  }
  try {
    if (!reducedMotion) {
      animate(photo,[{transform:'scale(1.015) translate3d(0,0,0)'},{transform:'scale(1.15) translate3d(-1.6%,1%,25px)'}],{duration,easing:'cubic-bezier(.16,.4,.3,1)',fill:'forwards'});
      frame=requestAnimationFrame(draw);
    }
    animate(stage,[{opacity:0},{opacity:1,offset:.08},{opacity:1,offset:.90},{opacity:0}],{duration,fill:'forwards'});
    animate(caption,[{opacity:0},{opacity:0,offset:.22},{opacity:1,offset:.38},{opacity:1,offset:.72},{opacity:0,offset:.9},{opacity:0}],{duration,fill:'forwards'});
    await animate(progress,[{transform:'scaleX(0)'},{transform:'scaleX(1)'}],{duration,easing:'linear',fill:'forwards'}).finished;
  } finally {
    cancelAnimationFrame(frame);window.removeEventListener('resize',resize);
    animations.forEach(animation=>animation.cancel());
    context?.clearRect(0,0,width,height);
  }
}
