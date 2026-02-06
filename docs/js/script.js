document.addEventListener('DOMContentLoaded', function () {
  var yesBtn = document.getElementById('yesBtn');
  var noBtn = document.getElementById('noBtn');

  // YES button → go to reveal page
  if (yesBtn) {
    yesBtn.addEventListener('click', function () {
      window.location.href = 'valentine.html';
    });
  }

  // Sneaky NO button on the first page (with speed boost + 💨 dash)
  if (noBtn) {
    var escapeCount = 0;
    var pendingMove = null;

    function moveNoButton(event) {
      if (event) {
        event.preventDefault();
        event.stopPropagation();
      }

      var parent = noBtn.parentElement || document.body;

      escapeCount += 1;

      // The more she tries, the faster and farther it jumps
      var difficulty = Math.min(escapeCount, 10);
      var delay = Math.max(140 - difficulty * 15, 15); // moves earlier each time
      var distanceBoost = 1 + difficulty * 0.18; // jumps further each time

      if (pendingMove) {
        clearTimeout(pendingMove);
      }

      pendingMove = setTimeout(function () {
        var parentRect = parent.getBoundingClientRect();
        var btnRect = noBtn.getBoundingClientRect();

        var maxX = Math.max(parentRect.width - btnRect.width, 10);
        var maxY = Math.max(parentRect.height - btnRect.height, 10);

        var randomX = Math.random() * maxX * distanceBoost;
        var randomY = Math.random() * maxY * distanceBoost;

        randomX = Math.min(randomX, maxX);
        randomY = Math.min(randomY, maxY);

        noBtn.style.left = randomX + 'px';
        noBtn.style.top = randomY + 'px';
        // Clear initial centering transform so size stays like YES
        noBtn.style.transform = 'none';

        // Little dash emoji after it escapes
        var dash = document.createElement('span');
        dash.className = 'no-dash';
        dash.textContent = '💨';

        dash.style.left = randomX + btnRect.width * 0.6 + 'px';
        dash.style.top = randomY + btnRect.height * 0.1 + 'px';

        parent.appendChild(dash);

        setTimeout(function () {
          if (dash.parentNode) {
            dash.parentNode.removeChild(dash);
          }
        }, 500);
      }, delay);
    }

    ['mouseenter', 'click', 'touchstart', 'pointerdown', 'focus'].forEach(function (evtName) {
      noBtn.addEventListener(
        evtName,
        function (event) {
          moveNoButton(event);
        },
        { passive: false }
      );
    });
  }

  // Pop heart helper for cute effects
  function createPopHeart() {
    var heartEl = document.createElement('span');
    heartEl.className = 'pop-heart';
    heartEl.textContent = '💖';

    var viewportWidth = window.innerWidth || document.documentElement.clientWidth;
    var viewportHeight = window.innerHeight || document.documentElement.clientHeight;

    var x = viewportWidth * (0.25 + Math.random() * 0.5);
    var y = viewportHeight * (0.35 + Math.random() * 0.3);

    heartEl.style.left = x + 'px';
    heartEl.style.top = y + 'px';

    document.body.appendChild(heartEl);

    setTimeout(function () {
      if (heartEl.parentNode) {
        heartEl.parentNode.removeChild(heartEl);
      }
    }, 1000);
  }

  // Simple slideshow for the reveal page
  var track = document.getElementById('galleryTrack');
  var dotsContainer = document.getElementById('galleryDots');
  var bgMusic = document.getElementById('bgMusic');

  if (track && dotsContainer) {
    var slides = Array.prototype.slice.call(track.querySelectorAll('.gallery__item'));
    var dots = Array.prototype.slice.call(dotsContainer.querySelectorAll('.gallery__dot'));
    var currentIndex = 0;
    var startX = null;
    var isTouching = false;
    var autoTimer = null;
    var AUTO_DELAY = 3500;

    // Soft background music handling (only on reveal page)
    if (bgMusic) {
      bgMusic.volume = 0.6;
      var FADE_START_TIME = 120; // Start fading at 2 minutes (120 seconds)
      var FADE_DURATION = 3; // Fade out over 3 seconds
      var isFading = false;

      // Fade out music when it reaches 2 minutes
      bgMusic.addEventListener('timeupdate', function () {
        if (!isFading && bgMusic.currentTime >= FADE_START_TIME) {
          isFading = true;
          var startVolume = bgMusic.volume;
          var startTime = Date.now();

          var fadeInterval = setInterval(function () {
            var elapsed = (Date.now() - startTime) / 1000; // seconds
            var progress = Math.min(elapsed / FADE_DURATION, 1);
            bgMusic.volume = startVolume * (1 - progress);

            if (progress >= 1) {
              bgMusic.pause();
              clearInterval(fadeInterval);
            }
          }, 50); // Update every 50ms for smooth fade
        }
      });

      // Try autoplay; some browsers may block it until interaction
      bgMusic
        .play()
        .catch(function () {
          // Fallback: start music on first user interaction
          var startMusicOnce = function () {
            bgMusic.play().catch(function () {
              // ignore if still blocked
            });
            window.removeEventListener('click', startMusicOnce);
            window.removeEventListener('touchstart', startMusicOnce);
          };
          window.addEventListener('click', startMusicOnce, { once: true });
          window.addEventListener('touchstart', startMusicOnce, { once: true });
        });
    }

    function restartAuto() {
      if (autoTimer) {
        clearInterval(autoTimer);
      }
      autoTimer = setInterval(function () {
        var nextIndex = currentIndex + 1;
        if (nextIndex > slides.length - 1) {
          nextIndex = 0;
        }
        goToSlide(nextIndex, false);
      }, AUTO_DELAY);
    }

    function updateDots(index) {
      dots.forEach(function (dot, i) {
        if (i === index) {
          dot.classList.add('gallery__dot--active');
        } else {
          dot.classList.remove('gallery__dot--active');
        }
      });
    }

    function goToSlide(index, shouldRestart) {
      if (!slides.length) return;
      if (index < 0) index = 0;
      if (index > slides.length - 1) index = slides.length - 1;

      currentIndex = index;
      // Fade between slides by toggling active class
      slides.forEach(function (slide, i) {
        var video = slide.querySelector && slide.querySelector('video');
        if (i === index) {
          slide.classList.add('gallery__item--active');
          slide.setAttribute('aria-hidden', 'false');
          if (video) {
            // Autoplay video only when slide is active (muted + playsinline)
            try {
              video.play();
            } catch (e) {
              // Ignore autoplay errors (browser policies)
            }
          }
        } else {
          slide.classList.remove('gallery__item--active');
          slide.setAttribute('aria-hidden', 'true');
          if (video) {
            video.pause();
          }
        }
      });
      updateDots(index);

      // Pop a little heart each time she changes slide
      createPopHeart();

      if (shouldRestart !== false) {
        restartAuto();
      }
    }

    // Dots click
    dots.forEach(function (dot, index) {
      dot.addEventListener('click', function () {
        goToSlide(index, true);
      });
    });

    // Touch swipe (for phones)
    track.addEventListener(
      'touchstart',
      function (e) {
        if (!e.touches || !e.touches.length) return;
        startX = e.touches[0].clientX;
        isTouching = true;
      },
      { passive: true }
    );

    track.addEventListener(
      'touchend',
      function (e) {
        if (!isTouching || startX === null) return;
        var endX = (e.changedTouches && e.changedTouches[0].clientX) || startX;
        var diffX = endX - startX;

        var threshold = 40;
        if (Math.abs(diffX) > threshold) {
          if (diffX < 0) {
            goToSlide(currentIndex + 1, true);
          } else {
            goToSlide(currentIndex - 1, true);
          }
        }

        startX = null;
        isTouching = false;
      },
      { passive: true }
    );

    // Optional: click/drag with mouse on desktop
    track.addEventListener('mousedown', function (e) {
      startX = e.clientX;
      isTouching = true;
    });

    window.addEventListener('mouseup', function (e) {
      if (!isTouching || startX === null) return;
      var endX = e.clientX;
      var diffX = endX - startX;
      var threshold = 40;

      if (Math.abs(diffX) > threshold) {
        if (diffX < 0) {
          goToSlide(currentIndex + 1, true);
        } else {
          goToSlide(currentIndex - 1, true);
        }
      }

      startX = null;
      isTouching = false;
    });

    // Start on first slide + auto-play
    goToSlide(0, false);
    restartAuto();
  }
});

