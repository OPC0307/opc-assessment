/* ============================================
   OPC 一人公司适配度测评系统 — 核心逻辑
   ============================================ */

// ---- 评估权威依据 ----
var AUTHORITY_FOUNDATION = {
  classics: [
    { source: "纳瓦尔《纳瓦尔宝典》", core: "个体财富公式：专长 × 杠杆 × 责任感" },
    { source: "《一人公司》行业共识", core: "小规模、高利润、强闭环、抗风险、绝对职业主权" },
    { source: "古典《超级个体》", core: "聚焦个体不可替代性、复利能力、职业主权" }
  ],
  practice: [
    "跨装修、保险、贸易多行业个体实战闭环经验",
    "项目落地管控、拓客转化、用户共情陪跑三大核心能力沉淀",
    "100+装修项目全流程落地验证",
    "保险拓客签单与个体生意用户共情验证",
    "贸易行业从0到1跑通变现闭环验证"
  ],
  ai: [
    "基于2024-2026年AI工具落地个体商业的实战案例打磨",
    "新增AI杠杆驾驭能力维度，适配当下OPC落地环境"
  ]
};

// ---- 画像题库（总池，30题） ----
var QUESTION_POOL = [
  {
    id: 1,
    dimension: "核心禀赋",
    tags: ["all"],
    weight: 1,
    question: "你身边的朋友最常因为什么事来找你帮忙？",
    hint: "外部主动认可，往往比自我判断更接近真实市场反馈。",
    intention: "通过'他人的认可'间接判断是否有被市场验证的核心能力。被频繁求助 = 有明确能力标签。",
    options: [
      { letter: "A", text: "就那一件事，大家都知道找我准没错", score: 5, reasoning: "外部验证的强能力标签，有明确的市场定位" },
      { letter: "B", text: "有两三件事比较常被想到", score: 4, reasoning: "有多元能力但不够聚焦，需要进一步明确主攻方向" },
      { letter: "C", text: "好像挺多事都会找我，但没有特别突出的", score: 3, reasoning: "能力泛化，缺乏清晰标签，不利一人公司定位" },
      { letter: "D", text: "想不太起来，可能我比较低调吧", score: 2, reasoning: "可能缺乏被验证的核心能力，或尚未开发" },
      { letter: "E", text: "其他", score: 3, reasoning: "兜底选项，避免强迫选择" }
    ]
  },
  {
    id: 2,
    dimension: "核心禀赋",
    tags: ["all"],
    weight: 1,
    question: "如果有人问你\"你最值钱的本事是什么\"，你能脱口而出吗？",
    hint: "这题测的是你的自我认知清晰度。",
    intention: "测试核心能力的清晰度。能一句话说清楚 = 能力聚焦 + 自我认知清晰。",
    options: [
      { letter: "A", text: "能，而且我能用一句话说明白", score: 5, reasoning: "能力聚焦 + 表达清晰，是一人公司定位的核心能力" },
      { letter: "B", text: "大概知道，但不太会表达", score: 4, reasoning: "有自我认知但表达能力待提升" },
      { letter: "C", text: "有几个候选，不确定哪个最值钱", score: 3, reasoning: "能力尚未聚焦，需要进一步验证和聚焦" },
      { letter: "D", text: "说实话，不太确定", score: 2, reasoning: "自我认知模糊，需要系统性探索" },
      { letter: "E", text: "其他", score: 3, reasoning: "兜底选项" }
    ]
  },
  {
    id: 3,
    dimension: "核心禀赋",
    tags: ["all"],
    weight: 1,
    question: "你身边有没有人说过类似\"你做这个肯定行\"或者\"你这方面真的很强\"的话？",
    hint: "从外部视角验证核心禀赋。",
    intention: "多人独立给出正向反馈 = 能力被市场认可的强信号。",
    options: [
      { letter: "A", text: "经常有人说，而且是不同的人", score: 5, reasoning: "多人独立给出正向反馈，是能力被市场认可的强信号" },
      { letter: "B", text: "偶尔有人说", score: 4, reasoning: "有一定市场验证，但还不够广泛" },
      { letter: "C", text: "好像没有特别明确地说过", score: 3, reasoning: "缺乏外部验证，需要主动建立反馈机制" },
      { letter: "D", text: "没有，或者我自己没注意过", score: 2, reasoning: "尚未形成被验证的能力标签" },
      { letter: "E", text: "其他", score: 3, reasoning: "兜底选项" }
    ]
  },
  {
    id: 4,
    dimension: "核心禀赋",
    tags: ["all"],
    weight: 1,
    question: "用一句话向陌生客户介绍自己，你能说清楚吗？",
    hint: "这题测的是你的定位清晰度。",
    intention: "测试定位清晰度，这直接影响获客效率。",
    options: [
      { letter: "A", text: "能，一句话讲清楚我能帮谁解决什么问题", score: 5, reasoning: "定位清晰，有清晰的客户价值主张" },
      { letter: "B", text: "大概能说，但还不够锋利", score: 4, reasoning: "有基础表达但需要打磨" },
      { letter: "C", text: "需要想一阵才能表达", score: 3, reasoning: "表达不够自动化，需要进一步提炼" },
      { letter: "D", text: "只能笼统说自己会什么", score: 2, reasoning: "缺乏清晰的价值主张和客户定位" },
      { letter: "E", text: "还很难说清楚", score: 3, reasoning: "需要系统性地梳理自己的定位" }
    ]
  },
  {
    id: 5,
    dimension: "商业闭环",
    tags: ["junior", "transition", "employee"],
    weight: 1,
    question: "假设现在让你用自己的技能/经验去赚钱，你第一步会做什么？",
    hint: "这题主要看你有没有商业闭环的雏形。",
    intention: "评估用户是否具备完整的商业链路认知。A说明有实操经验，B/C说明有意愿但能力缺口明显，D说明还在'想'的阶段。",
    options: [
      { letter: "A", text: "我知道去哪里找客户，也知道怎么报价", score: 5, reasoning: "有完整商业链路的实操经验" },
      { letter: "B", text: "大概知道方向，但具体怎么操作还没想清楚", score: 4, reasoning: "有意愿但链路不完整" },
      { letter: "C", text: "可能会先发个朋友圈试试水", score: 3, reasoning: "有尝试意愿但缺乏系统性" },
      { letter: "D", text: "不太确定，感觉还没准备好", score: 2, reasoning: "还在'想'的阶段，没有商业闭环意识" },
      { letter: "E", text: "其他", score: 3, reasoning: "兜底选项" }
    ]
  },
  {
    id: 6,
    dimension: "商业闭环",
    tags: ["freelancer", "entrepreneur", "owner"],
    weight: 1,
    question: "你有没有过\"靠自己的能力独立赚到钱\"的经历（哪怕金额不大）？",
    hint: "用实际行为验证商业闭环能力。",
    intention: "独立完成获客-交付-收费 = 有商业闭环的雏形。A是完整的商业闭环，B/C说明闭环有断裂点。",
    options: [
      { letter: "A", text: "有，而且不止一次，算是稳定的收入来源", score: 5, reasoning: "完整的商业闭环验证" },
      { letter: "B", text: "有过一两次，但没有持续", score: 4, reasoning: "有闭环经验但不够稳定" },
      { letter: "C", text: "帮过别人忙，对方给过红包或请吃饭", score: 3, reasoning: "有轻微商业行为但不是真正的市场交换" },
      { letter: "D", text: "还没有过", score: 2, reasoning: "完全没有商业闭环验证" },
      { letter: "E", text: "其他", score: 3, reasoning: "兜底选项" }
    ]
  },
  {
    id: 7,
    dimension: "商业闭环",
    tags: ["freelancer", "entrepreneur", "owner"],
    weight: 1,
    question: "假设你已经有一个不错的产品或服务，你知道怎么让目标客户看到它吗？",
    hint: "聚焦获客这一商业闭环中最常见的断裂点。",
    intention: "聚焦获客这一商业闭环中最常见的断裂点。A说明获客能力成熟，D说明获客是核心瓶颈。",
    options: [
      { letter: "A", text: "知道，我有至少2个有效的获客渠道", score: 5, reasoning: "获客能力成熟，有验证过的渠道" },
      { letter: "B", text: "大概知道，但还没有实际验证过", score: 4, reasoning: "有获客意识但尚未验证" },
      { letter: "C", text: "只能想到发朋友圈", score: 3, reasoning: "获客方式单一且效果有限" },
      { letter: "D", text: "不知道，获客是我最头疼的事", score: 2, reasoning: "获客是核心瓶颈" },
      { letter: "E", text: "其他", score: 3, reasoning: "兜底选项" }
    ]
  },
  {
    id: 8,
    dimension: "商业闭环",
    tags: ["junior", "transition", "employee"],
    weight: 1,
    question: "你是否清楚自己的目标客户是谁？",
    hint: "目标客户不是'所有人'，而是最可能为你买单的那群人。",
    intention: "测试客户定位能力，这是一人公司成功的关键。",
    options: [
      { letter: "A", text: "非常清楚，能精准描述", score: 5, reasoning: "客户定位清晰，营销精准度高" },
      { letter: "B", text: "大致知道方向", score: 4, reasoning: "有大方向但不够精准" },
      { letter: "C", text: "有一点想法但不清晰", score: 3, reasoning: "客户画像模糊" },
      { letter: "D", text: "觉得谁都有可能是客户", score: 2, reasoning: "缺乏客户定位，会导致获客效率低下" },
      { letter: "E", text: "完全没有概念", score: 3, reasoning: "需要从零开始建立客户认知" }
    ]
  },
  {
    id: 9,
    dimension: "落地执行",
    tags: ["all"],
    weight: 1,
    question: "如果你突然有了一个不错的赚钱想法，你通常会怎么做？",
    hint: "一人公司很多时候没人催你，全靠自己推着走。",
    intention: "测试行动力和启动速度。一人公司最怕'想太多做太少'，A是典型的强执行力表现，D则是典型的拖延模式。",
    options: [
      { letter: "A", text: "当天就开始行动，哪怕先做个最小版本试试", score: 5, reasoning: "强执行力，是一人公司最宝贵的品质" },
      { letter: "B", text: "花几天时间想清楚，然后开干", score: 4, reasoning: "有计划性，执行力良好" },
      { letter: "C", text: "先列个计划，等有空了再说", score: 3, reasoning: "有计划但执行力较弱，容易拖延" },
      { letter: "D", text: "想想挺好的，但好像一直没动手", score: 2, reasoning: "典型拖延模式，一人大忌" },
      { letter: "E", text: "其他", score: 3, reasoning: "兜底选项" }
    ]
  },
  {
    id: 10,
    dimension: "落地执行",
    tags: ["employee", "student", "transition"],
    weight: 1,
    question: "你当前每天能稳定投入多少时间用于个人项目或一人公司？",
    hint: "这里问的是真实可用时间，不是理想状态。",
    intention: "测试真实可用时间，这是一人公司的基础资源。",
    options: [
      { letter: "A", text: "6小时以上", score: 5, reasoning: "有充足时间投入，成功概率高" },
      { letter: "B", text: "3-5小时", score: 4, reasoning: "有稳定时间投入" },
      { letter: "C", text: "1-2小时", score: 3, reasoning: "时间有限，需要提高效率" },
      { letter: "D", text: "主要靠碎片时间", score: 2, reasoning: "时间投入不足，难以形成积累" },
      { letter: "E", text: "目前几乎没有", score: 3, reasoning: "尚未开始，需要尽快启动" }
    ]
  },
  {
    id: 11,
    dimension: "落地执行",
    tags: ["all"],
    weight: 1,
    question: "做事情的时候，你更像下面哪种状态？",
    hint: "一人公司很多时候没人催你，全靠自己推着走。",
    intention: "测试执行模式和抗干扰能力。",
    options: [
      { letter: "A", text: "先干起来，边做边调整", score: 5, reasoning: "高效执行者，适合一人公司模式" },
      { letter: "B", text: "先想清楚再动手，但想好了就会执行", score: 4, reasoning: "计划型执行者，执行力良好" },
      { letter: "C", text: "经常做着做着就被别的事打断了", score: 3, reasoning: "抗干扰能力弱，执行效率低" },
      { letter: "D", text: "有个大概想法，但总是迟迟不开始", score: 2, reasoning: "启动困难户，需要强制启动机制" },
      { letter: "E", text: "其他", score: 3, reasoning: "兜底选项" }
    ]
  },
  {
    id: 12,
    dimension: "落地执行",
    tags: ["all"],
    weight: 1,
    question: "面对一个重要但不紧急的项目，你通常是什么状态？",
    hint: "一人公司很多时候没人催你，全靠自己推着走。",
    intention: "测试自驱力和时间管理能力。",
    options: [
      { letter: "A", text: "拆解目标后立即执行", score: 5, reasoning: "能主动推动项目前进，自驱力强" },
      { letter: "B", text: "先想清楚再执行", score: 4, reasoning: "有计划性，能完成任务" },
      { letter: "C", text: "容易拖延", score: 2, reasoning: "缺乏自驱，容易错过最佳时机" },
      { letter: "D", text: "容易被打断和分心", score: 2, reasoning: "时间管理能力弱" },
      { letter: "E", text: "想法很多，行动较少", score: 3, reasoning: "需要强制自己进入执行模式" }
    ]
  },
  {
    id: 13,
    dimension: "内容能力",
    tags: ["freelancer", "entrepreneur", "owner"],
    weight: 1,
    question: "如果让你现在发一条跟你的专业/兴趣有关的内容（朋友圈、小红书、公众号都行），你会？",
    hint: "内容能力不只是写文章，也包括短视频、图文、社群分享等。",
    intention: "测试内容产出的舒适度，这是获客的关键杠杆。",
    options: [
      { letter: "A", text: "随手就能写，经常发，也有不少人互动", score: 5, reasoning: "有内容手感，有正反馈，是强获客杠杆" },
      { letter: "B", text: "能写出来，但不太确定有没有人看", score: 4, reasoning: "有内容能力但缺乏反馈机制" },
      { letter: "C", text: "得想挺久才能憋出来", score: 3, reasoning: "内容产出效率低，需要练习" },
      { letter: "D", text: "算了吧，不太敢公开表达", score: 2, reasoning: "表达障碍，是获客的重大阻碍" },
      { letter: "E", text: "其他", score: 3, reasoning: "兜底选项" }
    ]
  },
  {
    id: 14,
    dimension: "内容能力",
    tags: ["freelancer", "entrepreneur", "owner"],
    weight: 1,
    question: "你过去是否通过内容带来过客户、订单或合作机会？",
    hint: "内容能力是否已经转化过商业价值，是关键判断点。",
    intention: "测试内容能力的商业转化验证。",
    options: [
      { letter: "A", text: "有，而且不止一次", score: 5, reasoning: "内容能力已验证商业价值" },
      { letter: "B", text: "偶尔有", score: 4, reasoning: "内容有商业转化但不稳定" },
      { letter: "C", text: "更多是曝光，还没有成交", score: 3, reasoning: "有内容产出但转化率低" },
      { letter: "D", text: "尝试过但效果不好", score: 2, reasoning: "需要优化内容和渠道策略" },
      { letter: "E", text: "还没有真正尝试", score: 3, reasoning: "尚未开始内容获客" }
    ]
  },
  {
    id: 15,
    dimension: "内容能力",
    tags: ["all"],
    weight: 1,
    question: "如果你要在网上分享你的专业知识或生活经验，你觉得最大的障碍是什么？",
    hint: "这题帮助定位你的内容能力短板。",
    intention: "反向测试内容能力的短板位置，便于针对性提升。",
    options: [
      { letter: "A", text: "没什么障碍，随时可以开始", score: 5, reasoning: "内容能力无明显短板" },
      { letter: "B", text: "知道写什么，但不太会排版或剪辑", score: 4, reasoning: "内容创作OK，技术层面小问题" },
      { letter: "C", text: "不知道写什么内容能吸引人", score: 3, reasoning: "选题能力不足，需要学习" },
      { letter: "D", text: "怕写得不好被人笑话", score: 2, reasoning: "心理障碍，需要突破心魔" },
      { letter: "E", text: "其他", score: 3, reasoning: "兜底选项" }
    ]
  },
  {
    id: 16,
    dimension: "产品化能力",
    tags: ["freelancer", "entrepreneur", "owner"],
    weight: 1,
    question: "你有没有把自己会的东西整理成\"别人可以直接用\"的东西的经历？比如模板、教程、清单、SOP之类的。",
    hint: "产品化是把经验从'口头服务'变成'标准化交付'。",
    intention: "直接测试产品化意识和实践。A是已验证的产品化能力，B/C说明有意识但未商业化，D说明缺乏产品化思维。",
    options: [
      { letter: "A", text: "做过好几个，也有人付费购买过", score: 5, reasoning: "已验证的产品化能力" },
      { letter: "B", text: "做过一两个，主要给朋友或同事用", score: 4, reasoning: "有产品化实践但未商业化" },
      { letter: "C", text: "想过但还没动手", score: 3, reasoning: "有意识但未落地" },
      { letter: "D", text: "没想过这事", score: 2, reasoning: "缺乏产品化思维" },
      { letter: "E", text: "其他", score: 3, reasoning: "兜底选项" }
    ]
  },
  {
    id: 17,
    dimension: "产品化能力",
    tags: ["freelancer", "entrepreneur", "owner"],
    weight: 1,
    question: "你觉得你的技能/经验，可以被包装成以下哪种产品？",
    hint: "不同产品形态对应不同的商业模式。",
    intention: "探测产品化思维的多样性，为赛道匹配提供参考。",
    options: [
      { letter: "A", text: "课程、训练营、付费社群这种知识产品", score: 5, reasoning: "适合知识付费赛道的产品形态" },
      { letter: "B", text: "咨询服务、代运营、定制方案这种服务产品", score: 5, reasoning: "适合服务型一人公司的产品形态" },
      { letter: "C", text: "模板、工具包、电子书这种数字产品", score: 4, reasoning: "边际成本低的数字产品" },
      { letter: "D", text: "还没想过怎么包装", score: 2, reasoning: "产品化能力是明显短板" },
      { letter: "E", text: "其他", score: 3, reasoning: "兜底选项" }
    ]
  },
  {
    id: 18,
    dimension: "产品化能力",
    tags: ["freelancer", "entrepreneur", "owner"],
    weight: 1,
    question: "如果你现在要把自己的能力做成一个\"产品\"来卖，你最缺什么？",
    hint: "精确定位产品化能力的具体短板。",
    intention: "精确定位产品化能力的具体短板。A是完整的产品化能力，B是定价/营销问题，C是内容梳理问题，D是方向问题。",
    options: [
      { letter: "A", text: "不缺什么，我已经有成型的产品了", score: 5, reasoning: "产品化能力完整" },
      { letter: "B", text: "缺一个清晰的定价和包装", score: 4, reasoning: "产品和渠道OK，营销能力待提升" },
      { letter: "C", text: "缺把零散经验整理成体系的方法", score: 3, reasoning: "需要方法论指导" },
      { letter: "D", text: "还没想好要做什么产品", score: 2, reasoning: "方向不明，需要定位指导" },
      { letter: "E", text: "其他", score: 3, reasoning: "兜底选项" }
    ]
  },
  {
    id: 19,
    dimension: "产品化能力",
    tags: ["ai", "tech", "junior"],
    weight: 1,
    question: "你是否会借助工具或流程来提升交付效率？",
    hint: "这题测的是你是否具备'用系统替代重复劳动'的意识。",
    intention: "测试'用系统替代重复劳动'的意识。",
    options: [
      { letter: "A", text: "会，已经建立了模板或流程", score: 5, reasoning: "有系统化思维，交付效率高" },
      { letter: "B", text: "会用一些工具，但还没系统化", score: 4, reasoning: "有工具意识但尚未体系化" },
      { letter: "C", text: "知道但还没真正用起来", score: 3, reasoning: "知道但做不到，需要强制落地" },
      { letter: "D", text: "基本靠人工完成", score: 2, reasoning: "效率低下，难以规模化" },
      { letter: "E", text: "觉得暂时不需要", score: 3, reasoning: "缺乏杠杆意识" }
    ]
  },
  {
    id: 20,
    dimension: "持续运营",
    tags: ["all"],
    weight: 1,
    question: "你最近一次\"坚持做一件事超过半年\"是什么情况？",
    hint: "半年是区分'真坚持'和'三分钟热度'的合理门槛。",
    intention: "用具体行为验证持续运营能力。",
    options: [
      { letter: "A", text: "有，而且现在还在做，已经成了习惯", score: 5, reasoning: "有长期主义基因" },
      { letter: "B", text: "有，坚持了一段时间，后来因为各种原因停了", score: 4, reasoning: "有坚持记录但中断了" },
      { letter: "C", text: "好像没有特别坚持的事", score: 3, reasoning: "缺乏长期坚持的习惯" },
      { letter: "D", text: "经常开始新事情，但很少能坚持", score: 2, reasoning: "典型的三分钟热度" },
      { letter: "E", text: "其他", score: 3, reasoning: "兜底选项" }
    ]
  },
  {
    id: 21,
    dimension: "持续运营",
    tags: ["all"],
    weight: 1,
    question: "做一件事遇到瓶颈或没效果的时候，你通常会？",
    hint: "一人公司的早期阶段几乎必然遇到瓶颈。",
    intention: "测试抗挫折能力和迭代思维。",
    options: [
      { letter: "A", text: "分析原因，换个方法继续试", score: 5, reasoning: "抗挫折能力强，有迭代思维" },
      { letter: "B", text: "先放一放，过段时间再捡起来", score: 4, reasoning: "有韧性但缺乏即时调整" },
      { letter: "C", text: "有点受打击，但还是在做", score: 3, reasoning: "情绪受影响但仍在坚持" },
      { letter: "D", text: "很容易就想放弃或者换方向", score: 2, reasoning: "抗挫折能力弱，容易放弃" },
      { letter: "E", text: "其他", score: 3, reasoning: "兜底选项" }
    ]
  },
  {
    id: 22,
    dimension: "持续运营",
    tags: ["all"],
    weight: 1,
    question: "当你短期内看不到结果时，你通常会怎么做？",
    hint: "一人公司前3个月最容易放弃，这题测的是你的坚持模式。",
    intention: "一人公司前3个月最容易放弃，这题测的是坚持模式。",
    options: [
      { letter: "A", text: "复盘后继续迭代", score: 5, reasoning: "有成熟的复盘和迭代机制" },
      { letter: "B", text: "找人请教后再试一轮", score: 4, reasoning: "有外部资源利用意识" },
      { letter: "C", text: "会有点动摇，但还会坚持", score: 3, reasoning: "意志力尚可但方法待优化" },
      { letter: "D", text: "容易想换方向", score: 2, reasoning: "缺乏长期视角" },
      { letter: "E", text: "很容易停在原地", score: 3, reasoning: "需要外部监督机制" }
    ]
  },
  {
    id: 23,
    dimension: "财务感知",
    tags: ["employee", "freelancer", "entrepreneur", "owner"],
    weight: 1,
    question: "你目前的月收入大概是什么状态？",
    hint: "财务状态会影响创业决策的质量。",
    intention: "测试当前财务状态，这会影响一人公司的决策质量。",
    options: [
      { letter: "A", text: "已经比较稳定，且大于日常开支", score: 5, reasoning: "财务状况健康，有积累空间" },
      { letter: "B", text: "稳定，但只够日常开支", score: 4, reasoning: "收支平衡，无风险抵抗能力" },
      { letter: "C", text: "不太稳定，时多时少", score: 3, reasoning: "收入波动大，需要建立稳定入口" },
      { letter: "D", text: "几乎没有固定收入", score: 2, reasoning: "财务压力巨大，决策容易变形" },
      { letter: "E", text: "还没开始赚钱", score: 3, reasoning: "财务尚未启动" }
    ]
  },
  {
    id: 24,
    dimension: "财务感知",
    tags: ["freelancer", "entrepreneur", "owner"],
    weight: 1,
    question: "如果让你独立接一个项目，你能准确报出成本和预期利润吗？",
    hint: "定价能力是一人公司盈利的基础。",
    intention: "测试成本核算和定价能力，这是一人公司盈利的基础。",
    options: [
      { letter: "A", text: "能，而且有清晰的计算方式", score: 5, reasoning: "有完整的成本意识和定价能力" },
      { letter: "B", text: "大概知道，但算不太清楚", score: 4, reasoning: "有成本意识但不精确" },
      { letter: "C", text: "只能估算个大概", score: 3, reasoning: "缺乏精确的成本核算能力" },
      { letter: "D", text: "完全不知道怎么算", score: 2, reasoning: "财务知识欠缺，容易亏损" },
      { letter: "E", text: "其他", score: 3, reasoning: "兜底选项" }
    ]
  },
  {
    id: 25,
    dimension: "财务感知",
    tags: ["transition", "employee", "student"],
    weight: 1,
    question: "如果你的OPC（一人公司）连续3个月没有收入，你能承受吗？",
    hint: "财务安全边际影响创业决策质量。",
    intention: "测试财务风险意识，这会影响创业决策的质量。",
    options: [
      { letter: "A", text: "完全没问题，有足够的储蓄", score: 5, reasoning: "有财务安全垫，风险承受能力强" },
      { letter: "B", text: "可以撑一下，但会比较紧张", score: 4, reasoning: "有一定储备但不多" },
      { letter: "C", text: "可能会被迫去找工作", score: 3, reasoning: "财务安全边际小" },
      { letter: "D", text: "完全撑不住", score: 2, reasoning: "财务风险极高，决策容易变形" },
      { letter: "E", text: "还没想过这个问题", score: 3, reasoning: "缺乏风险意识" }
    ]
  },
  {
    id: 26,
    dimension: "AI杠杆",
    tags: ["ai", "tech", "junior", "student"],
    weight: 1,
    question: "你是否有使用AI工具提升内容、产品或服务效率的经验？",
    hint: "这是当前一人公司的重要杠杆能力。",
    intention: "测试AI杠杆能力，这是当前一人公司的重要竞争力。",
    options: [
      { letter: "A", text: "已经深度融入到工作流，效果明显", score: 5, reasoning: "AI杠杆能力强，有成熟实践经验" },
      { letter: "B", text: "会用，但还没形成流程", score: 4, reasoning: "有AI意识但尚未系统化" },
      { letter: "C", text: "偶尔用过", score: 3, reasoning: "对AI有初步接触" },
      { letter: "D", text: "了解不多", score: 2, reasoning: "AI认知不足，需要快速学习" },
      { letter: "E", text: "基本没用过", score: 3, reasoning: "尚未开始使用AI工具" }
    ]
  },
  {
    id: 27,
    dimension: "AI杠杆",
    tags: ["ai", "tech", "freelancer", "entrepreneur"],
    weight: 1,
    question: "你通常用AI工具来做什么？",
    hint: "探测AI使用的深度和广度。",
    intention: "探测AI使用的深度和广度。",
    options: [
      { letter: "A", text: "深度使用：内容创作、数据分析、自动化流程", score: 5, reasoning: "充分发挥AI杠杆效应" },
      { letter: "B", text: "中度使用：辅助写作、翻译、资料整理", score: 4, reasoning: "有日常AI应用但不够深度" },
      { letter: "C", text: "轻度使用：偶尔问问题、查资料", score: 3, reasoning: "仅把AI当搜索引擎" },
      { letter: "D", text: "几乎不用", score: 2, reasoning: "未充分利用AI红利" },
      { letter: "E", text: "其他", score: 3, reasoning: "兜底选项" }
    ]
  },
  {
    id: 28,
    dimension: "影响力",
    tags: ["freelancer", "entrepreneur", "owner"],
    weight: 1,
    question: "你的微信/社群大概有多少人可以成为你的潜在客户或合作伙伴？",
    hint: "私域网络是一人公司获客的重要资产。",
    intention: "测试私域网络规模，这是一人公司获客的重要资产。",
    options: [
      { letter: "A", text: "500人以上，且有互动", score: 5, reasoning: "有规模的私域网络" },
      { letter: "B", text: "200-500人，有一些互动", score: 4, reasoning: "有一定规模的私域基础" },
      { letter: "C", text: "50-200人，偶尔互动", score: 3, reasoning: "私域规模较小" },
      { letter: "D", text: "50人以下，几乎不互动", score: 2, reasoning: "私域几乎为零" },
      { letter: "E", text: "不确定，没算过", score: 3, reasoning: "缺乏私域意识" }
    ]
  },
  {
    id: 29,
    dimension: "影响力",
    tags: ["freelancer", "entrepreneur", "owner"],
    weight: 1,
    question: "你有过\"通过别人的推荐或介绍\"获得客户或机会的经历吗？",
    hint: "转介绍能力反映影响力水平。",
    intention: "测试人脉网络和转介绍能力，这反映影响力水平。",
    options: [
      { letter: "A", text: "经常有，转介绍是我的主要获客方式", score: 5, reasoning: "有成熟的转介绍网络" },
      { letter: "B", text: "偶尔有，但不稳定", score: 4, reasoning: "有转介绍意识但系统不完善" },
      { letter: "C", text: "很少，几乎没有", score: 3, reasoning: "缺乏转介绍网络的经营" },
      { letter: "D", text: "完全依靠自己开拓", score: 2, reasoning: "获客渠道单一，效率低" },
      { letter: "E", text: "其他", score: 3, reasoning: "兜底选项" }
    ]
  },
  {
    id: 30,
    dimension: "影响力",
    tags: ["all"],
    weight: 1,
    question: "你更倾向于哪种一人公司路线？",
    hint: "这题帮助判断你的长期路径偏好。",
    intention: "结合影响力评估，为赛道匹配提供数据支撑。",
    options: [
      { letter: "A", text: "轻服务型（咨询、陪跑、代运营）", score: 5, reasoning: "依赖个人品牌和专业影响力" },
      { letter: "B", text: "内容型（IP、自媒体、知识产品）", score: 5, reasoning: "依赖内容影响力获客" },
      { letter: "C", text: "产品型（模板、工具、数字产品）", score: 4, reasoning: "产品力为主，影响力为辅" },
      { letter: "D", text: "接单型（自由职业、外包）", score: 3, reasoning: "相对依赖平台，影响力要求较低" },
      { letter: "E", text: "还没确定", score: 3, reasoning: "需要进一步探索" }
    ]
  }
];

