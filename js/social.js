/* ══════════════════════════════════════════
   social.js — World book, XHS system, Memory lib, Mail system
   ══════════════════════════════════════════ */

function renderWorldEntries(){const el=document.getElementById('worldEntries');if(!el)return;if(!S.worldEntries?.length){el.innerHTML='<div style="text-align:center;padding:20px;color:var(--muted);font-size:13px">暂无自定义设定<br/>添加你们之间的专属故事吧</div>';return;}el.innerHTML=S.worldEntries.map((e,i)=>`<div style="background:white;border-radius:var(--r);overflow:hidden;box-shadow:var(--shadow);border:1px solid var(--border)"><div style="padding:10px 14px;border-bottom:1px solid var(--border);display:flex;align-items:center;justify-content:space-between"><div style="font-size:13px;font-weight:600">${esc(e.title)}</div><div style="display:flex;gap:8px"><button onclick="editWorldEntry(${i})" style="font-size:12px;color:var(--p500);border:none;background:none;cursor:pointer;font-family:inherit">编辑</button><button onclick="deleteWorldEntry(${i})" style="font-size:12px;color:var(--muted);border:none;background:none;cursor:pointer;font-family:inherit">删除</button></div></div><div style="padding:10px 14px;font-size:13px;color:var(--muted);line-height:1.65">${esc(e.content)}</div></div>`).join('');}
function addWorldEntry(){os('添加世界设定',`<div style="display:flex;flex-direction:column;gap:10px"><div><div style="font-size:12px;color:var(--muted);margin-bottom:4px">标题</div><input class="si" id="we_t" placeholder="例：我们第一次见面"/></div><div><div style="font-size:12px;color:var(--muted);margin-bottom:4px">内容</div><textarea class="si" id="we_c" rows="5" style="resize:vertical;font-family:inherit" placeholder="例：某个傍晚，她在球场边看了他练球很久……"></textarea></div><button class="shbtn p" onclick="saveWorldEntry()">保存</button></div>`);}
function saveWorldEntry(){const t=document.getElementById('we_t')?.value.trim();const c=document.getElementById('we_c')?.value.trim();if(!t||!c){toast('请填写标题和内容');return;}if(!S.worldEntries)S.worldEntries=[];S.worldEntries.push({title:t,content:c});sv();cs();renderWorldEntries();toast('✅ 已加入世界书');}
function editWorldEntry(i){const e=S.worldEntries[i];os('编辑世界设定',`<div style="display:flex;flex-direction:column;gap:10px"><div><div style="font-size:12px;color:var(--muted);margin-bottom:4px">标题</div><input class="si" id="we_t2" value="${esc(e.title)}"/></div><div><div style="font-size:12px;color:var(--muted);margin-bottom:4px">内容</div><textarea class="si" id="we_c2" rows="5" style="resize:vertical;font-family:inherit">${esc(e.content)}</textarea></div><button class="shbtn p" onclick="updateWorldEntry(${i})">保存</button></div>`);}
function updateWorldEntry(i){const t=document.getElementById('we_t2')?.value.trim();const c=document.getElementById('we_c2')?.value.trim();if(!t||!c)return;S.worldEntries[i]={title:t,content:c};sv();cs();renderWorldEntries();toast('✅ 已更新');}
function deleteWorldEntry(i){if(!confirm('删除这条设定？'))return;S.worldEntries.splice(i,1);sv();renderWorldEntries();}
/* ══ 小红薯 ══ */


function initXhs(){
  if(!S.xhsPosts)S.xhsPosts=[...SEED_POSTS];
}

/* 每天生成3-5条新帖 */

