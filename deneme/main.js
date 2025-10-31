 let players = [];
    const videos = [
      "Pfx7d4qhC5E", // Keane - Bedshaped
      "dVGINIsLnqU", // Keane - Somewhere Only We Know
      "RBumgq5yVrA"  // James Blunt - You're Beautiful
    ];

    // YouTube API yüklenince çağrılır
    function onYouTubeIframeAPIReady() {
      videos.forEach((id, index) => {
        players[index] = new YT.Player(`video${index + 1}`, {
          videoId: id,
          playerVars: {
            autoplay: 0,
            controls: 0,
            rel: 0,
            showinfo: 0,
            modestbranding: 1,
            mute: 1
          }
        });
      });
    }

    // Scroll: görünür olan videoyu oynat, diğerlerini durdur
    window.addEventListener("scroll", () => {
      document.querySelectorAll(".overlay").forEach((section, i) => {
        const rect = section.getBoundingClientRect();
        const inView = rect.top < window.innerHeight * 0.75 && rect.bottom > window.innerHeight * 0.25;

        if (inView) {
          players[i]?.playVideo();
        } else {
          players[i]?.pauseVideo();
        }

        // Parallax efekt: video biraz kayar
        const parallaxElement = section.querySelector(".parallax");
        const offset = rect.top * 0.2;
        parallaxElement.style.setProperty("--scroll", `${offset}px`);
      });
    });