import { Suspense, useEffect, useMemo, useState } from 'react'
import { Canvas } from '@react-three/fiber'
import { Html, OrbitControls, PerspectiveCamera, SoftShadows } from '@react-three/drei'
import { BoxWorld } from './components/BoxWorld'
import { DetailPanel } from './components/DetailPanel'
import { ITEMS, CHAPTERS, ENDING_LINES } from './content'
import { playSound } from './audio'

const load = (key, fallback) => { try { return JSON.parse(localStorage.getItem(key)) ?? fallback } catch { return fallback } }
export default function App() {
  const [phase,setPhase]=useState('intro'),[selected,setSelected]=useState(null),[visited,setVisited]=useState(()=>load('anniversary-visited',[]))
  const [actioned,setActioned]=useState(()=>load('anniversary-actioned',[])),[zoom,setZoom]=useState(1),[soundOn,setSoundOn]=useState(true)
  const [chapter,setChapter]=useState(0),[hint,setHint]=useState(false),[loader,setLoader]=useState(true),[closing,setClosing]=useState(false)
  const current=useMemo(()=>ITEMS.find(i=>i.id===selected),[selected]); const unlocked=visited.length===ITEMS.length
  const available=(item)=>item.layer===2||(item.layer===1&&ITEMS.filter(x=>x.layer===2&&visited.includes(x.id)).length>=2)||(item.layer===0&&ITEMS.filter(x=>x.layer===1&&visited.includes(x.id)).length>=2)
  useEffect(()=>{localStorage.setItem('anniversary-visited',JSON.stringify(visited))},[visited])
  useEffect(()=>{localStorage.setItem('anniversary-actioned',JSON.stringify(actioned))},[actioned])
  useEffect(()=>{const t=setTimeout(()=>setLoader(false),900);return()=>clearTimeout(t)},[])
  const s=(name)=>{if(soundOn)playSound(name)}
  const select=(id)=>{setSelected(id);setZoom(1);setVisited(v=>v.includes(id)?v:[...v,id]);s('pick')}
  const reset=()=>{setPhase('intro');setSelected(null);setVisited([]);setActioned([]);setChapter(0);setClosing(false);localStorage.removeItem('anniversary-visited');localStorage.removeItem('anniversary-actioned');s('paper')}
  const act=()=>{if(!current)return;setActioned(v=>v.includes(current.id)?v.filter(x=>x!==current.id):[...v,current.id]);s('paper')}
  return <main className="app">
    <div className="paper-grain" aria-hidden="true"/>
    <header className="topbar"><div className="brand"><span className="brand-dot"/><div><strong>ของที่ลืมใส่ในกล่อง</strong><small>ถึงแตง · สองเดือนของเรา</small></div></div><nav><button className="icon-button" onClick={()=>setSoundOn(x=>!x)}>{soundOn?'♪ เสียงเปิด':'♪ เสียงปิด'}</button><button className="icon-button" onClick={reset}>เริ่มใหม่</button></nav></header>
    <section className="stage" aria-label="เกมแกะพัสดุสามมิติ">
      <Canvas dpr={[1,1.65]} gl={{antialias:true,alpha:true}} shadows onPointerMissed={()=>{if(selected)setSelected(null)}}>
        <color attach="background" args={['#e8e1d4']}/><fog attach="fog" args={['#e8e1d4',7,16]}/><PerspectiveCamera makeDefault position={[0,3.2,7.6]} fov={38}/>
        <ambientLight intensity={1.25}/><directionalLight castShadow position={[4,8,5]} intensity={2.3} color="#fff1d5" shadow-mapSize-width={1024} shadow-mapSize-height={1024}/>
        <directionalLight position={[-5,3,-4]} intensity={.8} color="#91a9b7"/><SoftShadows size={18} focus={.5} samples={10}/>
        <Suspense fallback={<Html center><span className="loading">กำลังวางของลงกล่อง...</span></Html>}><BoxWorld phase={phase} selected={selected} visited={visited} actioned={actioned} zoom={zoom} onTape={()=>{setPhase('untaped');s('tape')}} onOpen={()=>{setPhase('open');s('box')}} onSelect={select} onClear={()=>setSelected(null)} ending={phase==='ending'}/></Suspense>
        <OrbitControls enabled={!current&&phase!=='ending'} enablePan={false} minDistance={5.7} maxDistance={9.2} minPolarAngle={.78} maxPolarAngle={1.42} minAzimuthAngle={-.72} maxAzimuthAngle={.72} target={[0,.8,0]}/>
      </Canvas>
      {loader&&<div className="loader"><span className="loader-box">▣</span><p>กำลังเตรียมพัสดุให้เธอ</p><i/></div>}
      {phase==='intro'&&<div className="intro overlay-card"><p className="eyebrow">จัดส่งแล้ว · 2 เดือนของเรา</p><h1>จริง ๆ ในกล่อง<br/>ยังขาดของอีกอย่าง</h1><p>ของที่ส่งไปถึงเธอมีอยู่จริงทุกชิ้น ลองเปิดกล่องดูทีละอย่าง แล้วค่อยเจอสิ่งที่ชั้นฝากไว้ในนี้</p><button className="primary" onClick={()=>{setPhase('sealed');s('chime')}}>รับพัสดุอีกหนึ่งชิ้น →</button></div>}
      {(phase==='sealed'||phase==='untaped')&&<div className="instruction-card"><span className="step">{phase==='sealed'?'01 / 02':'02 / 02'}</span><strong>{phase==='sealed'?'เริ่มที่เทปปิดกล่อง':'เปิดฝากล่อง'}</strong><p>{phase==='sealed'?'คลิกที่เทปบนกล่องเพื่อแกะ':'คลิกฝากล่องอีกครั้ง แล้วดูว่ามีอะไรซ่อนอยู่'}</p><button className="primary compact" onClick={()=>phase==='sealed'?(setPhase('untaped'),s('tape')):(setPhase('open'),s('box'))}>{phase==='sealed'?'แกะเทป':'เปิดกล่อง'}</button></div>}
      {phase==='open'&&!selected&&<div className="hud"><div className="hud-heading"><div><span className="eyebrow">ค้นในกล่อง</span><strong>{visited.length} / {ITEMS.length} ชิ้น</strong></div><button className="text-button" onClick={()=>setHint(x=>!x)}>{hint?'ซ่อนคำใบ้':'ขอคำใบ้'}</button></div><div className="item-grid">{ITEMS.map(item=><button key={item.id} className={visited.includes(item.id)?'seen':''} disabled={!available(item)} onClick={()=>select(item.id)} title={item.title}><span>{visited.includes(item.id)?'✓':available(item)?'?':'⌁'}</span>{available(item)?(hint||visited.includes(item.id)?item.kind:`ชั้นที่ ${item.layer+1}`):'ซ่อนอยู่'}</button>)}</div>{unlocked&&<button className="primary compact" onClick={()=>{setPhase('ending');s('chime')}}>เปิดของชิ้นสุดท้าย →</button>}<small>หยิบชิ้นบนก่อน ของด้านล่างจะค่อย ๆ ปรากฏ · หมุนฉากได้</small></div>}
      {current&&<><div className="inspect-tools"><span>↔ ลากของเพื่อหมุน</span><button onClick={()=>setZoom(z=>Math.max(.72,z-.16))} aria-label="ย่อโมเดล">−</button><span>{Math.round(zoom*100)}%</span><button onClick={()=>setZoom(z=>Math.min(1.6,z+.16))} aria-label="ขยายโมเดล">+</button></div><DetailPanel key={current.id} item={current} actioned={actioned.includes(current.id)} onAction={act} onClose={()=>{setSelected(null);s('put')}}/></>}
      {phase==='ending'&&<div className="ending-panel"><p className="eyebrow">ของชิ้นสุดท้าย</p><h2>สุขสันต์วันครบรอบสองเดือนนะแฟน</h2><div className="chapter-card"><img src={`${import.meta.env.BASE_URL}art/${CHAPTERS[chapter].art}`} alt="ภาพสีน้ำประกอบความทรงจำ"/><div><span>ความทรงจำ {chapter+1} / {CHAPTERS.length}</span><h3>{CHAPTERS[chapter].title}</h3><p>{CHAPTERS[chapter].text}</p></div></div><div className="chapter-nav"><button onClick={()=>{setChapter(c=>Math.max(0,c-1));s('paper')}} disabled={chapter===0}>← ก่อนหน้า</button><button onClick={()=>{setChapter(c=>Math.min(CHAPTERS.length-1,c+1));s('paper')}} disabled={chapter===CHAPTERS.length-1}>ถัดไป →</button></div>{chapter===CHAPTERS.length-1&&<div className="final-letter">{ENDING_LINES.map(x=><p key={x}>{x}</p>)}<p className="signature">จากต้น ♡</p><button className="primary" onClick={()=>{setClosing(true);s('chime')}}>ปิดกล่อง</button>{closing&&<p className="overflow">ปิดไม่ได้ ใส่ใจล้น 565555</p>}</div>}<button className="text-button" onClick={()=>setPhase('open')}>กลับไปดูของในกล่อง</button></div>}
    </section><footer><span>point · click · drag · discover</span><span>02 months · still unpacking</span></footer>
  </main>
}
