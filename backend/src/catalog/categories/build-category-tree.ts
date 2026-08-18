import type { CategoryDto } from '@imora/shared-types';

/**
 * Pure function: flat category rows -> nested tree, sorted by `sort` then name.
 * Extracted from CategoriesService so it can be unit tested without a DB.
 */
export function buildCategoryTree(flat: CategoryDto[]): CategoryDto[] {
  const byId = new Map<string, CategoryDto>();
  for (const category of flat) {
    byId.set(category.id, { ...category, children: [] });
  }

  const roots: CategoryDto[] = [];
  for (const category of byId.values()) {
    if (category.parentId && byId.has(category.parentId)) {
      byId.get(category.parentId)!.children!.push(category);
    } else {
      roots.push(category);
    }
  }

  const sortTree = (nodes: CategoryDto[]): CategoryDto[] => {
    nodes.sort((a, b) => a.sort - b.sort || a.nameUz.localeCompare(b.nameUz));
    for (const node of nodes) {
      if (node.children?.length) {
        sortTree(node.children);
      }
    }
    return nodes;
  };

  return sortTree(roots);
}
