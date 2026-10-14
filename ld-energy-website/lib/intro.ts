/**
 * Homepage intro: the logo fills like a gauge, then the cover lifts (≈0.9s; the
 * lift starts at 0.36s). Pattern and easing measured on omnirated.co.uk,
 * 14/10/2026, shortened from their 1.8s. Inline in <body> so it runs before
 * the hero paints. Only for a fresh arrival on "/" (or a reload); never for
 * in-site navigation, back/forward, a #hash or reduced motion. Any input skips it.
 * The hero's rise animations wait while `.ld-intro:not(.is-released)` exists.
 */
export const introScript = `(function(){
var d=document,w=window;
try{
if(location.pathname!=='/'||w.matchMedia('(prefers-reduced-motion: reduce)').matches)return;
var nav=performance.getEntriesByType&&performance.getEntriesByType('navigation')[0];
var type=nav?nav.type:'navigate';
if(type!=='reload'){
if(type==='back_forward'||location.hash.length>1)return;
if(d.referrer&&new URL(d.referrer).origin===location.origin)return;
}
}catch(e){return}
var root=d.createElement('div');
root.className='ld-intro';
root.setAttribute('aria-hidden','true');
root.innerHTML='<div class="ld-intro__ground"></div><div class="ld-intro__mark"><img class="ld-intro__base" src="/logo.svg" alt="" width="552" height="240"><img class="ld-intro__fill" src="/logo.svg" alt="" width="552" height="240"></div>';
var ground=root.firstChild,names=['pointerdown','keydown','wheel','touchstart'],swept=false,done=false;
function listen(on){for(var i=0;i<names.length;i++){if(on)w.addEventListener(names[i],skip,{capture:true,passive:true});else w.removeEventListener(names[i],skip,{capture:true})}}
function skip(){if(!swept)root.classList.add('ld-intro--skip');listen(false)}
function release(){swept=true;listen(false);root.classList.add('is-released')}
function end(){if(done)return;done=true;release();root.remove()}
function isLift(e){return e.target===ground&&e.animationName.indexOf('ld-intro-lift')===0}
root.addEventListener('animationstart',function(e){if(isLift(e))release()});
root.addEventListener('animationend',function(e){if(isLift(e))end()});
d.body.appendChild(root);
listen(true);
setTimeout(end,2500);
})();`