// ---- 画像标签推断 ----
function inferProfileTags(profile) {
  var tags = ["all"];
  if (!profile) return tags;

  var occ = profile.occupation || "";
  var age = profile.age || "";
  var edu = profile.education || "";

  if (["在职员工"].indexOf(occ) !== -1) tags.push("employee");
  if (["自由职业"].indexOf(occ) !== -1) tags.push("freelancer");
  if (["创业者", "个体经营者", "全职主理人"].indexOf(occ) !== -1) tags.push("entrepreneur", "owner");
  if (["学生"].indexOf(occ) !== -1) tags.push("student");
  if (["待业/转行中"].indexOf(occ) !== -1) tags.push("transition");

  if (age === "18-22" || age === "23-27") tags.push("junior");
  if (age === "36-45" || age === "46+") tags.push("senior");
  if (edu === "硕士及以上") tags.push("senior");

  return tags;
}

// ---- 从题库里挑选15题 ----
function selectQuestionsByProfile(profile) {
  var activeTags = inferProfileTags(profile);
  var scored = QUESTION_POOL.map(function(q) {
    var match = 0;
    q.tags.forEach(function(t) {
      if (activeTags.indexOf(t) !== -1) match += 1;
    });
    return { question: q, match: match, weight: q.weight || 1 };
  });

  scored.sort(function(a, b) {
    if (b.match !== a.match) return b.match - a.match;
    return b.weight - a.weight;
  });

  var chosen = scored.slice(0, 15).map(function(item, idx) {
    var q = JSON.parse(JSON.stringify(item.question));
    q.displayOrder = idx + 1;
    return q;
  });

  // 随机打乱同分层题目，避免每次完全一样
  for (var i = chosen.length - 1; i > 0; i--) {
    var j = Math.floor(Math.random() * (i + 1));
    var temp = chosen[i];
    chosen[i] = chosen[j];
    chosen[j] = temp;
  }

  chosen.forEach(function(q, idx) {
    q.displayOrder = idx + 1;
  });

  return chosen;
}

