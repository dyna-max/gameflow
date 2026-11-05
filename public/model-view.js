// Shows a game's own .glb or .gltf file from its direct URL. Nothing is copied.
const query = new URLSearchParams(location.search), still = query.has('gfStill');
const tell = message => { if (parent !== window) parent.postMessage(message, location.origin); };
const model = document.querySelector('#model');
const nextFrame = () => new Promise(requestAnimationFrame);
let url;
try { url = new URL(query.get('src') || '', location.origin); } catch {}
if (!url || url.origin !== location.origin) tell({ gameflowPreview: 'error' });
else {
  if (!still) model.setAttribute('camera-controls', '');
  model.addEventListener('error', () => tell({ gameflowPreview: 'error' }));
  model.addEventListener('load', async () => {
    for (let i = 0; i < 5; i++) await nextFrame();
    const message = { gameflowPreview: 'ready' };
    if (still) message.image = model.toDataURL('image/png');
    tell(message);
  });
  model.src = url.href;
}
