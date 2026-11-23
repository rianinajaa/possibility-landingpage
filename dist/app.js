import * as THREE from 'three';
import { ConvexGeometry } from './assets/ConvexGeometry.js';

const $ = s => document.querySelector(s);
const clamp = (x,a=0,b=1) => Math.max(a,Math.min(b,x));
const smooth = (a,b,x) => { const t=clamp((x-a)/(b-a)); return t*t*(3-2*t); };
const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;
const story=$('.scroll-story');
const cursor=$('.custom-cursor');
const finePointer=matchMedia('(hover:hover) and (pointer:fine)');
function hideCursor(){document.body.classList.remove('cursor-active');cursor.classList.remove('is-visible')}
addEventListener('pointermove',e=>{
 if(!finePointer.matches||e.pointerType==='touch'){hideCursor();return}
 document.body.classList.add('cursor-active');cursor.classList.add('is-visible');
 cursor.style.left=e.clientX+'px';cursor.style.top=e.clientY+'px';
 cursor.classList.toggle('is-hover',Boolean(e.target.closest('a,button')));
},{passive:true});
document.documentElement.addEventListener('pointerleave',hideCursor);
addEventListener('blur',hideCursor);
addEventListener('pointerdown',()=>cursor.classList.add('is-pressed'));
addEventListener('pointerup',()=>cursor.classList.remove('is-pressed'));
finePointer.addEventListener('change',hideCursor);
// Move the decorative cursor into the active dialog's top layer.

let targetProgress=0, progress=0, animationId;
let pointer={x:0,y:0}, focusPointer={x:0,y:0};
const range=()=>Math.max(1,story.offsetHeight-innerHeight);
const go=p=>window.scrollTo({top:range()*p,behavior:reducedMotion?'instant':'smooth'});
const syncScroll=()=>{ targetProgress=clamp(scrollY/range()); };
addEventListener('scroll',syncScroll,{passive:true});
addEventListener('pointermove',e=>{pointer.x=(e.clientX/innerWidth-.5)*2;pointer.y=(e.clientY/innerHeight-.5)*2},{passive:true});
$('.explore').addEventListener('click',()=>go(.28));
$('.restart').addEventListener('click',()=>go(0));
$('.brand').addEventListener('click',e=>{e.preventDefault();go(0)});
const nav=$('#navigation'), workDialog=$('#work-dialog'), contact=$('#contact-dialog');
let savedOverflow='';
function openDialog(dialog){dialog.appendChild(cursor);savedOverflow=document.body.style.overflow;document.body.style.overflow='hidden';dialog.showModal();if(dialog===nav)$('.menu-toggle').setAttribute('aria-expanded','true')}
function closeDialog(dialog){dialog.close()}
[nav,workDialog,contact].forEach(dialog=>dialog.addEventListener('close',()=>{document.body.appendChild(cursor);document.body.style.overflow=savedOverflow;$('.menu-toggle').setAttribute('aria-expanded','false')}));
$('.menu-toggle').addEventListener('click',()=>openDialog(nav));
$('.close-menu').addEventListener('click',()=>closeDialog(nav));
$('.close-work').addEventListener('click',()=>closeDialog(workDialog));
$('.close-contact').addEventListener('click',()=>closeDialog(contact));
$('#view-work').addEventListener('click',()=>openDialog(workDialog));
$('.contact-link').addEventListener('click',e=>{e.preventDefault();openDialog(contact)});
$('.contact-restart').addEventListener('click',()=>{closeDialog(contact);go(0)});
nav.querySelectorAll('[data-progress]').forEach(a=>a.addEventListener('click',e=>{e.preventDefault();closeDialog(nav);go(Number(a.dataset.progress))}));

