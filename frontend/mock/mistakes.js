const DAY = 24 * 60 * 60 * 1000;

const CORRECT = '做对了';
const WRONG = '做错了';
const LUCKY = '蒙对了';

const SUBJECT = {
  CHINESE: 'chinese',
  MATH: 'math',
  ENGLISH: 'english',
  PHYSICS: 'physics',
  CHEMISTRY: 'chemistry',
  BIOLOGY: 'biology',
  POLITICS: 'politics',
  HISTORY: 'history',
};

const SEED_MISTAKES = [
  {
    id: 'm01',
    createdAtDaysAgo: 45,
    subjectId: SUBJECT.MATH,
    knowledgeId: 'math-02',
    questionType: '单选',
    stem:
      '已知函数 f(x) = x² − 2ax + 3 在区间 (−∞, 2] 上单调递减，则实数 a 的取值范围是（　）\n' +
      'A. a ≤ 2　B. a ≥ 2　C. a < 2　D. a > 2',
    answer: 'B',
    analysis: '二次函数开口向上，减区间为 (−∞, a]。要使 (−∞, 2] 落在减区间内，需 a ≥ 2。',
    tags: ['函数单调性', '期中考'],
  },
  {
    id: 'm02',
    createdAtDaysAgo: 45,
    subjectId: SUBJECT.MATH,
    knowledgeId: 'math-18',
    questionType: '填空',
    stem: '二次函数 y = −x² + 4x − 1 的最大值为 ______。',
    answer: ['3'],
    analysis: '配方得 y = −(x − 2)² + 3，开口向下，x = 2 时取最大值 3。',
    tags: ['配方法'],
  },
  {
    id: 'm03',
    createdAtDaysAgo: 45,
    subjectId: SUBJECT.PHYSICS,
    knowledgeId: 'physics-04',
    questionType: '单选',
    stem:
      '质量为 2 kg 的物体在光滑水平面上受到 6 N 的水平恒力作用，由静止开始运动，' +
      '则第 3 s 末物体的动量大小为（　）\nA. 6 kg·m/s　B. 12 kg·m/s　C. 18 kg·m/s　D. 27 kg·m/s',
    answer: 'C',
    analysis: '由动量定理 Ft = Δp，得 p = 6 × 3 = 18 kg·m/s。',
    tags: ['动量定理'],
  },
  {
    id: 'm04',
    createdAtDaysAgo: 45,
    subjectId: SUBJECT.POLITICS,
    knowledgeId: 'politics-17',
    questionType: '多选',
    stem:
      '下列体现唯物辩证法矛盾观的有（　）\n' +
      'A. 塞翁失马，焉知非福　B. 因地制宜，对症下药　\n' +
      'C. 金无足赤，人无完人　D. 千里之行，始于足下',
    answer: 'ABC',
    analysis:
      'A 体现矛盾双方相互转化，B 体现矛盾的特殊性，C 体现矛盾的普遍性，均属矛盾观。' +
      'D 体现量变与质变的关系，属发展观。',
    tags: ['辩证法', '易混概念'],
  },
  {
    id: 'm05',
    createdAtDaysAgo: 30,
    subjectId: SUBJECT.MATH,
    knowledgeId: 'math-07',
    questionType: '多选',
    stem:
      '已知向量 a = (1, 2)，b = (−2, y)，若 a ⊥ b，则下列说法正确的有（　）\n' +
      'A. y = 1　B. |b| = √5　C. a·b = 0　D. a 与 b 的夹角为 90°',
    answer: 'ABCD',
    analysis: 'a ⊥ b ⇒ a·b = −2 + 2y = 0 ⇒ y = 1；|b| = √(4 + 1) = √5；垂直即夹角 90°，四项全对。',
    tags: ['平面向量'],
  },
  {
    id: 'm06',
    createdAtDaysAgo: 30,
    subjectId: SUBJECT.CHINESE,
    knowledgeId: 'chinese-07',
    questionType: '填空',
    stem: '《登高》中"____________，____________"两句，从时间与空间两方面写出诗人漂泊异乡、年老多病的处境。',
    answer: ['万里悲秋常作客', '百年多病独登台'],
    analysis: '杜甫《登高》颈联。上句写空间之远与羁旅之久，下句写时间之暮与病躯之孤。',
    tags: ['默写', '杜甫'],
  },
  {
    id: 'm07',
    createdAtDaysAgo: 30,
    subjectId: SUBJECT.BIOLOGY,
    knowledgeId: 'biology-02',
    questionType: '多选',
    stem:
      '关于真核细胞结构与功能的叙述，正确的有（　）\n' +
      'A. 线粒体是有氧呼吸的主要场所　B. 核糖体是蛋白质合成的场所　\n' +
      'C. 高尔基体参与分泌蛋白的加工与运输　D. 中心体存在于所有真核细胞中',
    answer: 'ABC',
    analysis: '中心体只存在于动物细胞和某些低等植物细胞中，高等植物细胞没有，D 错。',
    tags: ['细胞器'],
  },
  {
    id: 'm08',
    createdAtDaysAgo: 30,
    subjectId: SUBJECT.HISTORY,
    knowledgeId: 'history-17',
    questionType: '多选',
    stem:
      '第二次工业革命与第一次工业革命相比，其特点包括（　）\n' +
      'A. 科学与技术紧密结合　B. 首先发生在英国一国　\n' +
      'C. 多个发达国家几乎同时进行　D. 以电力的广泛应用为显著特征',
    answer: 'ACD',
    analysis: '第二次工业革命在几个主要资本主义国家同时展开，B 是第一次工业革命的特点。',
    tags: ['工业革命', '比较类'],
  },
  {
    id: 'm09',
    createdAtDaysAgo: 30,
    subjectId: SUBJECT.MATH,
    knowledgeId: 'math-16',
    questionType: '填空',
    stem: '曲线 y = x³ − 3x 在点 (1, −2) 处的切线方程为 ______。',
    answer: ['y = −2'],
    analysis: "y' = 3x² − 3，x = 1 时斜率 k = 0，故切线为水平直线 y = −2。",
    tags: ['导数', '切线'],
  },
  {
    id: 'm10',
    createdAtDaysAgo: 20,
    subjectId: SUBJECT.PHYSICS,
    knowledgeId: 'physics-02',
    questionType: '填空',
    stem:
      '物体做匀加速直线运动，初速度为 2 m/s，加速度为 2 m/s²，' +
      '则第 3 s 内的位移为 ______ m，第 3 s 末的速度为 ______ m/s。',
    answer: ['7', '8'],
    analysis:
      '前 3 s 位移 s₃ = 2×3 + ½×2×9 = 15 m，前 2 s 位移 s₂ = 4 + 4 = 8 m，' +
      '第 3 s 内位移 = 15 − 8 = 7 m；v₃ = 2 + 2×3 = 8 m/s。',
    tags: ['运动学', '粗心'],
  },
  {
    id: 'm11',
    createdAtDaysAgo: 20,
    subjectId: SUBJECT.ENGLISH,
    knowledgeId: 'english-03',
    questionType: '单选',
    stem:
      'The house ______ we lived ten years ago has been sold to a new owner.\n' +
      'A. which　B. that　C. where　D. what',
    answer: 'C',
    analysis: 'live 为不及物动词，先行词 the house 在从句中作地点状语，用关系副词 where；若用 which/that 需加 in。',
    tags: ['定语从句'],
  },
  {
    id: 'm12',
    createdAtDaysAgo: 20,
    subjectId: SUBJECT.CHEMISTRY,
    knowledgeId: 'chemistry-03',
    questionType: '单选',
    stem:
      '在反应 3Cl₂ + 6NaOH → 5NaCl + NaClO₃ + 3H₂O 中，被氧化与被还原的氯原子个数之比为（　）\n' +
      'A. 1∶1　B. 1∶5　C. 5∶1　D. 3∶2',
    answer: 'B',
    analysis:
      '生成 NaClO₃ 的氯原子化合价由 0 升至 +5，被氧化，共 1 个；' +
      '生成 NaCl 的氯原子化合价由 0 降至 −1，被还原，共 5 个。比为 1∶5。',
    tags: ['氧化还原', '歧化反应'],
  },
  {
    id: 'm13',
    createdAtDaysAgo: 10,
    subjectId: SUBJECT.MATH,
    knowledgeId: 'math-12',
    questionType: '解答',
    stem:
      '已知椭圆 C：x²/a² + y²/b² = 1（a > b > 0）的离心率为 √3/2，且过点 (2, 0)。\n' +
      '(1) 求椭圆 C 的方程；\n(2) 过点 P(1, 0) 的直线 l 与 C 交于 A、B 两点，求 △OAB 面积的最大值。',
    answer:
      '(1) x²/4 + y² = 1；\n' +
      '(2) 设 l：x = my + 1，代入得 (m² + 4)y² + 2my − 3 = 0，' +
      '|y₁ − y₂| = 4√(m² + 3)/(m² + 4)，S = ½·|OP|·|y₁ − y₂| = 2√(m² + 3)/(m² + 4)，' +
      '令 t = √(m² + 3) ≥ √3，S = 2t/(t² + 1) 在 t ≥ √3 上递减，故 t = √3 时 S 取最大值 √3/2。',
    analysis: '关键是把直线设为 x = my + 1 以避免讨论斜率不存在，再用换元求最值。',
    tags: ['圆锥曲线', '压轴题'],
  },
  {
    id: 'm14',
    createdAtDaysAgo: 10,
    subjectId: SUBJECT.PHYSICS,
    knowledgeId: 'physics-12',
    questionType: '解答',
    stem:
      '如图，两根足够长的平行光滑金属导轨间距 L = 0.5 m，与水平面成 30° 角，' +
      '导轨电阻不计，匀强磁场 B = 0.8 T 垂直导轨平面向上。质量 m = 0.1 kg、电阻 r = 0.4 Ω 的' +
      '金属棒 ab 垂直导轨放置，外接电阻 R = 0.6 Ω。棒由静止释放后最终匀速下滑，求匀速下滑的速度大小。（g 取 10 m/s²）',
    answer:
      '匀速时安培力与重力沿斜面分力平衡：BIL = mg sin30°。\n' +
      'I = BLv/(R + r)，代入得 B²L²v/(R + r) = mg sin30°，\n' +
      'v = mg sin30°(R + r)/(B²L²) = 0.1×10×0.5×1 / (0.64×0.25) = 3.125 m/s。',
    analysis: '先写受力平衡，再把感应电动势 E = BLv 与闭合电路欧姆定律代入，是电磁感应综合题的固定套路。',
    tags: ['电磁感应', '综合题'],
  },
  {
    id: 'm15',
    createdAtDaysAgo: 10,
    subjectId: SUBJECT.CHINESE,
    knowledgeId: 'chinese-12',
    questionType: '解答',
    stem: '阅读《念奴娇·赤壁怀古》，赏析"乱石穿空，惊涛拍岸，卷起千堆雪"三句的表达效果。',
    answer:
      '三句由视觉与听觉入手，"穿"字写出山石陡峭直插云天之势，"拍"字状波涛撞击江岸之力，' +
      '"卷"字绘浪花翻涌之态；再以"千堆雪"作比喻，把白色浪花具象化。' +
      '三句用动词密集、意象雄奇的笔法勾勒出赤壁古战场的壮阔险峻，为下片怀想周瑜的英雄业绩作了环境铺垫，' +
      '也寄寓了词人对往昔豪杰的追慕之情。',
    analysis: '答题套路：先点手法（炼字 + 比喻），再描景象，最后说作用（结构铺垫 + 情感寄托）。',
    tags: ['诗歌鉴赏', '炼字'],
  },
  {
    id: 'm16',
    createdAtDaysAgo: 7,
    subjectId: SUBJECT.CHEMISTRY,
    knowledgeId: 'chemistry-08',
    questionType: '解答',
    stem:
      '在密闭容器中进行反应 N₂(g) + 3H₂(g) ⇌ 2NH₃(g)，ΔH < 0。\n' +
      '(1) 升高温度，平衡如何移动，NH₃ 的体积分数如何变化？\n' +
      '(2) 增大压强，正、逆反应速率如何变化？\n(3) 使用催化剂是否改变平衡转化率？说明理由。',
    answer:
      '(1) 正反应放热，升温平衡逆向移动，NH₃ 的体积分数减小。\n' +
      '(2) 增大压强，正、逆反应速率都增大，但正反应速率增大幅度更大，平衡正向移动。\n' +
      '(3) 不改变。催化剂同等程度加快正逆反应速率，只缩短达到平衡的时间，不改变平衡状态，故转化率不变。',
    analysis: '勒夏特列原理只判断移动方向，速率变化必须分开说正、逆两侧。',
    tags: ['化学平衡'],
  },
  {
    id: 'm17',
    createdAtDaysAgo: 7,
    subjectId: SUBJECT.MATH,
    knowledgeId: 'math-05',
    questionType: '解答',
    stem:
      '已知数列 {aₙ} 满足 a₁ = 1，aₙ₊₁ = 2aₙ + 1。\n' +
      '(1) 证明 {aₙ + 1} 是等比数列，并求 {aₙ} 的通项公式；\n(2) 求数列 {n·aₙ} 的前 n 项和 Sₙ。',
    answer:
      '(1) aₙ₊₁ + 1 = 2aₙ + 2 = 2(aₙ + 1)，且 a₁ + 1 = 2 ≠ 0，' +
      '故 {aₙ + 1} 是首项 2、公比 2 的等比数列，aₙ + 1 = 2ⁿ，即 aₙ = 2ⁿ − 1。\n' +
      '(2) n·aₙ = n·2ⁿ − n，Sₙ = Σk·2ᵏ − n(n+1)/2。用错位相减法得 Σk·2ᵏ = (n−1)·2ⁿ⁺¹ + 2，' +
      '故 Sₙ = (n − 1)·2ⁿ⁺¹ + 2 − n(n + 1)/2。',
    analysis: '第二问务必拆成"等比乘等差"与"等差"两部分，错位相减后别漏掉末项符号。',
    tags: ['数列', '错位相减'],
  },
  {
    id: 'm18',
    createdAtDaysAgo: 7,
    subjectId: SUBJECT.ENGLISH,
    knowledgeId: 'english-01',
    questionType: '判断',
    stem: '判断正误：By the time he arrived, the film has already begun. 该句时态使用正确。',
    answer: '错',
    analysis:
      'arrived 为过去时，"过去的过去"应用过去完成时：the film had already begun。has 是现在完成时，与过去时间状语矛盾。',
    tags: ['时态'],
  },
  {
    id: 'm19',
    createdAtDaysAgo: 7,
    subjectId: SUBJECT.BIOLOGY,
    knowledgeId: 'biology-06',
    questionType: '判断',
    stem: '判断正误：光合作用的暗反应阶段不需要光，因此可以在无光条件下长期独立进行。',
    answer: '错',
    analysis:
      '暗反应虽不直接需光，但依赖光反应提供的 ATP 与 NADPH。无光时二者迅速耗尽，暗反应随即停止，不能长期独立进行。',
    tags: ['光合作用', '易错'],
  },
  {
    id: 'm20',
    createdAtDaysAgo: 2,
    subjectId: SUBJECT.POLITICS,
    knowledgeId: 'politics-01',
    questionType: '判断',
    stem: '判断正误：商品的价值是价格的基础，价格是价值的货币表现。',
    answer: '对',
    analysis: '价值决定价格，价格围绕价值上下波动，是价值规律的基本内容与表现形式。',
    tags: ['政治经济学'],
  },
  {
    id: 'm21',
    createdAtDaysAgo: 2,
    subjectId: SUBJECT.HISTORY,
    knowledgeId: 'history-09',
    questionType: '判断',
    stem: '判断正误：辛亥革命推翻了封建制度，完成了反帝反封建的革命任务。',
    answer: '错',
    analysis:
      '辛亥革命推翻的是封建君主专制制度，不是整个封建制度；革命果实被袁世凯窃取，' +
      '半殖民地半封建的社会性质没有改变，反帝反封建的任务并未完成。',
    tags: ['辛亥革命', '概念辨析'],
  },
  {
    id: 'm22',
    createdAtDaysAgo: 2,
    subjectId: SUBJECT.CHINESE,
    knowledgeId: 'chinese-03',
    questionType: '单选',
    stem:
      '下列各句中，没有语病的一项是（　）\n' +
      'A. 通过这次社会实践，使我们开阔了眼界。\n' +
      'B. 能否坚持锻炼身体，是保证学习效率的重要前提。\n' +
      'C. 这部小说塑造了一个平凡而伟大的乡村教师形象。\n' +
      'D. 我们要及时解决并发现学习中存在的问题。',
    answer: 'C',
    analysis:
      'A 缺主语，"通过……使……"掩盖了主语；B 两面对一面，"能否"与"是保证"不搭配；' +
      'D 语序不当，应先"发现"再"解决"。',
    tags: ['病句', '选择题'],
  },
  {
    id: 'm23',
    createdAtDaysAgo: 30,
    subjectId: SUBJECT.CHEMISTRY,
    knowledgeId: 'chemistry-01',
    questionType: '填空',
    stem:
      '标准状况下，11.2 L CO₂ 的物质的量为 ______ mol，质量为 ______ g，' +
      '其中含有的氧原子数为 ______（用 NA 表示）。',
    answer: ['0.5', '22', 'NA'],
    analysis: 'n = V/Vm = 11.2/22.4 = 0.5 mol；m = 0.5 × 44 = 22 g；每个 CO₂ 含 2 个 O，故氧原子为 0.5 × 2 × NA = NA。',
    tags: ['物质的量', '计算'],
  },
  {
    id: 'm24',
    createdAtDaysAgo: 4,
    subjectId: SUBJECT.ENGLISH,
    knowledgeId: 'english-02',
    questionType: '填空',
    stem:
      '用所给动词的正确形式填空：\n' +
      'The problem ______ (discuss) at the meeting yesterday was of great importance.\n' +
      'He devoted all his life to ______ (help) the poor.',
    answer: ['discussed', 'helping'],
    analysis:
      '第一空 problem 与 discuss 是被动关系且动作已完成，用过去分词作后置定语；' +
      '第二空 to 是介词，后接动名词 helping。',
    tags: ['非谓语动词'],
  },
  {
    id: 'm25',
    createdAtDaysAgo: 1,
    subjectId: SUBJECT.PHYSICS,
    knowledgeId: 'physics-06',
    questionType: '单选',
    stem:
      '某人造卫星绕地球做匀速圆周运动，若其轨道半径增大到原来的 2 倍，仍做匀速圆周运动，则（　）\n' +
      'A. 卫星的线速度增大到原来的 2 倍　B. 卫星的角速度增大到原来的 2 倍\n' +
      'C. 卫星的周期增大到原来的 2√2 倍　D. 卫星的向心加速度增大到原来的 2 倍',
    answer: 'C',
    analysis:
      '由 GMm/r² = m·4π²r/T² 得 T ∝ r^(3/2)，r 变为 2 倍则 T 变为 2√2 倍。' +
      'v ∝ r^(−1/2)、ω ∝ r^(−3/2)、a ∝ r^(−2)，均减小。',
    tags: ['天体运动', '比例法'],
  },
];

