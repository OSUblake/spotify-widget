(async () => {

  const resources = await NerdLoader.load([
    "https://cdnjs.cloudflare.com/ajax/libs/gsap/3.2.6/gsap.min.js",
    "https://cdnjs.cloudflare.com/ajax/libs/bodymovin/5.6.8/lottie.min.js",
    "https://ext-assets.streamlabs.com/users/140067/SplitText.min.js",
    "https://cdnjs.cloudflare.com/ajax/libs/jquery/3.4.1/jquery.min.js",
    { name: "animData", url: "https://ext-assets.streamlabs.com/users/140067/V_Donation.json" }
  ]);

  const song = document.querySelector("#song");
  const artist = document.querySelector("#artist");
  // let lastArtist = "";
  let newArtist = "";
  let lastSong = "";
  let newSong = "";
  let shown = false;

  let splitText = new SplitText("#alert-user-message", { type: "lines" })

  const anim = bodymovin.loadAnimation({
    wrapper: document.querySelector("#animationWindow"),
    animType: "svg",
    loop: false,
    prerender: true,
    autoplay: false,
    animationData: resources.animData
  });

  gsap.defaults({
    overwrite: true
  });

  checkUpdate();

  function hideText() {
    gsap.to([artist, song], {
      x: -100,
      opacity: 0,
      duration: 0.3
    })
  }

  function showText() {
    
    artist.textContent = newArtist;
    song.textContent = newSong;
  }

  function updateText() {

    const showAnimation = gsap.timeline();

    const hideAnimation = gsap.to([artist, song], {
        x: -100,
        opacity: 0,
        duration: 0.3,
        onComplete() {
          artist.textContent = newArtist;
          song.textContent = newSong;
        }
      });

    if (newArtist.length > 29) {

    } else {

    }
  }

  function displayData() {

    if (newSong === lastSong) return;

    lastSong = newSong;

    if (newSong.length && !shown) {
      shown = true;
    } 

    if (!newSong.length && shown) {
      shown = false;
    }

    updateText();
  }  

  async function checkUpdate() {

    [newSong, newArtist] = await Promise.all([
      getInfo("Snip_Artist.txt"),
      getInfo("Snip_Track.txt"),
    ]);

    displayData();
    setTimeout(checkUpdate, 2000);
  }

  async function getInfo(file) {
    const response = await fetch(file, {cache: "no-cache" });
    const text = await response.text();
    return text.replace(/&/g, "&amp;");
  }

  

  gsap.set("#alertHolder", {
    autoAlpha: 1
  })

  anim.goToAndPlay(0);

  function animate() {
    
  }
})();
