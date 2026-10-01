import { useMemo } from 'react'
import { RoundedBox, useTexture } from '@react-three/drei'
import * as THREE from 'three'

const gold = { color: '#e9b948', metalness: .86, roughness: .19 }
const leather = { color: '#ac252d', roughness: .68, metalness: .02 }
const leaf = { color: '#4d7650', side: THREE.DoubleSide, roughness: .89 }
const textureUrl = name => `${import.meta.env.BASE_URL}textures/${name}`
function usePhoto(name) { const map = useTexture(textureUrl(name)); map.colorSpace = THREE.SRGBColorSpace; map.anisotropy = 8; return map }
function Line({ points, color, radius = .008 }) {
  const curve = useMemo(() => new THREE.CatmullRomCurve3(points.map(p => new THREE.Vector3(...p))), [points])
  return <mesh><tubeGeometry args={[curve, Math.max(12, points.length * 5), radius, 5, false]}/><meshStandardMaterial color={color} roughness={.7}/></mesh>
}
function Photo({name,width,height,position=[0,0,0],transparent=false}) { const map=usePhoto(name); return <mesh position={position}><planeGeometry args={[width,height]}/><meshBasicMaterial map={map} transparent={transparent} alphaTest={transparent?.03:0} side={THREE.DoubleSide}/></mesh> }

export function ItemModel({id,actioned}) {
  switch(id) {
    case 'bracelet': return <Bracelet opened={actioned}/>
    case 'pen': return <PenCase opened={actioned}/>
    case 'book': return <Book opened={actioned}/>
    case 'dates': return <Dates opened={actioned}/>
    case 'roti': return <Roti opened={actioned}/>
    case 'khaomao': return <KhaoMao opened={actioned}/>
    case 'redsnack': return <RedSnack opened={actioned}/>
    case 'berries': return <Berries opened={actioned}/>
    default: return null
  }
}

function Bracelet({opened}) {
  const cord = '#ca1722'
  const ring = useMemo(() => new THREE.CatmullRomCurve3(Array.from({length:49},(_,i)=>{const a=i/48*Math.PI*2; return new THREE.Vector3(Math.cos(a)*.47,Math.sin(a)*.27+.08,0)}),true),[])
  return <group rotation={[.08,-.15,.02]}>
    {[0,.024,-.024].map((z,i)=><mesh key={i} position={[0,0,z]}><tubeGeometry args={[ring,128,.018,8,true]}/><meshStandardMaterial color={i===0?'#e6282e':cord} roughness={.92}/></mesh>)}
    {Array.from({length:60},(_,i)=>{const a=i/60*Math.PI*2;return <mesh key={i} position={[Math.cos(a)*.47,Math.sin(a)*.27+.08,.025]} rotation={[0,0,-a]}><torusGeometry args={[.019,.006,4,8,Math.PI]}/><meshStandardMaterial color="#ed4442" roughness={.9}/></mesh>})}
    <group position={[0,-.18,.07]} scale={.9}>
      <mesh castShadow scale={[.32,.17,.16]}><sphereGeometry args={[1,32,24]}/><meshStandardMaterial {...gold}/></mesh>
      <mesh castShadow position={[.27,.055,0]} scale={[.14,.13,.13]}><sphereGeometry args={[1,24,16]}/><meshStandardMaterial {...gold}/></mesh>
      <mesh castShadow position={[.37,-.01,.035]} scale={[.12,.06,.09]}><sphereGeometry args={[1,20,12]}/><meshStandardMaterial {...gold}/></mesh>
      {[-.19,.16].map(x=>[-.09,.09].map(z=><mesh key={`${x}/${z}`} castShadow position={[x,-.15,z]}><cylinderGeometry args={[.065,.08,.19,12]}/><meshStandardMaterial {...gold}/></mesh>))}
      {[-.07,.07].map((z,i)=><mesh key={i} castShadow position={[.27,.18,z]} rotation={[0,0,i?.5:-.5]}><coneGeometry args={[.055,.21,8]}/><meshStandardMaterial {...gold}/></mesh>)}
      <mesh position={[.345,.09,.115]}><sphereGeometry args={[.021,10,8]}/><meshStandardMaterial color="#4a2615" metalness={.2}/></mesh>
      <mesh position={[-.29,.07,0]} rotation={[0,0,.5]}><torusGeometry args={[.13,.044,8,20,Math.PI*1.5]}/><meshStandardMaterial {...gold}/></mesh>
      {Array.from({length:8},(_,i)=><mesh key={i} position={[-.19+i*.055,.13+Math.sin(i*.6)*.03,.155]} rotation={[0,0,i*.12]}><boxGeometry args={[.038,.038,.016]}/><meshStandardMaterial color="#f4d17c" metalness={.75} roughness={.24}/></mesh>)}
    </group>
    <mesh position={[.38,.32,.015]} rotation={[Math.PI/2,0,.4]}><cylinderGeometry args={[.055,.055,.11,16]}/><meshStandardMaterial {...gold}/></mesh>
    {opened&&<><Line points={[[.37,.31,0],[.58,.4,0],[.68,.37,0]]} color={cord} radius={.014}/><mesh position={[.68,.37,0]}><sphereGeometry args={[.04,12,8]}/><meshStandardMaterial {...gold}/></mesh></>}
  </group>
}

