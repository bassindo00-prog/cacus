// Fast Native 2D Canvas Template Rendering Engine
// Renders studio audio templates directly to 2D HTML5 Canvas in < 1ms per frame

export const getProjectDimensions = (ratio = '9:16') => {
  switch (ratio) {
    case '1:1': return { width: 1080, height: 1080 };
    case '9:16': return { width: 1080, height: 1920 };
    case '9:19': return { width: 1080, height: 2280 };
    case '4:5': return { width: 1080, height: 1350 };
    case '3:4': return { width: 1080, height: 1440 };
    case '16:9': return { width: 1920, height: 1080 };
    case '4:3': return { width: 1440, height: 1080 };
    default: return { width: 1080, height: 1920 };
  }
};

export const loadSingleImage = (src) => {
  if (!src) return Promise.resolve(null);
  return new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => resolve(img);
    img.onerror = () => {
      const img2 = new Image();
      img2.onload = () => resolve(img2);
      img2.onerror = () => resolve(null);
      img2.src = src;
    };
    img.src = src;
  });
};

function drawRoundedRect(ctx, x, y, width, height, radius) {
  ctx.beginPath();
  let r = typeof radius === 'number' ? { tl: radius, tr: radius, br: radius, bl: radius } : radius;
  r = r || { tl: 0, tr: 0, br: 0, bl: 0 };
  ctx.moveTo(x + r.tl, y);
  ctx.lineTo(x + width - r.tr, y);
  ctx.quadraticCurveTo(x + width, y, x + width, y + r.tr);
  ctx.lineTo(x + width, y + height - r.br);
  ctx.quadraticCurveTo(x + width, y + height, x + width - r.br, y + height);
  ctx.lineTo(x + r.bl, y + height);
  ctx.quadraticCurveTo(x, y + height, x, y + height - r.bl);
  ctx.lineTo(x, y + r.tl);
  ctx.quadraticCurveTo(x, y, x + r.tl, y);
  ctx.closePath();
}

function drawClippedImage(ctx, img, x, y, width, height, radius = 0, opacity = 1) {
  if (!img) return;
  ctx.save();
  ctx.globalAlpha = opacity;
  if (radius > 0) {
    drawRoundedRect(ctx, x, y, width, height, radius);
    ctx.clip();
  }
  const imgRatio = img.naturalWidth / img.naturalHeight;
  const targetRatio = width / height;
  let sWidth = img.naturalWidth;
  let sHeight = img.naturalHeight;
  let sX = 0;
  let sY = 0;
  if (imgRatio > targetRatio) {
    sWidth = img.naturalHeight * targetRatio;
    sX = (img.naturalWidth - sWidth) / 2;
  } else {
    sHeight = img.naturalWidth / targetRatio;
    sY = (img.naturalHeight - sHeight) / 2;
  }
  ctx.drawImage(img, sX, sY, sWidth, sHeight, x, y, width, height);
  ctx.restore();
}

function drawProgressBar(ctx, x, y, width, height, progressPercent, activeColor = '#ffffff', trackColor = 'rgba(255,255,255,0.2)') {
  ctx.save();
  drawRoundedRect(ctx, x, y, width, height, height / 2);
  ctx.fillStyle = trackColor;
  ctx.fill();

  const activeWidth = Math.max(0, Math.min(width, (progressPercent / 100) * width));
  if (activeWidth > 0) {
    drawRoundedRect(ctx, x, y, activeWidth, height, height / 2);
    ctx.fillStyle = activeColor;
    ctx.fill();
  }
  ctx.restore();
}

function drawTimecode(ctx, progressPercent, totalSecs, xLeft, xRight, y, fontSize, color) {
  ctx.save();
  ctx.font = `600 ${fontSize}px sans-serif`;
  ctx.fillStyle = color;
  const currentSecs = Math.floor((progressPercent / 100) * totalSecs);
  const m = Math.floor(currentSecs / 60);
  const s = Math.floor(currentSecs % 60);
  const curStr = `${m}:${s < 10 ? '0' : ''}${s}`;
  const remSecs = totalSecs - currentSecs;
  const rm = Math.floor(remSecs / 60);
  const rs = Math.floor(remSecs % 60);
  const remStr = `-${rm}:${rs < 10 ? '0' : ''}${rs}`;

  ctx.textAlign = 'left';
  ctx.fillText(curStr, xLeft, y);
  ctx.textAlign = 'right';
  ctx.fillText(remStr, xRight, y);
  ctx.restore();
}

