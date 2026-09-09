// Fast Native 2D Canvas Template Rendering Engine
// Precision 1-to-1 renderer for all 17 SPN EDITZ templates

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

function drawClippedImage(ctx, img, x, y, width, height, radius = 0, opacity = 1, grayscale = false) {
  if (!img) return;
  ctx.save();
  ctx.globalAlpha = opacity;
  if (grayscale) ctx.filter = 'grayscale(100%)';
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

// Icon Helper Drawers
function drawPlayIcon(ctx, x, y, size, color = '#ffffff') {
  ctx.save();
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.moveTo(x - size * 0.35, y - size * 0.45);
  ctx.lineTo(x + size * 0.45, y);
  ctx.lineTo(x - size * 0.35, y + size * 0.45);
  ctx.closePath();
  ctx.fill();
  ctx.restore();
}

function drawSkipBackIcon(ctx, x, y, size, color = '#ffffff') {
  ctx.save();
  ctx.fillStyle = color;
  const barW = size * 0.2;
  ctx.fillRect(x - size * 0.45, y - size * 0.4, barW, size * 0.8);
  ctx.beginPath();
  ctx.moveTo(x + size * 0.35, y - size * 0.4);
  ctx.lineTo(x - size * 0.1, y);
  ctx.lineTo(x + size * 0.35, y + size * 0.4);
  ctx.closePath();
  ctx.fill();
  ctx.restore();
}

function drawSkipForwardIcon(ctx, x, y, size, color = '#ffffff') {
  ctx.save();
  ctx.fillStyle = color;
  const barW = size * 0.2;
  ctx.fillRect(x + size * 0.25, y - size * 0.4, barW, size * 0.8);
  ctx.beginPath();
  ctx.moveTo(x - size * 0.35, y - size * 0.4);
  ctx.lineTo(x + size * 0.1, y);
  ctx.lineTo(x - size * 0.35, y + size * 0.4);
  ctx.closePath();
  ctx.fill();
  ctx.restore();
}

function drawShuffleIcon(ctx, x, y, size, color = '#ffffff') {
  ctx.save();
  ctx.strokeStyle = color;
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(x - size * 0.4, y - size * 0.3);
  ctx.lineTo(x + size * 0.4, y + size * 0.3);
  ctx.moveTo(x - size * 0.4, y + size * 0.3);
  ctx.lineTo(x + size * 0.4, y - size * 0.3);
  ctx.stroke();
  ctx.restore();
}

function drawRepeatIcon(ctx, x, y, size, color = '#ffffff') {
  ctx.save();
  ctx.strokeStyle = color;
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.arc(x, y, size * 0.4, 0, Math.PI * 1.5);
  ctx.stroke();
  ctx.restore();
}

function drawMoreHorizontalIcon(ctx, x, y, size, color = '#71717a') {
  ctx.save();
  ctx.fillStyle = color;
  const r = size * 0.15;
  ctx.beginPath(); ctx.arc(x - size * 0.4, y, r, 0, Math.PI * 2); ctx.fill();
  ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2); ctx.fill();
  ctx.beginPath(); ctx.arc(x + size * 0.4, y, r, 0, Math.PI * 2); ctx.fill();
  ctx.restore();
}

