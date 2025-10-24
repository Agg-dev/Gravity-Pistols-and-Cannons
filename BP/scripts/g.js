/*
==================================
Minified code that actually runs
==================================
import{world,system,ItemStack}from'@minecraft/server';
import{ModalFormData}from'@minecraft/server-ui';
const M=new Map(),Z=new Map(),
J=new Map(),B=/[^:_]+$/,RXS=/^\w/,
R=/^agg:(gravity_cannon|gravity_pistol|omega_gravity_shotgun)$/,
F=new ItemStack('minecraft:air',1),
W=new ItemStack('agg:gravity_gun_degraded',1),
C=(i,Y)=>{
if(M.has(i)){system.clearRun(M.get(i));M.delete(i);}
if(Z.has(i)){system.clearRun(Z.get(i));Z.delete(i);}J.delete(Y);},
Raycast=(d,i,m,vx,vy,vz,x,y,z)=>{
const r=[],s=new Set();
for(var D=1,E;D<=m;D++){
const L=d.getEntities({maxDistance:1.5+(m*.1),location:{
x:x+(vx*D),y:y+(vy*D),z:z+(vz*D)}
});
for(const l of L){
if((E=l.id)===i||s.has(E))continue;
s.add(E);r.push(l);
}
}
return r;
},cFB={checkForBlocks:!0},SUB=world.afterEvents.playerSpawn.subscribe(e=>{
if(AC)return;e.player.sendMessage(
`Howdy, Stranger!
Here's how to use Gravity guns:
- Works on entities and players (blocks aren’t supported yet)
- Hold right click (or long press on mobile) to pull or hold/grab targets
- Hold sneak + right click (or long press) to push/throw targets away
- Guns discharge with use - recharge with Energy Cells!
- Restore a degraded Gravity Gun using Energy Cells
- Optimized for low-end devices - no FPS worries!
- Use '/scriptevent agg:ggun e' to customise energy
- Use '/scriptevent agg:ggun r' to customise range`);
AC=!0;world.setDynamicProperty('agg:ggunn',AC);
world.afterEvents.playerSpawn.unsubscribe(SUB);
});
var $I=new Uint16Array(world.getDynamicProperty('agg:gguni')?.split('_').map(x=>+x)??[400,800,1600]),
$R=new Uint8Array(world.getDynamicProperty('agg:ggunr')?.split('_').map(x=>+x)??[12,18,24]),
AC=world.getDynamicProperty('agg:ggunn');
world.beforeEvents.playerLeave.subscribe(e=>C(e.player.id));
world.afterEvents.playerLeave.subscribe(e=>C(e.playerId));
world.afterEvents.entityDie.subscribe(e=>{
const{typeId,id}=e.deadEntity;
if(typeId==='minecraft:player')C(id);
});
world.afterEvents.itemUse.subscribe(e=>{
const p=e.source;
var E=p.getComponent('equippable'),
o=E.getEquipment('Offhand'),
m=E.getEquipment('Mainhand'),
y=m?.typeId,I;
if(o?.typeId!=='agg:gravity_cell'||!R.test(y))return;
const t=p.id+y,U=J.get(t)??null,A=U+100;
switch(y){
case'agg:gravity_cannon':I=$I[1];break;
case'agg:omega_gravity_shotgun':I=$I[2];break;
case'agg:gravity_pistol':I=$I[0];break;
}
if(!U){p.sendMessage(`Energy of Gravity ${y.match(B)[0].replace(RXS,c=>c.toUpperCase())} is full`);return;}
if(o.amount>1)o.amount-=1;
else o=F;
E.setEquipment('Offhand',o);
A<I?J.set(t,A):J.delete(t);
p.playSound('random.anvil_use');
p.onScreenDisplay.setActionBar(((Math.min(A,I)/I)*100).toFixed(2)+'% \uF300');
});
world.afterEvents.entityHitBlock.subscribe(e=>{
const p=e.damagingEntity;
var E=p.getComponent('equippable'),
o=E.getEquipment('Offhand'),
m=E.getEquipment('Mainhand'),
y=m?.typeId,I;
if(o?.typeId!=='agg:gravity_cell'||!R.test(y))return;
const t=p.id+y,U=J.get(t)??null,A=U+100;
switch(y){
case'agg:gravity_cannon':I=$I[1];break;
case'agg:omega_gravity_shotgun':I=$I[2];break;
case'agg:gravity_pistol':I=$I[0];break;
}
if(!U){p.sendMessage(`Energy of Gravity ${y.match(B)[0].replace(RXS,c=>c.toUpperCase())} is full`);return;}
if(o.amount>1)o.amount-=1;
else o=F;
E.setEquipment('Offhand',o);
A<I?J.set(t,A):J.delete(t);
p.playSound('random.anvil_use');
p.onScreenDisplay.setActionBar(((Math.min(A,I)/I)*100).toFixed(2)+'% \uF300');
},{entityTypes:["minecraft:player"]});
world.afterEvents.itemStopUse.subscribe(e=>{const j=e.source,i=j.id,g=M.get(i),u=Z.get(i),t=e.itemStack.typeId;if((t!=='agg:gravity_pistol'&&t!=='agg:gravity_cannon'&&t!=='agg:omega_gravity_shotgun')||typeof g!=='number')return;system.clearRun(g);M.delete(i);if(typeof u==='number'){system.clearRun(u);Z.delete(i);}});
world.afterEvents.itemStartUse.subscribe(e=>{
const s=e.source,{dimension:d,id:i}=s,t=e.itemStack.typeId,Y=i+t;
if(!R.test(t)||s.typeId!=='minecraft:player')return;
d.playSound('agg.ggun',s.location,{volume:1,pitch:t==='agg:gravity_cannon'?1:1.2});
Z.set(i,system.runInterval(()=>{
if(!R.test(s.getComponent('equippable')?.getEquipment('Mainhand')?.typeId)){
system.clearRun(Z.get(i));
Z.delete(i);
return;}
s.playAnimation('animation.agg.ggun.shake');
},4));
var I,G,c,k;
switch(t){
case'agg:omega_gravity_shotgun':
c=$R[2];k=3.4;I=$I[2];break;
case'agg:gravity_cannon':
c=$R[1];k=2.1;I=$I[1];break;
case'agg:gravity_pistol':
c=$R[0];k=1.2;I=$I[0];break;
}
const h=c*.6,b=h-.01,
S=t!=='agg:omega_gravity_shotgun';
M.set(i,system.runInterval(()=>{
const L=s.getComponent('equippable'),$=L.getEquipment('Mainhand');
if(!R.test($?.typeId)||!s.isValid()){system.clearRun(M.get(i));M.delete(i);J.delete(Y);return;}
var{x:qx,y:qy,z:qz}=s.location,
{x,y,z}=s.getViewDirection(),ISF=1;
const px=qx+(x*b),py=qy+(y*b),pz=qz+(z*b),a=s.isSneaking,j=a?k*1.5:-k,P=j*.5,
o=Raycast(d,i,c,x,y,z,qx,qy,qz),
N=J.get(Y)??I,SP=S?'agg:ggun':'agg:ggun2';
if(N<1){s.playSound('random.break');L.setEquipment('Mainhand',W);system.run(()=>C(i,Y));return;}
s.onScreenDisplay.setActionBar(`§${N<=50?'c':N<=100?'g':'b'}${((N/I)*100).toFixed(2)}%§f\uF300§r`);
if(!o.length)return;
for(const v of o){
if(v.id===i||(G=v.getGameMode?.())==='creative'||G==='spectator')continue;
J.set(Y,N-1);
const vl=v.location;
if(!a&&Math.max(Math.abs(qx-vl.x),Math.abs(qz-vl.z))<h){
if(!v.tryTeleport({x:px-.1,y:py-.1,z:pz-.1},cFB)){
const MM=-P*.25;
try{v.applyImpulse({x:x*MM,
y:y*MM,z:z*MM});}catch(_){
const JJ=-j*.25;
v.applyKnockback(x,z,JJ,y*JJ);}
}}
else try{v.applyImpulse({x:x*P,
y:y*P,z:z*P});}catch(_){v.applyKnockback(x,z,j,y*j);}
if(ISF)d.spawnParticle(SP,vl);
ISF=null;
}
},2));
});
system.afterEvents.scriptEventReceive.subscribe(e=>{
if(e.id!=='agg:ggun')return;
const s=e.sourceEntity;
switch(e.message.trim()[0]){
case'e':new ModalFormData()
.title('Customise Energy levels')
.textField('Gravity Pistol','How much?',String($I[0]))
.textField('Gravity Cannon','How much?',String($I[1]))
.textField('Omega Gravity Shotgun','How much?',String($I[2]))
.show(s).then(r=>{if(r.canceled)return;$I=new Uint16Array(r.formValues.map((x,xi)=>{
if(!(x=+x)){s.sendMessage('Error, use integers/numbers. Set value to '+$I[xi]);return $I[xi];}
return Math.max(1,Math.min(x,65534));
}));world.setDynamicProperty('agg:gguni',$I.join('_'));});
break;
case'r':new ModalFormData()
.title('Customise Range')
.textField('Gravity Pistol','How much?',String($R[0]))
.textField('Gravity Cannon','How much?',String($R[1]))
.textField('Omega Gravity Shotgun','How much?',String($R[2]))
.show(s).then(r=>{if(r.canceled)return;$R=new Uint8Array(r.formValues.map((x,xi)=>{
if(!(x=+x)||x<2||x>99){s.sendMessage('Error, use integers/numbers in range [2,254]. Set value to '+$I[xi]);return $I[xi];}
return Math.max(2,Math.min(x,254));
}));world.setDynamicProperty('agg:ggunr',$R.join('_'));});
break;
}
});
==================================
Debugging code*/
import { world, system, ItemStack } from '@minecraft/server';
import { ModalFormData } from '@minecraft/server-ui';

