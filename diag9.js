const origin = 'https://spritechecklist.org';

(async () => {
  const response = await fetch(origin + '/', { cache: 'no-store' });
  const html = await response.text();
  const wrapperMatch = html.match(/\/_astro\/Tracker\.[A-Za-z0-9_-]+\.js/);
  const wrapperResponse = await fetch(origin + wrapperMatch[0], { cache: 'no-store' });
  const wrapperText = await wrapperResponse.text();
  const originalMatch = wrapperText.match(/\.\/Tracker\.[A-Za-z0-9_-]+\.js/) || wrapperText.match(/Tracker\.[A-Za-z0-9_-]+\.js/);
  const originalFile = originalMatch[0].replace(/^\.\//, '');
  const bundleResponse = await fetch(origin + '/_astro/' + originalFile, { cache: 'no-store' });
  const bundle = await bundleResponse.text();

  // find the hs array (Override)
  const keyIdx = bundle.indexOf('hs=[');
  const markerIdx = bundle.indexOf('},hs=', keyIdx); // maybe different
  // find first '},' after keyIdx that is followed by 'hs='? Actually array ends before ',qe='? 
  const endMarker = bundle.indexOf('],qe=', keyIdx);
  console.log('endMarker', endMarker);
  const arrTextRaw = bundle.slice(keyIdx + 3, endMarker + 1);
  // find q context
  const i = arrTextRaw.indexOf('q');
  console.log('q context:', arrTextRaw.slice(Math.max(0, i-30), i+30));
  // all idents after colon
  const idents = [...new Set(arrTextRaw.match(/:\s*[a-zA-Z_$][\w$]*/g))];
  console.log('colon idents:', idents);
})();
