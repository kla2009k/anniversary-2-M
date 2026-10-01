import { useState } from 'react'

export function DetailPanel({item,actioned,onAction,onClose}) {
  const [answer,setAnswer]=useState(null),answered=answer!==null
  return <aside className="detail-panel"><button className="close-button" onClick={onClose} aria-label="วางของกลับลงกล่อง">×</button>
    <p className="eyebrow">ของชิ้นที่ {item.order} / 08</p><h2>{item.title}</h2><p className="detail-short">{item.kind}</p>
    <button className="object-action" onClick={onAction}>{actioned?'↶ ดูแบบเดิม':`✦ ${item.action}`}</button>
    <div className="quiz-block"><p className="eyebrow">คำถามเล็ก ๆ</p><h3>{item.prompt}</h3><div className="choices">{item.choices.map((choice,i)=><button key={choice} onClick={()=>setAnswer(i)} className={answered?(i===item.answer?'correct':i===answer?'wrong':''):''} disabled={answered}><span>{String.fromCharCode(65+i)}</span>{choice}</button>)}</div>
      {answered&&<div className="reveal"><small>{answer===item.answer?'จำได้ด้วย เก่งจัง ♡':'เฉลยอยู่ตรงนี้นะ ♡'}</small><p>{item.reveal}</p></div>}
    </div>
    <div className="memory-copy"><img src={`${import.meta.env.BASE_URL}art/${item.art}`} alt="ภาพสีน้ำประกอบความทรงจำ"/><div><span className="memory-tag">ก่อนคบกัน</span><p>{item.before}</p><span className="memory-tag">หลังคบกัน</span><p>{item.after}</p></div></div>
    <div className="rotate-guide">ลากโมเดลเพื่อหมุน · กด + / − เพื่อซูม · ดับเบิลคลิกเพื่อวางกลับ</div>
  </aside>
}
