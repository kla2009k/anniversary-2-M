import { useMemo, useRef, useState } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import { useTexture } from '@react-three/drei'
import * as THREE from 'three'
import { ITEMS } from '../content'
import { ItemModel } from './ItemModels'

const positions = {
  bracelet:[-0.82,0.74,0.52], pen:[0.75,0.43,-0.22], book:[-0.54,0.40,-0.33], dates:[0.6,0.28,0.38],
  roti:[0.42,0.82,-0.47], khaomao:[-0.5,0.79,-0.48], redsnack:[1.02,0.58,0.28], berries:[-0.87,0.28,0.34],
  photo:[0,1.03,.02],
  fish:[0,1.2,0], case:[0,1.2,0], ticket:[0,1.2,0], controller:[0,1.2,0], listening:[0,1.2,0],
}

export function BoxWorld({ phase, selected, visited, actioned, zoom, onTape, onOpen, onCutComplete, onSelect, onClear, ending }) {
  const root = useRef()
  const { size } = useThree()
  useFrame((state, delta) => {
    if (!root.current) return
    root.current.position.x = THREE.MathUtils.damp(root.current.position.x, phase === 'intro' && size.width > 760 ? .95 : 0, 3, delta)
    root.current.position.y = THREE.MathUtils.damp(root.current.position.y, phase === 'intro' ? (size.width < 760 ? -1.0 : -.15) : 0, 3, delta)
    root.current.scale.setScalar(THREE.MathUtils.damp(root.current.scale.x, phase === 'intro' && size.width < 760 ? .76 : 1, 3, delta))
    root.current.rotation.y = THREE.MathUtils.damp(root.current.rotation.y, phase === 'intro' ? -0.17 : 0, 3, delta)
    if (phase === 'intro') root.current.position.y += Math.sin(state.clock.elapsedTime * 1.2) * 0.002
  })
  return <group ref={root}>
    <mesh rotation={[-Math.PI/2,0,0]} position={[0,-0.65,0]} receiveShadow><circleGeometry args={[6.5,72]}/><meshStandardMaterial color="#d9d1c2" roughness={0.97}/></mesh>
    <ParcelBox phase={phase} onTape={onTape} onOpen={onOpen} onCutComplete={onCutComplete} muted={!!selected || ending}/>
    {(phase === 'open' || phase === 'ending') && ITEMS.map(item => <Inspectable key={item.id} item={item} home={positions[item.id]}
      selected={selected === item.id} hidden={(!!selected && selected !== item.id)||item.imagined&&selected!==item.id} visited={visited.includes(item.id)}
      locked={item.imagined?!visited.includes('photo'):item.bonus?ITEMS.filter(x=>!x.bonus&&visited.includes(x.id)).length<8:item.layer===1?ITEMS.filter(x=>x.layer===2&&visited.includes(x.id)).length<2:item.layer===0?ITEMS.filter(x=>x.layer===1&&visited.includes(x.id)).length<2:false}
      actioned={actioned.includes(item.id)} zoom={zoom} small={size.width < 760} ending={ending}
      onSelect={() => onSelect(item.id)} onClear={onClear}/>)}
  </group>
}

