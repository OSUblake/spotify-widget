(async () => {

  const resources = await NerdLoader.load([
    "https://cdnjs.cloudflare.com/ajax/libs/gsap/3.4.0/gsap.min.js",
    "https://cdnjs.cloudflare.com/ajax/libs/bodymovin/5.6.8/lottie.min.js",
    "https://ext-assets.streamlabs.com/users/140067/SplitText.min.js",
    "https://cdnjs.cloudflare.com/ajax/libs/jquery/3.4.1/jquery.min.js",
    { name: "animData", url: "https://ext-assets.streamlabs.com/users/140067/V_Donation.json" }
  ]);

  const song = document.querySelector("#song");
  const artist = document.querySelector("#artist");
  const firstText = document.querySelector("#firstText");
  const secondText = document.querySelector("#secondText");
  let newArtist = "";
  let lastSong = "";
  let newSong = "";
  let shown = false;

  let messageLines = new SplitText("#alert-user-message", { type: "lines" });

  const master = gsap.timeline({
    autoRemoveChildren: true
  });

  const anim = bodymovin.loadAnimation({
    wrapper: document.querySelector("#animationWindow"),
    animType: "svg",
    loop: false,
    prerender: true,
    autoplay: false,
    animationData: resources.animData
  });

  checkUpdate();

  function hideText() {
    return gsap.to([artist, song], {
      x: -100,
      opacity: 0,
      duration: 0.3
    });
  }

  function resetPosition() {
    gsap.set([artist, song], { x: 7 });    
  }

  function showText() {

    const tl = gsap.timeline({
      defaults: {
        duration: 0.3,
        x: 7
      }
    });

    tl.to([artist, song], {
      opacity: 1
    });

    const overflowElements = [];

    if (newArtist.length > 29) {
      overflowElements.push(artist);
    } 

    if (newSong.length > 17) {
      overflowElements.push(song);
    } 

    tl.to(overflowElements, {
      x: 290,
      onComplete: resetPosition
    }, 0);

    return tl;
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

    animate(newArtist, newSong);
  }  

  async function checkUpdate() {

    [newSong, newArtist] = await Promise.all([
      getInfo("Snip_Artist.txt"),
      getInfo("Snip_Track.txt"),
    ]);

    displayData();
    gsap.delayedCall(2, checkUpdate);
  }

  async function getInfo(file) {
    const response = await fetch(file, {cache: "no-cache" });
    const text = await response.text();
    return text.replace(/&/g, "&amp;");
  }

  function animate(nextArtist, nextSong) {

    const group = gsap.timeline();

    group.add(hideText(), 0)
      .add(() => {
        artist.textContent = nextArtist;
        song.textContent = nextSong;
      });

    if (!shown) {
      master.add(group);
      return;
    }
    
    group.add(mainAnimation(nextArtist, nextSong), 0)
      .add(showText(), 0.4);
    
    master.add(group);
  }

  function mainAnimation(nextArtist, nextSong) {
    
    messageLines.revert();

    firstText.textContent = nextArtist;
    secondText.textContent = nextSong;

    messageLines = new SplitText("#alert-user-message", { type: "lines" });

    gsap.set("#alertHolder, #firstText, #secondText, #alert-user-message", {
      clearProps: "all"
    });

    return gsap.timeline()
      .to("#alertHolder", 0.5, { autoAlpha: 1 })
      .add(() => anim.goToAndPlay(0))
      .from("#firstText", { duration: 0.15, letterSpacing: "100px", ease: " power4.out" }, 0.7)
      .to("#firstText", { duration: 2, letterSpacing: "4px", autoRound: false }, 0.85)
      .to("#alert-user-message", { duration: 0.6, y: "-=20", autoAlpha: 1 }, 1)
      .to("#alert-user-message", { duration: 0.6, y: "-=20", autoAlpha: 1 }, 1)
      .from(messageLines, {
          duration: 0.4,
          y: 3,
          autoAlpha: 0,
          stagger: {
            amount: 0.3
          }
        }, 1)
      .to("#firstText", { duration: 0.05, autoAlpha: 0 }, 2)
      .from("#secondText", { duration: 0.05, autoAlpha: 0 }, 2.5)
      .from("#secondText", { duration: 0.15, letterSpacing: "100px", ease: " power4.out" }, 2.5)
      .to("#secondText", 4, { letterSpacing: "4px", autoRound: false }, 2.65)
      .to("#secondText", 0.05, { autoAlpha: 0 }, 6.5)
      .to("#alertHolder", 0.5, { autoAlpha: 0 });
  }
})();
