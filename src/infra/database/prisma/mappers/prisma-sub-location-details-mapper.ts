import {
  Location as PrismaLocation,
  SubLocation as PrismaSubLocation,
} from '@generated/prisma/client';

import { UniqueEntityID } from '@/core/entities/unique-entity-id';
import { SubLocationDetails } from '@/domain/stock/enterprise/entities/value-objects/sub-location-details';

import { PrismaLocationMapper } from './prisma-location-mapper';

type PrismaSubLocationDetails = PrismaSubLocation & {
  location: PrismaLocation;
};

export class PrismaSubLocationDetailsMapper {
  static toDomain(raw: PrismaSubLocationDetails): SubLocationDetails {
    return SubLocationDetails.create({
      id: new UniqueEntityID(raw.id),
      companyId: new UniqueEntityID(raw.companyId),
      location: PrismaLocationMapper.toDomain(raw.location),
      code: raw.code,
      name: raw.name,
      description: raw.description,
    });
  }
}
