/**
 * Yu-Gi-Oh! 決鬥者卡片效果檢索 & 線上演牌工具
 * 核心應用程式邏輯 (app.js)
 */

(function () {
  'use strict';

  // ================= 1. 常數與位元遮罩定義 =================
  const TYPE_MONSTER = 0x1;
  const TYPE_SPELL = 0x2;
  const TYPE_TRAP = 0x4;
  const TYPE_NORMAL = 0x10;
  const TYPE_EFFECT = 0x20;
  const TYPE_FUSION = 0x40;
  const TYPE_RITUAL = 0x80;
  const TYPE_TRAPMONSTER = 0x100;
  const TYPE_SPIRIT = 0x200;
  const TYPE_UNION = 0x400;
  const TYPE_DUAL = 0x800;
  const TYPE_TUNER = 0x1000;
  const TYPE_SYNCHRO = 0x2000;
  const TYPE_TOKEN = 0x4000;
  const TYPE_QUICKPLAY = 0x10000;
  const TYPE_CONTINUOUS = 0x20000;
  const TYPE_EQUIP = 0x40000;
  const TYPE_FIELD = 0x80000;
  const TYPE_COUNTER = 0x100000;
  const TYPE_FLIP = 0x200000;
  const TYPE_TOON = 0x400000;
  const TYPE_XYZ = 0x800000;
  const TYPE_PENDULUM = 0x1000000;
  const TYPE_SPSUMMON = 0x2000000;
  const TYPE_LINK = 0x4000000;

  const ATTRIBUTES = {
    0x01: { zh_cn: '地', zh_tw: '地', en: 'EARTH', color: '#a16207', key: 'EARTH' },
    0x02: { zh_cn: '水', zh_tw: '水', en: 'WATER', color: '#0284c7', key: 'WATER' },
    0x04: { zh_cn: '炎', zh_tw: '炎', en: 'FIRE', color: '#ea580c', key: 'FIRE' },
    0x08: { zh_cn: '风', zh_tw: '風', en: 'WIND', color: '#059669', key: 'WIND' },
    0x10: { zh_cn: '光', zh_tw: '光', en: 'LIGHT', color: '#eab308', key: 'LIGHT' },
    0x20: { zh_cn: '暗', zh_tw: '暗', en: 'DARK', color: '#8b5cf6', key: 'DARK' },
    0x40: { zh_cn: '神', zh_tw: '神', en: 'DIVINE', color: '#d97706', key: 'DIVINE' }
  };

  const RACES = {
    0x1: { zh_cn: '战士', zh_tw: '戰士', en: 'Warrior' },
    0x2: { zh_cn: '魔法师', zh_tw: '魔法使', en: 'Spellcaster' },
    0x4: { zh_cn: '天使', zh_tw: '天使', en: 'Fairy' },
    0x8: { zh_cn: '恶魔', zh_tw: '惡魔', en: 'Fiend' },
    0x10: { zh_cn: '不死', zh_tw: '不死', en: 'Zombie' },
    0x20: { zh_cn: '机械', zh_tw: '機械', en: 'Machine' },
    0x40: { zh_cn: '水', zh_tw: '水', en: 'Aqua' },
    0x80: { zh_cn: '炎', zh_tw: '炎', en: 'Pyro' },
    0x100: { zh_cn: '岩石', zh_tw: '岩石', en: 'Rock' },
    0x200: { zh_cn: '鸟兽', zh_tw: '鳥獸', en: 'Winged Beast' },
    0x400: { zh_cn: '植物', zh_tw: '植物', en: 'Plant' },
    0x800: { zh_cn: '昆虫', zh_tw: '昆蟲', en: 'Insect' },
    0x1000: { zh_cn: '雷', zh_tw: '雷', en: 'Thunder' },
    0x2000: { zh_cn: '龙', zh_tw: '龍', en: 'Dragon' },
    0x4000: { zh_cn: '兽', zh_tw: '獸', en: 'Beast' },
    0x8000: { zh_cn: '兽战士', zh_tw: '獸戰士', en: 'Beast-Warrior' },
    0x10000: { zh_cn: '恐龙', zh_tw: '恐龍', en: 'Dinosaur' },
    0x20000: { zh_cn: '鱼', zh_tw: '魚', en: 'Fish' },
    0x40000: { zh_cn: '海龙', zh_tw: '海龍', en: 'Sea Serpent' },
    0x80000: { zh_cn: '爬虫类', zh_tw: '爬蟲類', en: 'Reptile' },
    0x100000: { zh_cn: '念动力', zh_tw: '念動力', en: 'Psychic' },
    0x200000: { zh_cn: '幻神兽', zh_tw: '幻神獸', en: 'Divine-Beast' },
    0x400000: { zh_cn: '创造神', zh_tw: '創造神', en: 'Creator God' },
    0x800000: { zh_cn: '幻龙', zh_tw: '幻龍', en: 'Wyrm' },
    0x1000000: { zh_cn: '电子界', zh_tw: '電子界', en: 'Cyberse' },
    0x2000000: { zh_cn: '幻想魔', zh_tw: '幻想魔', en: 'Illusionist' }
  };

  // ================= 2. 簡繁轉換辭典 (含遊戲王專有名詞與台灣慣用語) =================
  const YGO_S2T_DICT = [
    // 專有名詞高優先級匹配
    ['额外卡组', '額外牌組'],
    ['主卡组', '主牌組'],
    ['卡组', '牌組'],
    ['手卡', '手牌'],
    ['同调召唤', '同步召喚'],
    ['同调怪兽', '同步怪獸'],
    ['同调', '同步'],
    ['调整怪兽', '協調怪獸'],
    ['调整', '協調'],
    ['超量召唤', '超量召喚'],
    ['超量怪兽', '超量怪獸'],
    ['超量素材', '超量素材'],
    ['连接召唤', '連結召喚'],
    ['连接怪兽', '連結怪獸'],
    ['连接箭头', '連結箭頭'],
    ['连接', '連結'],
    ['灵摆召唤', '靈擺召喚'],
    ['灵摆怪兽', '靈擺怪獸'],
    ['灵摆刻度', '靈擺刻度'],
    ['灵摆区域', '靈擺區域'],
    ['灵摆效果', '靈擺效果'],
    ['灵摆', '靈擺'],
    ['盖放', '覆蓋'],
    ['里侧表示', '裡側表示'],
    ['里侧守备表示', '裡側守備表示'],
    ['表侧表示', '表側表示'],
    ['表侧攻击表示', '表側攻擊表示'],
    ['表侧守备表示', '表側守備表示'],
    ['怪兽', '怪獸'],
    ['墓地', '墓地'],
    ['破坏', '破壞'],
    ['特殊召唤', '特殊召喚'],
    ['通常召唤', '通常召喚'],
    ['反转召唤', '反轉召喚'],
    ['攻击力', '攻擊力'],
    ['守备力', '守備力'],
    ['魔法卡', '魔法卡'],
    ['陷阱卡', '陷阱卡'],
    ['速攻魔法', '速攻魔法'],
    ['永续魔法', '永續魔法'],
    ['永续陷阱', '永續陷阱'],
    ['装备魔法', '裝備魔法'],
    ['场地魔法', '場地魔法'],
    ['反击陷阱', '反擊陷阱'],
    ['仪式召唤', '儀式召喚'],
    ['融合召唤', '融合召喚'],
    ['衍生物', '衍生物'],
    ['指示物', '指示物'],
    ['决斗', '決鬥'],
    ['回合', '回合'],
    ['无效', '無效'],
    ['抽卡', '抽牌'],
    ['抽1张', '抽1張'],
    ['抽2张', '抽2張'],
    ['检索', '檢索'],
    ['洗切', '洗牌'],
    ['洗牌', '洗牌'],
    ['这个卡名', '此卡名'],
    ['这张卡', '這張卡'],
    ['那张卡', '那張卡'],
    ['对方场上', '對方場上'],
    ['自己场上', '自己場上'],
    ['不能特殊召唤', '不能特殊召喚'],
    ['不能发动', '不能發動'],
    ['除外', '除外'],
    ['送去墓地', '送去墓地'],
    ['送入墓地', '送入墓地'],
    ['丢弃', '捨棄'],
    ['伤害步骤', '傷害步驟'],
    ['战斗阶段', '戰鬥階段'],
    ['主要阶段', '主要階段'],
    ['结束阶段', '結束階段'],
    ['准备阶段', '準備階段'],
    ['灰流丽', '灰流麗'],
    ['增殖的G', '增殖的Ｇ'],
    ['青眼白龙', '青眼白龍'],
    ['黑魔术师', '黑魔導'],
    ['真红眼黑龙', '真紅眼黑龍'],
    ['奥西里斯之天空龙', '歐西里斯的天空龍'],
    ['欧贝利斯克之巨神兵', '歐貝利斯克的巨神兵'],
    ['拉之翼神龙', '太陽神的翼神龍'],
    ['星尘龙', '星塵龍'],
    ['希望皇 霍普', '希望皇 霍普'],
    ['异色眼灵摆龙', '異色眼靈擺龍'],
    ['防火龙', '防火龍'],
    ['俱舍怒威族', '俱舍怒威族'],
    ['珠泪哀歌族', '珠淚哀歌族'],
    ['闪刀姬', '閃刀姬'],
    ['闪刀起动', '閃刀起動'],
    ['鹰身女妖的羽毛扫', '神鷹女郎的羽毛掃'],
    ['羽毛扫', '羽毛掃'],
    ['死者苏生', '死者甦醒'],
    ['旋风', '旋風'],
    ['雷击', '雷擊'],
    ['无限泡影', '無限泡影'],
    ['墓穴的指名者', '墓穴的指名者'],
    ['抹杀之指名者', '抹殺之指名者'],
    ['禁忌的一滴', '禁忌的一滴'],
    ['原始生命态 尼比鲁', '原始生命態 尼比魯'],
    ['三战之才', '三戰之才'],
    ['三战之号', '三戰之號'],
    ['访问码语者', '連碼語者'],
    ['天霆号 阿宙斯', '天霆號 阿宙斯'],
    ['赐炎之咎姬', '賜炎之咎姬'],
    ['鲜花女男爵', '鮮花女男爵'],
    ['闭锁世界的冥神', '閉鎖世界的冥神'],
    ['召命之神弓', '召命之神弓'],
    ['小夜骑士', '小夜騎士'],
    ['冰剑龙 幻冰龙', '冰劍龍 幻冰龍'],
    ['神圣防护罩 -反射镜力-', '神聖防護罩 -反射鏡力-'],
    ['光之护封剑', '光之護封劍'],
    ['强欲而贪欲之壶', '強欲而貪欲之壺'],
    ['金满而谦虚之壶', '金滿而謙虛之壺'],
    ['神之宣告', '神之宣告'],
    ['超融合', '超融合'],
    ['罪宝', '罪寶'],
    ['蛇眼', '蛇眼'],
    ['白银之城', '白銀之城'],
    ['白银', '白銀'],
    ['天杯龙', '天盃龍'],
    ['闪刀姬', '閃刀姬'],
    ['闪刀', '閃刀'],
    ['珠泪哀歌族', '珠淚哀歌族'],
    ['俱舍怒威族', '俱舍怒威族'],
    ['超重武者', '超重武者'],
    ['转生炎兽', '轉生炎獸'],
    ['码语者', '碼語者'],
    ['皮尔莉', '皮爾莉'],
    ['相剑', '相劍'],
    ['冰结界', '冰結界'],
    ['斩机', '斬機'],
    ['魔女术', '魔女術'],
    ['半龙女仆', '半龍女僕'],
    ['幻影骑士团', '幻影騎士團'],
    ['急袭猛禽', '急襲猛禽'],
    ['幻惑之绮罗星', '幻惑之綺羅星'],
    ['幻惑的绮罗星', '幻惑的綺羅星'],
    ['光与暗的仪式', '光與暗的儀式'],
    ['光与暗之仪式', '光與暗之儀式'],
    ['光与暗之战士 混沌战士', '光與暗之戰士 混沌戰士'],
    ['光与暗的战士 混沌战士', '光與暗的戰士 混沌戰士'],
    ['光与暗之洗礼', '光與暗之洗禮'],
    ['光与暗之龙', '光與暗之龍'],
    ['光与暗之龙王', '光與暗之龍王'],
    ['黑色混沌之魔术师 黑混沌', '黑色混沌之魔術師 黑混沌'],
    ['栗球兽卫', '栗球獸衛'],
    ['混沌之魔王-骸骨恶魔', '混沌的魔王-骷髏惡魔'],
    ['混沌之魔王－骷髅恶魔', '混沌的魔王-骷髏惡魔'],
    ['混沌的魔王-骸骨恶魔', '混沌的魔王-骷髏惡魔'],
    ['混沌之魔王-骷髅恶魔', '混沌的魔王-骷髏惡魔']
  ];

  // 常見簡轉繁單字對照表 (確保離線或未加載 OpenCC 時也能優雅轉換)
  const CHAR_S2T = {
    '与': '與', '仪': '儀', '礼': '禮', '卫': '衛', '球': '球', '闇': '暗',
    '绮': '綺', '罗': '羅', '星': '星', '惑': '惑', '幻': '幻', '梦': '夢', '辉': '輝', '拟': '擬',
    '宝': '寶', '银': '銀', '壶': '壺', '猎': '獵', '灵': '靈', '圣': '聖', '导': '導', '异': '異', '灾': '災', '祸': '禍', '狱': '獄', '灭': '滅', '绝': '絕', '阵': '陣', '剑': '劍', '界': '界', '斩': '斬', '仆': '僕', '骑': '騎', '团': '團', '袭': '襲', '禽': '禽', '转': '轉', '炎': '炎', '码': '碼', '语': '語', '闪': '閃', '泪': '淚', '杯': '盃', '龙': '龍', '风': '風', '鸟': '鳥', '鱼': '魚', '战': '戰', '术': '術', '师': '師', '兽': '獸', '虫': '蟲', '恶': '惡', '魔': '魔',
    '电': '電', '机': '機', '械': '械', '龟': '龜', '变': '變', '点': '點', '发': '發', '动': '動', '时': '時', '间': '間', '关': '關',
    '开': '開', '门': '門', '页': '頁', '头': '頭', '类': '類', '线': '線', '组': '組', '结': '結', '构': '構', '现': '現', '实': '實',
    '联': '聯', '声': '聲', '语': '語', '说': '說', '话': '話', '读': '讀', '书': '書', '记': '記', '认': '認', '让': '讓', '设': '設',
    '计': '計', '议': '議', '证': '證', '试': '試', '调': '調', '质': '質', '资': '資', '费': '費', '胜': '勝', '负': '負', '败': '敗',
    '选': '選', '择': '擇', '运': '運', '连': '連', '进': '進', '过': '過', '达': '達', '还': '還', '这': '這', '进': '進', '远': '遠',
    '边': '邊', '遗': '遺', '阶': '階', '级': '級', '队': '隊', '阳': '陽', '阶': '階', '际': '際', '陆': '陸', '险': '險', '随': '隨',
    '隐': '隱', '只': '只', '两': '兩', '严': '嚴', '丰': '豐', '临': '臨', '为': '為', '丽': '麗', '举': '舉', '么': '麼', '义': '義',
    '乐': '樂', '乔': '喬', '习': '習', '乡': '鄉', '买': '買', '乱': '亂', '争': '爭', '产': '產', '亲': '親', '亿': '億', '优': '優',
    '伤': '傷', '体': '體', '余': '餘', '侠': '俠', '传': '傳', '伪': '偽', '价': '價', '众': '眾', '会': '會', '伟': '偉', '传': '傳',
    '仓': '倉', '伤': '傷', '伦': '倫', '侦': '偵', '伪': '偽', '侧': '側', '侨': '僑', '侪': '儕', '侬': '儂', '俊': '俊', '俗': '俗',
    '俘': '俘', '保': '保', '俞': '俞', '俟': '俟', '侠': '俠', '信': '信', '修': '修', '俨': '儼', '俩': '倆', '俪': '儷', '俭': '儉',
    '债': '債', '倾': '傾', '假': '假', '偈': '偈', '偌': '偌', '偎': '偎', '偏': '偏', '偕': '偕', '做': '做', '停': '停', '健': '健',
    '侧': '側', '侦': '偵', '偶': '偶', '偷': '偷', '偻': '僂', '伪': '偽', '储': '儲', '催': '催', '佣': '傭', '傲': '傲', '传': '傳',
    '儿': '兒', '兑': '兌', '党': '黨', '兰': '蘭', '关': '關', '兴': '興', '兹': '茲', '养': '養', '兽': '獸', '冁': '囅', '内': '內',
    '冈': '岡', '册': '冊', '军': '軍', '农': '農', '冠': '冠', '冢': '塚', '冬': '冬', '冰': '冰', '冷': '冷', '准': '準', '冻': '凍',
    '凛': '凜', '凝': '凝', '几': '幾', '凤': '鳳', '凯': '凱', '击': '擊', '函': '函', '凿': '鑿', '划': '劃', '创': '創', '初': '初',
    '利': '利', '别': '別', '劫': '劫', '刮': '刮', '制': '制', '刷': '刷', '券': '券', '刹': '剎', '刺': '刺', '刻': '刻', '刽': '劊',
    '刿': '劌', '剁': '剁', '剂': '劑', '削': '削', '克': '剋', '前': '前', '剔': '剔', '剖': '剖', '刚': '剛', '剜': '剜', '剥': '剝',
    '剧': '劇', '剩': '剩', '剪': '剪', '副': '副', '割': '割', '剽': '剽', '剿': '剿', '劈': '劈', '力': '力', '劝': '勸', '办': '辦',
    '功': '功', '加': '加', '务': '務', '劣': '劣', '动': '動', '助': '助', '努': '努', '劫': '劫', '劬': '劬', '励': '勵', '劳': '勞'
  };

  let openccConverter = null;
  if (window.OpenCC && typeof window.OpenCC.Converter === 'function') {
    try {
      openccConverter = window.OpenCC.Converter({ from: 'cn', to: 'twp' });
    } catch (e) {
      console.warn('OpenCC 初始化失敗，將使用內建繁簡轉換引擎:', e);
    }
  }

  // 轉換為繁體中文
  function toTraditional(text) {
    if (!text) return '';
    let result = text;
    // 1. 遊戲王特定詞彙映射
    for (const [s, t] of YGO_S2T_DICT) {
      result = result.split(s).join(t);
    }
    // 2. OpenCC (若可用)
    if (openccConverter) {
      try {
        result = openccConverter(result);
      } catch (err) {
        // fallback
      }
    }
    // 3. 全量雙向單字字典替換 (2,500+ 字庫，保證無論在線離線、有無 OpenCC 皆 100% 覆蓋)
    const s2tDict = (typeof window !== 'undefined' && window.FULL_S2T_DICT) || CHAR_S2T;
    let chars = result.split('');
    for (let i = 0; i < chars.length; i++) {
      if (s2tDict[chars[i]]) {
        chars[i] = s2tDict[chars[i]];
      }
    }
    return chars.join('');
  }

  // 簡化轉回簡體中文（用於百鴿 API 查詢與雙向索引比對）
  function toSimplified(text) {
    if (!text) return '';
    let result = text;
    // 1. 反向專有名詞
    for (const [s, t] of YGO_S2T_DICT) {
      result = result.split(t).join(s);
    }
    // 2. 全量雙向反向單字字典 (2,500+ 字庫)
    const t2sDict = (typeof window !== 'undefined' && window.FULL_T2S_DICT) || null;
    let chars = result.split('');
    if (t2sDict) {
      for (let i = 0; i < chars.length; i++) {
        if (t2sDict[chars[i]]) {
          chars[i] = t2sDict[chars[i]];
        }
      }
    } else {
      const T2S = {};
      for (const k in CHAR_S2T) {
        T2S[CHAR_S2T[k]] = k;
      }
      for (let i = 0; i < chars.length; i++) {
        if (T2S[chars[i]]) {
          chars[i] = T2S[chars[i]];
        }
      }
    }
    return chars.join('');
  }

  // ================= 效果搜尋縮寫同義詞與主流字段表 =================
  const SEARCH_SYNONYMS = {
    '特招': ['特殊召喚', '特殊召唤', '特召', '特招'],
    '特召': ['特殊召喚', '特殊召唤', '特召', '特招'],
    '通招': ['通常召喚', '通常召唤', '通招'],
    '堆墓': ['送去墓地', '送入墓地', '堆墓'],
    '回手': ['回到手牌', '回到手卡', '回到持有者手牌', '回到持有者手卡', '回手'],
    '彈手': ['回到手牌', '回到手卡', '回到持有者手牌', '回到持有者手卡'],
    '弹手': ['回到手牌', '回到手卡', '回到持有者手牌', '回到持有者手卡'],
    '检索': ['加入手卡', '加入手牌', '检索', '从卡组把', '从卡组将'],
    '檢索': ['加入手牌', '加入手卡', '檢索', '從牌組把', '從卡組把', '從牌組將'],
    '炸卡': ['破壞', '破坏', '炸卡'],
    '炸場': ['破壞', '破坏'],
    '炸场': ['破坏', '破壞'],
    '康': ['無效', '无效', '發動無效', '发动无效'],
    '打斷': ['無效', '无效'],
    '打断': ['无效', '無效'],
    '除外': ['除外'],
    '復活': ['特殊召喚', '特殊召唤', '甦醒', '苏生', '復活'],
    '复活': ['特殊召唤', '特殊召喚', '苏生', '甦醒', '复活'],
    '苏生': ['特殊召唤', '特殊召喚', '苏生', '甦醒'],
    '甦醒': ['特殊召喚', '特殊召唤', '甦醒', '苏生'],
    '無效': ['無效', '无效'],
    '无效': ['无效', '無效'],
    '破壞': ['破壞', '破坏'],
    '破坏': ['破坏', '破壞'],
    '墓地': ['墓地'],
    '手牌': ['手牌', '手卡'],
    '手卡': ['手卡', '手牌'],
    '牌組': ['牌組', '卡組', '卡组'],
    '卡組': ['卡組', '卡组', '牌組'],
    '卡组': ['卡组', '卡組', '牌組'],
    '抽牌': ['抽牌', '抽卡', '抽出'],
    '抽卡': ['抽卡', '抽牌', '抽出'],
    '覆蓋': ['覆蓋', '盖放', '蓋卡', '盖卡'],
    '盖放': ['盖放', '覆蓋', '盖卡', '蓋卡'],
    '蓋放': ['蓋放', '覆蓋', '蓋卡', '盖卡'],
    '反轉': ['反轉', '反转'],
    '反转': ['反转', '反轉'],
    '黑暗': ['暗黑', '黑暗'],
    '暗黑': ['黑暗', '暗黑'],
    '結束': ['團結', '結束', '团结'],
    '团结': ['結束', '團結', '团结'],
    '惡魔龍': ['悪魔竜', '魔龍', '恶魔龙', '暗黑魔龍', '黑暗惡魔龍', '暗黑魔龙', '黑暗恶魔龙'],
    '恶魔龙': ['悪魔竜', '魔龙', '恶魔龙', '暗黑魔龙', '黑暗恶魔龙', '暗黑魔龍', '黑暗惡魔龍'],
    '聖賢者': ['圣贤者', '聖賢者'],
    '圣贤者': ['圣贤者', '聖賢者'],
    '魔導士': ['魔術師', '魔导师', '魔导士', '魔導士', '魔导'],
    '魔術師': ['魔導士', '魔導師', '魔导士', '魔导师', '魔術師', '魔术师'],
    'suda': ['SUDA', 'Supreme Darkness', '至高黑暗', '光與暗的儀式', '光与暗的仪式'],
    'info': ['INFO', 'The Infinite Forbidden', '無限禁咒', '艾克佐迪亞'],
    'lede': ['LEDE', 'Legacy of Destruction', '破滅遺產', '光之黃金櫃', '天盃龍'],
    'rota': ['ROTA', 'Rage of the Abyss', '深淵之怒', '鯊魚', '水精鱗'],
    'phhy': ['PHHY', 'Photon Hypernova', '光子超新星', '俱舍怒威族'],
    'dabl': ['DABL', 'Darkwing Blast', '暗黑界', '赫之聖女'],
    'pote': ['POTE', 'Power of the Elements', '元素電力', '珠淚哀歌族', '雷精靈'],
    'rc04': ['RC04', 'Rarity Collection', '25週年名片包'],
    '25th': ['25TH', '25週年', '25周年'],
    'rv02': ['RV02', 'REVOLUTION BOOSTER', '鬼計', '鬼计', 'ゴーストリック', 'Ghostrick'],
    '鬼計': ['鬼計', '鬼计', 'ゴーストリック', 'Ghostrick'],
    '鬼计': ['鬼計', '鬼计', 'ゴーストリック', 'Ghostrick'],
    '100272049': ['65116919', 'RV02-JP049', '鬼計鬼火', '鬼计鬼火', '100272049'],
    '100272050': ['92600528', 'RV02-JP050', '鬼計巫妖', '鬼计巫妖', '100272050'],
    '100272051': ['28095622', 'RV02-JP051', '鬼計妖狐', '鬼计妖狐', '100272051'],
    '100272052': ['54083371', 'RV02-JP052', '鬼計之主', '鬼计之主', '100272052'],
    '100272053': ['91488070', 'RV02-JP053', '鬼計花園', '鬼计花园', '100272053'],
    '100272054': ['27872075', 'RV02-JP054', '鬼計藝術', '鬼计艺术', '100272054'],
    '65116919': ['100272049', 'RV02-JP049', '鬼計鬼火', '鬼计鬼火'],
    '92600528': ['100272050', 'RV02-JP050', '鬼計巫妖', '鬼计巫妖'],
    '28095622': ['100272051', 'RV02-JP051', '鬼計妖狐', '鬼计妖狐'],
    '54083371': ['100272052', 'RV02-JP052', '鬼計之主 阿魯卡德', '鬼计之主 阿鲁卡德'],
    '91488070': ['100272053', 'RV02-JP053', '鬼計花園', '鬼计花园'],
    '27872075': ['100272054', 'RV02-JP054', '鬼計藝術', '鬼计艺术']
  };

  // 常用效果分類關鍵字庫
  const EFFECT_TAG_KEYWORDS = {
    SEARCH: ['加入手卡', '加入手牌', '從卡組把', '從牌組把', '從卡組將', '從牌組將', '從卡組選', '從牌組選', '檢索', '抽1張', '抽2張', '抽卡', '抽牌', '从卡组把', '从卡组将', '加入手卡', '从卡组选'],
    SS: ['特殊召喚', '特殊召唤', '特召', '特招'],
    NEGATE: ['發動無效', '效果無效', '發動無效並破壞', '無效化', '不能發動', '效果無效化', '发动无效', '效果无效', '发动无效并破坏'],
    DESTROY: ['破壞', '破坏', '炸卡'],
    BANISH: ['除外', '裡側除外', '里侧除外', '表側除外', '表侧除外'],
    GY: ['送去墓地', '送入墓地', '丟棄', '丢弃', '堆墓'],
    BOUNCE: ['回到手卡', '回到手牌', '回到持有者手牌', '回到持有者手卡', '回到卡組', '回到牌組', '回到持有者卡組', '回到持有者牌組', '彈手', '回手'],
    PROTECT: ['不會被', '不能作為對象', '不取對象', '不受', '不接受', '不会被', '不能作为对象', '不受其他']
  };

  // 常見主流與經典系列字段表 (支援中繁簡與欄位自動識別)
  const COMMON_ARCHETYPES = [
    { zh_tw: '罪寶', zh_cn: '罪宝' },
    { zh_tw: '蛇眼', zh_cn: '蛇眼' },
    { zh_tw: '閃刀姬', zh_cn: '闪刀姬' },
    { zh_tw: '閃刀', zh_cn: '闪刀' },
    { zh_tw: '俱舍怒威族', zh_cn: '俱舍怒威族' },
    { zh_tw: '珠淚哀歌族', zh_cn: '珠泪哀歌族' },
    { zh_tw: '天盃龍', zh_cn: '天杯龙' },
    { zh_tw: '烙印', zh_cn: '烙印' },
    { zh_tw: '白銀之城', zh_cn: '白银之城' },
    { zh_tw: '青眼', zh_cn: '青眼' },
    { zh_tw: '真紅眼', zh_cn: '真红眼' },
    { zh_tw: '黑魔導', zh_cn: '黑魔导' },
    { zh_tw: '黑魔術師', zh_cn: '黑魔术师' },
    { zh_tw: '英雄', zh_cn: '英雄' },
    { zh_tw: '超重武者', zh_cn: '超重武者' },
    { zh_tw: '轉生炎獸', zh_cn: '转生炎兽' },
    { zh_tw: '碼語者', zh_cn: '码语者' },
    { zh_tw: '霍普', zh_cn: '霍普' },
    { zh_tw: '星塵', zh_cn: '星尘' },
    { zh_tw: '異色眼', zh_cn: '异色眼' },
    { zh_tw: 'DDD', zh_cn: 'DDD' },
    { zh_tw: '神碑', zh_cn: '神碑' },
    { zh_tw: '皮爾莉', zh_cn: '皮尔莉' },
    { zh_tw: '相劍', zh_cn: '相剑' },
    { zh_tw: '冰結界', zh_cn: '冰结界' },
    { zh_tw: '斬機', zh_cn: '斩机' },
    { zh_tw: '魔女術', zh_cn: '魔女术' },
    { zh_tw: '半龍女僕', zh_cn: '半龙女仆' },
    { zh_tw: '幻影騎士團', zh_cn: '幻影骑士团' },
    { zh_tw: '急襲猛禽', zh_cn: '急袭猛禽' },
    { zh_tw: '救祓少女', zh_cn: '救祓少女' },
    { zh_tw: '隨風旅鳥', zh_cn: '随风旅鸟' },
    { zh_tw: '肅聲', zh_cn: '肃声' },
    { zh_tw: '百夫長', zh_cn: '百夫长' },
    { zh_tw: '刻魔', zh_cn: '刻魔' },
    { zh_tw: '光與暗的儀式', zh_cn: '光与暗的仪式' },
    { zh_tw: '光與暗之儀式', zh_cn: '光与暗之仪式' },
    { zh_tw: '光與暗', zh_cn: '光与暗' },
    { zh_tw: '光與闇的儀式', zh_cn: '光与暗的仪式' },
    { zh_tw: '光與闇', zh_cn: '光与暗' },
    { zh_tw: '王之棺', zh_cn: '王之棺' },
    { zh_tw: '荷魯斯', zh_cn: '荷鲁斯' },
    { zh_tw: '阿爾白斯之落胤', zh_cn: '阿不思的落胤' },
    { zh_tw: '維薩斯', zh_cn: '维萨斯' },
    { zh_tw: '尤貝爾', zh_cn: '于贝尔' },
    { zh_tw: '黑色混沌', zh_cn: '黑色混沌' },
    { zh_tw: '鬼計', zh_cn: '鬼计' }
  ];

  // 取得搜尋詞與其衍生繁簡、同義展開詞群
  function getSearchTokens(query) {
    if (!query || !query.trim()) return [];
    const q = query.trim();
    const qLower = q.toLowerCase();
    const qSimp = toSimplified(q);
    const qTrad = toTraditional(q);

    const tokens = new Set([q, qSimp, qTrad]);

    for (const key in SEARCH_SYNONYMS) {
      const keyLower = key.toLowerCase();
      const isCode = /^[a-z0-9_-]+$/i.test(key);
      const isMatch = isCode
        ? (qLower === keyLower)
        : (qLower.includes(keyLower) || qSimp.includes(key) || qTrad.includes(key));
      if (isMatch) {
        for (const syn of SEARCH_SYNONYMS[key]) {
          tokens.add(syn);
          tokens.add(toSimplified(syn));
          tokens.add(toTraditional(syn));
        }
      }
    }

    // 字段與系列雙向綁定 (如 罪寶 <-> 罪宝)
    for (const arc of COMMON_ARCHETYPES) {
      if (q.includes(arc.zh_tw) || q.includes(arc.zh_cn) || qSimp.includes(arc.zh_cn) || qTrad.includes(arc.zh_tw)) {
        tokens.add(arc.zh_tw);
        tokens.add(arc.zh_cn);
      }
    }

    const parts = q.split(/\s+/).filter(p => p.length >= 1);
    for (const part of parts) {
      tokens.add(part);
      tokens.add(toSimplified(part));
      tokens.add(toTraditional(part));
      const partLower = part.toLowerCase();
      for (const key in SEARCH_SYNONYMS) {
        const keyLower = key.toLowerCase();
        const isCode = /^[a-z0-9_-]+$/i.test(key);
        const isMatch = isCode
          ? (partLower === keyLower)
          : part.includes(key);
        if (isMatch) {
          for (const syn of SEARCH_SYNONYMS[key]) {
            tokens.add(syn);
            tokens.add(toSimplified(syn));
            tokens.add(toTraditional(syn));
          }
        }
      }
    }

    // 智慧處理「之」「的」「の」互換與虛詞刪除
    // 例如：精靈的聖賢者 <-> 精靈之聖賢者 <-> 精靈聖賢者 (官方簡中無「的」)
    const currentTokens = [...tokens];
    for (const t of currentTokens) {
      if (t.includes('的')) {
        const vZhi = t.replace(/的/g, '之');
        const vNo = t.replace(/的/g, 'の');
        const vDel = t.replace(/的/g, '');
        tokens.add(vZhi); tokens.add(toSimplified(vZhi)); tokens.add(toTraditional(vZhi));
        tokens.add(vNo);
        if (vDel.length >= 2) {
          tokens.add(vDel); tokens.add(toSimplified(vDel)); tokens.add(toTraditional(vDel));
        }
      }
      if (t.includes('之')) {
        const vDe = t.replace(/之/g, '的');
        const vNo = t.replace(/之/g, 'の');
        const vDel = t.replace(/之/g, '');
        tokens.add(vDe); tokens.add(toSimplified(vDe)); tokens.add(toTraditional(vDe));
        tokens.add(vNo);
        if (vDel.length >= 2) {
          tokens.add(vDel); tokens.add(toSimplified(vDel)); tokens.add(toTraditional(vDel));
        }
      }
      if (t.includes('の')) {
        const vZhi = t.replace(/の/g, '之');
        const vDe = t.replace(/の/g, '的');
        const vDel = t.replace(/の/g, '');
        tokens.add(vZhi); tokens.add(toSimplified(vZhi)); tokens.add(toTraditional(vZhi));
        tokens.add(vDe); tokens.add(toSimplified(vDe)); tokens.add(toTraditional(vDe));
        if (vDel.length >= 2) {
          tokens.add(vDel); tokens.add(toSimplified(vDel)); tokens.add(toTraditional(vDel));
        }
      }
    }

    // 智慧處理「與/与」、「闇/暗」、「儀/仪」、「結/结」
    const transTokens = [...tokens];
    for (const t of transTokens) {
      if (t.includes('與')) tokens.add(t.replace(/與/g, '与'));
      if (t.includes('与')) tokens.add(t.replace(/与/g, '與'));
      if (t.includes('闇')) tokens.add(t.replace(/闇/g, '暗'));
      if (t.includes('暗')) tokens.add(t.replace(/暗/g, '闇'));
      if (t.includes('儀')) tokens.add(t.replace(/儀/g, '仪'));
      if (t.includes('仪')) tokens.add(t.replace(/仪/g, '儀'));
    }

    return [...tokens].filter(t => t && t.length >= 1);
  }

  // 遊戲王常見規則、動作與系統用語黑名單 (不作為系列字段)
  const RULE_TERMS_BLACKLIST = new Set([
    '1回合只能使用1次', '1回合各能使用1次', '1回合只能發動1張', '1回合各只能使用1次', '同名卡', '同調召喚', '同步召喚', '超量召喚', '連結召喚',
    '融合召喚', '儀式召喚', '特殊召喚', '通常召喚', '怪獸區域', '魔法與陷阱區域', '魔法·陷阱區域', '魔法·陷阱卡', '額外怪獸區域',
    '墓地', '除外', '卡組', '牌組', '額外卡組', '額外牌組', '手卡', '手牌', '場上',
    '攻擊力', '守備力', '等級', '階級', '刻度', '傷害步驟', '傷害計算時', '傷害計算前',
    '主要階段', '戰鬥階段', '結束階段', '準備階段', '抽卡階段', '抽牌階段',
    '表側表示', '裏側表示', '表側守備表示', '攻擊表示', '守備表示', '發動無效', '效果無效',
    '不能發動', '不能特殊召喚', '此卡名', '這個卡名', '原本攻擊力', '原本守備力',
    '卡片種類', '怪獸效果', '魔法卡', '陷阱卡', '通常魔法', '速攻魔法', '永續魔法', '裝備魔法',
    '場地魔法', '通常陷阱', '永續陷阱', '反擊陷阱', '衍生物', '對象', '控制權', '自己場上', '對方場上',
    '怪兽区域', '魔法与陷阱区域', '魔法·陷阱区域', '额外怪兽区域', '伤害步骤', '伤害计算时', '主要阶段',
    '战斗阶段', '结束阶段', '准备阶段', '抽卡阶段', '表侧表示', '里侧表示', '发动无效', '原本攻击力'
  ]);

  // 識別單張卡片所屬的系列字段標籤或效果文卡名記述
  function getCardArchetypes(card) {
    if (!card) return [];
    const matched = [];
    const isTw = state.currentLang === 'zh_tw';
    const name = (card.zh_tw.name || '') + ' ' + (card.zh_cn.name || '');
    const descTw = (card.zh_tw.desc || '') + ' ' + (card.zh_tw.pdesc || '');
    const descCn = (card.zh_cn.desc || '') + ' ' + (card.zh_cn.pdesc || '');

    // 1. 既有主流系列字段清單比對
    for (const arc of COMMON_ARCHETYPES) {
      if (name.includes(arc.zh_tw) || name.includes(arc.zh_cn)) {
        matched.push(isTw ? arc.zh_tw : arc.zh_cn);
      } else if (descTw.includes(`「${arc.zh_tw}」`) || descCn.includes(`「${arc.zh_cn}」`) ||
        descTw.includes(`『${arc.zh_tw}』`) || descCn.includes(`『${arc.zh_cn}』`)) {
        matched.push(isTw ? arc.zh_tw : arc.zh_cn);
      }
    }

    // 2. 動態提取效果文中所有「...」與『...』指定卡名或系列 (涵蓋無字段標籤的卡名記載系列)
    const extractRegex = /[「『]([^」』\n\r]+)[」』]/g;
    const allDesc = descTw + ' ' + descCn;
    let m;
    while ((m = extractRegex.exec(allDesc)) !== null) {
      let rawTerm = m[1].trim();
      // 去除括號尾綴的多餘類別用語 (如「荷魯斯」怪獸、「光與暗的儀式」卡名記述)
      rawTerm = rawTerm.replace(/(?:怪獸|魔法|陷阱|卡片|卡)$/g, '').trim();
      if (!rawTerm || rawTerm.length < 2 || rawTerm.length > 15) continue;

      const simpTerm = toSimplified(rawTerm);
      const tradTerm = toTraditional(rawTerm);

      if (RULE_TERMS_BLACKLIST.has(rawTerm) || RULE_TERMS_BLACKLIST.has(simpTerm) || RULE_TERMS_BLACKLIST.has(tradTerm)) {
        continue;
      }

      // 若為此卡自身完全同名的卡名引述，不重複顯示為系列
      const selfTw = card.zh_tw.name || '';
      const selfCn = card.zh_cn.name || '';
      if (selfTw === tradTerm || selfCn === simpTerm) {
        continue;
      }

      matched.push(isTw ? tradTerm : simpTerm);
    }

    return [...new Set(matched)].filter(Boolean);
  }

  // 搜尋字詞動態高亮標記 (精準標記搜尋字詞，不破壞既有 HTML 標籤屬性)
  function highlightSearchTermsInHtml(html, terms) {
    if (!html || !terms || terms.length === 0) return html;
    const rawSearch = state.activeFilters && state.activeFilters.search ? state.activeFilters.search.trim() : '';
    const stopWords = new Set(['的', '之', '與', '与', '和', '及', '或', '●', '•']);
    const validTerms = [...new Set(terms.filter(t => {
      if (!t || t.length === 0) return false;
      if (stopWords.has(t) && rawSearch !== t) return false;
      return true;
    }))].sort((a, b) => b.length - a.length);
    if (validTerms.length === 0) return html;

    const escaped = validTerms.map(t => t.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('|');
    const regex = new RegExp(`(<[^>]+>)|(${escaped})`, 'gi');

    return html.replace(regex, (match, tag, word) => {
      if (tag) return tag;
      return `<mark class="search-highlight">${word}</mark>`;
    });
  }

  // ================= 3. 全域狀態管理 =================
  const state = {
    currentLang: localStorage.getItem('ygo_lang') || 'zh_tw', // 'zh_tw' | 'zh_cn'
    allCards: new Map(), // id -> normalized card object
    currentResults: [],
    selectedCard: null,
    viewMode: 'grid', // 'grid' | 'list'
    decks: [
      { id: 'deck_1', name: '預設牌組', main: [], extra: [] }
    ],
    activeDeckId: 'deck_1',
    get deck() {
      let d = this.decks.find(x => x.id === this.activeDeckId);
      if (!d) {
        if (!this.decks || this.decks.length === 0) {
          d = { id: 'deck_1', name: '預設牌組', main: [], extra: [] };
          this.decks = [d];
        } else {
          d = this.decks[0];
        }
        this.activeDeckId = d.id;
      }
      return d;
    },
    activeFilters: {
      search: '',
      scope: 'all', // 'all', 'name', 'desc', 'id'
      category: 'ALL', // 'ALL', 'MONSTER', 'SPELL', 'TRAP'
      monsterTypes: new Set(),
      spellTypes: new Set(),
      trapTypes: new Set(),
      attributes: new Set(),
      race: 'ALL',
      level: 'ALL',
      scale: 'ALL',
      atkMin: '',
      atkMax: '',
      defMin: '',
      defMax: '',
      atkUnknown: false,
      defUnknown: false,
      linkMarkers: new Set(),
      effectTags: new Set(),
      banlist: 'ALL',
      sort: 'relevance'
    },
    isLoading: false
  };

  // ================= 4. 卡片資料正規化引擎 =================
  function normalizeCard(raw) {
    if (!raw) return null;
    const id = raw.id || (raw.data && raw.data.id) || 0;
    const cid = raw.cid || 0;
    const data = raw.data || {};
    const text = raw.text || {};

    const type = Number(data.type || 0);
    const race = Number(data.race || 0);
    const attr = Number(data.attribute || 0);
    const atk = Number(data.atk || 0);
    const def = Number(data.def || 0);
    const rawLevel = Number(data.level || 0);

    // 解析等級、刻度
    const level = rawLevel & 0xff;
    const scaleLeft = (rawLevel >> 24) & 0xff;
    const scaleRight = (rawLevel >> 16) & 0xff;
    const scale = scaleLeft || scaleRight || 0;

    // 名稱提取
    const cnName = raw.cn_name || raw.sc_name || raw.md_name || raw.nwbbs_n || (text && (text.name || text.sc_name || text.md_name)) || '';
    const twName = toTraditional(cnName);
    const jpName = raw.jp_name || (text && text.jp_name) || '';
    const jpRuby = raw.jp_ruby || (text && text.jp_ruby) || '';
    const enName = raw.en_name || (text && text.en_name) || raw.wiki_en || (text && text.wiki_en) || '';

    // 別名與俗名提取 (百鴿/YGOPro 可能提供不同譯名，如 "幻惑之绮罗星" vs "幻惑的绮罗星")
    const aliasSet = new Set();
    const candidateNames = [
      raw.cn_name, raw.sc_name, raw.md_name, raw.nwbbs_n,
      text && text.name, text && text.sc_name, text && text.md_name
    ].filter(Boolean);
    if (raw.aliases && Array.isArray(raw.aliases)) {
      raw.aliases.forEach(a => candidateNames.push(a));
    }
    for (const n of candidateNames) {
      aliasSet.add(n);
      aliasSet.add(toTraditional(n));
      aliasSet.add(toSimplified(n));
      if (n.includes('之')) {
        const v = n.replace(/之/g, '的');
        aliasSet.add(v);
        aliasSet.add(toTraditional(v));
      }
      if (n.includes('的')) {
        const v = n.replace(/的/g, '之');
        aliasSet.add(v);
        aliasSet.add(toTraditional(v));
      }
      if (n.includes('之') || n.includes('的')) {
        const vDel = n.replace(/之|的/g, '');
        if (vDel.length >= 2) {
          aliasSet.add(vDel);
          aliasSet.add(toTraditional(vDel));
          aliasSet.add(toSimplified(vDel));
        }
      }
      if (n.includes('黑暗')) {
        const v = n.replace(/黑暗/g, '暗黑');
        aliasSet.add(v); aliasSet.add(toTraditional(v)); aliasSet.add(toSimplified(v));
      }
      if (n.includes('暗黑')) {
        const v = n.replace(/暗黑/g, '黑暗');
        aliasSet.add(v); aliasSet.add(toTraditional(v)); aliasSet.add(toSimplified(v));
      }
      if (n.includes('結束')) {
        const v = n.replace(/結束/g, '團結');
        aliasSet.add(v); aliasSet.add(toTraditional(v)); aliasSet.add(toSimplified(v));
      }
      if (n.includes('团结')) {
        const v = n.replace(/团结/g, '结束');
        aliasSet.add(v); aliasSet.add(toTraditional(v)); aliasSet.add(toSimplified(v));
      }
    }

    if (raw._queryTerm) aliasSet.add(String(raw._queryTerm));
    if (cid) aliasSet.add(String(cid));
    if (SEARCH_SYNONYMS[String(id)]) {
      for (const s of SEARCH_SYNONYMS[String(id)]) aliasSet.add(s);
    }
    for (const n of candidateNames) {
      if (SEARCH_SYNONYMS[n]) {
        for (const s of SEARCH_SYNONYMS[n]) aliasSet.add(s);
      }
    }

    // 提取卡包發行代號 (如 RV02-JP049, RV02, REVOLUTION BOOSTER 等)
    if (raw.jppacks && Array.isArray(raw.jppacks)) {
      for (const p of raw.jppacks) {
        if (p.setid) {
          aliasSet.add(p.setid);
          const parts = p.setid.split('-');
          if (parts[0]) aliasSet.add(parts[0]);
          if (parts.length >= 2) aliasSet.add(`${parts[0]}-${parts[1].replace(/[0-9]/g, '')}`);
        }
        if (p.name) aliasSet.add(p.name);
      }
    }
    if (raw.enpacks && Array.isArray(raw.enpacks)) {
      for (const p of raw.enpacks) {
        if (p.setid) {
          aliasSet.add(p.setid);
          const parts = p.setid.split('-');
          if (parts[0]) aliasSet.add(parts[0]);
        }
        if (p.name) aliasSet.add(p.name);
      }
    }

    // 效果文提取
    const cnDesc = (text.desc || '').trim();
    const twDesc = toTraditional(cnDesc);
    const cnPdesc = (text.pdesc || '').trim();
    const twPdesc = toTraditional(cnPdesc);

    // 類型字串
    const typesStrCn = text.types || '';
    const typesStrTw = toTraditional(typesStrCn);

    // 是否為額外牌組怪獸 (融合, 同步, 超量, 連結)
    const isExtra = (type & (TYPE_FUSION | TYPE_SYNCHRO | TYPE_XYZ | TYPE_LINK)) !== 0;
    const isLink = (type & TYPE_LINK) !== 0;
    const linkMarkers = isLink ? Number(data.def || 0) : 0;

    // 禁限卡狀態 (0: 禁止, 1: 限制, 2: 準限制, 3: 無限制)
    const banOcg = raw.ban_ocg !== undefined ? raw.ban_ocg : 3;

    return {
      id,
      cid,
      raw,
      data: {
        type,
        race,
        attribute: attr,
        atk,
        def,
        level,
        scale,
        isExtra,
        isLink,
        linkMarkers
      },
      zh_cn: {
        name: cnName,
        desc: cnDesc,
        pdesc: cnPdesc,
        typesStr: typesStrCn
      },
      zh_tw: {
        name: twName,
        desc: twDesc,
        pdesc: twPdesc,
        typesStr: typesStrTw
      },
      jp_name: jpName,
      jp_ruby: jpRuby,
      en_name: enName,
      aliases: [...aliasSet],
      ban_ocg: banOcg
    };
  }

  // ================= 5. 卡片框色與屬性計算輔助 =================
  function getCardFrameClass(type) {
    if (type & TYPE_SPELL) return 'theme-spell';
    if (type & TYPE_TRAP) return 'theme-trap';
    if (type & TYPE_LINK) return 'theme-link';
    if (type & TYPE_XYZ) return 'theme-xyz';
    if (type & TYPE_SYNCHRO) return 'theme-synchro';
    if (type & TYPE_FUSION) return 'theme-fusion';
    if (type & TYPE_RITUAL) return 'theme-ritual';
    if (type & TYPE_EFFECT) return 'theme-effect';
    if (type & TYPE_NORMAL) return 'theme-normal';
    if (type & TYPE_TOKEN) return 'theme-token';
    return 'theme-normal';
  }

  function getAttributeBadge(attrMask, lang) {
    const attr = ATTRIBUTES[attrMask];
    if (!attr) return null;
    return {
      key: attr.key,
      name: lang === 'zh_tw' ? attr.zh_tw : attr.zh_cn,
      color: attr.color
    };
  }

  function getRaceName(raceMask, lang) {
    const r = RACES[raceMask];
    if (!r) return '';
    return lang === 'zh_tw' ? r.zh_tw : r.zh_cn;
  }

  // ================= 6. 卡片圖片 CDN 與多層備援載入器 =================
  function getCardImageUrls(id) {
    return [
      `https://cdn.233.momobako.com/ygopro/pics/${id}.jpg`,
      `https://images.ygoprodeck.com/images/cards/${id}.jpg`,
      `https://storage.googleapis.com/ygoprodeck/pics/${id}.jpg`
    ];
  }

  function handleImageError(imgEl, card) {
    const nextIdx = Number(imgEl.dataset.tryIndex || 0) + 1;
    const urls = getCardImageUrls(card.id);
    if (nextIdx < urls.length) {
      imgEl.dataset.tryIndex = nextIdx;
      imgEl.src = urls[nextIdx];
    } else {
      // 最終備援：自訂向量 SVG 卡背
      imgEl.style.display = 'none';
      const parent = imgEl.parentElement;
      if (parent && !parent.querySelector('.card-fallback-svg')) {
        const name = state.currentLang === 'zh_tw' ? card.zh_tw.name : card.zh_cn.name;
        const fallback = document.createElement('div');
        fallback.className = 'card-fallback-svg';
        fallback.innerHTML = `
          <svg width="48" height="48" viewBox="0 0 100 100" fill="none">
            <circle cx="50" cy="50" r="42" stroke="#d97706" stroke-width="4"/>
            <polygon points="50,18 78,72 22,72" stroke="#f59e0b" stroke-width="4" fill="none"/>
            <circle cx="50" cy="54" r="8" fill="#fbbf24"/>
          </svg>
          <div class="fallback-title">${escapeHtml(name)}</div>
        `;
        parent.appendChild(fallback);
      }
    }
  }

  // ================= 7. 結構化效果文解析與關鍵字高亮引擎 =================
  function escapeHtml(str) {
    if (!str) return '';
    return str
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  function highlightKeywords(text, lang) {
    if (!text) return '';
    let html = escapeHtml(text);

    // 區域關鍵字 (Teal)
    const zones = lang === 'zh_tw'
      ? ['手牌', '主牌組', '額外牌組', '牌組', '墓地', '場上', '除外狀態', '除外區', '靈擺區域', '魔法與陷阱區域', '怪獸區域']
      : ['手卡', '主卡组', '额外卡组', '卡组', '墓地', '场上', '除外状态', '除外区', '灵摆区域', '魔法与陷阱区域', '怪兽区域'];
    const zoneRegex = new RegExp(`(${zones.join('|')})`, 'g');
    html = html.replace(zoneRegex, '<span class="kw-tag kw-zone">$1</span>');

    // 召喚方式關鍵字 (Purple)
    const summons = lang === 'zh_tw'
      ? ['特殊召喚', '通常召喚', '反轉召喚', '融合召喚', '同步召喚', '超量召喚', '連結召喚', '靈擺召喚', '解放']
      : ['特殊召唤', '通常召唤', '反转召唤', '融合召唤', '同调召唤', '超量召唤', '连接召唤', '灵摆召唤', '解放'];
    const summonRegex = new RegExp(`(${summons.join('|')})`, 'g');
    html = html.replace(summonRegex, '<span class="kw-tag kw-summon">$1</span>');

    // 限制與無效關鍵字 (Rose Red)
    const negates = lang === 'zh_tw'
      ? ['無效', '不能發動', '不能特殊召喚', '不能通常召喚', '不受其他卡的效果影響', '不能攻擊', '破壞']
      : ['无效', '不能发动', '不能特殊召唤', '不能通常召唤', '不受其他卡的效果影响', '不能攻击', '破坏'];
    const negateRegex = new RegExp(`(${negates.join('|')})`, 'g');
    html = html.replace(negateRegex, '<span class="kw-tag kw-negate">$1</span>');

    // 操作與代價關鍵字 (Amber)
    const costs = lang === 'zh_tw'
      ? ['送去墓地', '送入墓地', '捨棄', '除外', '加入手牌', '檢索', '洗牌', '抽牌']
      : ['送去墓地', '送入墓地', '丢弃', '除外', '加入手卡', '检索', '洗牌', '抽卡'];
    const costRegex = new RegExp(`(${costs.join('|')})`, 'g');
    html = html.replace(costRegex, '<span class="kw-tag kw-cost">$1</span>');

    // 效果文中「卡名」或『卡名』轉為可點擊的反向檢索連結
    html = html.replace(/[「『]([^」』]+)[」』]/g, (match, cardName) => {
      const cleanName = cardName.trim();
      return `「<span class="quoted-card-link" data-related="${escapeHtml(cleanName)}" title="${lang === 'zh_tw' ? `點擊反向檢索「${escapeHtml(cleanName)}」關聯卡片` : `点击反向检索「${escapeHtml(cleanName)}」关联卡片`}">${cleanName}</span>」`;
    });

    return html;
  }

  function formatPSCT(clauseText, lang) {
    // 移除開頭可能帶有的冒號（如 ①：內容）
    let text = clauseText.trim();
    if (text.startsWith('：') || text.startsWith(':')) {
      text = text.substring(1).trim();
    }

    // 1. 標準 PSCT 冒號與分號 (條件：代價；效果)
    const colonIdx = text.indexOf('：') !== -1 ? text.indexOf('：') : text.indexOf(':');
    if (colonIdx !== -1) {
      const condition = text.substring(0, colonIdx).trim();
      const rest = text.substring(colonIdx + 1).trim();

      const semiIdx = rest.indexOf('；') !== -1 ? rest.indexOf('；') : rest.indexOf(';');
      if (semiIdx !== -1) {
        const cost = rest.substring(0, semiIdx).trim();
        const effect = rest.substring(semiIdx + 1).trim();
        return `
          <div class="psct-block"><span class="kw-tag kw-cond">${lang === 'zh_tw' ? '發動條件' : '发动条件'}</span> ${highlightKeywords(condition, lang)}</div>
          <div class="psct-block"><span class="kw-tag kw-cost">${lang === 'zh_tw' ? '代價處理' : '代价处理'}</span> ${highlightKeywords(cost, lang)}</div>
          <div class="psct-block">${highlightKeywords(effect, lang)}</div>
        `;
      } else {
        return `
          <div class="psct-block"><span class="kw-tag kw-cond">${lang === 'zh_tw' ? '發動條件' : '发动条件'}</span> ${highlightKeywords(condition, lang)}</div>
          <div class="psct-block">${highlightKeywords(rest, lang)}</div>
        `;
      }
    }

    // 2. 中文常見句式：……才能發動。……
    const trigWords = ['才能發動。', '才能发动。', '可以發動。', '可以发动。'];
    for (const tw of trigWords) {
      const trigIdx = text.indexOf(tw);
      if (trigIdx !== -1) {
        const triggerPart = text.substring(0, trigIdx + tw.length).trim();
        const effectPart = text.substring(trigIdx + tw.length).trim();
        if (triggerPart && effectPart) {
          return `
            <div class="psct-block"><span class="kw-tag kw-cost">${lang === 'zh_tw' ? '發動代價 / 條件' : '发动代价 / 条件'}</span> ${highlightKeywords(triggerPart, lang)}</div>
            <div class="psct-block">${highlightKeywords(effectPart, lang)}</div>
          `;
        }
      }
    }

    return highlightKeywords(text, lang);
  }

  function renderStructuredEffect(descText, lang, isNormalMonster = false) {
    if (!descText) return `<div class="lore-text">${lang === 'zh_tw' ? '無效果或記述' : '无效果或记述'}</div>`;
    if (isNormalMonster) {
      return `<div class="lore-text">${escapeHtml(descText)}</div>`;
    }

    let rawLines = descText.split(/\r?\n/).map(l => l.trim()).filter(Boolean);
    let bannerHtml = '';
    let clausesHtml = [];
    let currentBulletGroup = [];

    const turnRegex = /(?:这个卡名|此卡名)的(?:[①②③④⑤⑥\d、]*效果)?\s*[1１一]回合只能(?:使用|发动|發動)\s*[1１一]次[。！!]?/i;

    for (let line of rawLines) {
      // 1. 一回合一次限制檢查
      if (turnRegex.test(line)) {
        bannerHtml += `
          <div class="turn-limit-banner">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
              <circle cx="12" cy="12" r="10"></circle>
              <polyline points="12 6 12 12 16 14"></polyline>
            </svg>
            <span>${escapeHtml(line)}</span>
          </div>
        `;
        continue;
      }

      // 2. 子項目條列 (●)
      if (line.startsWith('●') || line.startsWith('•')) {
        const bulletText = line.substring(1).trim();
        clausesHtml.push(`
          <div class="effect-bullet-row">
            <span class="bullet-dot">●</span>
            <div class="bullet-text">${highlightKeywords(bulletText, lang)}</div>
          </div>
        `);
        continue;
      }

      // 3. 序號條列 (①②③... 或 (1)(2)(3)...)
      const numMatch = line.match(/^([①②③④⑤⑥⑦⑧⑨⑩]|\(\d+\)|\d+\.)\s*(.*)/);
      if (numMatch) {
        const numSymbol = numMatch[1].replace(/[()]/g, '');
        const content = numMatch[2];
        clausesHtml.push(`
          <div class="effect-clause-row">
            <div class="clause-badge">${numSymbol}</div>
            <div class="clause-text">${formatPSCT(content, lang)}</div>
          </div>
        `);
        continue;
      }

      // 4. 一般說明或前置文
      clausesHtml.push(`
        <div class="effect-clause-row">
          <div class="clause-text">${highlightKeywords(line, lang)}</div>
        </div>
      `);
    }

    return `
      ${bannerHtml}
      <div class="effect-clauses-wrapper">
        ${clausesHtml.join('')}
      </div>
    `;
  }

  // ================= 8. IndexedDB 快取存取 =================
  const DB_NAME = 'YGO_LOCAL_CACHE_DB';
  const DB_VERSION = 1;
  let dbInstance = null;

  function initIndexedDB() {
    return new Promise((resolve) => {
      try {
        if (!window.indexedDB) {
          resolve(null);
          return;
        }
        const req = indexedDB.open(DB_NAME, DB_VERSION);
        req.onupgradeneeded = (e) => {
          try {
            const db = e.target.result;
            if (!db.objectStoreNames.contains('cards')) {
              db.createObjectStore('cards', { keyPath: 'id' });
            }
            if (!db.objectStoreNames.contains('deck')) {
              db.createObjectStore('deck', { keyPath: 'id' });
            }
          } catch (err) {
            console.warn('onupgradeneeded error:', err);
          }
        };
        req.onsuccess = (e) => {
          dbInstance = e.target.result;
          resolve(dbInstance);
        };
        req.onerror = () => resolve(null);
      } catch (e) {
        console.warn('IndexedDB not supported or blocked:', e);
        resolve(null);
      }
    });
  }

  function saveCardToDB(card) {
    if (!dbInstance || !card) return;
    try {
      const tx = dbInstance.transaction('cards', 'readwrite');
      tx.objectStore('cards').put(card.raw);
    } catch (e) {
      console.warn('保存至 IndexedDB 失敗:', e);
    }
  }

  function updateCacheCounter() {
    const el = document.getElementById('cacheCounter');
    if (el) {
      el.textContent = `${state.allCards.size} 張`;
    }
  }

  // 清除本地卡片資料庫快取 (IndexedDB)
  async function clearLocalCache() {
    const isTw = state.currentLang === 'zh_tw';
    const totalCount = state.allCards.size;
    const confirmMsg = isTw
      ? `確定要清除所有本地下載的卡片快取嗎？\n\n目前本地快取共有 ${totalCount} 張卡片。\n清除後將清空 IndexedDB 資料庫，並將卡池還原至初始的預載卡片狀態。`
      : `确定要清除所有本地下载的卡片缓存吗？\n\n目前本地缓存共有 ${totalCount} 张卡片。\n清除后将清空 IndexedDB 数据库，并将卡池还原至初始的预载卡片状态。`;

    if (!confirm(confirmMsg)) return;

    // 1. 清空 IndexedDB 'cards' store
    if (dbInstance) {
      try {
        const tx = dbInstance.transaction('cards', 'readwrite');
        tx.objectStore('cards').clear();
      } catch (err) {
        console.warn('清空 IndexedDB 失敗:', err);
      }
    }

    // 2. 清空記憶體卡池並還原 preset_cards
    state.allCards.clear();
    const preset = window.PRESET_CARDS || window.PRESET_CARDS_DATA;
    if (preset && Array.isArray(preset)) {
      for (const raw of preset) {
        const card = normalizeCard(raw);
        if (card) {
          state.allCards.set(card.id, card);
          saveCardToDB(card);
        }
      }
    }

    // 3. 刷新計數器與畫面
    updateCacheCounter();
    loadDeckFromStorage();
    performFilterAndRender();

    showToast(isTw ? '已成功清除本地卡片快取！' : '已成功清除本地卡片缓存！');
  }

  // ================= 9. 百鴿線上查卡 API 與搜尋管線 =================
  let searchDebounceTimer = null;

  async function fetchSingleYgocdb(q) {
    if (!q || !q.trim()) return [];
    try {
      const resp = await fetch(`https://ygocdb.com/api/v0/?search=${encodeURIComponent(q.trim())}`);
      if (!resp.ok) return [];
      const json = await resp.json();
      return json.result || [];
    } catch (err) {
      return [];
    }
  }

  async function fetchYgocdbSearch(query) {
    if (!query || !query.trim()) return [];
    const q = query.trim();
    const queryList = [];

    // 繁體轉簡體查詢（百鴿對簡體字匹配覆蓋最廣且精準，故簡體優先放入）
    const qSimp = toSimplified(q);
    queryList.push(qSimp);
    if (/[a-zA-Z0-9_\-\.\*]/.test(q)) {
      queryList.push(q);
    }

    // 卡包代碼模式自動擴展（例如 RV02, INFO, ROTA, SUDA, ALIN, 1201）
    // 日版官方資料庫與百鴿將卡包卡號索引為 RV02-JP...，故自動查詢加 -JP 與 -EN
    if (/^[A-Za-z0-9]{2,6}$/.test(q)) {
      queryList.push(`${q}-JP`);
      queryList.push(`${q}-EN`);
    }

    if (qSimp.includes('的')) queryList.push(qSimp.replace(/的/g, '之'));
    if (qSimp.includes('之')) queryList.push(qSimp.replace(/之/g, '的'));
    if (qSimp.includes('的') || qSimp.includes('之')) {
      const sDel = qSimp.replace(/的|之/g, '');
      if (sDel.length >= 2) queryList.push(sDel);
    }

    // 同義詞擴展 (黑暗 <-> 暗黑, 結束 <-> 團結)
    if (qSimp.includes('黑暗')) queryList.push(qSimp.replace(/黑暗/g, '暗黑'));
    if (qSimp.includes('暗黑')) queryList.push(qSimp.replace(/暗黑/g, '黑暗'));
    if (qSimp.includes('团结')) queryList.push(qSimp.replace(/团结/g, '结束'));
    if (qSimp.includes('结束')) queryList.push(qSimp.replace(/结束/g, '团结'));

    // 卡包代碼與縮寫同義詞擴展 (例如 suda -> 光与暗的仪式)
    const qLower = q.toLowerCase();
    if (SEARCH_SYNONYMS[qLower]) {
      for (const syn of SEARCH_SYNONYMS[qLower]) {
        queryList.push(syn);
        const sSyn = toSimplified(syn);
        if (sSyn !== syn) queryList.push(sSyn);
        if (sSyn.length >= 2 && !sSyn.startsWith('"')) {
          queryList.push(`"${sSyn}"`);
        }
      }
    }

    // 若搜尋詞包含「儀式/仪式」或「系列」，亦自動擷取系列核心根詞（例如「光与暗的仪式」->「光与暗」）
    if (qSimp.includes('仪式') || qSimp.includes('之仪式') || qSimp.includes('的仪式')) {
      const rootWord = qSimp.replace(/的仪式|之仪式|仪式/g, '').trim();
      if (rootWord.length >= 2) queryList.push(rootWord);
    }

    // 【重要核心】帶引號的精準效果文/卡名記述檢索
    // 在百鴿中，加引號 "..." 能自動檢索卡片效果描述中包含該卡名或系列的所有支援卡！
    // 例如："光与暗的仪式" -> 自動抓取 精靈聖賢者、結束的惡魔龍 等12張卡
    // 例如："王之棺" -> 自動抓取 荷魯斯的榮光 等7張荷魯斯怪獸
    if (qSimp.length >= 2 && !qSimp.startsWith('"')) {
      queryList.push(`"${qSimp}"`);
      const noParticle = qSimp.replace(/的|之/g, '');
      if (noParticle !== qSimp && noParticle.length >= 2) {
        queryList.push(`"${noParticle}"`);
      }
      if (qSimp.includes('黑暗')) queryList.push(`"${qSimp.replace(/黑暗/g, '暗黑')}"`);
      if (qSimp.includes('暗黑')) queryList.push(`"${qSimp.replace(/暗黑/g, '黑暗')}"`);
    }

    const seen = new Set();
    const combined = [];
    for (const curQ of [...new Set(queryList)]) {
      const list = await fetchSingleYgocdb(curQ);
      for (const card of list) {
        if (!seen.has(card.id)) {
          seen.add(card.id);
          card._queryTerm = curQ;
          combined.push(card);
        }
      }
      if (combined.length >= 60) break;
    }
    return combined;
  }

  // 雙語比對與本地過濾器
  function matchesFilter(card, f) {
    const lang = state.currentLang;
    const name = lang === 'zh_tw' ? card.zh_tw.name : card.zh_cn.name;
    const desc = lang === 'zh_tw' ? card.zh_tw.desc : card.zh_cn.desc;

    // 1. 搜尋字詞比對 (支援多字詞空格 AND 複合交集、-排除詞 NOT 語法、別名與簡繁全對照)
    if (f.search) {
      const q = f.search.trim();
      const idStr = String(card.id);

      const rawWords = q.split(/\s+/).filter(Boolean);
      const positiveWords = [];
      const negativeWords = [];

      for (const w of rawWords) {
        if (w.startsWith('-') && w.length > 1) {
          negativeWords.push(w.slice(1));
        } else {
          positiveWords.push(w);
        }
      }

      // (A) 檢查排除詞 (NOT 語法)：若卡片符合任何一個排除詞，立即淘汰
      for (const neg of negativeWords) {
        const negTokens = getSearchTokens(neg);
        const hasNeg = negTokens.some(tok => {
          const t = tok.toLowerCase();
          return card.zh_cn.name.toLowerCase().includes(t) ||
            card.zh_tw.name.toLowerCase().includes(t) ||
            card.jp_name.toLowerCase().includes(t) ||
            card.en_name.toLowerCase().includes(t) ||
            card.zh_cn.desc.toLowerCase().includes(t) ||
            card.zh_tw.desc.toLowerCase().includes(t) ||
            (card.aliases && card.aliases.some(a => a.toLowerCase().includes(t)));
        });
        if (hasNeg) return false;
      }

      // (B) 檢查正向詞 (AND 複合交集)：所有正向詞都必須被卡片滿足
      if (positiveWords.length > 0) {
        for (const pos of positiveWords) {
          const posTokens = getSearchTokens(pos);
          const posIdMatch = idStr.includes(pos) ||
            (card.cid && String(card.cid).includes(pos)) ||
            (card.aliases && card.aliases.some(a => a.toLowerCase().includes(pos.toLowerCase()))) ||
            (card._matchedQueries && card._matchedQueries.has(pos.toLowerCase()));

          const nameMatch = posTokens.some(tok => {
            const t = tok.toLowerCase();
            if (card.zh_cn.name.toLowerCase().includes(t) ||
              card.zh_tw.name.toLowerCase().includes(t) ||
              card.jp_name.toLowerCase().includes(t) ||
              card.en_name.toLowerCase().includes(t)) {
              return true;
            }
            if (card.aliases && card.aliases.some(a => a.toLowerCase().includes(t))) {
              return true;
            }
            if (card._matchedQueries && card._matchedQueries.has(t)) {
              return true;
            }
            return false;
          });

          const descMatch = posTokens.some(tok => {
            const t = tok.toLowerCase();
            return card.zh_cn.desc.toLowerCase().includes(t) ||
              card.zh_tw.desc.toLowerCase().includes(t) ||
              card.zh_cn.pdesc.toLowerCase().includes(t) ||
              card.zh_tw.pdesc.toLowerCase().includes(t);
          });

          const archetypeMatch = posTokens.some(tok => {
            const t = tok.toLowerCase();
            const inName = card.zh_cn.name.toLowerCase().includes(t) ||
              card.zh_tw.name.toLowerCase().includes(t) ||
              (card.aliases && card.aliases.some(a => a.toLowerCase().includes(t)));
            const inQuoteDesc =
              card.zh_cn.desc.includes(`「${tok}」`) || card.zh_tw.desc.includes(`「${tok}」`) ||
              card.zh_cn.desc.includes(`『${tok}』`) || card.zh_tw.desc.includes(`『${tok}』`) ||
              card.zh_cn.desc.includes(`"${tok}"`) || card.zh_tw.desc.includes(`"${tok}"`);
            return inName || inQuoteDesc;
          });

          if (f.scope === 'name' && !nameMatch) return false;
          if (f.scope === 'desc' && !descMatch) return false;
          if (f.scope === 'archetype' && !archetypeMatch) return false;
          if (f.scope === 'id' && !posIdMatch) return false;
          if (f.scope === 'all' && !(nameMatch || descMatch || posIdMatch || archetypeMatch)) return false;
        }
      }
    }

    // 2. 主種類過濾 (全部 / 怪獸 / 魔法 / 陷阱)
    const type = card.data.type;
    if (f.category === 'MONSTER' && !(type & TYPE_MONSTER)) return false;
    if (f.category === 'SPELL' && !(type & TYPE_SPELL)) return false;
    if (f.category === 'TRAP' && !(type & TYPE_TRAP)) return false;

    // 3. 怪獸特殊種類 (若有勾選，該卡必須為怪獸且具備所選全部旗標)
    if (f.monsterTypes.size > 0) {
      if (!(type & TYPE_MONSTER)) return false;
      for (let flag of f.monsterTypes) {
        if (!(type & flag)) return false;
      }
    }

    // 4. 魔法子種類 (若有勾選，該卡必須為魔法卡且具備所選旗標)
    if (f.spellTypes.size > 0) {
      if (!(type & TYPE_SPELL)) return false;
      for (let flag of f.spellTypes) {
        if (!(type & flag)) return false;
      }
    }

    // 5. 陷阱子種類 (若有勾選，該卡必須為陷阱卡且具備所選旗標)
    if (f.trapTypes.size > 0) {
      if (!(type & TYPE_TRAP)) return false;
      for (let flag of f.trapTypes) {
        if (!(type & flag)) return false;
      }
    }

    // 6. 屬性過濾 (必須為怪獸且屬性相符)
    if (f.attributes.size > 0) {
      if (!(type & TYPE_MONSTER)) return false;
      let attrMatched = false;
      for (let attrMask of f.attributes) {
        if (card.data.attribute === attrMask) {
          attrMatched = true;
          break;
        }
      }
      if (!attrMatched) return false;
    }

    // 7. 種族過濾 (必須為怪獸且種族相符)
    if (f.race !== 'ALL') {
      if (!(type & TYPE_MONSTER) || card.data.race !== Number(f.race)) {
        return false;
      }
    }

    // 8. 等級/階級/Link (必須為怪獸且數值相符)
    if (f.level !== 'ALL') {
      if (!(type & TYPE_MONSTER) || card.data.level !== Number(f.level)) {
        return false;
      }
    }

    // 8b. 靈擺刻度過濾 (必須為靈擺怪獸且刻度相符)
    if (f.scale && f.scale !== 'ALL') {
      if (!(type & TYPE_PENDULUM) || card.data.scale !== Number(f.scale)) {
        return false;
      }
    }

    // 9. 攻擊力與守備力範圍 (必須為怪獸且在數值區間內，支援 ? 攻守專屬篩選)
    if (f.atkUnknown) {
      if (!(type & TYPE_MONSTER) || card.data.atk >= 0) return false;
    } else {
      if (f.atkMin !== '' && (!(type & TYPE_MONSTER) || card.data.atk < Number(f.atkMin))) return false;
      if (f.atkMax !== '' && (!(type & TYPE_MONSTER) || card.data.atk > Number(f.atkMax))) return false;
    }

    if (f.defUnknown) {
      if (!(type & TYPE_MONSTER) || (type & TYPE_LINK) || card.data.def >= 0) return false;
    } else {
      if (f.defMin !== '' && (!(type & TYPE_MONSTER) || card.data.def < Number(f.defMin))) return false;
      if (f.defMax !== '' && (!(type & TYPE_MONSTER) || card.data.def > Number(f.defMax))) return false;
    }

    // 10. 連結怪獸八向箭頭標記過濾 (Link Markers 複合方向)
    if (f.linkMarkers && f.linkMarkers.size > 0) {
      if (!(type & TYPE_LINK)) return false;
      const markers = card.data.linkMarkers || 0;
      for (const m of f.linkMarkers) {
        if (!(markers & m)) return false;
      }
    }

    // 11. 常用效果分類標籤過濾 (Effect Tags)
    if (f.effectTags && f.effectTags.size > 0) {
      const allText = (card.zh_tw.desc || '') + ' ' + (card.zh_cn.desc || '') + ' ' + (card.zh_tw.pdesc || '') + ' ' + (card.zh_cn.pdesc || '');
      for (const tag of f.effectTags) {
        const keywords = EFFECT_TAG_KEYWORDS[tag] || [];
        const hasTag = keywords.some(kw => allText.includes(kw));
        if (!hasTag) return false;
      }
    }

    // 11. 禁限規制
    if (f.banlist && f.banlist !== 'ALL' && card.ban_ocg !== Number(f.banlist)) {
      return false;
    }

    return true;
  }

  // 排序
  function sortCards(list, sortKey) {
    return list.sort((a, b) => {
      if (sortKey === 'atk_desc') return b.data.atk - a.data.atk;
      if (sortKey === 'atk_asc') return a.data.atk - b.data.atk;
      if (sortKey === 'def_desc') return b.data.def - a.data.def;
      if (sortKey === 'def_asc') return a.data.def - b.data.def;
      if (sortKey === 'level_desc') return b.data.level - a.data.level;
      if (sortKey === 'id') return b.id - a.id;
      return 0; // relevance
    });
  }

  // 執行搜尋與刷新畫面
  async function performFilterAndRender() {
    const f = state.activeFilters;
    let results = [];

    // 先從本地快取的卡池中檢索
    for (const card of state.allCards.values()) {
      if (matchesFilter(card, f)) {
        results.push(card);
      }
    }

    sortCards(results, f.sort);
    state.currentResults = results;
    renderCardGrid();
    updateFilterBadge();

    // 如果有輸入搜尋字詞且本地結果少於 20 筆，向百鴿 API 發起非同步補全查詢
    if (f.search && f.search.trim().length >= 1) {
      setLoading(true);
      clearTimeout(searchDebounceTimer);
      searchDebounceTimer = setTimeout(async () => {
        saveSearchHistory(f.search.trim());
        const remoteCards = await fetchYgocdbSearch(f.search);
        let addedNew = false;
        const searchTrimmed = f.search.trim();

        for (const raw of remoteCards) {
          let card = state.allCards.get(raw.id);
          let isNew = false;
          if (!card) {
            card = normalizeCard(raw);
            if (card) {
              state.allCards.set(card.id, card);
              isNew = true;
              addedNew = true;
            }
          }
          if (card) {
            if (!card.aliases) card.aliases = [];
            if (!card._matchedQueries) card._matchedQueries = new Set();
            card._matchedQueries.add(searchTrimmed.toLowerCase());
            let updated = false;

            if (searchTrimmed && !card.aliases.includes(searchTrimmed)) {
              card.aliases.push(searchTrimmed);
              updated = true;
            }
            if (raw._queryTerm) {
              const term = String(raw._queryTerm);
              if (!card.aliases.includes(term)) {
                card.aliases.push(term);
                updated = true;
              }
              card._matchedQueries.add(term.toLowerCase());
              if (term.includes('-')) {
                const prefix = term.split('-')[0];
                if (prefix && !card.aliases.includes(prefix)) {
                  card.aliases.push(prefix);
                  card._matchedQueries.add(prefix.toLowerCase());
                  updated = true;
                }
              }
            }
            if (isNew || updated) {
              saveCardToDB(card);
            }
          }
        }
        setLoading(false);
        if (addedNew || remoteCards.length > 0) {
          updateCacheCounter();
          // 重新計算篩選
          let newResults = [];
          for (const card of state.allCards.values()) {
            if (matchesFilter(card, state.activeFilters)) {
              newResults.push(card);
            }
          }
          sortCards(newResults, state.activeFilters.sort);
          state.currentResults = newResults;
          renderCardGrid();
        }
      }, 350);
    }
  }

  function setLoading(loading) {
    state.isLoading = loading;
    const spinner = document.getElementById('searchSpinner');
    if (spinner) {
      spinner.style.display = loading ? 'inline-block' : 'none';
    }
  }

  // ================= 10. UI 畫面渲染 =================

  // 渲染中欄卡片網格/列表
  function renderCardGrid() {
    const container = document.getElementById('cardGridContainer');
    const statsEl = document.getElementById('resultsStats');
    if (!container) return;

    const total = state.currentResults.length;
    if (statsEl) {
      const lang = state.currentLang;
      statsEl.innerHTML = lang === 'zh_tw'
        ? `共找到 <strong>${total}</strong> 張卡片`
        : `共找到 <strong>${total}</strong> 张卡片`;
    }

    if (total === 0) {
      container.innerHTML = `
        <div class="empty-state">
          <div class="empty-icon">🎴</div>
          <h3>${state.currentLang === 'zh_tw' ? '未找到符合條件的卡片' : '未找到符合条件的卡片'}</h3>
          <p>${state.currentLang === 'zh_tw' ? '請嘗試放寬篩選條件或直接在上方搜尋框輸入卡名 / 效果 / ID' : '请尝试放宽筛选条件或直接在上方搜索框输入卡名 / 效果 / ID'}</p>
        </div>
      `;
      return;
    }

    // 依據目前檢視模式渲染
    if (state.viewMode === 'list') {
      container.className = 'card-list';
      container.innerHTML = state.currentResults.map(card => renderListItemHtml(card)).join('');
    } else {
      container.className = 'card-grid';
      container.innerHTML = state.currentResults.map(card => renderGridItemHtml(card)).join('');
    }

    // 綁定點擊事件與快捷加牌 (支援點擊查看、右鍵快速加牌、雙擊快速加牌)
    container.querySelectorAll('.card-item, .list-item').forEach(el => {
      const id = Number(el.dataset.id);
      el.addEventListener('click', () => {
        selectCard(id);
      });
      el.addEventListener('contextmenu', (e) => {
        e.preventDefault();
        addCardToDeck(id);
      });
      el.addEventListener('dblclick', (e) => {
        e.preventDefault();
        addCardToDeck(id);
      });
    });

    container.querySelectorAll('.card-quick-add').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const id = Number(btn.dataset.id);
        addCardToDeck(id);
      });
    });

    // 只有當使用者原本已主動選取某張卡片時，才更新選取狀態；刷新網站時不預設選取與跳出
    if (state.selectedCard) {
      const stillExists = state.currentResults.some(c => c.id === state.selectedCard.id);
      if (!stillExists) {
        state.selectedCard = null;
        renderCardInspector(null);
      } else {
        renderCardInspector(state.selectedCard);
      }
    } else {
      renderCardInspector(null);
    }
  }

  function renderGridItemHtml(card) {
    const lang = state.currentLang;
    const name = lang === 'zh_tw' ? card.zh_tw.name : card.zh_cn.name;
    const frameClass = getCardFrameClass(card.data.type);
    const attrInfo = getAttributeBadge(card.data.attribute, lang);
    const isSelected = state.selectedCard && state.selectedCard.id === card.id;

    // 搜尋詞動態高亮
    const searchTokens = getSearchTokens(state.activeFilters.search);
    const highlightedName = highlightSearchTermsInHtml(escapeHtml(name), searchTokens);

    // 數值顯示
    let statText = '';
    if (card.data.type & TYPE_MONSTER) {
      if (card.data.type & TYPE_LINK) {
        statText = `LINK-${card.data.level} / ATK ${card.data.atk}`;
      } else {
        statText = `★${card.data.level} ATK/${card.data.atk} DEF/${card.data.def}`;
      }
    } else if (card.data.type & TYPE_SPELL) {
      statText = lang === 'zh_tw' ? '魔法卡' : '魔法卡';
    } else if (card.data.type & TYPE_TRAP) {
      statText = lang === 'zh_tw' ? '陷阱卡' : '陷阱卡';
    }

    const imgUrls = getCardImageUrls(card.id);

    return `
      <div class="card-item ${isSelected ? 'selected' : ''}" data-id="${card.id}">
        <div class="card-theme-bar ${frameClass}"></div>
        <div class="card-img-wrap">
          <img class="card-img" src="${imgUrls[0]}" data-try-index="0" alt="${escapeHtml(name)}" loading="lazy" onerror="window.handleImageError(this, ${card.id})">
          <div class="card-overlay-badges">
            ${attrInfo ? `<div class="attr-icon-badge" style="background:${attrInfo.color}">${attrInfo.name}</div>` : '<div></div>'}
            ${card.ban_ocg < 3 ? `<div class="ban-badge limit-${card.ban_ocg}">${card.ban_ocg === 0 ? '禁' : card.ban_ocg}</div>` : ''}
          </div>
        </div>
        <div class="card-info">
          <div class="card-title-row">
            <span class="card-name" title="${escapeHtml(name)}">${highlightedName}</span>
          </div>
          <div class="card-stats-row">
            <span>${statText}</span>
          </div>
        </div>
        <button class="card-quick-add" data-id="${card.id}" title="${lang === 'zh_tw' ? '加入牌組' : '加入牌组'}">+</button>
      </div>
    `;
  }

  function renderListItemHtml(card) {
    const lang = state.currentLang;
    const name = lang === 'zh_tw' ? card.zh_tw.name : card.zh_cn.name;
    const typesStr = lang === 'zh_tw' ? card.zh_tw.typesStr : card.zh_cn.typesStr;
    const isSelected = state.selectedCard && state.selectedCard.id === card.id;
    const imgUrls = getCardImageUrls(card.id);

    // 搜尋詞動態高亮
    const searchTokens = getSearchTokens(state.activeFilters.search);
    const highlightedName = highlightSearchTermsInHtml(escapeHtml(name), searchTokens);

    return `
      <div class="list-item ${isSelected ? 'selected' : ''}" data-id="${card.id}">
        <img class="list-item-img" src="${imgUrls[0]}" data-try-index="0" alt="" onerror="window.handleImageError(this, ${card.id})">
        <div class="list-item-main">
          <div class="list-item-name">${highlightedName}</div>
          <div class="list-item-types">${escapeHtml(typesStr.split('\n')[0] || '')}</div>
        </div>
        <div class="list-item-stats">
          ${card.data.type & TYPE_MONSTER ? `ATK ${card.data.atk} / DEF ${card.data.def}` : ''}
        </div>
        <button class="card-quick-add list-quick-add" data-id="${card.id}" title="${lang === 'zh_tw' ? '加入牌組' : '加入牌组'}">+</button>
      </div>
    `;
  }

  // ================= 響應式 RWD 抽屜控制輔助函式 =================
  function openInspectorDrawer() {
    const inspectorEl = document.getElementById('cardInspector');
    const overlay = document.getElementById('inspectorDrawerOverlay');
    if (inspectorEl) inspectorEl.classList.add('mobile-open');
    if (overlay) overlay.classList.add('open');
  }

  function closeInspectorDrawer() {
    const inspectorEl = document.getElementById('cardInspector');
    const overlay = document.getElementById('inspectorDrawerOverlay');
    if (inspectorEl) inspectorEl.classList.remove('mobile-open');
    if (overlay) overlay.classList.remove('open');
  }

  function openFilterDrawer() {
    const filterEl = document.querySelector('.filter-sidebar');
    const overlay = document.getElementById('filterDrawerOverlay');
    if (filterEl) filterEl.classList.add('mobile-open');
    if (overlay) overlay.classList.add('open');
  }

  function closeFilterDrawer() {
    const filterEl = document.querySelector('.filter-sidebar');
    const overlay = document.getElementById('filterDrawerOverlay');
    if (filterEl) filterEl.classList.remove('mobile-open');
    if (overlay) overlay.classList.remove('open');
  }

  function updateFilterBadge() {
    let count = 0;
    const f = state.activeFilters;
    if (f.category && f.category !== 'ALL') count++;
    if (f.monsterTypes) count += f.monsterTypes.size;
    if (f.spellTypes) count += f.spellTypes.size;
    if (f.trapTypes) count += f.trapTypes.size;
    if (f.attributes) count += f.attributes.size;
    if (f.race && f.race !== 'ALL') count++;
    if (f.level && f.level !== 'ALL') count++;
    if (f.scale && f.scale !== 'ALL') count++;
    if (f.atkUnknown || f.atkMin || f.atkMax) count++;
    if (f.defUnknown || f.defMin || f.defMax) count++;
    if (f.linkMarkers) count += f.linkMarkers.size;
    if (f.effectTags) count += f.effectTags.size;
    if (f.banlist && f.banlist !== 'ALL') count++;

    const badge = document.getElementById('filterActiveBadge');
    if (badge) {
      if (count > 0) {
        badge.textContent = count;
        badge.style.display = 'inline-block';
      } else {
        badge.style.display = 'none';
      }
    }
  }

  // 選定並更新右側詳細檢視器 (Card Inspector)
  function selectCard(id) {
    const card = state.allCards.get(id);
    if (!card) return;
    state.selectedCard = card;

    // 刷新選取狀態 CSS
    document.querySelectorAll('.card-item, .list-item').forEach(el => {
      el.classList.toggle('selected', Number(el.dataset.id) === id);
    });

    renderCardInspector(card);

    // 行動版與平板 (<= 1100px)：點選卡片後自動滑出卡片詳情抽屜
    if (window.innerWidth <= 1100) {
      openInspectorDrawer();
    }
  }

  function renderCardInspector(card) {
    const inspectorEl = document.getElementById('cardInspector');
    if (!inspectorEl) return;

    if (!card) {
      const isTw = state.currentLang === 'zh_tw';
      inspectorEl.innerHTML = `
        <div class="empty-inspector-state" style="display:flex;flex-direction:column;align-items:center;justify-content:center;height:100%;min-height:360px;text-align:center;color:var(--text-muted);padding:2.5rem 1.5rem;">
          <div style="font-size:3.2rem;margin-bottom:1rem;opacity:0.35;">🎴</div>
          <div style="font-weight:600;font-size:1rem;margin-bottom:0.4rem;color:var(--text-main);">${isTw ? '尚未選取卡片' : '尚未选取卡片'}</div>
          <div style="font-size:0.82rem;line-height:1.6;color:var(--text-muted);">${isTw ? '點擊列表中的任何卡片<br>即可檢視完整效果與數值' : '点击列表中的任何卡片<br>即可检视完整效果与数值'}</div>
        </div>
      `;
      return;
    }

    const lang = state.currentLang;
    const name = lang === 'zh_tw' ? card.zh_tw.name : card.zh_cn.name;
    const subName = lang === 'zh_tw' ? card.zh_cn.name : card.zh_tw.name;
    const desc = lang === 'zh_tw' ? card.zh_tw.desc : card.zh_cn.desc;
    const pdesc = lang === 'zh_tw' ? card.zh_tw.pdesc : card.zh_cn.pdesc;
    const attrInfo = getAttributeBadge(card.data.attribute, lang);
    const raceName = getRaceName(card.data.race, lang);
    const isNormal = (card.data.type & TYPE_NORMAL) && !(card.data.type & TYPE_EFFECT);
    const isPendulum = (card.data.type & TYPE_PENDULUM) !== 0;
    const isLink = (card.data.type & TYPE_LINK) !== 0;
    const isXyz = (card.data.type & TYPE_XYZ) !== 0;

    const imgUrls = getCardImageUrls(card.id);

    // 取得當前搜尋詞與同義詞，用於效果文與卡名標記
    const searchTokens = getSearchTokens(state.activeFilters.search);
    const highlightedName = highlightSearchTermsInHtml(escapeHtml(name), searchTokens);

    const rawPdesc = renderStructuredEffect(pdesc, lang, false);
    const highlightedPdesc = highlightSearchTermsInHtml(rawPdesc, searchTokens);

    const rawDesc = renderStructuredEffect(desc, lang, isNormal);
    const highlightedDesc = highlightSearchTermsInHtml(rawDesc, searchTokens);

    // 取得卡片所屬字段 / 系列標籤
    const archetypes = getCardArchetypes(card);

    // 規制限額標籤
    let banText = lang === 'zh_tw' ? '無限制' : '无限制';
    let banClass = '';
    if (card.ban_ocg === 0) { banText = lang === 'zh_tw' ? '禁止卡 (0)' : '禁止卡 (0)'; banClass = 'badge-ban'; }
    if (card.ban_ocg === 1) { banText = lang === 'zh_tw' ? '限制卡 (1)' : '限制卡 (1)'; banClass = 'badge-limit'; }
    if (card.ban_ocg === 2) { banText = lang === 'zh_tw' ? '準限制卡 (2)' : '准限制卡 (2)'; banClass = 'badge-semi'; }

    inspectorEl.innerHTML = `
      <div class="inspector-top-bar">
        <span class="inspector-top-label">${lang === 'zh_tw' ? '卡片詳細資訊' : '卡片详细信息'}</span>
        <button class="btn-close-inspector" id="btnCloseInspector" title="${lang === 'zh_tw' ? '關閉卡片詳情' : '关闭卡片详情'}">✕</button>
      </div>

      <div class="inspector-card-art-box" id="inspectorCardArt" title="${lang === 'zh_tw' ? '點擊放大高畫質卡圖' : '点击放大高画质卡图'}">
        <img class="inspector-img" src="${imgUrls[0]}" data-try-index="0" alt="${escapeHtml(name)}" onerror="window.handleImageError(this, ${card.id})">
        <div class="zoom-hint-badge">🔍 ${lang === 'zh_tw' ? '點擊放大' : '点击放大'}</div>
      </div>

      <div class="inspector-header">
        <div class="inspector-title-row">
          <h2 class="inspector-card-name">${highlightedName}</h2>
          <button class="btn-copy-name" id="btnCopyName" title="${lang === 'zh_tw' ? '複製卡名' : '复制卡名'}">📋</button>
        </div>
        <div class="inspector-subnames">
          ${card.jp_name ? `<span class="subname-ja">🇯🇵 ${escapeHtml(card.jp_name)} ${card.jp_ruby ? `(${escapeHtml(card.jp_ruby)})` : ''}</span>` : ''}
          ${card.en_name ? `<span class="subname-en">🇺🇸 ${escapeHtml(card.en_name)}</span>` : ''}
        </div>
        <div class="inspector-id-row">
          <span class="id-badge" id="btnCopyId" title="${lang === 'zh_tw' ? '點擊複製 8 碼 Passcode' : '点击复制 8 码 Passcode'}">
            Passcode: <strong>${card.id}</strong>
          </span>
          <span class="badge-pill ${banClass}">${banText}</span>
        </div>
      </div>

      <div class="inspector-badges-row">
        ${attrInfo ? `<span class="badge-pill badge-attr" style="background:${attrInfo.color}">${attrInfo.name}</span>` : ''}
        ${raceName ? `<span class="badge-pill badge-race">${raceName}</span>` : ''}
        ${card.data.type & TYPE_MONSTER ? `
          <span class="badge-pill ${isXyz ? 'badge-rank' : isLink ? 'badge-link' : 'badge-level'}">
            ${isXyz ? `★ 階級 ${card.data.level}` : isLink ? `LINK-${card.data.level}` : `★ 等級 ${card.data.level}`}
          </span>
        ` : ''}
        ${isPendulum ? `<span class="badge-pill badge-scale">刻度 ${card.data.scale}</span>` : ''}
      </div>

      ${archetypes.length > 0 ? `
        <div class="inspector-archetypes-row" style="display:flex;align-items:center;flex-wrap:wrap;gap:0.35rem;margin-top:0.35rem;">
          <span style="font-size:0.75rem;color:var(--text-muted);font-weight:600;">${lang === 'zh_tw' ? '系列 / 記述：' : '系列 / 记述：'}</span>
          ${archetypes.map(a => `<span class="archetype-chip" data-archetype="${escapeHtml(a)}" title="${lang === 'zh_tw' ? `點擊檢索「${escapeHtml(a)}」全系列卡片` : `点击检索「${escapeHtml(a)}」全系列卡片`}">🏷️ ${escapeHtml(a)}</span>`).join('')}
        </div>
      ` : ''}

      ${card.data.type & TYPE_MONSTER ? `
        <div class="inspector-stats-grid">
          <div class="stat-box">
            <div class="stat-box-title">ATK / 攻擊力</div>
            <div class="stat-box-val">${card.data.atk === -1 ? '?' : card.data.atk}</div>
          </div>
          <div class="stat-box">
            <div class="stat-box-title">${isLink ? 'LINK' : 'DEF / 守備力'}</div>
            <div class="stat-box-val">${isLink ? card.data.level : card.data.def === -1 ? '?' : card.data.def}</div>
          </div>
          <div class="stat-box">
            <div class="stat-box-title">${isPendulum ? 'SCALE' : 'TYPE'}</div>
            <div class="stat-box-val">${isPendulum ? card.data.scale : '—'}</div>
          </div>
        </div>
      ` : ''}

      <div class="inspector-effect-section">
        ${isPendulum ? `
          <div class="pendulum-container">
            <div class="pendulum-header">
              <span>${lang === 'zh_tw' ? '靈擺效果' : '灵摆效果'} [刻度 ${card.data.scale}]</span>
            </div>
            <div class="pendulum-text">${highlightedPdesc}</div>
          </div>
        ` : ''}

        <div class="effect-container">
          <div class="effect-container-header">
            <span>${card.data.type & TYPE_MONSTER ? (lang === 'zh_tw' ? '怪獸效果 / 記述' : '怪兽效果 / 记述') : (lang === 'zh_tw' ? '卡片效果' : '卡片效果')}</span>
            <button class="btn-copy-name" id="btnCopyEffect" title="${lang === 'zh_tw' ? '複製效果文' : '复制效果文'}">📝</button>
          </div>
          <div class="effect-content">
            ${highlightedDesc}
          </div>
        </div>
      </div>

      <div class="inspector-actions-bar">
        <div class="deck-add-split-group" id="deckAddSplitGroup">
          <button class="action-btn action-btn-primary btn-add-main" id="btnAddDeck" title="${lang === 'zh_tw' ? `直接加入當前牌組「${escapeHtml(state.deck.name)}」` : `直接加入当前牌组「${escapeHtml(state.deck.name)}」`}">
            ➕ ${lang === 'zh_tw' ? `加入「${escapeHtml(state.deck.name)}」` : `加入「${escapeHtml(state.deck.name)}」`}
          </button>
          <button class="action-btn action-btn-primary btn-add-dropdown-arrow" id="btnDeckDropdownArrow" title="${lang === 'zh_tw' ? '選擇要加入哪一個牌組' : '选择要加入哪一个牌组'}">
            ▾
          </button>
          <div class="deck-target-popover" id="deckTargetPopover">
            <div class="popover-header">${lang === 'zh_tw' ? '選擇目標牌組' : '选择目标牌组'}</div>
            <div class="popover-deck-list" id="popoverDeckList">
              ${renderPopoverDeckListHtml(card.id)}
            </div>
            <div class="popover-footer">
              <button class="popover-action-btn" id="btnPopoverNewDeck">
                ➕ ${lang === 'zh_tw' ? '新增並加入至新牌組...' : '新增并加入至新牌组...'}
              </button>
            </div>
          </div>
        </div>
        <button class="action-btn action-btn-related" id="btnFindRelatedCards" title="${lang === 'zh_tw' ? '一鍵反向檢索與此卡相關的所有字段與記述卡片' : '一键反向检索与此卡相关的所有字段与记述卡片'}">
          🔍 ${lang === 'zh_tw' ? '關聯卡片' : '关联卡片'}
        </button>
        <button class="action-btn" id="btnYgocdbLink">
          🔗 ${lang === 'zh_tw' ? '百鴿卡查' : '百鸽卡查'}
        </button>
        <button class="action-btn" id="btnExportCardJson">
          💾 ${lang === 'zh_tw' ? '導出 JSON' : '导出 JSON'}
        </button>
      </div>
    `;

    // 註冊右欄互動監聽
    const btnCloseInspector = document.getElementById('btnCloseInspector');
    if (btnCloseInspector) {
      btnCloseInspector.addEventListener('click', closeInspectorDrawer);
    }

    const btnFindRelatedCards = document.getElementById('btnFindRelatedCards');
    if (btnFindRelatedCards) {
      btnFindRelatedCards.addEventListener('click', () => {
        let targetTerm = '';
        // 優先順序：效果文中記述的關鍵卡名/字段 -> 卡片自帶字段 -> 卡片自身名稱
        const quoteMatches = [];
        const qRegex = /[「『]([^」』]+)[」』]/g;
        const textToScan = ((card[lang] && card[lang].desc) || card.zh_tw.desc || '') + ' ' + ((card[lang] && card[lang].pdesc) || card.zh_tw.pdesc || '');
        let qm;
        while ((qm = qRegex.exec(textToScan)) !== null) {
          const q = qm[1].trim();
          if (q && q !== name && !quoteMatches.includes(q)) quoteMatches.push(q);
        }

        if (quoteMatches.length > 0) {
          targetTerm = quoteMatches[0];
        } else if (archetypes.length > 0) {
          targetTerm = archetypes[0];
        } else {
          // 沒有記述其他卡名或字段時，直接以自身卡名反向檢索（檢索所有指名/支援本卡的關聯卡）
          targetTerm = name;
        }
        searchRelated(targetTerm);
      });
    }

    inspectorEl.querySelectorAll('.quoted-card-link').forEach(link => {
      link.addEventListener('click', (e) => {
        e.stopPropagation();
        const rel = link.dataset.related;
        if (rel) {
          searchRelated(rel);
        }
      });
    });

    inspectorEl.querySelectorAll('.archetype-chip').forEach(chip => {
      chip.addEventListener('click', (e) => {
        e.stopPropagation();
        const arc = chip.dataset.archetype;
        if (arc) {
          searchRelated(arc);
        }
      });
    });

    document.getElementById('inspectorCardArt').addEventListener('click', () => {
      const activeImg = document.querySelector('#inspectorCardArt .inspector-img');
      const currentSrc = (activeImg && (activeImg.currentSrc || activeImg.src)) ? (activeImg.currentSrc || activeImg.src) : imgUrls[0];
      openLightbox(currentSrc, name, card);
    });

    document.getElementById('btnCopyName').addEventListener('click', () => {
      copyToClipboard(name, lang === 'zh_tw' ? '已複製卡名' : '已复制卡名');
    });

    document.getElementById('btnCopyId').addEventListener('click', () => {
      copyToClipboard(String(card.id), lang === 'zh_tw' ? '已複製 Passcode' : '已复制 Passcode');
    });

    document.getElementById('btnCopyEffect').addEventListener('click', () => {
      const fullText = (isPendulum ? `【靈擺效果】\n${pdesc}\n\n【怪獸效果】\n` : '') + desc;
      copyToClipboard(fullText, lang === 'zh_tw' ? '已複製效果文' : '已复制效果文');
    });

    document.getElementById('btnAddDeck').addEventListener('click', () => {
      addCardToDeck(card.id);
    });

    const btnDeckDropdownArrow = document.getElementById('btnDeckDropdownArrow');
    if (btnDeckDropdownArrow) {
      btnDeckDropdownArrow.addEventListener('click', (e) => {
        e.stopPropagation();
        toggleDeckTargetPopover();
      });
    }

    const btnPopoverNewDeck = document.getElementById('btnPopoverNewDeck');
    if (btnPopoverNewDeck) {
      btnPopoverNewDeck.addEventListener('click', (e) => {
        e.stopPropagation();
        closeDeckTargetPopover();
        openDeckNameModal('create', card.id);
      });
    }

    bindPopoverItemEvents(card.id);

    document.getElementById('btnYgocdbLink').addEventListener('click', () => {
      window.open(`https://ygocdb.com/card/${card.id}`, '_blank');
    });

    document.getElementById('btnExportCardJson').addEventListener('click', () => {
      const blob = new Blob([JSON.stringify(card.raw, null, 2)], { type: 'application/json' });
      const a = document.createElement('a');
      a.href = URL.createObjectURL(blob);
      a.download = `card_${card.id}.json`;
      a.click();
      showToast(lang === 'zh_tw' ? '已導出卡片 JSON' : '已导出卡片 JSON');
    });
  }

  // ================= 10b. 一鍵「關聯卡片 / 卡名記述」反向檢索 =================
  function searchRelated(term) {
    if (!term || !term.trim()) return;
    const cleanTerm = term.trim();

    // 1. 設定搜尋字詞與範圍（全欄位 all 涵蓋卡名、效果記述、字段）
    state.activeFilters.search = cleanTerm;
    state.activeFilters.scope = 'all';

    // 2. 同步更新搜尋欄與範圍選單 UI
    const searchInput = document.getElementById('mainSearchInput');
    if (searchInput) searchInput.value = cleanTerm;
    const clearBtn = document.getElementById('searchClearBtn');
    if (clearBtn) clearBtn.style.display = 'block';
    const scopeSelect = document.getElementById('searchScopeSelect');
    if (scopeSelect) scopeSelect.value = 'all';

    // 3. 執行檢索與渲染
    performFilterAndRender();

    // 4. 行動版 RWD：若在行動螢幕寬度下，自動關閉右側抽屜以顯示搜尋結果列表
    if (window.innerWidth <= 768) {
      closeInspectorDrawer();
    }

    // 5. 將視窗或網格滾動回頂端
    const cardGridContainer = document.getElementById('cardGridContainer');
    if (cardGridContainer) {
      cardGridContainer.scrollTop = 0;
    }

    // 6. 狀態提示
    const isTw = state.currentLang === 'zh_tw';
    showToast(isTw ? `已反向檢索「${cleanTerm}」關聯卡片` : `已反向检索「${cleanTerm}」关联卡片`);
  }

  // ================= 11. 牌組 (Deck Management) 核心邏輯 =================
  let deckModalMode = 'create'; // 'create' | 'rename'
  let pendingAutoAddCardId = null;

  function renderPopoverDeckListHtml(cardId) {
    const isTw = state.currentLang === 'zh_tw';
    return state.decks.map(d => {
      const isCurrent = d.id === state.activeDeckId;
      const count = d.main.reduce((acc, c) => acc + c.count, 0) + d.extra.reduce((acc, c) => acc + c.count, 0);
      return `
        <button class="popover-deck-item ${isCurrent ? 'active' : ''}" data-deck-id="${d.id}" title="${isTw ? `加入至「${escapeHtml(d.name)}」` : `加入至「${escapeHtml(d.name)}」`}">
          <span class="popover-deck-item-name">${escapeHtml(d.name)}</span>
          <div class="popover-deck-item-meta">
            ${isCurrent ? `<span class="popover-active-indicator">${isTw ? '使用中' : '使用中'}</span>` : ''}
            <span class="popover-count-badge">${count}張</span>
          </div>
        </button>
      `;
    }).join('');
  }

  function bindPopoverItemEvents(cardId) {
    const popoverList = document.getElementById('popoverDeckList');
    if (!popoverList) return;
    const items = popoverList.querySelectorAll('.popover-deck-item');
    items.forEach(item => {
      item.addEventListener('click', (e) => {
        e.stopPropagation();
        const targetDeckId = item.getAttribute('data-deck-id');
        if (targetDeckId) {
          addCardToDeck(cardId, targetDeckId);
          closeDeckTargetPopover();
        }
      });
    });
  }

  function toggleDeckTargetPopover() {
    const popover = document.getElementById('deckTargetPopover');
    if (popover) {
      popover.classList.toggle('open');
    }
  }

  function closeDeckTargetPopover() {
    const popover = document.getElementById('deckTargetPopover');
    if (popover) {
      popover.classList.remove('open');
    }
  }

  function updateInspectorDeckButtons() {
    const btnAddDeck = document.getElementById('btnAddDeck');
    const isTw = state.currentLang === 'zh_tw';
    if (btnAddDeck && state.deck) {
      btnAddDeck.innerHTML = `➕ ${isTw ? `加入「${escapeHtml(state.deck.name)}」` : `加入「${escapeHtml(state.deck.name)}」`}`;
      btnAddDeck.title = isTw ? `直接加入當前牌組「${escapeHtml(state.deck.name)}」` : `直接加入当前牌组「${escapeHtml(state.deck.name)}」`;
    }
    const popoverList = document.getElementById('popoverDeckList');
    if (popoverList && state.selectedCard) {
      popoverList.innerHTML = renderPopoverDeckListHtml(state.selectedCard.id);
      bindPopoverItemEvents(state.selectedCard.id);
    }
  }

  function renderDeckSelectOptions() {
    const select = document.getElementById('deckSelect');
    if (!select) return;
    select.innerHTML = state.decks.map(d => {
      const mainCount = d.main.reduce((acc, cur) => acc + cur.count, 0);
      const extraCount = d.extra.reduce((acc, cur) => acc + cur.count, 0);
      const isSelected = d.id === state.activeDeckId ? 'selected' : '';
      return `<option value="${d.id}" ${isSelected}>${escapeHtml(d.name)} (${mainCount + extraCount})</option>`;
    }).join('');
    select.value = state.activeDeckId;
  }

  function switchDeck(deckId) {
    const target = state.decks.find(d => d.id === deckId);
    if (!target) return;
    state.activeDeckId = deckId;
    saveDeckToStorage();
    renderDeckSelectOptions();
    renderDeckDrawer();
    updateDeckCounter();
    showToast(state.currentLang === 'zh_tw' ? `已切換至「${target.name}」` : `已切换至「${target.name}」`);
  }

  function openDeckNameModal(mode = 'create', autoAddCardId = null) {
    deckModalMode = mode;
    pendingAutoAddCardId = autoAddCardId;
    const modal = document.getElementById('deckNameModal');
    const titleEl = document.getElementById('deckModalTitle');
    const inputEl = document.getElementById('deckNameInput');
    const confirmBtn = document.getElementById('btnConfirmDeckModal');
    if (!modal || !inputEl) return;

    const isTw = state.currentLang === 'zh_tw';
    if (mode === 'create') {
      if (titleEl) titleEl.textContent = isTw ? '為新牌組取名' : '为新牌组取名';
      if (confirmBtn) confirmBtn.textContent = isTw ? '確認建立' : '确认建立';
      inputEl.value = isTw ? `新牌組 ${state.decks.length + 1}` : `新牌组 ${state.decks.length + 1}`;
    } else {
      if (titleEl) titleEl.textContent = isTw ? '修改牌組名稱' : '修改牌组名称';
      if (confirmBtn) confirmBtn.textContent = isTw ? '確認修改' : '确认修改';
      inputEl.value = state.deck.name || '';
    }

    modal.classList.add('open');
    setTimeout(() => {
      inputEl.focus();
      inputEl.select();
    }, 80);
  }

  function closeDeckNameModal() {
    const modal = document.getElementById('deckNameModal');
    if (modal) modal.classList.remove('open');
  }

  function handleConfirmDeckName() {
    const inputEl = document.getElementById('deckNameInput');
    if (!inputEl) return;
    const name = inputEl.value.trim();
    const isTw = state.currentLang === 'zh_tw';

    if (deckModalMode === 'create') {
      const finalName = name || (isTw ? `新牌組 ${state.decks.length + 1}` : `新牌组 ${state.decks.length + 1}`);
      const newDeck = {
        id: 'deck_' + Date.now() + '_' + Math.random().toString(36).substr(2, 5),
        name: finalName,
        main: [],
        extra: []
      };
      state.decks.push(newDeck);
      state.activeDeckId = newDeck.id;
      saveDeckToStorage();
      renderDeckSelectOptions();
      renderDeckDrawer();
      updateDeckCounter();
      closeDeckNameModal();
      if (pendingAutoAddCardId) {
        const toAdd = pendingAutoAddCardId;
        pendingAutoAddCardId = null;
        addCardToDeck(toAdd, newDeck.id);
      }
      showToast(isTw ? `已建立新牌組「${finalName}」` : `已建立新牌组「${finalName}」`);
    } else {
      if (!name) {
        showToast(isTw ? '牌組名稱不可為空' : '牌组名称不可为空');
        return;
      }
      state.deck.name = name;
      saveDeckToStorage();
      renderDeckSelectOptions();
      closeDeckNameModal();
      showToast(isTw ? `已將牌組重新命名為「${name}」` : `已将牌组重新命名为「${name}」`);
    }
  }

  function deleteCurrentDeck() {
    const isTw = state.currentLang === 'zh_tw';
    if (state.decks.length <= 1) {
      showToast(isTw ? '至少需保留一個牌組' : '至少需保留一个牌组');
      return;
    }
    const currentName = state.deck.name;
    const msg = isTw ? `確定要刪除「${currentName}」嗎？此操作無法還原。` : `确定要删除「${currentName}」吗？此操作无法还原。`;
    if (confirm(msg)) {
      state.decks = state.decks.filter(d => d.id !== state.activeDeckId);
      state.activeDeckId = state.decks[0].id;
      saveDeckToStorage();
      renderDeckSelectOptions();
      renderDeckDrawer();
      updateDeckCounter();
      showToast(isTw ? `已刪除「${currentName}」` : `已删除「${currentName}」`);
    }
  }

  function saveDeckToStorage() {
    try {
      const data = {
        activeDeckId: state.activeDeckId,
        decks: state.decks.map(d => ({
          id: d.id,
          name: d.name,
          main: d.main.map(i => ({ id: i.id, count: i.count })),
          extra: d.extra.map(i => ({ id: i.id, count: i.count }))
        }))
      };
      localStorage.setItem('ygo_saved_decks_v2', JSON.stringify(data));

      // 同步相容舊版單牌組存取
      const cur = state.deck;
      localStorage.setItem('ygo_saved_deck', JSON.stringify({
        main: cur.main.map(i => ({ id: i.id, count: i.count })),
        extra: cur.extra.map(i => ({ id: i.id, count: i.count }))
      }));
    } catch (e) { }
  }

  function loadDeckFromStorage() {
    try {
      const isTw = state.currentLang === 'zh_tw';
      const rawV2 = localStorage.getItem('ygo_saved_decks_v2');
      if (rawV2) {
        const data = JSON.parse(rawV2);
        if (data && Array.isArray(data.decks) && data.decks.length > 0) {
          state.decks = data.decks.map(d => {
            const main = Array.isArray(d.main) ? d.main.map(i => {
              const card = state.allCards.get(i.id);
              return { id: i.id, count: i.count, card: card || null };
            }).filter(i => i.card) : [];
            const extra = Array.isArray(d.extra) ? d.extra.map(i => {
              const card = state.allCards.get(i.id);
              return { id: i.id, count: i.count, card: card || null };
            }).filter(i => i.card) : [];
            return {
              id: d.id || 'deck_' + Math.random().toString(36).substr(2, 9),
              name: d.name || (isTw ? '我的牌組' : '我的牌组'),
              main,
              extra
            };
          });
          state.activeDeckId = data.activeDeckId || state.decks[0].id;
          renderDeckSelectOptions();
          renderDeckDrawer();
          updateDeckCounter();
          return;
        }
      }

      // 檢查舊版單牌組資料進行無縫遷移 (Migration)
      const rawV1 = localStorage.getItem('ygo_saved_deck');
      if (rawV1) {
        const dataV1 = JSON.parse(rawV1);
        if (dataV1 && (Array.isArray(dataV1.main) || Array.isArray(dataV1.extra))) {
          const main = Array.isArray(dataV1.main) ? dataV1.main.map(i => {
            const card = state.allCards.get(i.id);
            return { id: i.id, count: i.count, card: card || null };
          }).filter(i => i.card) : [];
          const extra = Array.isArray(dataV1.extra) ? dataV1.extra.map(i => {
            const card = state.allCards.get(i.id);
            return { id: i.id, count: i.count, card: card || null };
          }).filter(i => i.card) : [];

          state.decks = [{
            id: 'deck_1',
            name: isTw ? '預設牌組' : '预设牌组',
            main,
            extra
          }];
          state.activeDeckId = 'deck_1';
          saveDeckToStorage();
          renderDeckSelectOptions();
          renderDeckDrawer();
          updateDeckCounter();
          return;
        }
      }

      // 全新初始牌組
      state.decks = [{
        id: 'deck_1',
        name: isTw ? '預設牌組' : '预设牌组',
        main: [],
        extra: []
      }];
      state.activeDeckId = 'deck_1';
      renderDeckSelectOptions();
      renderDeckDrawer();
      updateDeckCounter();
    } catch (e) { }
  }

  function addCardToDeck(cardId, targetDeckId = null) {
    const card = state.allCards.get(cardId);
    if (!card) return;
    const targetDeck = targetDeckId ? (state.decks.find(d => d.id === targetDeckId) || state.deck) : state.deck;
    const isExtra = card.data.isExtra;
    const targetPool = isExtra ? targetDeck.extra : targetDeck.main;

    // 檢查同名卡不超過 3 張限制
    const existing = targetPool.find(item => item.id === cardId);
    if (existing) {
      if (existing.count >= 3) {
        showToast(state.currentLang === 'zh_tw' ? '同名卡至多投入 3 張' : '同名卡至多投入 3 张');
        return;
      }
      existing.count += 1;
    } else {
      // 檢查牌組上限
      const currentTotal = targetPool.reduce((acc, cur) => acc + cur.count, 0);
      const maxLimit = isExtra ? 15 : 60;
      if (currentTotal >= maxLimit) {
        showToast(state.currentLang === 'zh_tw' ? `${isExtra ? '額外' : '主'}牌組已滿 (${maxLimit}張)` : `${isExtra ? '额外' : '主'}牌组已满 (${maxLimit}张)`);
        return;
      }
      targetPool.push({ id: cardId, count: 1, card });
    }

    renderDeckDrawer();
    updateDeckCounter();
    saveDeckToStorage();
    const isTw = state.currentLang === 'zh_tw';
    const cardName = isTw ? card.zh_tw.name : card.zh_cn.name;
    showToast(isTw ? `已將「${cardName}」加入「${targetDeck.name}」` : `已将「${cardName}」加入「${targetDeck.name}」`);
  }

  function removeCardFromDeck(cardId, isExtra) {
    const targetPool = isExtra ? state.deck.extra : state.deck.main;
    const idx = targetPool.findIndex(item => item.id === cardId);
    if (idx !== -1) {
      if (targetPool[idx].count > 1) {
        targetPool[idx].count -= 1;
      } else {
        targetPool.splice(idx, 1);
      }
    }
    renderDeckDrawer();
    updateDeckCounter();
    saveDeckToStorage();
  }

  function updateDeckCounter() {
    const mainCount = state.deck.main.reduce((acc, cur) => acc + cur.count, 0);
    const extraCount = state.deck.extra.reduce((acc, cur) => acc + cur.count, 0);
    const totalCount = mainCount + extraCount;

    const badge = document.getElementById('deckTotalBadge');
    if (badge) {
      badge.textContent = totalCount;
    }
    const navLabel = document.getElementById('navDeckTrayLabel');
    if (navLabel) {
      navLabel.textContent = `🎴 牌組 [${state.deck.name}]`;
    }
    const mainHeader = document.getElementById('deckMainTitle');
    if (mainHeader) {
      mainHeader.innerHTML = `${state.currentLang === 'zh_tw' ? '主牌組 (Main Deck)' : '主牌组 (Main Deck)'} <span>${mainCount} / 60</span>`;
    }
    const extraHeader = document.getElementById('deckExtraTitle');
    if (extraHeader) {
      extraHeader.innerHTML = `${state.currentLang === 'zh_tw' ? '額外牌組 (Extra Deck)' : '额外牌组 (Extra Deck)'} <span>${extraCount} / 15</span>`;
    }
    renderDeckSelectOptions();
    updateInspectorDeckButtons();
  }

  function renderDeckDrawer() {
    const mainListEl = document.getElementById('deckMainList');
    const extraListEl = document.getElementById('deckExtraList');
    if (!mainListEl || !extraListEl) return;

    const lang = state.currentLang;

    const renderList = (items, isExtra) => {
      if (items.length === 0) {
        return `<div class="empty-state" style="padding:1rem;font-size:0.8rem;">${lang === 'zh_tw' ? '尚未加入卡片' : '尚未加入卡片'}</div>`;
      }
      return items.map(item => {
        const name = lang === 'zh_tw' ? item.card.zh_tw.name : item.card.zh_cn.name;
        const imgUrls = getCardImageUrls(item.id);
        return `
          <div class="deck-item-row" data-card-id="${item.id}" onclick="window.openCardDetailModal && window.openCardDetailModal(${item.id})">
            <img class="deck-item-thumb" src="${imgUrls[0]}" alt="" onerror="window.handleImageError(this, ${item.id})" title="${lang === 'zh_tw' ? '點擊查看完整卡片效果' : '点击查看完整卡片效果'}">
            <span class="deck-item-name" title="${escapeHtml(name)} (${lang === 'zh_tw' ? '點擊查看完整效果' : '点击查看完整效果'})">${escapeHtml(name)}</span>
            <span class="deck-item-qty">x${item.count}</span>
            <button class="deck-item-btn" onclick="event.stopPropagation(); window.removeCardFromDeck(${item.id}, ${isExtra})" title="${lang === 'zh_tw' ? '移除' : '移除'}">✕</button>
          </div>
        `;
      }).join('');
    };

    mainListEl.innerHTML = renderList(state.deck.main, false);
    extraListEl.innerHTML = renderList(state.deck.extra, true);
    updateDeckCounter();
  }

  // ================= 11b. 牌組區卡片完整效果彈窗 (Card Detail Modal) =================
  let modalActiveCard = null;

  function closeDeckDrawer() {
    const deckDrawer = document.getElementById('deckDrawer');
    const deckOverlay = document.getElementById('deckDrawerOverlay');
    if (deckDrawer) deckDrawer.classList.remove('open');
    if (deckOverlay) deckOverlay.classList.remove('open');
  }

  function openCardDetailModal(cardId) {
    try {
      const numericId = Number(cardId);
      let card = state.allCards.get(numericId) || state.allCards.get(cardId);
      if (!card) {
        const inMain = state.deck.main.find(i => Number(i.id) === numericId || i.id === cardId);
        const inExtra = state.deck.extra.find(i => Number(i.id) === numericId || i.id === cardId);
        card = (inMain && inMain.card) || (inExtra && inExtra.card) || null;
      }
      if (!card) {
        console.warn('openCardDetailModal: card not found for ID', cardId);
        return;
      }

      modalActiveCard = card;
      state.selectedCard = card;
      renderCardInspector(card);

      const modal = document.getElementById('cardDetailModal');
      if (!modal) {
        console.warn('openCardDetailModal: #cardDetailModal element not found');
        return;
      }

      renderCardDetailModalContent(card);
      modal.classList.add('open');
    } catch (err) {
      console.error('openCardDetailModal error:', err);
    }
  }

  function closeCardDetailModal() {
    const modal = document.getElementById('cardDetailModal');
    if (modal) {
      modal.classList.remove('open');
    }
    modalActiveCard = null;
  }

  // 立即掛載至全域以支援 inline onclick
  window.openCardDetailModal = openCardDetailModal;
  window.closeCardDetailModal = closeCardDetailModal;

  function renderCardDetailModalContent(card) {
    const modalTitle = document.getElementById('cardModalTitle');
    const modalSubNames = document.getElementById('cardModalSubNames');
    const modalBody = document.getElementById('cardModalBody');
    if (!modalBody) return;

    const lang = state.currentLang;
    const name = lang === 'zh_tw' ? card.zh_tw.name : card.zh_cn.name;
    const desc = lang === 'zh_tw' ? card.zh_tw.desc : card.zh_cn.desc;
    const pdesc = lang === 'zh_tw' ? card.zh_tw.pdesc : card.zh_cn.pdesc;
    const isNormal = (card.data.type & TYPE_NORMAL) !== 0;
    const isPendulum = (card.data.type & TYPE_PENDULUM) !== 0;
    const isLink = (card.data.type & TYPE_LINK) !== 0;
    const isXyz = (card.data.type & TYPE_XYZ) !== 0;

    const imgUrls = getCardImageUrls(card.id);
    const attrInfo = getAttributeBadge(card.data.attribute, lang);
    const raceName = getRaceName(card.data.race, lang);
    const archetypes = getCardArchetypes(card);

    // 格式化效果文
    const formattedDesc = renderStructuredEffect(desc, lang, isNormal);
    const formattedPdesc = renderStructuredEffect(pdesc, lang, false);

    // 計算在當前牌組投入張數
    const isExtra = card.data.isExtra;
    const targetPool = isExtra ? state.deck.extra : state.deck.main;
    const inDeckItem = targetPool.find(i => i.id === card.id);
    const currentQty = inDeckItem ? inDeckItem.count : 0;

    // 禁限狀態
    let banText = lang === 'zh_tw' ? '無限制' : '无限制';
    let banClass = '';
    if (card.ban_ocg === 0) { banText = lang === 'zh_tw' ? '禁止卡 (0)' : '禁止卡 (0)'; banClass = 'badge-ban'; }
    if (card.ban_ocg === 1) { banText = lang === 'zh_tw' ? '限制卡 (1)' : '限制卡 (1)'; banClass = 'badge-limit'; }
    if (card.ban_ocg === 2) { banText = lang === 'zh_tw' ? '準限制卡 (2)' : '准限制卡 (2)'; banClass = 'badge-semi'; }

    if (modalTitle) {
      modalTitle.textContent = name;
    }
    if (modalSubNames) {
      modalSubNames.innerHTML = `
        <span>Passcode: <strong>${card.id}</strong></span>
        ${card.jp_name ? `<span>🇯🇵 ${escapeHtml(card.jp_name)}</span>` : ''}
        ${card.en_name ? `<span>🇺🇸 ${escapeHtml(card.en_name)}</span>` : ''}
      `;
    }

    modalBody.innerHTML = `
      <div class="card-modal-hero">
        <div class="card-modal-art-box" id="cardModalArtBox" title="${lang === 'zh_tw' ? '點擊放大高畫質大圖' : '点击放大高画质大图'}">
          <img class="card-modal-art-img" src="${imgUrls[0]}" alt="${escapeHtml(name)}" onerror="window.handleImageError(this, ${card.id})">
          <div class="zoom-hint-badge" style="font-size:0.7rem;padding:2px 4px;">🔍 ${lang === 'zh_tw' ? '點擊放大' : '点击放大'}</div>
        </div>

        <div class="card-modal-meta">
          <div class="card-modal-badges">
            <span class="badge-pill ${banClass}">${banText}</span>
            ${attrInfo ? `<span class="badge-pill badge-attr" style="background:${attrInfo.color}">${attrInfo.name}</span>` : ''}
            ${raceName ? `<span class="badge-pill badge-race">${raceName}</span>` : ''}
            ${card.data.type & TYPE_MONSTER ? `
              <span class="badge-pill ${isXyz ? 'badge-rank' : isLink ? 'badge-link' : 'badge-level'}">
                ${isXyz ? `★ 階級 ${card.data.level}` : isLink ? `LINK-${card.data.level}` : `★ 等級 ${card.data.level}`}
              </span>
            ` : ''}
            ${isPendulum ? `<span class="badge-pill badge-scale">刻度 ${card.data.scale}</span>` : ''}
          </div>

          ${card.data.type & TYPE_MONSTER ? `
            <div class="inspector-stats-grid" style="margin-top:0.25rem;">
              <div class="stat-box">
                <div class="stat-box-title">ATK</div>
                <div class="stat-box-val val-atk">${card.data.atk >= 0 ? card.data.atk : '?'}</div>
              </div>
              <div class="stat-box">
                <div class="stat-box-title">${isLink ? 'LINK' : 'DEF'}</div>
                <div class="stat-box-val val-def">${isLink ? card.data.level : (card.data.def >= 0 ? card.data.def : '?')}</div>
              </div>
              <div class="stat-box">
                <div class="stat-box-title">${isPendulum ? 'SCALE' : 'TYPE'}</div>
                <div class="stat-box-val">${isPendulum ? card.data.scale : '—'}</div>
              </div>
            </div>
          ` : ''}

          ${archetypes.length > 0 ? `
            <div class="inspector-archetypes-row" style="display:flex;align-items:center;flex-wrap:wrap;gap:0.35rem;margin-top:0.25rem;">
              <span style="font-size:0.75rem;color:var(--text-muted);">${lang === 'zh_tw' ? '系列：' : '系列：'}</span>
              ${archetypes.map(arc => `<button class="archetype-chip" data-archetype="${escapeHtml(arc)}" title="${lang === 'zh_tw' ? `檢索「${escapeHtml(arc)}」全系列卡片` : `检索「${escapeHtml(arc)}」全系列卡片`}">🏷️ ${escapeHtml(arc)}</button>`).join('')}
            </div>
          ` : ''}

          <!-- 牌組即時張數調整器 -->
          <div class="card-modal-deck-row">
            <div class="card-modal-deck-status">
              <span>🎴 ${lang === 'zh_tw' ? `「${escapeHtml(state.deck.name)}」投入：` : `「${escapeHtml(state.deck.name)}」投入：`}</span>
              <span class="card-modal-deck-count-num" id="modalDeckCountDisplay">${currentQty} 張</span>
            </div>
            <div class="card-modal-qty-ctrls">
              <button class="card-modal-qty-btn" id="btnModalQtyMinus" ${currentQty <= 0 ? 'disabled' : ''} title="${lang === 'zh_tw' ? '減少 1 張' : '减少 1 张'}">－</button>
              <button class="card-modal-qty-btn" id="btnModalQtyPlus" ${currentQty >= 3 ? 'disabled' : ''} title="${lang === 'zh_tw' ? '增加 1 張' : '增加 1 张'}">＋</button>
            </div>
          </div>
        </div>
      </div>

      <!-- 效果文本區域 -->
      <div class="card-modal-effect-section">
        ${isPendulum ? `
          <div class="pendulum-container">
            <div class="pendulum-header">
              <span>${lang === 'zh_tw' ? '靈擺效果' : '灵摆效果'} [刻度 ${card.data.scale}]</span>
            </div>
            <div class="pendulum-text">${formattedPdesc}</div>
          </div>
        ` : ''}

        <div class="effect-container">
          <div class="effect-container-header">
            <span>${card.data.type & TYPE_MONSTER ? (lang === 'zh_tw' ? '怪獸效果 / 記述' : '怪兽效果 / 记述') : (lang === 'zh_tw' ? '卡片效果' : '卡片效果')}</span>
            <button class="btn-copy-name" id="btnModalCopyEffect" title="${lang === 'zh_tw' ? '複製效果文' : '复制效果文'}">📝</button>
          </div>
          <div class="effect-content">
            ${formattedDesc}
          </div>
        </div>
      </div>

      <!-- 底部動作工具列 -->
      <div class="card-modal-actions-bar">
        <button class="action-btn action-btn-related" id="btnModalRelatedCards" style="flex:1;">
          🔍 ${lang === 'zh_tw' ? '關聯卡片' : '关联卡片'}
        </button>
        <button class="action-btn" id="btnModalYgocdbLink" style="flex:1;">
          🔗 ${lang === 'zh_tw' ? '百鴿卡查' : '百鸽卡查'}
        </button>
        <button class="action-btn" id="btnModalCloseAction" style="width:90px;">
          ${lang === 'zh_tw' ? '關閉' : '关闭'}
        </button>
      </div>
    `;

    bindCardDetailModalEvents(card, archetypes);
  }

  function bindCardDetailModalEvents(card, archetypes) {
    const lang = state.currentLang;
    const name = lang === 'zh_tw' ? card.zh_tw.name : card.zh_cn.name;
    const desc = lang === 'zh_tw' ? card.zh_tw.desc : card.zh_cn.desc;
    const pdesc = lang === 'zh_tw' ? card.zh_tw.pdesc : card.zh_cn.pdesc;
    const isPendulum = (card.data.type & TYPE_PENDULUM) !== 0;

    // 點擊卡圖放大 Lightbox
    const artBox = document.getElementById('cardModalArtBox');
    if (artBox) {
      artBox.addEventListener('click', () => {
        const imgUrls = getCardImageUrls(card.id);
        openLightbox(imgUrls[0], name, card);
      });
    }

    // 複製效果文
    const copyBtn = document.getElementById('btnModalCopyEffect');
    if (copyBtn) {
      copyBtn.addEventListener('click', () => {
        const fullText = (isPendulum ? `【靈擺效果】\n${pdesc}\n\n【怪獸效果】\n` : '') + desc;
        copyToClipboard(fullText, lang === 'zh_tw' ? '已複製效果文' : '已复制效果文');
      });
    }

    // 增加張數 [+]
    const btnPlus = document.getElementById('btnModalQtyPlus');
    if (btnPlus) {
      btnPlus.addEventListener('click', () => {
        addCardToDeck(card.id);
        renderCardDetailModalContent(card);
      });
    }

    // 減少張數 [-]
    const btnMinus = document.getElementById('btnModalQtyMinus');
    if (btnMinus) {
      btnMinus.addEventListener('click', () => {
        removeCardFromDeck(card.id, card.data.isExtra);
        renderCardDetailModalContent(card);
      });
    }

    // 關聯卡片檢索
    const btnRelated = document.getElementById('btnModalRelatedCards');
    if (btnRelated) {
      btnRelated.addEventListener('click', () => {
        closeCardDetailModal();
        closeDeckDrawer();
        let targetTerm = '';
        const quoteMatches = [];
        const qRegex = /[「『]([^」』]+)[」』]/g;
        const textToScan = ((card[lang] && card[lang].desc) || card.zh_tw.desc || '') + ' ' + ((card[lang] && card[lang].pdesc) || card.zh_tw.pdesc || '');
        let qm;
        while ((qm = qRegex.exec(textToScan)) !== null) {
          const q = qm[1].trim();
          if (q && q !== name && !quoteMatches.includes(q)) quoteMatches.push(q);
        }
        if (quoteMatches.length > 0) {
          targetTerm = quoteMatches[0];
        } else if (archetypes.length > 0) {
          targetTerm = archetypes[0];
        } else {
          targetTerm = name;
        }
        searchRelated(targetTerm);
      });
    }

    // 系列標籤點擊
    document.querySelectorAll('#cardModalBody .archetype-chip').forEach(chip => {
      chip.addEventListener('click', () => {
        const arc = chip.dataset.archetype;
        if (arc) {
          closeCardDetailModal();
          closeDeckDrawer();
          searchRelated(arc);
        }
      });
    });

    // 點擊效果文中帶引號的卡名跳轉
    document.querySelectorAll('#cardModalBody .quoted-card-link').forEach(link => {
      link.addEventListener('click', (e) => {
        const cardTerm = e.target.dataset.cardName;
        if (cardTerm) {
          closeCardDetailModal();
          closeDeckDrawer();
          searchRelated(cardTerm);
        }
      });
    });

    // 百鴿卡查
    const btnYgo = document.getElementById('btnModalYgocdbLink');
    if (btnYgo) {
      btnYgo.addEventListener('click', () => {
        window.open(`https://ygocdb.com/card/${card.id}`, '_blank');
      });
    }

    // 關閉按鈕
    const btnCloseAction = document.getElementById('btnModalCloseAction');
    if (btnCloseAction) {
      btnCloseAction.addEventListener('click', closeCardDetailModal);
    }
  }

  // 匯出 .ydk 檔案 (相容 YGOPro, EDOPRO, Master Duel)
  function exportYDK() {
    let ydkContent = '#created by Yu-Gi-Oh Playtest Tool\n#main\n';
    for (const item of state.deck.main) {
      for (let i = 0; i < item.count; i++) {
        ydkContent += `${item.id}\n`;
      }
    }
    ydkContent += '#extra\n';
    for (const item of state.deck.extra) {
      for (let i = 0; i < item.count; i++) {
        ydkContent += `${item.id}\n`;
      }
    }
    ydkContent += '!side\n';

    const blob = new Blob([ydkContent], { type: 'text/plain;charset=utf-8' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    const safeName = (state.deck.name || 'deck').replace(/[\\/:*?"<>|]/g, '_');
    a.download = `${safeName}.ydk`;
    a.click();
    showToast(state.currentLang === 'zh_tw' ? `已下載 ${safeName}.ydk 檔案` : `已下载 ${safeName}.ydk 文件`);
  }

  // 匯入 .ydk 牌組檔案
  async function importYDKFile(file) {
    if (!file) return;
    try {
      const text = await file.text();
      const lines = text.split(/\r?\n/).map(l => l.trim()).filter(Boolean);

      let section = 'main';
      const mainIds = [];
      const extraIds = [];

      for (const line of lines) {
        if (line.startsWith('#main')) {
          section = 'main';
          continue;
        }
        if (line.startsWith('#extra')) {
          section = 'extra';
          continue;
        }
        if (line.startsWith('!side') || line.startsWith('#')) {
          section = 'ignore';
          continue;
        }

        const id = parseInt(line, 10);
        if (!isNaN(id) && id > 0) {
          if (section === 'main') mainIds.push(id);
          else if (section === 'extra') extraIds.push(id);
        }
      }

      if (mainIds.length === 0 && extraIds.length === 0) {
        showToast(state.currentLang === 'zh_tw' ? '檔案中未包含有效的卡片 Passcode' : '文件中未包含有效的卡片 Passcode');
        return;
      }

      showToast(state.currentLang === 'zh_tw' ? `正在載入 ${mainIds.length + extraIds.length} 張卡片...` : `正在载入 ${mainIds.length + extraIds.length} 张卡片...`);

      state.deck.main = [];
      state.deck.extra = [];

      const loadCardById = async (id) => {
        if (state.allCards.has(id)) {
          return state.allCards.get(id);
        }
        try {
          const resp = await fetch(`https://ygocdb.com/api/v0/card/${id}`);
          if (resp.ok) {
            const raw = await resp.json();
            const card = normalizeCard(raw);
            if (card) {
              state.allCards.set(card.id, card);
              saveCardToDB(card);
              return card;
            }
          }
        } catch (e) {
          console.warn('線上讀取卡片失敗:', id, e);
        }
        return null;
      };

      // 聚合 Main Deck
      const mainCountMap = {};
      for (const id of mainIds) mainCountMap[id] = (mainCountMap[id] || 0) + 1;
      for (const idStr in mainCountMap) {
        const id = Number(idStr);
        const card = await loadCardById(id);
        if (card) {
          state.deck.main.push({ id, count: mainCountMap[id], card });
        }
      }

      // 聚合 Extra Deck
      const extraCountMap = {};
      for (const id of extraIds) extraCountMap[id] = (extraCountMap[id] || 0) + 1;
      for (const idStr in extraCountMap) {
        const id = Number(idStr);
        const card = await loadCardById(id);
        if (card) {
          state.deck.extra.push({ id, count: extraCountMap[id], card });
        }
      }

      updateCacheCounter();
      renderDeckDrawer();
      updateDeckCounter();
      saveDeckToStorage();
      performFilterAndRender();
      showToast(state.currentLang === 'zh_tw' ? '牌組匯入成功！' : '牌组导入成功！');
    } catch (err) {
      console.error(err);
      showToast(state.currentLang === 'zh_tw' ? '牌組解析失敗' : '牌组解析失败');
    }
  }

  // 匯出純文字清單 (ID 或 卡名)
  function exportTextList() {
    const lang = state.currentLang;
    let text = `=== ${lang === 'zh_tw' ? '主牌組' : '主牌组'} ===\n`;
    for (const item of state.deck.main) {
      const name = lang === 'zh_tw' ? item.card.zh_tw.name : item.card.zh_cn.name;
      text += `${name} x${item.count} (${item.id})\n`;
    }
    text += `\n=== ${lang === 'zh_tw' ? '額外牌組' : '额外牌组'} ===\n`;
    for (const item of state.deck.extra) {
      const name = lang === 'zh_tw' ? item.card.zh_tw.name : item.card.zh_cn.name;
      text += `${name} x${item.count} (${item.id})\n`;
    }
    copyToClipboard(text, lang === 'zh_tw' ? '已複製牌組文字清單' : '已复制牌组文字清单');
  }

  // ================= 12. 輔助功能 (Toast, Lightbox, 剪貼簿) =================
  function showToast(msg) {
    let container = document.querySelector('.toast-container');
    if (!container) {
      container = document.createElement('div');
      container.className = 'toast-container';
      document.body.appendChild(container);
    }
    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.innerHTML = `<span>✨</span><span>${escapeHtml(msg)}</span>`;
    container.appendChild(toast);
    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transition = 'opacity 0.3s';
      setTimeout(() => toast.remove(), 300);
    }, 2200);
  }

  function copyToClipboard(text, successMsg) {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).then(() => {
        showToast(successMsg);
      }).catch(() => fallbackCopy(text, successMsg));
    } else {
      fallbackCopy(text, successMsg);
    }
  }

  function fallbackCopy(text, successMsg) {
    const ta = document.createElement('textarea');
    ta.value = text;
    document.body.appendChild(ta);
    ta.select();
    document.execCommand('copy');
    document.body.removeChild(ta);
    showToast(successMsg);
  }

  function openLightbox(imgUrl, title, card) {
    const modal = document.getElementById('lightboxModal');
    const img = document.getElementById('lightboxImg');
    if (!modal || !img) return;
    img.src = imgUrl;
    img.dataset.tryIndex = '0';
    if (card) {
      img.onerror = () => handleImageError(img, card);
    }
    modal.classList.add('open');
  }

  function closeLightbox() {
    const modal = document.getElementById('lightboxModal');
    if (modal) modal.classList.remove('open');
  }

  // ================= 12.5 搜尋歷史記錄管理 =================
  const MAX_HISTORY = 10;

  function getSearchHistory() {
    try {
      const raw = localStorage.getItem('ygo_search_history');
      return raw ? JSON.parse(raw) : [];
    } catch (e) {
      return [];
    }
  }

  function saveSearchHistory(query) {
    if (!query || !query.trim()) return;
    const q = query.trim();
    let history = getSearchHistory();
    history = history.filter(item => item !== q);
    history.unshift(q);
    if (history.length > MAX_HISTORY) {
      history = history.slice(0, MAX_HISTORY);
    }
    try {
      localStorage.setItem('ygo_search_history', JSON.stringify(history));
    } catch (e) { }
    renderSearchHistory();
  }

  function removeSearchHistoryItem(query) {
    let history = getSearchHistory();
    history = history.filter(item => item !== query);
    try {
      localStorage.setItem('ygo_search_history', JSON.stringify(history));
    } catch (e) { }
    renderSearchHistory();
  }

  function clearSearchHistory() {
    try {
      localStorage.removeItem('ygo_search_history');
    } catch (e) { }
    renderSearchHistory();
    showToast(state.currentLang === 'zh_tw' ? '已清除搜尋紀錄' : '已清除搜索记录');
  }

  function renderSearchHistory() {
    const container = document.getElementById('searchHistoryChips');
    if (!container) return;
    const history = getSearchHistory();
    const lang = state.currentLang;

    if (history.length === 0) {
      container.innerHTML = `<span class="history-empty">${lang === 'zh_tw' ? '尚無搜尋紀錄' : '暂无搜索记录'}</span>`;
      return;
    }

    container.innerHTML = history.map(item => `
      <div class="history-chip" data-history="${escapeHtml(item)}" title="${lang === 'zh_tw' ? '點擊搜尋' : '点击搜索'}">
        <span>🕒</span>
        <span class="history-text">${escapeHtml(item)}</span>
        <button class="history-del-btn" data-del-history="${escapeHtml(item)}" title="${lang === 'zh_tw' ? '刪除此筆紀錄' : '删除此条记录'}">×</button>
      </div>
    `).join('');
  }

  // ================= 13. 事件綁定與初始化 =================
  function setupEventListeners() {
    // 清除快取按鈕
    const btnClearCache = document.getElementById('btnClearCache');
    if (btnClearCache) {
      btnClearCache.addEventListener('click', clearLocalCache);
    }

    // 語系切換
    const btnLangToggle = document.getElementById('btnLangToggle');
    if (btnLangToggle) {
      btnLangToggle.addEventListener('click', () => {
        state.currentLang = state.currentLang === 'zh_tw' ? 'zh_cn' : 'zh_tw';
        localStorage.setItem('ygo_lang', state.currentLang);
        updateLanguageUI();
        performFilterAndRender();
        if (state.selectedCard) {
          renderCardInspector(state.selectedCard);
        }
        renderDeckDrawer();
        showToast(state.currentLang === 'zh_tw' ? '已切換為：繁體中文 (台灣用語)' : '已切换为：简体中文');
      });
    }

    // 搜尋輸入
    const searchInput = document.getElementById('mainSearchInput');
    const clearBtn = document.getElementById('searchClearBtn');
    const scopeSelect = document.getElementById('searchScopeSelect');

    if (searchInput) {
      searchInput.addEventListener('input', (e) => {
        state.activeFilters.search = e.target.value;
        if (clearBtn) {
          clearBtn.style.display = e.target.value ? 'block' : 'none';
        }
        performFilterAndRender();
      });

      searchInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
          const val = searchInput.value.trim();
          if (val) saveSearchHistory(val);
        }
      });
    }

    if (clearBtn) {
      clearBtn.addEventListener('click', () => {
        if (searchInput) searchInput.value = '';
        state.activeFilters.search = '';
        clearBtn.style.display = 'none';
        performFilterAndRender();
      });
    }

    if (scopeSelect) {
      scopeSelect.addEventListener('change', (e) => {
        state.activeFilters.scope = e.target.value;
        performFilterAndRender();
      });
    }

    // 清除所有歷史紀錄按鈕
    const btnClearHistory = document.getElementById('btnClearSearchHistory');
    if (btnClearHistory) {
      btnClearHistory.addEventListener('click', (e) => {
        e.stopPropagation();
        clearSearchHistory();
      });
    }

    // 點擊歷史紀錄標籤（或刪除單筆紀錄）
    const historyContainer = document.getElementById('searchHistoryChips');
    if (historyContainer) {
      historyContainer.addEventListener('click', (e) => {
        const delBtn = e.target.closest('.history-del-btn');
        if (delBtn) {
          e.stopPropagation();
          const targetQuery = delBtn.dataset.delHistory;
          if (targetQuery) removeSearchHistoryItem(targetQuery);
          return;
        }

        const chip = e.target.closest('.history-chip');
        if (chip) {
          const query = chip.dataset.history;
          if (query) {
            if (searchInput) searchInput.value = query;
            state.activeFilters.search = query;
            if (clearBtn) clearBtn.style.display = 'block';
            saveSearchHistory(query);
            performFilterAndRender();
          }
        }
      });
    }

    // 點擊右側卡片詳細頁的系列標籤 (如 🏷️ 罪寶 / 🏷️ 蛇眼 / 🏷️ 閃刀姬 等)
    document.addEventListener('click', (e) => {
      const chip = e.target.closest('.archetype-chip');
      if (chip) {
        const archetype = chip.dataset.archetype;
        if (archetype) {
          if (searchInput) searchInput.value = archetype;
          state.activeFilters.search = archetype;
          state.activeFilters.scope = 'archetype';
          if (scopeSelect) scopeSelect.value = 'archetype';
          if (clearBtn) clearBtn.style.display = 'block';

          // 重設主種類為 ALL，使怪獸/魔法/陷阱全系列都能檢索出來
          state.activeFilters.category = 'ALL';
          state.activeFilters.monsterTypes.clear();
          state.activeFilters.spellTypes.clear();
          state.activeFilters.trapTypes.clear();
          document.querySelectorAll('.segment-btn').forEach(b => {
            b.classList.toggle('active', b.dataset.category === 'ALL');
          });
          document.querySelectorAll('.tag-checkbox-btn').forEach(b => b.classList.remove('active'));
          const monsterSection = document.getElementById('monsterFilterSection');
          const spellSection = document.getElementById('spellFilterSection');
          const trapSection = document.getElementById('trapFilterSection');
          if (monsterSection) monsterSection.style.display = 'flex';
          if (spellSection) spellSection.style.display = 'flex';
          if (trapSection) trapSection.style.display = 'flex';

          performFilterAndRender();
          showToast(state.currentLang === 'zh_tw' ? `已切換為「${archetype}」系列字段檢索` : `已切换为「${archetype}」系列字段检索`);
        }
      }
    });

    // 種類切換分段器 (全部/怪獸/魔法/陷阱)
    document.querySelectorAll('.segment-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('.segment-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        state.activeFilters.category = btn.dataset.category;

        // 依據種類切換對應子過濾面板顯示
        const monsterSection = document.getElementById('monsterFilterSection');
        const spellSection = document.getElementById('spellFilterSection');
        const trapSection = document.getElementById('trapFilterSection');
        const linkSection = document.getElementById('linkMarkerSection');
        if (monsterSection) monsterSection.style.display = (btn.dataset.category === 'MONSTER' || btn.dataset.category === 'ALL') ? 'flex' : 'none';
        if (linkSection) linkSection.style.display = (btn.dataset.category === 'MONSTER' || btn.dataset.category === 'ALL') ? 'block' : 'none';
        if (spellSection) spellSection.style.display = (btn.dataset.category === 'SPELL' || btn.dataset.category === 'ALL') ? 'flex' : 'none';
        if (trapSection) trapSection.style.display = (btn.dataset.category === 'TRAP' || btn.dataset.category === 'ALL') ? 'flex' : 'none';

        performFilterAndRender();
      });
    });

    // 連結怪獸八向箭頭標記 (Link Markers)
    document.querySelectorAll('.link-arrow-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const marker = Number(btn.dataset.marker);
        if (state.activeFilters.linkMarkers.has(marker)) {
          state.activeFilters.linkMarkers.delete(marker);
          btn.classList.remove('active');
        } else {
          state.activeFilters.linkMarkers.add(marker);
          btn.classList.add('active');
          if (state.activeFilters.category === 'ALL') {
            state.activeFilters.category = 'MONSTER';
            document.querySelectorAll('.segment-btn').forEach(b => {
              b.classList.toggle('active', b.dataset.category === 'MONSTER');
            });
          }
        }
        performFilterAndRender();
      });
    });

    const btnResetLinkMarkers = document.getElementById('btnResetLinkMarkers');
    if (btnResetLinkMarkers) {
      btnResetLinkMarkers.addEventListener('click', () => {
        state.activeFilters.linkMarkers.clear();
        document.querySelectorAll('.link-arrow-btn').forEach(b => b.classList.remove('active'));
        performFilterAndRender();
      });
    }

    // 常用效果分類標籤 (Effect Tags)
    document.querySelectorAll('.effect-tag-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const tag = btn.dataset.effectTag;
        if (state.activeFilters.effectTags.has(tag)) {
          state.activeFilters.effectTags.delete(tag);
          btn.classList.remove('active');
        } else {
          state.activeFilters.effectTags.add(tag);
          btn.classList.add('active');
        }
        performFilterAndRender();
      });
    });

    const btnResetEffectTags = document.getElementById('btnResetEffectTags');
    if (btnResetEffectTags) {
      btnResetEffectTags.addEventListener('click', () => {
        state.activeFilters.effectTags.clear();
        document.querySelectorAll('.effect-tag-btn').forEach(b => b.classList.remove('active'));
        performFilterAndRender();
      });
    }

    // 怪獸特殊種類 Tag 多選
    document.querySelectorAll('[data-monster-type]').forEach(btn => {
      btn.addEventListener('click', () => {
        const mask = Number(btn.dataset.monsterType);
        if (state.activeFilters.monsterTypes.has(mask)) {
          state.activeFilters.monsterTypes.delete(mask);
          btn.classList.remove('active');
        } else {
          state.activeFilters.monsterTypes.add(mask);
          btn.classList.add('active');
          // 自動將主分類切換為怪獸，視覺與篩選狀態保持一致
          if (state.activeFilters.category === 'ALL') {
            state.activeFilters.category = 'MONSTER';
            document.querySelectorAll('.segment-btn').forEach(b => {
              b.classList.toggle('active', b.dataset.category === 'MONSTER');
            });
          }
        }
        performFilterAndRender();
      });
    });

    // 魔法種類 Tag
    document.querySelectorAll('[data-spell-type]').forEach(btn => {
      btn.addEventListener('click', () => {
        const mask = Number(btn.dataset.spellType);
        if (state.activeFilters.spellTypes.has(mask)) {
          state.activeFilters.spellTypes.delete(mask);
          btn.classList.remove('active');
        } else {
          state.activeFilters.spellTypes.add(mask);
          btn.classList.add('active');
          if (state.activeFilters.category === 'ALL') {
            state.activeFilters.category = 'SPELL';
            document.querySelectorAll('.segment-btn').forEach(b => {
              b.classList.toggle('active', b.dataset.category === 'SPELL');
            });
          }
        }
        performFilterAndRender();
      });
    });

    // 陷阱種類 Tag
    document.querySelectorAll('[data-trap-type]').forEach(btn => {
      btn.addEventListener('click', () => {
        const mask = Number(btn.dataset.trapType);
        if (state.activeFilters.trapTypes.has(mask)) {
          state.activeFilters.trapTypes.delete(mask);
          btn.classList.remove('active');
        } else {
          state.activeFilters.trapTypes.add(mask);
          btn.classList.add('active');
          if (state.activeFilters.category === 'ALL') {
            state.activeFilters.category = 'TRAP';
            document.querySelectorAll('.segment-btn').forEach(b => {
              b.classList.toggle('active', b.dataset.category === 'TRAP');
            });
          }
        }
        performFilterAndRender();
      });
    });

    // 屬性按鈕
    document.querySelectorAll('.attr-chip').forEach(btn => {
      btn.addEventListener('click', () => {
        const attrMask = Number(btn.dataset.mask);
        if (state.activeFilters.attributes.has(attrMask)) {
          state.activeFilters.attributes.delete(attrMask);
          btn.classList.remove('active');
        } else {
          state.activeFilters.attributes.add(attrMask);
          btn.classList.add('active');
        }
        performFilterAndRender();
      });
    });

    // 種族選單
    const raceSelect = document.getElementById('raceSelect');
    if (raceSelect) {
      raceSelect.addEventListener('change', (e) => {
        state.activeFilters.race = e.target.value;
        performFilterAndRender();
      });
    }

    // 等級選單
    const levelSelect = document.getElementById('levelSelect');
    if (levelSelect) {
      levelSelect.addEventListener('change', (e) => {
        state.activeFilters.level = e.target.value;
        performFilterAndRender();
      });
    }

    // 靈擺刻度選單
    const scaleSelect = document.getElementById('scaleSelect');
    if (scaleSelect) {
      scaleSelect.addEventListener('change', (e) => {
        state.activeFilters.scale = e.target.value;
        performFilterAndRender();
      });
    }

    // 攻防輸入與預設按鈕
    const atkMinInput = document.getElementById('atkMin');
    const atkMaxInput = document.getElementById('atkMax');
    const defMinInput = document.getElementById('defMin');
    const defMaxInput = document.getElementById('defMax');

    if (atkMinInput) {
      atkMinInput.addEventListener('input', (e) => {
        state.activeFilters.atkMin = e.target.value;
        if (state.activeFilters.atkUnknown) {
          state.activeFilters.atkUnknown = false;
          const b = document.getElementById('btnAtkUnknown');
          if (b) b.classList.remove('active');
        }
        performFilterAndRender();
      });
    }
    if (atkMaxInput) {
      atkMaxInput.addEventListener('input', (e) => {
        state.activeFilters.atkMax = e.target.value;
        if (state.activeFilters.atkUnknown) {
          state.activeFilters.atkUnknown = false;
          const b = document.getElementById('btnAtkUnknown');
          if (b) b.classList.remove('active');
        }
        performFilterAndRender();
      });
    }
    if (defMinInput) {
      defMinInput.addEventListener('input', (e) => {
        state.activeFilters.defMin = e.target.value;
        if (state.activeFilters.defUnknown) {
          state.activeFilters.defUnknown = false;
          const b = document.getElementById('btnDefUnknown');
          if (b) b.classList.remove('active');
        }
        performFilterAndRender();
      });
    }
    if (defMaxInput) {
      defMaxInput.addEventListener('input', (e) => {
        state.activeFilters.defMax = e.target.value;
        if (state.activeFilters.defUnknown) {
          state.activeFilters.defUnknown = false;
          const b = document.getElementById('btnDefUnknown');
          if (b) b.classList.remove('active');
        }
        performFilterAndRender();
      });
    }

    // 攻守快選數值
    document.querySelectorAll('.stat-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const target = btn.dataset.target;
        const val = btn.dataset.val;
        if (val === '?') return; // 由專屬未知按鈕處理
        if (target === 'atk') {
          if (atkMinInput) atkMinInput.value = val;
          state.activeFilters.atkMin = val;
          if (state.activeFilters.atkUnknown) {
            state.activeFilters.atkUnknown = false;
            const b = document.getElementById('btnAtkUnknown');
            if (b) b.classList.remove('active');
          }
        } else if (target === 'def') {
          if (defMinInput) defMinInput.value = val;
          state.activeFilters.defMin = val;
          if (state.activeFilters.defUnknown) {
            state.activeFilters.defUnknown = false;
            const b = document.getElementById('btnDefUnknown');
            if (b) b.classList.remove('active');
          }
        }
        performFilterAndRender();
      });
    });

    // 攻擊力 / 守備力 ? 專屬切換
    const btnAtkUnknown = document.getElementById('btnAtkUnknown');
    if (btnAtkUnknown) {
      btnAtkUnknown.addEventListener('click', () => {
        state.activeFilters.atkUnknown = !state.activeFilters.atkUnknown;
        btnAtkUnknown.classList.toggle('active', state.activeFilters.atkUnknown);
        if (state.activeFilters.atkUnknown) {
          state.activeFilters.atkMin = '';
          state.activeFilters.atkMax = '';
          if (atkMinInput) atkMinInput.value = '';
          if (atkMaxInput) atkMaxInput.value = '';
        }
        performFilterAndRender();
      });
    }

    const btnDefUnknown = document.getElementById('btnDefUnknown');
    if (btnDefUnknown) {
      btnDefUnknown.addEventListener('click', () => {
        state.activeFilters.defUnknown = !state.activeFilters.defUnknown;
        btnDefUnknown.classList.toggle('active', state.activeFilters.defUnknown);
        if (state.activeFilters.defUnknown) {
          state.activeFilters.defMin = '';
          state.activeFilters.defMax = '';
          if (defMinInput) defMinInput.value = '';
          if (defMaxInput) defMaxInput.value = '';
        }
        performFilterAndRender();
      });
    }

    // 禁限卡表篩選
    document.querySelectorAll('.ban-pill').forEach(btn => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('.ban-pill').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        state.activeFilters.banlist = btn.dataset.ban;
        performFilterAndRender();
      });
    });

    // 重置篩選按鈕
    const resetBtn = document.getElementById('btnResetFilters');
    if (resetBtn) {
      resetBtn.addEventListener('click', () => {
        resetAllFilters();
      });
    }

    // 排序選單
    const sortSelect = document.getElementById('sortSelect');
    if (sortSelect) {
      sortSelect.addEventListener('change', (e) => {
        state.activeFilters.sort = e.target.value;
        performFilterAndRender();
      });
    }

    // 檢視模式切換 (網格 / 列表)
    document.querySelectorAll('.view-mode-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('.view-mode-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        state.viewMode = btn.dataset.mode;
        renderCardGrid();
      });
    });

    // 牌組抽屜開啟與關閉
    const btnDeckTray = document.getElementById('btnDeckTray');
    const deckDrawer = document.getElementById('deckDrawer');
    const deckOverlay = document.getElementById('deckDrawerOverlay');
    const btnCloseDrawer = document.getElementById('btnCloseDrawer');

    if (btnDeckTray) {
      btnDeckTray.addEventListener('click', () => {
        if (deckDrawer && deckOverlay) {
          renderDeckSelectOptions();
          deckDrawer.classList.add('open');
          deckOverlay.classList.add('open');
        }
      });
    }

    if (btnCloseDrawer && deckDrawer && deckOverlay) {
      btnCloseDrawer.addEventListener('click', () => {
        deckDrawer.classList.remove('open');
        deckOverlay.classList.remove('open');
      });
      deckOverlay.addEventListener('click', () => {
        deckDrawer.classList.remove('open');
        deckOverlay.classList.remove('open');
      });
    }

    // 點擊牌組內卡片 (行、卡圖、卡名) 開啟卡片完整效果彈窗
    if (deckDrawer) {
      deckDrawer.addEventListener('click', (e) => {
        const btn = e.target.closest('.deck-item-btn');
        if (btn) return; // 移除按鈕不觸發彈窗
        const row = e.target.closest('.deck-item-row');
        if (row && row.dataset.cardId) {
          openCardDetailModal(row.dataset.cardId);
        }
      });
    }

    // 牌組切換、新增取名與刪除控制
    const deckSelect = document.getElementById('deckSelect');
    if (deckSelect) {
      deckSelect.addEventListener('change', (e) => {
        switchDeck(e.target.value);
      });
    }

    const btnNewDeck = document.getElementById('btnNewDeck');
    if (btnNewDeck) {
      btnNewDeck.addEventListener('click', () => {
        openDeckNameModal('create');
      });
    }

    const btnRenameDeck = document.getElementById('btnRenameDeck');
    if (btnRenameDeck) {
      btnRenameDeck.addEventListener('click', () => {
        openDeckNameModal('rename');
      });
    }

    const btnDeleteDeck = document.getElementById('btnDeleteDeck');
    if (btnDeleteDeck) {
      btnDeleteDeck.addEventListener('click', () => {
        deleteCurrentDeck();
      });
    }

    // 牌組取名 Modal 控制
    const deckNameModal = document.getElementById('deckNameModal');
    const btnCloseDeckModal = document.getElementById('btnCloseDeckModal');
    const btnCancelDeckModal = document.getElementById('btnCancelDeckModal');
    const btnConfirmDeckModal = document.getElementById('btnConfirmDeckModal');
    const deckNameInput = document.getElementById('deckNameInput');

    if (btnCloseDeckModal) btnCloseDeckModal.addEventListener('click', closeDeckNameModal);
    if (btnCancelDeckModal) btnCancelDeckModal.addEventListener('click', closeDeckNameModal);
    if (btnConfirmDeckModal) btnConfirmDeckModal.addEventListener('click', handleConfirmDeckName);
    if (deckNameInput) {
      deckNameInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
          e.preventDefault();
          handleConfirmDeckName();
        } else if (e.key === 'Escape') {
          closeDeckNameModal();
        }
      });
    }
    if (deckNameModal) {
      deckNameModal.addEventListener('click', (e) => {
        if (e.target === deckNameModal) {
          closeDeckNameModal();
        }
      });
    }

    // 點擊外部關閉 Inspector 目標牌組選單 (Popover)
    document.addEventListener('click', (e) => {
      const splitGroup = document.getElementById('deckAddSplitGroup');
      if (splitGroup && !splitGroup.contains(e.target)) {
        closeDeckTargetPopover();
      }
    });

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        closeDeckTargetPopover();
        closeDeckNameModal();
      }
    });

    // ================= 響應式抽屜 (篩選抽屜 & 詳情抽屜) 監聽 =================
    const btnMobileFilter = document.getElementById('btnMobileFilter');
    const btnCloseFilterDrawer = document.getElementById('btnCloseFilterDrawer');
    const btnApplyFilterDrawer = document.getElementById('btnApplyFilterDrawer');
    const filterOverlay = document.getElementById('filterDrawerOverlay');
    const inspectorOverlay = document.getElementById('inspectorDrawerOverlay');

    if (btnMobileFilter) btnMobileFilter.addEventListener('click', openFilterDrawer);
    if (btnCloseFilterDrawer) btnCloseFilterDrawer.addEventListener('click', closeFilterDrawer);
    if (btnApplyFilterDrawer) btnApplyFilterDrawer.addEventListener('click', closeFilterDrawer);
    if (filterOverlay) filterOverlay.addEventListener('click', closeFilterDrawer);
    if (inspectorOverlay) inspectorOverlay.addEventListener('click', closeInspectorDrawer);

    // 牌組導出與匯入功能
    const btnImportYdk = document.getElementById('btnImportYdk');
    const ydkFileInput = document.getElementById('ydkFileInput');
    if (btnImportYdk && ydkFileInput) {
      btnImportYdk.addEventListener('click', () => ydkFileInput.click());
      ydkFileInput.addEventListener('change', (e) => {
        if (e.target.files && e.target.files[0]) {
          importYDKFile(e.target.files[0]);
          e.target.value = '';
        }
      });
    }

    const btnExportYdk = document.getElementById('btnExportYdk');
    const btnExportText = document.getElementById('btnExportText');
    const btnClearDeck = document.getElementById('btnClearDeck');

    if (btnExportYdk) btnExportYdk.addEventListener('click', exportYDK);
    if (btnExportText) btnExportText.addEventListener('click', exportTextList);
    if (btnClearDeck) {
      btnClearDeck.addEventListener('click', () => {
        if (confirm(state.currentLang === 'zh_tw' ? '確定要清空牌組嗎？' : '确定要清空牌组吗？')) {
          state.deck.main = [];
          state.deck.extra = [];
          renderDeckDrawer();
          updateDeckCounter();
          saveDeckToStorage();
          showToast(state.currentLang === 'zh_tw' ? '已清空牌組' : '已清空牌组');
        }
      });
    }

    // Lightbox 關閉
    const lightboxModal = document.getElementById('lightboxModal');
    const lightboxClose = document.getElementById('lightboxClose');
    if (lightboxClose) lightboxClose.addEventListener('click', closeLightbox);
    if (lightboxModal) {
      lightboxModal.addEventListener('click', (e) => {
        if (e.target === lightboxModal) closeLightbox();
      });
    }

    // 卡片完整效果詳情彈窗 (#cardDetailModal) 關閉
    const cardDetailModal = document.getElementById('cardDetailModal');
    const btnCloseCardDetailModal = document.getElementById('btnCloseCardDetailModal');
    if (btnCloseCardDetailModal) {
      btnCloseCardDetailModal.addEventListener('click', closeCardDetailModal);
    }
    if (cardDetailModal) {
      cardDetailModal.addEventListener('click', (e) => {
        if (e.target === cardDetailModal) {
          closeCardDetailModal();
        }
      });
    }

    // 鍵盤快速鍵
    window.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        const modal = document.getElementById('cardDetailModal');
        if (modal && modal.classList.contains('open')) {
          closeCardDetailModal();
          return;
        }
        closeDeckNameModal();
        closeLightbox();
        closeFilterDrawer();
        closeInspectorDrawer();
        if (deckDrawer && deckOverlay) {
          deckDrawer.classList.remove('open');
          deckOverlay.classList.remove('open');
        }
      }
      if (e.key === '/' && document.activeElement !== searchInput) {
        e.preventDefault();
        if (searchInput) searchInput.focus();
      }
    });
  }

  function resetAllFilters() {
    state.activeFilters = {
      search: '',
      scope: 'all',
      category: 'ALL',
      monsterTypes: new Set(),
      spellTypes: new Set(),
      trapTypes: new Set(),
      attributes: new Set(),
      race: 'ALL',
      level: 'ALL',
      scale: 'ALL',
      atkMin: '',
      atkMax: '',
      defMin: '',
      defMax: '',
      atkUnknown: false,
      defUnknown: false,
      linkMarkers: new Set(),
      effectTags: new Set(),
      banlist: 'ALL',
      sort: 'relevance'
    };

    const searchInput = document.getElementById('mainSearchInput');
    if (searchInput) searchInput.value = '';
    const clearBtn = document.getElementById('searchClearBtn');
    if (clearBtn) clearBtn.style.display = 'none';

    document.querySelectorAll('.segment-btn').forEach(b => {
      b.classList.toggle('active', b.dataset.category === 'ALL');
    });
    document.querySelectorAll('.tag-checkbox-btn, .attr-chip').forEach(b => b.classList.remove('active'));
    document.querySelectorAll('.ban-pill').forEach(b => {
      b.classList.toggle('active', b.dataset.ban === 'ALL');
    });

    const raceSelect = document.getElementById('raceSelect');
    if (raceSelect) raceSelect.value = 'ALL';
    const levelSelect = document.getElementById('levelSelect');
    if (levelSelect) levelSelect.value = 'ALL';
    const scaleSelect = document.getElementById('scaleSelect');
    if (scaleSelect) scaleSelect.value = 'ALL';
    const atkMin = document.getElementById('atkMin');
    if (atkMin) atkMin.value = '';
    const atkMax = document.getElementById('atkMax');
    if (atkMax) atkMax.value = '';
    const defMin = document.getElementById('defMin');
    if (defMin) defMin.value = '';
    const defMax = document.getElementById('defMax');
    if (defMax) defMax.value = '';

    document.querySelectorAll('.link-arrow-btn, .effect-tag-btn, .stat-btn-wildcard').forEach(b => b.classList.remove('active'));

    performFilterAndRender();
    showToast(state.currentLang === 'zh_tw' ? '已重置所有篩選條件' : '已重置所有筛选条件');
  }

  function updateLanguageUI() {
    const isTw = state.currentLang === 'zh_tw';
    const langBtnText = document.getElementById('langBtnText');
    if (langBtnText) {
      langBtnText.textContent = isTw ? '繁體中文 (台灣)' : '简体中文';
    }

    // 更新篩選器種族選單
    const raceSelect = document.getElementById('raceSelect');
    if (raceSelect) {
      const curVal = raceSelect.value;
      raceSelect.innerHTML = `<option value="ALL">${isTw ? '全部種族' : '全部种族'}</option>` +
        Object.keys(RACES).map(mask => {
          const r = RACES[mask];
          return `<option value="${mask}">${isTw ? r.zh_tw : r.zh_cn}</option>`;
        }).join('');
      raceSelect.value = curVal;
    }

    // 更新各處靜態文字標籤
    document.querySelectorAll('[data-i18n-tw]').forEach(el => {
      el.textContent = isTw ? el.dataset.i18nTw : el.dataset.i18nCn;
    });

    renderSearchHistory();
  }

  // ================= 14. 應用程式啟動入口 =================
  function initApp() {
    // 1. 同步載入預載卡片 (window.PRESET_CARDS / PRESET_CARDS_DATA) 達成 0 秒極速開箱即用！
    const preset = window.PRESET_CARDS || window.PRESET_CARDS_DATA;
    if (preset && Array.isArray(preset)) {
      for (const raw of preset) {
        const card = normalizeCard(raw);
        if (card) {
          state.allCards.set(card.id, card);
        }
      }
    }

    setupEventListeners();
    renderSearchHistory();
    updateLanguageUI();
    updateCacheCounter();
    loadDeckFromStorage();
    performFilterAndRender();

    // 2. 背景非同步初始化 IndexedDB
    initIndexedDB().then((db) => {
      if (db) {
        for (const card of state.allCards.values()) {
          saveCardToDB(card);
        }
        try {
          const tx = db.transaction('cards', 'readonly');
          const req = tx.objectStore('cards').getAll();
          req.onsuccess = () => {
            const stored = req.result || [];
            let addedNew = false;
            for (const raw of stored) {
              if (!state.allCards.has(raw.id)) {
                const card = normalizeCard(raw);
                if (card) {
                  state.allCards.set(card.id, card);
                  addedNew = true;
                }
              }
            }
            if (addedNew) {
              updateCacheCounter();
              loadDeckFromStorage();
              performFilterAndRender();
            }
          };
        } catch (err) {
          console.warn('從 IndexedDB 讀取失敗:', err);
        }
      }
    });

    // 公開給 inline 錯誤處理函數與全域偵錯檢測
    window.handleImageError = (imgEl, cardId) => {
      const card = state.allCards.get(cardId);
      if (card) handleImageError(imgEl, card);
    };
    window.removeCardFromDeck = removeCardFromDeck;
    window.openCardDetailModal = openCardDetailModal;
    window.closeCardDetailModal = closeCardDetailModal;
    window.ygoApp = {
      state,
      matchesFilter,
      performFilterAndRender,
      toTraditional,
      toSimplified,
      getSearchTokens,
      getCardArchetypes,
      fetchYgocdbSearch,
      getSearchHistory,
      saveSearchHistory,
      clearSearchHistory,
      renderSearchHistory,
      searchRelated,
      highlightSearchTermsInHtml,
      resetAllFilters,
      selectCard,
      switchDeck,
      addCardToDeck,
      normalizeCard,
      openDeckNameModal,
      closeDeckNameModal,
      handleConfirmDeckName,
      deleteCurrentDeck,
      toggleDeckTargetPopover,
      closeDeckTargetPopover,
      renderPopoverDeckListHtml,
      updateInspectorDeckButtons,
      openCardDetailModal,
      closeCardDetailModal
    };
  }

  // 頁面載入完成後啟動
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initApp);
  } else {
    initApp();
  }

})();
