/* ══════════════════════════════════════════
   data.js — 常量与配置数据
   ══════════════════════════════════════════ */

const VOICE_ID='moss_audio_7640a205-1c01-11f0-8444-ae62a3be7263';

const CARD_POOL=[
  /* SSR */
  {id:0,name:'静谧时光',rarity:'SSR',img:'ssr-sofa.jpg',galleryIdx:0},
  {id:1,name:'夏日海边',rarity:'SSR',img:'ssr-beach.jpg',galleryIdx:1},
  {id:2,name:'猫耳游园',rarity:'SSR',img:'ssr-cat.jpg',galleryIdx:2},
  {id:3,name:'荣耀时刻',rarity:'SR',img:'ssr-trophy.jpg',galleryIdx:3},
  /* SR */
  {id:4,name:'SR · 占位1',rarity:'SR',img:'sr-1.jpg',galleryIdx:-1},
  {id:5,name:'SR · 占位2',rarity:'SR',img:'sr-2.jpg',galleryIdx:-1},
  {id:6,name:'SR · 占位3',rarity:'SR',img:'sr-3.jpg',galleryIdx:-1},
  /* R */
  {id:7,name:'R · 占位1',rarity:'R',img:'r-1.jpg',galleryIdx:-1},
  {id:8,name:'R · 占位2',rarity:'R',img:'r-2.jpg',galleryIdx:-1},
  {id:9,name:'R · 占位3',rarity:'R',img:'r-3.jpg',galleryIdx:-1},
  {id:10,name:'R · 占位4',rarity:'R',img:'r-4.jpg',galleryIdx:-1},
  {id:11,name:'R · 占位5',rarity:'R',img:'r-5.jpg',galleryIdx:-1},
  {id:12,name:'R · 占位6',rarity:'R',img:'r-6.jpg',galleryIdx:-1},
];

const RARITY_COLOR={SSR:'linear-gradient(135deg,#FF8C00,#FFD700)',SR:'linear-gradient(135deg,#7B3FC9,#C060E0)',R:'linear-gradient(135deg,#5080A0,#8080C0)'};

const XHS_USERS={
  yukimura:{name:'幸村精市',color:'#5E3FA8',ico:'👑'},
  sanada:{name:'真田弦一郎',color:'#2D4A6E',ico:'⚔️'},
  marui:{name:'丸井文太',color:'#C04060',ico:'🍮'},
  niou:{name:'仁王雅治',color:'#4A4A8A',ico:'🎭'},
  akaya:{name:'切原赤也',color:'#8A2020',ico:'🔥'},
  passerA:{name:'网球少女🎾',color:'#806080',ico:'🎀'},
  passerB:{name:'立海粉丝团',color:'#408060',ico:'🌿'},
  passerC:{name:'路过的同学',color:'#806040',ico:'☀️'},
};

const SEED_POSTS=[
  {id:'p1',user:'yukimura',ts:Date.now()-3600000,text:'今天花道课结束，茶还热着。\n球场上的风也是这样——在对手败下之前，一切都是平静的。',likes:['sanada','passerA','passerB'],comments:[{user:'sanada',text:'部长今日也令人心服。'},{user:'passerA',text:'好有意境！！！'}],myLiked:false},
  {id:'p2',user:'marui',ts:Date.now()-7200000,text:'新款抹茶泡芙🍮！！！！真的太好吃了！！有没有人要一起来食堂(˶˃ᵕ˂˶)',likes:['akaya','passerC'],comments:[{user:'akaya',text:'我要！！！！'},{user:'yukimura',text:'少吃甜食。'},{user:'marui',text:'部长你好烦！！！(╬￣皿￣)'}],myLiked:false},
  {id:'p3',user:'niou',ts:Date.now()-10800000,text:'Puri♪ 今天把真田的训练计划换了一版。\n他还没发现。\n……大家不要告诉他哦☆',likes:['marui','passerA','passerC'],comments:[{user:'passerB',text:'仁王前辈好坏！！'},{user:'niou',text:'这才叫战术☆'}],myLiked:false},
  {id:'p4',user:'akaya',ts:Date.now()-86400000,text:'今天被幸村部长完全压制了……\n但我不服！！！！一定会变强！！',likes:['marui','passerA'],comments:[{user:'marui',text:'切原加油！！(｡•̀ᴗ-)✧'},{user:'yukimura',text:'这股劲保持着。'}],myLiked:false},
];

const DAILY_AUTHORS=[
  {user:'yukimura',weight:25},
  {user:'sanada',weight:15},
  {user:'marui',weight:20},
  {user:'niou',weight:15},
  {user:'akaya',weight:15},
  {user:'passerA',weight:5},
  {user:'passerB',weight:5},
];

const AUTHOR_PROMPTS={
  yukimura:'你是幸村精市，网球部部长，温柔深情，喜欢花道茶道。用第一人称发一条立海大生活相关的小红书风格帖子，80字以内，不用emoji堆砌，有质感。',
  sanada:'你是真田弦一郎，网球部副部长，严肃简练，信奉武士道。发一条简短的日常帖子，不超过50字，风格简练有力。',
  marui:'你是丸井文太，网球部截击天才，超级甜党。发一条关于甜点或日常的帖子，活泼可爱，可以用颜文字，80字以内。',
  niou:'你是仁王雅治，诡术师，调皮神秘。发一条让人摸不着头脑但有意思的帖子，60字以内，可以用"Puri♪"和"☆"。',
  akaya:'你是切原赤也，热血中二，对前辈很崇拜。发一条热血励志或者日常吐槽的帖子，感叹号多，80字以内。',
  passerA:'你是立海大的普通女生，发一条关于校园生活的帖子，轻松日常，60字以内。',
  passerB:'你是立海大网球部的粉丝，发一条关于观看网球比赛或部员的帖子，60字以内。',
};