// ---- 运行时题目 ----
var PROFILE = null;
try {
  var rawProfile = localStorage.getItem("opc_user_profile");
  if (rawProfile) PROFILE = JSON.parse(rawProfile);
} catch (e) {
  PROFILE = null;
}
var QUESTIONS = selectQuestionsByProfile(PROFILE);

// ---- 维度配置（含权重，9维度体系） ----
var DIMENSIONS = {
  "核心禀赋": { weight: 0.15 },
  "商业闭环": { weight: 0.15 },
  "落地执行": { weight: 0.12 },
  "内容能力": { weight: 0.12 },
  "产品化能力": { weight: 0.12 },
  "持续运营": { weight: 0.10 },
  "财务感知": { weight: 0.10 },
  "AI杠杆": { weight: 0.08 },
  "影响力": { weight: 0.06 }
};

// ---- 等级配置 ----
var GRADES = {
  A: { min: 85, label: "A · 一人公司潜力股", color: "var(--grade-a)" },
  B: { min: 70, label: "B · 基础扎实待突破", color: "var(--grade-b)" },
  C: { min: 55, label: "C · 需要系统提升", color: "var(--grade-c)" },
  D: { min: 0,  label: "D · 建议先打基础",  color: "var(--grade-d)" }
};

// ---- 正反馈弹窗文案 ----
var FEEDBACK_MESSAGES = [
  { icon: "", title: "太棒了！已经完成1/5！", text: "继续保持，你的答案将帮助我们精准定位你的优势领域。" },
  { icon: "", title: "已完成2/5！", text: "你已经走过了一半的路程，坚持就是胜利！" },
  { icon: "", title: "快完成了！3/5！", text: "最后几题了，你的专属报告即将生成！" },
  { icon: "", title: "4/5！即将到达终点！", text: "再回答几道题，就能查看你的完整诊断报告了！" },
  { icon: "", title: "全部完成！", text: "太棒了！你的专属报告正在生成中…" }
];

