/* Shared behaviour for the hub and team sites. Teams do not need to edit this file. */
(function () {
  var root = document.documentElement;
  root.classList.add('js');
  var reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* drifting data points that swarm around the cursor */
  function field(canvas) {
    var ctx = canvas.getContext('2d'), w, h, pts = [], m = { x: -999, y: -999 }, on = true;
    function size() {
      var r = canvas.parentElement.getBoundingClientRect(), dpr = Math.min(devicePixelRatio || 1, 2);
      w = r.width; h = r.height; canvas.width = w * dpr; canvas.height = h * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      pts = [];
      for (var i = 0, n = Math.min(130, Math.round(w * h / 9000)); i < n; i++)
        pts.push({ x: Math.random() * w, y: Math.random() * h, vx: (Math.random() - .5) * .5, vy: (Math.random() - .5) * .5 });
    }
    function frame() {
      ctx.clearRect(0, 0, w, h);
      pts.forEach(function (p, i) {
        if (!reduce) {
          var dx = m.x - p.x, dy = m.y - p.y, d = Math.hypot(dx, dy);
          if (d < 170 && d > 1) { var f = d < 50 ? -.06 : .012; p.vx += dx / d * f; p.vy += dy / d * f; }
          var s = Math.hypot(p.vx, p.vy);
          if (s > 1.5) { p.vx *= 1.5 / s; p.vy *= 1.5 / s; }
          p.x += p.vx; p.y += p.vy;
          if (p.x < 0 || p.x > w) p.vx *= -1;
          if (p.y < 0 || p.y > h) p.vy *= -1;
        }
        for (var j = i + 1; j < pts.length; j++) {
          var q = pts[j], e = Math.hypot(p.x - q.x, p.y - q.y);
          if (e < 110) { ctx.strokeStyle = 'rgba(255,255,255,' + (1 - e / 110) * .35 + ')'; ctx.beginPath(); ctx.moveTo(p.x, p.y); ctx.lineTo(q.x, q.y); ctx.stroke(); }
        }
        var c = Math.hypot(m.x - p.x, m.y - p.y);
        if (c < 170) { ctx.strokeStyle = 'rgba(255,210,63,' + (1 - c / 170) * .8 + ')'; ctx.beginPath(); ctx.moveTo(p.x, p.y); ctx.lineTo(m.x, m.y); ctx.stroke(); }
        ctx.fillStyle = c < 170 ? '#FFD23F' : 'rgba(255,255,255,.85)';
        ctx.beginPath(); ctx.arc(p.x, p.y, 2, 0, 7); ctx.fill();
      });
    }
    (function loop() { if (on) frame(); requestAnimationFrame(loop); })();
    var host = canvas.parentElement;
    host.addEventListener('pointermove', function (e) { var r = canvas.getBoundingClientRect(); m.x = e.clientX - r.left; m.y = e.clientY - r.top; });
    host.addEventListener('pointerleave', function () { m.x = m.y = -999; });
    new IntersectionObserver(function (es) { on = es[0].isIntersecting; }).observe(host);
    var t; addEventListener('resize', function () { clearTimeout(t); t = setTimeout(size, 150); });
    size();
  }

  /* headline resolves out of random characters */
  function scramble(el) {
    var end = el.textContent.trim(), t0 = performance.now(), chars = '01#%/+*';
    el.setAttribute('aria-label', end);
    (function tick(t) {
      var k = Math.min(1, (t - t0) / 1000), out = '';
      for (var i = 0; i < end.length; i++) out += (end[i] === ' ' || i < k * end.length) ? end[i] : chars[Math.floor(Math.random() * chars.length)];
      el.textContent = out;
      if (k < 1) requestAnimationFrame(tick);
    })(t0);
  }

  /* reveal on scroll: plain position check, so hidden elements always get their turn */
  var pending = [];
  function check() {
    pending = pending.filter(function (el) {
      var r = el.getBoundingClientRect();
      if (r.top < innerHeight * .92 && r.bottom > 0) { el.classList.add('in'); return false; }
      return true;
    });
  }
  function reveal(list) {
    list.forEach(function (el, i) { el.classList.add('rv'); el.style.setProperty('--d', (i % 6) * .06 + 's'); pending.push(el); });
    setTimeout(check, 80);
  }
  addEventListener('scroll', check, { passive: true });
  addEventListener('resize', check);
  addEventListener('load', check);

  /* team photo: use images/team.(jpg|jpeg|png|webp) from the team's folder if it exists */
  function loadFirst(urls, ok) {
    (function next(i) {
      if (i >= urls.length) return;
      var im = new Image();
      im.onload = function () { ok(urls[i]); };
      im.onerror = function () { next(i + 1); };
      im.src = urls[i];
    })(0);
  }
  function teamUrls(base) { return ['jpg', 'jpeg', 'png', 'webp'].map(function (e) { return base + 'images/team.' + e; }); }

  function tilt(el) {
    el.addEventListener('pointermove', function (e) {
      var r = el.getBoundingClientRect(), x = e.clientX - r.left, y = e.clientY - r.top;
      el.style.setProperty('--mx', x + 'px'); el.style.setProperty('--my', y + 'px');
      if (!reduce) el.style.transform = 'perspective(800px) rotateX(' + ((y / r.height - .5) * -7) + 'deg) rotateY(' + ((x / r.width - .5) * 7) + 'deg)';
    });
    el.addEventListener('pointerleave', function () { el.style.transform = ''; });
  }

  /* every team gets its own little chart, drawn from its number */
  function rng(s) { return function () { s |= 0; s = s + 0x6D2B79F5 | 0; var t = Math.imul(s ^ s >>> 15, 1 | s); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }
  function glyph(seed) {
    var NS = 'http://www.w3.org/2000/svg', r = rng(seed * 7919 + 13), svg = document.createElementNS(NS, 'svg'), i, n = 0;
    svg.setAttribute('viewBox', '0 0 120 64'); svg.setAttribute('class', 'glyph'); svg.setAttribute('aria-hidden', 'true');
    function add(tag, a) { var e = document.createElementNS(NS, tag); for (var k in a) e.setAttribute(k, a[k]); if (a.class !== 'axis' && a.class !== 'trend') e.style.setProperty('--i', n++); svg.appendChild(e); }
    add('path', { d: 'M4 4V60H116', class: 'axis' });
    var type = seed % 4;
    if (type === 0) {
      var m = (r() - .5) * .9, b = 30 + (r() - .5) * 16;
      for (i = 0; i < 22; i++) { var x = 10 + i * 4.8, y = Math.max(8, Math.min(56, b + m * (x - 60) + (r() - .5) * 22)); add('circle', { cx: x, cy: y.toFixed(1), r: 2.3, class: 'dot' }); }
      add('path', { d: 'M10 ' + (b - m * 50).toFixed(1) + 'L114 ' + (b + m * 54).toFixed(1), class: 'trend', pathLength: 1 });
    } else if (type === 1) {
      for (i = 0; i < 12; i++) { var hh = 8 + r() * 44; add('rect', { x: 10 + i * 9, y: (60 - hh).toFixed(1), width: 6, height: hh.toFixed(1), rx: 1, class: 'bar' }); }
    } else if (type === 2) {
      var d = '', yy = 32;
      for (i = 0; i < 14; i++) { yy = Math.max(10, Math.min(54, yy + (r() - .5) * 26)); d += (i ? 'L' : 'M') + (10 + i * 8.1).toFixed(1) + ' ' + yy.toFixed(1); }
      add('path', { d: d, class: 'trend', pathLength: 1 });
    } else {
      for (var c = 0; c < 3; c++) { var cx = 25 + r() * 70, cy = 15 + r() * 34; for (i = 0; i < 8; i++) add('circle', { cx: (cx + (r() - .5) * 26).toFixed(1), cy: (cy + (r() - .5) * 20).toFixed(1), r: 2.3, class: 'dot' }); }
    }
    return svg;
  }

  function hub() {
    var grid = document.getElementById('team-grid'), empty = document.getElementById('empty'), q = document.getElementById('search');
    function render(list, animate) {
      grid.innerHTML = '';
      list.forEach(function (t) {
        var li = document.createElement('li'), a = document.createElement('a'), n = document.createElement('span'), p = document.createElement('span');
        a.href = 'teams/' + t.folder + '/index.html';
        n.className = 'team-name'; n.textContent = t.name; p.className = 'team-topic'; p.textContent = t.topic;
        a.appendChild(glyph(parseInt(t.folder.replace(/\D/g, ''), 10) || 1)); a.appendChild(n); a.appendChild(p);
        li.appendChild(a); grid.appendChild(li); tilt(a);
        var g = a.firstChild;
        loadFirst(teamUrls('teams/' + t.folder + '/'), function (u) {
          var dp = new Image(); dp.src = u; dp.alt = ''; dp.className = 'dp'; g.replaceWith(dp);
        });
      });
      if (animate) reveal([].slice.call(grid.children)); else [].forEach.call(grid.children, function (li) { li.classList.add('in'); });
      empty.hidden = list.length > 0;
    }
    q.addEventListener('input', function () {
      var s = q.value.trim().toLowerCase();
      render(window.TEAMS.filter(function (t) { return (t.name + ' ' + t.topic).toLowerCase().indexOf(s) > -1; }), false);
    });
    window.TEAM_INFO = window.TEAM_INFO || {};
    Promise.all(window.TEAMS.map(function (t) {
      return new Promise(function (done) {
        var s = document.createElement('script');
        s.src = 'teams/' + t.folder + '/info.js'; s.onload = s.onerror = done; document.head.appendChild(s);
      });
    })).then(function () {
      window.TEAMS.forEach(function (t) { var i = window.TEAM_INFO[t.folder]; if (i) { t.name = i.name || t.name; t.topic = i.topic || t.topic; } });
      render(window.TEAMS, true);
    });
  }

  [].forEach.call(document.querySelectorAll('canvas.field'), field);
  if (!reduce) [].forEach.call(document.querySelectorAll('[data-scramble]'), scramble);
  reveal([].slice.call(document.querySelectorAll('.result figure, .member')));
  [].forEach.call(document.querySelectorAll('.member'), tilt);
  [].forEach.call(document.querySelectorAll('img[data-team-photo]'), function (img) {
    loadFirst(teamUrls(''), function (u) { img.src = u; });
  });
  if (window.TEAMS) hub();
})();