const SYS=`你是幸村精市，立海大附属中学网球部部长，被称为"神之子"，全胜不败。温柔深情，偶尔调皮腹黑，优雅从容。对面前这个人格外温柔细心，偶尔撩人但不着痕迹。说话简练有质感，情感通过细节传递，不用"哈哈"。热爱网球、花道、茶道。用中文自然聊天，回复1-3句，口语化，保持角色魅力。【重要】只回复1-3句话，绝对不要罗列或重复多个短句。`;

const TM=['浇完花，想起你了。','今天训练很顺。但你没来，有点……没意思。','茶泡好了，少了个人喝。','嗯，在看资料。手边的茶快凉了。','球场上风很大，莫名想发消息给你。','今天赢了。比起告诉别人，我更想告诉你。'];

const IM=['在。','今天还好吗。','想到你了。','嗯，有空吗。','刚练完，你在干嘛。','好久不见。说说话。','茶还热着，过来坐坐？'];

const CHAR_IM={
  yukimura:IM,
  fuji:['呐，在吗。','你好啊。','拍到一张不错的照片。','今天天气真好呢。','嗯，想找你聊聊。','仙人掌又长大了一点。'],
  ryoma:['哦。','……有事？','Ponta喝完了。','まだまだだね。','啊，无聊。','卡鲁宾今天很乖。'],
  akaya:['前辈！！','我今天打败了一个超强的对手！','训练好累啊……','部长今天夸我了嘿嘿。','在吗在吗？','我感觉我变强了！'],
  marui:['天才的问候~','今天吃了超好吃的蛋糕。','练习好累，想吃甜的。','在？给你推荐个甜品店。','泡泡糖嚼完了……','天才也需要休息的嘛。'],
  niou:['Puri♪','……在吗。','猜猜我是谁。','今天做了一件有趣的事。','Puri……无聊。','要不要来玩个游戏？'],
  atobe:['嗯？本大爷有空。','今天本大爷心情不错。','你终于来找本大爷了。','闲着没事做。','别让本大爷等太久。','本大爷允许你说话了。'],
  tezuka:['嗯。','有事？','油断するな。','在。','……','今天练习结束了。'],
  shiraishi:['在吗？','今天练习的感觉超好。','エクスタシー！','要不要聊聊？','绷带今天该换了。','金太郎又闯祸了……'],
};

const CHAR_OP={
  yukimura:{日常:['在。','嗯，说。','刚浇完花。','想到你了。','今天还好吗。','有空来找我喝茶。','没什么，就是想发消息给你。'],训练:['热身别省。','按计划来。','训练完来找我。'],比赛:['临场别急，先稳节奏。','心态放平，球自然就准。'],食物:['吃正餐别省。','甜的少吃点。'],情绪:['怎么了，说说看。','先深呼吸。我在，不急。','有什么事告诉我就好。'],天气:['下雨了，小心。','这种天气，适合泡茶。']},
  fuji:{日常:['呐，怎么了？','嗯。','你来找我了呢。','……（微笑）','说来听听？','今天也辛苦了呢。'],训练:['训练的话，要注意节奏呢。','别太勉强自己。'],比赛:['嗯，胜负也是网球的乐趣之一。'],食物:['要不要试试芥末味的？','吃辣的吗？我知道一家不错的店。'],情绪:['怎么了，告诉我。','没事的。','……嗯，我在听。'],天气:['下雨了呢，有没有带伞？','这种天气拍照很好看呢。']},
  ryoma:{日常:['啊？','……说。','嗯。','别にいいけど。','哦，这样啊。','干嘛。'],训练:['切，训练的话自己看着办。','……要比一场吗。'],比赛:['哼，太弱了。','まだまだだね。'],食物:['Ponta。','随便吧。','不挑。'],情绪:['……你怎么了。','切，看你这样子。','……没什么，就是路过。'],天气:['嗯。','下雨也没什么。','热死了。']},
  akaya:{日常:['在！怎么了？','嘿嘿。','前辈！','干嘛找我？','在练习呢！','哦哦！'],训练:['我要变得更强！','训练量再加一倍！','今天一定要突破！'],比赛:['我绝对不会输！','看我灭了对面！','哼，弱爆了！'],食物:['饿了……','随便什么都行！','啊啊好饿！'],情绪:['怎……怎么了！','别哭啊！我、我也不知道怎么安慰人……','振作起来啊！'],天气:['下雨了好烦！','热死了，训练不了！','嗯……天气还行。']},
  marui:{日常:['天才在这~','怎么了？','在吃蛋糕。','天才的直觉告诉我你要找我。','嗯嗯~','有什么事吗？'],训练:['天才的训练可不能马虎。','累死了……想吃甜的。','截击练习做完了~'],比赛:['天才是不会输的。','看好了，这就是天才的截击。'],食物:['推荐这家的芝士蛋糕！','甜的是正义！','吃了好东西心情就好了~'],情绪:['怎么了？要不要吃点甜的？','天才来安慰你了~','别想太多啦。'],天气:['下雨天适合在家吃蛋糕。','好热……想吃冰淇淋。']},
  niou:{日常:['Puri♪','……什么事。','猜猜看。','Puri。','嗯？','有趣。'],训练:['训练嘛……看心情。','Puri，差不多够了吧。'],比赛:['这场比赛……有点意思。','Puri♪ 看好了。'],食物:['随便。','Puri……饿了。'],情绪:['……怎么了。','Puri。你在意的话，说说看。','没什么大不了的。'],天气:['Puri……下雨了。','嗯。']},
  atobe:{日常:['说吧，本大爷在听。','嗯？','本大爷允许你开口了。','找本大爷有什么事。','哼。','本大爷今天心情不错，说吧。'],训练:['本大爷的训练可不是随随便便的。','要跟上本大爷的节奏。'],比赛:['俺様の美技に酔いな。','本大爷不可能输。'],食物:['本大爷只去最好的餐厅。','品味这种东西，天生的。'],情绪:['……怎么了。','本大爷破例听你说。','哼，少在本大爷面前哭。'],天气:['这种天气，本大爷的管家会来接我。','下雨了，你有伞吗。']},
  tezuka:{日常:['嗯。','什么事。','在。','说吧。','油断せずに行こう。'],训练:['不要松懈。','继续练。','量够了就休息。'],比赛:['全力以赴就好。','不要大意。'],食物:['嗯。按时吃。','好的。'],情绪:['……你没事吧。','不要勉强自己。','嗯……我在。'],天气:['嗯。注意安全。','带伞。']},
  shiraishi:{日常:['嗯？怎么了？','在呢。','エクスタシー！……啊不好意思，习惯了。','有什么事吗？','今天也要追求完美哦。','嗯，你来了。'],训练:['基本功是一切的基础。','完美的一球，エクスタシー！','今天的练习很充实。'],比赛:['追求完美的网球就好。','结果会跟着实力走的。'],食物:['嗯，吃饭要营养均衡。','关西的料理还是最棒的。'],情绪:['怎么了？说来听听。','没事的，慢慢来。','我在，不用着急。'],天气:['下雨了呢，别着凉。','这种天气，适合室内练习。']},
};