// ---- 赛道匹配规则 ----
var TRACK_RULES = [
  {
    name: "知识付费赛道",
    desc: "适合有专业技能和内容输出能力的人，通过课程、训练营、咨询等方式变现。",
    conditions: function(scores) {
      return scores["核心禀赋"] >= 70 && scores["内容能力"] >= 60;
    },
    priority: 1
  },
  {
    name: "咨询服务赛道",
    desc: "适合有深度专业能力和客户资源的人，提供1v1或小团队咨询服务。",
    conditions: function(scores) {
      return scores["核心禀赋"] >= 75 && scores["商业闭环"] >= 65 && scores["影响力"] >= 50;
    },
    priority: 1
  },
  {
    name: "自媒体IP赛道",
    desc: "适合内容创作能力强、有持续输出习惯的人，通过流量变现。",
    conditions: function(scores) {
      return scores["内容能力"] >= 70 && scores["持续运营"] >= 60;
    },
    priority: 2
  },
  {
    name: "技术外包赛道",
    desc: "适合有技术能力且执行力强的人，提供外包开发/设计等服务。",
    conditions: function(scores) {
      return scores["核心禀赋"] >= 70 && scores["落地执行"] >= 65 && scores["产品化能力"] >= 50;
    },
    priority: 2
  },
  {
    name: "私域电商赛道",
    desc: "适合有社交资源和运营能力的人，通过私域流量复购实现高利润。",
    conditions: function(scores) {
      return scores["商业闭环"] >= 60 && scores["影响力"] >= 55 && scores["持续运营"] >= 55;
    },
    priority: 2
  },
  {
    name: "AI+效率工具赛道",
    desc: "适合对AI工具有认知、产品化能力强的人，打造AI驱动的效率产品。",
    conditions: function(scores) {
      return scores["产品化能力"] >= 65 && scores["AI杠杆"] >= 60;
    },
    priority: 2
  },
  {
    name: "轻服务型OPC",
    desc: "适合擅长社交和有一对一服务能力的人，通过咨询、陪跑、代运营变现。",
    conditions: function(scores) {
      return scores["影响力"] >= 60 && scores["核心禀赋"] >= 55 && scores["商业闭环"] >= 50;
    },
    priority: 3
  },
  {
    name: "数字产品型OPC",
    desc: "适合有产品化思维和内容能力的人，打造模板、工具、数字产品。",
    conditions: function(scores) {
      return scores["产品化能力"] >= 65 && scores["内容能力"] >= 50;
    },
    priority: 3
  },
  {
    name: "自由职业接单赛道",
    desc: "适合有一定技能基础、执行能力强的人，先通过接单积累经验和收入。",
    conditions: function(scores) {
      return scores["核心禀赋"] >= 50 && scores["落地执行"] >= 55 && scores["商业闭环"] >= 50;
    },
    priority: 3
  },
  {
    name: "创业预备队",
    desc: "适合有一定准备度和风险承受能力的转型者，建议先做副业验证。",
    conditions: function(scores) {
      return scores["财务感知"] >= 50 && scores["持续运营"] >= 50 && scores["落地执行"] >= 50;
    },
    priority: 4
  }
];

// ==========================================
// 答题状态管理
// ==========================================
var QuizState = {
  currentIndex: 0,
  answers: {},
  totalQuestions: QUESTIONS.length,

  // 选择答案
  selectAnswer: function(questionId, optionIndex, score) {
    this.answers[questionId] = { optionIndex: optionIndex, score: score };
  },

  // 获取当前题目答案
  getAnswer: function(questionId) {
    return this.answers[questionId] || null;
  },

  // 是否已答完
  isComplete: function() {
    return Object.keys(this.answers).length === this.totalQuestions;
  },

  // 进度百分比
  getProgress: function() {
    return Object.keys(this.answers).length / this.totalQuestions * 100;
  },

  // 重置
  reset: function() {
    this.currentIndex = 0;
    this.answers = {};
  }
};

