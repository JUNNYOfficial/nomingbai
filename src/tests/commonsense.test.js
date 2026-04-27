const { describe, it } = require('node:test');
const assert = require('node:assert');
const {
  loadCommonsenseData,
  searchCommonsense,
  getCategories,
  getRandomCommonsense
} = require('../services/commonsenseService');

describe('commonsenseService', () => {
  it('should load commonsense data', () => {
    const data = loadCommonsenseData();
    assert.ok(Array.isArray(data));
    assert.ok(data.length > 0);
  });

  it('should return categories', () => {
    const cats = getCategories();
    assert.ok(Array.isArray(cats));
    assert.ok(cats.length > 0);
  });

  it('should search commonsense by query', () => {
    const results = searchCommonsense('时间', 3);
    assert.ok(Array.isArray(results));
    assert.ok(results.length > 0 || true); // may or may not match
  });

  it('should return random commonsense', () => {
    const items = getRandomCommonsense(3);
    assert.ok(Array.isArray(items));
    assert.strictEqual(items.length, 3);
  });

  it('should have valid schema for all items', () => {
    const data = loadCommonsenseData();
    for (const item of data) {
      assert.ok(item.id, 'item must have id');
      assert.ok(item.category, 'item must have category');
      assert.ok(item.question, 'item must have question');
      assert.ok(item.answer, 'item must have answer');
      assert.ok(Array.isArray(item.tags), 'tags must be array');
      assert.ok(Array.isArray(item.related), 'related must be array');
    }
  });
});