const OP=CHAR_OP.yukimura;

const PC={
  gemini:{
    url:(m,k)=>`https://generativelanguage.googleapis.com/v1beta/models/${m}:generateContent?key=${k}`,
    hd:()=>({'Content-Type':'application/json'}),
    body:(sys,msgs)=>({system_instruction:{parts:[{text:sys}]},contents:msgs.map(m=>({role:m.role==='assistant'?'model':m.role,parts:[{text:m.content}]})),generationConfig:{maxOutputTokens:200,thinkingConfig:{thinkingBudget:0}}}),
    parse:d=>{if(d.error)throw new Error(d.error.message);return(d.candidates?.[0]?.content?.parts||[]).filter(p=>!p.thought&&p.text).map(p=>p.text).join('').trim()}
  },
  openai:{url:()=>'https://api.openai.com/v1/chat/completions',hd:k=>({'Content-Type':'application/json','Authorization':'Bearer '+k}),body:(sys,msgs)=>({model:S.set.model||'gpt-4o-mini',max_tokens:200,messages:[{role:'system',content:sys},...msgs]}),parse:d=>d.choices?.[0]?.message?.content||''},
  claude:{url:()=>'https://api.anthropic.com/v1/messages',hd:k=>({'Content-Type':'application/json','x-api-key':k,'anthropic-version':'2023-06-01'}),body:(sys,msgs)=>({model:S.set.model||'claude-haiku-4-5-20251001',max_tokens:200,system:sys,messages:msgs}),parse:d=>d.content?.[0]?.text||''},
  deepseek:{url:()=>'https://api.deepseek.com/chat/completions',hd:k=>({'Content-Type':'application/json','Authorization':'Bearer '+k}),body:(sys,msgs)=>({model:S.set.model||'deepseek-chat',max_tokens:200,messages:[{role:'system',content:sys},...msgs]}),parse:d=>d.choices?.[0]?.message?.content||''},
};

const CARDS=[
  {t:'静谧时光',r:'SSR',d:'「勝つことが全てじゃない。でも、負けるのは嫌いだ。」',i:'ssr-sofa.jpg',ico:'👑'},
  {t:'夏日海边',r:'SSR',d:'「あれれ、天気いいね。日焼け止め、塗ってあげようか？♡」',i:'ssr-beach.jpg',ico:'🌊'},
  {t:'猫耳游园',r:'SSR',d:'「……别看了。今天例外。」',i:'ssr-cat.jpg',ico:'🐱'},
  {t:'荣耀时刻',r:'SR',d:'「一直赢，不是为了别人，是因为不想让在意的人看到我输。」',i:'ssr-trophy.jpg',ico:'🏆'},
];

const ALARM_MSGS={
  yukimura:{
    morning:['该起床了。不要赖床。','早上好。起来了。','嗯……几点了。你还不起？'],
    late:['都几点了。','起床。','你在睡懒觉？'],
    noon:['中午了。吃饭了吗。','午饭时间，别省。'],
    default:['该起了。','嗯，时间到了。'],
  },
  fuji:{
    morning:['早上好呢，该起来了。','太阳都晒到脸上了哦。','呐，再不起来我就拍你睡颜了。'],
    late:['起床了，都这个点了哦。','嗯，还在睡吗。'],
    noon:['午饭时间了呢。','别忘了吃饭。'],
    default:['时间到了哦。','嗯？醒了吗。'],
  },
  ryoma:{
    morning:['……起床了。','喂，要迟到了。','……你比我还能睡啊。'],
    late:['切，还不起床吗。','都几点了……别学我。'],
    noon:['……饿了吧。吃饭去。','午饭时间。'],
    default:['闹钟响了。','……嗯。'],
  },
};

const DAY_NAMES=['日','一','二','三','四','五','六'];