const SEED_SESSIONS = [
  { id: 's01', daysAgo: 38, durationMin: 12 },
  { id: 's02', daysAgo: 24, durationMin: 15 },
  { id: 's03', daysAgo: 15, durationMin: 9 },
  { id: 's04', daysAgo: 6, durationMin: 18 },
  { id: 's05', daysAgo: 3, durationMin: 11 },
  { id: 's06', daysAgo: 1, durationMin: 8 },
];

const SEED_LOGS = [
  { sessionId: 's01', mistakeId: 'm01', userAnswer: 'B', verdict: CORRECT },
  { sessionId: 's01', mistakeId: 'm02', userAnswer: ['2'], verdict: WRONG },
  { sessionId: 's01', mistakeId: 'm03', userAnswer: 'C', verdict: CORRECT },
  { sessionId: 's01', mistakeId: 'm04', userAnswer: 'AC', verdict: WRONG },

  { sessionId: 's02', mistakeId: 'm05', userAnswer: 'ABCD', verdict: CORRECT },
  { sessionId: 's02', mistakeId: 'm06', userAnswer: ['艰难苦恨繁霜鬓', '潦倒新停浊酒杯'], verdict: WRONG },
  { sessionId: 's02', mistakeId: 'm07', userAnswer: 'ABC', verdict: CORRECT },
  { sessionId: 's02', mistakeId: 'm08', userAnswer: 'AD', verdict: WRONG },
  { sessionId: 's02', mistakeId: 'm09', userAnswer: ['y = 2x − 4'], verdict: WRONG },

  { sessionId: 's03', mistakeId: 'm10', userAnswer: ['9', '8'], verdict: WRONG },
  { sessionId: 's03', mistakeId: 'm11', userAnswer: 'C', verdict: CORRECT },
  { sessionId: 's03', mistakeId: 'm12', userAnswer: 'C', verdict: WRONG },
  { sessionId: 's03', mistakeId: 'm01', userAnswer: 'B', verdict: CORRECT },
  { sessionId: 's03', mistakeId: 'm02', userAnswer: ['3'], verdict: CORRECT },

  { sessionId: 's04', mistakeId: 'm13', userAnswer: '', verdict: LUCKY },
  { sessionId: 's04', mistakeId: 'm14', userAnswer: '', verdict: WRONG },
  { sessionId: 's04', mistakeId: 'm15', userAnswer: '', verdict: CORRECT },
  { sessionId: 's04', mistakeId: 'm03', userAnswer: 'C', verdict: CORRECT },
  { sessionId: 's04', mistakeId: 'm04', userAnswer: 'ABC', verdict: CORRECT },
  { sessionId: 's04', mistakeId: 'm05', userAnswer: 'ACD', verdict: WRONG },

  { sessionId: 's05', mistakeId: 'm16', userAnswer: '', verdict: CORRECT },
  { sessionId: 's05', mistakeId: 'm17', userAnswer: '', verdict: WRONG },
  { sessionId: 's05', mistakeId: 'm18', userAnswer: '对', verdict: WRONG },
  { sessionId: 's05', mistakeId: 'm19', userAnswer: '对', verdict: WRONG },
  { sessionId: 's05', mistakeId: 'm06', userAnswer: ['万里悲秋常作客', '百年多病独登台'], verdict: CORRECT },
  { sessionId: 's05', mistakeId: 'm07', userAnswer: 'ABCD', verdict: WRONG },

  { sessionId: 's06', mistakeId: 'm20', userAnswer: '对', verdict: CORRECT },
  { sessionId: 's06', mistakeId: 'm21', userAnswer: '错', verdict: CORRECT },
  { sessionId: 's06', mistakeId: 'm22', userAnswer: 'C', verdict: CORRECT },
  { sessionId: 's06', mistakeId: 'm08', userAnswer: 'AD', verdict: WRONG },
  { sessionId: 's06', mistakeId: 'm09', userAnswer: ['y = −2'], verdict: CORRECT },
];

