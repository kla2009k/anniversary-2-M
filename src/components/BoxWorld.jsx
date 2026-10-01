import { useMemo, useRef, useState } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import { RoundedBox } from '@react-three/drei'
import * as THREE from 'three'
import { ITEMS } from '../content'

const positions = {
  bracelet:[-0.82,0.74,0.52], pen:[0.75,0.43,-0.22], book:[-0.54,0.40,-0.33], dates:[0.6,0.28,0.38],
  roti:[0.42,0.82,-0.47], khaomao:[-0.5,0.79,-0.48], redsnack:[1.02,0.58,0.28], berries:[-0.87,0.28,0.34],
}

export function BoxWorld({ phase, selected, visited, actioned, zoom, onTape, onOpen, onSelect, onClear, ending }) {
  const root = useRef()
  const { size } = useThree()
  useFrame((state, delta) => {
    if (!root.current) return
    root.current.position.y = THREE.MathUtils.damp(root.current.position.y, phase === 'intro' ? -0.15 : 0, 3, delta)
    root.current.rotation.y = THREE.MathUtils.damp(root.current.rotation.y, phase === 'intro' ? -0.17 : 0, 3, delta)
    if (phase === 'intro') root.current.position.y += Math.sin(state.clock.elapsedTime * 1.2) * 0.002
  })
  return <group ref={root}>
    <mesh rotation={[-Math.PI/2,0,0]} position={[0,-0.65,0]} receiveShadow><circleGeometry args={[6.5,72]}/><meshStandardMaterial color="#d9d1c2" roughness={0.97}/></mesh>
    <ParcelBox phase={phase} onTape={onTape} onOpen={onOpen} muted={!!selected || ending}/>
    {(phase === 'open' || phase === 'ending') && ITEMS.map(item => <Inspectable key={item.id} item={item} home={positions[item.id]}
      selected={selected === item.id} hidden={!!selected && selected !== item.id} visited={visited.includes(item.id)}
      locked={item.layer===1?ITEMS.filter(x=>x.layer===2&&visited.includes(x.id)).length<2:item.layer===0?ITEMS.filter(x=>x.layer===1&&visited.includes(x.id)).length<2:false}
      actioned={actioned.includes(item.id)} zoom={zoom} small={size.width < 760} ending={ending}
      onSelect={() => onSelect(item.id)} onClear={onClear}/>)}
  </group>
}

function Card({light=false}) { return <meshStandardMaterial color={light ? '#cba46d':'#b48956'} roughness={0.94}/>} 
function ParcelBox({phase,onTape,onOpen,muted}) {
  const left=useRef(),right=useRef(),root=useRef(); const [hover,setHover]=useState(false)
  const open=phase==='open'||phase==='ending', taped=phase==='intro'||phase==='sealed'
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
  </group>
}

