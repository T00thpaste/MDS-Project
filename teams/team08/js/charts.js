/*
  Team 8: turns the figures marked data-chart="..." in results.html into interactive charts.

  Each figure keeps its PNG. This script draws the chart from js/data.js (window.T8)
  with Plotly and hides the PNG. If Plotly or the data is missing, or a chart fails,
  the PNG simply stays, so the page always works.
*/
(function () {
  'use strict';
  var D = window.T8, P = window.Plotly;
  if (!D || !P) return;

  /* colours: page ink from the shared stylesheet, series colours checked for colour-blind separation */
  var INK = '#0A0E3F', MUTED = '#4B5090', GRID = '#E6E8F4', AXIS = '#B9BCD9', SURFACE = '#FFFFFF';
  var CAT = ['#2a78d6', '#eb6834', '#1baf7a', '#eda100', '#e87ba4', '#008300']; // one fixed colour per category
  var BANDS = ['#0d366b', '#1c5cab', '#2a78d6', '#5598e7', '#86b6ef'];           // grade bands, best to worst
  var DIVERGING = [[0, '#b42d2c'], [0.25, '#ef8f8e'], [0.5, '#f0efec'], [0.75, '#6da7ec'], [1, '#184f95']];
  var FONT = '"Instrument Sans", system-ui, -apple-system, "Segoe UI", Roboto, sans-serif';
  var CONFIG = { displayModeBar: false, responsive: true };

  function isObj(v) { return v && typeof v === 'object' && !Array.isArray(v); }
  function merge(a, b) {
    var out = {}, k;
    for (k in a) out[k] = a[k];
    for (k in b) out[k] = isObj(a[k]) && isObj(b[k]) ? merge(a[k], b[k]) : b[k];
    return out;
  }
  function axis(title) {
    return {
      gridcolor: GRID, linecolor: AXIS, zeroline: false, fixedrange: true, automargin: true,
      tickfont: { color: MUTED, size: 12 },
      title: title ? { text: title, font: { size: 12, color: MUTED }, standoff: 8 } : undefined
    };
  }
  function layout(extra) {
    return merge({
      font: { family: FONT, size: 13, color: INK },
      paper_bgcolor: SURFACE, plot_bgcolor: SURFACE,
      margin: { l: 8, r: 12, t: 8, b: 8 },
      hoverlabel: { bgcolor: SURFACE, bordercolor: INK, font: { family: FONT, color: INK, size: 13 } },
      xaxis: axis(), yaxis: axis(),
      legend: { orientation: 'h', x: 0, y: -0.12, yanchor: 'top', font: { size: 12 } },
      showlegend: true
    }, extra || {});
  }
  function sum(a) { return a.reduce(function (s, v) { return s + v; }, 0); }
  function hint(box, text) {
    var p = document.createElement('p');
    p.className = 'chart-hint';
    p.textContent = text;
    box.appendChild(p);
  }
  function segmented(controls, label, options, current, onPick) {
    var lab = document.createElement('label');
    lab.textContent = label;
    var seg = document.createElement('div');
    seg.className = 'seg';
    seg.setAttribute('role', 'group');
    seg.setAttribute('aria-label', label);
    options.forEach(function (opt) {
      var b = document.createElement('button');
      b.type = 'button';
      b.textContent = opt;
      b.setAttribute('aria-pressed', String(opt === current));
      b.addEventListener('click', function () {
        [].forEach.call(seg.children, function (x) { x.setAttribute('aria-pressed', String(x === b)); });
        onPick(opt);
      });
      seg.appendChild(b);
    });
    controls.appendChild(lab);
    controls.appendChild(seg);
  }

  var charts = {};

  /* Figure 1: overall and category means per year */
  charts.trend = function (el, controls, box) {
    var traces = [{
      x: D.years, y: D.trend.overall, name: 'Overall', mode: 'lines+markers',
      line: { color: INK, width: 3 }, marker: { size: 9, color: INK, line: { color: SURFACE, width: 2 } },
      customdata: D.trend.raw, hovertemplate: 'Overall: %{y:.1f}% (%{customdata} of 600)<extra></extra>'
    }];
    D.cats.forEach(function (c, i) {
      traces.push({
        x: D.years, y: D.trend.cats[c], name: c, mode: 'lines+markers',
        line: { color: CAT[i], width: 2 }, marker: { size: 8, color: CAT[i], line: { color: SURFACE, width: 2 } },
        hovertemplate: c + ': %{y:.1f}%<extra></extra>'
      });
    });
    P.newPlot(el, traces, layout({
      hovermode: 'x unified',
      margin: { t: 28 },
      xaxis: { type: 'category' },
      yaxis: merge(axis('Mean score (% of maximum)'), { range: [0, 100], ticksuffix: '%' }),
      shapes: [{ type: 'rect', xref: 'x', yref: 'paper', x0: 1, x1: 3, y0: 0, y1: 1, fillcolor: 'rgba(255,210,63,0.18)', line: { width: 0 }, layer: 'below' }],
      annotations: [
        { x: 2, y: 1, xref: 'x', yref: 'paper', yanchor: 'bottom', showarrow: false, text: 'COVID window', font: { size: 11, color: MUTED } },
        { x: 4, y: 1, xref: 'x', yref: 'paper', yanchor: 'bottom', showarrow: false, text: 'New 10-tier grade scale', font: { size: 11, color: MUTED } },
        { x: 3.5, y: 0, xref: 'x', yref: 'paper', yanchor: 'bottom', showarrow: false, text: 'no 2022-23 release', font: { size: 10, color: MUTED } }
      ]
    }), CONFIG);
    hint(box, 'Hover a year to compare all categories. Click a legend entry to hide or show it.');
  };

  /* Figure 2: share of districts per grade band */
  charts.grades = function (el) {
    var G = D.grades, traces = [];
    for (var b = G.bands.length - 1; b >= 0; b--) { // weakest band at the bottom of each bar
      traces.push({
        type: 'bar', x: D.years, name: G.bands[b],
        y: D.years.map(function (yr) { return G.counts[yr][b] / sum(G.counts[yr]) * 100; }),
        customdata: D.years.map(function (yr) { return G.counts[yr][b]; }),
        marker: { color: BANDS[b], line: { color: SURFACE, width: 2 } },
        hovertemplate: G.bands[b] + ': %{y:.1f}% (%{customdata} districts)<extra></extra>'
      });
    }
    P.newPlot(el, traces, layout({
      barmode: 'stack', bargap: 0.35, hovermode: 'x unified',
      xaxis: { type: 'category' },
      yaxis: merge(axis('Share of districts'), { range: [0, 100], ticksuffix: '%' }),
      legend: { traceorder: 'reversed' }
    }), CONFIG);
  };

  /* Figure 3: category change over two windows */
  charts.windows = function (el) {
    var W = D.windows, cats = D.cats.slice().reverse();
    function bars(w, color, label) {
      return {
        type: 'bar', orientation: 'h', name: label, y: cats,
        x: cats.map(function (c) { return w.d[c]; }),
        marker: { color: color, cornerradius: 4 },
        hovertemplate: '%{y}: %{x:+.1f} points<extra>' + label + '</extra>'
      };
    }
    P.newPlot(el, [
      bars(W.revision, CAT[1], W.revision.from + ' to ' + W.revision.to),
      bars(W.covid, CAT[0], 'COVID window, ' + W.covid.from + ' to ' + W.covid.to)
    ], layout({
      barmode: 'group', bargap: 0.3, bargroupgap: 0.1, hovermode: 'closest',
      xaxis: merge(axis('Change in mean score (percentage points)'), { zeroline: true, zerolinecolor: INK, zerolinewidth: 1 }),
      legend: { traceorder: 'reversed', y: -0.22 }
    }), CONFIG);
  };

  /* Figure 5: PCA projection coloured by cluster, with category loadings and a district finder */
  charts.pca = function (el, controls, box) {
    var p = D.pca, names = ['Weaker cluster', 'Stronger cluster'], colors = [CAT[1], CAT[0]];
    var traces = [0, 1].map(function (k) {
      var pts = p.points.filter(function (q) { return q[4] === k; });
      return {
        type: 'scatter', mode: 'markers', name: names[k] + ' (' + p.profiles[k].n + ' districts)',
        x: pts.map(function (q) { return q[2]; }), y: pts.map(function (q) { return q[3]; }),
        customdata: pts.map(function (q) { return [q[0], q[1], q[5]]; }),
        marker: { size: 8, color: colors[k], opacity: 0.8, line: { color: SURFACE, width: 1 } },
        hovertemplate: '<b>%{customdata[0]}</b>, %{customdata[1]}<br>Overall %{customdata[2]:.1f}%<extra>' + names[k] + '</extra>'
      };
    });
    traces.push({ // the district picked in the finder
      type: 'scatter', mode: 'markers+text', x: [], y: [], text: [], showlegend: false, hoverinfo: 'skip',
      marker: { size: 18, color: 'rgba(0,0,0,0)', line: { color: INK, width: 3 } },
      textposition: 'top center', textfont: { color: INK, size: 13, family: FONT }
    });
    // loading arrows from the origin, with the label just past the arrow head
    var scale = 3.6, arrows = [];
    D.cats.forEach(function (c, j) {
      var x = p.loadings[j][0] * scale, y = p.loadings[j][1] * scale;
      arrows.push({
        x: x, y: y, ax: 0, ay: 0, xref: 'x', yref: 'y', axref: 'x', ayref: 'y', text: '',
        showarrow: true, arrowhead: 2, arrowsize: 1, arrowwidth: 1.5, arrowcolor: INK
      });
      arrows.push({
        x: x * 1.18, y: y * 1.18, xref: 'x', yref: 'y', showarrow: false, text: '<b>' + c + '</b>',
        font: { size: 12, color: INK }, bgcolor: 'rgba(255,255,255,0.85)', borderpad: 1
      });
    });
    P.newPlot(el, traces, layout({
      hovermode: 'closest',
      xaxis: axis('PC1 (' + p.var[0] + '% of variance)'),
      yaxis: axis('PC2 (' + p.var[1] + '% of variance)'),
      annotations: arrows
    }), CONFIG);

    var index = {};
    var list = document.createElement('datalist');
    list.id = 't8-districts';
    p.points.forEach(function (q) {
      var label = q[0] + ', ' + q[1];
      index[label.toLowerCase()] = q;
      var o = document.createElement('option');
      o.value = label;
      list.appendChild(o);
    });
    var input = document.createElement('input');
    input.type = 'search';
    input.className = 'find';
    input.placeholder = 'Find a district, e.g. Dharwad';
    input.setAttribute('list', list.id);
    input.setAttribute('aria-label', 'Find a district');
    input.addEventListener('input', function () {
      var q = index[input.value.trim().toLowerCase()];
      if (q) P.restyle(el, { x: [[q[2]]], y: [[q[3]]], text: [[q[0]]] }, [2]);
      else if (!input.value.trim()) P.restyle(el, { x: [[]], y: [[]], text: [[]] }, [2]);
    });
    controls.appendChild(input);
    controls.appendChild(list);
    hint(box, 'Hover a dot for the district. Arrows point the way each category pushes a district on the chart.');
  };

  /* Figure 8: state mean against spread */
  charts.states = function (el) {
    var S = D.states, rows = S.rows;
    function pick(fn) { return rows.reduce(function (a, b) { return fn(b) > fn(a) ? b : a; }); }
    var labelled = [pick(function (r) { return r[1]; }), pick(function (r) { return -r[1]; }), pick(function (r) { return r[2]; })];
    P.newPlot(el, [{
      type: 'scatter', mode: 'markers', showlegend: false,
      x: rows.map(function (r) { return r[1]; }), y: rows.map(function (r) { return r[2]; }),
      customdata: rows.map(function (r) { return [r[0], r[3]]; }),
      marker: { size: 10, color: CAT[0], line: { color: SURFACE, width: 2 } },
      hovertemplate: '<b>%{customdata[0]}</b><br>Mean %{x:.1f}%<br>Spread (SD) %{y:.1f} points<br>%{customdata[1]} districts<extra></extra>'
    }], layout({
      hovermode: 'closest', showlegend: false,
      xaxis: merge(axis('Mean district score (%)'), { ticksuffix: '%' }),
      yaxis: axis('Spread of district scores (SD, points)'),
      shapes: [
        { type: 'line', xref: 'x', yref: 'paper', x0: S.median_mean, x1: S.median_mean, y0: 0, y1: 1, line: { color: AXIS, width: 1 } },
        { type: 'line', xref: 'paper', yref: 'y', x0: 0, x1: 1, y0: S.median_std, y1: S.median_std, line: { color: AXIS, width: 1 } }
      ],
      annotations: labelled.map(function (r) {
        return { x: r[1], y: r[2], text: r[0], showarrow: false, yshift: 13, font: { size: 11, color: INK } };
      })
    }), CONFIG);
  };

  /* Figure 14: correlation matrix with a year switch */
  charts.corr = function (el, controls) {
    var cats = D.cats, latest = D.years[D.years.length - 1];
    function trace(year) {
      var M = D.corr[year];
      return {
        type: 'heatmap', x: cats, y: cats, zmin: -1, zmax: 1, colorscale: DIVERGING, xgap: 2, ygap: 2,
        z: M.r.map(function (row, i) { return row.map(function (v, j) { return i === j ? null : v; }); }),
        text: M.r.map(function (row, i) {
          return row.map(function (v, j) { return i === j ? '' : (Math.abs(v) < 0.005 ? 0 : v).toFixed(2) + (M.p[i][j] >= 0.05 ? ' ns' : ''); });
        }),
        texttemplate: '%{text}', textfont: { size: 13 },
        hovertemplate: '%{y} and %{x}<br>r = %{z:.2f}<extra>' + year + '</extra>',
        colorbar: { thickness: 10, len: 0.9, outlinewidth: 0, tickvals: [-1, -0.5, 0, 0.5, 1], tickfont: { color: MUTED, size: 11 } }
      };
    }
    var lay = layout({
      showlegend: false,
      xaxis: { side: 'top', showgrid: false, linecolor: SURFACE },
      yaxis: { autorange: 'reversed', showgrid: false, linecolor: SURFACE, scaleanchor: 'x' }
    });
    P.newPlot(el, [trace(latest)], lay, CONFIG);
    segmented(controls, 'Year', D.years, latest, function (y) { P.react(el, [trace(y)], lay, CONFIG); });
  };

  function mount(fig, build) {
    var img = fig.querySelector('img');
    var box = document.createElement('div');
    box.className = 'chart-box';
    var controls = document.createElement('div');
    controls.className = 'chart-controls';
    var el = document.createElement('div');
    el.className = 'chart';
    el.setAttribute('role', 'img');
    el.setAttribute('aria-label', img ? img.alt : '');
    box.appendChild(controls);
    box.appendChild(el);
    fig.insertBefore(box, fig.firstChild);
    try {
      build(el, controls, box);
      if (!controls.children.length) box.removeChild(controls);
      if (img) img.style.display = 'none';
    } catch (err) {
      fig.removeChild(box);
      if (window.console) console.error('Team 8 chart failed, showing the PNG instead:', err);
    }
  }

  [].forEach.call(document.querySelectorAll('figure[data-chart]'), function (fig) {
    var build = charts[fig.getAttribute('data-chart')];
    if (build) mount(fig, build);
  });
})();
