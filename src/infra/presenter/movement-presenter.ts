import { Movement } from '@/domain/stock/enterprise/entities/movement';

export class MovementPresenter {
  static toHTTP(movement: Movement) {
    return {
      id: movement.id.toString(),
      addressingId: movement.addressingId.toString(),
      movementTypeId: movement.movementTypeId.toString(),
      movementTypeName: movement.movementTypeName,
      movementTypeDirection: movement.movementTypeDirection,
      userId: movement.userId.toString(),
      userName: movement.userName,
      quantity: movement.quantity,
      date: movement.date,
      observation: movement.observation,
      createdAt: movement.createdAt,
      locationId: movement.locationId,
      locationCode: movement.locationCode,
      locationName: movement.locationName,
      subLocationId: movement.subLocationId,
      subLocationCode: movement.subLocationCode,
      subLocationName: movement.subLocationName,
      rowId: movement.rowId,
      rowCode: movement.rowCode,
      rowName: movement.rowName,
      shelfId: movement.shelfId,
      shelfCode: movement.shelfCode,
      shelfName: movement.shelfName,
      positionId: movement.positionId,
      positionCode: movement.positionCode,
      positionName: movement.positionName,
      materialId: movement.materialId,
      materialCode: movement.materialCode,
      materialName: movement.materialName,
      materialDescription: movement.materialDescription,
      materialUnit: movement.materialUnit,
      materialPhotoUrl: movement.materialPhotoUrl ?? null,
      materialGroupId: movement.materialGroupId,
      materialGroupName: movement.materialGroupName,
    };
  }
}
