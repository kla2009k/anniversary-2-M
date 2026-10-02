import { useState } from 'react'
import { NOTES, PHOTO_NOTES } from '../content'

export function DetailPanel({item,actioned,onAction,onNote,onClose}) {
  const [answer,setAnswer]=useState(null),[noteIndex,setNoteIndex]=useState(0),answered=answer!==null
  const notes=item.id==='photo'?PHOTO_NOTES:NOTES[item.id] || []
  return <aside className="detail-panel"><button className="close-button" onClick={onClose} aria-label="วางของกลับลงกล่อง">×</button>
    <p className="eyebrow">{item.imagined?'กล่องมุก · '+item.order:item.bonus?'ของที่ลืมส่ง':'ของชิ้นที่ '+item.order+' / 08'}</p><h2>{item.title}</h2><p className="detail-short">{item.kind}</p>
    {item.id==='photo'&&<figure className="photo-print"><img src={`${import.meta.env.BASE_URL}textures/forgotten-photo.webp`} alt="รูปนักเรียนของต้นที่ลืมใส่พัสดุ"/><figcaption>ส่งไม่ทันพัสดุ เลยมาอยู่ตรงนี้ก่อน ♡</figcaption></figure>}
    <button className="object-action" onClick={onAction}>{actioned?'↶ ดูแบบเดิม':`✦ ${item.action}`}</button>
    <div className="quiz-block"><p className="eyebrow">คำถามเล็ก ๆ</p><h3>{item.prompt}</h3><div className="choices">{item.choices.map((choice,i)=><button key={choice} onClick={()=>setAnswer(i)} className={answered?(i===item.answer?'correct':i===answer?'wrong':''):''} disabled={answered}><span>{String.fromCharCode(65+i)}</span>{choice}</button>)}</div>
      {answered&&<div className="reveal"><small>{answer===item.answer?'จำได้ด้วย เก่งจัง ♡':'เฉลยอยู่ตรงนี้นะ ♡'}</small><p>{item.reveal}</p></div>}
    </div>
    <div className="memory-copy"><img src={`${import.meta.env.BASE_URL}art/${item.art}`} alt="ภาพสีน้ำประกอบความทรงจำ"/><div><span className="memory-tag">{item.imagined?'แรงบันดาลใจ':'ก่อนคบกัน'}</span><p>{item.before}</p><span className="memory-tag">{item.imagined?'ฉากสมมติ':'หลังคบกัน'}</span><p>{item.after}</p></div></div>
    {notes.length>0&&<section className="note-deck" aria-label="โน้ตจากคนส่ง"><div className="note-deck-head"><span>โน้ตที่ชั้นแอบใส่เพิ่ม</span><small>{String(noteIndex+1).padStart(2,'0')} / {String(notes.length).padStart(2,'0')}</small></div><article key={noteIndex} className="note-card"><small>{notes[noteIndex][0]}</small><p>{notes[noteIndex][1]}</p></article><div className="note-deck-controls"><button onClick={()=>{setNoteIndex(i=>Math.max(0,i-1));onNote()}} disabled={noteIndex===0}>← ก่อนหน้า</button><button onClick={()=>{setNoteIndex(i=>Math.min(notes.length-1,i+1));onNote()}} disabled={noteIndex===notes.length-1}>เปิดใบต่อไป →</button></div><small className="note-disclaimer">“เรื่องจริง” มาจากที่เราเล่าไว้ ส่วน “มุกในเกม” กับ “ในใจชั้น” คือข้อความที่แต่งให้เกมนี้</small></section>}
    <div className="rotate-guide">ลากโมเดลเพื่อหมุน · กด + / − เพื่อซูม · ดับเบิลคลิกเพื่อวางกลับ</div>
  </aside>
}
