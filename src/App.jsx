import { Suspense, useEffect, useMemo, useState } from 'react'
import { Canvas } from '@react-three/fiber'
import { OrbitControls, PerspectiveCamera, SoftShadows, useProgress } from '@react-three/drei'
import { BoxWorld } from './components/BoxWorld'
import { DetailPanel } from './components/DetailPanel'
import { ITEMS, CHAPTERS, ENDING_LINES } from './content'
import { playSound } from './audio'

const load = (key, fallback) => { try { return JSON.parse(localStorage.getItem(key)) ?? fallback } catch { return fallback } }
export default function App() {
  const [phase,setPhase]=useState('intro'),[selected,setSelected]=useState(null),[visited,setVisited]=useState(()=>load('anniversary-visited',[]))
  const [actioned,setActioned]=useState(()=>load('anniversary-actioned',[])),[zoom,setZoom]=useState(1),[soundOn,setSoundOn]=useState(true)
  const [chapter,setChapter]=useState(0),[hint,setHint]=useState(false),[loader,setLoader]=useState(true),[closing,setClosing]=useState(false),[showExtras,setShowExtras]=useState(false)
  const { active: assetsLoading } = useProgress()
  const current=useMemo(()=>ITEMS.find(i=>i.id===selected),[selected]); const unlocked=visited.includes('photo')
  const parcelCount=ITEMS.filter(x=>!x.bonus&&visited.includes(x.id)).length
  const available=(item)=>item.imagined?visited.includes('photo'):item.bonus?parcelCount===8:item.layer===2||(item.layer===1&&ITEMS.filter(x=>x.layer===2&&visited.includes(x.id)).length>=2)||(item.layer===0&&ITEMS.filter(x=>x.layer===1&&visited.includes(x.id)).length>=2)
  useEffect(()=>{localStorage.setItem('anniversary-visited',JSON.stringify(visited))},[visited])
  useEffect(()=>{localStorage.setItem('anniversary-actioned',JSON.stringify(actioned))},[actioned])
  useEffect(()=>{const t=setTimeout(()=>setLoader(false),900);return()=>clearTimeout(t)},[])
  useEffect(()=>{if(phase!=='opening')return;const t=setTimeout(()=>setPhase('open'),1650);return()=>clearTimeout(t)},[phase])
  const s=(name)=>{if(soundOn)playSound(name)}
  const beginCut=()=>{if(phase==='sealed'){setPhase('cutting');s('tape')}}
  const beginOpen=()=>{if(phase==='untaped'){setPhase('opening');s('box')}}
  const select=(id)=>{setSelected(id);setZoom(1);setVisited(v=>v.includes(id)?v:[...v,id]);s('pick')}
  const reset=()=>{setPhase('intro');setSelected(null);setVisited([]);setActioned([]);setChapter(0);setClosing(false);setShowExtras(false);localStorage.removeItem('anniversary-visited');localStorage.removeItem('anniversary-actioned');s('paper')}
  const act=()=>{if(!current)return;setActioned(v=>v.includes(current.id)?v.filter(x=>x!==current.id):[...v,current.id]);s(current.id==='photo'?'paper':current.id)}
  return <main className="app">
    <div className="paper-grain" aria-hidden="true"/>
    <header className="topbar"><div className="brand"><span className="brand-dot"/><div><strong>ของที่ลืมใส่ในกล่อง</strong><small>ถึงแตง · สองเดือนของเรา</small></div></div><nav><button className="icon-button" onClick={()=>setSoundOn(x=>!x)}>{soundOn?'♪ เสียงเปิด':'♪ เสียงปิด'}</button><button className="icon-button" onClick={reset}>เริ่มใหม่</button></nav></header>
    <section className={`stage phase-${phase}`} aria-label="เกมแกะพัสดุสามมิติ">
      <Canvas dpr={[1,1.65]} gl={{antialias:true,alpha:true}} shadows onPointerMissed={()=>{if(selected)setSelected(null)}}>
        <color attach="background" args={['#e8e1d4']}/><fog attach="fog" args={['#e8e1d4',7,16]}/><PerspectiveCamera makeDefault position={[0,3.2,7.6]} fov={38}/>
        <ambientLight intensity={1.25}/><directionalLight castShadow position={[4,8,5]} intensity={2.3} color="#fff1d5" shadow-mapSize-width={1024} shadow-mapSize-height={1024}/>
        <directionalLight position={[-5,3,-4]} intensity={.8} color="#91a9b7"/><SoftShadows size={18} focus={.5} samples={10}/>
        <Suspense fallback={null}><BoxWorld phase={phase} selected={selected} visited={visited} actioned={actioned} zoom={zoom} onTape={beginCut} onOpen={beginOpen} onCutComplete={()=>setPhase(p=>p==='cutting'?'untaped':p)} onSelect={select} onClear={()=>setSelected(null)} ending={phase==='ending'}/></Suspense>
        <OrbitControls enabled={!current&&['intro','sealed','untaped','open'].includes(phase)} enablePan={false} minDistance={5.7} maxDistance={9.2} minPolarAngle={.78} maxPolarAngle={1.42} minAzimuthAngle={-.72} maxAzimuthAngle={.72} target={[0,.8,0]}/>
      </Canvas>
      {loader&&<div className="loader"><span className="loader-box">▣</span><p>กำลังเตรียมพัสดุให้เธอ</p><i/></div>}
      {!loader&&assetsLoading&&<div className="asset-loading">กำลังวางของลงกล่อง...</div>}
      {phase==='intro'&&<div className="intro overlay-card"><p className="eyebrow">จัดส่งแล้ว · 2 เดือนของเรา</p><h1>จริง ๆ ในกล่อง<br/>ยังขาดของอีกอย่าง</h1><p>ของแปดชิ้นส่งไปถึงเธอจริง ๆ แต่อีกหนึ่งชิ้นชั้นลืมใส่พัสดุไว้ ลองแกะดูทีละอย่าง แล้วค่อยเจอกันตรงท้ายกล่อง</p><button className="primary" onClick={()=>{setPhase('sealed');s('chime')}}>รับพัสดุอีกหนึ่งชิ้น →</button></div>}
      {(phase==='sealed'||phase==='untaped')&&<div className="instruction-card"><span className="step">{phase==='sealed'?'01 / 02':'02 / 02'}</span><strong>{phase==='sealed'?'เริ่มที่เทปปิดกล่อง':'เปิดฝากล่อง'}</strong><p>{phase==='sealed'?'กดเพื่อให้คัตเตอร์กรีดเทปเป็นฉากสั้น ๆ':'กดเปิด แล้วรอฝากล่องค่อย ๆ คลี่ออก'}</p><button className="primary compact" onClick={phase==='sealed'?beginCut:beginOpen}>{phase==='sealed'?'กรีดเทป':'เปิดกล่อง'}</button></div>}
      {(phase==='cutting'||phase==='opening')&&<div className="cutscene-overlay" aria-live="polite"><span>{phase==='cutting'?'01 / 02 · ค่อย ๆ กรีดเทป':'02 / 02 · เปิดฝากล่อง'}</span><strong>{phase==='cutting'?'อีกนิดเดียวก็ถึงของข้างในแล้ว':'ของทุกชิ้นกำลังรอให้เธอหยิบ'}</strong><div className="cutscene-progress"><i key={phase}/></div></div>}
      {phase==='open'&&!selected&&<div className="hud"><div className="hud-heading"><div><span className="eyebrow">ค้นในกล่อง</span><strong>{parcelCount} / 8 ชิ้น {visited.includes('photo')?'· เจอรูปแล้ว':''}</strong></div><button className="text-button" onClick={()=>setHint(x=>!x)}>{hint?'ซ่อนคำใบ้':'ขอคำใบ้'}</button></div><div className="item-grid">{ITEMS.filter(item=>!item.imagined).map(item=><button key={item.id} className={`${visited.includes(item.id)?'seen':''} ${item.bonus?'bonus-item':''}`} disabled={!available(item)} onClick={()=>select(item.id)} title={item.title}><span>{visited.includes(item.id)?'✓':available(item)?'?':'⌁'}</span>{available(item)?(hint||visited.includes(item.id)?item.kind:item.bonus?'ของที่ลืมส่ง':`ชั้นที่ ${item.layer+1}`):item.bonus?'เปิดเมื่อเจอครบ 8 ชิ้น':'ซ่อนอยู่'}</button>)}</div>{unlocked&&<details className="fiction-shelf" open={showExtras}><summary onClick={e=>{e.preventDefault();setShowExtras(x=>!x)}}>✦ เปิดกล่องมุกอีก 5 ชิ้น · ไม่ได้อยู่ในพัสดุจริง</summary><div className="fiction-grid">{ITEMS.filter(item=>item.imagined).map(item=><button key={item.id} onClick={()=>select(item.id)} title={item.title}><span>{visited.includes(item.id)?'✓':'✦'}</span>{item.title}</button>)}</div></details>}{unlocked&&<button className="primary compact" onClick={()=>{setPhase('ending');s('chime')}}>เปิดของชิ้นสุดท้าย →</button>}<small>{parcelCount===8?'ของจริงครบแล้ว · รูปที่ลืมส่งกำลังรออยู่':'หยิบชิ้นบนก่อน ของด้านล่างจะค่อย ๆ ปรากฏ · หมุนฉากได้'}</small></div>}
      {current&&<><div className="inspect-tools"><span>↔ ลากของเพื่อหมุน</span><button onClick={()=>setZoom(z=>Math.max(.72,z-.16))} aria-label="ย่อโมเดล">−</button><span>{Math.round(zoom*100)}%</span><button onClick={()=>setZoom(z=>Math.min(1.6,z+.16))} aria-label="ขยายโมเดล">+</button></div><DetailPanel key={current.id} item={current} actioned={actioned.includes(current.id)} onAction={act} onNote={()=>s('paper')} onClose={()=>{setSelected(null);s('put')}}/></>}
      {phase==='ending'&&<div className="ending-panel"><p className="eyebrow">ของชิ้นสุดท้าย</p><h2>สุขสันต์วันครบรอบสองเดือนนะแฟน</h2><div className="chapter-card"><img src={`${import.meta.env.BASE_URL}art/${CHAPTERS[chapter].art}`} alt="ภาพสีน้ำประกอบความทรงจำ"/><div><span>ความทรงจำ {chapter+1} / {CHAPTERS.length}</span><h3>{CHAPTERS[chapter].title}</h3><p>{CHAPTERS[chapter].text}</p></div></div><div className="chapter-nav"><button onClick={()=>{setChapter(c=>Math.max(0,c-1));s('paper')}} disabled={chapter===0}>← ก่อนหน้า</button><button onClick={()=>{setChapter(c=>Math.min(CHAPTERS.length-1,c+1));s('paper')}} disabled={chapter===CHAPTERS.length-1}>ถัดไป →</button></div>{chapter===CHAPTERS.length-1&&<div className="final-letter">{ENDING_LINES.map(x=><p key={x}>{x}</p>)}<p className="signature">จากต้น ♡</p><button className="primary" onClick={()=>{setClosing(true);s('chime')}}>ปิดกล่อง</button>{closing&&<p className="overflow">ปิดไม่ได้ ใส่ใจล้น 565555</p>}</div>}<button className="text-button" onClick={()=>setPhase('open')}>กลับไปดูของในกล่อง</button></div>}
    </section><footer><span>point · click · drag · discover</span><span>02 months · still unpacking</span></footer>
  </main>
}
