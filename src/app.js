(function () {
  var G = window.GIGWALL;

  function $(id) { return document.getElementById(id); }

  var canvas = $('canvas');
  var drop = $('drop');
  var file = $('file');
  var p1 = $('p1');
  var p2 = $('p2');
  var note = $('note');
  var hint = $('hint');
  var go = $('go');
  var sheet = $('sheet');
  var out = $('out');
  var dl = $('dl');
  var closeBtn = $('close');
  var simLock = $('simLock');
  var lockui = $('lockui');
  var sheetT = $('sheetT');
  var segRatio = $('segRatio');
  var segPos = $('segPos');
  var segStyle = $('segStyle');
  var segMode = $('segMode');
  var citySeg = $('citySeg');
  var flist = $('flist');
  var festWarn = $('festWarn');
  var genericRow = $('genericRow');
  var boxGeneric = $('boxGeneric');
  var boxFestival = $('boxFestival');
  var boxPhoto = $('boxPhoto');
  var luSeg = $('luSeg');
  var luWarn = $('luWarn');
  var luText = $('luText');
  var luApply = $('luApply');
  var luClear = $('luClear');

  var state = {
    mode: 'generic',
    generic: 'ink',
    festival: null,
    city: '全部',
    img: null,
    p1: '',
    p2: '',
    note: '',
    ratio: G.RATIOS[0],
    pos: 'top',
    style: 'dark',
    lineup: null,
    lineupId: '',
    lineupOn: false,
    lineupOff: false,
    luText: ''
  };

  var PASTED = 'pasted';

  function toast(text) {
    var el = document.createElement('div');
    el.className = 'toast';
    el.setAttribute('role', 'alert');
    el.textContent = text;
    document.body.appendChild(el);
    setTimeout(function () {
      el.style.opacity = '0';
      setTimeout(function () { el.remove(); }, 260);
    }, 2800);
  }

  function isIOS() {
    return /iPhone|iPad|iPod/.test(navigator.userAgent) ||
      (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
  }

  function syncBtns(row, val) {
    if (!row) return;
    var btns = row.querySelectorAll('button[data-v]');
    for (var i = 0; i < btns.length; i++) {
      btns[i].classList.toggle('on', btns[i].dataset.v === val);
    }
  }

  function paint() {
    G.render(canvas, state);
    var v = String(state.p1 || '').replace(/\D/g, '');
    hint.textContent = v.length === 11 ? '点「生成壁纸」' : '还差一个能联系到你的号码';
  }

  function save() {
    try {
      localStorage.setItem('gigwall', JSON.stringify({
        mode: state.mode,
        generic: state.generic,
        city: state.city,
        festivalId: state.festival ? state.festival.id : '',
        p1: state.p1, p2: state.p2, note: state.note,
        ratio: state.ratio.k, pos: state.pos, style: state.style,
        lineupId: state.lineupId,
        lineupOn: state.lineupOn,
        lineupOff: state.lineupOff,
        luText: state.luText
      }));
    } catch (e) {}
  }

  function pastedLineup(days) {
    if (!days || !days.length) return null;
    return {
      id: PASTED,
      year: '',
      name: '我的节目单',
      city: '',
      stage: '',
      dateLabel: '',
      source: '按你粘贴的内容排版',
      note: '',
      days: days
    };
  }

  function restore() {
    try {
      var s = JSON.parse(localStorage.getItem('gigwall') || '{}');
      if (s.mode) state.mode = s.mode;
      if (s.generic) state.generic = s.generic;
      if (s.city) state.city = s.city;
      if (s.p1) state.p1 = s.p1;
      if (s.p2) state.p2 = s.p2;
      if (s.note) state.note = s.note;
      if (s.pos) state.pos = s.pos;
      if (s.style) state.style = s.style;
      if (s.ratio) {
        G.RATIOS.forEach(function (r) { if (r.k === s.ratio) state.ratio = r; });
      }
      if (s.festivalId) {
        G.FESTIVALS.forEach(function (f) { if (f.id === s.festivalId) state.festival = f; });
      }
      if (s.luText) state.luText = s.luText;
      if (s.lineupOff) state.lineupOff = true;
      if (s.lineupId) {
        if (s.lineupId === PASTED) {
          state.lineup = pastedLineup(G.parseLineup(state.luText));
        } else {
          state.lineup = G.lineupById(s.lineupId);
        }
        state.lineupId = state.lineup ? s.lineupId : '';
        state.lineupOn = !!state.lineup && s.lineupOn !== false;
      }
    } catch (e) {}
  }

  function buildRatios() {
    G.RATIOS.forEach(function (r) {
      var b = document.createElement('button');
      b.type = 'button';
      b.textContent = r.label;
      b.dataset.v = r.k;
      if (r.k === state.ratio.k) b.className = 'on';
      b.addEventListener('click', function () {
        state.ratio = r;
        syncBtns(segRatio, r.k);
        save(); paint();
      });
      segRatio.appendChild(b);
    });
  }

  function buildGeneric() {
    G.GENERIC.forEach(function (t) {
      var b = document.createElement('button');
      b.type = 'button';
      b.title = t.label;
      b.dataset.v = t.k;
      b.style.background = t.c;
      if (t.k === state.generic) b.className = 'on';
      b.addEventListener('click', function () {
        state.generic = t.k;
        syncBtns(genericRow, t.k);
        save(); paint();
      });
      genericRow.appendChild(b);
    });
  }

  function usableFestivals() {
    return G.FESTIVALS.filter(function (f) {
      return G.lineupsOf(f.id).length > 0;
    });
  }

  function buildCities() {
    var cities = ['全部'];
    usableFestivals().forEach(function (f) {
      f.cities.forEach(function (c) {
        if (cities.indexOf(c) < 0) cities.push(c);
      });
    });
    cities.forEach(function (c) {
      var b = document.createElement('button');
      b.type = 'button';
      b.textContent = c;
      b.dataset.v = c;
      if (c === state.city) b.className = 'on';
      b.addEventListener('click', function () {
        state.city = c;
        syncBtns(citySeg, c);
        state.festival = null;
        renderFestivals(true);
        renderLineups();
        save(); paint();
      });
      citySeg.appendChild(b);
    });
  }

  function renderFestivals(autoPick) {
    var now = new Date();
    var list = G.rankFestivals(state.city, now).filter(function (f) {
      return G.lineupsOf(f.id).length > 0;
    });
    flist.innerHTML = '';

    if (!list.length) {
      var e = document.createElement('p');
      e.className = 'warn';
      e.textContent = '这个城市还没有收录节目单的音乐节，切回「全部」看看。';
      flist.appendChild(e);
      return;
    }

    var exists = state.festival && list.some(function (f) { return f.id === state.festival.id; });
    if (autoPick || !exists) state.festival = list[0];

    list.forEach(function (f) {
      var lu = G.lineupsOf(f.id)[0];

      var b = document.createElement('button');
      b.type = 'button';
      b.className = 'fit';
      if (state.festival && f.id === state.festival.id) b.className += ' on';
      if (f._nextYear) b.className += ' past';

      var when;
      if (f._nextYear) when = (lu ? lu.year : '') + ' 已结束 · 纪念款';
      else if (f._diff === 0) when = '本月';
      else when = f._diff + ' 个月后';

      var n = document.createElement('span');
      n.className = 'fit-n';
      n.textContent = f.name;

      var m = document.createElement('span');
      m.className = 'fit-m';
      m.textContent = lu
        ? (lu.city + ' · ' + lu.dateLabel)
        : (f.cities.join(' / ') + ' · ' + G.monthsLabel(f.months));

      var s = document.createElement('span');
      s.className = 'fit-s';
      s.textContent = when;

      b.appendChild(n);
      b.appendChild(m);
      b.appendChild(s);

      b.addEventListener('click', function () {
        if (state.festival && state.festival.id !== f.id) {
          if (state.lineup && state.lineup.festId && state.lineup.festId !== f.id) {
            state.lineup = null;
            state.lineupId = '';
            state.lineupOn = false;
          }
        }
        state.festival = f;
        renderFestivals(false);
        renderLineups();
        save(); paint();
      });

      flist.appendChild(b);
    });

    festWarn.textContent = '只列有真实节目单的场次；往届的标出来，做纪念款一样能用。';
  }

  function renderLineups() {
    luSeg.innerHTML = '';
    var fest = state.festival;
    var list = fest ? G.lineupsOf(fest.id) : [];
    var total = 0;

    // 选中带节目单的音乐节时默认印上，不让人去找
    if (list.length && !state.lineupOn && !state.lineupOff && !state.lineup) {
      state.lineup = G.lineupById(list[0].id);
      state.lineupId = list[0].id;
      state.lineupOn = true;
      save();
    }

    function mk(val, label) {
      var b = document.createElement('button');
      b.type = 'button';
      b.dataset.v = val;
      b.textContent = label;
      var on = !state.lineupOn ? val === '' : state.lineupId === val;
      if (on) b.className = 'on';
      b.addEventListener('click', function () {
        if (val === '') {
          state.lineupOn = false;
          state.lineupOff = true;
          state.lineup = null;
          state.lineupId = '';
        } else if (val === PASTED) {
          var lu = pastedLineup(G.parseLineup(state.luText));
          if (!lu) {
            toast('E10 没认出时间 —— 每行写「20:40-21:30 乐队名」');
            return;
          }
          state.lineup = lu;
          state.lineupId = PASTED;
          state.lineupOn = true;
          state.lineupOff = false;
        } else {
          state.lineup = G.lineupById(val);
          state.lineupId = val;
          state.lineupOn = true;
          state.lineupOff = false;
        }
        renderLineups();
        save(); paint();
      });
      luSeg.appendChild(b);
    }

    mk('', '不印');

    list.forEach(function (l) {
      l.days.forEach(function (d) { total += d.acts.length; });
      mk(l.id, l.year + ' ' + l.city);
    });

    if (String(state.luText || '').trim()) mk(PASTED, '我粘的');

    if (list.length) {
      luWarn.textContent = '收录 ' + total + ' 组真实时刻，来自「' + list[0].source + '」。' +
        '海报上印的是数据那一年，不冒充今年。';
    } else {
      luWarn.textContent = '这个音乐节还没有收录可核实的节目单。' +
        '照着官方图片粘进来，一样能排成海报。';
    }
  }

  function applyMode() {
    boxGeneric.hidden = state.mode !== 'generic';
    boxFestival.hidden = state.mode !== 'festival';
    boxPhoto.hidden = state.mode !== 'photo';
    syncBtns(segMode, state.mode);
    if (state.mode === 'festival') {
      renderFestivals(false);
      renderLineups();
    }
    paint();
  }

  function loadFile(f) {
    if (!f) return;
    if (!/^image\//.test(f.type)) {
      toast('E01 只支持图片文件（JPG / PNG / WebP）');
      return;
    }
    if (f.size > G.MAX_BYTES) {
      toast('E02 图片超过 20MB，压一下再传');
      return;
    }
    var url = URL.createObjectURL(f);
    var im = new Image();
    im.onload = function () {
      state.img = im;
      URL.revokeObjectURL(url);
      paint();
    };
    im.onerror = function () {
      URL.revokeObjectURL(url);
      toast('E03 这张图打不开，换一张试试（HEIC 请先转成 JPG）');
    };
    im.src = url;
  }

  function bindNum(input, key) {
    input.addEventListener('input', function () {
      var d = input.value.replace(/\D/g, '').slice(0, 11);
      input.value = d;
      state[key] = d;
      input.removeAttribute('aria-invalid');
      var w = input.parentElement.querySelector('.warn');
      if (w) {
        w.classList.remove('bad');
        w.textContent = '别填这台手机的号 —— 填家人、备用机或同事的。';
      }
      save(); paint();
    });
    input.addEventListener('focus', function () {
      input.value = input.value.replace(/\D/g, '');
    });
    input.addEventListener('blur', function () {
      input.value = G.formatPhone(input.value);
    });
  }

  function bindSeg(box, key) {
    box.addEventListener('click', function (e) {
      var b = e.target.closest ? e.target.closest('button[data-v]') : null;
      if (!b) return;
      state[key] = b.dataset.v;
      syncBtns(box, b.dataset.v);
      save(); paint();
    });
  }

  segMode.addEventListener('click', function (e) {
    var b = e.target.closest ? e.target.closest('button[data-v]') : null;
    if (!b) return;
    state.mode = b.dataset.v;
    applyMode();
    save();
  });

  drop.addEventListener('click', function () { file.click(); });
  drop.addEventListener('keydown', function (e) {
    if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); file.click(); }
  });
  ['dragenter', 'dragover'].forEach(function (ev) {
    drop.addEventListener(ev, function (e) { e.preventDefault(); drop.classList.add('over'); });
  });
  ['dragleave', 'drop'].forEach(function (ev) {
    drop.addEventListener(ev, function (e) { e.preventDefault(); drop.classList.remove('over'); });
  });
  drop.addEventListener('drop', function (e) {
    if (e.dataTransfer && e.dataTransfer.files) loadFile(e.dataTransfer.files[0]);
  });
  file.addEventListener('change', function () { loadFile(file.files[0]); });

  bindNum(p1, 'p1');
  bindNum(p2, 'p2');

  note.addEventListener('input', function () {
    state.note = note.value.slice(0, 24);
    note.value = state.note;
    save(); paint();
  });

  luText.addEventListener('input', function () {
    state.luText = luText.value;
    save();
  });

  luApply.addEventListener('click', function () {
    var days = G.parseLineup(state.luText);
    if (!days.length) {
      toast('E10 没认出时间 —— 每行写「20:40-21:30 乐队名」');
      return;
    }
    state.lineup = pastedLineup(days);
    state.lineupId = PASTED;
    state.lineupOn = true;
    state.lineupOff = false;
    renderLineups();
    save(); paint();
    var n = 0;
    days.forEach(function (d) { n += d.acts.length; });
    toast('识别到 ' + days.length + ' 段、' + n + ' 组');
  });

  luClear.addEventListener('click', function () {
    state.luText = '';
    luText.value = '';
    if (state.lineupId === PASTED) {
      state.lineup = null;
      state.lineupId = '';
      state.lineupOn = false;
    }
    renderLineups();
    save(); paint();
  });

  bindSeg(segPos, 'pos');
  bindSeg(segStyle, 'style');

  simLock.addEventListener('change', function () {
    lockui.hidden = !simLock.checked;
  });

  go.addEventListener('click', function () {
    var v = String(state.p1 || '').replace(/\D/g, '');
    if (v.length !== 11) {
      p1.setAttribute('aria-invalid', 'true');
      var w = p1.parentElement.querySelector('.warn');
      if (w) {
        w.textContent = 'E04 号码要 11 位数字';
        w.classList.add('bad');
      }
      p1.focus();
      return;
    }

    try {
      canvas.toBlob(function (blob) {
        if (!blob) {
          toast('E07 导出失败，刷新页面重试');
          return;
        }
        var url = URL.createObjectURL(blob);
        out.src = url;
        dl.href = url;
        sheetT.textContent = isIOS() ? '长按图片 → 存储到照片' : '点下载，或直接右键保存';
        sheet.hidden = false;
      }, 'image/png');
    } catch (e) {
      toast('E07 导出失败，刷新页面重试');
    }
  });

  closeBtn.addEventListener('click', function () {
    sheet.hidden = true;
    out.removeAttribute('src');
    if (dl.href && dl.href.indexOf('blob:') === 0) URL.revokeObjectURL(dl.href);
    dl.removeAttribute('href');
  });

  sheet.addEventListener('click', function (e) {
    if (e.target === sheet) closeBtn.click();
  });

  if (/MicroMessenger/i.test(navigator.userAgent)) {
    $('wxbar').hidden = false;
  }

  restore();
  buildRatios();
  buildGeneric();
  buildCities();
  p1.value = G.formatPhone(state.p1);
  p2.value = G.formatPhone(state.p2);
  note.value = state.note;
  luText.value = state.luText || '';
  syncBtns(segPos, state.pos);
  syncBtns(segStyle, state.style);
  applyMode();
})();