function PenCase({opened}) {
  return <group rotation={[0,.16,-.17]}>
    <RoundedBox args={[1.14,.25,.32]} radius={.06} smoothness={5} castShadow><meshStandardMaterial {...leather}/></RoundedBox>
    <RoundedBox args={[.81,.23,.345]} radius={.035} smoothness={4} position={opened?[-.1,.22,-.04]:[-.1,.12,.01]} rotation={opened?[.45,0,0]:[0,0,0]} castShadow><meshStandardMaterial color="#c7373d" roughness={.62}/></RoundedBox>
    <mesh position={[.55,.015,0]}><torusGeometry args={[.105,.025,8,20]}/><meshStandardMaterial {...leather}/></mesh>
    <mesh position={[-.49,.005,.176]}><sphereGeometry args={[.028,12,8]}/><meshStandardMaterial color="#b98d54" metalness={.72}/></mesh>
    {[-.12,.12].map(z=>Array.from({length:28},(_,i)=><mesh key={`${z}/${i}`} position={[-.51+i*.038,.123,z+.055]}><sphereGeometry args={[.0038,6,4]}/><meshStandardMaterial color="#e0958d"/></mesh>))}
    {opened&&[-.12,.06,.23].map((z,i)=><group key={i} position={[-.09,.25,z]} rotation={[0,0,-.12]}><mesh><cylinderGeometry args={[.019,.019,.7,12]}/><meshStandardMaterial color={['#1e252d','#ded4bd','#414150'][i]} metalness={.25}/></mesh><mesh position={[0,.38,0]}><coneGeometry args={[.018,.05,12]}/><meshStandardMaterial color="#c2a279" metalness={.7}/></mesh></group>)}
  </group>
}

function Book({opened}) {
  return <group rotation={[.04,-.12,.04]}>
    <RoundedBox args={[.69,1.02,.105]} radius={.015} smoothness={3} castShadow><meshStandardMaterial color="#162658" roughness={.81}/></RoundedBox>
    <mesh position={[.006,0,.058]}><boxGeometry args={[.655,.986,.005]}/><meshStandardMaterial color="#efe7d8" roughness={.97}/></mesh>
    {!opened&&<Photo name="book.webp" width={.67} height={.99} position={[0,0,.064]}/>}
    {opened&&<><mesh position={[-.39,0,.04]} rotation={[0,-.7,0]}><boxGeometry args={[.68,1.01,.018]}/><meshStandardMaterial color="#213577" side={THREE.DoubleSide}/></mesh><Photo name="book.webp" width={.67} height={.99} position={[-.63,0,.28]}/>{[-.2,-.05,.1,.25].map(y=><mesh key={y} position={[.05,y,.067]}><planeGeometry args={[.47,.014]}/><meshStandardMaterial color="#b8ada0"/></mesh>)}</>}
    <mesh position={[.34,0,0]}><boxGeometry args={[.018,1.01,.11]}/><meshStandardMaterial color="#e6dbca"/></mesh>
  </group>
}

function Dates({opened}) {
  return <group rotation={[0,.12,.02]}>
    <RoundedBox args={[1.04,.62,.31]} radius={.025} smoothness={3} castShadow><meshStandardMaterial color="#86451d" roughness={.71}/></RoundedBox>
    <Photo name="dates.webp" width={1.03} height={.67} position={[0,0,.165]} transparent/>
    {opened&&<group position={[0,.38,-.08]} rotation={[-.6,0,0]}><mesh><boxGeometry args={[1.04,.035,.32]}/><meshStandardMaterial color="#d47c31"/></mesh></group>}
    {opened&&[-.28,0,.28].map((x,i)=><mesh key={i} position={[x,.12,.19]} scale={[.1,.16,.06]}><sphereGeometry args={[1,16,12]}/><meshStandardMaterial color="#572510" roughness={.38}/></mesh>)}
  </group>
}

