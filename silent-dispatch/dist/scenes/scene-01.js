/**
 * S1 Breakfast — local 0:00–0:42, production script HD-01…HD-07.
 * The player owns time, input, transport, transitions and the >=42s advance gate.
 * Preview limits: no recorded AU assets yet; newspaper glyphs are source artwork;
 * the pocket insert holds the HD-K4 flat-press left hand as one whole image (same
 * placement as Scene 3's HD-06 insert); never articulate fingers or clip the hand.
 */
export const assets = {
  newspaper: 'scene-01/PR-01-newspaper-front-v2.png',
  letter: 'annies-letter-v1.png',
  hands: 'tommy-hands-sleeves-v1.png',
  room: 'backgrounds/BG-01_kitchen-panorama_color_v1.png',
  crate: 'props/PR-04_crate_v1.png',
  curtain: 'props/PR-23_lace_curtain_v1.png',
  cup: 'props/PR-05_tin_cup_upright_v1.png',
  ration: 'scene-01/PR-03-ration-tin-spoon-v1.png',
  helmet: 'props/PR-07_m1_helmet_upside_down_v1.png',
  chest: 'props/PR-14_jacket-chest_clean_v1.png',
  press: 'hands/HD-K4_hand-left-flat-press_v2.png',
};
const W = 1920, H = 1080, HAND_Y = 360;
const clamp = (n, a = 0, b = 1) => Math.max(a, Math.min(b, n));
const ease = n => { n = clamp(n); return n * n * (3 - 2 * n); };
const progress = (t, a, b) => ease((t - a) / (b - a));
const lerp = (a, b, n) => a + (b - a) * n;
function surface(w = W, h = H) {
  const canvas = document.createElement('canvas');
  canvas.width = w; canvas.height = h;
  return canvas;
}
function loadImage(url, signal) {
  return new Promise((resolve, reject) => {
    if (signal?.aborted) return reject(new DOMException('Scene cancelled', 'AbortError'));
    const image = new Image();
    const cleanup = () => { image.onload = image.onerror = null; signal?.removeEventListener('abort', abort); };
    const abort = () => { cleanup(); image.src = ''; reject(new DOMException('Scene cancelled', 'AbortError')); };
    image.onload = () => { cleanup(); resolve(image); };
    image.onerror = () => { cleanup(); reject(new Error(`Scene 1 asset could not load: ${url}`)); };
    signal?.addEventListener('abort', abort, {once: true});
    image.src = url;
  });
}
// Smooth irregular contours, stable in local time, read as ink travelling along folds.
function inkPath(context, x, y, radius, seed = 0, stretch = 1) {
  context.beginPath();
  for (let i = 0; i <= 100; i++) {
    const angle = i / 100 * Math.PI * 2;
    const ripple = 1 + .105 * Math.sin(angle * 7 + seed) + .045 * Math.sin(angle * 13 - seed);
    const px = x + Math.cos(angle) * radius * ripple;
    const py = y + Math.sin(angle) * radius * ripple * stretch;
    if (i === 0) context.moveTo(px, py); else context.lineTo(px, py);
  }
  context.closePath();
}

