import gsap from 'gsap';
import ScrollTrigger from 'gsap/ScrollTrigger';
import MarqueeContent from 'marquee-content';

gsap.registerPlugin(ScrollTrigger);
MarqueeContent.registerGSAP(gsap, ScrollTrigger);

document.querySelectorAll('.marquee').forEach((element) => {
  const marquee = new MarqueeContent({
    element,
  });

  marquee.init();
});

const headlineFeatures = document.querySelectorAll('.headline-title .feature');
const tvScreen = document.querySelector('.tv-screen');
/** @type {HTMLImageElement} */
const tvAmblight = document.querySelector('.tv-amblight');
/** @type {HTMLImageElement} */
const tvGraphics = document.querySelector('.tv-graphics');
let startIndex = Math.floor(Math.random() * headlineFeatures.length);

function populateHeadline() {
  for (let i = 0; i < headlineFeatures.length; i++) {
    /** @type {HTMLElement} */
    const featureElem = headlineFeatures[i];
    const active = i === startIndex;
    featureElem.classList.toggle('active', active);
    if (active) {
      const amblightSrc = featureElem.dataset['amblightSrc'];
      tvScreen.classList.toggle('amblight', !!amblightSrc);
      tvAmblight.classList.toggle('visually-hidden', !amblightSrc);
      tvGraphics.src = featureElem.dataset['imgSrc'];
      tvAmblight.src = amblightSrc || '';
    }
  }
}

populateHeadline();
setInterval(function () {
  populateHeadline();
  startIndex = (startIndex + 1) % headlineFeatures.length;
}, 10000);