// Run against the local server. Set PLAYWRIGHT_MODULE if Playwright is not on NODE_PATH.
const {chromium} = require(process.env.PLAYWRIGHT_MODULE || 'playwright');
const assert = require('node:assert/strict');
(async () => {
  const browser=await chromium.launch({headless:true,channel:process.env.BROWSER_CHANNEL || 'chrome'});
  const base=process.env.SCENE_URL || 'http://127.0.0.1:4181';
  const page=await browser.newPage({viewport:{width:1440,height:1000}});
  const errors=[];page.on('pageerror',error=>errors.push(error.message));
  try {
    await page.goto(`${base}/scene-preview.html?scene=1`);
    await page.waitForSelector('#preview-stage[data-scene="1"]');
    for (const time of [9,18,23,31,40,43]) {
      await page.getByRole('slider').fill(String(time));
      await page.screenshot({path:`/tmp/makathon-scene1-${time}.png`});
    }
    await page.getByRole('slider').fill('20');
    await page.getByRole('button',{name:'Play',exact:true}).click();
    await page.locator('.film-viewport').click();
    await page.waitForTimeout(150);
    assert.equal(await page.locator('#preview-stage').getAttribute('data-scene'),'1','early clicks must not skip the letter');
    await page.getByRole('slider').fill('42');
    await page.getByRole('button',{name:'Play',exact:true}).click();
    await page.locator('.film-viewport').click();
    await page.waitForSelector('#preview-stage[data-scene="2"]');
    for(const kind of ['black','smoke','flash','paper','cut']) {
      await page.getByRole('combobox',{name:'Review scene'}).selectOption('3');
      await page.waitForSelector('#preview-stage[data-scene="3"]');
      await page.getByRole('combobox',{name:'Transition preview'}).selectOption(kind);
      await page.getByRole('slider').fill('19.4');
      await page.getByRole('button',{name:'Play',exact:true}).click();
      await page.waitForSelector('#preview-stage[data-scene="4"]');
      await page.waitForTimeout(800);
      assert.equal(await page.locator('.film-scene').count(),1);
    }
    await page.getByRole('combobox',{name:'Review scene'}).selectOption('6');
    await page.waitForSelector('#preview-stage[data-scene="6"]');
    await page.getByRole('slider').fill('44.9');
    await page.getByRole('button',{name:'Play',exact:true}).click();
    await page.getByRole('button',{name:'Replay',exact:true}).waitFor();
    assert.equal(await page.locator('.film-scene').count(),0,'ending must dispose scene');
    await page.getByRole('button',{name:'Replay',exact:true}).click();
    await page.waitForSelector('#preview-stage[data-scene="1"]');
    await page.getByRole('button',{name:'Return to newspaper'}).click();
    await page.getByRole('button',{name:'Replay',exact:true}).waitFor();
    const mobile=await browser.newPage({viewport:{width:390,height:844},reducedMotion:'reduce'});
    await mobile.goto(`${base}/scene-preview.html?scene=1`);
    await mobile.waitForSelector('#preview-stage[data-scene="1"]');
    await mobile.getByRole('slider').fill('31');
    await mobile.screenshot({path:'/tmp/makathon-scene1-mobile.png'});
    assert.ok(await mobile.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),'mobile must not overflow');
    await mobile.getByRole('combobox',{name:'Review scene'}).selectOption('3');
    await mobile.waitForSelector('#preview-stage[data-scene="3"]');
    await mobile.getByRole('slider').fill('19.5');
    await mobile.getByRole('button',{name:'Play',exact:true}).click();
    await mobile.waitForSelector('#preview-stage[data-scene="4"]');
    await page.goto(`${base}/index.html`);
    await page.getByRole('button',{name:/Enter the photograph/}).click();
    await page.waitForSelector('#scene-stage[data-scene="0"]');
    await page.keyboard.press('Escape');
    await page.waitForFunction(()=>!document.querySelector('#scene').open);
    assert.equal(await page.locator('#newspaper').evaluate(el=>el.inert),false);
    assert.equal(await page.locator('#enter-scene').evaluate(el=>el===document.activeElement),true);
    assert.deepEqual(errors,[]);
    console.log('PASS: letter click gate, all five transitions, scene disposal, ending/replay, reduced motion, mobile layout, Escape and focus restoration.');
  } finally {await browser.close();}
})().catch(error=>{console.error(error);process.exitCode=1;});
