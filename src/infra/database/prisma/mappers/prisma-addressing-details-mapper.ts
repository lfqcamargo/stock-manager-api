import {
  Addressing as PrismaAddressing,
  Location as PrismaLocation,
  Material as PrismaMaterial,
  Position as PrismaPosition,
  Row as PrismaRow,
  Shelf as PrismaShelf,
  SubLocation as PrismaSubLocation,
} from '@generated/prisma/client';

import { UniqueEntityID } from '@/core/entities/unique-entity-id';
import { AddressingDetails } from '@/domain/stock/enterprise/entities/value-objects/addressing-details';

import { PrismaLocationMapper } from './prisma-location-mapper';
import { PrismaMaterialMapper } from './prisma-material-mapper';
import { PrismaPositionMapper } from './prisma-position-mapper';
import { PrismaRowMapper } from './prisma-row-mapper';
import { PrismaShelfMapper } from './prisma-shelf-mapper';
import { PrismaSubLocationMapper } from './prisma-sub-location-mapper';

type PrismaAddressingDetails = PrismaAddressing & {
  location: PrismaLocation;
  subLocation: PrismaSubLocation;
  row: PrismaRow;
  shelf: PrismaShelf;
  position: PrismaPosition;
  material: PrismaMaterial | null;
};

export class PrismaAddressingDetailsMapper {
  static toDomain(raw: PrismaAddressingDetails): AddressingDetails {
    return AddressingDetails.create({
      companyId: new UniqueEntityID(raw.companyId),
      id: new UniqueEntityID(raw.id),
      location: PrismaLocationMapper.toDomain(raw.location),
      subLocation: PrismaSubLocationMapper.toDomain(raw.subLocation),
      row: PrismaRowMapper.toDomain(raw.row),
      shelf: PrismaShelfMapper.toDomain(raw.shelf),
      position: PrismaPositionMapper.toDomain(raw.position),
      material: raw.material
        ? PrismaMaterialMapper.toDomain(raw.material)
        : null,
      amount: raw.amount,
      active: raw.active,
    });
  }
}