// Timer and state tracking
const useTmr = new Map();
const animTmr = new Map();
const energy = new Map();

// Regex patterns
const nameRx = /[^:_]+$/;
const wordRx = /^\w/;
const validRx = /^agg:(gravity_cannon|gravity_pistol|omega_gravity_shotgun)$/;

// Item constants
const airItem = new ItemStack('minecraft:air', 1);
const degraded = new ItemStack('agg:gravity_gun_degraded', 1);

const cleanup = (pid, ekey) => {
  if (useTmr.has(pid)) {
    system.clearRun(useTmr.get(pid));
    useTmr.delete(pid);
  }
  if (animTmr.has(pid)) {
    system.clearRun(animTmr.get(pid));
    animTmr.delete(pid);
  }
  energy.delete(ekey);
};

// Entity detection in beam path
const raycast = (dim, shootId, maxDist, dx, dy, dz, sx, sy, sz) => {
  const hits = [];
  const seen = new Set();
  
  for (let d = 1; d <= maxDist; d++) {
    const ents = dim.getEntities({
      maxDistance: 1.5 + (maxDist * 0.1),
      location: { x: sx + (dx * d), y: sy + (dy * d), z: sz + (dz * d) }
    });
    
    for (const e of ents) {
      const eid = e.id;
      if (eid === shootId || seen.has(eid)) continue;
      seen.add(eid);
      hits.push(e);
    }
  }
  
  return hits;
};