// ==========================================
// 评分算法
// ==========================================
var Scoring = {
  // 计算各维度得分（百分制，基于动态题目）
  calculateDimensionScores: function() {
    var scores = {};
    var dimTotals = {};
    var dimCounts = {};

    // 初始化
    for (var dimName in DIMENSIONS) {
      scores[dimName] = 0;
      dimTotals[dimName] = 0;
      dimCounts[dimName] = 0;
    }

    // 遍历当前选中的题目，按维度累加
    QUESTIONS.forEach(function(q) {
      var answer = QuizState.answers[q.id];
      if (answer && dimTotals.hasOwnProperty(q.dimension)) {
        dimTotals[q.dimension] += answer.score;
        dimCounts[q.dimension] += 1;
      }
    });

    for (var dim in DIMENSIONS) {
      if (dimCounts[dim] > 0) {
        scores[dim] = Math.round((dimTotals[dim] / (dimCounts[dim] * 5)) * 100);
      } else {
        scores[dim] = 0;
      }
    }
    return scores;
  },

  // 计算总分（加权百分制）
  calculateTotalScore: function() {
    var dimScores = this.calculateDimensionScores();
    var total = 0;
    for (var dimName in DIMENSIONS) {
      total += dimScores[dimName] * DIMENSIONS[dimName].weight;
    }
    return Math.round(total);
  },

  // 获取等级
  getGrade: function(score) {
    if (score >= 85) return "A";
    if (score >= 70) return "B";
    if (score >= 55) return "C";
    return "D";
  },

  // 获取核心优势（得分最高的2-3个维度）
  getStrengths: function(dimScores) {
    var sorted = Object.keys(dimScores).sort(function(a, b) {
      return dimScores[b] - dimScores[a];
    });
    return sorted.slice(0, 3).filter(function(name) {
      return dimScores[name] >= 60;
    });
  },

  // 获取核心卡点（得分最低的2-3个维度）
  getPainPoints: function(dimScores) {
    var sorted = Object.keys(dimScores).sort(function(a, b) {
      return dimScores[a] - dimScores[b];
    });
    return sorted.slice(0, 3).filter(function(name) {
      return dimScores[name] < 70;
    });
  },

  // 赛道匹配
  matchTracks: function(dimScores) {
    var matched = [];
    TRACK_RULES.forEach(function(track) {
      if (track.conditions(dimScores)) {
        matched.push(track);
      }
    });
    // 按优先级排序
    matched.sort(function(a, b) { return a.priority - b.priority; });
    return matched.slice(0, 3);
  }
};

// ==========================================
// DOM 辅助函数
// ==========================================
function $(selector) { return document.querySelector(selector); }
function $$(selector) { return document.querySelectorAll(selector); }

function createElement(tag, className, textContent) {
  var el = document.createElement(tag);
  if (className) el.className = className;
  if (textContent) el.textContent = textContent;
  return el;
}

// ==========================================
// 进度条更新
// ==========================================
function updateProgressBar() {
  var fill = $(".progress-bar__fill");
  var text = $(".progress-text");
  if (!fill) return;

  var answered = Object.keys(QuizState.answers).length;
  var total = QuizState.totalQuestions;
  var pct = (answered / total) * 100;

  fill.style.width = pct + "%";
  if (text) {
    text.querySelector(".progress-current").textContent = answered;
    text.querySelector(".progress-total").textContent = total;
  }
}

// ==========================================
// 正反馈弹窗
// ==========================================
// idx=-1 表示最后一题完成，显示进度条模式
function showFeedback(index) {
  var msg = FEEDBACK_MESSAGES[index];
  var isLast = (index === -1);

  var overlay = $(".modal-overlay");
  if (!overlay) {
    overlay = document.createElement("div");
    overlay.className = "modal-overlay";
    overlay.innerHTML = '<div class="modal">' +
      '<div class="modal__icon" id="fb-icon"></div>' +
      '<div class="modal__title" id="fb-title"></div>' +
      '<div class="modal__text" id="fb-text"></div>' +
      '<div class="modal__progress" id="fb-progress" style="display:none;">' +
        '<div class="modal__progress-bar"><div class="modal__progress-fill" id="fb-progress-fill"></div></div>' +
        '<div class="modal__progress-text" id="fb-progress-text">正在生成报告… 0%</div>' +
      '</div>' +
      '<button class="btn btn-primary btn-sm" id="fb-close">继续答题</button>' +
      '</div>';
    document.body.appendChild(overlay);

    $("#fb-close").addEventListener("click", function() {
      overlay.classList.remove("active");
    });
    overlay.addEventListener("click", function(e) {
      if (e.target === overlay) overlay.classList.remove("active");
    });
  }

  if (isLast) {
    // 最后一题完成：显示进度条，隐藏按钮
    $("#fb-icon").style.display = "none";
    $("#fb-title").textContent = "全部完成！";
    $("#fb-text").textContent = "正在为你生成专属诊断报告…";
    $("#fb-progress").style.display = "block";
    $("#fb-close").style.display = "none";
    // 启动进度条动画
    animateProgressBar(function() {
      saveResult();
      window.location.href = "report-free.html";
    });
  } else {
    // 中间弹窗：正常显示
    if (msg) {
      $("#fb-icon").textContent = msg.icon;
      $("#fb-title").textContent = msg.title;
      $("#fb-text").textContent = msg.text;
    }
    $("#fb-progress").style.display = "none";
    $("#fb-close").style.display = "";
    $("#fb-close").textContent = "继续答题";
  }

  requestAnimationFrame(function() {
    overlay.classList.add("active");
  });
}

// 进度条动画（0% -> 100%，然后跳转）
function animateProgressBar(callback) {
  var fill = $("#fb-progress-fill");
  var text = $("#fb-progress-text");
  if (!fill || !text) { callback(); return; }

  var pct = 0;
  var interval = setInterval(function() {
    pct += Math.random() * 15 + 5;
    if (pct >= 100) {
      pct = 100;
      fill.style.width = "100%";
      text.textContent = "报告生成完成！";
      clearInterval(interval);
      setTimeout(callback, 400);
    } else {
      fill.style.width = pct + "%";
      text.textContent = "正在生成报告… " + Math.round(pct) + "%";
    }
  }, 120);
}

// ==========================================
// localStorage 数据传递
// ==========================================
var Storage = {
  KEY: "opc_quiz_result",

  save: function(data) {
    try {
      localStorage.setItem(this.KEY, JSON.stringify(data));
    } catch(e) {
      console.warn("localStorage save failed:", e);
    }
  },

  load: function() {
    try {
      var raw = localStorage.getItem(this.KEY);
      return raw ? JSON.parse(raw) : null;
    } catch(e) {
      return null;
    }
  },

  clear: function() {
    try {
      localStorage.removeItem(this.KEY);
    } catch(e) {}
  }
};

// ==========================================
// 保存完整结果
// ==========================================
function saveResult() {
  var dimScores = Scoring.calculateDimensionScores();
  var totalScore = Scoring.calculateTotalScore();
  var grade = Scoring.getGrade(totalScore);
  var strengths = Scoring.getStrengths(dimScores);
  var painPoints = Scoring.getPainPoints(dimScores);
  var tracks = Scoring.matchTracks(dimScores);

  var result = {
    totalScore: totalScore,
    grade: grade,
    gradeLabel: GRADES[grade].label,
    dimScores: dimScores,
    strengths: strengths,
    painPoints: painPoints,
    tracks: tracks,
    answers: QuizState.answers,
    timestamp: Date.now()
  };

  Storage.save(result);
  trackEvent("quiz_complete", { totalScore: totalScore, grade: grade });
  return result;
}

// ==========================================
// 答题页渲染
// ==========================================
function renderQuestion(index) {
  var q = QUESTIONS[index];
  if (!q) return;

  QuizState.currentIndex = index;

  var questionCard = $(".question-card");
  if (!questionCard) return;

  // 更新进度条
  updateProgressBar();

  // 题号和维度标签（使用画像化题目顺序）
  questionCard.querySelector(".question-num").textContent = "第 " + (q.displayOrder || index + 1) + " 题";
  questionCard.querySelector(".question-dim").textContent = q.dimension;
  questionCard.querySelector(".question-text").textContent = q.question;

  // 渲染题目说明（帮助用户缩短判断时间）
  var hintEl = questionCard.querySelector(".question-hint");
  if (hintEl) {
    if (q.hint) {
      hintEl.style.display = "block";
      hintEl.textContent = q.hint;
    } else {
      hintEl.style.display = "none";
      hintEl.textContent = "";
    }
  }

  // 渲染选项
  var optionsWrap = questionCard.querySelector(".options-wrap");
  optionsWrap.innerHTML = "";

  var existing = QuizState.getAnswer(q.id);

  q.options.forEach(function(opt, i) {
    var div = document.createElement("div");
    div.className = "option" + (existing && existing.optionIndex === i ? " selected" : "");
    div.innerHTML = '<span class="option__letter">' + opt.letter + '</span>' +
                    '<span class="option__text">' + opt.text + '</span>';
    div.addEventListener("click", function() {
      // 移除之前的选中
      optionsWrap.querySelectorAll(".option").forEach(function(el) {
        el.classList.remove("selected");
      });
      div.classList.add("selected");
      QuizState.selectAnswer(q.id, i, opt.score);
      updateProgressBar();

      // 短暂延迟后自动进入下一题
      setTimeout(function() {
        if (index + 1 < QUESTIONS.length) {
          renderQuestion(index + 1);
        } else {
          // 最后一题，显示查看结果按钮
          showResultButton();
        }
      }, 400);
    });
    optionsWrap.appendChild(div);
  });

  // 动画
  questionCard.classList.remove("anim-fade-in-up");
  void questionCard.offsetWidth; // reflow
  questionCard.classList.add("anim-fade-in-up");

  // 检查是否需要弹窗（每3题后）
  if (existing && index > 0 && index % 3 === 2) {
    showFeedback(Math.floor(index / 3) - 1);
  }
}