const layers={hero:$('.hero'),belief:$('.belief'),fracture:$('.fracture'),possibility:$('.possibility'),work:$('.work-hint')};
function show(el,opacity,y=0){el.style.opacity=opacity;el.style.visibility=opacity>.005?'visible':'hidden';el.style.transform=`translate3d(0,${y}px,0)`;el.inert=opacity<.1;}
function updateCopy(p){
  $('.hero-atmosphere').style.opacity=1-smooth(.06,.20,p);
  show(layers.hero,1-smooth(.065,.17,p),-smooth(.015,.20,p)*innerHeight*.75);
  show(layers.belief,smooth(.425,.485,p)*(1-smooth(.565,.62,p)),(1-smooth(.42,.49,p))*70-smooth(.57,.64,p)*60);
  show(layers.fracture,smooth(.605,.67,p)*(1-smooth(.825,.9,p)));
  show(layers.possibility,smooth(.89,.965,p),(1-smooth(.88,.97,p))*40);
  show(layers.work,smooth(.22,.27,p)*(1-smooth(.345,.40,p)));
  $('.scroll-progress span').style.transform=`scaleY(${p})`;
  $('.chapter-status').style.opacity=p>.03?'.65':'0';
  $('.chapter-name').textContent=p<.4?'Progress & Possibility':p<.65?'Creativity & Curiosity':p<.88?'A different perspective':'Make progress';
}

