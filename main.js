(function () {
  'use strict';

  /* ---------- entrances, once ---------- */
  var io = new IntersectionObserver(function (entries) {
    for (var i = 0; i < entries.length; i++) {
      var e = entries[i];
      if (e.isIntersecting) { e.target.classList.add('is-in'); io.unobserve(e.target); }
    }
  }, { rootMargin: '0px 0px -12% 0px', threshold: 0.1 });
  document.querySelectorAll('[data-reveal], .services li').forEach(function (el) { io.observe(el); });

  /* ---------- the live thing: open now, from the real hours in Toronto time ---------- */
  var HOURS = { 0: [11, 17], 1: [10, 20], 2: [10, 20], 3: [10, 20], 4: [10, 20], 5: [10, 20], 6: [9, 18] };
  var DAYS = { Sun: 0, Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6 };

  function torontoNow() {
    var f = new Intl.DateTimeFormat('en-US', { timeZone: 'America/Toronto', weekday: 'short', hour: 'numeric', minute: 'numeric', hour12: false });
    var parts = {};
    f.formatToParts(new Date()).forEach(function (p) { parts[p.type] = p.value; });
    var day = DAYS[String(parts.weekday).slice(0, 3)];
    var h = parseInt(parts.hour, 10) % 24;
    var m = parseInt(parts.minute, 10);
    if (day === undefined || isNaN(h) || isNaN(m)) return null;
    return { day: day, mins: h * 60 + m };
  }

  function clock(h) {
    var suffix = h >= 12 ? ' pm' : ' am';
    var hh = h % 12 || 12;
    return hh + suffix;
  }

  function status() {
    var now = torontoNow();
    if (!now) return null;
    var span = HOURS[now.day];
    var open = span[0] * 60, close = span[1] * 60;
    if (now.mins >= open && now.mins < close) {
      var left = close - now.mins;
      if (left <= 60) return { open: true, text: 'Open now, closing in ' + left + ' min' };
      return { open: true, text: 'Open now until ' + clock(span[1]) };
    }
    if (now.mins < open) return { open: false, text: 'Closed right now, opens today at ' + clock(span[0]) };
    var next = HOURS[(now.day + 1) % 7];
    return { open: false, text: 'Closed right now, opens tomorrow at ' + clock(next[0]) };
  }

  function paintStatus() {
    var s = status();
    if (!s) return;
    document.querySelectorAll('[data-status]').forEach(function (el) {
      el.textContent = s.text;
      el.setAttribute('data-open', s.open ? 'true' : 'false');
    });
  }
  paintStatus();
  setInterval(paintStatus, 60000);

  /* ---------- the reel: sound toggle, pause when off screen ---------- */
  var video = document.querySelector('.panel-1__video video');
  var sound = document.querySelector('.sound');
  if (video && sound) {
    sound.addEventListener('click', function () {
      var on = video.muted;
      video.muted = !on;
      sound.setAttribute('aria-pressed', on ? 'true' : 'false');
      sound.querySelector('span').textContent = on ? 'Sound on' : 'Sound off';
      if (on) { video.currentTime = 0; video.play().catch(function () {}); }
    });
  }
  var videos = document.querySelectorAll('video');
  var vio = new IntersectionObserver(function (entries) {
    entries.forEach(function (e) {
      if (e.isIntersecting) { e.target.play().catch(function () {}); }
      else { e.target.pause(); }
    });
  }, { threshold: 0.15 });
  videos.forEach(function (v) { vio.observe(v); });
  document.addEventListener('visibilitychange', function () {
    videos.forEach(function (v) {
      if (document.hidden) v.pause(); else v.play().catch(function () {});
    });
  });
})();
