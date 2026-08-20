const http = require('http');

http.get('http://localhost:3000/', (res) => {
  let html = '';
  res.on('data', chunk => html += chunk);
  res.on('end', async () => {
    console.log('HTML loaded, status:', res.statusCode, 'length:', html.length);
    const regex = /(?:src|href)=["'](\/_next\/static\/[^"']+)["']/g;
    const assets = [];
    let match;
    while ((match = regex.exec(html)) !== null) {
      assets.push(match[1]);
    }
    const unique = [...new Set(assets)];
    console.log('Total unique chunks/assets found:', unique.length);

    let all200 = true;
    for (const asset of unique) {
      await new Promise((resolve) => {
        http.get('http://localhost:3000' + asset, (r) => {
          if (r.statusCode !== 200) {
            all200 = false;
            console.error('ERROR ' + r.statusCode + ': ' + asset);
          } else {
            console.log('200 OK: ' + asset);
          }
          resolve();
        }).on('error', (e) => {
          all200 = false;
          console.error('FAIL ' + asset + ': ' + e.message);
          resolve();
        });
      });
    }

    if (all200) {
      console.log('>>> ALL CHUNKS AND ASSETS SERVED WITH HTTP 200 OK! <<<');
    } else {
      console.error('>>> SOME ASSETS FAILED! <<<');
    }
  });
}).on('error', (err) => {
  console.error('Failed to connect to dev server:', err.message);
});