async function generateDailyPosts(){
  const s=S.set;
  if(!s.key||s.prov==='off') return;
  const today=new Date().toDateString();
  if(S.xhsLastGen===today) return; /* 今天已生成 */

  /* 随机选3-5个作者 */
  const count=3+Math.floor(Math.random()*3);
  const chosen=[];
  const pool=[...DAILY_AUTHORS];
  for(let i=0;i<count;i++){
    const total=pool.reduce((a,b)=>a+b.weight,0);
    let r=Math.random()*total;
    for(const a of pool){r-=a.weight;if(r<=0){chosen.push(a.user);pool.splice(pool.indexOf(a),1);break;}}
  }

  const pc=PC[s.prov];if(!pc)return;
  const newPosts=[];
  for(const author of chosen){
    const prompt=AUTHOR_PROMPTS[author]||'发一条日常帖子，60字以内。';
    try{
      const r=await fetch(pc.url(s.model,s.key),{method:'POST',headers:pc.hd(s.key),
        body:JSON.stringify(pc.body(prompt,[{role:'user',content:'发一条今天的帖子'}]))});
      const d=await r.json();
      const text=pc.parse(d);
      if(text&&text.trim()){
        newPosts.push({
          id:'d'+rid(),user:author,
          ts:Date.now()-Math.floor(Math.random()*3600000),
          text:text.trim(),likes:[],comments:[],myLiked:false
        });
      }
    }catch(e){}
    await new Promise(r=>setTimeout(r,300));
  }

  if(newPosts.length){
    S.xhsPosts=[...newPosts,...(S.xhsPosts||[])];
    S.xhsLastGen=today;
    sv();
    renderXhs();
    toast('✨ 今日新内容已更新');
  }
}

function renderXhs(){
  initXhs();
  const feed=document.getElementById('xhsFeed');if(!feed)return;
  const sorted=[...S.xhsPosts].sort((a,b)=>b.ts-a.ts);
  feed.innerHTML='';
  sorted.forEach(p=>feed.appendChild(buildXhsPost(p)));
}

function buildXhsPost(p){
  const u=XHS_USERS[p.user]||{name:p.user,color:'#666',ico:'👤'};
  const isMe=p.user==='me';
  const myName=S.set.name||'我';
  const displayName=isMe?myName:u.name;
  const color=isMe?'var(--p500)':u.color;
  const div=document.createElement('div');div.className='xhs-post';
  const likes=Array.isArray(p.likes)?p.likes:[];
  const likeCount=likes.length+(p.myLiked?0:0);
  div.innerHTML=`
    <div class="xhs-post-head">
      <div class="xhs-avatar" style="background:${color}">${isMe?(myName.slice(-1)||'我'):u.ico}</div>
      <div><div style="font-size:13px;font-weight:700;color:${color}">${esc(displayName)}</div>
      <div style="font-size:10px;color:var(--muted)">${fmtXhsTime(p.ts)}</div></div>
    </div>
    <div class="xhs-post-body">${esc(p.text).replace(/\n/g,'<br>')}</div>
    <div class="xhs-post-actions">
      <div class="xhs-action ${p.myLiked?'liked':''}" onclick="xhsLike('${p.id}')">
        ${p.myLiked?'❤️':'🤍'} ${likeCount}
      </div>
      <div class="xhs-action" onclick="xhsComment('${p.id}')">💬 ${(p.comments||[]).length}</div>
    </div>
    ${(p.comments||[]).length?`<div class="xhs-comments">${(p.comments||[]).map(c=>{const cu=XHS_USERS[c.user]||{name:c.user==='me'?myName:c.user};return`<div class="xhs-comment"><span class="cn">${esc(c.user==='me'?myName:cu.name)}：</span>${esc(c.text)}</div>`}).join('')}</div>`:''}
  `;
  return div;
}

function fmtXhsTime(ts){
  const d=Date.now()-ts;
  if(d<60000)return'刚刚';
  if(d<3600000)return Math.floor(d/60000)+'分钟前';
  if(d<86400000)return Math.floor(d/3600000)+'小时前';
  return Math.floor(d/86400000)+'天前';
}

function xhsLike(id){
  initXhs();
  const p=S.xhsPosts.find(x=>x.id===id);if(!p)return;
  p.myLiked=!p.myLiked;
  if(!Array.isArray(p.likes))p.likes=[];
  if(p.myLiked&&!p.likes.includes('me'))p.likes.push('me');
  else p.likes=p.likes.filter(x=>x!=='me');
  sv();renderXhs();
}

function xhsComment(id){
  os('发表评论',`<div style="display:flex;flex-direction:column;gap:10px">
    <textarea class="si" id="xhs_cmt" rows="3" style="resize:none;font-family:inherit" placeholder="说点什么…"></textarea>
    <button class="shbtn p" onclick="submitXhsComment('${id}')">发送</button>
  </div>`);
}