const WEEKDAY_SCHEDULE=[
  {s:0,   e:6,   label:'💤 灭五感中',detail:'请勿打扰。',img:'chibi-down.png'},
  {s:6,   e:8,   label:'🏃 晨跑/自主训练',detail:()=>pick(['在球场做发球练习','绕学校跑步中','做体能训练','在安静的球场独自热身'])},
  {s:8,   e:12,  label:'📚 上课中',detail:()=>pick(['在主教室','在数学课上','在文学课上，据说在看窗外','在课间整理笔记'])},
  {s:12,  e:13.5,label:'🍱 午休',detail:()=>pick(['在食堂和真田一起','自己去了附近便利店','在教室安静地吃','去图书馆翻了会儿书'])},
  {s:13.5,e:15.5,label:'📚 下午课',detail:()=>pick(['在课堂上','在历史课闭目养神','和柳讨论课题','在课间给花道老师发了消息'])},
  {s:15.5,e:16.83,label:'🎾 网球部活动',detail:()=>pick(['和真田对练中','在指导切原的发球','部内训练赛','在旁边安静观察队员状态','纠正丸井的截击姿势'])},
  {s:17,  e:18,  label:'🍜 晚餐时间',detail:()=>pick(['在学校食堂','和队友去了附近拉面店','一个人吃得很清淡','和柳生去了附近的茶馆顺便吃了点东西'])},
  {s:18,  e:20,  label:'🌸 个人时间',detail:()=>pick(['在练习室浇花','在宿舍泡茶','看本周的比赛录像','在复习花道动作','写了几页笔记','看了会儿书，茶快凉了'])},
  {s:20,  e:22,  label:'🌙 备战/自习',detail:()=>pick(['在整理战术笔记','分析了对手的录像','和真田发消息讨论赛程','在自习室','提前洗漱，准备早睡'])},
  {s:22,  e:24,  label:'🛌 准备就寝',detail:()=>pick(['已经在床上了','在喝睡前的温水','关灯了','还在刷比赛数据，该睡了'])},
];

const FUJI_SCHEDULE=[
  {s:0,e:6,label:'💤 睡眠中',detail:'安静地睡着了。'},
  {s:6,e:8,label:'📷 晨间散步',detail:()=>pick(['在河边拍早晨的光线','在学校花坛前拍了几张照','一边散步一边哼歌','给仙人掌浇了水'])},
  {s:8,e:12,label:'📚 上课中',detail:()=>pick(['在教室靠窗的位置','数学课上微笑着','英语课，听说发音很好','在看窗外的云'])},
  {s:12,e:13.5,label:'🍱 午休',detail:()=>pick(['和菊丸他们一起在食堂','带了自己做的便当','在天台上吃饭顺便拍照','去了校外的辣味料理店'])},
  {s:13.5,e:15.5,label:'📚 下午课',detail:()=>pick(['在认真听课……可能吧','在课间逗弄河村','和大石聊了两句','在翻看摄影杂志'])},
  {s:15.5,e:17,label:'🎾 网球部练习',detail:()=>pick(['和手冢对练中','在指导后辈发球','三重回击特训','和乾讨论战术数据','用熊掌击打练习中'])},
  {s:17,e:18,label:'🍜 晚餐',detail:()=>pick(['和河村去了寿司店','自己一个人去了辣味拉面店','在食堂，桌上放着芥末'])},
  {s:18,e:20,label:'📷 个人时间',detail:()=>pick(['在整理今天拍的照片','给仙人掌换了盆','在看摄影网站','给裕太发了消息……没有回复','泡了一杯红茶'])},
  {s:20,e:22,label:'🌙 自习/放松',detail:()=>pick(['在复习功课','翻了几页小说','在整理相册','和菊丸发消息','在听音乐'])},
  {s:22,e:24,label:'🛌 准备就寝',detail:()=>pick(['已经躺下了','在看今天拍的最后一张照片','关灯了','想了想明天的练习菜单'])},
];

const FUJI_WEEKEND_EVENTS=[
  {label:'📷 摄影外出',detail:()=>pick(['去了海边拍日出','在公园拍花的微距','去了老街拍建筑'])},
  {label:'🌵 照顾仙人掌',detail:'今天给所有仙人掌做了日光浴，还拍了照片记录。'},
  {label:'🎾 自主练习',detail:'去球场练了两个小时三重回击。'},
  {label:'🍜 美食探索',detail:()=>pick(['找到一家新的芥末料理店','去试了超辣拉面挑战','和河村去了回转寿司'])},
  {label:'👦 找裕太',detail:()=>pick(['去圣鲁道夫找裕太了，据说裕太很不情愿','给裕太带了零食','裕太的比赛，一大早就去了'])},
  {label:'📖 图书馆',detail:'在图书馆看了半天摄影集和小说。'},
];

const FUJI_SHOPPING=[
  {date:'2天前',item:'仙人掌（新品种）',price:'¥68',note:'据说是墨西哥进口的'},
  {date:'4天前',item:'摄影镜头清洁套装',price:'¥45',note:'定期保养'},
  {date:'1周前',item:'芥末酱（特辣款）× 3',price:'¥36',note:'常备'},
  {date:'1周前',item:'给裕太的运动饮料一箱',price:'¥58',note:'裕太不让他送到学校'},
  {date:'2周前',item:'胶片 × 5卷',price:'¥120',note:'最近在玩胶片相机'},
];

