/**
 * Homepage intro, 0.9s: the logo rises in while an EPC rating chart (bands A
 * to G) draws beneath it, then the cover lifts from 0.52s. Abdul asked for
 * more than the logo and a little longer (14/10/2026); the lift's easing is
 * OmniRated's, measured the same day. Inline in <body> so it runs before
 * the hero paints. Only for a fresh arrival on "/" (or a reload); never for
 * in-site navigation, back/forward, a #hash or reduced motion. Any input skips it.
 * Also never on Data Saver or a 2G/3G connection (16/10/2026: Abdul's call, as
 * the intro delays mobile LCP by 1-2s). Safari and Firefox don't expose
 * navigator.connection, so they always get it, as do Chrome users on 4G.
 * The hero's rise animations wait while `.ld-intro:not(.is-released)` exists.
 */
export const introScript = `(function(){
var d=document,w=window;
try{
if(location.pathname!=='/'||w.matchMedia('(prefers-reduced-motion: reduce)').matches)return;
var c=navigator.connection;
if(c&&(c.saveData||/[23]g$/.test(c.effectiveType||'')))return;
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
var bars='';for(var i=0;i<7;i++)bars+='<i style="--i:'+i+'"><b>'+'ABCDEFG'.charAt(i)+'</b></i>';
root.innerHTML='<div class="ld-intro__ground"></div><div class="ld-intro__mark"><img class="ld-intro__logo" src="/logo.svg" alt="" width="552" height="240"><div class="ld-intro__bands">'+bars+'</div></div>';
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