function Inspectable({item,home,selected,hidden,locked,visited,actioned,zoom,small,ending,onSelect,onClear}) {
  const ref=useRef(),drag=useRef(null),rot=useRef({x:0,y:0});const [hover,setHover]=useState(false)
  useFrame((state,dt)=>{
    if(!ref.current)return
    const p=selected?(small?[0,2.4,1.45]:[-1.55,1.42,1.9]):home
    ref.current.position.x=THREE.MathUtils.damp(ref.current.position.x,p[0],5,dt)
    ref.current.position.y=THREE.MathUtils.damp(ref.current.position.y,p[1]+(!selected?Math.sin(state.clock.elapsedTime*1.4+home[0])*.015:0),5,dt)
    ref.current.position.z=THREE.MathUtils.damp(ref.current.position.z,p[2],5,dt)
    const s=selected ? 1.85*zoom : (hidden||ending||locked) ? .001 : hover ? 1.1 : visited ? .94 : 1
    ref.current.scale.setScalar(THREE.MathUtils.damp(ref.current.scale.x,s,6,dt))
    ref.current.rotation.x=THREE.MathUtils.damp(ref.current.rotation.x,selected?rot.current.x:0,7,dt)
    ref.current.rotation.y=THREE.MathUtils.damp(ref.current.rotation.y,selected?rot.current.y:0,7,dt)
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

function ItemModel({id,actioned}) {
  if(id==='bracelet')return <group rotation={[.15,.3,0]}><mesh rotation={[Math.PI/2,0,0]}><torusGeometry args={[.37,.035,10,48]}/><meshStandardMaterial color="#3b302b"/></mesh>{Array.from({length:14},(_,i)=>{const a=i/14*Math.PI*2;return <mesh key={i} position={[Math.cos(a)*.37,Math.sin(a)*.37,0]}><sphereGeometry args={[.07,12,10]}/><meshStandardMaterial color={i===0?'#b99555':'#171a1b'} roughness={.28}/></mesh>})}<mesh position={[0,-.39,.04]}><sphereGeometry args={[.11,16,12]}/><meshStandardMaterial color="#b99352" metalness={.4} roughness={.35}/></mesh></group>
  if(id==='pen')return <group rotation={[0,.2,-.14]}><RoundedBox args={[.9,.25,.42]} radius={.08} smoothness={3} castShadow><meshStandardMaterial color="#a3443f" roughness={.75}/></RoundedBox><mesh position={[0,.135,0]}><boxGeometry args={[.75,.018,.03]}/><meshStandardMaterial color="#d9ba85" metalness={.5}/></mesh>{actioned&&<mesh position={[.1,.32,.03]} rotation={[0,0,-.2]}><cylinderGeometry args={[.018,.018,.5,10]}/><meshStandardMaterial color="#332b2b"/></mesh>}</group>
  if(id==='book')return <group rotation={[.08,-.2,.1]}><RoundedBox args={[.72,.93,.11]} radius={.02} smoothness={2} castShadow><meshStandardMaterial color="#35536b" roughness={.86}/></RoundedBox><mesh position={[0,.08,.065]}><circleGeometry args={[.22,32]}/><meshStandardMaterial color="#e4c490"/></mesh><mesh position={[0,-.22,.065]}><boxGeometry args={[.44,.025,.01]}/><meshStandardMaterial color="#e5dcc4"/></mesh>{actioned&&<mesh position={[.48,0,-.01]} rotation={[0,-.8,0]}><boxGeometry args={[.7,.9,.015]}/><meshStandardMaterial color="#eee3cf" side={THREE.DoubleSide}/></mesh>}</group>
  if(id==='dates')return <group rotation={[0,.25,.03]}><RoundedBox args={[.98,.54,.35]} radius={.025} smoothness={2} castShadow><meshStandardMaterial color="#a85b29"/></RoundedBox><mesh position={[0,.12,.185]}><boxGeometry args={[.82,.16,.01]}/><meshStandardMaterial color="#ed9b44"/></mesh>{[-.25,0,.25].map((x,i)=><mesh key={i} position={[x,-.09,.19]} scale={[.11,.17,.04]}><sphereGeometry args={[1,16,12]}/><meshStandardMaterial color="#4a2116" roughness={.45}/></mesh>)}{actioned&&<mesh position={[0,.35,-.15]} rotation={[-.55,0,0]}><boxGeometry args={[.98,.04,.35]}/><meshStandardMaterial color="#e69a44"/></mesh>}</group>
  if(id==='roti')return <group rotation={[.04,-.18,.05]}><RoundedBox args={[.91,.33,.64]} radius={.04} smoothness={2} castShadow><meshPhysicalMaterial color="#e7e4d5" transparent opacity={.52} roughness={.2}/></RoundedBox>{[-.2,0,.2].map((x,i)=><mesh key={i} position={[x,.17,.02]} rotation={[0,i*.18,0]}><boxGeometry args={[.19,.035,.47]}/><meshStandardMaterial color="#e5a83b" roughness={.8}/></mesh>)}{actioned&&<mesh position={[0,.43,-.1]} rotation={[-.35,0,0]}><boxGeometry args={[.92,.025,.65]}/><meshPhysicalMaterial color="#e8edf0" transparent opacity={.48}/></mesh>}</group>
  if(id==='khaomao')return <group rotation={[0,.22,.12]}>{[-.28,0,.28].map((x,i)=><group key={i} position={[x,0,i%2*.12]}><mesh rotation={[0,0,.2]}><coneGeometry args={[.16,.48,4]}/><meshStandardMaterial color={i===1&&actioned?'#c9ba82':'#5c7c47'} side={THREE.DoubleSide}/></mesh><mesh position={[0,-.08,.15]}><boxGeometry args={[.22,.025,.025]}/><meshStandardMaterial color="#b9a776"/></mesh></group>)}</group>
  if(id==='redsnack')return <group rotation={[.12,.16,-.1]}><RoundedBox args={[.7,.88,.12]} radius={.04} smoothness={2} castShadow><meshStandardMaterial color="#b63235" roughness={.56}/></RoundedBox><mesh position={[0,.15,.068]}><circleGeometry args={[.23,32]}/><meshStandardMaterial color="#f7e2bf"/></mesh><mesh position={[0,-.17,.07]}><boxGeometry args={[.4,.06,.012]}/><meshStandardMaterial color="#f2c985"/></mesh>{actioned&&<mesh position={[0,.47,.02]} rotation={[0,0,.18]}><boxGeometry args={[.7,.12,.1]}/><meshStandardMaterial color="#d75a4a"/></mesh>}</group>
  if(id==='berries')return <group rotation={[.06,.1,-.08]}>{[-.25,.25].map((x,i)=><group key={i} position={[x,0,0]}><RoundedBox args={[.39,.78,.13]} radius={.035} smoothness={2} castShadow><meshStandardMaterial color={i===0?'#eedcda':'#d5dfc9'}/></RoundedBox><mesh position={[0,.15,.071]}><circleGeometry args={[.14,24]}/><meshStandardMaterial color={i===0?'#bd6670':'#759061'}/></mesh><mesh position={[0,-.13,.072]}><boxGeometry args={[.23,.03,.01]}/><meshStandardMaterial color="#846b62"/></mesh></group>)}{actioned&&<mesh position={[0,.48,.01]} rotation={[0,0,-.2]}><boxGeometry args={[.9,.09,.1]}/><meshStandardMaterial color="#eee2d5"/></mesh>}</group>
  return null
}