function daysAgo(days) {
  return Date.now() - days * DAY;
}

function createSeedRecords() {
  const mistakes = SEED_MISTAKES.map((item) => ({
    id: item.id,
    stem: item.stem,
    questionType: item.questionType,
    subjectId: item.subjectId,
    knowledgeId: item.knowledgeId,
    tags: item.tags,
    answer: item.answer,
    analysis: item.analysis,
    imagePath: '',
    createdAt: daysAgo(item.createdAtDaysAgo),
  }));

  const reviewLogs = SEED_LOGS.map((item) => ({
    id: item.sessionId + '-' + item.mistakeId,
    sessionId: item.sessionId,
    mistakeId: item.mistakeId,
    userAnswer: item.userAnswer,
    verdict: item.verdict,
    createdAt: daysAgo(SEED_SESSIONS.find((s) => s.id === item.sessionId).daysAgo),
  })).sort((a, b) => a.createdAt - b.createdAt);

  const sessions = SEED_SESSIONS.map((item) => {
    const startedAt = daysAgo(item.daysAgo);
    return {
      id: item.id,
      startedAt,
      finishedAt: startedAt + item.durationMin * 60 * 1000,
      durationMs: item.durationMin * 60 * 1000,
      mistakeIds: reviewLogs.filter((log) => log.sessionId === item.id).map((log) => log.mistakeId),
    };
  });

  return { mistakes, reviewLogs, sessions };
}

module.exports = { createSeedRecords, CORRECT, WRONG, LUCKY };
