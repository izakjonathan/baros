import fs from 'node:fs';

const files=['app/globals.css','app/mono-tokens.css','app/mono-components.css'];
const sources=files.map((file)=>[file,fs.readFileSync(file,'utf8')]);

function stripComments(css){return css.replace(/\/\*[\s\S]*?\*\//g,'')}
function collectRules(css){
  css=stripComments(css);
  const rules=[];
  const stack=[];
  let start=0;
  for(let i=0;i<css.length;i++){
    if(css[i]==='{'){
      const header=css.slice(start,i).trim();
      stack.push({header,bodyStart:i+1,depth:stack.length});
      start=i+1;
    }else if(css[i]==='}'){
      const current=stack.pop();
      if(!current) throw new Error('Unbalanced CSS closing brace');
      const body=css.slice(current.bodyStart,i);
      if(!current.header.startsWith('@')){
        const context=stack.filter((item)=>item.header.startsWith('@')).map((item)=>item.header).join('|')||'base';
        rules.push({selector:current.header,context,body});
      }
      start=i+1;
    }
  }
  if(stack.length) throw new Error('Unbalanced CSS opening brace');
  return rules;
}

let important=0;
const exact=new Map();
let rootCount=0;
for(const [file,source] of sources){
  important+=(source.match(/!important\b/g)||[]).length;
  for(const rule of collectRules(source)){
    const key=`${file}|${rule.context}|${rule.selector}`;
    exact.set(key,(exact.get(key)||0)+1);
  }
}
rootCount=sources.reduce((count,[,source])=>count+(source.match(/^:root\s*\{/gm)||[]).length,0);
const duplicates=[...exact.entries()].filter(([,count])=>count>1);
const joined=sources.map(([,source])=>source).join('\n');
const components=fs.readFileSync('app/mono-components.css','utf8');
const checks=[
  ['no !important declarations',important===0],
  ['no repeated exact selectors in a stylesheet scope',duplicates.length===0],
  ['historical borderless block removed',!joined.includes('v0.9.6 borderless surface redesign')],
  ['historical monochrome block removed',!joined.includes('v0.9.7 monochrome minimal flat redesign')],
  ['single token root',rootCount===1],
  ['topbar base owned by component stylesheet',/\.topbar\s*\{[^}]*position\s*:\s*fixed/s.test(components)],
  ['metric card base owned by component stylesheet',/\.metric-card\s*\{[^}]*min-height/s.test(components)],
];
for(const [label,ok] of checks){if(!ok)throw new Error(`CSS ownership check failed: ${label}`);console.log(`PASS ${label}`)}