function showResultButton() {
  var questionCard = $(".question-card");
  if (!questionCard) return;

  // 最后一题的反馈弹窗：进度条模式
  showFeedback(-1);

  questionCard.innerHTML =
    '<div class="text-center" style="padding: 40px 0;">' +
      '<h2 style="margin-bottom: 8px;">全部答完啦！</h2>' +
      '<p class="subtitle" style="margin-bottom: 24px;">你的专属诊断报告已准备就绪</p>' +
      '<a href="report-free.html" class="btn btn-primary btn-lg" id="view-result-btn">查看我的报告 →</a>' +
    '</div>';

  document.getElementById("view-result-btn").addEventListener("click", function(e) {
    saveResult();
  });
}

// ==========================================
// 报告页渲染（免费版 + 付费版共用）
// ==========================================
function renderReport(isPaid) {
  var result = Storage.load();
  if (!result) {
    window.location.href = "index.html";
    return;
  }

  // 页面访问埋点
  trackEvent("page_view", { page: isPaid ? "report-paid" : "report-free" });

  // 水印
  renderWatermark();

  // 个性化问候
  renderGreeting($(".report-greeting-wrap"));

  // 总分
  var scoreEl = $(".score-number");
  if (scoreEl) animateNumber(scoreEl, 0, result.totalScore, 1200);

  // 等级标签
  var gradeEl = $(".grade-tag");
  if (gradeEl) {
    gradeEl.textContent = result.grade;
    gradeEl.className = "grade-tag grade-tag--" + result.grade.toLowerCase();
  }

  var gradeLabelEl = $(".grade-label");
  if (gradeLabelEl) gradeLabelEl.textContent = result.gradeLabel;

  // 核心优势
  var strengthsList = $(".strengths-list");
  if (strengthsList) {
    strengthsList.innerHTML = "";
    result.strengths.forEach(function(name) {
      var li = document.createElement("li");
      li.textContent = name + "（" + result.dimScores[name] + "分）— 你的核心竞争力";
      strengthsList.appendChild(li);
    });
  }

  // 核心卡点
  var painList = $(".pain-list");
  if (painList) {
    painList.innerHTML = "";
    result.painPoints.forEach(function(name) {
      var li = document.createElement("li");
      li.textContent = name + "（" + result.dimScores[name] + "分）— 需要重点提升";
      painList.appendChild(li);
    });
  }

  // 维度详情 / 赛道（付费版全量，免费版2条+分享解锁）
  if (isPaid) {
    renderDimensionDetails(result);
    renderTracks(result, true);
    renderSOP(result);
  } else {
    // 免费版：显示2条赛道 + 分享解锁 + 私域导流
    renderTracks(result, false);
  }

  // 结语
  renderClosing($(".report-closing-wrap"));

  // 专业词汇注释
  renderGlossary($(".glossary-wrap"));

  // IP落款 + 时间戳
  renderFooterBrand($(".footer-brand-wrap"));

  // 分享按钮
  initShareButtons();

  // 下载按钮
  initDownload();
}

function renderDimensionDetails(result) {
  var wrap = $(".dimensions-detail");
  if (!wrap) return;

  wrap.innerHTML = "";
  var dimNames = ["核心禀赋", "商业闭环", "落地执行", "内容能力", "产品化能力", "持续运营", "财务感知", "AI杠杆", "影响力"];

  dimNames.forEach(function(name) {
    var score = result.dimScores[name] || 0;
    var level = score >= 75 ? "high" : (score >= 55 ? "mid" : "low");

    var div = document.createElement("div");
    div.className = "dim-item";
    div.innerHTML =
      '<div class="dim-header">' +
        '<span class="dim-name">' + name + '</span>' +
        '<span class="dim-score">' + score + '分</span>' +
      '</div>' +
      '<div class="dim-bar">' +
        '<div class="dim-bar__fill dim-bar__fill--' + level + '" style="width: 0%"></div>' +
      '</div>';
    wrap.appendChild(div);

    // 动画延迟
    setTimeout(function() {
      div.querySelector(".dim-bar__fill").style.width = score + "%";
    }, 200);
  });
}

function renderTracks(result, isPaid) {
  var wrap = $(".tracks-wrap");
  if (!wrap) return;

  wrap.innerHTML = "";
  if (result.tracks.length === 0) {
    wrap.innerHTML = '<p class="text-muted">根据你的测评结果，建议先提升基础能力。</p>';
    return;
  }

  // 付费版：直接显示全部3条
  if (isPaid) {
    result.tracks.forEach(function(track, i) {
      var div = document.createElement("div");
      div.className = "track-card";
      div.innerHTML =
        '<span class="track-card__rank">定制 ' + (i + 1) + '</span>' +
        '<div class="track-card__name">' + track.name + '</div>' +
        '<div class="track-card__desc">' + track.desc + '</div>' +
        '<div class="track-card__action"><button class="track-card__btn" data-track="' + track.name + '">我要定制</button></div>';
      wrap.appendChild(div);
    });
    bindTrackButtons();
    return;
  }

  // 免费版：显示2条 + 分享解锁第3条
  var shared = localStorage.getItem("opc_shared") === "1";

  // 显示已解锁的赛道
  var showCount = shared ? 3 : 2;
  result.tracks.slice(0, showCount).forEach(function(track, i) {
    var div = document.createElement("div");
    div.className = "track-card";
    var rankLabel = "定制 " + (i + 1);
    div.innerHTML =
      '<span class="track-card__rank">' + rankLabel + '</span>' +
      '<div class="track-card__name">' + track.name + '</div>' +
      '<div class="track-card__desc">' + track.desc + '</div>' +
      '<div class="track-card__action"><button class="track-card__btn" data-track="' + track.name + '">我要定制</button></div>';
    wrap.appendChild(div);
  });
  bindTrackButtons();

  // 第3条未解锁时显示锁定状态
  if (!shared) {
    var locked = document.createElement("div");
    locked.className = "track-card track-card--locked";
    locked.innerHTML =
      '<div class="track-card__lock">分享后解锁第3条定制赛道</div>' +
      '<div class="track-card__hint">分享给朋友即可查看为你定制的第3条赛道</div>';
    wrap.appendChild(locked);
    var pd = $(".private-domain-wrap");
    if (pd) pd.style.display = "none";
  } else {
    renderPrivateDomainCTA($(".private-domain-wrap"));
  }
}

// 绑定赛道"我要定制"按钮
function bindTrackButtons() {
  document.querySelectorAll(".track-card__btn").forEach(function(btn) {
    btn.addEventListener("click", function() {
      var trackName = this.getAttribute("data-track");
      showCustomModal(trackName);
    });
  });
}

// 显示"我要定制"模态
function showCustomModal(trackName) {
  var overlay = $(".modal-overlay");
  if (!overlay) {
    overlay = document.createElement("div");
    overlay.className = "modal-overlay";
    overlay.innerHTML = '<div class="modal">' +
      '<div class="modal__icon" id="fb-icon" style="display:none;"></div>' +
      '<div class="modal__title" id="fb-title"></div>' +
      '<div class="modal__text" id="fb-text"></div>' +
      '<div class="modal__progress" id="fb-progress" style="display:none;"></div>' +
      '<button class="btn btn-primary btn-sm" id="fb-close">关闭</button>' +
      '</div>';
    document.body.appendChild(overlay);
    $("#fb-close").addEventListener("click", function() {
      overlay.classList.remove("active");
    });
    overlay.addEventListener("click", function(e) {
      if (e.target === overlay) overlay.classList.remove("active");
    });
  }
  var iconEl = $("#fb-icon");
  if (iconEl) iconEl.style.display = "none";
  var progEl = $("#fb-progress");
  if (progEl) progEl.style.display = "none";
  $("#fb-close").style.display = "";
  $("#fb-close").textContent = "关闭";
  $("#fb-title").textContent = trackName + " — 定制你的落地方案";
  $("#fb-text").innerHTML =
    '扫描下方微信，获取「' + trackName + '」完整启动方案：<br><br>' +
    '<img src="assets/wechat-qr.png" alt="微信二维码" style="width:160px;height:160px;border-radius:10px;border:2px solid var(--border);margin:4px 0;">' +
    '<div style="font-size:0.75rem;color:var(--text-muted);margin-top:4px;">微信扫码添加，发送「' + trackName + '」</div>';
  requestAnimationFrame(function() {
    overlay.classList.add("active");
  });
  // 埋点
  trackEvent("track_btn_click", { track: trackName });
}

// 渲染私域导流CTA
function renderPrivateDomainCTA(el) {
  if (!el) return;
  el.style.display = "block";
  el.innerHTML =
    '<div class="private-domain-card">' +
      '<div class="private-domain__title">你的3条定制赛道方案已备好</div>' +
      '<div class="private-domain__body">上面的赛道是系统的初步判断。扫描下方微信，可获取你的3条赛道完整落地方案：</div>' +
      '<ul class="private-domain__list">' +
        '<li>每一条赛道的具体启动步骤</li>' +
        '<li>适合你当前阶段的第一个MVP设计</li>' +
        '<li>3天内可执行的起步规划</li>' +
      '</ul>' +
      '<div class="private-domain__cta">' +
        '<img src="assets/wechat-qr.png" alt="微信二维码" style="width:180px;height:180px;border-radius:12px;border:2px solid var(--border);margin:8px 0;">' +
        '<div class="private-domain__tip">微信扫码添加，发送「赛道方案」</div>' +
      '</div>' +
    '</div>';
}