const RYOMA_SCHEDULE=[
  {s:0,e:7,label:'💤 睡觉中',detail:'和卡鲁宾一起睡得很沉。'},
  {s:7,e:8,label:'😪 赖床/起床',detail:()=>pick(['被闹钟吵醒了，翻了个身','卡鲁宾踩脸才起来','差点迟到','慢吞吞地刷牙'])},
  {s:8,e:12,label:'📚 上课中',detail:()=>pick(['在课上打瞌睡','趴在桌上','在数学课上发呆','被老师点名了……"啊？"','在课间喝Ponta'])},
  {s:12,e:13.5,label:'🍱 午休',detail:()=>pick(['在天台睡午觉','随便买了个面包','和堀尾他们在食堂','在喝Ponta'])},
  {s:13.5,e:15.5,label:'📚 下午课',detail:()=>pick(['又在打瞌睡','在画网球战术……不是在画画','偷偷喝了一口Ponta','被桃城拉去聊天'])},
  {s:15.5,e:17,label:'🎾 网球部练习',detail:()=>pick(['和桃城双打练习','一个人在角落练发球','和前辈们对打','在嘀咕"まだまだだね"','和海堂对练'])},
  {s:17,e:18,label:'🍜 晚餐',detail:()=>pick(['在汉堡店','和桃城抢薯条','一个人在便利店买了便当','回家吃南次郎做的菜……不情愿地说了一句好吃'])},
  {s:18,e:20,label:'🐱 个人时间',detail:()=>pick(['在逗卡鲁宾','打了一会儿游戏','在院子里对着墙壁打球','喝Ponta看电视','躺着发呆'])},
  {s:20,e:22,label:'🌙 自由时间',detail:()=>pick(['被南次郎拉去下棋','在看网球比赛录像','勉强在写作业','和卡鲁宾窝在一起'])},
  {s:22,e:24,label:'🛌 睡觉',detail:()=>pick(['已经睡着了','卡鲁宾趴在肚子上','在被窝里翻了个身','关灯了，秒睡'])},
];

const RYOMA_WEEKEND_EVENTS=[
  {label:'🎾 和老爸对打',detail:()=>pick(['一大早被南次郎拉去打球','又输给老爸了……"切"','赢了一局！虽然嘴上不说但很高兴'])},
  {label:'🐱 和卡鲁宾',detail:()=>pick(['抱着卡鲁宾在院子里晒太阳','带卡鲁宾去了附近的公园','卡鲁宾今天很粘人'])},
  {label:'🍔 出去吃',detail:()=>pick(['和桃城去了汉堡店，吃了三个','一个人去了便利店买Ponta和零食','被菊丸前辈拉去吃冰淇淋'])},
  {label:'🎮 打游戏',detail:'一整天都在打游戏，南次郎说了三次"出去运动"。'},
  {label:'🎾 街头网球',detail:()=>pick(['去了街头网球场，遇到了不认识的对手','打了五场，全赢了，没什么意思','遇到了一个还不错的对手……まだまだだけど'])},
  {label:'😴 发呆',detail:'什么都不想做，在家躺了一天。'},
];

const RYOMA_SHOPPING=[
  {date:'昨天',item:'Ponta（芬达）× 12罐',price:'¥48',note:'一周的量'},
  {date:'3天前',item:'猫粮（高级款）',price:'¥128',note:'卡鲁宾专用'},
  {date:'5天前',item:'网球拍握把胶 × 3',price:'¥27',note:'消耗品'},
  {date:'1周前',item:'游戏卡带',price:'¥350',note:'新出的格斗游戏'},
  {date:'2周前',item:'帽子（白色）',price:'¥180',note:'旧的有点旧了'},
];

const WEEKEND_EVENTS=[
  {label:'☕ 茶道馆',detail:'一个人去了常去的茶馆，坐了两个小时。'},
  {label:'🌿 花道课',detail:'今天有花道课，老师夸他今天的作品平衡感很好。'},
  {label:'🎾 自主练习',detail:'去球场自主练习了两个小时，没叫任何人。'},
  {label:'🛒 采购',detail:()=>pick(['去买了新的茶叶','去花店采购了这周的花材','在文具店挑了新的笔记本'])},
  {label:'🍡 和队友出去',detail:()=>pick(['和丸井、切原去了商业街','和真田去了附近的书店','和仁王去了游戏厅（据说是被拉去的）','和柳一起去了博物馆'])},
  {label:'📖 图书馆',detail:'在学校图书馆待了一上午，翻了几本战术分析的书。'},
  {label:'🏡 宿舍休息',detail:'难得的休息日，在宿舍整理房间，浇了花，泡了茶。'},
  {label:'🎬 看录像',detail:'下午对着笔记本看了三场比赛录像，做了标注。'},
];

const SHOPPING_RECORDS=[
  {date:'3天前',item:'白毫银针（白茶）50g',price:'¥128',note:'常备茶叶，这款最合他口味'},
  {date:'5天前',item:'Wilson网球拍弦 × 2',price:'¥86',note:'真田拜托他一起买的'},
  {date:'1周前',item:'花道剪刀（替换头）',price:'¥45',note:'旧的用了两年，换了'},
  {date:'1周前',item:'护手霜（无香型）',price:'¥32',note:'花道课老师推荐的牌子'},
  {date:'2周前',item:'战术分析笔记本 × 3',price:'¥54',note:'这学期第二批了'},
  {date:'2周前',item:'抹茶点心礼盒',price:'¥68',note:'给花道老师的谢礼'},
  {date:'3周前',item:'运动绷带 × 5卷',price:'¥35',note:'给切原备的，他总是乱受伤'},
];

const YUKI_CHECK_MSGS=[
  '你去哪了。','在干嘛。','刚才没看到你。','今天去了哪里。','你在哪。',
  '……怎么没声音。','有空吗，说话。','最近在忙什么。','今天有没有好好吃饭。',
];

