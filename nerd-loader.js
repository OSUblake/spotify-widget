class NerdLoader {

  constructor() {
    this.resources = {};
  }

  async load(assets = []) {

    const scripts = [];
    const images = [];
    const sounds = [];
    const videos = [];
    const jsons = [];

    assets.forEach(asset => {

      if (typeof asset === "string") {
        asset = { name: asset, url: asset };
      }

      if (!asset.name) {
        asset.name = asset.url;
      }

      const ext = ((asset.url || "").match(/\.([^.]*?)(?=\?|#|$)/) || [])[1];

      if (/(js)$/.test(ext)) {
        scripts.push(asset);
      }  else if (/(jpe?g|gif|png|svg|webp)$/.test(ext)) {
        images.push(asset)
      } else if (/(3gp|mpg|mpeg|mp4|m4v|m4p|ogv|ogg|mov|webm)$/.test(ext)) {
        videos.push(asset);
      } else if (/(mp3)$/.test(ext)) {
        sounds.push(asset);
      } else if (/(json)$/.test(ext)) {
        jsons.push(asset);
      }
    });

    // load scripts first for howler
    await Promise.all(scripts.map(asset => this.loadScript(asset)));

    // kill any previous running animations
    window.gsap && window.gsap.globalTimeline.getChildren().forEach(animation => animation.kill());       

    await Promise.all([
      ...sounds.map(asset => this.loadSound(asset)),
      ...videos.map(asset => this.loadVideo(asset)),
      ...images.map(asset => this.loadImage(asset)),
      ...jsons.map(asset => this.loadJson(asset)),
    ]);

    return this.resources;
  }

  loadJson({ name, url }) {
    return new Promise(async (resolve, reject) => {

      const cachedUrl = await this.checkCache(url);
      const response = await fetch(cachedUrl);
      const json = await response.json();
      this.resources[name] = json;
      resolve(json);
    });
  }

  loadImage({ name, url}) {
    return new Promise(async (resolve, reject) => {   

      const cachedUrl = await this.checkCache(url);

      const imageElement = new Image();
      imageElement.crossOrigin = "Anonymous";
      imageElement.src = cachedUrl;
      this.resources[name] = imageElement;

      if (imageElement.complete) {
        resolve(imageElement);
      } else {
        imageElement.onload = fulfill;
        imageElement.onerror = fulfill;
      }            

      function fulfill() {
        imageElement.onload = null;
        imageElement.onerror = null;
        resolve(imageElement);
      }
    });
  }

  loadVideo({ name, url, target }) {
    return new Promise(async (resolve, reject) => {

      const cachedUrl = await this.checkCache(url);
      const mediaElement = document.querySelector(target) || document.createElement("video");

      mediaElement.muted = true;
      mediaElement.crossOrigin = "Anonymous";
      mediaElement.src = cachedUrl;
      this.resources[name] = mediaElement;

      if (mediaElement.readyState > 3) {
        resolve(mediaElement);
      } else {
        mediaElement.oncanplaythrough = fulfill;
        mediaElement.onerror = fulfill;
      } 

      function fulfill() {
        mediaElement.oncanplaythrough = null;
        mediaElement.onerror = null;
        return resolve(mediaElement);
      }
    });    
  }

  loadScript({ name, url }) {
    return new Promise(async (resolve, reject) => {

      const cachedUrl = await this.checkCache(url);
      const scriptElements = Array.from(document.querySelectorAll("script"));
      let script = scriptElements.filter(scriptElement => scriptElement.src === cachedUrl)[0];

      if (script) {
        return fulfill();
      }
      
      script = document.createElement("script");
      document.head.appendChild(script);
      this.resources[name] = script;
  
      script.onerror = fulfill;
      script.onload = fulfill;
      script.src = cachedUrl;     

      function fulfill() {
        script.onload = null;
        script.onerror = null;
        return resolve(script);
      }
    });
  }

  loadSound({ name, url }) {
    return new Promise(async (resolve, reject) => {

      const cachedUrl = await this.checkCache(url);

      const sound = new Howl({
        src: cachedUrl,
        autoplay: false,
        mute: true,
        onloaderror: () => resolve(sound),
        onload: () => resolve(sound)
      });

      this.resources[name] = sound;
    });
  }

  checkCache(url) {
    return new Promise((resolve, reject) => {

      console.log("*** Checking cache", url);

      fetch(url)
        .then(() => resolve(url))
        .catch(() => {
          if (url.indexOf("nocache") !== -1) {
            return reject(`Cache failed: ${String(url)}`);
          }
          resolve(this.checkCache(`${url}?_nocache=${this.uniqueID()}`));
        });
    });
  }

  uniqueID() {
    return Date.now() + Math.random().toString(16).slice(2);
  }

  static async load(assets) {
    return new NerdLoader().load(assets);
  }
}
