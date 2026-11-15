(function () {
  window.LOSTWALL = window.LOSTWALL || {};
  var G = window.LOSTWALL;

  /*
   * 节目单数据。
   *
   * 铁律：这里只放能查到出处的真实数据，一个字都不编。
   * 每个 lineup 必须带 source 和 year，海报上印的年份就是数据本身的年份 ——
   * 绝不能拿 2010 年的阵容贴 2026 的标签。
   *
   * 录入规则：
   *   - 一个 stage 一天，acts 按时间正序
   *   - t 是开演时刻，24 小时制 HH:MM
   *   - n 是乐队名（保留官方写法，宁可长）
   */
  G.LINEUPS = [
    {
      id: 'cs2025',
      festId: 'strawberry',
      year: 2025,
      name: '长沙草莓音乐节',
      en: 'CHANGSHA STRAWBERRY',
      city: '长沙',
      stage: '草莓舞台',
      dateLabel: '2025.06.01 – 06.02',
      source: '2025 长沙草莓音乐节官方演出时间表',
      note: '收录主舞台 24 组；喜鹊舞台、爱舞台未收录',
      days: [
        {
          label: '6.01 SUN',
          acts: [
            { t: '13:30', n: '高嘉丰 Jiafeng' },
            { t: '14:05', n: '莉莉周她说' },
            { t: '14:40', n: '黄之仪 KyraZilver' },
            { t: '15:20', n: '夏日入侵企画' },
            { t: '16:00', n: '阿肆' },
            { t: '16:40', n: '马赛克' },
            { t: '17:20', n: 'DOUDOU' },
            { t: '18:00', n: '棱镜' },
            { t: '18:40', n: '告五人' },
            { t: '19:20', n: '陈粒' },
            { t: '20:00', n: '陈绮贞' },
            { t: '20:40', n: '痛仰' }
          ]
        },
        {
          label: '6.02 MON',
          acts: [
            { t: '13:30', n: '海皮威尔' },
            { t: '14:05', n: '南青' },
            { t: '14:40', n: '椿' },
            { t: '15:20', n: '美好药店' },
            { t: '16:00', n: '岛屿心情' },
            { t: '16:40', n: '裁缝铺' },
            { t: '17:20', n: '声音碎片' },
            { t: '18:00', n: '梅卡德尔' },
            { t: '18:40', n: '郭顶' },
            { t: '19:20', n: '重塑雕像的权利' },
            { t: '20:00', n: '赵雷' },
            { t: '20:40', n: '万能青年旅店' }
          ]
        }
      ]
    }
  ];

  G.lineupsOf = function (festId) {
    return G.LINEUPS.filter(function (l) { return l.festId === festId; });
  };

  G.lineupById = function (id) {
    for (var i = 0; i < G.LINEUPS.length; i++) {
      if (G.LINEUPS[i].id === id) return G.LINEUPS[i];
    }
    return null;
  };

  function normTime(s) {
    var m = String(s).match(/(\d{1,2})\s*[:：]\s*(\d{2})/);
    if (!m) return '';
    var hh = parseInt(m[1], 10);
    var mm = m[2];
    if (hh > 23) return '';
    return (hh < 10 ? '0' + hh : String(hh)) + ':' + mm;
  }

  /*
   * 把用户粘来的一段节目单解析成 days。
   * 支持的写法（三种都认）：
   *   20:40-21:30 痛仰
   *   20:40 痛仰
   *   痛仰 20:40-21:30
   * 没有时间的行当作「日期分隔」，如 6.01 SUN / 8月29日 / Day 2。
   */
  G.parseLineup = function (text) {
    var raw = String(text || '').split(/[\n\r]+/);
    var days = [];
    var cur = null;

    for (var i = 0; i < raw.length; i++) {
      var line = raw[i].replace(/\s+/g, ' ').trim();
      if (!line) continue;

      var t = normTime(line);
      if (!t) {
        var label = line.replace(/^[-·•\s]+/, '').slice(0, 18);
        if (label) {
          cur = { label: label, acts: [] };
          days.push(cur);
        }
        continue;
      }

      // 去掉时间（含区间）后再拿名字
      var name = line
        .replace(/\d{1,2}\s*[:：]\s*\d{2}\s*([-–~至]\s*\d{1,2}\s*[:：]\s*\d{2})?/g, '')
        .replace(/^[\s\-–~·•|:：]+|[\s\-–~·•|:：]+$/g, '')
        .trim();

      if (!name) continue;
      if (!cur) {
        cur = { label: '节目单', acts: [] };
        days.push(cur);
      }
      cur.acts.push({ t: t, n: name.slice(0, 22) });
    }

    days = days.filter(function (d) { return d.acts.length; });
    days.forEach(function (d) {
      d.acts.sort(function (a, b) { return a.t < b.t ? -1 : a.t > b.t ? 1 : 0; });
    });
    return days;
  };
})();