function renderSOP(result) {
  var wrap = $(".sop-timeline");
  if (!wrap) return;

  var sopItems = [
    { week: "第1周", content: "自我定位梳理：明确你的核心禀赋和差异化优势" },
    { week: "第2周", content: "产品设计：确定你的第一个最小可行产品（MVP）" },
    { week: "第3周", content: "渠道搭建：选择1-2个核心平台，建立获客入口" },
    { week: "第4周", content: "内容启动：产出第一批内容，验证市场反馈" }
  ];

  // 根据短板定制补充
  if (result.painPoints.includes("内容能力")) {
    sopItems.push({ week: "第5周", content: "内容能力专项突破：每天练习1篇短文案输出" });
  }
  if (result.painPoints.includes("商业闭环")) {
    sopItems.push({ week: "第5周", content: "商业闭环补强：学习定价策略和客户沟通技巧" });
  }
  if (result.painPoints.includes("持续运营")) {
    sopItems.push({ week: "第5周", content: "持续运营规划：建立每日/每周运营SOP" });
  }
  if (result.painPoints.includes("财务感知")) {
    sopItems.push({ week: "第5周", content: "财务规划：建立收入成本记账习惯" });
  }
  if (result.painPoints.includes("AI杠杆")) {
    sopItems.push({ week: "第6周", content: "AI工具流程：搭建AI辅助工作流" });
  }
  if (result.painPoints.includes("影响力")) {
    sopItems.push({ week: "第6周", content: "人脉拓展：建立转介绍网络和社群运营" });
  }
  if (result.painPoints.includes("产品化能力")) {
    sopItems.push({ week: "第6周", content: "产品化打磨：整理技能为可售卖形态" });
  }
  if (result.painPoints.includes("落地执行")) {
    sopItems.push({ week: "第6周", content: "执行强化：建立每日启动机制和复盘习惯" });
  }

  wrap.innerHTML = "";
  sopItems.forEach(function(item) {
    var div = document.createElement("div");
    div.className = "timeline-item";
    div.innerHTML =
      '<div class="timeline-item__week">' + item.week + '</div>' +
      '<div class="timeline-item__content">' + item.content + '</div>';
    wrap.appendChild(div);
  });
}

// ==========================================
// 报告页增强功能（称谓/结语/注释/水印/下载）
// ==========================================

// 获取用户称呼
function getUserTitle() {
  try {
    var raw = localStorage.getItem("opc_user_profile");
    if (raw) {
      var p = JSON.parse(raw);
      var occ = p.occupation || "";
      var age = p.age || "";
      if (age === "18-22") return "亲爱的年轻人";
      if (age === "23-27") return "亲爱的潜力股";
      if (occ === "学生") return "亲爱的同学";
      if (occ === "自由职业") return "亲爱的自由人";
      if (occ === "创业者" || occ === "个体经营者") return "尊敬的CEO";
      if (occ === "在职员工" || occ === "全职主理人") return "尊敬的CEO";
      return "亲爱的测评用户";
    }
  } catch(e) {}
  return "亲爱的测评用户";
}

// 渲染个性化问候语
function renderGreeting(el) {
  if (!el) return;
  var title = getUserTitle();
  var now = new Date();
  var hour = now.getHours();
  var timeWord = hour < 12 ? "上午好" : (hour < 18 ? "下午好" : "晚上好");
  el.innerHTML =
    '<div class="report-greeting">' + title + '，' + timeWord + '</div>' +
    '<div class="report-thanks">感谢你完成 OPC 一人公司适配度测评。以下报告基于你的15道答题数据生成，定位你的优势领域与成长方向。测评结果不构成职业建议或收益承诺，请结合自身情况独立判断。</div>';
}

// 渲染结语
function renderClosing(el) {
  if (!el) return;
  el.innerHTML =
    '<div class="report-closing">' +
      '<div class="report-closing__title">结语</div>' +
      '<div class="report-closing__text">一人公司的本质，是用最小的资源撬动最大的个人价值。你不是需要成为"全能型选手"，而是找到你最能打的那一个点，持续投入，持续交付，持续增长。这份报告是你的起点，不是终点。真正的答案，在你的下一次行动里。</div>' +
    '</div>';
}

// 渲染专业词汇注释
function renderGlossary(el) {
  if (!el) return;
  var terms = [
    { term: "一人公司", def: "以个人或极简团队为核心的小规模商业组织，追求高利润、强闭环、抗风险、绝对职业主权。" },
    { term: "核心禀赋", def: "你被他人和市场验证的、具有差异化优势的个人能力，是一人公司最底层的竞争壁垒。" },
    { term: "商业闭环", def: "从获客、成交、交付到售后的完整变现链路，闭环越完整，收入越稳定。" },
    { term: "产品化", def: "将个人经验、技能或服务转化为标准化、可售卖的产品形态，实现从「卖时间」到「卖产品」的跃迁。" },
    { term: "定制赛道", def: "根据你的能力画像，量身定制最适合你当前阶段的一人公司经营方向与启动方案。" },
    { term: "SOP", def: "Standard Operating Procedure，标准操作流程。将重复性工作流程化，提升执行效率。" }
  ];
  var html = '<div class="glossary-section">' +
    '<div class="glossary-section__title">专业词汇注释</div>';
  terms.forEach(function(t) {
    html += '<div class="glossary-item"><span class="glossary-item__term">' + t.term + '</span><span class="glossary-item__def">' + t.def + '</span></div>';
  });
  html += '</div>';
  el.innerHTML = html;
}

// 渲染IP落款和时间戳
function renderFooterBrand(el) {
  if (!el) return;
  var now = new Date();
  var ts = now.getFullYear() + '-' +
    String(now.getMonth() + 1).padStart(2, '0') + '-' +
    String(now.getDate()).padStart(2, '0') + ' ' +
    String(now.getHours()).padStart(2, '0') + ':' +
    String(now.getMinutes()).padStart(2, '0');
  el.innerHTML =
    '<div class="footer-brand">' +
      '<div class="footer-brand__name">孵化OPC</div>' +
      '<div class="footer-brand__ts">报告生成时间：' + ts + '</div>' +
    '</div>';
}

// 初始化水印
function renderWatermark() {
  var existing = document.querySelector(".watermark");
  if (existing) return;
  var wm = document.createElement("div");
  wm.className = "watermark";
  var lines = [];
  for (var i = 0; i < 8; i++) lines.push("OPC 一人公司孵化器");
  wm.innerHTML = '<div class="watermark__text">' + lines.join("&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;") + '</div>';
  document.body.appendChild(wm);
}

// 下载按钮
function initDownload() {
  var btn = $(".btn-download");
  if (btn) {
    btn.addEventListener("click", function(e) {
      e.preventDefault();
      window.print();
    });
  }
}

// 初始化分享按钮
function initShareButtons() {
  var btns = document.querySelectorAll(".share-btn");
  btns.forEach(function(btn) {
    btn.addEventListener("click", function() {
      trackEvent("share_click", { title: this.title });
      localStorage.setItem("opc_shared", "1");
      // 显示分享成功反馈
      var overlay = $(".modal-overlay");
      if (overlay) {
        $("#fb-title").textContent = "分享成功！";
        $("#fb-text").textContent = "第3条定制赛道已解锁，查看下方你的完整方案。";
        $("#fb-icon").style.display = "none";
        $("#fb-progress").style.display = "none";
        $("#fb-close").style.display = "";
        $("#fb-close").textContent = "查看方案";
        overlay.classList.add("active");
        $("#fb-close").onclick = function() {
          overlay.classList.remove("active");
          // 刷新赛道和私域导流区
          var result = Storage.load();
          if (result) renderTracks(result, false);
        };
      }
    });
  });
}

// ==========================================
// 数据统计系统（本地 + 云端批量上报）
// ==========================================
var STATS_KEY = "opc_stats";
var CLOUD_ENV = "cloud1-d3ghz1fpd2ce39b7c";
var FLUSH_INTERVAL = 30000; // 30秒自动上报一次

function trackEvent(action, data) {
  try {
    var evt = {
      action: action,
      data: data || {},
      page: document.body.getAttribute("data-page") || "unknown",
      time: Date.now(),
      sessionId: getSessionId()
    };
    // 本地存储
    var raw = localStorage.getItem(STATS_KEY);
    var stats = raw ? JSON.parse(raw) : { events: [], firstSeen: Date.now() };
    stats.events.push(evt);
    if (stats.events.length > 500) stats.events = stats.events.slice(-500);
    localStorage.setItem(STATS_KEY, JSON.stringify(stats));
    // 待上报队列
    var queue = JSON.parse(localStorage.getItem("opc_stats_queue") || "[]");
    queue.push(evt);
    localStorage.setItem("opc_stats_queue", JSON.stringify(queue));
  } catch(e) {}
}

// 定时批量上报到云函数
function flushStats() {
  var queue = JSON.parse(localStorage.getItem("opc_stats_queue") || "[]");
  if (queue.length === 0) return;
  // 调用云函数上报
  if (typeof wx !== 'undefined' && wx.cloud) {
    wx.cloud.init({ env: CLOUD_ENV });
    wx.cloud.callFunction({
      name: "trackEvent",
      data: { action: "batch", data: { events: queue } },
      success: function() { localStorage.setItem("opc_stats_queue", "[]"); },
      fail: function() { /* 网络失败时保留队列，下次重试 */ }
    });
  }
}
setInterval(flushStats, FLUSH_INTERVAL);

