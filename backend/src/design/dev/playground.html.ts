/**
 * Dev-only test harness for the design pipeline, served at /api/design/dev.
 *
 * It lives in the design module, not in `web-user/`, on purpose: `web-user/` is
 * Sarvarbek's folder (IMORA_TZ §4) and overwriting his design page to get a
 * quick visual test is exactly the collision the ownership rules exist to
 * prevent. This page is throwaway — delete it once his real screen lands.
 *
 * No style picker by design: this exists to prove upload -> variants -> tags and
 * to measure how long a user actually waits, nothing more.
 */
export const PLAYGROUND_HTML = `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>Imora design - dev test</title>
<style>
  body { font-family: system-ui, sans-serif; max-width: 900px; margin: 0 auto; padding: 24px; background: #faf9f7; color: #1c1917; }
  h1 { font-size: 20px; margin: 0 0 4px; }
  .sub { color: #78716c; font-size: 13px; margin-bottom: 20px; }
  .card { background: #fff; border: 1px solid #e7e5e4; border-radius: 10px; padding: 16px; margin-bottom: 16px; }
  button { background: #1c1917; color: #fff; border: 0; border-radius: 8px; padding: 10px 18px; font-size: 14px; cursor: pointer; }
  button:disabled { background: #a8a29e; cursor: not-allowed; }
  .grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(240px, 1fr)); gap: 14px; }
  .variant img { width: 100%; border-radius: 8px; border: 1px solid #e7e5e4; display: block; }
  .tag { display: inline-block; background: #f5f5f4; border: 1px solid #e7e5e4; border-radius: 999px; padding: 3px 10px; font-size: 12px; margin: 3px 3px 0 0; }
  .stat { display: inline-block; margin-right: 18px; font-size: 13px; }
  .stat b { font-variant-numeric: tabular-nums; }
  .err { color: #b91c1c; font-size: 14px; }
  .muted { color: #78716c; font-size: 12px; }
  #preview { max-width: 240px; border-radius: 8px; margin-top: 10px; display: none; }
</style>
</head>
<body>
  <h1>Imora - design pipeline test</h1>
  <div class="sub">Dev harness (design module). Not the real UI - that is web-user, Sarvarbek's screen.</div>

  <div class="card">
    <div id="quota" class="muted">checking quota...</div>
    <p><input type="file" id="file" accept="image/jpeg,image/png,image/webp"></p>
    <img id="preview" alt="selected room">
    <p><button id="go" disabled>Generate 3 designs</button></p>
    <div id="status" class="muted"></div>
  </div>

  <div id="result"></div>

<script>
var API = location.origin + '/api';
var fileEl = document.getElementById('file');
var goEl = document.getElementById('go');
var statusEl = document.getElementById('status');
var resultEl = document.getElementById('result');
var quotaEl = document.getElementById('quota');
var previewEl = document.getElementById('preview');

function refreshQuota() {
  fetch(API + '/design/quota').then(function (r) { return r.json(); }).then(function (q) {
    quotaEl.textContent = 'provider: ' + q.provider + ' (' + q.model + ')  |  cost/request: $' +
      q.estimatedCostUsd + '  |  requests left today: ' + q.remainingUserRequests +
      '  |  budget left: $' + q.remainingBudgetUsd;
  }).catch(function () { quotaEl.textContent = 'quota unavailable'; });
}

fileEl.addEventListener('change', function () {
  goEl.disabled = !fileEl.files.length;
  if (fileEl.files.length) {
    previewEl.src = URL.createObjectURL(fileEl.files[0]);
    previewEl.style.display = 'block';
  }
});

goEl.addEventListener('click', function () {
  var f = fileEl.files[0];
  if (!f) return;
  goEl.disabled = true;
  resultEl.innerHTML = '';
  var started = Date.now();
  var fd = new FormData();
  fd.append('image', f);
  fd.append('style', 'modern');

  statusEl.textContent = 'uploading...';
  fetch(API + '/design/requests', { method: 'POST', body: fd })
    .then(function (r) { return r.json().then(function (b) { return { ok: r.ok, body: b }; }); })
    .then(function (res) {
      if (!res.ok) throw new Error(res.body.message || 'upload failed');
      poll(res.body.id, started);
    })
    .catch(function (e) {
      statusEl.innerHTML = '<span class="err">' + e.message + '</span>';
      goEl.disabled = false;
      refreshQuota();
    });
});

function poll(id, started) {
  var tick = function () {
    var secs = ((Date.now() - started) / 1000).toFixed(1);
    statusEl.textContent = 'generating... ' + secs + 's';
    fetch(API + '/design/requests/' + id).then(function (r) { return r.json(); }).then(function (req) {
      if (req.status === 'done' || req.status === 'failed') {
        render(req, Date.now() - started);
        goEl.disabled = false;
        refreshQuota();
      } else {
        setTimeout(tick, 700);
      }
    });
  };
  tick();
}

function render(req, ms) {
  statusEl.textContent = '';
  if (req.status === 'failed') {
    resultEl.innerHTML = '<div class="card err">Generation failed after ' + (ms / 1000).toFixed(1) +
      's. The rest of the app keeps working (AC-10). Check the API log for the provider error.</div>';
    return;
  }
  var head = '<div class="card"><span class="stat">total wait <b>' + (ms / 1000).toFixed(1) +
    's</b></span><span class="stat">variants <b>' + req.variants.length +
    '</b></span><span class="stat">cost <b>$' + req.apiCost + '</b></span>' +
    '<span class="stat muted">AC-08 budget is 90s</span></div>';
  var grid = '<div class="grid">';
  req.variants.forEach(function (v, i) {
    grid += '<div class="card variant"><img src="' + v.imageUrl + '" alt="variant ' + (i + 1) +
      '"><div id="m' + v.id + '" class="muted" style="margin-top:8px">loading tags...</div></div>';
  });
  grid += '</div>';
  resultEl.innerHTML = head + grid;

  req.variants.forEach(function (v) {
    fetch(API + '/design/variants/' + v.id + '/materials')
      .then(function (r) { return r.json(); })
      .then(function (mats) {
        document.getElementById('m' + v.id).innerHTML =
          mats.map(function (m) { return '<span class="tag">' + m.label + '</span>'; }).join('');
      });
  });
}

refreshQuota();
</script>
</body>
</html>`;