function submitXhsComment(id){
  const t=document.getElementById('xhs_cmt')?.value.trim();if(!t)return;
  initXhs();
  const p=S.xhsPosts.find(x=>x.id===id);if(!p)return;
  if(!Array.isArray(p.comments))p.comments=[];
  p.comments.push({user:'me',text:t});
  sv();cs();renderXhs();
  /* 幸村回复概率50% */
  if(p.user==='yukimura'&&Math.random()<0.5){
    setTimeout(()=>{
      const replies=['嗯。','……','看到了。','说得对。','你来评论了。'];
      p.comments.push({user:'yukimura',text:replies[Math.floor(Math.random()*replies.length)]});
      sv();renderXhs();
    },2000+Math.random()*3000);
  }
}

function xhsPost(){
  os('发布笔记',`<div style="display:flex;flex-direction:column;gap:10px">
    <textarea class="si" id="xhs_post" rows="5" style="resize:vertical;font-family:inherit;line-height:1.7" placeholder="分享此刻…"></textarea>
    <button class="shbtn p" onclick="submitXhsPost()">发布</button>
  </div>`);
}

function submitXhsPost(){
  const t=document.getElementById('xhs_post')?.value.trim();if(!t)return;
  initXhs();
  S.xhsPosts.push({id:'p'+rid(),user:'me',ts:Date.now(),text:t,likes:[],comments:[],myLiked:false});
  sv();cs();renderXhs();
  /* 幸村随机来点赞 */
  if(Math.random()<0.6){
    setTimeout(()=>{
      const p=S.xhsPosts.find(x=>x.user==='me'&&!x.likes.includes('yukimura'));
      if(p){p.likes.push('yukimura');sv();renderXhs();}
    },3000+Math.random()*5000);
  }
}

function getWorldBookText(){if(!S.worldEntries?.length)return'';return'【世界书·自定义设定】\n'+S.worldEntries.map(e=>e.title+'：'+e.content).join('\n');}

