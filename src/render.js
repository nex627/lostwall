(function () {
  var G = window.GIGWALL;

  var MONO = 'ui-monospace, "SF Mono", Menlo, Consolas, "Courier New", monospace';
  var SANS = '-apple-system, BlinkMacSystemFont, "PingFang SC", "Hiragino Sans GB", "Microsoft YaHei", sans-serif';

  function roundRect(ctx, x, y, w, h, r) {
    r = Math.min(r, w / 2, h / 2);
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.arcTo(x + w, y, x + w, y + h, r);
    ctx.arcTo(x + w, y + h, x, y + h, r);
    ctx.arcTo(x, y + h, x, y, r);
    ctx.arcTo(x, y, x + w, y, r);
    ctx.closePath();
  }

  function drawCover(ctx, img, w, h) {
    var ir = img.width / img.height;
    var cr = w / h;
    var dw, dh, dx, dy;
    if (ir > cr) {
      dh = h;
      dw = h * ir;
      dx = (w - dw) / 2;
      dy = 0;
    } else {
      dw = w;
      dh = w / ir;
      dx = 0;
      dy = (h - dh) / 2;
    }
    ctx.drawImage(img, dx, dy, dw, dh);
  }

  function drawTexture(ctx, w, h, kind) {
    var pal = {
      slate: ['#2A3038', '#0A0C0E'],
      amber: ['#3B2216', '#0F0A07'],
      dusk: ['#2C2440', '#0C0A12'],
      moss: ['#22301F', '#090C08'],
      stripe: ['#3A2C1C', '#100C08'],
      dots: ['#1F303C', '#080C10']
    }[kind] || ['#2A3038', '#0A0C0E'];

    var g = ctx.createLinearGradient(0, 0, w * 0.55, h);
    g.addColorStop(0, pal[0]);
    g.addColorStop(1, pal[1]);
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, w, h);

    if (kind === 'stripe') {
      ctx.save();
      ctx.globalAlpha = 0.10;
      ctx.strokeStyle = '#F2E6D2';
      ctx.lineWidth = w * 0.012;
      var step = w * 0.075;
      for (var x = -h; x < w + h; x += step) {
        ctx.beginPath();
        ctx.moveTo(x, h);
        ctx.lineTo(x + h * 0.45, 0);
        ctx.stroke();
      }
      ctx.restore();
    }

    if (kind === 'dots') {
      ctx.save();
      ctx.globalAlpha = 0.16;
      ctx.fillStyle = '#DCE8F2';
      var gap = w * 0.062;
      for (var cy = gap; cy < h; cy += gap) {
        for (var cx = gap; cx < w; cx += gap) {
          ctx.beginPath();
          ctx.arc(cx, cy, w * 0.006, 0, Math.PI * 2);
          ctx.fill();
        }
      }
      ctx.restore();
    }

    if (kind === 'slate') {
      ctx.save();
      ctx.globalAlpha = 0.055;
      ctx.fillStyle = '#FFFFFF';
      var n = 2600;
      for (var i = 0; i < n; i++) {
        var px = Math.random() * w;
        var py = Math.random() * h;
        var s = Math.random() * w * 0.004 + 1;
        ctx.fillRect(px, py, s, s);
      }
      ctx.restore();
    }
  }

  function drawGeneric(ctx, w, h, key) {
    var c = { ink: '#171614', clay: '#7A3B22', deep: '#1E2A33' }[key] || '#171614';
    ctx.fillStyle = c;
    ctx.fillRect(0, 0, w, h);
    var g = ctx.createRadialGradient(w * 0.5, h * 0.34, 0, w * 0.5, h * 0.34, h * 0.72);
    g.addColorStop(0, 'rgba(255,255,255,0.07)');
    g.addColorStop(1, 'rgba(0,0,0,0.22)');
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, w, h);
  }

  function spaced(s) {
    return String(s || '').split('').join(' ');
  }

  // 没有节目单的音乐节：只留名字与月份，当纪念款
  function drawPoster(ctx, w, h, st) {
    var f = st.festival;

    var g = ctx.createLinearGradient(0, 0, 0, h);
    g.addColorStop(0, '#191512');
    g.addColorStop(0.45, '#0E0C0A');
    g.addColorStop(1, '#1C1714');
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, w, h);

    ctx.save();
    ctx.textAlign = 'center';

    ctx.fillStyle = 'rgba(255,255,255,0.42)';
    ctx.font = '500 ' + (w * 0.024) + 'px ' + MONO;
    ctx.fillText(spaced(f.en), w / 2, h * 0.085);

    var size = w * 0.21;
    ctx.font = '700 ' + size + 'px ' + SANS;
    var tw = ctx.measureText(f.name).width;
    var max = w * 0.84;
    if (tw > max) size = size * max / tw;
    ctx.fillStyle = '#FFFFFF';
    ctx.font = '700 ' + size + 'px ' + SANS;
    ctx.fillText(f.name, w / 2, h * 0.205);

    ctx.strokeStyle = 'rgba(255,255,255,0.22)';
    ctx.lineWidth = Math.max(1, w * 0.0016);
    ctx.beginPath();
    ctx.moveTo(w * 0.33, h * 0.235);
    ctx.lineTo(w * 0.67, h * 0.235);
    ctx.stroke();

    ctx.fillStyle = 'rgba(255,255,255,0.70)';
    ctx.font = '400 ' + (w * 0.032) + 'px ' + SANS;
    ctx.fillText(f.cities.join(' / '), w / 2, h * 0.795);

    ctx.fillStyle = 'rgba(255,255,255,0.40)';
    ctx.font = '400 ' + (w * 0.021) + 'px ' + MONO;
    ctx.fillText(G.monthsLabel(f.months), w / 2, h * 0.835);

    ctx.restore();
  }

  function formatPhone(v) {
    var d = String(v || '').replace(/\D/g, '').slice(0, 11);
    if (d.length <= 3) return d;
    if (d.length <= 7) return d.slice(0, 3) + ' ' + d.slice(3);
    return d.slice(0, 3) + ' ' + d.slice(3, 7) + ' ' + d.slice(7);
  }

  // 先算号码块的几何，节目单要避开它
  function bandPlan(ctx, w, h, st) {
    var p1 = String(st.p1 || '').replace(/\D/g, '');
    if (p1.length !== 11) return null;

    var p2 = String(st.p2 || '').replace(/\D/g, '');
    var note = String(st.note || '').trim();
    var theme = G.STYLES[st.style] || G.STYLES.dark;

    var bandW = w * 0.88;
    var bandX = w * 0.06;
    var padX = w * 0.045;
    var padY = w * 0.032;
    var mainText = formatPhone(p1);

    var fs = w * 0.08;
    ctx.font = '600 ' + fs + 'px ' + MONO;
    var tw = ctx.measureText(mainText).width;
    var target = bandW - padX * 2;
    fs = fs * (target / Math.max(tw, 1));
    fs = Math.min(fs, w * 0.105);
    fs = Math.max(fs, w * 0.055);

    var items = [];
    items.push({ t: '捡到请联系', s: w * 0.032, f: SANS, wgt: 400, gap: fs * 0.14, color: theme.sub });
    items.push({ t: mainText, s: fs, f: MONO, wgt: 600, gap: p2.length === 11 ? fs * 0.12 : (note ? fs * 0.16 : 0), color: theme.fg });
    if (p2.length === 11) {
      items.push({ t: formatPhone(p2), s: fs * 0.62, f: MONO, wgt: 500, gap: note ? fs * 0.16 : 0, color: theme.sub });
    }
    if (note) {
      items.push({ t: note, s: w * 0.024, f: SANS, wgt: 400, gap: 0, color: theme.sub });
    }

    var contentH = 0;
    for (var i = 0; i < items.length; i++) contentH += items[i].s + items[i].gap;

    var bandH = contentH + padY * 2;
    var anchor = (G.POS[st.pos] != null) ? G.POS[st.pos] : 0.28;
    var top = h * anchor;
    if (st.pos === 'bottom') top = h * anchor - bandH;

    return {
      items: items, bandW: bandW, bandX: bandX, bandH: bandH,
      top: top, padX: padX, padY: padY, theme: theme,
      style: st.style, w: w, h: h
    };
  }

  function bandPaint(ctx, plan) {
    var w = plan.w, h = plan.h;

    if (plan.style === 'glass') {
      ctx.save();
      ctx.fillStyle = 'rgba(0,0,0,0.26)';
      ctx.fillRect(0, plan.top - h * 0.02, w, plan.bandH + h * 0.04);
      ctx.restore();
    }

    ctx.save();
    ctx.fillStyle = plan.theme.bg;
    roundRect(ctx, plan.bandX, plan.top, plan.bandW, plan.bandH, w * 0.022);
    ctx.fill();
    ctx.restore();

    ctx.save();
    ctx.textAlign = 'center';
    ctx.textBaseline = 'alphabetic';

    var y = plan.top + plan.padY;
    for (var j = 0; j < plan.items.length; j++) {
      var it = plan.items[j];
      y += it.s;
      ctx.font = it.wgt + ' ' + it.s + 'px ' + it.f;
      ctx.fillStyle = it.color;
      ctx.fillText(it.t, w / 2, y);
      y += it.gap;
    }
    ctx.restore();
  }

  function fitText(ctx, text, maxW, size, weight, family) {
    ctx.font = weight + ' ' + size + 'px ' + family;
    var tw = ctx.measureText(text).width;
    if (tw <= maxW) return { t: text, s: size };
    var s = size * (maxW / tw);
    if (s >= size * 0.72) return { t: text, s: s };
    // 缩到底也放不下，就截断
    var t = text;
    while (t.length > 1) {
      t = t.slice(0, -1);
      ctx.font = weight + (size * 0.72) + 'px ' + family;
      if (ctx.measureText(t + '…').width <= maxW) return { t: t + '…', s: size * 0.72 };
    }
    return { t: text.slice(0, 1), s: size * 0.72 };
  }

  /*
   * 节目单区：上方是音乐节名与日期，下面按天分列，每列「时刻 + 乐队」。
   * 只画真实数据，年份取自数据本身。
   */
  function drawLineup(ctx, w, h, lu, area) {
    if (!area || area.h < h * 0.2) return;

    var days = lu.days || [];
    if (!days.length) return;

    var pad = w * 0.068;
    var innerW = w - pad * 2;

    var headH = h * 0.112;
    var gridTop = area.y + headH;
    var gridH = area.h - headH;
    if (gridH < h * 0.06) return;

    var cols = Math.min(days.length, 3);
    var rows = Math.ceil(days.length / cols);
    var gapX = w * 0.028;
    var gapY = h * 0.02;
    var cellW = (innerW - gapX * (cols - 1)) / cols;
    var cellH = (gridH - gapY * (rows - 1)) / rows;

    var maxActs = 1;
    days.forEach(function (d) { maxActs = Math.max(maxActs, d.acts.length); });

    var labelH = cellH * 0.085;
    var rowH = (cellH - labelH) / maxActs;
    var nameSize = Math.min(rowH * 0.66, cellW * 0.088);

    // 排不下就别印 —— 印成米粒大的字没有意义
    if (nameSize < w * 0.025) return;

    var timeSize = nameSize * 0.60;
    var timeW = cellW * 0.255;

    ctx.save();
    ctx.textAlign = 'center';

    var kicker = [lu.dateLabel || lu.year, lu.city, lu.stage].filter(Boolean).join(' · ');
    ctx.fillStyle = 'rgba(255,255,255,0.48)';
    ctx.font = '500 ' + (w * 0.018) + 'px ' + MONO;
    ctx.fillText(spaced(kicker), w / 2, area.y + h * 0.020);

    var nm = fitText(ctx, lu.name, innerW, h * 0.050, 700, SANS);
    ctx.fillStyle = '#FFFFFF';
    ctx.font = '700 ' + nm.s + 'px ' + SANS;
    ctx.fillText(nm.t, w / 2, area.y + h * 0.085);

    ctx.strokeStyle = 'rgba(255,255,255,0.20)';
    ctx.lineWidth = Math.max(1, w * 0.0014);
    ctx.beginPath();
    ctx.moveTo(pad, area.y + headH - h * 0.012);
    ctx.lineTo(w - pad, area.y + headH - h * 0.012);
    ctx.stroke();

    ctx.restore();

    for (var i = 0; i < days.length; i++) {
      var col = i % cols;
      var row = Math.floor(i / cols);
      var cx = pad + col * (cellW + gapX);
      var cy = gridTop + row * (cellH + gapY);
      var day = days[i];

      ctx.save();
      ctx.textAlign = 'left';

      ctx.fillStyle = 'rgba(255,255,255,0.62)';
      ctx.font = '600 ' + (w * 0.019) + 'px ' + MONO;
      ctx.fillText(spaced(day.label), cx, cy + labelH * 0.72);

      var bodyH = cellH - labelH;
      for (var j = 0; j < day.acts.length; j++) {
        var a = day.acts[j];
        var ry = cy + labelH + j * rowH;
        var base = ry + rowH * 0.5 + nameSize * 0.36;

        ctx.fillStyle = 'rgba(255,255,255,0.46)';
        ctx.font = '400 ' + timeSize + 'px ' + MONO;
        ctx.fillText(a.t, cx, base);

        var nmMax = cellW - timeW;
        var fn = fitText(ctx, a.n, nmMax, nameSize, 500, SANS);
        ctx.fillStyle = 'rgba(255,255,255,0.90)';
        ctx.font = '500 ' + fn.s + 'px ' + SANS;
        ctx.fillText(fn.t, cx + timeW, base);

        if (j < day.acts.length - 1) {
          ctx.strokeStyle = 'rgba(255,255,255,0.09)';
          ctx.lineWidth = Math.max(1, w * 0.0011);
          ctx.beginPath();
          ctx.moveTo(cx, ry + rowH);
          ctx.lineTo(cx + cellW, ry + rowH);
          ctx.stroke();
        }
      }

      // 列底线，让每列收口
      ctx.strokeStyle = 'rgba(255,255,255,0.16)';
      ctx.lineWidth = Math.max(1, w * 0.0012);
      ctx.beginPath();
      ctx.moveTo(cx, cy + labelH + bodyH);
      ctx.lineTo(cx + cellW, cy + labelH + bodyH);
      ctx.stroke();

      ctx.restore();
    }

    if (lu.source) {
      ctx.save();
      ctx.textAlign = 'center';
      ctx.fillStyle = 'rgba(255,255,255,0.28)';
      ctx.font = '400 ' + (w * 0.0155) + 'px ' + SANS;
      var foot = fitText(ctx, lu.source, w - pad * 2, w * 0.0155, 400, SANS);
      ctx.fillText(foot.t, w / 2, h * 0.962);
      ctx.restore();
    }
  }

  G.render = function (canvas, st) {
    var ratio = st.ratio || G.RATIOS[0];
    var w = ratio.w;
    var h = ratio.h;

    if (canvas.width !== w || canvas.height !== h) {
      canvas.width = w;
      canvas.height = h;
    }

    var ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, w, h);

    var hasLineup = !!(st.lineup && st.lineupOn);

    if (st.img) {
      drawCover(ctx, st.img, w, h);
    } else if (st.mode === 'festival' && st.festival && !hasLineup) {
      drawPoster(ctx, w, h, st);
    } else {
      drawTexture(ctx, w, h, st.texture || 'slate');
    }

    var plan = bandPlan(ctx, w, h, st);

    if (hasLineup && plan) {
      // 挑号码块上下哪边空地更大，节目单就放哪边
      var aboveY = h * 0.045;
      var aboveH = (plan.top - h * 0.035) - aboveY;
      var belowY = plan.top + plan.bandH + h * 0.038;
      var belowH = (h * 0.935) - belowY;

      if (aboveH > belowH && aboveH > h * 0.42) {
        drawLineup(ctx, w, h, st.lineup, { y: aboveY, h: aboveH });
      } else {
        drawLineup(ctx, w, h, st.lineup, { y: belowY, h: belowH });
      }
    }

    if (plan) bandPaint(ctx, plan);
  };

  G.formatPhone = formatPhone;
})();
