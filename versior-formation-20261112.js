'use strict';

// Real product silhouettes, not floating 3D substitutes. Every frame is reversible.
window.createVersiorFormation = function createVersiorFormation(root) {
  const visual = root.querySelector('.story-visual');
  const canvas = visual.querySelector('.formation-canvas');
  const ctx = canvas.getContext('2d');
  if (!ctx) return null;
  const beats = [...root.querySelectorAll('.story-beat')];
  const sources = [...root.querySelectorAll('.story-devices img')];
  const clamp = value => Math.max(0, Math.min(1, value));
  const smooth = (from, to, value) => {
    const t = clamp((value - from) / (to - from));
    return t * t * (3 - 2 * t);
  };
  const mix = (a, b, t) => a + (b - a) * t;
  const seed = n => {
    const value = Math.sin(n * 127.1 + 311.7) * 43758.5453;
    return value - Math.floor(value);
  };
  const assets = [];
  const words = new Map();
  let width = 0, height = 0, enabled = false, lastIndex = 0, lastProgress = 0;
  let count = 720;

  function makeWord(word) {
    if (words.has(word)) return words.get(word);
    const surface = document.createElement('canvas');
    surface.width = Math.max(1, Math.ceil(width));
    surface.height = Math.max(1, Math.ceil(height));
    const pen = surface.getContext('2d', { willReadFrequently: true });
    let size = Math.min(145, height * .33);
    pen.font = '800 ' + size + 'px Barlow, "Arial Narrow", sans-serif';
    size *= Math.min(1, width * .9 / Math.max(1, pen.measureText(word).width));
    pen.font = '800 ' + size + 'px Barlow, "Arial Narrow", sans-serif';
    pen.textAlign = 'center';
    pen.textBaseline = 'middle';
    pen.fillStyle = '#FDFDFD';
    pen.fillText(word, width * .5, height * .46);
    const pixels = pen.getImageData(0, 0, surface.width, surface.height);
    const points = [];
    const step = width < 400 ? 2 : 3;
    for (let y = 0; y < surface.height; y += step) {
      for (let x = 0; x < surface.width; x += step) {
        if (pixels.data[(y * surface.width + x) * 4 + 3] > 90) points.push({ x, y });
      }
    }
    if (!points.length) points.push({ x: width / 2, y: height / 2 });
    const result = { points, size, word };
    words.set(word, result);
    return result;
  }

  function analyzePhoto(image) {
    const surface = document.createElement('canvas');
    surface.width = 320;
    surface.height = Math.round(320 * image.naturalHeight / image.naturalWidth);
    const pen = surface.getContext('2d', { willReadFrequently: true });
    pen.drawImage(image, 0, 0, surface.width, surface.height);
    const { data } = pen.getImageData(0, 0, surface.width, surface.height);
    const points = [];
    const sw = surface.width, sh = surface.height;
    const blueprint = document.createElement('canvas');
    blueprint.width = sw;
    blueprint.height = sh;
    const bluePen = blueprint.getContext('2d');
    const tracing = bluePen.createImageData(sw, sh);
    const alpha = (x, y) => data[(y * sw + x) * 4 + 3] || 0;
    for (let y = 2; y < sh - 2; y++) {
      for (let x = 2; x < sw - 2; x++) {
        const at = (y * sw + x) * 4;
        if (data[at + 3] < 80) continue;
        const contour = alpha(x - 1, y) < 80 || alpha(x + 1, y) < 80 ||
          alpha(x, y - 1) < 80 || alpha(x, y + 1) < 80;
        const horizontal = Math.abs(data[at] - data[at + 4]);
        const vertical = Math.abs(data[at] - data[at + sw * 4]);
        if (contour || horizontal + vertical > 48) {
          tracing.data[at] = 31;
          tracing.data[at + 1] = 180;
          tracing.data[at + 2] = 250;
          tracing.data[at + 3] = contour ? 240 : 165;
        }
        if (x % 2 === 0 && y % 2 === 0 && (contour || horizontal + vertical > 42 || (x + y) % 20 === 0))
          points.push({ x: x / sw, y: y / sh });
      }
    }
    if (!points.length) points.push({ x: .5, y: .5 });
    bluePen.putImageData(tracing, 0, 0);
    return { points, blueprint };
  }

  function photoBox(image) {
    const scale = Math.min(width * .84 / image.naturalWidth, height * .85 / image.naturalHeight);
    const w = image.naturalWidth * scale, h = image.naturalHeight * scale;
    return { x: (width - w) / 2, y: height * .46 - h / 2, w, h };
  }

  function pointAt(word, photo, box, i, t, reverse = false) {
    const start = word.points[Math.floor(seed(i + 13) * word.points.length)];
    const target = photo.points[Math.floor(seed(i + 47) * photo.points.length)];
    const endpoint = { x: box.x + target.x * box.w, y: box.y + target.y * box.h };
    const a = reverse ? endpoint : start, b = reverse ? start : endpoint;
    // Short filament paths; no globe, orbit, perpetual bobbing or scale pulse.
    const curve = Math.sin(t * Math.PI);
    return {
      x: mix(a.x, b.x, t) + curve * (seed(i + 101) - .5) * width * .16,
      y: mix(a.y, b.y, t) + curve * (seed(i + 173) - .5) * height * .15
    };
  }

  function drawWord(word, opacity) {
    if (opacity <= .001) return;
    ctx.save();
    ctx.globalAlpha = opacity;
    ctx.font = '800 ' + word.size + 'px Barlow, "Arial Narrow", sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillStyle = '#FDFDFD';
    ctx.fillText(word.word, width / 2, height * .46);
    ctx.restore();
  }

  function drawNetwork(word, photo, box, t, opacity, reverse) {
    if (opacity < .005) return;
    const points = [];
    ctx.save();
    // Fine luminous filaments connect the letters to the actual equipment outline.
    ctx.strokeStyle = 'rgba(31,180,250,' + (opacity * .33) + ')';
    ctx.lineWidth = .75;
    for (let lane = 0; lane < 28; lane++) {
      const n = lane * 47;
      const a = pointAt(word, photo, box, n, clamp(t - .28), reverse);
      const b = pointAt(word, photo, box, n, t, reverse);
      const c = pointAt(word, photo, box, n, clamp(t + .16), reverse);
      ctx.beginPath();
      ctx.moveTo(a.x, a.y);
      ctx.quadraticCurveTo(b.x, b.y, c.x, c.y);
      ctx.stroke();
    }
    for (let i = 0; i < count; i++) points.push(pointAt(word, photo, box, i, t, reverse));
    ctx.strokeStyle = 'rgba(31,180,250,' + (opacity * .22) + ')';
    ctx.beginPath();
    for (let i = 0; i < points.length - 3; i += 3) {
      const a = points[i], b = points[i + 3];
      const distance = (a.x - b.x) ** 2 + (a.y - b.y) ** 2;
      if (distance < 54 ** 2 && distance > 6 ** 2) {
        ctx.moveTo(a.x, a.y);
        ctx.lineTo(b.x, b.y);
      }
    }
    ctx.stroke();
    ctx.fillStyle = 'rgba(31,180,250,' + opacity + ')';
    ctx.beginPath();
    points.forEach((point, i) => { if (i % 4 !== 0) ctx.rect(point.x, point.y, 1.4, 1.4); });
    ctx.fill();
    ctx.fillStyle = 'rgba(253,253,253,' + opacity * .92 + ')';
    ctx.beginPath();
    points.forEach((point, i) => { if (i % 4 === 0) ctx.rect(point.x, point.y, 1.8, 1.8); });
    ctx.fill();
    ctx.restore();
  }

  function drawPhoto(image, box, progress, opacity) {
    if (progress < .3 || opacity <= .001) return;
    ctx.save();
    ctx.globalAlpha = opacity;
    if (progress >= .77) {
      ctx.shadowColor = 'rgba(0,0,0,.2)';
      ctx.shadowBlur = 16;
      ctx.shadowOffsetY = 9;
      ctx.drawImage(image, box.x, box.y, box.w, box.h);
    } else {
      const strips = width < 400 ? 10 : 16;
      const stripWidth = box.w / strips;
      for (let i = 0; i < strips; i++) {
        const stagger = seed(i + 29) * .13;
        const reveal = smooth(.32 + stagger, .62 + stagger, progress);
        if (reveal <= 0) continue;
        const x = box.x + i * stripWidth;
        const h = box.h * reveal;
        const y = i % 2 ? box.y + box.h - h : box.y;
        ctx.save();
        ctx.beginPath();
        ctx.rect(x, y, stripWidth + .6, h);
        ctx.clip();
        ctx.drawImage(image, box.x, box.y, box.w, box.h);
        ctx.restore();
        if (reveal < .99) {
          const scanY = i % 2 ? y : y + h;
          ctx.strokeStyle = 'rgba(31,180,250,' + (1 - reveal) * .8 + ')';
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.moveTo(x, scanY);
          ctx.lineTo(x + stripWidth, scanY);
          ctx.stroke();
        }
      }
    }
    ctx.restore();
  }

  function draw(index, progress) {
    lastIndex = index;
    lastProgress = progress;
    const photo = assets[index];
    if (!enabled || !width || !height || !photo?.ready) {
      root.classList.remove('has-formation');
      return;
    }
    root.classList.add('has-formation');
    ctx.clearRect(0, 0, width, height);
    const word = makeWord(beats[index].dataset.storyWord);
    const nextWord = makeWord(beats[Math.min(index + 1, beats.length - 1)].dataset.storyWord);
    const box = photoBox(photo.image);
    const formation = smooth(.12, .57, progress);
    const exit = index < beats.length - 1 ? smooth(.88, 1, progress) : 0;
    const wireOpacity = exit > 0 ? Math.sin(exit * Math.PI) :
      smooth(.1, .22, progress) * (1 - smooth(.6, .79, progress));
    const photoOpacity = 1 - smooth(0, .8, exit);

    const blueprintOpacity = exit > 0 ? Math.sin(exit * Math.PI) * .8 :
      smooth(.18, .4, progress) * (1 - smooth(.65, .78, progress)) * .92;
    if (blueprintOpacity > .001) {
      ctx.save();
      ctx.globalAlpha = blueprintOpacity;
      ctx.drawImage(photo.blueprint, box.x, box.y, box.w, box.h);
      ctx.restore();
    }
    drawPhoto(photo.image, box, progress, photoOpacity);
    drawNetwork(exit > 0 ? nextWord : word, photo, box, exit > 0 ? exit : formation, wireOpacity * .8, exit > 0);
    drawWord(word, (1 - smooth(.1, .22, progress)) * (1 - exit));
    if (exit > 0) drawWord(nextWord, smooth(.72, 1, exit));

    const reveal = smooth(.57, .77, progress) * photoOpacity;
    root.style.setProperty('--formation-photo', reveal.toFixed(3));
    root.dataset.formationProduct = beats[index].dataset.storyProduct;
    root.dataset.formationProgress = progress.toFixed(3);
    root.dataset.formationStage = exit > 0 ? 'siguiente-palabra' : progress < .15 ? 'palabra' : progress < .65 ? 'trazado' : 'equipo';
  }

  function resize() {
    const bounds = visual.getBoundingClientRect();
    if (bounds.width < 1 || bounds.height < 1) return;
    if (Math.abs(width - bounds.width) < 1 && Math.abs(height - bounds.height) < 1) return;
    width = bounds.width;
    height = bounds.height;
    count = width < 400 ? 320 : 560;
    const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
    canvas.width = Math.round(width * dpr);
    canvas.height = Math.round(height * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    words.clear();
    draw(lastIndex, lastProgress);
  }

  sources.forEach((source, index) => {
    const image = new Image();
    assets[index] = { image, ready: false, points: [] };
    image.onload = () => {
      try {
        Object.assign(assets[index], analyzePhoto(image));
        assets[index].ready = true;
        draw(lastIndex, lastProgress);
      } catch (error) {
        // Keep the original photographs visible if canvas pixel access is unavailable.
        assets[index].ready = false;
      }
    };
    image.src = source.getAttribute('src');
  });
  new ResizeObserver(resize).observe(visual);
  document.fonts?.ready.then(() => { words.clear(); draw(lastIndex, lastProgress); });
  return {
    setMode(active) {
      enabled = active;
      canvas.hidden = !active;
      if (!active) root.classList.remove('has-formation');
      else { resize(); draw(lastIndex, lastProgress); }
    },
    render: draw
  };
};