export async function mountScene({ root, assetBase, reducedMotion = false, signal, handoff }) {
  const entries = await Promise.all(Object.entries(assets).map(async ([key, path]) => [key, await loadImage(new URL(path, assetBase).href, signal)]));
  if (signal?.aborted) throw new DOMException('Scene cancelled', 'AbortError');
  const art = Object.fromEntries(entries);
  const canvas = surface(), frame = surface(), reveal = surface();
  const ctx = canvas.getContext('2d'), c = frame.getContext('2d'), r = reveal.getContext('2d');
  if (!ctx || !c || !r) throw new Error('Scene 1 requires Canvas 2D');
  canvas.className = 'film-canvas';
  canvas.setAttribute('aria-label', 'Breakfast. A newspaper, Annie’s letter, a bandaged palm, and the letter secured in Tommy’s pocket.');
  canvas.style.cssText = 'position:absolute;inset:0;width:100%;height:100%;object-fit:contain;background:#080807;';
  root.append(canvas);
  // Static, reusable paper/ink screen: no random frame noise or flickering dots.
  const dots = surface(12, 12), dc = dots.getContext('2d');
  dc.fillStyle = 'rgba(20,17,12,.26)';
  [[3,3,1.6],[9,9,1.1]].forEach(([x,y,s]) => { dc.beginPath();dc.arc(x,y,s,0,Math.PI*2);dc.fill(); });
  const dotPattern = ctx.createPattern(dots, 'repeat');
  let disposed = false, lastTime = 0;

  function sprite(image, x, y, width, rotation = 0, source) {
    const [sx, sy, sw, sh] = source || [0, 0, image.width, image.height];
    c.save(); c.translate(x, y); c.rotate(rotation);
    c.drawImage(image, sx, sy, sw, sh, 0, 0, width, width * sh / sw);
    c.restore();
  }
  function warmRoom(t, pointer, close = false) {
    const motion = reducedMotion ? 0 : 1;
    const dx = (close ? 0 : clamp(pointer.x || 0, -1, 1) * 14) * motion;
    const dy = (close ? 0 : clamp(pointer.y || 0, -1, 1) * 7) * motion;
    c.fillStyle = '#544c3a';c.fillRect(0, 0, W, H);
    // Only the intact dresser face is used. The missing roof/wall cannot enter
    // this crop even at extreme pointer values; Scene 2 owns their reveal.
    c.save(); c.filter = 'blur(6px)';
    c.drawImage(art.room, art.room.width*.305,art.room.height*.25,art.room.width*.11,art.room.height*.28,-80+dx*.3,-100+dy*.3,2100,1350);
    c.restore();
    c.fillStyle = 'rgba(43,34,25,.3)';c.fillRect(0,0,W,H);
    sprite(art.curtain, -210 + dx * .7, -300 + dy, 760, -.035);
    // The crate top is enlarged into a foreground plane, keeping its lower edges off camera.
    sprite(art.crate, -250 + dx, 395 + dy, 2370);
    sprite(art.helmet, 1490 + dx, 440 + dy, 420, .06);
    sprite(art.ration, 360 + dx, 410 + dy, 265, -.025);
    sprite(art.cup, 1265 + dx, 540 + dy, 330, .015);
    // Steam stays attached to its host cup; each curve is deterministic in scene time.
    c.save();c.strokeStyle='rgba(241,232,209,.16)';c.lineWidth=4;c.lineCap='round';
    for(let i=0;i<5;i++) {
      const phase = reducedMotion ? i*.7 : t*.55+i*.8;
      const x=1390+dx+i*9, y=610+dy;
      c.beginPath();c.moveTo(x,y);c.bezierCurveTo(x-24+Math.sin(phase)*15,y-65,x+30,y-120,x+Math.sin(phase+1)*35,y-205-i*8);c.stroke();
    }
    c.restore();
    const beam=c.createLinearGradient(130,0,1450,1050);
    beam.addColorStop(0,'rgba(255,226,159,.19)');beam.addColorStop(.6,'rgba(255,226,159,.055)');beam.addColorStop(1,'rgba(255,226,159,0)');
    c.fillStyle=beam;c.beginPath();c.moveTo(100,0);c.lineTo(570,0);c.lineTo(1720,H);c.lineTo(580,H);c.closePath();c.fill();
    for(let i=0;i<48;i++) {
      const phase=reducedMotion?0:t;
      const x=220+((i*137+phase*(3+i%4))%1240);
      const y=((i*89-phase*(2+i%3))%H+H)%H;
      c.fillStyle=`rgba(251,233,185,${.1+(i%5)*.025})`;
      c.beginPath();c.arc(x,y,.9+i%3*.6,0,Math.PI*2);c.fill();
    }
  }
  function newspaper(t) {
    const pull = progress(t,3,9.8);
    const scale = reducedMotion ? 1 : lerp(3,1,pull);
    const sway = reducedMotion ? 0 : Math.sin(t*Math.PI*2/3.5)*4;
    const width=1700*scale;
    c.save();c.translate(W/2+sway,430+sway*.3);c.rotate(reducedMotion?0:Math.sin(t*.6)*.0015);
    c.shadowColor='rgba(0,0,0,.3)';c.shadowBlur=35;c.shadowOffsetY=22;
    // Crop away the preview's beige surround; keep every headline pixel.
    c.drawImage(art.newspaper,art.newspaper.width*.026,art.newspaper.height*.03,art.newspaper.width*.95,art.newspaper.height*.93,-width/2,-width*.31,width,width*.65);
    c.restore();
  }
  function letterGeometry(t) {
    const push = reducedMotion ? 0 : progress(t,17,30);
    const width=lerp(720,770,push);
    return {x:660-(width-720)*.5,y:70-(width-720)*.3,width,height:width*art.letter.height/art.letter.width};
  }
  function openLetter(t, exit = 0) {
    const g=letterGeometry(t);
    c.save();c.translate(0,exit*1250);
    c.shadowColor='rgba(18,13,7,.42)';c.shadowBlur=30;c.shadowOffsetY=20;
    sprite(art.letter,g.x,g.y,g.width);
    c.restore();
    if (t<33) {
      // The source sheet's bandaged palm is a right-hand silhouette. Mirror the
      // left half to get a left palm. Watch/dressing stay on the same wrist.
      c.save();c.translate(705,557);c.rotate(-.21);c.scale(-1,1);
      c.drawImage(art.hands,0,0,art.hands.width*.505,art.hands.height,0,0,415,822);
      c.restore();
    }
    return g;
  }
  function foldedLetter() {
    c.save();c.translate(920,695);c.rotate(-.075);
    c.shadowColor='rgba(0,0,0,.3)';c.shadowBlur=18;c.shadowOffsetY=12;
    // A crop of the blank paper stock is the folded state; no invented wording.
    c.drawImage(art.letter,art.letter.width*.115,art.letter.height*.11,art.letter.width*.36,art.letter.height*.13,-195,-90,390,180);
    c.shadowBlur=0;c.strokeStyle='rgba(104,88,64,.18)';c.lineWidth=2;
    c.beginPath();c.moveTo(-184,40);c.lineTo(180,37);c.stroke();c.restore();
  }
  function pocket(t) {
    c.fillStyle='#37382a';c.fillRect(0,0,W,H);
    c.save();c.translate(W,0);c.scale(-1,1);
    // Mirroring moves the supplied viewer-left pocket to Tommy's left breast.
    c.drawImage(art.chest,art.chest.width*.10,art.chest.height*.35,art.chest.width*.64,art.chest.height*.60,0,-100,W,1350);
    // Existing paper pixels, already secured; the clean master avoids the later blood stain.
    c.save();c.translate(620,385);c.rotate(-.025);
    c.drawImage(art.letter,art.letter.width*.57,art.letter.height*.08,art.letter.width*.28,art.letter.height*.12,-145,-45,290,94);
    c.restore();
    // Replace the lower paper edge with the pocket flap, an independently addressable mask.
    c.drawImage(art.chest,art.chest.width*.15,art.chest.height*.60,art.chest.width*.28,art.chest.height*.23,150,462,840,518);
    c.restore();
    if (t>=39) {
      // HD-K4 contact state, held whole: rises from the lower edge, then a small settle.
      const rise=reducedMotion?0:(1-progress(t,39,39.45))*560;
      const settle=reducedMotion?0:(1-progress(t,39.35,39.8))*12;
      const w=760, h=w*art.press.height/art.press.width;
      c.save();c.translate(1330,HAND_Y+rise+settle);c.rotate(-.12);
      c.shadowColor='rgba(10,8,5,.45)';c.shadowBlur=24;c.shadowOffsetY=14;
      c.drawImage(art.press,-w/2,0,w,h);
      c.restore();
    }
  }
  function addInk(x,y,radius,seed,stretch=1) {
    if(radius<=0)return;
    inkPath(r,x,y,radius,seed,stretch);r.fill();
  }
  function colorMask(t,g) {
    r.clearRect(0,0,W,H);r.fillStyle='#fff';
    // Host-specific order: star -> roof -> tree -> folds -> bandage -> room.
    if(t>=21) addInk(g.x+g.width*.72,g.y+g.height*.25,progress(t,21,21.8)*g.width*.135,1,1.2);
    if(t>=21.8) addInk(g.x+g.width*.29,g.y+g.height*.35,progress(t,21.8,22.5)*g.width*.145,4,.75);
    if(t>=22.4) addInk(g.x+g.width*.51,g.y+g.height*.36,progress(t,22.4,23.2)*g.width*.135,7,1.15);
    // Clip paper/fold flood to the paper footprint; room cannot colour prematurely.
    r.save();r.beginPath();r.rect(g.x+g.width*.07,g.y+g.height*.04,g.width*.88,g.height*.93);r.clip();
    addInk(g.x+g.width*.55,g.y+g.height*.52,progress(t,23.2,25.2)*g.width*.93,3,1.3);r.restore();
    r.save();r.beginPath();r.rect(270,590,470,490);r.clip();
    addInk(540,850,progress(t,25,26.8)*640,8);r.restore();
    // Four separately delayed room zones stand in for the current flattened set.
    // Upgrade to BG-01 depth masters when their kitchen continuity is approved.
    for(let i=0;i<4;i++)addInk(970,930-i*260,progress(t,26+i*.5,28+i*.5)*2300,5+i,.85);
    r.globalCompositeOperation='source-in';r.drawImage(frame,0,0);r.globalCompositeOperation='source-over';
  }
  function render({time=0, pointer={x:0,y:0}} = {}) {
    if(disposed || signal?.aborted)return;
    const t=clamp(time,0,42);lastTime=t;
    c.clearRect(0,0,W,H);
    if(t<3) {ctx.fillStyle='#080807';ctx.fillRect(0,0,W,H);return;}
    const inLetter=t>=17&&t<34.2;
    warmRoom(t,pointer,inLetter);
    let g=letterGeometry(t);
    if(t<12.6) newspaper(t);
    else if(t<17) foldedLetter();
    else if(t<34.2) g=openLetter(t,progress(t,33,34.2));
    else pocket(t);
    // T-PAPER passes directly over the lens; the insert cut happens at coverage.
    if(t>=12.25&&t<13.1) {
      const phase=(t-12.25)/.85;
      const x=lerp(-2450,2200,phase);
      c.save();c.translate(x,-180);c.rotate(-.04);
      c.drawImage(art.newspaper,0,0,art.newspaper.width,art.newspaper.height,0,0,2500,1600);c.restore();
    }
    ctx.clearRect(0,0,W,H);
    if(t<29.5) {
      const blur=reducedMotion?0:(1-progress(t,3,8))*12;
      ctx.filter=`grayscale(1) sepia(.12) contrast(.94) blur(${blur}px)`;
      ctx.drawImage(frame,0,0);ctx.filter='none';
      ctx.save();ctx.globalCompositeOperation='multiply';ctx.fillStyle=dotPattern;ctx.fillRect(0,0,W,H);ctx.restore();
      if(t>=21) {colorMask(t,g);ctx.drawImage(reveal,0,0);}
    } else ctx.drawImage(frame,0,0);
    // Lens edge and gradual opening preserve the quiet held-state staging.
    const vignette=ctx.createRadialGradient(960,520,360,960,520,1160);
    vignette.addColorStop(0,'rgba(20,13,6,0)');vignette.addColorStop(1,'rgba(20,13,6,.45)');
    ctx.fillStyle=vignette;ctx.fillRect(0,0,W,H);
    if(t<4.2) {ctx.fillStyle=`rgba(8,8,7,${1-progress(t,3,4.2)})`;ctx.fillRect(0,0,W,H);}
  }
  return {
    render,
    // Scene 2 starts on the same warm cup/curtain composition before its pan.
    getHandoff: () => ({...handoff,location:'kitchen-close',palette:'warm',letter:'secured',leftPalm:'bandaged',sceneTime:lastTime,cup:'upright'}),
    dispose() {disposed=true;canvas.remove();frame.width=0;reveal.width=0;},
  };
}