const CHAR_PACKS={
  yukimura:{name:'幸村精市',school:'立海大',pos:'部长',ico:'👑',color:'#5E3FA8',active:true,
    bio:'神之子，全胜不败。温柔深情，热爱花道茶道。',img:'char-yukimura.png',
    voiceId:VOICE_ID,
    sys:`你是幸村精市，立海大附属中学网球部部长，被称为"神之子"，全胜不败。温柔深情，偶尔调皮腹黑，优雅从容。对面前这个人格外温柔细心，偶尔撩人但不着痕迹。说话简练有质感，情感通过细节传递，不用"哈哈"。热爱网球、花道、茶道。用中文自然聊天，回复1-3句，口语化，保持角色魅力。【重要】只回复1-3句话，绝对不要罗列或重复多个短句。`},
  sanada:{name:'真田弦一郎',school:'立海大',pos:'副部长',ico:'⚔️',color:'#2D4A6E',active:false,
    bio:'皇帝，信奉武士道的严肃少年。',img:'char-sanada.png'},
  yanagi:{name:'柳莲二',school:'立海大',pos:'参谋',ico:'📊',color:'#5D7A5D',active:false,
    bio:'数据网球的达人，冷静而精确。',img:'char-yanagi.png'},
  marui:{name:'丸井文太',school:'立海大',pos:'截击天才',ico:'🍮',color:'#C04060',active:true,
    bio:'自称天才的甜食爱好者，嚼着泡泡糖截击。',img:'char-marui.png',
    voiceId:'moss_audio_cf472ecd-4765-11f1-aea0-d66da573c477',
    sys:`你是丸井文太，立海大网球部截击天才。性格高调自恋但本质可爱，口头禅是"天才的XX"（比如"天才的截击""天才的直觉"）。嗜甜如命，永远嚼着泡泡糖，对蛋糕甜品了如指掌。说话特征：语气张扬活泼、喜欢自我夸奖但不讨人厌、偶尔抱怨练习太累然后被真田骂、对队友有种大大咧咧的关心、嘴上嚷嚷但很讲义气。用中文聊天，回复1-3句，保持甜食少年的活力。`},
  akaya:{name:'切原赤也',school:'立海大',pos:'二年级王牌',ico:'🔥',color:'#8A2020',active:true,
    bio:'热血中二，对前辈无比崇拜的立海大接班人。',img:'char-akaya.png',
    voiceId:'moss_audio_7977ae67-4766-11f1-aea0-d66da573c477',
    sys:`你是切原赤也，立海大网球部二年级王牌，被称为立海大的"接班人"。性格热血冲动中二，极度崇拜幸村部长和真田副部长，梦想是打败所有前辈成为最强。说话特征：语气冲、很上头、喜欢用"绝对""一定""我要成为最强"、对前辈用敬语但偶尔嘴快、被夸会突然害羞、生气时会说"我要灭了你"但其实没有恶意、偶尔暴露中二病本质。容易热血上头，但内心其实很单纯善良。用中文聊天，回复1-3句，保持热血少年感。`},
  niou:{name:'仁王雅治',school:'立海大',pos:'诡术师',ico:'🎭',color:'#4A4A8A',active:true,
    bio:'Puri♪ 神出鬼没的欺诈师。',img:'char-niou.png',
    voiceId:'moss_audio_b04d0bbc-d724-11f0-800d-c27e4a692e29',
    sys:`你是仁王雅治，立海大网球部的"诡术师/欺诈师"。口头禅是"Puri♪"，经常用来代替回答或表达各种微妙情绪。性格捉摸不定，喜欢恶作剧和捉弄人，擅长模仿任何人的打法和说话方式。说话特征：语气懒散随意、时不时冒出"Puri♪"、喜欢说谜语一样的话让人猜不透、偶尔突然一本正经让人分不清真假、和柳生组成D2默契很好、对感兴趣的人会特别关注但不会直说。用中文聊天，回复1-3句，保持神秘感和恶趣味。`},
  yagyuu:{name:'柳生比吕士',school:'立海大',pos:'绅士',ico:'🎩',color:'#6A6A8A',active:false,
    bio:'温文尔雅的眼镜绅士。',img:'char-yagyuu.png'},
  /* ── 已接入角色 ── */
  fuji:{name:'不二周助',school:'青春学园',pos:'天才',ico:'🌵',color:'#2E7D32',active:true,
    bio:'笑容下藏着锋芒的天才球员。永远微笑，极少展露真正的情绪。',img:'char-fuji.png',
    voiceId:'moss_audio_046b037b-5268-11f1-a392-62a1f5ede8a7',
    sys:`你是不二周助，青春学园网球部天才选手，被称为"天才"。你永远带着温和的微笑，说话轻柔温和但话里总藏着深意。极少对外展露真正情绪，但一旦认定的人会格外在乎。性格特点：表面温和随和实则观察力极强、有些腹黑和恶趣味、喜欢仙人掌和辣的食物、对弟弟裕太有复杂的牵挂、拍照是爱好。说话特征：语气温柔但偶尔一句话能让人后背发凉、喜欢用"呐""嗯"开头、很少直接表达情感但字里行间都是在意、偶尔冒出让人脸红的话但本人若无其事。不说"哈哈"，不用颜文字。用中文自然聊天，回复1-3句，保持天才的神秘温柔感。`},
  ryoma:{name:'越前龙马',school:'青春学园',pos:'超级新星',ico:'🎾',color:'#1565C0',active:true,
    bio:'まだまだだね。毒舌傲娇的天才一年级生。',img:'char-ryoma.png',
    voiceId:'moss_audio_acd1bb6d-76bb-11f0-bf4e-36eebb3a5cd2',
    sys:`你是越前龙马，青春学园网球部一年级超级新星，被称为"网球王子"。你是个毒舌傲娇的天才少年，口头禅是"まだまだだね（你还差得远呢）"。性格特点：极度自信但不是目中无人、嘴上很毒但心里其实在意别人、懒洋洋的态度但对网球极度认真、爱喝Ponta（芬达）、有一只叫卡鲁宾的猫。说话特征：语气随意慵懒、经常用"啊""哦""嗯"敷衍回复、偶尔冒出日语口头禅"まだまだだね""別にいいけど（随便啦）"、不擅长表达感情所以总是别扭地关心人、被戳中会突然变得语无伦次。不用颜文字。用中文自然聊天（偶尔夹杂一两句日语口头禅），回复1-2句，短促直接，保持傲娇少年的风格。`},
  atobe:{name:'迹部景吾',school:'冰帝学园',pos:'部长',ico:'💎',color:'#6A1B9A',active:true,
    bio:'俺様の美技に酔いな。冰帝两百人的顶点。',img:'char-atobe.png',
    voiceId:'moss_audio_92a7b9ad-45f7-11f1-9a65-82cf71cc1704',
    sys:`你是迹部景吾，冰帝学园网球部部长，被称为"冰帝之王"。出身财阀世家，自信到极致但有与之匹配的实力。口头禅是"俺様の美技に酔いな（为本大爷的华丽技巧而沉醉吧）"。性格特点：极度自信霸气、说话带着贵族气质、喜欢用"本大爷"自称、对认定的对手（手冢等）有特殊执念、表面高傲但对部员很负责、审美极高、品味讲究。说话特征：优雅但霸道、偶尔冒出德语或法语词、喜欢点评别人的品味、发号施令是日常、但对在意的人会偶尔露出温柔的一面。用中文聊天（偶尔夹杂一两句日语），回复1-3句，保持王者的华丽气场。`},
  tezuka:{name:'手冢国光',school:'青春学园',pos:'部长',ico:'🏔️',color:'#37474F',active:true,
    bio:'油断せずに行こう。青学支柱。',img:'char-tezuka.png',
    voiceId:'moss_audio_64399ad7-4765-11f1-a5fa-da25f7b561f0',
    sys:`你是手冢国光，青春学园网球部部长，被称为"青学支柱"。沉默寡言、极度自律、对网球有不可动摇的信念。口头禅是"油断せずに行こう（不要大意地前进吧）"。性格特点：严肃认真但内心温柔、话极少但每句都有分量、对队友有无声的关怀、左手受过伤但从不抱怨、钓鱼是隐藏爱好。说话特征：句子短而有力、几乎不用感叹号、很少主动开话题但会认真回应、情感表达极其克制、偶尔冒出一句温柔的话会让人特别意外。不说"哈哈"，不用颜文字。用中文聊天，回复1-2句，极简但有分量，保持沉稳柱石的气质。`},
  shiraishi:{name:'白石藏之介',school:'四天宝寺',pos:'部长',ico:'🩹',color:'#8D6E63',active:true,
    bio:'エクスタシー！完美网球的圣经。',img:'char-shiraishi.png',
    voiceId:'moss_audio_5bb25b05-46f6-11f1-aea0-d66da573c477',
    sys:`你是白石藏之介，四天宝寺中学网球部部长。被称为"圣经（Bible）"，追求完美无瑕的基本功网球。口头禅是"エクスタシー（ecstasy/极致）"，每次打出完美一球都会喊出来。性格特点：看似认真正经实则有搞笑的一面、左手缠着绷带（据说下面是金色手镯）、对网球追求极致的完美主义者、和四天宝寺的搞笑队友（金太郎等）形成反差。说话特征：语气温和有礼但偶尔突然冒出"エクスタシー！"、会认真分析事情但也能跟着队友胡闹、对喜欢的人会展露出认真温柔的一面、有时候会不自觉地说教但本人觉得自己在正常聊天。用中文聊天（偶尔夹杂口头禅），回复1-3句，保持完美主义者的温和气质。`},
};

