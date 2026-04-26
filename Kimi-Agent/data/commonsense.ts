/**
 * 常识Agent (nomingbai.online) - 数据类型定义
 * Auto-generated on 2026-04-26
 */

/** 常识分类 */
export type Category = 
  | "量化常识" 
  | "流程常识" 
  | "社交语义" 
  | "空间常识" 
  | "时间常识";

/** 难度等级 */
export type Difficulty = "easy" | "medium" | "hard";

/** 单条常识数据结构 */
export interface CommonsenseEntry {
  /** 唯一标识符 */
  id: string;
  /** 常识分类 */
  category: Category;
  /** 问题标题 */
  question: string;
  /** 准确答案 */
  answer: string;
  /** 认知陷阱拆解 - 核心差异化字段，解释为什么容易搞混 */
  trap: string;
  /** 常见使用场景 */
  context: string;
  /** 相关条目ID列表 */
  related: string[];
  /** 信息来源 */
  source: string;
  /** 难度等级 */
  difficulty: Difficulty;
  /** 搜索标签 */
  tags: string[];
}

/** 数据库元数据 */
export interface DatabaseMetadata {
  version: string;
  total_entries: number;
  categories: Category[];
  difficulty_distribution: Record<Difficulty, number>;
  last_updated: string;
  source: string;
}

/** 完整数据库结构 */
export interface CommonsenseDatabase {
  metadata: DatabaseMetadata;
  entries: CommonsenseEntry[];
}

/** 分类统计 */
export interface CategoryStats {
  category: Category;
  count: number;
  percentage: number;
}

/** 数据库工具函数 */
export const CommonsenseUtils = {
  /** 按分类筛选 */
  filterByCategory(entries: CommonsenseEntry[], category: Category): CommonsenseEntry[] {
    return entries.filter(e => e.category === category);
  },

  /** 按难度筛选 */
  filterByDifficulty(entries: CommonsenseEntry[], difficulty: Difficulty): CommonsenseEntry[] {
    return entries.filter(e => e.difficulty === difficulty);
  },

  /** 按标签搜索 */
  filterByTag(entries: CommonsenseEntry[], tag: string): CommonsenseEntry[] {
    return entries.filter(e => e.tags.some(t => t.toLowerCase().includes(tag.toLowerCase())));
  },

  /** 关键词搜索（模糊匹配问题和标签） */
  search(entries: CommonsenseEntry[], keyword: string): CommonsenseEntry[] {
    const lower = keyword.toLowerCase();
    return entries.filter(e => 
      e.question.toLowerCase().includes(lower) ||
      e.tags.some(t => t.toLowerCase().includes(lower)) ||
      e.answer.toLowerCase().includes(lower)
    );
  },

  /** 获取分类统计 */
  getCategoryStats(entries: CommonsenseEntry[]): CategoryStats[] {
    const total = entries.length;
    const counts: Record<string, number> = {};
    entries.forEach(e => {
      counts[e.category] = (counts[e.category] || 0) + 1;
    });
    return Object.entries(counts).map(([category, count]) => ({
      category: category as Category,
      count,
      percentage: Math.round((count / total) * 100)
    }));
  },

  /** 获取相关条目 */
  getRelated(entries: CommonsenseEntry[], entry: CommonsenseEntry): CommonsenseEntry[] {
    return entries.filter(e => entry.related.includes(e.id));
  }
};