export function drawTemplateCanvas2D(ctx, templateId, data, progressPercent, width, height, assets) {
  ctx.clearRect(0, 0, width, height);

  // 1. Base Background Fill
  ctx.fillStyle = '#050608';
  ctx.fillRect(0, 0, width, height);

  // 2. Background Photo (with cover scaling & 0.65 opacity)
  if (assets.bgImg) {
    drawClippedImage(ctx, assets.bgImg, 0, 0, width, height, 0, 0.65);
  }

  const glowColor = data.glowColor || '#8b5cf6';
  const songTitle = data.songTitle ?? '';
  const artist = data.artist ?? '';
  const totalSecs = 210; // 3:30

  // -----------------------------------------------------------------
  // 1. TEMPLATE 14: iOS LOCKSCREEN WIDGET (Exact Match for Screenshot)
  // -----------------------------------------------------------------
  if (templateId === 't14_ios_lockscreen' || templateId === 't13_classic_ipod') {
    const cardW = width * 0.86;
    const cardH = height * 0.58;
    const cardX = (width - cardW) / 2;
    const cardY = (height - cardH) / 2;

    ctx.save();
    drawRoundedRect(ctx, cardX, cardY, cardW, cardH, 42);
    ctx.fillStyle = 'rgba(24, 24, 27, 0.92)';
    ctx.fill();
    ctx.lineWidth = 2;
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.12)';
    ctx.stroke();

    // 1. Cover Artwork Image at TOP of Card (~52% card height)
    const artW = cardW - 48;
    const artH = cardH * 0.52;
    const artX = cardX + 24;
    const artY = cardY + 24;

    if (assets.coverImg) {
      drawClippedImage(ctx, assets.coverImg, artX, artY, artW, artH, 24);
    } else {
      ctx.fillStyle = '#1e293b';
      drawRoundedRect(ctx, artX, artY, artW, artH, 24);
      ctx.fill();
    }

    // 2. Song Title (Bold) & Artist (Gray) BELOW Artwork
    const textY = artY + artH + 48;
    ctx.textAlign = 'left';
    ctx.fillStyle = '#ffffff';
    ctx.font = `700 ${Math.round(width * 0.046)}px sans-serif`;
    ctx.fillText(songTitle, artX, textY);

    ctx.fillStyle = '#a1a1aa';
    ctx.font = `500 ${Math.round(width * 0.035)}px sans-serif`;
    ctx.fillText(artist, artX, textY + 38);

    drawMoreHorizontalIcon(ctx, artX + artW - 16, textY - 10, 24, '#71717a');

    // 3. Seekbar & Timecode
    const barX = artX;
    const barY = textY + 84;
    const barW = artW;
    drawProgressBar(ctx, barX, barY, barW, 6, progressPercent, '#a1a1aa', '#27272a');
    drawTimecode(ctx, progressPercent, totalSecs, barX, barX + barW, barY + 30, Math.round(width * 0.028), '#71717a');

    // 4. Centered Playback Controls (|<<  |>  >>|)
    const ctrlY = barY + 80;
    const ctrlCenterX = width / 2;
    drawSkipBackIcon(ctx, ctrlCenterX - 90, ctrlY, 24, '#ffffff');
    drawPlayIcon(ctx, ctrlCenterX, ctrlY, 28, '#ffffff');
    drawSkipForwardIcon(ctx, ctrlCenterX + 90, ctrlY, 24, '#ffffff');

    ctx.restore();
    return;
  }

  // -----------------------------------------------------------------
  // 2. iOS LOCKSCREEN CLOCK TEMPLATES (t15, t16, t17)
  // -----------------------------------------------------------------
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

    // Bottom Music Widget Card
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

    // Artwork on Left
    const artSize = cardH * 0.55;
    const artX = cardX + 28;
    const artY = cardY + 24;
    if (assets.coverImg) {
      drawClippedImage(ctx, assets.coverImg, artX, artY, artSize, artSize, 18, 1, templateId === 't16_ios_depth_clock');
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

  // -----------------------------------------------------------------
  // 3. TEMPLATE 12: VINYL POP OUT
  // -----------------------------------------------------------------
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

  // -----------------------------------------------------------------
  // 4. TEMPLATE 11: POLAROID CARD
  // -----------------------------------------------------------------
  if (templateId === 't11_retro_polaroid') {
    const cardW = width * 0.82;
    const cardH = height * 0.62;
    const cardX = (width - cardW) / 2;
    const cardY = (height - cardH) / 2;

    ctx.save();
    drawRoundedRect(ctx, cardX, cardY, cardW, cardH, 24);
    ctx.fillStyle = data.cardBg || '#a8a29e';
    ctx.fill();

    // Polaroid Artwork Photo (~60% card height)
    const imgW = cardW - 32;
    const imgH = cardH * 0.58;
    if (assets.coverImg) {
      drawClippedImage(ctx, assets.coverImg, cardX + 16, cardY + 16, imgW, imgH, 12);
    }

    // Title & Artist
    const textY = cardY + imgH + 48;
    ctx.textAlign = 'left';
    ctx.fillStyle = '#1c1917';
    ctx.font = `700 ${Math.round(width * 0.046)}px sans-serif`;
    ctx.fillText(songTitle, cardX + 18, textY);

    ctx.fillStyle = '#44403c';
    ctx.font = `500 ${Math.round(width * 0.036)}px sans-serif`;
    ctx.fillText(artist, cardX + 18, textY + 36);

    // Seekbar
    const barX = cardX + 18;
    const barY = textY + 70;
    const barW = cardW - 36;
    drawProgressBar(ctx, barX, barY, barW, 6, progressPercent, '#000000', 'rgba(0,0,0,0.2)');

    // Centered Black Play Button
    const ctrlY = barY + 60;
    const ctrlCenterX = width / 2;
    drawSkipBackIcon(ctx, ctrlCenterX - 60, ctrlY, 20, '#000000');
    drawPlayIcon(ctx, ctrlCenterX, ctrlY, 24, '#000000');
    drawSkipForwardIcon(ctx, ctrlCenterX + 60, ctrlY, 20, '#000000');

    ctx.restore();
    return;
  }

  // -----------------------------------------------------------------
  // 5. TEMPLATE 6: ALBUM RUG STREETWEAR
  // -----------------------------------------------------------------
  if (templateId === 't6_floor_mat_rug') {
    const cardW = width * 0.84;
    const cardH = height * 0.62;
    const cardX = (width - cardW) / 2;
    const cardY = (height - cardH) / 2;

    ctx.save();
    drawRoundedRect(ctx, cardX, cardY, cardW, cardH, 32);
    ctx.fillStyle = data.rugColor || '#880808';
    ctx.fill();

    // Header DAMN.
    ctx.textAlign = 'left';
    ctx.fillStyle = '#dc2626';
    ctx.font = `900 ${Math.round(width * 0.09)}px Montserrat, sans-serif`;
    ctx.fillText(data.albumHeader || 'DAMN.', cardX + 24, cardY + 70);

    // Centered Album Artwork
    const artSize = cardW * 0.44;
    const artX = (width - artSize) / 2;
    const artY = cardY + 95;
    if (assets.coverImg) {
      drawClippedImage(ctx, assets.coverImg, artX, artY, artSize, artSize, 16);
    }

    // Title & Artist
    const textY = artY + artSize + 44;
    ctx.textAlign = 'center';
    ctx.fillStyle = '#ffffff';
    ctx.font = `700 ${Math.round(width * 0.046)}px sans-serif`;
    ctx.fillText(songTitle, width / 2, textY);

    ctx.fillStyle = '#f8fafc';
    ctx.font = `500 ${Math.round(width * 0.035)}px sans-serif`;
    ctx.fillText(artist, width / 2, textY + 36);

    // Seekbar & Controls
    const barX = cardX + 24;
    const barY = textY + 70;
    const barW = cardW - 48;
    drawProgressBar(ctx, barX, barY, barW, 6, progressPercent, '#ffffff', 'rgba(255,255,255,0.3)');

    const ctrlY = barY + 60;
    drawSkipBackIcon(ctx, width / 2 - 70, ctrlY, 20, '#ffffff');
    drawPlayIcon(ctx, width / 2, ctrlY, 24, '#ffffff');
    drawSkipForwardIcon(ctx, width / 2 + 70, ctrlY, 20, '#ffffff');

    ctx.restore();
    return;
  }

  // -----------------------------------------------------------------
  // 6. DEFAULT STANDARD AIRPODS & CYBER CARD (t1, t2, t3, t4, t5, t7, t8, t9, t10)
  // -----------------------------------------------------------------
  const cardW = width * 0.86;
  const cardH = height * 0.44;
  const cardX = (width - cardW) / 2;
  const cardY = (height - cardH) / 2;

  ctx.save();
  ctx.shadowColor = glowColor;
  ctx.shadowBlur = 35;

  drawRoundedRect(ctx, cardX, cardY, cardW, cardH, 36);
  ctx.fillStyle = 'rgba(15, 23, 42, 0.88)';
  ctx.fill();
  ctx.shadowBlur = 0;

  ctx.lineWidth = 3;
  ctx.strokeStyle = glowColor;
  ctx.stroke();

  // Artwork on Left Side
  const artSize = cardH * 0.44;
  const artX = cardX + 30;
  const artY = cardY + 36;
  if (assets.coverImg) {
    drawClippedImage(ctx, assets.coverImg, artX, artY, artSize, artSize, 20, 1, templateId === 't5_airpods_monochrome');
  } else {
    ctx.fillStyle = '#1e293b';
    drawRoundedRect(ctx, artX, artY, artSize, artSize, 20);
    ctx.fill();
  }

  // Song Title & Artist on Right Side
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
