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

  // find ts array
  const nsIdx = bundle.indexOf('ns=[');
  const markerIdx = bundle.indexOf('},ns=', nsIdx); // maybe
  console.log('ns marker check:', bundle.slice(nsIdx, nsIdx+60));
  // find the array end differently: search for '],Ve='? 
  const veIdx = bundle.indexOf('],Ve=', nsIdx);
  console.log('],Ve= idx:', veIdx);
  const arrTextRaw = bundle.slice(nsIdx + 3, veIdx + 1);
  const spreads = [...new Set(arrTextRaw.match(/\.\.\.[A-Za-z_$][\w$]*/g))];
  const rt = [...new Set(arrTextRaw.match(/releasedThemes:[A-Za-z_$][\w$]*/g))];
  const th = [...new Set(arrTextRaw.match(/themes:[A-Za-z_$][\w$]*/g))];
  console.log('ts spreads:', spreads);
  console.log('ts releasedThemes:', rt);
  console.log('ts themes:', th);
  console.log('ts head:', arrTextRaw.slice(0, 200));
})();
