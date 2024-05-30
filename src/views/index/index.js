import 'bootstrap';
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

let tvCarousel = document.getElementById('tv-carousel');
let carouselInner = document.querySelector('#tv-carousel .carousel-inner');
let headlineTitle = document.querySelector('.headline-title');

/** @type {HTMLCanvasElement} */
let amblightCanvas = document.querySelector('.tv-amblight');
/** @type {HTMLElement} */
let canvasSource = undefined;

tvCarousel.addEventListener('slide.bs.carousel', (e) => {
  let fromId = carouselInner.children[e.from].dataset['itemId'];
  let toChild = carouselInner.children[e.to];
  canvasSource = toChild.querySelector('.amblight-src');
  let toId = toChild.dataset['itemId'];
  /** @type {HTMLElement} */
  let fromLabel = headlineTitle.querySelector(`.${fromId}`);
  /** @type {HTMLElement} */
  let toLabel = headlineTitle.querySelector(`.${toId}`);
  fromLabel.classList.toggle('active', false);
  toLabel.classList.toggle('active', true);
  amblightCanvas.classList.toggle('active', !!canvasSource);
});

let amblightCtx = amblightCanvas.getContext('2d');
setInterval(() => {
  if (!canvasSource) {
    return;
  }
  amblightCtx.drawImage(canvasSource, 0, 0, amblightCanvas.width, amblightCanvas.height);
}, 33);