// Animated Equalizer Visualizer Bars
function drawVisualizerBars(ctx, x, y, width, height, progressPercent, barColor = '#38bdf8', count = 24) {
  ctx.save();
  const gap = 4;
  const barWidth = (width - (count - 1) * gap) / count;
  ctx.fillStyle = barColor;

  for (let i = 0; i < count; i++) {
    const wave = Math.sin((progressPercent * 0.4) + (i * 0.5)) * 0.4 + 0.5;
    const barH = Math.max(8, wave * height);
    const barX = x + i * (barWidth + gap);
    const barY = y + (height - barH) / 2;
    drawRoundedRect(ctx, barX, barY, barWidth, barH, barWidth / 2);
    ctx.fill();
  }
  ctx.restore();
}

export function drawTemplateCanvas2D(ctx, templateId, data, progressPercent, width, height, assets) {
  ctx.clearRect(0, 0, width, height);

  // 1. Base Background Fill
  ctx.fillStyle = '#050608';
  ctx.fillRect(0, 0, width, height);

  // 2. Background Photo (with cover scaling & 0.6 opacity)
  if (assets.bgImg) {
    drawClippedImage(ctx, assets.bgImg, 0, 0, width, height, 0, 0.65);
  }

  const glowColor = data.glowColor || '#8b5cf6';
  const songTitle = data.songTitle || 'Judul Lagu';
  const artist = data.artist || 'Nama Artist';
  const totalSecs = 210; // 3:30

  // -----------------------------------------------------------------
  // TEMPLATE RENDERING BRANCHES
  // -----------------------------------------------------------------

  // IS LOCKSCREEN TEMPLATES (t15, t16, t17)
  if (templateId === 't15_ios_lockscreen_spotify' || templateId === 't16_ios_depth_clock' || templateId === 't17_ios_weather_widget') {
    // iOS Clock Top Header
    ctx.save();
    ctx.textAlign = 'center';
    ctx.fillStyle = data.clockColor || '#fed7aa';
    ctx.font = `600 ${Math.round(width * 0.042)}px sans-serif`;
    ctx.fillText(data.lockDate || 'Fri, Feb 20', width / 2, height * 0.14);

    ctx.font = `800 ${Math.round(width * 0.18)}px Outfit, sans-serif`;
    ctx.fillText(data.lockTime || '00:58', width / 2, height * 0.23);
    ctx.restore();

    // Lockscreen Music Widget Card
    const cardW = width * 0.88;
    const cardH = height * 0.24;
    const cardX = (width - cardW) / 2;
    const cardY = height * 0.68;

    ctx.save();
    drawRoundedRect(ctx, cardX, cardY, cardW, cardH, 36);
    ctx.fillStyle = 'rgba(18, 18, 24, 0.9)';
    ctx.fill();
    ctx.lineWidth = 2;
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.15)';
    ctx.stroke();

    // Artwork
    const artSize = cardH * 0.55;
    const artX = cardX + 28;
    const artY = cardY + 24;
    if (assets.coverImg) {
      drawClippedImage(ctx, assets.coverImg, artX, artY, artSize, artSize, 18);
    } else {
      ctx.fillStyle = '#1e293b';
      drawRoundedRect(ctx, artX, artY, artSize, artSize, 18);
      ctx.fill();
    }

    // Song Title & Artist
    ctx.textAlign = 'left';
    ctx.fillStyle = '#ffffff';
    ctx.font = `700 ${Math.round(width * 0.042)}px sans-serif`;
    ctx.fillText(songTitle, artX + artSize + 20, artY + artSize * 0.4);

    ctx.fillStyle = '#94a3b8';
    ctx.font = `500 ${Math.round(width * 0.034)}px sans-serif`;
    ctx.fillText(artist, artX + artSize + 20, artY + artSize * 0.75);

    // Seekbar inside card
    const barX = cardX + 28;
    const barY = cardY + cardH * 0.65;
    const barW = cardW - 56;
    drawProgressBar(ctx, barX, barY, barW, 8, progressPercent, '#ffffff', 'rgba(255,255,255,0.2)');
    drawTimecode(ctx, progressPercent, totalSecs, barX, barX + barW, barY + 28, Math.round(width * 0.028), '#94a3b8');

    // Visualizer Bars at Bottom of Card
    drawVisualizerBars(ctx, cardX + 28, cardY + cardH - 32, cardW - 56, 16, progressPercent, glowColor, 28);
    ctx.restore();
    return;
  }

  // TEMPLATE 12: VINYL POP OUT
  if (templateId === 't12_vinyl_popout') {
    const cardW = width * 0.78;
    const cardH = height * 0.48;
    const cardX = (width - cardW) / 2;
    const cardY = (height - cardH) / 2;

    // Spinning Vinyl LP Record Behind
    ctx.save();
    const vinylX = cardX + cardW * 0.45;
    const vinylY = cardY + cardH * 0.4;
    const vinylR = cardW * 0.42;

    ctx.translate(vinylX, vinylY);
    ctx.rotate((progressPercent * 360 / 100) * 4 * Math.PI / 180);

    ctx.beginPath();
    ctx.arc(0, 0, vinylR, 0, Math.PI * 2);
    ctx.fillStyle = '#0f172a';
    ctx.fill();
    ctx.lineWidth = 4;
    ctx.strokeStyle = '#334155';
    ctx.stroke();

    // Center vinyl sticker
    ctx.beginPath();
    ctx.arc(0, 0, vinylR * 0.3, 0, Math.PI * 2);
    ctx.fillStyle = glowColor;
    ctx.fill();
    ctx.beginPath();
    ctx.arc(0, 0, vinylR * 0.08, 0, Math.PI * 2);
    ctx.fillStyle = '#000000';
    ctx.fill();
    ctx.restore();

    // Sleeve Card Container
    ctx.save();
    drawRoundedRect(ctx, cardX, cardY, cardW, cardH, 32);
    ctx.fillStyle = data.sleeveColor || '#581c87';
    ctx.fill();

    // Cover Artwork Image
    const imgH = cardH * 0.52;
    if (assets.coverImg) {
      drawClippedImage(ctx, assets.coverImg, cardX + 20, cardY + 20, cardW - 40, imgH, 20);
    }

    // Title & Artist
    ctx.fillStyle = '#ffffff';
    ctx.font = `700 ${Math.round(width * 0.045)}px sans-serif`;
    ctx.fillText(songTitle, cardX + 24, cardY + imgH + 54);

    ctx.fillStyle = '#e9d5ff';
    ctx.font = `500 ${Math.round(width * 0.035)}px sans-serif`;
    ctx.fillText(artist, cardX + 24, cardY + imgH + 90);

    // Seekbar
    drawProgressBar(ctx, cardX + 24, cardY + cardH - 40, cardW - 48, 8, progressPercent, '#ffffff', 'rgba(255,255,255,0.3)');
    ctx.restore();
    return;
  }

  // DEFAULT STANDARD PLAYER CARD (TEMPLATES t1 - t14)
  const cardW = width * 0.86;
  const cardH = height * 0.42;
  const cardX = (width - cardW) / 2;
  const cardY = (height - cardH) / 2;

  ctx.save();
  // Glowing Shadow
  ctx.shadowColor = glowColor;
  ctx.shadowBlur = 35;

  drawRoundedRect(ctx, cardX, cardY, cardW, cardH, 36);
  ctx.fillStyle = 'rgba(15, 23, 42, 0.88)';
  ctx.fill();
  ctx.shadowBlur = 0; // reset shadow

  ctx.lineWidth = 3;
  ctx.strokeStyle = glowColor;
  ctx.stroke();

  // Artwork
  const artSize = cardH * 0.44;
  const artX = cardX + 30;
  const artY = cardY + 36;
  if (assets.coverImg) {
    drawClippedImage(ctx, assets.coverImg, artX, artY, artSize, artSize, 20);
  } else {
    ctx.fillStyle = '#1e293b';
    drawRoundedRect(ctx, artX, artY, artSize, artSize, 20);
    ctx.fill();
  }

  // Song Title & Artist
  ctx.textAlign = 'left';
  ctx.fillStyle = '#ffffff';
  ctx.font = `700 ${Math.round(width * 0.046)}px sans-serif`;
  ctx.fillText(songTitle, artX + artSize + 24, artY + artSize * 0.4);

  ctx.fillStyle = '#94a3b8';
  ctx.font = `500 ${Math.round(width * 0.036)}px sans-serif`;
  ctx.fillText(artist, artX + artSize + 24, artY + artSize * 0.76);

  // Seekbar
  const barX = cardX + 30;
  const barY = cardY + cardH * 0.64;
  const barW = cardW - 60;
  drawProgressBar(ctx, barX, barY, barW, 8, progressPercent, '#ffffff', 'rgba(255,255,255,0.2)');
  drawTimecode(ctx, progressPercent, totalSecs, barX, barX + barW, barY + 30, Math.round(width * 0.03), '#94a3b8');

  // Animated Visualizer Waveform at Bottom of Card
  drawVisualizerBars(ctx, cardX + 30, cardY + cardH - 44, cardW - 60, 24, progressPercent, glowColor, 28);
  ctx.restore();
}