const blockChk = { checkForBlocks: true };

// Welcome message on first spawn
const spawnSub = world.afterEvents.playerSpawn.subscribe(e => {
  if (welcomed) return;
  
  e.player.sendMessage(
    `Howdy, Stranger!
Here's how to use Gravity guns:
- Works on entities and players (blocks aren't supported yet)
- Hold right click (or long press on mobile) to pull or hold/grab targets
- Hold sneak + right click (or long press) to push/throw targets away
- Guns discharge with use - recharge with Energy Cells!
- Restore a degraded Gravity Gun using Energy Cells
- Optimized for low-end devices - no FPS worries!
- Use '/scriptevent agg:ggun e' to customise energy
- Use '/scriptevent agg:ggun r' to customise range`
  );
  
  welcomed = true;
  world.setDynamicProperty('agg:ggunn', welcomed);
  world.afterEvents.playerSpawn.unsubscribe(spawnSub);
});

// Load configs
let maxNrg = new Uint16Array(world.getDynamicProperty('agg:gguni')?.split('_').map(x => +x) ?? [400, 800, 1600]);
let ranges = new Uint8Array(world.getDynamicProperty('agg:ggunr')?.split('_').map(x => +x) ?? [12, 18, 24]);
let welcomed = world.getDynamicProperty('agg:ggunn');

// Player cleanup events
world.beforeEvents.playerLeave.subscribe(e => cleanup(e.player.id));
world.afterEvents.playerLeave.subscribe(e => cleanup(e.playerId));
world.afterEvents.entityDie.subscribe(e => {
  const { typeId, id } = e.deadEntity;
  if (typeId === 'minecraft:player') cleanup(id);
});

