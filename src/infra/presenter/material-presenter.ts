import { Material } from '@/domain/stock/enterprise/entities/material';
import { MaterialDetails } from '@/domain/stock/enterprise/entities/value-objects/material-details';

export class MaterialPresenter {
  static toHTTP(material: Material) {
    return {
      id: material.id.toString(),
      companyId: material.companyId.toString(),
      groupId: material.groupId.toString(),
      code: material.code,
      name: material.name,
      description: material.description,
      unit: material.unit.code,
      active: material.active,
    };
  }

  static toHTTPDetails(material: MaterialDetails) {
    return {
      id: material.id.toString(),
      companyId: material.companyId.toString(),
      groupId: material.groupId.toString(),
      group: material.group,
      code: material.code,
      name: material.name,
      description: material.description,
      unit: material.unit.code,
      active: material.active,
    };
  }
}