function Card({light=false}) { const map=useTexture(`${import.meta.env.BASE_URL}textures/cardboard.webp`); map.colorSpace=THREE.SRGBColorSpace; return <meshStandardMaterial map={map} color={light ? '#fff8ed':'#ffffff'} roughness={.96} metalness={0}/>}
function ParcelBox({phase,onTape,onOpen,onCutComplete,muted}) {
  const left=useRef(),right=useRef(),root=useRef(); const [hover,setHover]=useState(false)
  const open=phase==='opening'||phase==='open'||phase==='ending', taped=phase==='intro'||phase==='sealed'||phase==='cutting'
  useFrame((_,dt)=>{
    if(left.current) left.current.rotation.z=THREE.MathUtils.damp(left.current.rotation.z,open?-2.04:0,4.5,dt)
    if(right.current) right.current.rotation.z=THREE.MathUtils.damp(right.current.rotation.z,open?2.04:0,4.5,dt)
    if(root.current) root.current.scale.setScalar(THREE.MathUtils.damp(root.current.scale.x,muted?.88:hover?1.02:1,5,dt))
  })
  const click=e=>{e.stopPropagation();if(phase==='sealed')onTape();else if(phase==='untaped')onOpen()}
  return <group ref={root} onClick={click} onPointerOver={e=>{e.stopPropagation();setHover(true);document.body.style.cursor='pointer'}} onPointerOut={()=>{setHover(false);document.body.style.cursor='default'}}>
    <mesh castShadow receiveShadow position={[0,-.48,0]}><boxGeometry args={[3.25,.16,2.7]}/><Card/></mesh>
    <mesh castShadow receiveShadow position={[0,.07,-1.3]}><boxGeometry args={[3.25,1.14,.13]}/><Card/></mesh>
    <mesh castShadow receiveShadow position={[0,.07,1.3]}><boxGeometry args={[3.25,1.14,.13]}/><Card/></mesh>
    {[-.35,-.08,.19,.45].map(y=><mesh key={y} position={[0,y,1.37]}><boxGeometry args={[3.2,.006,.003]}/><meshStandardMaterial color="#8d633f" transparent opacity={.18}/></mesh>)}
    <mesh castShadow receiveShadow position={[-1.56,.07,0]}><boxGeometry args={[.13,1.14,2.62]}/><Card/></mesh>
    <mesh castShadow receiveShadow position={[1.56,.07,0]}><boxGeometry args={[.13,1.14,2.62]}/><Card/></mesh>
    <group ref={left} position={[-1.6,.66,0]}><mesh castShadow position={[.8,0,0]}><boxGeometry args={[1.6,.075,2.7]}/><Card light={hover}/></mesh></group>
    <group ref={right} position={[1.6,.66,0]}><mesh castShadow position={[-.8,0,0]}><boxGeometry args={[1.6,.075,2.7]}/><Card light={hover}/></mesh></group>
    {!open&&<>
      <mesh rotation={[-Math.PI/2,0,0]} position={[0,.713,0]}><planeGeometry args={[1.55,.9]}/><meshStandardMaterial color="#f2eddf" roughness={.9}/></mesh>
      <mesh rotation={[-Math.PI/2,0,0]} position={[-.3,.72,-.18]}><planeGeometry args={[.6,.035]}/><meshStandardMaterial color="#8d8a84"/></mesh>
      <mesh rotation={[-Math.PI/2,0,0]} position={[.21,.72,-.31]}><planeGeometry args={[.32,.035]}/><meshStandardMaterial color="#b07968"/></mesh>
      {taped&&<><mesh rotation={[-Math.PI/2,0,0]} position={[0,.745,0]}><planeGeometry args={[.23,2.72]}/><meshStandardMaterial color="#d5b17a" transparent opacity={.88}/></mesh>
      <mesh rotation={[-Math.PI/2,0,0]} position={[0,.75,0]}><planeGeometry args={[2.9,.16]}/><meshStandardMaterial color="#d5b17a" transparent opacity={.75}/></mesh></>}
    </>}
    {phase==='cutting'&&<CutterCutscene onDone={onCutComplete}/>}
  </group>
}

function CutterCutscene({onDone}) {
  const knife=useRef(),cut=useRef(),started=useRef(null),finished=useRef(false)
  useFrame((state)=>{
    if(started.current===null)started.current=state.clock.elapsedTime
    const p=THREE.MathUtils.clamp((state.clock.elapsedTime-started.current)/2.05,0,1)
    const travel=THREE.MathUtils.smoothstep(p,.03,.95)
    if(knife.current){knife.current.position.z=-1.52+3.05*travel;knife.current.position.y=.84+Math.sin(p*Math.PI)*.04;knife.current.rotation.y=.55+Math.sin(p*19)*.025;knife.current.scale.setScalar(1.28*(p>.91?Math.max(.001,1-(p-.91)/.09):1))}
    if(cut.current){cut.current.scale.y=Math.max(.001,travel);cut.current.position.z=-1.35+1.35*travel}
    if(p===1&&!finished.current){finished.current=true;onDone()}
  })
  return <>
    <mesh ref={cut} rotation={[-Math.PI/2,0,0]} position={[0,.755,-1.34]}><planeGeometry args={[.026,2.7]}/><meshStandardMaterial color="#80603e" transparent opacity={.75}/></mesh>
    <group ref={knife} position={[.16,.86,-1.52]} rotation={[-.25,.55,-.12]}>
      <mesh castShadow position={[0,.12,.25]}><boxGeometry args={[.15,.12,.64]}/><meshStandardMaterial color="#d9a337" metalness={.18} roughness={.48}/></mesh>
      <mesh position={[0,.19,.19]}><boxGeometry args={[.16,.025,.42]}/><meshStandardMaterial color="#39404a" metalness={.38} roughness={.3}/></mesh>
      {Array.from({length:7},(_,i)=><mesh key={i} position={[0,.202,.02+i*.05]}><boxGeometry args={[.13,.005,.009]}/><meshStandardMaterial color="#8a9299" metalness={.8} roughness={.25}/></mesh>)}
      <mesh castShadow position={[0,.05,-.16]} rotation={[Math.PI/2,0,0]}><coneGeometry args={[.065,.27,4]}/><meshStandardMaterial color="#c7cdd0" metalness={.88} roughness={.15}/></mesh>
      <mesh position={[0,.055,-.02]}><boxGeometry args={[.145,.08,.11]}/><meshStandardMaterial color="#373a3d" metalness={.38} roughness={.31}/></mesh>
    </group>
  </>
}