function Roti({opened}) {
  return <group rotation={[.08,-.08,.03]}>
    <RoundedBox args={[.94,.29,.67]} radius={.042} smoothness={5} castShadow><meshPhysicalMaterial color="#f0eee5" transparent opacity={.36} roughness={.08} metalness={0} depthWrite={false}/></RoundedBox>
    {Array.from({length:5},(_,i)=><group key={i} position={[-.31+i*.15,.09-i*.014,.02]} rotation={[0,i*.15-.3,i*.07]}><mesh castShadow><boxGeometry args={[.14,.022,.48]}/><meshStandardMaterial color={i%2?'#dfa142':'#f1ba59'} roughness={.78}/></mesh>{Array.from({length:9},(_,j)=><mesh key={j} position={[((j*17)%7-3)*.016,.015,((j*11)%9-4)*.044]}><sphereGeometry args={[.006,5,4]}/><meshStandardMaterial color={j%3?'#293329':'#658044'}/></mesh>)}</group>)}
    <mesh position={[0,opened?.35:.155,-.1]} rotation={[opened?-.6:0,0,0]}><boxGeometry args={[.94,.018,.66]}/><meshPhysicalMaterial color="#e4ebea" transparent opacity={.58} roughness={.12}/></mesh>
    <mesh position={[0,-.155,0]}><boxGeometry args={[.91,.017,.64]}/><meshStandardMaterial color="#e8e5dc" transparent opacity={.7}/></mesh>
  </group>
}

function BananaBundle({x,opened=false}) {
  return <group position={[x,0,0]} rotation={[0,0,x*.15]}>
    <mesh castShadow scale={[.18,.31,.1]}><sphereGeometry args={[1,18,12]}/><meshStandardMaterial {...leaf}/></mesh>
    <mesh position={[0,-.18,.11]}><boxGeometry args={[.34,.024,.03]}/><meshStandardMaterial color="#b6a477" roughness={1}/></mesh>
    <Line points={[[-.12,-.23,.104],[0,.03,.105],[.13,.22,.08]]} color="#9dbc82" radius={.008}/>
    {opened&&<><mesh position={[.25,.01,-.07]} rotation={[0,-.2,-.5]} scale={[.3,.43,1]}><circleGeometry args={[.75,28]}/><meshStandardMaterial {...leaf}/></mesh><Line points={[[.07,-.28,.005],[.19,0,.005],[.38,.3,.005]]} color="#b5c795" radius={.007}/>{Array.from({length:45},(_,i)=>{const a=i*2.399,r=Math.sqrt(i/45)*.14;return <mesh key={i} position={[r*Math.cos(a),-.04+r*Math.sin(a),.115]} rotation={[0,0,a]}><capsuleGeometry args={[.009,.021,2,5]}/><meshStandardMaterial color={i%3?'#e2d8a2':'#bdaf79'} roughness={.93}/></mesh>})}</>}
  </group>
}
function KhaoMao({opened}) { return <group rotation={[.07,.12,.08]}><BananaBundle x={-.29}/><BananaBundle x={0} opened={opened}/><BananaBundle x={.29}/></group> }

function RedSnack({opened}) {
  return <group rotation={[.04,.12,-.07]}>
    <mesh castShadow><boxGeometry args={[.72,.93,.09]}/><meshStandardMaterial color="#d71b19" roughness={.55}/></mesh>
    <Photo name="redsnack.webp" width={.73} height={.96} position={[0,0,.051]} transparent/>
    {[-.35,.35].map(x=><mesh key={x} position={[x,0,.045]} rotation={[0,0,x*.08]}><boxGeometry args={[.018,.9,.014]}/><meshStandardMaterial color="#ed6a51" transparent opacity={.6}/></mesh>)}
    {opened&&<><mesh position={[.07,.53,.01]} rotation={[0,0,.22]}><boxGeometry args={[.7,.1,.08]}/><meshStandardMaterial color="#d9382b"/></mesh>{[-.12,.08,.24].map(x=><mesh key={x} position={[x,.17,.09]} scale={[.07,.1,.025]}><sphereGeometry args={[1,10,8]}/><meshStandardMaterial color="#f8e4bf"/></mesh>)}</>}
  </group>
}

function BerryPouch({name,x,opened}) {
  return <group position={[x,0,0]} rotation={[0,0,x*.11]}>
    <RoundedBox args={[.47,.83,.11]} radius={.045} smoothness={4} castShadow><meshStandardMaterial color="#f2eee8" roughness={.55}/></RoundedBox>
    <Photo name={name} width={.44} height={.75} position={[0,-.02,.065]}/>
    <mesh position={[0,.43,0]}><boxGeometry args={[.45,.035,.115]}/><meshStandardMaterial color="#eee8e2"/></mesh>
    {opened&&<mesh position={[.05,.54,.01]} rotation={[0,0,.2]}><boxGeometry args={[.43,.075,.12]}/><meshStandardMaterial color="#f6f0e8"/></mesh>}
  </group>
}
function Berries({opened}) {
  return <group rotation={[.03,-.05,0]}><BerryPouch name="berry-red.webp" x={-.27} opened={opened}/><BerryPouch name="berry-green.webp" x={.27} opened={opened}/>{opened&&[-.22,0,.22].map((x,i)=><mesh key={i} position={[x,-.32,.19]}><sphereGeometry args={[.075,18,12]}/><meshStandardMaterial color={i===2?'#81a462':'#ba6d6e'} roughness={.4}/></mesh>)}</group>
}
