(function () {
  window.LOSTWALL = window.LOSTWALL || {};
  var G = window.LOSTWALL;

  G.RATIOS = [
    { k: '19.5', label: '19.5:9', w: 1179, h: 2556 },
    { k: '20', label: '20:9', w: 1080, h: 2400 },
    { k: '16', label: '16:9', w: 1440, h: 2560 }
  ];

  G.TEXTURES = [
    { k: 'slate', label: '岩', c: '#4A5058' },
    { k: 'amber', label: '暖', c: '#B4522A' },
    { k: 'dusk', label: '暮', c: '#5B4A85' },
    { k: 'moss', label: '苔', c: '#44604A' },
    { k: 'stripe', label: '纹', c: '#8A6A3C' },
    { k: 'dots', label: '点', c: '#2E4557' }
  ];

  G.STYLES = {
    dark: { bg: 'rgba(10,10,10,0.84)', fg: '#FFFFFF', sub: 'rgba(255,255,255,0.70)' },
    light: { bg: 'rgba(255,255,255,0.95)', fg: '#111110', sub: 'rgba(17,17,16,0.60)' },
    glass: { bg: 'rgba(255,255,255,0.13)', fg: '#FFFFFF', sub: 'rgba(255,255,255,0.78)' }
  };

  G.POS = { top: 0.28, mid: 0.44, bottom: 0.90 };

  G.MAX_BYTES = 20 * 1024 * 1024;
})();