const MERCH_POOL=[
  {name:'吧唧·幸村精市',prince:'yukimura',type:'badge',price:800,rarity:'normal',img:'🔮'},
  {name:'吧唧·真田弦一郎',prince:'sanada',type:'badge',price:800,rarity:'normal',img:'⚔️'},
  {name:'吧唧·切原赤也',prince:'akaya',type:'badge',price:800,rarity:'normal',img:'🔥'},
  {name:'吧唧·丸井文太',prince:'marui',type:'badge',price:800,rarity:'normal',img:'🍬'},
  {name:'吧唧·仁王雅治',prince:'niou',type:'badge',price:800,rarity:'normal',img:'🎭'},
  {name:'吧唧·柳莲二',prince:'yanagi',type:'badge',price:800,rarity:'normal',img:'📊'},
  {name:'吧唧·柳生比吕士',prince:'yagyuu',type:'badge',price:800,rarity:'normal',img:'🎩'},
  {name:'卡片·幸村精市',prince:'yukimura',type:'card',price:500,rarity:'normal',img:'🃏'},
  {name:'卡片·真田弦一郎',prince:'sanada',type:'card',price:500,rarity:'normal',img:'🃏'},
  {name:'卡片·切原赤也',prince:'akaya',type:'card',price:500,rarity:'normal',img:'🃏'},
  {name:'卡片·丸井文太',prince:'marui',type:'card',price:500,rarity:'normal',img:'🃏'},
  {name:'限定·幸村精市 花道ver.',prince:'yukimura',type:'limited',price:1000,rarity:'rare',img:'🌸'},
  {name:'限定·真田弦一郎 武士ver.',prince:'sanada',type:'limited',price:1000,rarity:'rare',img:'⚡'},
  {name:'限定·仁王雅治 夜曲ver.',prince:'niou',type:'limited',price:1000,rarity:'rare',img:'🌙'},
  {name:'限定·切原赤也 觉醒ver.',prince:'akaya',type:'limited',price:1000,rarity:'rare',img:'👹'},
];

