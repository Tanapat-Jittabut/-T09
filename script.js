(function(){
  var g=document.getElementById('ticks'),ns='http://www.w3.org/2000/svg',cx=200,cy=200;
  function pt(a,r){var t=(a-90)*Math.PI/180;return[cx+r*Math.cos(t),cy+r*Math.sin(t)]}
  function el(n,at){var e=document.createElementNS(ns,n);for(var k in at)e.setAttribute(k,at[k]);g.appendChild(e);return e}
  // redline arc 7-9
  var a=pt(-135+7*30,168),b=pt(135,168);
  el('path',{d:'M'+a[0]+' '+a[1]+' A168 168 0 0 1 '+b[0]+' '+b[1],fill:'none',stroke:'#e60012','stroke-width':8});
  for(var i=0;i<=18;i++){
    var ang=-135+i*15,major=i%2===0,r1=major?150:158,r2=176;
    var p1=pt(ang,r1),p2=pt(ang,r2);
    el('line',{x1:p1[0],y1:p1[1],x2:p2[0],y2:p2[1],stroke:i>=14?'#e60012':'#f1eee6','stroke-width':major?3:1.5});
    if(major){
      var t=pt(ang,125),n=el('text',{x:t[0],y:t[1]+8,'text-anchor':'middle',fill:i>=14?'#ff4455':'#f1eee6','font-size':22,'font-style':'italic','font-weight':800,'font-family':'Kanit,sans-serif'});
      n.textContent=i/2;
    }
  }
})();

