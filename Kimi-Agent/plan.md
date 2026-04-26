# 常识Agent 数据收集与数据库整合计划

## 项目背景
- **产品**: 常识Agent (nomingbai.online)
- **目标**: 收集隐性常识，按JSON Schema格式整合成数据库
- **首批需求**: 至少20条高质量常识数据（覆盖5大类别）
- **Schema字段**: id, category, question, answer, trap, context, related, source, difficulty, tags

## 执行阶段

### Stage 1 — 并行数据收集（多Agent搜索）
按5个常识类别分派专门的搜索Agent，每个类别负责收集首批4-6条常识的完整数据。

| 类别 | Agent名称 | 任务描述 |
|------|----------|---------|
| 量化常识 | 量化常识收集员 | 收集糖度、照片尺寸、单位换算等 |
| 流程常识 | 流程常识收集员 | 收集医院、健身房、租房等流程 |
| 社交语义 | 社交语义收集员 | 收集潜台词、社交规则等 |
| 空间常识 | 空间常识收集员 | 收集地铁、楼层、空间距离等 |
| 时间常识 | 时间常识收集员 | 收集模糊时间词、时间感知等 |

每个Agent需要：
1. 搜索验证常识的准确性
2. 按照JSON Schema格式输出每条数据
3. 重点写出"trap"字段（认知陷阱拆解）

### Stage 2 — 数据整合与质量审查
1. 合并所有Agent的输出
2. 统一ID格式（category-001格式）
3. 检查related字段的关联完整性
4. 验证JSON格式正确性
5. 确保至少20条数据

### Stage 3 — 输出交付
1. 生成 `/data/commonsense.json`
2. 生成数据类型定义文件 `commonsense.ts`
3. 提供数据统计报告

## 数据质量要求
- answer字段必须准确、具体、可验证
- trap字段必须解释"为什么容易搞混"
- 每条常识必须有明确的context场景
- difficulty评级合理（easy/medium/hard）
- tags至少3个，便于搜索匹配
