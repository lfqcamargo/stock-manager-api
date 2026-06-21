import { User } from '@/domain/user/enterprise/entities/user';

export class UserPresenter {
  static toHTTP(user: User) {
    return {
      companyId: user.companyId.toString(),
      id: user.id.toString(),
      name: user.name,
      email: user.email,
      photoUrl: user.photoUrl,
      role: user.role,
      active: user.isActive,
      createdAt: user.createdAt.toISOString(),
      updatedAt: user.updatedAt.toISOString(),
      lastLogin: user.lastLogin?.toISOString() ?? null,
    };
  }
}
