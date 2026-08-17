import type { CategoryDto } from '@imora/shared-types';
import { buildCategoryTree } from './build-category-tree';

function category(overrides: Partial<CategoryDto>): CategoryDto {
  return {
    id: overrides.id ?? 'id',
    parentId: overrides.parentId ?? null,
    nameUz: overrides.nameUz ?? 'Nom',
    nameRu: overrides.nameRu ?? 'Имя',
    slug: overrides.slug ?? 'slug',
    sort: overrides.sort ?? 0,
    icon: overrides.icon ?? null,
  };
}

describe('buildCategoryTree', () => {
  it('nests children under their parent', () => {
    const flat = [
      category({ id: 'root', nameUz: 'Ichki eshiklar', sort: 0 }),
      category({ id: 'child', parentId: 'root', nameUz: "Yog'och eshiklar", sort: 0 }),
    ];

    const tree = buildCategoryTree(flat);

    expect(tree).toHaveLength(1);
    expect(tree[0].id).toBe('root');
    expect(tree[0].children).toHaveLength(1);
    expect(tree[0].children?.[0].id).toBe('child');
  });

  it('sorts siblings by sort, then by name', () => {
    const flat = [
      category({ id: 'b', nameUz: 'Beton', sort: 1 }),
      category({ id: 'a', nameUz: 'Alebastr', sort: 1 }),
      category({ id: 'c', nameUz: 'Cement', sort: 0 }),
    ];

    const tree = buildCategoryTree(flat);

    expect(tree.map((c) => c.id)).toEqual(['c', 'a', 'b']);
  });

  it('treats a category with a missing/orphan parentId as a root', () => {
    const flat = [category({ id: 'orphan', parentId: 'missing-parent' })];

    const tree = buildCategoryTree(flat);

    expect(tree).toHaveLength(1);
    expect(tree[0].id).toBe('orphan');
  });

  it('handles an empty catalog', () => {
    expect(buildCategoryTree([])).toEqual([]);
  });
});