// Recharge with energy cell (item use)
world.afterEvents.itemUse.subscribe(e => {
  const p = e.source;
  const eq = p.getComponent('equippable');
  let off = eq.getEquipment('Offhand');
  const main = eq.getEquipment('Mainhand');
  const wtype = main?.typeId;
  
  if (off?.typeId !== 'agg:gravity_cell' || !validRx.test(wtype)) return;
  
  const ekey = p.id + wtype;
  const curr = energy.get(ekey) ?? null;
  const rechg = curr + 100;
  let max;
  
  switch (wtype) {
    case 'agg:gravity_cannon': max = maxNrg[1]; break;
    case 'agg:omega_gravity_shotgun': max = maxNrg[2]; break;
    case 'agg:gravity_pistol': max = maxNrg[0]; break;
  }
  
  if (!curr) {
    p.sendMessage(`Energy of Gravity ${wtype.match(nameRx)[0].replace(wordRx, c => c.toUpperCase())} is full`);
    return;
  }
  
  if (off.amount > 1) off.amount -= 1;
  else off = airItem;
  eq.setEquipment('Offhand', off);
  
  rechg < max ? energy.set(ekey, rechg) : energy.delete(ekey);
  
  p.playSound('random.anvil_use');
  p.onScreenDisplay.setActionBar(((Math.min(rechg, max) / max) * 100).toFixed(2) + '% \uF300');
});

// Recharge with energy cell (hit block)
world.afterEvents.entityHitBlock.subscribe(e => {
  const p = e.damagingEntity;
  const eq = p.getComponent('equippable');
  let off = eq.getEquipment('Offhand');
  const main = eq.getEquipment('Mainhand');
  const wtype = main?.typeId;
  
  if (off?.typeId !== 'agg:gravity_cell' || !validRx.test(wtype)) return;
  
  const ekey = p.id + wtype;
  const curr = energy.get(ekey) ?? null;
  const rechg = curr + 100;
  let max;
  
  switch (wtype) {
    case 'agg:gravity_cannon': max = maxNrg[1]; break;
    case 'agg:omega_gravity_shotgun': max = maxNrg[2]; break;
    case 'agg:gravity_pistol': max = maxNrg[0]; break;
  }
  
  if (!curr) {
    p.sendMessage(`Energy of Gravity ${wtype.match(nameRx)[0].replace(wordRx, c => c.toUpperCase())} is full`);
    return;
  }
  
  if (off.amount > 1) off.amount -= 1;
  else off = airItem;
  eq.setEquipment('Offhand', off);
  
  rechg < max ? energy.set(ekey, rechg) : energy.delete(ekey);
  
  p.playSound('random.anvil_use');
  p.onScreenDisplay.setActionBar(((Math.min(rechg, max) / max) * 100).toFixed(2) + '% \uF300');
}, { entityTypes: ["minecraft:player"] });

// Stop gun usage
world.afterEvents.itemStopUse.subscribe(e => {
  const p = e.source;
  const pid = p.id;
  const ut = useTmr.get(pid);
  const at = animTmr.get(pid);
  const wtype = e.itemStack.typeId;
  
  if ((wtype !== 'agg:gravity_pistol' && wtype !== 'agg:gravity_cannon' && wtype !== 'agg:omega_gravity_shotgun') || typeof ut !== 'number') return;
  
  system.clearRun(ut);
  useTmr.delete(pid);
  
  if (typeof at === 'number') {
    system.clearRun(at);
    animTmr.delete(pid);
  }
});