function getSessionId() {
  var sid = localStorage.getItem("opc_session");
  if (!sid) {
    sid = "s_" + Date.now() + "_" + Math.random().toString(36).slice(2, 8);
    localStorage.setItem("opc_session", sid);
  }
  return sid;
}

// ==========================================
// 数字动画
// ==========================================
function animateNumber(el, from, to, duration) {
  var start = performance.now();
  function step(now) {
    var elapsed = now - start;
    var progress = Math.min(elapsed / duration, 1);
    // easeOutCubic
    var eased = 1 - Math.pow(1 - progress, 3);
    el.textContent = Math.round(from + (to - from) * eased);
    if (progress < 1) requestAnimationFrame(step);
  }
  requestAnimationFrame(step);
}

// ==========================================
// Debug 模式：跳过答题直接看报告
// ==========================================
// 在 URL 后加 ?debug 即可：report-free.html?debug
function debugInit() {
  // 生成模拟画像
  var mockProfile = {
    age: "28-35",
    gender: "male",
    occupation: "在职员工",
    education: "本科",
    channel: "小红书",
    timestamp: Date.now()
  };
  try { localStorage.setItem("opc_user_profile", JSON.stringify(mockProfile)); } catch(e) {}

  // 模拟题库中各题答案（取最高分选项=5分的索引0）
  var mockAnswers = {};
  QUESTION_POOL.forEach(function(q) {
    mockAnswers[q.id] = { optionIndex: 0, score: 5 };
  });
  // 部分题目给中等分更真实
  [4,7,9,12,15,19,22,25,28].forEach(function(id, i) {
    if (mockAnswers[id]) mockAnswers[id] = { optionIndex: 2, score: 3 };
  });

  // 模拟维度得分（9维度）
  var mockDimScores = {
    "核心禀赋": 78,
    "商业闭环": 62,
    "落地执行": 71,
    "内容能力": 55,
    "产品化能力": 68,
    "持续运营": 45,
    "财务感知": 52,
    "AI杠杆": 80,
    "影响力": 60
  };

  // 模拟赛道匹配
  var mockTracks = [
    { name: "AI+效率工具赛道", desc: "适合对AI工具有认知、产品化能力强的人，打造AI驱动的效率产品。", priority: 1 },
    { name: "知识付费赛道", desc: "适合有专业技能和内容输出能力的人，通过课程、训练营、咨询等方式变现。", priority: 2 },
    { name: "自由职业接单赛道", desc: "适合有一定技能基础、执行能力强的人，先通过接单积累经验和收入。", priority: 3 }
  ];

  var result = {
    totalScore: 65,
    grade: "C",
    gradeLabel: "C · 需要系统提升",
    dimScores: mockDimScores,
    strengths: ["核心禀赋", "AI杠杆"],
    painPoints: ["持续运营", "内容能力"],
    tracks: mockTracks,
    answers: mockAnswers,
    timestamp: Date.now()
  };

  Storage.save(result);
  console.log("[Debug] 模拟数据已生成");
}

// ==========================================
// 付费页逻辑
// ==========================================
function initPayPage() {
  var result = Storage.load();
  if (!result) {
    // 防止直接访问支付页：无答题数据则跳回首页
    window.location.href = "index.html";
    return;
  }

  // 支付页访问埋点
  trackEvent("page_view", { page: "pay" });

  // 反爬检测：阻止非正常浏览器访问
  var ua = navigator.userAgent.toLowerCase();
  if (/bot|spider|crawler|headless|phantom|curl|wget/i.test(ua)) {
    document.body.innerHTML = '<div style="text-align:center;padding:80px 20px;color:#999;">访问受限</div>';
    return;
  }

  // 渲染免费版预览（模糊化区域）
  var previewScore = $(".preview-score");
  if (previewScore) previewScore.textContent = result.totalScore;

  var previewGrade = $(".preview-grade");
  if (previewGrade) {
    previewGrade.textContent = result.grade;
    previewGrade.className = "grade-tag grade-tag--" + result.grade.toLowerCase();
  }

  // 支付按钮
  var payBtn = $(".pay-btn");
  if (payBtn) {
    payBtn.addEventListener("click", function(e) {
      e.preventDefault();
      showSubmitProof();
    });
  }
}

function showPaySuccess() {
  trackEvent("pay_complete", {});
  var overlay = document.createElement("div");
  overlay.className = "modal-overlay active";
  overlay.innerHTML =
    '<div class="modal">' +
      '<div class="modal__title">等待确认</div>' +
      '<div class="modal__text">请将付款截图发送给客服确认，确认后即可查看完整报告。</div>' +
      '<div style="margin:16px 0;">' +
        '<img src="assets/wechat-qr.png" alt="微信二维码" style="width:150px;height:150px;border-radius:10px;border:2px solid var(--border);margin:4px 0;">' +
      '</div>' +
      '<div style="font-size:0.75rem;color:var(--text-muted);margin-bottom:16px;">微信扫码添加客服，发送截图</div>' +
      '<button class="btn btn-primary btn-sm" id="go-report" style="opacity:0.5;pointer-events:none;">已确认，查看完整报告</button>' +
    '</div>';
  document.body.appendChild(overlay);

  // 3秒后才允许点击（模拟客服确认）
  setTimeout(function() {
    var btn = document.getElementById("go-report");
    if (btn) {
      btn.style.opacity = "1";
      btn.style.pointerEvents = "auto";
      btn.addEventListener("click", function() {
        overlay.classList.remove("active");
        setTimeout(function() { window.location.href = "report-paid.html"; }, 300);
      });
    }
  }, 3000);
}

// 截图发客服弹窗
function showSubmitProof() {
  var overlay = $(".modal-overlay");
  if (!overlay) {
    overlay = document.createElement("div");
    overlay.className = "modal-overlay";
    overlay.innerHTML = '<div class="modal">' +
      '<div class="modal__icon" id="fb-icon" style="display:none;"></div>' +
      '<div class="modal__title" id="fb-title"></div>' +
      '<div class="modal__text" id="fb-text"></div>' +
      '<div class="modal__progress" id="fb-progress" style="display:none;"></div>' +
      '<button class="btn btn-primary btn-sm" id="fb-close">关闭</button>' +
      '</div>';
    document.body.appendChild(overlay);
    $("#fb-close").addEventListener("click", function() {
      overlay.classList.remove("active");
    });
    overlay.addEventListener("click", function(e) {
      if (e.target === overlay) overlay.classList.remove("active");
    });
  }
  var iconEl = $("#fb-icon");
  if (iconEl) iconEl.style.display = "none";
  var progEl = $("#fb-progress");
  if (progEl) progEl.style.display = "none";
  $("#fb-close").style.display = "";
  $("#fb-close").textContent = "知道了";
  $("#fb-title").textContent = "请发送付款截图";
  $("#fb-text").innerHTML =
    '请将微信付款截图发送给客服，确认后即可查看完整报告：<br><br>' +
    '<img src="assets/wechat-qr.png" alt="微信二维码" style="width:160px;height:160px;border-radius:10px;border:2px solid var(--border);margin:4px 0;">' +
    '<div style="font-size:0.75rem;color:var(--text-muted);margin-top:4px;">微信扫码添加，发送付款截图</div>';
  requestAnimationFrame(function() {
    overlay.classList.add("active");
  });
}

// ==========================================
// 页面初始化
// ==========================================
document.addEventListener("DOMContentLoaded", function() {
  var page = document.body.getAttribute("data-page");

  if (page === "index") {
    var titleEl = document.getElementById("hero-title");
    var candidateBtns = document.querySelectorAll(".title-candidate");
    if (titleEl && candidateBtns.length) {
      candidateBtns.forEach(function(btn) {
        btn.addEventListener("click", function() {
          candidateBtns.forEach(function(b) { b.classList.remove("active"); });
          btn.classList.add("active");
          titleEl.textContent = btn.getAttribute("data-title");
        });
      });
    }
  } else if (page === "profile") {
    var submitBtn = document.getElementById("pf-submit");
    if (submitBtn) {
      submitBtn.addEventListener("click", function() {
        var age = document.getElementById("pf-age").value;
        var gender = document.getElementById("pf-gender").value;
        var occupation = document.getElementById("pf-occupation").value;
        var edu = document.getElementById("pf-edu").value;
        var channel = document.getElementById("pf-channel").value;
        if (!age || !gender || !occupation || !edu || !channel) {
          alert("请完整填写所有选项后再继续。");
          return;
        }
        var profile = {
          age: age,
          gender: gender,
          occupation: occupation,
          education: edu,
          channel: channel,
          timestamp: Date.now()
        };
        try {
          localStorage.setItem("opc_user_profile", JSON.stringify(profile));
        } catch(e) {}
        window.location.href = "quiz.html";
      });
    }
  } else   if (page === "quiz") {
    // 动态更新进度条总数
    var totalEl = document.querySelector(".progress-total");
    if (totalEl) totalEl.textContent = QUESTIONS.length;
    renderQuestion(0);
  } else if (page === "report-free") {
    if (window.location.search.indexOf("debug") !== -1 || window.location.hash === "#debug" || localStorage.getItem("opc_debug") === "1") { localStorage.removeItem("opc_debug"); debugInit(); }
    renderReport(false);
  } else if (page === "report-paid") {
    if (window.location.search.indexOf("debug") !== -1 || window.location.hash === "#debug" || localStorage.getItem("opc_debug") === "1") { localStorage.removeItem("opc_debug"); debugInit(); }
    renderReport(true);
  } else if (page === "pay") {
    if (window.location.search.indexOf("debug") !== -1 || window.location.hash === "#debug" || localStorage.getItem("opc_debug") === "1") { localStorage.removeItem("opc_debug"); debugInit(); }
    initPayPage();
  }
});