function Inspectable({item,home,selected,hidden,locked,visited,actioned,zoom,small,ending,onSelect,onClear}) {
  const ref=useRef(),drag=useRef(null),rot=useRef({x:0,y:0}),selectedAt=useRef(null),wasSelected=useRef(false),actionAt=useRef(null),wasActioned=useRef(actioned);const [hover,setHover]=useState(false)
  useFrame((state,dt)=>{
    if(!ref.current)return
    if(selected&&!wasSelected.current)selectedAt.current=state.clock.elapsedTime
    wasSelected.current=selected
    if(actioned!==wasActioned.current)actionAt.current=state.clock.elapsedTime
    wasActioned.current=actioned
    const age=selectedAt.current===null?10:state.clock.elapsedTime-selectedAt.current
    const lift=selected&&age<1.4?Math.sin(age*12)*Math.exp(-age*3.8)*.16:0
    const actionAge=actionAt.current===null?10:state.clock.elapsedTime-actionAt.current
    const actionPulse=selected&&actionAge<1.2?Math.sin(actionAge*14)*Math.exp(-actionAge*4)*.12:0
    const p=selected?(small?[0,2.55,1.45]:[-1.55,1.42,1.9]):home
    ref.current.position.x=THREE.MathUtils.damp(ref.current.position.x,p[0],5,dt)
    ref.current.position.y=THREE.MathUtils.damp(ref.current.position.y,p[1]+lift+(!selected?Math.sin(state.clock.elapsedTime*1.4+home[0])*.015:0),5,dt)
    ref.current.position.z=THREE.MathUtils.damp(ref.current.position.z,p[2],5,dt)
    const s=selected ? (small ? 1.3 : 1.85)*zoom : (hidden||ending||locked) ? .001 : hover ? 1.1 : visited ? .94 : 1
    ref.current.scale.setScalar(THREE.MathUtils.damp(ref.current.scale.x,s*(1+actionPulse),6,dt))
    ref.current.rotation.x=THREE.MathUtils.damp(ref.current.rotation.x,selected?rot.current.x:0,7,dt)
    ref.current.rotation.y=THREE.MathUtils.damp(ref.current.rotation.y,selected?rot.current.y+actionPulse*.7:0,7,dt)
  })
  const down=e=>{e.stopPropagation();if(locked)return;if(!selected){onSelect();return}drag.current={x:e.clientX,y:e.clientY,rx:rot.current.x,ry:rot.current.y};e.target.setPointerCapture?.(e.pointerId)}
  const move=e=>{if(!drag.current)return;rot.current.y=drag.current.ry+(e.clientX-drag.current.x)*.012;rot.current.x=THREE.MathUtils.clamp(drag.current.rx+(e.clientY-drag.current.y)*.01,-1.1,1.1)}
  const up=e=>{drag.current=null;e.target.releasePointerCapture?.(e.pointerId)}
  return <group ref={ref} position={home} onPointerDown={down} onPointerMove={move} onPointerUp={up}
    onClick={e=>{e.stopPropagation();if(!selected)onSelect()}} onDoubleClick={e=>{e.stopPropagation();if(selected)onClear()}}
    onPointerOver={e=>{e.stopPropagation();setHover(true);document.body.style.cursor=selected?'grab':'pointer'}} onPointerOut={()=>{setHover(false);document.body.style.cursor='default'}}>
    <ItemModel id={item.id} actioned={actioned}/>
    {hover&&!selected&&<mesh rotation={[-Math.PI/2,0,0]} position={[0,-.45,0]}><ringGeometry args={[.44,.5,40]}/><meshBasicMaterial color="#fff1ca" side={THREE.DoubleSide}/></mesh>}
  </group>
}