// Start gun usage
world.afterEvents.itemStartUse.subscribe(e => {
  const p = e.source;
  const { dimension: dim, id: pid } = p;
  const wtype = e.itemStack.typeId;
  const ekey = pid + wtype;
  
  if (!validRx.test(wtype) || p.typeId !== 'minecraft:player') return;
  
  dim.playSound('agg.ggun', p.location, { volume: 1, pitch: wtype === 'agg:gravity_cannon' ? 1 : 1.2 });
  
  animTmr.set(pid, system.runInterval(() => {
    if (!validRx.test(p.getComponent('equippable')?.getEquipment('Mainhand')?.typeId)) {
      system.clearRun(animTmr.get(pid));
      animTmr.delete(pid);
      return;
    }
    p.playAnimation('animation.agg.ggun.shake');
  }, 4));
  
  let max, rng, pwr;
  
  switch (wtype) {
    case 'agg:omega_gravity_shotgun':
      rng = ranges[2];
      pwr = 3.4;
      max = maxNrg[2];
      break;
    case 'agg:gravity_cannon':
      rng = ranges[1];
      pwr = 2.1;
      max = maxNrg[1];
      break;
    case 'agg:gravity_pistol':
      rng = ranges[0];
      pwr = 1.2;
      max = maxNrg[0];
      break;
  }
  
  const holdDist = rng * 0.6;
  const targDist = holdDist - 0.01;
  const useImp = wtype !== 'agg:omega_gravity_shotgun';
  
  useTmr.set(pid, system.runInterval(() => {
    const eq = p.getComponent('equippable');
    const held = eq.getEquipment('Mainhand');
    
    if (!validRx.test(held?.typeId) || !p.isValid()) {
      system.clearRun(useTmr.get(pid));
      useTmr.delete(pid);
      energy.delete(ekey);
      return;
    }
    
    const { x: px, y: py, z: pz } = p.location;
    const { x: dx, y: dy, z: dz } = p.getViewDirection();
    
    const tx = px + (dx * targDist);
    const ty = py + (dy * targDist);
    const tz = pz + (dz * targDist);
    
    const sneak = p.isSneaking;
    const fdir = sneak ? pwr * 1.5 : -pwr;
    const fimp = fdir * 0.5;
    
    const hits = raycast(dim, pid, rng, dx, dy, dz, px, py, pz);
    const curr = energy.get(ekey) ?? max;
    const ptcl = useImp ? 'agg:ggun' : 'agg:ggun2';
    
    if (curr < 1) {
      p.playSound('random.break');
      eq.setEquipment('Mainhand', degraded);
      system.run(() => cleanup(pid, ekey));
      return;
    }
    
    p.onScreenDisplay.setActionBar(`§${curr <= 50 ? 'c' : curr <= 100 ? 'g' : 'b'}${((curr / max) * 100).toFixed(2)}%§f\uF300§r`);
    
    if (!hits.length) return;
    
    let spawnPtcl = true;
    
    for (const ent of hits) {
      if (ent.id === pid) continue;
      
      const gm = ent.getGameMode?.();
      if (gm === 'creative' || gm === 'spectator') continue;
      
      energy.set(ekey, curr - 1);
      
      const loc = ent.location;
      
      // Hold entity in place
      if (!sneak && Math.max(Math.abs(px - loc.x), Math.abs(pz - loc.z)) < holdDist) {
        if (!ent.tryTeleport({ x: tx - 0.1, y: ty - 0.1, z: tz - 0.1 }, blockChk)) {
          const fb = -fimp * 0.25;
          try {
            ent.applyImpulse({ x: dx * fb, y: dy * fb, z: dz * fb });
          } catch (_) {
            const kb = -fdir * 0.25;
            ent.applyKnockback(dx, dz, kb, dy * kb);
          }
        }
      } else {
        try {
          ent.applyImpulse({ x: dx * fimp, y: dy * fimp, z: dz * fimp });
        } catch (_) {
          ent.applyKnockback(dx, dz, fdir, dy * fdir);
        }
      }
      
      if (spawnPtcl) {
        dim.spawnParticle(ptcl, loc);
        spawnPtcl = false;
      }
    }
  }, 2));
});

// Customization UI
system.afterEvents.scriptEventReceive.subscribe(e => {
  if (e.id !== 'agg:ggun') return;
  
  const p = e.sourceEntity;
  
  switch (e.message.trim()[0]) {
    case 'e':
      new ModalFormData()
        .title('Customise Energy levels')
        .textField('Gravity Pistol', 'How much?', String(maxNrg[0]))
        .textField('Gravity Cannon', 'How much?', String(maxNrg[1]))
        .textField('Omega Gravity Shotgun', 'How much?', String(maxNrg[2]))
        .show(p).then(r => {
          if (r.canceled) return;
          
          maxNrg = new Uint16Array(r.formValues.map((v, i) => {
            const n = +v;
            if (!n) {
              p.sendMessage('Error, use integers/numbers. Set value to ' + maxNrg[i]);
              return maxNrg[i];
            }
            return Math.max(1, Math.min(n, 65534));
          }));
          
          world.setDynamicProperty('agg:gguni', maxNrg.join('_'));
        });
      break;
      
    case 'r':
      new ModalFormData()
        .title('Customise Range')
        .textField('Gravity Pistol', 'How much?', String(ranges[0]))
        .textField('Gravity Cannon', 'How much?', String(ranges[1]))
        .textField('Omega Gravity Shotgun', 'How much?', String(ranges[2]))
        .show(p).then(r => {
          if (r.canceled) return;
          
          ranges = new Uint8Array(r.formValues.map((v, i) => {
            const n = +v;
            if (!n || n < 2 || n > 99) {
              p.sendMessage('Error, use integers/numbers in range [2,254]. Set value to ' + ranges[i]);
              return ranges[i];
            }
            return Math.max(2, Math.min(n, 254));
          }));
          
          world.setDynamicProperty('agg:ggunr', ranges.join('_'));
        });
      break;
  }
});