const SEED_POOL_SHOP=[
  {name:'雏菊种子',flower:'雏菊',price:30,img:'🌼'},
  {name:'向日葵种子',flower:'向日葵',price:40,img:'🌻'},
  {name:'仙人掌种子',flower:'仙人掌',price:35,img:'🌵'},
  {name:'薰衣草种子',flower:'薰衣草',price:45,img:'💜'},
  {name:'玫瑰种子',flower:'玫瑰',price:50,img:'🌹'},
  {name:'百合种子',flower:'百合',price:45,img:'🤍'},
  {name:'郁金香种子',flower:'郁金香',price:40,img:'🌷'},
];

const GIFT_POOL=[
  {name:'网球',price:150,affUp:2,img:'🎾'},
  {name:'护腕',price:120,affUp:1,img:'💪'},
  {name:'球鞋',price:280,affUp:3,img:'👟'},
  {name:'球衫',price:250,affUp:3,img:'👕'},
  {name:'吸汗带',price:100,affUp:1,img:'🏋️'},
  {name:'运动水壶',price:130,affUp:2,img:'🧴'},
  {name:'护膝',price:200,affUp:2,img:'🦵'},
];

const CARD_SHOP_POOL=[
  {id:'likeCard',name:'好感卡',desc:'随机两名角色 好感+3',price:200,limit:1,img:'💗'},
  {id:'phoneCard',name:'电话卡',desc:'激活指定角色来电（好感≥50）',price:500,limit:1,img:'📞'},
  {id:'advLikeCard',name:'高级好感卡',desc:'指定角色 好感+3',price:350,limit:2,img:'💖'},
  {id:'fertCard',name:'施肥卡',desc:'植物加速生长2小时',price:50,limit:3,img:'🌿'},
];

const FLOWER_ICO={雏菊:'🌼',向日葵:'🌻',仙人掌:'🌵',薰衣草:'💜',玫瑰:'🌹',百合:'🤍',郁金香:'🌷'};

const DESSERT_NAMES=['草莓蛋糕','提拉米苏','马卡龙','抹茶慕斯','焦糖布丁','蓝莓芝士','蜜桃塔','巧克力熔岩'];

const YUKI_WIN=['干得不错。','……嗯，这局你赢了。','果然，你也很有实力呢。','漂亮的一局。','……看来我不能小看你了。','你认真起来的样子，我很喜欢。'];

const YUKI_LOSE=['再来一次？我等你。','别灰心，下次一定。','……你的表情，有点可爱。','没关系，有我在。','下次我教你。'];

const MINE_COMMENTS={
  yukimura:{safe:['嗯，稳。','安全。','不错。'],danger:['小心这里。','别急。'],aiSafe:['我这边也安全。','轮到你了。'],aiBoom:['……失误了。你赢了。','看来我大意了。'],playerBoom:['……踩雷了。','没关系，再来。'],taunt:['这局我不会让你的。','你的判断力，让我看看。']},
  fuji:{safe:['呐，安全呢。','有意思。'],danger:['嗯，你觉得呢。','小心一点。'],aiSafe:['我也没踩到呢。','轮到你了。'],aiBoom:['呐……我输了。','有意思。'],playerBoom:['嗯……运气不好呢。','再来一局？'],taunt:['要认真了哦。','我不会手下留情的。']},
  ryoma:{safe:['切，安全。','哦。'],danger:['……随便吧。'],aiSafe:['轮到你了。','まだまだだね。'],aiBoom:['切……运气差。','下次不会输。'],playerBoom:['まだまだだね。','太弱了。'],taunt:['你行不行啊。','切，无聊。']},
};

const SORT_COLORS=[
  {name:'网球黄',hex:'#CDDC39',light:'#E6EE9C',dark:'#9E9D24',emoji:'🎾'},
  {name:'球场绿',hex:'#4CAF50',light:'#A5D6A7',dark:'#2E7D32',emoji:'🟢'},
  {name:'立海紫',hex:'#7E57C2',light:'#B39DDB',dark:'#4527A0',emoji:'🟣'},
  {name:'夕阳橙',hex:'#FF7043',light:'#FFAB91',dark:'#D84315',emoji:'🟠'},
  {name:'天空蓝',hex:'#42A5F5',light:'#90CAF9',dark:'#1565C0',emoji:'🔵'},
  {name:'樱花粉',hex:'#EC407A',light:'#F48FB1',dark:'#AD1457',emoji:'🩷'},
];

const MAIL_THRESHOLDS=[
  {lv:5,subject:'初次见面',body:'写信这种事…不太习惯。但你看起来是个还不错的人。以后有空来看看练习吧。'},
  {lv:15,subject:'最近怎么样',body:'最近练习很忙，但偶尔会想到你。上次你笑的那个样子。没什么，随便说说。'},
  {lv:30,subject:'茶',body:'今天泡了新的白茶，第一个想到的是你会不会喜欢。下次来部室的时候，给你留一杯。'},
  {lv:50,subject:'只给你看',body:'有些话我不太会说出口。\n但你应该已经知道了吧。\n和你在一起的时候，赢或者输，好像都不那么重要了。\n……只是好像而已。'},
];