(function(){
var $=function(s){return document.querySelector(s)},$$=function(s){return[].slice.call(document.querySelectorAll(s))};
var needle=$('.needle'),IDLE=-118,started=false,busy=false,nos=false,AC;
needle.style.transition='transform .25s cubic-bezier(.3,1.4,.5,1)';
function setN(a){needle.style.transform='rotate('+a+'deg)'}
setN(-135);

/* engine sound (Web Audio) */
function rev(peak,dur){
  try{AC=AC||new (window.AudioContext||window.webkitAudioContext)()}catch(e){return}
  var t=AC.currentTime,f=AC.createBiquadFilter(),g=AC.createGain();
  f.type='lowpass';f.frequency.value=650;
  [['sawtooth',70],['square',35]].forEach(function(c){
    var o=AC.createOscillator();o.type=c[0];
    o.frequency.setValueAtTime(c[1],t);
    o.frequency.exponentialRampToValueAtTime(c[1]*peak,t+dur*.55);
    o.frequency.exponentialRampToValueAtTime(c[1]*peak*.35,t+dur);
    o.connect(f);o.start(t);o.stop(t+dur)});
  g.gain.setValueAtTime(.0001,t);g.gain.exponentialRampToValueAtTime(.09,t+.15);g.gain.exponentialRampToValueAtTime(.0001,t+dur);
  f.connect(g);g.connect(AC.destination)}
function revN(){
  busy=true;setN(125);
  setTimeout(function(){setN(92)},700);
  setTimeout(function(){setN(118)},1000);
  setTimeout(function(){busy=false},1800)}

/* push start */
var ign=$('.ign'),btn=$('.start');
function go(){
  if(started)return;started=true;
  ign.classList.add('off');document.body.classList.remove('lock');
  rev(5,2.2);revN();typeIt()}
btn.addEventListener('click',go);btn.focus();
$('.tach').addEventListener('click',function(){if(started&&!busy){rev(4.5,1.4);revN()}});

/* nitro mode */
function nitro(){
  nos=!nos;document.body.classList.toggle('nitro',nos);$('.nos').setAttribute('aria-pressed',nos);
  if(nos&&started){rev(7,1.6);revN()}}
$('.nos').addEventListener('click',nitro);
addEventListener('keydown',function(e){if(e.key==='n'||e.key==='N')nitro()});

/* typewriter */
var roles=['Junior Developer','DevOps Learner','สายซิ่ง JDM','Touge Driver'],ri=0,ci=0,del=false,rl=$('.role');
function typeIt(){
  var w=roles[ri],d;ci+=del?-1:1;rl.textContent=w.slice(0,ci);d=del?40:90;
  if(!del&&ci===w.length){del=true;d=1400}else if(del&&ci===0){del=false;ri=(ri+1)%roles.length;d=300}
  setTimeout(typeIt,d)}

/* sparks */
var cv=$('#fx'),cx=cv.getContext('2d'),P=[];
function rs(){cv.width=innerWidth;cv.height=innerHeight}rs();addEventListener('resize',rs);
function emit(x,y,n,burst){
  for(var i=0;i<n&&P.length<400;i++){var a=Math.random()*6.28,s=(burst?5:1.6)*Math.random()+.3;
    P.push({x:x,y:y,vx:Math.cos(a)*s,vy:Math.sin(a)*s-(burst?0:.6),l:1,r:Math.random()*2.5+1})}}
addEventListener('pointermove',function(e){emit(e.clientX,e.clientY,nos?3:1)});
addEventListener('pointerdown',function(e){emit(e.clientX,e.clientY,30,true)});
function draw(){
  cx.clearRect(0,0,cv.width,cv.height);cx.globalCompositeOperation='lighter';
  for(var i=P.length-1;i>=0;i--){var p=P[i];p.x+=p.vx;p.y+=p.vy;p.vy+=.03;p.l-=.025;
    if(p.l<=0){P.splice(i,1);continue}
    cx.fillStyle=nos?'rgba(90,180,255,'+p.l+')':'rgba(255,'+Math.round(60+p.l*110)+',20,'+p.l+')';
    cx.beginPath();cx.arc(p.x,p.y,p.r*p.l+.5,0,6.28);cx.fill()}
  requestAnimationFrame(draw)}
draw();

/* scroll = driving: speedometer, gear, progress, needle, parallax */
var lastY=scrollY,lastT=performance.now(),spd=0,bar=$('#nbar'),sp=$('#spd'),gr=$('#gear'),kj=$('.kanji');
function loop(now){
  var dt=Math.max(16,now-lastT),y=scrollY,v=Math.abs(y-lastY)/dt*1000;lastT=now;lastY=y;
  spd+=(Math.min(299,v/9+(nos?70:0))-spd)*.12;
  var k=Math.round(spd);sp.textContent=k;gr.textContent=k<4?'N':Math.min(6,1+Math.floor(k/50));
  var h=document.documentElement.scrollHeight-innerHeight;
  bar.style.width=(h>0?y/h*100:0)+'%';
  if(started&&!busy)setN(IDLE+Math.min(1,spd/300)*215);
  kj.style.transform='translateY('+(y*.25)+'px)';
  requestAnimationFrame(loop)}
requestAnimationFrame(loop);

/* reveal on scroll */
var rv=$$('h2,.specs>*,.skill,.stop,.car,.contact p,.links');
var io=new IntersectionObserver(function(es){es.forEach(function(en){
  if(en.isIntersecting){var t=en.target;t.classList.add('in');io.unobserve(t);
    setTimeout(function(){t.classList.remove('rv');t.style.transitionDelay=''},1100)}})},{threshold:.15});
rv.forEach(function(e,i){e.classList.add('rv');e.style.transitionDelay=(i%5)*80+'ms';io.observe(e)});

/* 3D tilt on cars */
$$('.car').forEach(function(c){
  c.addEventListener('mousemove',function(e){
    var r=c.getBoundingClientRect(),x=(e.clientX-r.left)/r.width-.5,y=(e.clientY-r.top)/r.height-.5;
    c.style.transform='perspective(600px) rotateY('+x*16+'deg) rotateX('+(-y*16)+'deg) translateY(-4px)'});
  c.addEventListener('mouseleave',function(){c.style.transform=''})});
})();
