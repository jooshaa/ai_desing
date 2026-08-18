import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import type { CategoryDto } from '@imora/shared-types';
import { Category } from './category.entity';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { buildCategoryTree } from './build-category-tree';

function toDto(category: Category): CategoryDto {
  return {
    id: category.id,
    parentId: category.parentId,
    nameUz: category.nameUz,
    nameRu: category.nameRu,
    slug: category.slug,
    sort: category.sort,
    icon: category.icon,
  };
}

@Injectable()
export class CategoriesService {
  constructor(
    @InjectRepository(Category)
    private readonly categories: Repository<Category>,
  ) {}

  async getTree(): Promise<CategoryDto[]> {
    const all = await this.categories.find();
    return buildCategoryTree(all.map(toDto));
  }

  async findEntityOrFail(id: string): Promise<Category> {
    const category = await this.categories.findOne({ where: { id } });
    if (!category) {
      throw new NotFoundException(`Category ${id} not found`);
    }
    return category;
  }

  async create(dto: CreateCategoryDto): Promise<CategoryDto> {
    if (dto.parentId) {
      await this.findEntityOrFail(dto.parentId);
    }
    const existing = await this.categories.findOne({ where: { slug: dto.slug } });
    if (existing) {
      throw new ConflictException(`Category slug "${dto.slug}" already exists`);
    }

    const category = this.categories.create({
      parentId: dto.parentId ?? null,
      nameUz: dto.nameUz,
      nameRu: dto.nameRu,
      slug: dto.slug,
      sort: dto.sort ?? 0,
      icon: dto.icon ?? null,
    });
    const saved = await this.categories.save(category);
    return toDto(saved);
  }

  async update(id: string, dto: UpdateCategoryDto): Promise<CategoryDto> {
    const category = await this.findEntityOrFail(id);

    if (dto.parentId !== undefined) {
      if (dto.parentId === id) {
        throw new ConflictException('A category cannot be its own parent');
      }
      if (dto.parentId) {
        await this.findEntityOrFail(dto.parentId);
      }
      category.parentId = dto.parentId ?? null;
    }
    if (dto.slug !== undefined && dto.slug !== category.slug) {
      const existing = await this.categories.findOne({ where: { slug: dto.slug } });
      if (existing) {
        throw new ConflictException(`Category slug "${dto.slug}" already exists`);
      }
      category.slug = dto.slug;
    }
    if (dto.nameUz !== undefined) category.nameUz = dto.nameUz;
    if (dto.nameRu !== undefined) category.nameRu = dto.nameRu;
    if (dto.sort !== undefined) category.sort = dto.sort;
    if (dto.icon !== undefined) category.icon = dto.icon;

    const saved = await this.categories.save(category);
    return toDto(saved);
  }

  async findBySlugOrFail(slug: string): Promise<Category> {
    const category = await this.categories.findOne({ where: { slug } });
    if (!category) {
      throw new NotFoundException(`Category with slug "${slug}" not found`);
    }
    return category;
  }
}
