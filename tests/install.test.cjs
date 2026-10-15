const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict'),path=require('node:path');
let installed,clicked;const opened=[];let options=0;
const chrome={runtime:{onInstalled:{addListener(fn){installed=fn}},getURL:p=>'chrome-extension://qa/'+p,openOptionsPage(){options++}},tabs:{create(v){opened.push(v)}},action:{onClicked:{addListener(fn){clicked=fn}}}};
vm.runInNewContext(fs.readFileSync(path.join(__dirname,'../background.bundle.js'),'utf8'),{chrome});
installed({reason:'update'});assert.equal(opened.length,0);
installed({reason:'install'});assert.equal(opened.length,1);assert.equal(opened[0].url,'chrome-extension://qa/welcome.html');
clicked();assert.equal(options,1);console.log('Install-only welcome and toolbar settings checks passed');
