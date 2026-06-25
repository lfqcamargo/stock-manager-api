import { Group } from '@/domain/stock/enterprise/entities/group';

export class GroupPresenter {
  static toHTTP(group: Group) {
    return {
      id: group.id.toString(),
      code: group.code,
      name: group.name,
      description: group.description,
      active: group.active,
      photoUrl: group.photoUrl,
    };
  }
}
