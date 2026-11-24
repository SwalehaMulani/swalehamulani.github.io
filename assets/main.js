(function () {
  var root = document.documentElement;

  // ---------- Theme toggle ----------
  var toggle = document.getElementById("theme-toggle");
  function currentTheme() {
    var t = root.getAttribute("data-theme");
    if (t) return t;
    return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
  }
  toggle.addEventListener("click", function () {
    var next = currentTheme() === "dark" ? "light" : "dark";
    root.setAttribute("data-theme", next);
    try { localStorage.setItem("theme", next); } catch (e) {}
  });

  // ---------- Footer year ----------
  document.getElementById("year").textContent = new Date().getFullYear();

  // ---------- Nav: border on scroll + active section ----------
  var nav = document.querySelector(".nav");
  var navLinks = Array.prototype.slice.call(document.querySelectorAll(".nav-links a"));
  var linkFor = {};
  navLinks.forEach(function (a) { linkFor[a.getAttribute("href").slice(1)] = a; });
  var sections = Array.prototype.slice.call(document.querySelectorAll("main section[id]"));

  function onScroll() {
    nav.classList.toggle("scrolled", window.scrollY > 8);

    // The last nav-linked section whose top has passed the header is "active";
    // un-linked sections (Honours, Schools, ...) keep the previous one highlighted.
    var active = null;
    var atBottom = window.innerHeight + window.scrollY >= document.body.scrollHeight - 4;
    if (atBottom) {
      active = navLinks[navLinks.length - 1].getAttribute("href").slice(1);
    } else {
      sections.forEach(function (s) {
        if (s.getBoundingClientRect().top <= 120 && linkFor[s.id]) active = s.id;
      });
    }
    navLinks.forEach(function (a) {
      a.classList.toggle("active", a.getAttribute("href").slice(1) === active);
    });
  }
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  // ---------- Reveal sections on scroll ----------
  if ("IntersectionObserver" in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) {
          e.target.classList.add("visible");
          io.unobserve(e.target);
        }
      });
    }, { rootMargin: "0px 0px -8% 0px" });
    sections.forEach(function (s) {
      if (s.getBoundingClientRect().top > window.innerHeight) {
        s.classList.add("reveal");
        io.observe(s);
      }
    });
  }

  // ---------- Hero: twisting ribbon ----------
  // A band of fine lines that twists and undulates in 3D below the intro.
  // Where the band turns edge-on the lines pinch together, which is what
  // gives the sense of depth. The pointer nudges the twist and the swell.
  var canvas = document.getElementById("hero-canvas");
  if (canvas && canvas.getContext) {
    var ctx = canvas.getContext("2d");
    var hero = canvas.parentNode;
    var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    var LINES = 34, STEPS = 140;

    var w = 0, h = 0, colour = "#0f766e";
    var mid = 0, band = 0, swell = 0, edgeMask = null;
    var links = hero.querySelector(".links");
    var twist = 0, lift = 0, targetTwist = 0, targetLift = 0;
    var running = false, onScreen = true, start = performance.now();

    function readColour() {
      colour = getComputedStyle(root).getPropertyValue("--accent").trim() || colour;
    }

    function resize() {
      var dpr = Math.min(window.devicePixelRatio || 1, 2);
      w = hero.clientWidth;
      h = hero.clientHeight;
      canvas.width = Math.round(w * dpr);
      canvas.height = Math.round(h * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      // The ribbon lives in the space between the buttons and the bottom
      var top = links.getBoundingClientRect().bottom - hero.getBoundingClientRect().top + 24;
      var space = Math.max(100, h - top);
      mid = top + space * 0.5;
      band = space * 0.3;    // half-width of the ribbon
      swell = space * 0.14;  // how far its centre line rises and falls

      // Alpha mask that fades the ribbon out towards the left and right
      edgeMask = ctx.createLinearGradient(0, 0, w, 0);
      edgeMask.addColorStop(0, "rgba(0,0,0,0)");
      edgeMask.addColorStop(0.2, "#000");
      edgeMask.addColorStop(0.8, "#000");
      edgeMask.addColorStop(1, "rgba(0,0,0,0)");
    }

    function draw(t) {
      ctx.clearRect(0, 0, w, h);
      ctx.strokeStyle = colour;
      ctx.lineWidth = 1;
      var strength = w < 760 ? 0.5 : 0.6;
      var amp = swell * (1 + lift);

      for (var k = 0; k < LINES; k++) {
        var u = (k / (LINES - 1)) * 2 - 1;  // -1 … 1 across the ribbon
        ctx.globalAlpha = strength * (0.2 + 0.8 * (1 - u * u));
        ctx.beginPath();
        for (var i = 0; i <= STEPS; i++) {
          var x = i / STEPS;                // 0 … 1 across the screen
          var centre = mid + amp * (0.65 * Math.sin(5.2 * x + 0.5 * t) +
                                    0.35 * Math.sin(9.1 * x - 0.8 * t + 1.3));
          var angle = twist + 4.6 * x + 0.9 * Math.sin(3.1 * x + 0.35 * t) + 0.25 * t;
          // A slight curl across the band keeps the lines from meeting at a
          // single point when it turns edge-on, like a soft fold in silk
          var y = centre + band * (u * Math.cos(angle) + 0.28 * (u * u - 0.33) * Math.sin(angle));
          if (i === 0) ctx.moveTo(0, y); else ctx.lineTo(x * w, y);
        }
        ctx.stroke();
      }

      ctx.globalAlpha = 1;
      ctx.globalCompositeOperation = "destination-in";
      ctx.fillStyle = edgeMask;
      ctx.fillRect(0, 0, w, h);
      ctx.globalCompositeOperation = "source-over";
    }

    function frame(now) {
      if (!running) return;
      twist += (targetTwist - twist) * 0.03;
      lift += (targetLift - lift) * 0.03;
      draw((now - start) / 1000);
      requestAnimationFrame(frame);
    }

    function update() {
      var shouldRun = onScreen && !document.hidden && !reduceMotion;
      if (shouldRun && !running) {
        running = true;
        requestAnimationFrame(frame);
      } else if (!shouldRun) {
        running = false;
        if (reduceMotion) draw(0);
      }
    }

    window.addEventListener("pointermove", function (e) {
      targetTwist = (e.clientX / window.innerWidth - 0.5) * 1.2;
      targetLift = (0.5 - e.clientY / window.innerHeight) * 0.6;
    }, { passive: true });

    function relayout() { resize(); if (reduceMotion) draw(0); }
    window.addEventListener("resize", relayout);
    // Web fonts change the text height, which moves the buttons
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(relayout);
    document.addEventListener("visibilitychange", update);

    // Follow the theme: toggle button and system setting
    function onTheme() { readColour(); if (reduceMotion) draw(0); }
    new MutationObserver(onTheme).observe(root, { attributes: true, attributeFilter: ["data-theme"] });
    var scheme = window.matchMedia("(prefers-color-scheme: dark)");
    if (scheme.addEventListener) scheme.addEventListener("change", onTheme);

    if ("IntersectionObserver" in window) {
      new IntersectionObserver(function (entries) {
        onScreen = entries[0].isIntersecting;
        update();
      }).observe(hero);
    }

    readColour();
    resize();
    update();
  }
})();