async function start(){
 const scene=new THREE.Scene();
 scene.background=new THREE.Color('#191b1e');
 scene.fog=new THREE.Fog('#191b1e',15,32);
 const camera=new THREE.PerspectiveCamera(39,innerWidth/innerHeight,.1,70);
 camera.position.set(0,0,9);
 const renderer=new THREE.WebGLRenderer({antialias:true,alpha:false,powerPreference:'high-performance'});
 renderer.setPixelRatio(Math.min(devicePixelRatio,2));
 renderer.setSize(innerWidth,innerHeight);
 renderer.outputColorSpace=THREE.SRGBColorSpace;
 renderer.toneMapping=THREE.ACESFilmicToneMapping;
 renderer.toneMappingExposure=1.22;
 $('#scene').appendChild(renderer.domElement);
 const ambient=new THREE.HemisphereLight(0xc2d5e7,0x16181b,1.4);scene.add(ambient);
 const key=new THREE.DirectionalLight(0xf4f8ff,4.2);key.position.set(-4,6,5);scene.add(key);
 const rim=new THREE.DirectionalLight(0xb2c6df,3.2);rim.position.set(5,2,-3);scene.add(rim);
 const fill=new THREE.DirectionalLight(0xffffff,.7);fill.position.set(2,-3,4);scene.add(fill);
 // A small procedural studio environment gives the metal long, photographic reflections.
 const envScene=new THREE.Scene();envScene.background=new THREE.Color('#323740');
 function softbox(x,y,z,w,h,color,intensity=1){let m=new THREE.Mesh(new THREE.PlaneGeometry(w,h),new THREE.MeshBasicMaterial({color,side:THREE.DoubleSide}));m.position.set(x,y,z);m.lookAt(0,0,0);envScene.add(m);return m;}
 softbox(-4,3,3,3,7,0xffffff);softbox(5,2,-2,2,8,0xb7c7db);softbox(0,6,0,8,3,0xf7f9ff);softbox(2,-3,5,4,.5,0x6c7787);
 const pmrem=new THREE.PMREMGenerator(renderer);scene.environment=pmrem.fromScene(envScene,.025).texture;pmrem.dispose();
 const metal=new THREE.MeshStandardMaterial({color:0x949da6,metalness:1,roughness:.24,envMapIntensity:1.5});
 const triangle=new THREE.Group();scene.add(triangle);
 const shape=new THREE.Shape();shape.moveTo(0,1.77);shape.lineTo(-1.55,-.92);shape.lineTo(1.55,-.92);shape.closePath();
 const hole=new THREE.Path();hole.moveTo(0,.82);hole.lineTo(.72,-.43);hole.lineTo(-.72,-.43);hole.closePath();shape.holes.push(hole);
 const triGeo=new THREE.ExtrudeGeometry(shape,{depth:.51,bevelEnabled:true,bevelSegments:8,steps:1,bevelSize:.028,bevelThickness:.028,curveSegments:1});triGeo.translate(0,-.28,-.255);
 const triMesh=new THREE.Mesh(triGeo,metal);triangle.add(triMesh);
 const edges=new THREE.LineSegments(new THREE.EdgesGeometry(triGeo,28),new THREE.LineBasicMaterial({color:0xb0bac7,transparent:true,opacity:.17}));triangle.add(edges);
 const etched=new THREE.LineLoop(new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(0,.44,.289),new THREE.Vector3(-.12,.23,.289),new THREE.Vector3(.12,.23,.289)]),new THREE.LineBasicMaterial({color:0xeeeeee}));etched.position.set(-.50,.18,0);triangle.add(etched);

 // Project screens arranged around a shallow cylindrical arc.
 const gallery=new THREE.Group();scene.add(gallery);
 const textureLoader=new THREE.TextureLoader();
 const imageAssets=await Promise.all(['assets/naboso.webp','assets/blenders.webp'].map(src=>new Promise(resolve=>{const im=new Image();im.onload=()=>resolve(im);im.onerror=()=>resolve(null);im.src=src})));
 await document.fonts.ready;
 function panelTexture(kind){
  const c=document.createElement('canvas');c.width=2000;c.height=1320;const ctx=c.getContext('2d');ctx.scale(2,2);
  const text=(txt,x,y,size=32,color='#17191b',weight=400)=>{ctx.fillStyle=color;ctx.font=`${weight} ${size}px Gilroy, Arial`;ctx.fillText(txt,x,y)};
  if(kind===0){ctx.fillStyle='#ee16b9';ctx.fillRect(0,0,1000,660);text('Naboso',48,65,32,'white',800);text('FEEL',48,285,130,'white',800);text('MORE.',48,410,130,'white',800);text('A sensory revolution.',48,590,25,'white');if(imageAssets[0])ctx.drawImage(imageAssets[0],650,55,300,550)}
  if(kind===1){ctx.fillStyle='#f4f3ef';ctx.fillRect(0,0,1000,660);text('wellness.',42,55,35,'#17191b',800);text('A little more',60,230,76,'#17191b',800);text('feeling.',60,307,76,'#17191b',800);text('Meet your next step.',60,367,25);ctx.strokeStyle='#cbc9c3';ctx.strokeRect(58,425,280,70);text('Explore the collection',83,471,22);for(let i=0;i<3;i++){ctx.fillStyle=['#c6d8cd','#ded8ca','#b9b7b1'][i];ctx.beginPath();ctx.ellipse(730+i*35,360-i*55,96,175,-.45,0,Math.PI*2);ctx.fill()}text('MADE TO MOVE YOU',60,610,18)}
  if(kind===2){ctx.fillStyle='#ecedf0';ctx.fillRect(0,0,1000,660);text('Naboso',45,56,30,'#17191b',800);text('Feel the difference.',50,155,62,'#17191b',800);ctx.fillStyle='#d3d6d9';ctx.fillRect(300,220,400,330);for(let i=0;i<6;i++){ctx.fillStyle=`hsl(190,${15+i*3}%,${20+i*7}%)`;ctx.beginPath();ctx.ellipse(500,270+i*35,120-i*5,36,0,0,Math.PI*2);ctx.fill()}text('A new way to experience everyday.',50,605,24)}
  if(kind===3){ctx.fillStyle='#f2f3e9';ctx.fillRect(0,0,1000,660);ctx.fillStyle='#d9f246';ctx.fillRect(200,135,610,400);text('THE NEW',245,300,90,'#313c1b',800);text('NATURAL.',245,395,84,'#313c1b',800);text('Good things are growing.',50,610,24);text('Reimagining what comes next.',50,55,25)}
  if(kind===4){ctx.fillStyle='#ddd';ctx.fillRect(0,0,1000,660);if(imageAssets[1])ctx.drawImage(imageAssets[1],0,0,1000,660);text('A FRESH PERSPECTIVE',40,610,28,'#fff',800)}
  const t=new THREE.CanvasTexture(c);t.colorSpace=THREE.SRGBColorSpace;t.anisotropy=renderer.capabilities.getMaxAnisotropy();return t;
 }
 const panelMeshes=[];
 for(let i=0;i<5;i++){
  const group=new THREE.Group();let n=i-2;
  group.position.set(n*3.42,0,-2.6+n*n*.25);group.rotation.y=-n*.19;
  const border=new THREE.Mesh(new THREE.BoxGeometry(3.36,2.27,.07),new THREE.MeshStandardMaterial({color:0x0b0c0d,roughness:.65}));group.add(border);
  const screen=new THREE.Mesh(new THREE.PlaneGeometry(3.24,2.15),new THREE.MeshBasicMaterial({map:panelTexture(i),toneMapped:false}));screen.position.z=.041;group.add(screen);gallery.add(group);panelMeshes.push(screen);
 }
 // The scanned portrait is split into Voronoi-like regions. Boundary caps make
 // the pieces solid when they separate, while preserving the scanned surface.
 const sculpture=new THREE.Group();scene.add(sculpture);
 const sculptureMaterial=new THREE.MeshStandardMaterial({color:0x747e89,metalness:.48,roughness:.4,envMapIntensity:.65});
 sculptureMaterial.onBeforeCompile=shader=>{
  shader.vertexShader=shader.vertexShader.replace('#include <common>','#include <common>\nvarying vec3 vStone;').replace('#include <begin_vertex>','#include <begin_vertex>\nvStone=position;');
  shader.fragmentShader=shader.fragmentShader.replace('#include <common>',`#include <common>\nvarying vec3 vStone;\nfloat n3(vec3 p){return fract(sin(dot(p,vec3(12.9898,78.233,54.53)))*43758.5453);}`)
  .replace('#include <color_fragment>',`#include <color_fragment>\nfloat vein=sin(vStone.x*24.0+vStone.y*16.0+sin(vStone.z*17.0)*3.0+sin(vStone.y*39.0)*.4);\nfloat mineral=smoothstep(.55,.98,vein);\ndiffuseColor.rgb*=.92+mineral*.08+n3(floor(vStone*180.0))*.08;`);
 };
 const interiorMaterial=new THREE.MeshStandardMaterial({color:0x535b64,roughness:.82,metalness:.1,side:THREE.DoubleSide});
 // Fine suspended shards bridge the fractured bust into an orbital finale.
 const debris=new THREE.Group();scene.add(debris);
 const shardGeo=new THREE.TetrahedronGeometry(.055,0);
 const shards=new THREE.InstancedMesh(shardGeo,metal,150);debris.add(shards);
 const dummy=new THREE.Object3D();
 const finale=new THREE.Group();scene.add(finale);
 const orbitMaterial=new THREE.MeshStandardMaterial({color:0x9aa8bf,metalness:.95,roughness:.18});
 for(let i=0;i<3;i++){
  const ring=new THREE.Mesh(new THREE.TorusGeometry(2.6+i*.22,.018+i*.009,12,200),orbitMaterial);
  ring.rotation.set(.7+i*.8,.3+i*.65,i*.6);finale.add(ring);
 }
 const core=new THREE.Mesh(new THREE.IcosahedronGeometry(1.35,1),new THREE.MeshPhysicalMaterial({color:0x4c5365,metalness:1,roughness:.16,clearcoat:1,clearcoatRoughness:.12}));finale.add(core);
 const coreEdges=new THREE.LineSegments(new THREE.EdgesGeometry(core.geometry),new THREE.LineBasicMaterial({color:0xcedbeb,transparent:true,opacity:.23}));core.add(coreEdges);
 const accent=new THREE.PointLight(0xb7a8e2,12,12,2);accent.position.set(-3,1,3);scene.add(accent);
 let pieces=[];
 try{
  const response=await fetch('./assets/zeus.bin');
  if(!response.ok)throw new Error('Sculpture asset unavailable');
  const binary=await response.arrayBuffer();
  const counts=new Uint32Array(binary,0,2),vertexCount=counts[0];
  const geometry=new THREE.BufferGeometry();
  geometry.setAttribute('position',new THREE.BufferAttribute(new Float32Array(binary,8,vertexCount*3),3));
  geometry.setAttribute('normal',new THREE.BufferAttribute(new Float32Array(binary,8+vertexCount*12,vertexCount*3),3));
  const indices=new Uint32Array(binary,8+vertexCount*24,counts[1]);
  geometry.computeBoundingBox();
  // Remove the display plinth, retaining only the original sculptural bust.
  const cutoff=geometry.boundingBox.min.y+(geometry.boundingBox.max.y-geometry.boundingBox.min.y)*.18;
  const kept=[];for(let i=0;i<indices.length;i+=3){if([indices[i],indices[i+1],indices[i+2]].every(k=>geometry.attributes.position.getY(k)>cutoff))kept.push(indices[i],indices[i+1],indices[i+2]);}
  geometry.setIndex(kept);const trimmed=geometry.toNonIndexed();trimmed.rotateY(Math.PI);trimmed.computeBoundingBox();
  const raw=[trimmed];
  const size=trimmed.boundingBox.getSize(new THREE.Vector3()),center=trimmed.boundingBox.getCenter(new THREE.Vector3());
  const scale=4.25/size.y;
  const seeds=[[-.55,1.55,.1],[.45,1.5,.25],[-.65,.7,.5],[.3,.85,.7],[.65,.4,-.1],[-.4,.2,-.5],[.15,.1,.8],[-.6,-.5,.5],[.55,-.6,.6],[0,-.95,-.4],[-.5,-1.4,.2],[.5,-1.6,.1],[0,1,-.65],[0,-.3,-.7],[-.9,-.9,-.2],[.9,-1,-.25]].map(v=>new THREE.Vector3(...v));
  const buckets=seeds.map(()=>({p:[],n:[],edges:new Map()}));
  const vertexKey=v=>v.map(x=>x.toFixed(4)).join(',');
  raw.forEach(source=>{
   const geo=source.index?source.toNonIndexed():source;
   if(!source.userData.normalized){geo.translate(-center.x,-center.y,-center.z);geo.scale(scale,scale,scale);}if(!geo.attributes.normal)geo.computeVertexNormals();
   const pos=geo.attributes.position,norm=geo.attributes.normal;
   for(let i=0;i<pos.count;i+=3){
    const v=[0,1,2].map(j=>[pos.getX(i+j),pos.getY(i+j),pos.getZ(i+j)]);
    const c=new THREE.Vector3((v[0][0]+v[1][0]+v[2][0])/3,(v[0][1]+v[1][1]+v[2][1])/3,(v[0][2]+v[1][2]+v[2][2])/3);
    let nearest=0,d=Infinity;seeds.forEach((s,j)=>{let nd=c.distanceToSquared(s);if(nd<d){d=nd;nearest=j}});
    let b=buckets[nearest];v.forEach((a,j)=>{b.p.push(...a);b.n.push(norm.getX(i+j),norm.getY(i+j),norm.getZ(i+j))});
    for(let j=0;j<3;j++){let a=v[j],z=v[(j+1)%3],ka=vertexKey(a),kb=vertexKey(z),k=ka<kb?ka+'|'+kb:kb+'|'+ka;if(b.edges.has(k))b.edges.delete(k);else b.edges.set(k,[a,z]);}
   }
  });
  buckets.forEach((b,i)=>{
   if(!b.p.length)return;
   let centroid=new THREE.Vector3();for(let j=0;j<b.p.length;j+=3)centroid.add(new THREE.Vector3(b.p[j],b.p[j+1],b.p[j+2]));centroid.multiplyScalar(3/b.p.length);
   
   const geo=new THREE.BufferGeometry();geo.setAttribute('position',new THREE.Float32BufferAttribute(b.p,3));geo.setAttribute('normal',new THREE.Float32BufferAttribute(b.n,3));geo.translate(-centroid.x,-centroid.y,-centroid.z);
   const mesh=new THREE.Group();mesh.add(new THREE.Mesh(geo,sculptureMaterial));
   const boundary=[];b.edges.forEach(([a,z])=>{boundary.push(new THREE.Vector3(...a).sub(centroid),new THREE.Vector3(...z).sub(centroid));});
   if(boundary.length>4){const inner=new THREE.Mesh(new ConvexGeometry(boundary),interiorMaterial);inner.scale.setScalar(.994);mesh.add(inner);}
   mesh.position.copy(centroid);sculpture.add(mesh);
   const dir=centroid.clone();dir.x*=1.7;dir.y*=1.1;dir.z=.3+Math.abs(dir.z)*.5;dir.normalize();
   pieces.push({mesh,center:centroid,dir,spin:new THREE.Vector3(Math.sin(i*3.1)*.8,Math.cos(i*2.3)*.8,Math.sin(i*1.8)*.55),delay:(i%3)*.014});
  });
 }catch(err){console.error('Portrait could not be loaded',err);throw err;}
 $('.scene-loading').style.opacity='0';setTimeout(()=>$('.scene-loading').remove(),600);
 let width=innerWidth,height=innerHeight;
 const resize=()=>{width=innerWidth;height=innerHeight;camera.aspect=width/height;camera.updateProjectionMatrix();renderer.setSize(width,height);syncScroll()};addEventListener('resize',resize);
 const raycaster=new THREE.Raycaster();let pointerStart={x:0,y:0};
 renderer.domElement.addEventListener('pointerdown',e=>{pointerStart={x:e.clientX,y:e.clientY}});
 renderer.domElement.addEventListener('pointerup',e=>{if(progress<.2||progress>.39||Math.hypot(e.clientX-pointerStart.x,e.clientY-pointerStart.y)>8)return;raycaster.setFromCamera(new THREE.Vector2(e.clientX/width*2-1,-e.clientY/height*2+1),camera);if(raycaster.intersectObjects(panelMeshes).length)openDialog(workDialog)});
 let last=performance.now();
 function render(now){
  const dt=Math.min((now-last)/1000,.05);last=now;
  progress+= (targetProgress-progress)*(reducedMotion?1:1-Math.exp(-dt*9));
  focusPointer.x+=(pointer.x-focusPointer.x)*.035;focusPointer.y+=(pointer.y-focusPointer.y)*.035;
  const p=progress,mobile=width<700;const velocity=reducedMotion?0:Math.min(Math.abs(targetProgress-progress)*20,1);const time=reducedMotion?0:now*.0003;
  updateCopy(p);
  const responsiveScale=mobile?.69:1;
  const turn=smooth(.025,.38,p);
  triangle.visible=p<.445;
  triangle.scale.setScalar(responsiveScale*(1.13-smooth(.14,.37,p)*.12));
  triangle.position.set(0,.05+smooth(.345,.445,p)*5.5,0);
  triangle.rotation.set(.12+Math.sin(turn*Math.PI)*.15,turn*Math.PI*2.0-.20+(reducedMotion?0:focusPointer.x*.045),.04+Math.sin(turn*Math.PI*1.7)*.11);
  // Hero begins almost black; the studio highlights reveal the solid object.
  metal.color.setScalar(.15+smooth(.035,.15,p)*.42);
  metal.envMapIntensity=.35+smooth(.035,.16,p)*1.05;
  edges.material.opacity=.1+smooth(.045,.15,p)*.09;
  gallery.visible=p>.105&&p<.48;
  gallery.position.y=-5.8+smooth(.105,.235,p)*5.8+smooth(.335,.465,p)*6.4;
  gallery.rotation.z=-.04+smooth(.15,.38,p)*.06;
  gallery.rotation.y=(p-.27)*.8+(reducedMotion?0:focusPointer.x*.1);
  raycaster.setFromCamera(new THREE.Vector2(pointer.x,-pointer.y),camera);
  const hovered=gallery.visible?raycaster.intersectObjects(panelMeshes)[0]?.object:null;
  gallery.children.forEach((panel,i)=>{
   panel.position.z=-2.6+(i-2)**2*.25+Math.sin(p*12+i)*.24;
   panel.rotation.x=reducedMotion?0:focusPointer.y*.045;
   const desired=hovered===panelMeshes[i]?1.08:1;panel.scale.lerp(new THREE.Vector3(desired,desired,desired),reducedMotion?1:.1);
  });
  gallery.scale.setScalar(mobile?.73:1);
  const reveal=smooth(.385,.485,p), exit=smooth(.845,.96,p);
  sculpture.visible=p>.38&&p<.97;
  sculpture.scale.setScalar((mobile?.78:1.04)*(1+smooth(.57,.83,p)*.08));
  sculpture.position.set(0,-5.5*(1-reveal)+exit*.6,0);
  sculpture.rotation.y=-.22+smooth(.44,.64,p)*.38+(reducedMotion?0:focusPointer.x*.12);
  sculpture.rotation.z=.035;
  pieces.forEach(piece=>{
   let amount=smooth(.575+piece.delay,.83+piece.delay,p);
   const spread=amount*3.35+exit*7;
   piece.mesh.position.copy(piece.center).addScaledVector(piece.dir,spread);
   piece.mesh.rotation.set(piece.spin.x*amount,piece.spin.y*amount,piece.spin.z*amount);
  });
  debris.visible=p>.55&&p<.96;
  const dust=smooth(.55,.78,p)*(1-smooth(.89,.98,p));
  for(let i=0;i<150;i++){
   const a=i*2.39996+p*3, radius=(1.8+(i%13)*.22)*(1+exit*2);
   dummy.position.set(Math.cos(a)*radius,Math.sin(a)*(1.5+(i%7)*.31),Math.sin(i*1.7)*2-1);
   dummy.rotation.set(a,i*.7+p*5,i+p*2);dummy.scale.setScalar(dust*(.3+(i%5)*.32));dummy.updateMatrix();shards.setMatrixAt(i,dummy.matrix);
  }shards.instanceMatrix.needsUpdate=true;
  finale.visible=p>.86;const finalReveal=smooth(.86,.98,p);
  finale.scale.setScalar(finalReveal*(mobile?.8:1.35));finale.position.z=-2;
  finale.rotation.set(focusPointer.y*.08,time*.28+ p*2,focusPointer.x*.08);
  core.rotation.set(time*.25,p*4+time*.4,.3);core.scale.setScalar(1+velocity*.1);
  key.position.x=-4+focusPointer.x*2+Math.sin(p*9)*2;
  accent.intensity=4+smooth(.45,.7,p)*10;
  camera.position.z=9-velocity*.32;
  renderer.domElement.style.cursor=gallery.visible&&p>.22&&p<.36?'pointer':'';
  camera.position.x=reducedMotion?0:focusPointer.x*.12;camera.position.y=reducedMotion?0:-focusPointer.y*.025;camera.lookAt(0,0,0);
  renderer.render(scene,camera);
  animationId=requestAnimationFrame(render);
 }
 syncScroll();progress=targetProgress;animationId=requestAnimationFrame(render);
 document.addEventListener('visibilitychange',()=>{if(document.hidden){cancelAnimationFrame(animationId)}else{last=performance.now();animationId=requestAnimationFrame(render)}});
}
start().catch(error=>{console.error(error);document.body.classList.add('scene-unavailable');updateCopy(0)});
