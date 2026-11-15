(function () {
  window.GIGWALL = window.GIGWALL || {};
  var G = window.GIGWALL;

  G.FESTIVALS = [
    { id: 'midi', name: '迷笛', en: 'MIDI', cities: ['北京', '苏州', '深圳'], months: [5, 10] },
    { id: 'strawberry', name: '草莓', en: 'STRAWBERRY', cities: ['北京', '上海', '成都', '西安'], months: [4, 5, 9, 10] },
    { id: 'maitian', name: '麦田', en: 'MAITIAN', cities: ['北京'], months: [9, 10] },
    { id: 'cactus', name: '仙人掌', en: 'CACTUS', cities: ['成都'], months: [10] },
    { id: 'simplelife', name: '简单生活节', en: 'SIMPLE LIFE', cities: ['上海'], months: [11] },
    { id: 'nanxijiang', name: '楠溪江', en: 'NANXIJIANG', cities: ['温州'], months: [4, 5] },
    { id: 'aranya', name: '阿那亚', en: 'ARANYA', cities: ['秦皇岛'], months: [5, 6, 8, 9] },
    { id: 'shanhai', name: '山海', en: 'SHANHAI', cities: ['青岛', '厦门'], months: [7, 8] }
  ];

  G.CITIES = ['全部', '北京', '上海', '成都', '温州', '秦皇岛', '青岛', '厦门', '苏州', '深圳', '西安'];

  G.GENERIC = [
    { k: 'ink', label: '墨', c: '#171614' },
    { k: 'clay', label: '陶', c: '#7A3B22' },
    { k: 'deep', label: '深', c: '#1E2A33' }
  ];

  function monthInfo(months, now) {
    var cur = now.getMonth() + 1;
    var best = null;
    for (var i = 0; i < months.length; i++) {
      var d = months[i] - cur;
      var nextYear = false;
      if (d < 0) { d += 12; nextYear = true; }
      if (!best || d < best.diff) best = { diff: d, month: months[i], nextYear: nextYear };
    }
    return best || { diff: 12, month: months[0], nextYear: true };
  }

  G.rankFestivals = function (city, now) {
    var list = G.FESTIVALS.slice();
    if (city && city !== '全部') {
      list = list.filter(function (f) { return f.cities.indexOf(city) > -1; });
    }
    list.forEach(function (f) {
      var m = monthInfo(f.months, now);
      f._diff = m.diff;
      f._month = m.month;
      f._nextYear = m.nextYear;
    });
    list.sort(function (a, b) { return a._diff - b._diff; });
    return list;
  };

  G.monthsLabel = function (months) {
    return months.map(function (m) { return m + ' 月'; }).join(' · ');
  };
})();