/* ══ 记忆库 ══ */
function renderMemoryEntries(){const el=document.getElementById('memoryEntries');if(!el)return;if(!S.memoryEntries?.length){el.innerHTML='<div style="text-align:center;padding:24px;color:var(--muted);font-size:13px">还没有日记<br/>写下你们的第一个故事吧 ✍️</div>';return;}const sorted=[...S.memoryEntries].sort((a,b)=>b.ts-a.ts);el.innerHTML=sorted.map((e,oi)=>{const i=S.memoryEntries.indexOf(e);return`<div style="background:white;border-radius:var(--r);overflow:hidden;box-shadow:var(--shadow);border:1px solid var(--border)"><div style="padding:10px 14px;border-bottom:1px solid var(--border);display:flex;align-items:center;justify-content:space-between"><div><div style="font-size:13px;font-weight:600">${esc(e.title)}</div><div style="font-size:10px;color:var(--muted);margin-top:2px">${new Date(e.ts).toLocaleDateString('zh-CN')} ${oi<5?'· ❤️ 幸村记得':'· 较早记忆'}</div></div><div style="display:flex;gap:8px"><button onclick="editMemEntry(${i})" style="font-size:12px;color:var(--p500);border:none;background:none;cursor:pointer;font-family:inherit">编辑</button><button onclick="deleteMemEntry(${i})" style="font-size:12px;color:var(--muted);border:none;background:none;cursor:pointer;font-family:inherit">删除</button></div></div><div style="padding:12px 14px;font-size:13px;line-height:1.75;white-space:pre-wrap">${esc(e.content)}</div></div>`;}).join('');}
function addMemoryEntry(){const today=new Date().toLocaleDateString('zh-CN',{month:'long',day:'numeric',weekday:'short'});os('写一篇日记',`<div style="display:flex;flex-direction:column;gap:10px"><div><div style="font-size:12px;color:var(--muted);margin-bottom:4px">标题</div><input class="si" id="me_t" placeholder="${today}"/></div><div><div style="font-size:12px;color:var(--muted);margin-bottom:4px">内容</div><textarea class="si" id="me_c" rows="7" style="resize:vertical;font-family:inherit;line-height:1.7" placeholder="今天和幸村…"></textarea></div><button class="shbtn p" onclick="saveMemEntry()">保存日记</button></div>`);}
function saveMemEntry(){const t=document.getElementById('me_t')?.value.trim();const c=document.getElementById('me_c')?.value.trim();if(!c){toast('请写点内容');return;}if(!S.memoryEntries)S.memoryEntries=[];S.memoryEntries.push({title:t||new Date().toLocaleDateString('zh-CN'),content:c,ts:Date.now()});sv();cs();renderMemoryEntries();toast('✅ 日记已保存，幸村会记得');}
function editMemEntry(i){const e=S.memoryEntries[i];os('编辑日记',`<div style="display:flex;flex-direction:column;gap:10px"><div><div style="font-size:12px;color:var(--muted);margin-bottom:4px">标题</div><input class="si" id="me_t2" value="${esc(e.title)}"/></div><div><div style="font-size:12px;color:var(--muted);margin-bottom:4px">内容</div><textarea class="si" id="me_c2" rows="7" style="resize:vertical;font-family:inherit;line-height:1.7">${esc(e.content)}</textarea></div><button class="shbtn p" onclick="updateMemEntry(${i})">保存</button></div>`);}
function updateMemEntry(i){const t=document.getElementById('me_t2')?.value.trim();const c=document.getElementById('me_c2')?.value.trim();if(!c)return;S.memoryEntries[i]={...S.memoryEntries[i],title:t,content:c};sv();cs();renderMemoryEntries();toast('✅ 已更新');}
function deleteMemEntry(i){if(!confirm('删除这篇日记？'))return;S.memoryEntries.splice(i,1);sv();renderMemoryEntries();}
function getMemoryLibText(){if(!S.memoryEntries?.length)return'';const r=[...S.memoryEntries].sort((a,b)=>b.ts-a.ts).slice(0,5);return'【记忆库·重要回忆，自然融入不要照本宣科】\n'+r.map(e=>e.title+'：'+e.content).join('\n');}
/* ══ 邮箱系统 ══ */
function renderMail(){
  const list=document.getElementById('mailList');if(!list)return;
  const aff=S.aff||0;
  if(!MAIL_THRESHOLDS.some(m=>aff>=m.lv)){
    list.innerHTML='<div style="text-align:center;padding:24px;color:var(--muted);font-size:13px">📭 暂无邮件<br/><span style="font-size:11px">和幸村提高好感度后会收到信件</span></div>';return;
  }
  list.innerHTML=MAIL_THRESHOLDS.map((m,i)=>{
    const unlocked=aff>=m.lv;
    return`<div style="background:white;border-radius:var(--r);overflow:hidden;box-shadow:var(--shadow);border:1px solid ${unlocked?'var(--border)':'#eee'};${unlocked?'cursor:pointer':'opacity:.5'}" ${unlocked?`onclick="openMailIdx(${i})"`:''}>
      <div style="padding:14px;display:flex;gap:12px;align-items:center">
        <div style="font-size:24px">${unlocked?'💌':'🔒'}</div>
        <div style="flex:1">
          <div style="font-size:13px;font-weight:600;${unlocked?'':'color:var(--muted)'}">${unlocked?m.subject:'好感 Lv'+m.lv+' 解锁'}</div>
          <div style="font-size:11px;color:var(--muted);margin-top:2px">${unlocked?'来自幸村精市':'继续提升好感度吧'}</div>
        </div>
        ${unlocked?'<span style="font-size:10px;color:var(--p400)">查看 ›</span>':''}
      </div>
    </div>`;
  }).join('');
}
function openMailIdx(i){
  const m=MAIL_THRESHOLDS[i];if(!m)return;
  os('💌 '+m.subject,`<div style="text-align:left">
    <div style="font-size:10px;color:var(--muted);margin-bottom:8px">From: 幸村精市 &lt;yukimura@rikkai.ac.jp&gt;</div>
    <div style="font-size:14px;line-height:1.85;color:var(--text)">${m.body.replace(/\n/g,'<br/>')}</div>
    <div style="text-align:right;margin-top:12px;font-size:11px;color:var(--muted);font-style:italic">— 幸村精市</div>
  </div>`);
}

