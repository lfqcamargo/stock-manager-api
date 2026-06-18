import {
  FetchGroupsFilterParams,
  GroupsRepository,
} from '@/domain/stock/application/repositories/groups-repository';
import { Group } from '@/domain/stock/enterprise/entities/group';

export class InMemoryGroupsRepository implements GroupsRepository {
  public items: Group[] = [];

  async create(group: Group): Promise<void> {
    this.items.push(group);
    return Promise.resolve();
  }

  async findById(companyId: string, id: string): Promise<Group | null> {
    const group = this.items.find(
      (item) =>
        item.id.toString() === id && item.companyId.toString() === companyId,
    );

    return Promise.resolve(group ?? null);
  }

  async findByCode(companyId: string, code: string): Promise<Group | null> {
    const group = this.items.find(
      (item) =>
        item.companyId.toString() === companyId &&
        item.code.toUpperCase() === code.toUpperCase(),
    );
    return Promise.resolve(group ?? null);
  }

  async findByName(companyId: string, name: string): Promise<Group | null> {
    const group = this.items.find(
      (item) =>
        item.companyId.toString() === companyId &&
        item.name.toLowerCase() === name.toLowerCase(),
    );
    return Promise.resolve(group ?? null);
  }

  async fetchAll(
    {
      companyId,
      code,
      name,
      description,
      active,
      orderBy,
    }: FetchGroupsFilterParams,
    { page, itemsPerPage },
  ): Promise<{
    data: Group[];
    meta: {
      totalItems: number;
      itemCount: number;
      itemsPerPage: number;
      totalPages: number;
      currentPage: number;
      totalActiveGroups: number;
      totalEmptyGroups: number;
      lastCreated: Date | null;
    };
  }> {
    let groups = this.items.filter(
      (item) => item.companyId.toString() === companyId,
    );
    if (code)
      groups = groups.filter((item) =>
        item.code.toLowerCase().includes(code.toLowerCase()),
      );
    if (name)
      groups = groups.filter((item) =>
        item.name.toLowerCase().includes(name.toLowerCase()),
      );
    if (description)
      groups = groups.filter((item) =>
        (item.description || '')
          .toLowerCase()
          .includes(description.toLowerCase()),
      );
    if (active) groups = groups.filter((item) => item.active === active);
    if (orderBy) {
      groups = groups.sort((a, b) => {
        if (orderBy.field === 'name') {
          return a.name.localeCompare(b.name);
        }
        if (orderBy.field === 'description') {
          return (a.description || '').localeCompare(b.description || '');
        }
        if (orderBy.field === 'code') {
          return a.code.localeCompare(b.code);
        }
        if (orderBy.field === 'active') {
          return Number(b.active) - Number(a.active);
        }
        return 0;
      });
    }

    const totalItems = groups.length;
    const totalPages = Math.ceil(totalItems / itemsPerPage);
    const paginatedGroups = groups.slice(
      (page - 1) * itemsPerPage,
      page * itemsPerPage,
    );
    const totalActiveGroups = groups.filter((group) => group.active).length;
    const meta = {
      totalItems,
      itemCount: paginatedGroups.length,
      itemsPerPage,
      totalPages,
      currentPage: page,
      totalActiveGroups,
      totalEmptyGroups: 0,
      lastCreated: new Date(),
    };
    return Promise.resolve({
      data: paginatedGroups,
      meta,
    });
  }

  async update(group: Group) {
    const index = this.items.findIndex((item) => item.id === group.id);
    if (index >= 0) {
      this.items[index] = group;
    }
    return Promise.resolve();
  }

  async delete(group: Group) {
    const index = this.items.findIndex((item) => item.id === group.id);
    if (index >= 0) {
      this.items.splice(index, 1);
    }
    return Promise.resolve();
  }
}
