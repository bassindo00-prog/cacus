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

function drawCirclePlayButton(ctx, x, y, size, circleBg = '#ffffff', iconColor = '#000000') {
  ctx.save();
  ctx.beginPath();
  ctx.arc(x, y, size / 2, 0, Math.PI * 2);
  ctx.fillStyle = circleBg;
  ctx.fill();
  drawPlayIcon(ctx, x + 2, y, size * 0.45, iconColor);
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

function drawPlusIcon(ctx, x, y, size, color = '#ffffff') {
  ctx.save();
  ctx.strokeStyle = color;
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(x - size * 0.4, y); ctx.lineTo(x + size * 0.4, y);
  ctx.moveTo(x, y - size * 0.4); ctx.lineTo(x, y + size * 0.4);
  ctx.stroke();
  ctx.restore();
}

function drawBookmarkIcon(ctx, x, y, size, color = '#94a3b8') {
  ctx.save();
  ctx.strokeStyle = color;
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(x - size * 0.35, y - size * 0.45);
  ctx.lineTo(x + size * 0.35, y - size * 0.45);
  ctx.lineTo(x + size * 0.35, y + size * 0.45);
  ctx.lineTo(x, y + size * 0.2);
  ctx.lineTo(x - size * 0.35, y + size * 0.45);
  ctx.closePath();
  ctx.stroke();
  ctx.restore();
}

function drawHeartIcon(ctx, x, y, size, color = '#ffffff') {
  ctx.save();
  ctx.strokeStyle = color;
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.arc(x - size * 0.2, y - size * 0.1, size * 0.25, Math.PI, 0);
  ctx.arc(x + size * 0.2, y - size * 0.1, size * 0.25, Math.PI, 0);
  ctx.lineTo(x, y + size * 0.45);
  ctx.closePath();
  ctx.stroke();
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

  // =================================================================
  // TEMPLATE 1: t1_holographic_profile
  // =================================================================
  if (templateId === 't1_holographic_profile') {
    const cardW = width * 0.86;
    const cardH = height * 0.45;
    const cardX = (width - cardW) / 2;
    const cardY = (height - cardH) / 2;

    ctx.save();
    drawRoundedRect(ctx, cardX, cardY, cardW, cardH, 36);
    ctx.fillStyle = 'rgba(12, 14, 24, 0.88)';
    ctx.fill();
    ctx.lineWidth = 3;
    ctx.strokeStyle = glowColor;
    ctx.stroke();

    // Top Header: Plus icon, username, MoreHorizontal
    const topY = cardY + 42;
    drawPlusIcon(ctx, cardX + 36, topY, 24, '#ffffff');
    ctx.textAlign = 'center';
    ctx.fillStyle = '#ffffff';
    ctx.font = `700 ${Math.round(width * 0.042)}px sans-serif`;
    ctx.fillText(data.username || 'galib______786', width / 2, topY + 6);
    drawMoreHorizontalIcon(ctx, cardX + cardW - 36, topY, 24, '#ffffff');

    // Avatar Circle Photo & Artist
    const avtR = cardH * 0.16;
    const avtX = cardX + 48 + avtR;
    const avtY = cardY + cardH * 0.48;

    ctx.save();
    ctx.beginPath(); ctx.arc(avtX, avtY, avtR, 0, Math.PI * 2);
    ctx.strokeStyle = data.accentColor || '#ec4899';
    ctx.lineWidth = 4;
    ctx.stroke();
    if (assets.coverImg) {
      drawClippedImage(ctx, assets.coverImg, avtX - avtR, avtY - avtR, avtR * 2, avtR * 2, avtR);
    }
    ctx.restore();

    // Artist name & Followers
    ctx.textAlign = 'left';
    ctx.fillStyle = '#ffffff';
    ctx.font = `700 ${Math.round(width * 0.046)}px sans-serif`;
    ctx.fillText(artist || songTitle || 'Artist Name', avtX + avtR + 24, avtY - 8);

    ctx.fillStyle = '#cbd5e1';
    ctx.font = `500 ${Math.round(width * 0.035)}px sans-serif`;
    ctx.fillText(`${data.followers || '66'} followers`, avtX + avtR + 24, avtY + 28);

    ctx.restore();
    return;
  }

  // =================================================================
  // TEMPLATE 2: t2_earbud_hologram
  // =================================================================
  if (templateId === 't2_earbud_hologram') {
    const cardW = width * 0.86;
    const cardH = height * 0.42;
    const cardX = (width - cardW) / 2;
    const cardY = (height - cardH) / 2;

    ctx.save();
    drawRoundedRect(ctx, cardX, cardY, cardW, cardH, 36);
    ctx.fillStyle = 'rgba(15, 23, 42, 0.82)';
    ctx.fill();
    ctx.lineWidth = 3;
    ctx.strokeStyle = glowColor;
    ctx.stroke();

    const artSize = cardH * 0.44;
    const artX = cardX + 30;
    const artY = cardY + 36;
    if (assets.coverImg) {
      drawClippedImage(ctx, assets.coverImg, artX, artY, artSize, artSize, 20);
    }

    ctx.textAlign = 'left';
    ctx.fillStyle = '#ffffff';
    ctx.font = `700 ${Math.round(width * 0.046)}px sans-serif`;
    ctx.fillText(songTitle, artX + artSize + 24, artY + artSize * 0.35);

    ctx.fillStyle = '#cbd5e1';
    ctx.font = `500 ${Math.round(width * 0.036)}px sans-serif`;
    ctx.fillText(artist, artX + artSize + 24, artY + artSize * 0.7);

    const ctrlY = artY + artSize + 36;
    drawSkipBackIcon(ctx, artX + artSize + 24, ctrlY, 20, '#ffffff');
    drawPlayIcon(ctx, artX + artSize + 74, ctrlY, 24, '#ffffff');
    drawSkipForwardIcon(ctx, artX + artSize + 124, ctrlY, 20, '#ffffff');

    const barX = cardX + 30;
    const barY = cardY + cardH - 50;
    const barW = cardW - 60;
    drawProgressBar(ctx, barX, barY, barW, 6, progressPercent, glowColor, 'rgba(255,255,255,0.2)');
    drawTimecode(ctx, progressPercent, totalSecs, barX, barX + barW, barY + 28, Math.round(width * 0.028), '#94a3b8');

    ctx.restore();
    return;
  }

  // =================================================================
  // TEMPLATE 3: t3_airpods_blue
  // =================================================================
  if (templateId === 't3_airpods_blue') {
    const cardW = width * 0.86;
    const cardH = height * 0.44;
    const cardX = (width - cardW) / 2;
    const cardY = (height - cardH) / 2;

    ctx.save();
    drawRoundedRect(ctx, cardX, cardY, cardW, cardH, 36);
    ctx.fillStyle = 'rgba(2, 6, 23, 0.92)';
    ctx.fill();
    ctx.lineWidth = 3;
    ctx.strokeStyle = data.glowColor || '#2563eb';
    ctx.stroke();

    const artSize = cardH * 0.42;
    const artX = cardX + 30;
    const artY = cardY + 32;
    if (assets.coverImg) {
      drawClippedImage(ctx, assets.coverImg, artX, artY, artSize, artSize, 20);
    }

    ctx.textAlign = 'left';
    ctx.fillStyle = '#ffffff';
    ctx.font = `700 ${Math.round(width * 0.046)}px sans-serif`;
    ctx.fillText(songTitle, artX + artSize + 24, artY + artSize * 0.4);

    ctx.fillStyle = '#93c5fd';
    ctx.font = `500 ${Math.round(width * 0.036)}px sans-serif`;
    ctx.fillText(artist, artX + artSize + 24, artY + artSize * 0.78);

    const barX = cardX + 30;
    const barY = cardY + cardH * 0.62;
    const barW = cardW - 60;
    drawProgressBar(ctx, barX, barY, barW, 6, progressPercent, '#ffffff', 'rgba(255,255,255,0.2)');
    drawTimecode(ctx, progressPercent, totalSecs, barX, barX + barW, barY + 28, Math.round(width * 0.028), '#93c5fd');

    const botY = cardY + cardH - 36;
    drawSkipBackIcon(ctx, cardX + 44, botY, 22, '#ffffff');
    drawPlayIcon(ctx, cardX + 100, botY, 26, '#ffffff');
    drawSkipForwardIcon(ctx, cardX + 156, botY, 22, '#ffffff');

    ctx.textAlign = 'right';
    ctx.fillStyle = '#1db954';
    ctx.font = `800 ${Math.round(width * 0.035)}px sans-serif`;
    ctx.fillText(data.badgeText || 'Spotify', cardX + cardW - 30, botY + 8);

    ctx.restore();
    return;
  }

  // =================================================================
  // TEMPLATE 4: t4_airpods_orange (Amber Glow Airpods)
  // =================================================================
  if (templateId === 't4_airpods_orange') {
    const cardW = width * 0.86;
    const cardH = height * 0.48;
    const cardX = (width - cardW) / 2;
    const cardY = (height - cardH) / 2;

    ctx.save();
    drawRoundedRect(ctx, cardX, cardY, cardW, cardH, 40);
    ctx.fillStyle = 'rgba(24, 9, 2, 0.88)';
    ctx.fill();
    ctx.lineWidth = 3;
    ctx.strokeStyle = data.glowColor || '#f97316';
    ctx.stroke();

    // 1. Top Caption
    ctx.textAlign = 'left';
    ctx.fillStyle = '#ffedd5';
    ctx.font = `600 ${Math.round(width * 0.038)}px sans-serif`;
    ctx.fillText(data.caption || 'La Misión para la racha, porque es un temazo.', cardX + 30, cardY + 48);

    // 2. Cover Artwork Image (left) + Song Title & Artist (right)
    const artSize = cardH * 0.38;
    const artX = cardX + 30;
    const artY = cardY + 80;

    if (assets.coverImg) {
      drawClippedImage(ctx, assets.coverImg, artX, artY, artSize, artSize, 20);
    } else {
      ctx.fillStyle = '#1e293b';
      drawRoundedRect(ctx, artX, artY, artSize, artSize, 20); ctx.fill();
    }

    ctx.textAlign = 'left';
    ctx.fillStyle = '#ffffff';
    ctx.font = `700 ${Math.round(width * 0.046)}px sans-serif`;
    ctx.fillText(songTitle, artX + artSize + 24, artY + artSize * 0.4);

    ctx.fillStyle = '#fdba74';
    ctx.font = `500 ${Math.round(width * 0.036)}px sans-serif`;
    ctx.fillText(artist, artX + artSize + 24, artY + artSize * 0.78);

    // 3. Seekbar Timeline & Timecode
    const barX = cardX + 30;
    const barY = artY + artSize + 48;
    const barW = cardW - 60;
    drawProgressBar(ctx, barX, barY, barW, 6, progressPercent, '#ffffff', 'rgba(255,255,255,0.2)');
    drawTimecode(ctx, progressPercent, totalSecs, barX, barX + barW, barY + 28, Math.round(width * 0.028), '#fdba74');

    // 4. Bottom Controls (|<<  |>  >>|) + Spotify Badge
    const botY = cardY + cardH - 42;
    drawSkipBackIcon(ctx, cardX + 44, botY, 22, '#ffffff');
    drawPlayIcon(ctx, cardX + 100, botY, 26, '#ffffff');
    drawSkipForwardIcon(ctx, cardX + 156, botY, 22, '#ffffff');

    ctx.textAlign = 'right';
    ctx.fillStyle = '#1db954';
    ctx.font = `800 ${Math.round(width * 0.036)}px sans-serif`;
    ctx.fillText(data.badgeText || 'Spotify', cardX + cardW - 30, botY + 8);

    ctx.restore();
    return;
  }

  // =================================================================
  // TEMPLATE 5: t5_airpods_monochrome
  // =================================================================
  if (templateId === 't5_airpods_monochrome') {
    const cardW = width * 0.86;
    const cardH = height * 0.44;
    const cardX = (width - cardW) / 2;
    const cardY = (height - cardH) / 2;

    ctx.save();
    drawRoundedRect(ctx, cardX, cardY, cardW, cardH, 36);
    ctx.fillStyle = 'rgba(10, 10, 10, 0.92)';
    ctx.fill();
    ctx.lineWidth = 3;
    ctx.strokeStyle = '#ffffff';
    ctx.stroke();

    const artSize = cardH * 0.42;
    const artX = cardX + 30;
    const artY = cardY + 32;
    if (assets.coverImg) {
      drawClippedImage(ctx, assets.coverImg, artX, artY, artSize, artSize, 18, 1, true);
    }

    ctx.textAlign = 'left';
    ctx.fillStyle = '#ffffff';
    ctx.font = `700 ${Math.round(width * 0.046)}px sans-serif`;
    ctx.fillText(songTitle, artX + artSize + 24, artY + artSize * 0.4);

    ctx.fillStyle = '#94a3b8';
    ctx.font = `500 ${Math.round(width * 0.036)}px sans-serif`;
    ctx.fillText(artist, artX + artSize + 24, artY + artSize * 0.78);

    const barX = cardX + 30;
    const barY = cardY + cardH * 0.62;
    const barW = cardW - 60;
    drawProgressBar(ctx, barX, barY, barW, 6, progressPercent, '#ffffff', 'rgba(255,255,255,0.2)');
    drawTimecode(ctx, progressPercent, totalSecs, barX, barX + barW, barY + 28, Math.round(width * 0.028), '#94a3b8');

    const botY = cardY + cardH - 36;
    drawSkipBackIcon(ctx, cardX + 44, botY, 22, '#ffffff');
    drawPlayIcon(ctx, cardX + 100, botY, 26, '#ffffff');
    drawSkipForwardIcon(ctx, cardX + 156, botY, 22, '#ffffff');

    ctx.textAlign = 'right';
    ctx.fillStyle = '#ffffff';
    ctx.font = `700 ${Math.round(width * 0.035)}px sans-serif`;
    ctx.fillText(data.badgeText || 'Spotify', cardX + cardW - 30, botY + 8);

    ctx.restore();
    return;
  }

  // =================================================================
  // TEMPLATE 6: t6_floor_mat_rug (Album Rug Streetwear)
  // =================================================================
  if (templateId === 't6_floor_mat_rug') {
    const cardW = width * 0.84;
    const cardH = height * 0.62;
    const cardX = (width - cardW) / 2;
    const cardY = (height - cardH) / 2;

    ctx.save();
    drawRoundedRect(ctx, cardX, cardY, cardW, cardH, 32);
    ctx.fillStyle = data.rugColor || '#880808';
    ctx.fill();

    ctx.textAlign = 'left';
    ctx.fillStyle = '#dc2626';
    ctx.font = `900 ${Math.round(width * 0.09)}px Montserrat, sans-serif`;
    ctx.fillText(data.albumHeader || 'DAMN.', cardX + 28, cardY + 70);

    const artSize = cardW * 0.44;
    const artX = (width - artSize) / 2;
    const artY = cardY + 95;
    if (assets.coverImg) {
      drawClippedImage(ctx, assets.coverImg, artX, artY, artSize, artSize, 16);
    }

    const textY = artY + artSize + 44;
    ctx.textAlign = 'center';
    ctx.fillStyle = '#ffffff';
    ctx.font = `700 ${Math.round(width * 0.046)}px sans-serif`;
    ctx.fillText(songTitle, width / 2, textY);

    ctx.fillStyle = '#f8fafc';
    ctx.font = `500 ${Math.round(width * 0.035)}px sans-serif`;
    ctx.fillText(artist, width / 2, textY + 36);

    const barX = cardX + 28;
    const barY = textY + 70;
    const barW = cardW - 56;
    drawProgressBar(ctx, barX, barY, barW, 6, progressPercent, '#ffffff', 'rgba(255,255,255,0.3)');

    const ctrlY = barY + 60;
    drawSkipBackIcon(ctx, width / 2 - 80, ctrlY, 22, '#ffffff');
    drawCirclePlayButton(ctx, width / 2, ctrlY, 48, '#ffffff', '#000000');
    drawSkipForwardIcon(ctx, width / 2 + 80, ctrlY, 22, '#ffffff');

    ctx.restore();
    return;
  }

  // =================================================================
  // TEMPLATE 7: t7_silk_glass_widget
  // =================================================================
  if (templateId === 't7_silk_glass_widget') {
    const cardW = width * 0.86;
    const cardH = height * 0.45;
    const cardX = (width - cardW) / 2;
    const cardY = (height - cardH) / 2;

    ctx.save();
    drawRoundedRect(ctx, cardX, cardY, cardW, cardH, 36);
    ctx.fillStyle = 'rgba(15, 23, 42, 0.82)';
    ctx.fill();
    ctx.lineWidth = 2;
    ctx.strokeStyle = data.glowColor || '#06b6d4';
    ctx.stroke();

    ctx.textAlign = 'left';
    ctx.fillStyle = '#e0f2fe';
    ctx.font = `500 ${Math.round(width * 0.036)}px sans-serif`;
    ctx.fillText(data.quoteText || 'A veces querer mucho tampoco es suficiente', cardX + 28, cardY + 44);

    const artSize = cardH * 0.38;
    const artX = cardX + 28;
    const artY = cardY + 72;
    if (assets.coverImg) {
      drawClippedImage(ctx, assets.coverImg, artX, artY, artSize, artSize, 16);
    }

    ctx.textAlign = 'left';
    ctx.fillStyle = '#ffffff';
    ctx.font = `700 ${Math.round(width * 0.046)}px sans-serif`;
    ctx.fillText(songTitle, artX + artSize + 20, artY + artSize * 0.4);

    ctx.fillStyle = '#94a3b8';
    ctx.font = `500 ${Math.round(width * 0.035)}px sans-serif`;
    ctx.fillText(artist, artX + artSize + 20, artY + artSize * 0.78);

    drawBookmarkIcon(ctx, cardX + cardW - 36, artY + artSize * 0.5, 22, '#94a3b8');

    const barX = cardX + 28;
    const barY = artY + artSize + 48;
    const barW = cardW - 56;
    drawProgressBar(ctx, barX, barY, barW, 6, progressPercent, '#ffffff', 'rgba(255,255,255,0.2)');
    drawTimecode(ctx, progressPercent, totalSecs, barX, barX + barW, barY + 28, Math.round(width * 0.028), '#94a3b8');

    const ctrlY = barY + 70;
    const ctrlCenterX = width / 2;
    drawSkipBackIcon(ctx, ctrlCenterX - 70, ctrlY, 22, '#ffffff');
    drawPlayIcon(ctx, ctrlCenterX, ctrlY, 26, '#ffffff');
    drawSkipForwardIcon(ctx, ctrlCenterX + 70, ctrlY, 22, '#ffffff');

    ctx.restore();
    return;
  }

  // =================================================================
  // TEMPLATE 8: t8_selfie_story_overlay
  // =================================================================
  if (templateId === 't8_selfie_story_overlay') {
    const barX = width * 0.08;
    const barY = height * 0.84;
    const barW = width * 0.84;

    ctx.save();
    drawProgressBar(ctx, barX, barY, barW, 6, progressPercent, '#ffffff', 'rgba(255,255,255,0.4)');

    const ctrlY = barY + 60;
    const cx = width / 2;
    drawShuffleIcon(ctx, cx - 140, ctrlY, 22, '#ffffff');
    drawSkipBackIcon(ctx, cx - 70, ctrlY, 24, '#ffffff');
    drawCirclePlayButton(ctx, cx, ctrlY, 54, '#ffffff', '#000000');
    drawSkipForwardIcon(ctx, cx + 70, ctrlY, 24, '#ffffff');
    drawRepeatIcon(ctx, cx + 140, ctrlY, 22, '#ffffff');

    ctx.restore();
    return;
  }

  // =================================================================
  // TEMPLATE 9: t9_glass_portrait_glow
  // =================================================================
  if (templateId === 't9_glass_portrait_glow') {
    const cardW = width * 0.86;
    const cardH = height * 0.58;
    const cardX = (width - cardW) / 2;
    const cardY = (height - cardH) / 2;

    ctx.save();
    drawRoundedRect(ctx, cardX, cardY, cardW, cardH, 36);
    ctx.fillStyle = 'rgba(15, 23, 42, 0.75)';
    ctx.fill();
    ctx.lineWidth = 3;
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.85)';
    ctx.stroke();

    const textY = cardY + cardH * 0.58;
    ctx.textAlign = 'left';
    ctx.fillStyle = '#ffffff';
    ctx.font = `700 ${Math.round(width * 0.052)}px sans-serif`;
    ctx.fillText(songTitle, cardX + 32, textY);

    ctx.fillStyle = '#94a3b8';
    ctx.font = `500 ${Math.round(width * 0.038)}px sans-serif`;
    ctx.fillText(artist, cardX + 32, textY + 40);

    const barX = cardX + 32;
    const barY = textY + 84;
    const barW = cardW - 64;
    drawProgressBar(ctx, barX, barY, barW, 6, progressPercent, '#ffffff', 'rgba(255,255,255,0.3)');
    drawTimecode(ctx, progressPercent, totalSecs, barX, barX + barW, barY + 28, Math.round(width * 0.028), '#cbd5e1');

    const ctrlY = barY + 74;
    const cx = width / 2;
    drawHeartIcon(ctx, cardX + 50, ctrlY, 22, '#ffffff');
    drawSkipBackIcon(ctx, cx - 70, ctrlY, 22, '#ffffff');
    drawCirclePlayButton(ctx, cx, ctrlY, 46, '#ffffff', '#000000');
    drawSkipForwardIcon(ctx, cx + 70, ctrlY, 22, '#ffffff');
    drawHeartIcon(ctx, cardX + cardW - 50, ctrlY, 22, '#ffffff');

    ctx.restore();
    return;
  }

  // =================================================================
  // TEMPLATE 10: t10_vertical_transparent_glass
  // =================================================================
  if (templateId === 't10_vertical_transparent_glass') {
    const cardW = width * 0.58;
    const cardH = height * 0.65;
    const cardX = width * 0.08;
    const cardY = (height - cardH) / 2;

    ctx.save();
    drawRoundedRect(ctx, cardX, cardY, cardW, cardH, 32);
    ctx.fillStyle = 'rgba(15, 23, 42, 0.78)';
    ctx.fill();
    ctx.lineWidth = 2;
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.25)';
    ctx.stroke();

    ctx.textAlign = 'left';
    ctx.fillStyle = '#94a3b8';
    ctx.font = `700 ${Math.round(width * 0.03)}px sans-serif`;
    ctx.fillText(data.headerCategory || 'UNDERGROUND BOOM BAP', cardX + 24, cardY + 44);

    const botY = cardY + cardH - 120;
    ctx.fillStyle = '#ffffff';
    ctx.font = `700 ${Math.round(width * 0.044)}px sans-serif`;
    ctx.fillText(songTitle, cardX + 24, botY);

    ctx.fillStyle = '#94a3b8';
    ctx.font = `500 ${Math.round(width * 0.034)}px sans-serif`;
    ctx.fillText(artist, cardX + 24, botY + 34);

    const barX = cardX + 24;
    const barY = botY + 54;
    const barW = cardW - 48;
    drawProgressBar(ctx, barX, barY, barW, 6, progressPercent, '#ffffff', 'rgba(255,255,255,0.2)');

    const ctrlY = barY + 40;
    const cx = cardX + cardW / 2;
    drawSkipBackIcon(ctx, cx - 44, ctrlY, 18, '#ffffff');
    drawPlayIcon(ctx, cx, ctrlY, 22, '#ffffff');
    drawSkipForwardIcon(ctx, cx + 44, ctrlY, 18, '#ffffff');

    ctx.restore();
    return;
  }

  // =================================================================
  // TEMPLATE 11: t11_retro_polaroid
  // =================================================================
  if (templateId === 't11_retro_polaroid') {
    const cardW = width * 0.82;
    const cardH = height * 0.62;
    const cardX = (width - cardW) / 2;
    const cardY = (height - cardH) / 2;

    ctx.save();
    drawRoundedRect(ctx, cardX, cardY, cardW, cardH, 28);
    ctx.fillStyle = data.cardBg || '#a8a29e';
    ctx.fill();

    const imgW = cardW - 36;
    const imgH = cardH * 0.58;
    if (assets.coverImg) {
      drawClippedImage(ctx, assets.coverImg, cardX + 18, cardY + 18, imgW, imgH, 16);
    }

    const textY = cardY + imgH + 48;
    ctx.textAlign = 'left';
    ctx.fillStyle = '#1c1917';
    ctx.font = `700 ${Math.round(width * 0.046)}px sans-serif`;
    ctx.fillText(songTitle, cardX + 20, textY);

    ctx.fillStyle = '#44403c';
    ctx.font = `500 ${Math.round(width * 0.036)}px sans-serif`;
    ctx.fillText(artist, cardX + 20, textY + 36);

    const barX = cardX + 20;
    const barY = textY + 70;
    const barW = cardW - 40;
    drawProgressBar(ctx, barX, barY, barW, 6, progressPercent, '#000000', 'rgba(0,0,0,0.2)');

    const ctrlY = barY + 54;
    const cx = width / 2;
    drawShuffleIcon(ctx, cx - 110, ctrlY, 18, '#000000');
    drawSkipBackIcon(ctx, cx - 55, ctrlY, 20, '#000000');
    drawCirclePlayButton(ctx, cx, ctrlY, 44, '#000000', '#ffffff');
    drawSkipForwardIcon(ctx, cx + 55, ctrlY, 20, '#000000');
    drawRepeatIcon(ctx, cx + 110, ctrlY, 18, '#000000');

    ctx.restore();
    return;
  }

  // =================================================================
  // TEMPLATE 12: t12_vinyl_popout
  // =================================================================
  if (templateId === 't12_vinyl_popout') {
    const cardW = width * 0.78;
    const cardH = height * 0.48;
    const cardX = (width - cardW) / 2;
    const cardY = (height - cardH) / 2;

    ctx.save();
    const vinylX = cardX + cardW * 0.45;
    const vinylY = cardY + cardH * 0.4;
    const vinylR = cardW * 0.42;

    ctx.translate(vinylX, vinylY);
    ctx.rotate((progressPercent * 360 / 100) * 4 * Math.PI / 180);

    ctx.beginPath(); ctx.arc(0, 0, vinylR, 0, Math.PI * 2);
    ctx.fillStyle = '#0f172a'; ctx.fill();
    ctx.lineWidth = 4; ctx.strokeStyle = '#334155'; ctx.stroke();

    ctx.beginPath(); ctx.arc(0, 0, vinylR * 0.3, 0, Math.PI * 2);
    ctx.fillStyle = glowColor; ctx.fill();
    ctx.beginPath(); ctx.arc(0, 0, vinylR * 0.08, 0, Math.PI * 2);
    ctx.fillStyle = '#000000'; ctx.fill();
    ctx.restore();

    ctx.save();
    drawRoundedRect(ctx, cardX, cardY, cardW, cardH, 32);
    ctx.fillStyle = data.sleeveColor || '#581c87';
    ctx.fill();

    const imgH = cardH * 0.52;
    if (assets.coverImg) {
      drawClippedImage(ctx, assets.coverImg, cardX + 20, cardY + 20, cardW - 40, imgH, 20);
    }

    ctx.fillStyle = '#ffffff';
    ctx.font = `700 ${Math.round(width * 0.045)}px sans-serif`;
    ctx.fillText(songTitle, cardX + 24, cardY + imgH + 54);

    ctx.fillStyle = '#e9d5ff';
    ctx.font = `500 ${Math.round(width * 0.035)}px sans-serif`;
    ctx.fillText(artist, cardX + 24, cardY + imgH + 90);

    drawProgressBar(ctx, cardX + 24, cardY + cardH - 44, cardW - 48, 8, progressPercent, '#ffffff', 'rgba(255,255,255,0.3)');
    ctx.restore();
    return;
  }

  // =================================================================
  // TEMPLATE 13: t13_classic_ipod
  // =================================================================
  if (templateId === 't13_classic_ipod') {
    const cardW = width * 0.86;
    const cardH = height * 0.58;
    const cardX = (width - cardW) / 2;
    const cardY = (height - cardH) / 2;

    ctx.save();
    drawRoundedRect(ctx, cardX, cardY, cardW, cardH, 42);
    ctx.fillStyle = data.frameColor || '#09090b';
    ctx.fill();
    ctx.lineWidth = 2; ctx.strokeStyle = 'rgba(255, 255, 255, 0.15)'; ctx.stroke();

    const speakerW = 80;
    drawRoundedRect(ctx, width / 2 - speakerW / 2, cardY + 20, speakerW, 6, 3);
    ctx.fillStyle = '#27272a'; ctx.fill();

    const artW = cardW - 48;
    const artH = cardH * 0.52;
    const artX = cardX + 24;
    const artY = cardY + 44;
    if (assets.coverImg) {
      drawClippedImage(ctx, assets.coverImg, artX, artY, artW, artH, 20);
    }

    const textY = artY + artH + 48;
    ctx.textAlign = 'left';
    ctx.fillStyle = '#ffffff';
    ctx.font = `700 ${Math.round(width * 0.046)}px sans-serif`;
    ctx.fillText(songTitle, artX, textY);

    ctx.fillStyle = '#a1a1aa';
    ctx.font = `500 ${Math.round(width * 0.035)}px sans-serif`;
    ctx.fillText(artist, artX, textY + 36);

    const barX = artX;
    const barY = textY + 80;
    const barW = artW;
    drawProgressBar(ctx, barX, barY, barW, 6, progressPercent, '#ffffff', 'rgba(255,255,255,0.2)');
    drawTimecode(ctx, progressPercent, totalSecs, barX, barX + barW, barY + 28, Math.round(width * 0.028), '#a1a1aa');

    const ctrlY = barY + 70;
    const cx = width / 2;
    drawSkipBackIcon(ctx, cx - 80, ctrlY, 22, '#ffffff');
    drawPlayIcon(ctx, cx, ctrlY, 26, '#ffffff');
    drawSkipForwardIcon(ctx, cx + 80, ctrlY, 22, '#ffffff');

    ctx.restore();
    return;
  }

  // =================================================================
  // TEMPLATE 14: t14_ios_lockscreen (iOS Lockscreen Widget)
  // =================================================================
  if (templateId === 't14_ios_lockscreen') {
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

    const artW = cardW - 48;
    const artH = cardH * 0.52;
    const artX = cardX + 24;
    const artY = cardY + 24;

    if (assets.coverImg) {
      drawClippedImage(ctx, assets.coverImg, artX, artY, artW, artH, 24);
    } else {
      ctx.fillStyle = '#1e293b';
      drawRoundedRect(ctx, artX, artY, artW, artH, 24); ctx.fill();
    }

    const textY = artY + artH + 48;
    ctx.textAlign = 'left';
    ctx.fillStyle = '#ffffff';
    ctx.font = `700 ${Math.round(width * 0.046)}px sans-serif`;
    ctx.fillText(songTitle, artX, textY);

    ctx.fillStyle = '#a1a1aa';
    ctx.font = `500 ${Math.round(width * 0.035)}px sans-serif`;
    ctx.fillText(artist, artX, textY + 38);

    drawMoreHorizontalIcon(ctx, artX + artW - 16, textY - 10, 24, '#71717a');

    const barX = artX;
    const barY = textY + 84;
    const barW = artW;
    drawProgressBar(ctx, barX, barY, barW, 6, progressPercent, '#a1a1aa', '#27272a');
    drawTimecode(ctx, progressPercent, totalSecs, barX, barX + barW, barY + 30, Math.round(width * 0.028), '#71717a');

    const ctrlY = barY + 80;
    const ctrlCenterX = width / 2;
    drawSkipBackIcon(ctx, ctrlCenterX - 90, ctrlY, 24, '#ffffff');
    drawPlayIcon(ctx, ctrlCenterX, ctrlY, 28, '#ffffff');
    drawSkipForwardIcon(ctx, ctrlCenterX + 90, ctrlY, 24, '#ffffff');

    ctx.restore();
    return;
  }

  // =================================================================
  // TEMPLATE 15: t15_ios_lockscreen_spotify
  // =================================================================
  if (templateId === 't15_ios_lockscreen_spotify') {
    ctx.save();
    ctx.textAlign = 'center';
    ctx.fillStyle = data.clockColor || '#fed7aa';
    ctx.font = `600 ${Math.round(width * 0.042)}px sans-serif`;
    ctx.fillText(data.lockDate || 'Fri, Feb 20', width / 2, height * 0.14);

    ctx.font = `800 ${Math.round(width * 0.18)}px Outfit, sans-serif`;
    ctx.fillText(data.lockTime || '00:58', width / 2, height * 0.23);
    ctx.restore();

    const cardW = width * 0.88;
    const cardH = height * 0.24;
    const cardX = (width - cardW) / 2;
    const cardY = height * 0.68;

    ctx.save();
    drawRoundedRect(ctx, cardX, cardY, cardW, cardH, 36);
    ctx.fillStyle = 'rgba(34, 28, 24, 0.88)';
    ctx.fill();
    ctx.lineWidth = 2; ctx.strokeStyle = 'rgba(255, 255, 255, 0.08)'; ctx.stroke();

    const artSize = cardH * 0.55;
    const artX = cardX + 28;
    const artY = cardY + 24;
    if (assets.coverImg) {
      drawClippedImage(ctx, assets.coverImg, artX, artY, artSize, artSize, 18);
    }

    ctx.textAlign = 'left';
    ctx.fillStyle = '#ffffff';
    ctx.font = `700 ${Math.round(width * 0.042)}px sans-serif`;
    ctx.fillText(songTitle, artX + artSize + 20, artY + artSize * 0.4);

    ctx.fillStyle = '#d1d5db';
    ctx.font = `500 ${Math.round(width * 0.034)}px sans-serif`;
    ctx.fillText(artist, artX + artSize + 20, artY + artSize * 0.75);

    ctx.textAlign = 'right';
    ctx.fillStyle = '#1db954';
    ctx.font = `800 ${Math.round(width * 0.034)}px sans-serif`;
    ctx.fillText(data.badgeText || 'Spotify', cardX + cardW - 28, artY + artSize * 0.4);

    const barX = cardX + 28;
    const barY = cardY + cardH * 0.65;
    const barW = cardW - 56;
    drawProgressBar(ctx, barX, barY, barW, 6, progressPercent, '#ffffff', 'rgba(255,255,255,0.2)');
    drawTimecode(ctx, progressPercent, totalSecs, barX, barX + barW, barY + 28, Math.round(width * 0.028), '#d1d5db');

    const botY = cardY + cardH - 32;
    drawSkipBackIcon(ctx, width / 2 - 60, botY, 20, '#ffffff');
    drawCirclePlayButton(ctx, width / 2, botY, 40, '#ffffff', '#000000');
    drawSkipForwardIcon(ctx, width / 2 + 60, botY, 20, '#ffffff');

    ctx.restore();
    return;
  }

  // =================================================================
  // TEMPLATE 16: t16_ios_depth_clock
  // =================================================================
  if (templateId === 't16_ios_depth_clock') {
    ctx.save();
    ctx.textAlign = 'center';
    ctx.fillStyle = data.clockColor || '#ffedd5';
    ctx.font = `600 ${Math.round(width * 0.042)}px sans-serif`;
    ctx.fillText(data.lockDate || 'Wed 26 Aug', width / 2, height * 0.14);

    ctx.font = `800 ${Math.round(width * 0.18)}px Outfit, sans-serif`;
    ctx.fillText(data.lockTime || '21:06', width / 2, height * 0.23);
    ctx.restore();

    const cardW = width * 0.88;
    const cardH = height * 0.24;
    const cardX = (width - cardW) / 2;
    const cardY = height * 0.68;

    ctx.save();
    drawRoundedRect(ctx, cardX, cardY, cardW, cardH, 36);
    ctx.fillStyle = 'rgba(18, 18, 20, 0.85)';
    ctx.fill();
    ctx.lineWidth = 2; ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)'; ctx.stroke();

    const artSize = cardH * 0.55;
    const artX = cardX + 28;
    const artY = cardY + 24;
    if (assets.coverImg) {
      drawClippedImage(ctx, assets.coverImg, artX, artY, artSize, artSize, 18, 1, true);
    }

    ctx.textAlign = 'left';
    ctx.fillStyle = '#ffffff';
    ctx.font = `700 ${Math.round(width * 0.042)}px sans-serif`;
    ctx.fillText(songTitle, artX + artSize + 20, artY + artSize * 0.4);

    ctx.fillStyle = '#94a3b8';
    ctx.font = `500 ${Math.round(width * 0.034)}px sans-serif`;
    ctx.fillText(artist, artX + artSize + 20, artY + artSize * 0.75);

    const barX = cardX + 28;
    const barY = cardY + cardH * 0.65;
    const barW = cardW - 56;
    drawProgressBar(ctx, barX, barY, barW, 6, progressPercent, '#ffffff', 'rgba(255,255,255,0.2)');
    drawTimecode(ctx, progressPercent, totalSecs, barX, barX + barW, barY + 28, Math.round(width * 0.028), '#94a3b8');

    const botY = cardY + cardH - 32;
    drawSkipBackIcon(ctx, width / 2 - 70, botY, 22, '#ffffff');
    drawPlayIcon(ctx, width / 2, botY, 26, '#ffffff');
    drawSkipForwardIcon(ctx, width / 2 + 70, botY, 22, '#ffffff');

    ctx.restore();
    return;
  }

  // =================================================================
  // TEMPLATE 17: t17_ios_weather_widget
  // =================================================================
  if (templateId === 't17_ios_weather_widget') {
    ctx.save();
    ctx.textAlign = 'center';
    ctx.fillStyle = data.clockColor || '#38bdf8';
    ctx.font = `600 ${Math.round(width * 0.038)}px sans-serif`;
    ctx.fillText(data.lockDate || 'terça-feira, 24 de setembro', width / 2, height * 0.12);

    ctx.font = `800 ${Math.round(width * 0.18)}px Outfit, sans-serif`;
    ctx.fillText(data.lockTime || '09:14', width / 2, height * 0.22);

    ctx.font = `500 ${Math.round(width * 0.032)}px sans-serif`;
    ctx.fillText(data.weatherText || '⛅ 18° Nublado Mâx:23° Mín:15°', width / 2, height * 0.27);
    ctx.restore();

    const cardW = width * 0.88;
    const cardH = height * 0.24;
    const cardX = (width - cardW) / 2;
    const cardY = height * 0.68;

    ctx.save();
    drawRoundedRect(ctx, cardX, cardY, cardW, cardH, 36);
    ctx.fillStyle = 'rgba(24, 24, 28, 0.85)';
    ctx.fill();
    ctx.lineWidth = 2; ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)'; ctx.stroke();

    const artSize = cardH * 0.55;
    const artX = cardX + 28;
    const artY = cardY + 24;
    if (assets.coverImg) {
      drawClippedImage(ctx, assets.coverImg, artX, artY, artSize, artSize, 18);
    }

    ctx.textAlign = 'left';
    ctx.fillStyle = '#ffffff';
    ctx.font = `700 ${Math.round(width * 0.042)}px sans-serif`;
    ctx.fillText(songTitle, artX + artSize + 20, artY + artSize * 0.4);

    ctx.fillStyle = '#94a3b8';
    ctx.font = `500 ${Math.round(width * 0.034)}px sans-serif`;
    ctx.fillText(artist, artX + artSize + 20, artY + artSize * 0.75);

    const barX = cardX + 28;
    const barY = cardY + cardH * 0.65;
    const barW = cardW - 56;
    drawProgressBar(ctx, barX, barY, barW, 6, progressPercent, '#ffffff', 'rgba(255,255,255,0.2)');
    drawTimecode(ctx, progressPercent, totalSecs, barX, barX + barW, barY + 28, Math.round(width * 0.028), '#94a3b8');

    const botY = cardY + cardH - 32;
    drawSkipBackIcon(ctx, width / 2 - 70, botY, 22, '#ffffff');
    drawPlayIcon(ctx, width / 2, botY, 26, '#ffffff');
    drawSkipForwardIcon(ctx, width / 2 + 70, botY, 22, '#ffffff');

    ctx.restore();
    return;
  }

  // =================================================================
  // DEFAULT FALLBACK FOR ANY OTHER TEMPLATE
  // =================================================================
  const cardW = width * 0.86;
  const cardH = height * 0.44;
  const cardX = (width - cardW) / 2;
  const cardY = (height - cardH) / 2;

  ctx.save();
  drawRoundedRect(ctx, cardX, cardY, cardW, cardH, 36);
  ctx.fillStyle = 'rgba(15, 23, 42, 0.88)';
  ctx.fill();
  ctx.lineWidth = 3; ctx.strokeStyle = glowColor; ctx.stroke();

  const artSize = cardH * 0.44;
  const artX = cardX + 30;
  const artY = cardY + 36;
  if (assets.coverImg) {
    drawClippedImage(ctx, assets.coverImg, artX, artY, artSize, artSize, 20);
  }

  ctx.textAlign = 'left';
  ctx.fillStyle = '#ffffff';
  ctx.font = `700 ${Math.round(width * 0.046)}px sans-serif`;
  ctx.fillText(songTitle, artX + artSize + 24, artY + artSize * 0.4);

  ctx.fillStyle = '#94a3b8';
  ctx.font = `500 ${Math.round(width * 0.036)}px sans-serif`;
  ctx.fillText(artist, artX + artSize + 24, artY + artSize * 0.76);

  const barX = cardX + 30;
  const barY = cardY + cardH * 0.64;
  const barW = cardW - 60;
  drawProgressBar(ctx, barX, barY, barW, 8, progressPercent, '#ffffff', 'rgba(255,255,255,0.2)');
  drawTimecode(ctx, progressPercent, totalSecs, barX, barX + barW, barY + 30, Math.round(width * 0.03), '#94a3b8');

  drawVisualizerBars(ctx, cardX + 30, cardY + cardH - 44, cardW - 60, 24, progressPercent, glowColor, 28);
  ctx.restore();
}
