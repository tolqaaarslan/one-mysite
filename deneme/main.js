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
            autoplay: 1,
            controls: 1,
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


     // Başlangıç tarihi
  const startDate = new Date("2014-05-06T19:00:00+03:00"); // Türkiye saatiyle
  
  const updateElapsedTime = () => {
    const now = new Date();
    const diff = now - startDate; // milisaniye cinsinden fark

    // Zaman birimlerini hesapla
    const seconds = Math.floor(diff / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);
    const months = Math.floor(days / 30.44);
    const years = Math.floor(months / 12);

    // Kalan değerler
    const remainingMonths = months % 12;
    const remainingDays = Math.floor(days % 30.44);
    const remainingHours = hours % 24;
    const remainingMinutes = minutes % 60;
    const remainingSeconds = seconds % 60;

    // Yazıya dönüştür
    const text =
      `${years > 0 ? years + " yıl, " : ""}` +
      `${remainingMonths > 0 ? remainingMonths + " ay, " : ""}` +
      `${remainingDays} gün, ${remainingHours} saat, ${remainingMinutes} dk, ${remainingSeconds} sn`;

    document.getElementById("time-since").textContent = text;
  };

  updateElapsedTime();
  setInterval(updateElapsedTime, 1000); // her saniye güncelle