import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import type { StoreDto, StoreStatus } from '@imora/shared-types';
import { Store } from './store.entity';
import { RegisterStoreDto } from './dto/register-store.dto';
import { UpdateStoreDto } from './dto/update-store.dto';

function toDto(store: Store): StoreDto {
  return {
    id: store.id,
    name: store.name,
    ownerUserId: store.ownerUserId,
    phone: store.phone,
    region: store.region,
    districts: store.districts,
    status: store.status,
    logoUrl: store.logoUrl,
  };
}

@Injectable()
export class StoresService {
  constructor(
    @InjectRepository(Store)
    private readonly stores: Repository<Store>,
  ) {}

  async registerForUser(ownerUserId: string, dto: RegisterStoreDto): Promise<StoreDto> {
    const existing = await this.stores.findOne({ where: { ownerUserId } });
    if (existing) {
      throw new ConflictException('This user already has a store');
    }

    const store = this.stores.create({
      name: dto.name,
      ownerUserId,
      phone: dto.phone,
      region: dto.region,
      districts: dto.districts ?? [],
      status: 'pending',
      logoUrl: dto.logoUrl ?? null,
    });
    const saved = await this.stores.save(store);
    return toDto(saved);
  }

  async getOwnEntityOrFail(ownerUserId: string): Promise<Store> {
    const store = await this.stores.findOne({ where: { ownerUserId } });
    if (!store) {
      throw new NotFoundException(
        'No store registered for this user yet — POST /store/register first',
      );
    }
    return store;
  }

  async getOwn(ownerUserId: string): Promise<StoreDto> {
    return toDto(await this.getOwnEntityOrFail(ownerUserId));
  }

  async updateOwn(ownerUserId: string, dto: UpdateStoreDto): Promise<StoreDto> {
    const store = await this.getOwnEntityOrFail(ownerUserId);
    if (dto.name !== undefined) store.name = dto.name;
    if (dto.phone !== undefined) store.phone = dto.phone;
    if (dto.region !== undefined) store.region = dto.region;
    if (dto.districts !== undefined) store.districts = dto.districts;
    if (dto.logoUrl !== undefined) store.logoUrl = dto.logoUrl;
    const saved = await this.stores.save(store);
    return toDto(saved);
  }

  async findByIdOrFail(id: string): Promise<Store> {
    const store = await this.stores.findOne({ where: { id } });
    if (!store) {
      throw new NotFoundException(`Store ${id} not found`);
    }
    return store;
  }

  async listAll(status?: StoreStatus): Promise<StoreDto[]> {
    const stores = await this.stores.find({
      where: status ? { status } : {},
      order: { name: 'ASC' },
    });
    return stores.map(toDto);
  }

  async setStatus(id: string, status: StoreStatus): Promise<StoreDto> {
    const store = await this.findByIdOrFail(id);
    store.status = status;
    const saved = await this.stores.save(store);
    return toDto(saved);
  }
}
