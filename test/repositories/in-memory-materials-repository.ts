import { PaginationParams } from '@/core/repositories/pagination-params';
import { TransactionContextParams } from '@/core/repositories/transaction-context';
import {
  FetchMaterialsFilterParams,
  MaterialsRepository,
} from '@/domain/stock/application/repositories/materials-repository';
import { Material } from '@/domain/stock/enterprise/entities/material';
import { MaterialDetails } from '@/domain/stock/enterprise/entities/value-objects/material-details';

export class InMemoryMaterialsRepository implements MaterialsRepository {
  public items: Material[] = [];

  async create(
    material: Material,
    _options?: TransactionContextParams,
  ): Promise<void> {
    this.items.push(material);
    return Promise.resolve();
  }

  async findById(id: string): Promise<Material | null> {
    const material = this.items.find((item) => item.id.toString() === id);
    return Promise.resolve(material ?? null);
  }

  async findByCode(companyId: string, code: string): Promise<Material | null> {
    const material = this.items.find(
      (item) =>
        item.companyId.toString() === companyId &&
        item.code.toLowerCase() === code.toLowerCase(),
    );
    return Promise.resolve(material ?? null);
  }

  async findByName(companyId: string, name: string): Promise<Material | null> {
    const material = this.items.find(
      (item) =>
        item.companyId.toString() === companyId &&
        item.name.toLowerCase() === name.toLowerCase(),
    );
    return Promise.resolve(material ?? null);
  }

  async fetchAll(
    {
      companyId,
      groupId,
      code,
      name,
      description,
      active,
      orderBy,
    }: FetchMaterialsFilterParams,
    { page, itemsPerPage }: PaginationParams,
    _options?: TransactionContextParams,
  ): Promise<{
    data: MaterialDetails[];
    meta: {
      totalItems: number;
      itemCount: number;
      itemsPerPage: number;
      totalPages: number;
      currentPage: number;
      totalActiveMaterials: number;
    };
  }> {
    let items = this.items.filter(
      (item) => item.companyId.toString() === companyId,
    );
    if (groupId)
      items = items.filter((item) => item.groupId.toString() === groupId);
    if (code)
      items = items.filter((item) =>
        item.code.toLowerCase().includes(code.toLowerCase()),
      );
    if (name)
      items = items.filter((item) =>
        item.name.toLowerCase().includes(name.toLowerCase()),
      );
    if (description)
      items = items.filter((item) =>
        (item.description || '')
          .toLowerCase()
          .includes(description.toLowerCase()),
      );
    if (active) items = items.filter((item) => item.active === active);
    if (orderBy) {
      items = items.sort((a, b) => {
        return a[orderBy.field].localeCompare(b[orderBy.field]);
      });
    }

    const totalItems = items.length;
    const totalActiveMaterials = items.filter((item) => item.active).length;
    const paginated = items.slice(
      (page - 1) * itemsPerPage,
      page * itemsPerPage,
    );

    return Promise.resolve({
      data: paginated.map((m) => this.toDetails(m)),
      meta: {
        totalItems,
        itemCount: paginated.length,
        itemsPerPage,
        totalPages: Math.ceil(totalItems / itemsPerPage),
        currentPage: page,
        totalActiveMaterials,
      },
    });
  }

  async fetchByGroupId(
    companyId: string,
    groupId: string,
  ): Promise<Material[] | null> {
    const materials = this.items.filter(
      (item) =>
        item.companyId.toString() === companyId &&
        item.groupId.toString() === groupId,
    );

    if (materials) {
      return Promise.resolve(materials);
    }

    return Promise.resolve(null);
  }

  async update(
    material: Material,
    _options?: TransactionContextParams,
  ): Promise<void> {
    const index = this.items.findIndex((item) => item.id === material.id);
    if (index >= 0) {
      this.items[index] = material;
    }
    return Promise.resolve();
  }

  async delete(id: string, _options?: TransactionContextParams): Promise<void> {
    const index = this.items.findIndex((item) => item.id.toString() === id);
    if (index >= 0) {
      this.items.splice(index, 1);
    }
    return Promise.resolve();
  }

  async deleteMany(
    {
      companyId,
      groupId,
      code,
      name,
      description,
      active,
    }: FetchMaterialsFilterParams,
    _options?: TransactionContextParams,
  ): Promise<void> {
    this.items = this.items.filter((item) => {
      if (companyId && item.companyId.toString() !== companyId) return true;
      if (groupId && item.groupId.toString() !== groupId) return true;
      if (code && !item.code.toLowerCase().includes(code.toLowerCase()))
        return true;
      if (name && !item.name.toLowerCase().includes(name.toLowerCase()))
        return true;
      if (
        description &&
        !(item.description || '')
          .toLowerCase()
          .includes(description.toLowerCase())
      )
        return true;
      if (active !== undefined && item.active !== active) return true;

      return false;
    });

    return Promise.resolve();
  }

  toDetails(material: any): MaterialDetails {
    if (material instanceof MaterialDetails) return material;
    return MaterialDetails.create({
      companyId: material.companyId,
      groupId: material.groupId,
      group: material.group,
      id: material.id,
      code: material.code,
      name: material.name,
      description: material.description,
      unit: material.unit,
      active: material.active,
    });
  }
}
