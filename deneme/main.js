   let players = [];

    // YouTube API yüklenince çalışır
    function onYouTubeIframeAPIReady() {
      document.querySelectorAll('.video-container').forEach((el, i) => {
        const videoUrl = el.dataset.video;
        const videoId = videoUrl.split('embed/')[1].split('?')[0];

        players[i] = new YT.Player(el, {
          videoId: videoId,
          playerVars: {
            autoplay: 0,
            controls: 0,
            showinfo: 0,
            rel: 0,
            mute: 1,
            modestbranding: 1
          }
        });
      });
    }

    // Scroll sırasında hangi video görünüyorsa onu oynat
    window.addEventListener('scroll', () => {
      document.querySelectorAll('.overlay').forEach((section, i) => {
        const rect = section.getBoundingClientRect();
        const videoInView = rect.top < window.innerHeight * 0.75 && rect.bottom > window.innerHeight * 0.25;

        if (videoInView) {
          players[i]?.playVideo();
        } else {
          players[i]?.pauseVideo();
        }
      });
    });