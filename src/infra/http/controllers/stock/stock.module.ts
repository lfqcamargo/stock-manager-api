import { Module } from '@nestjs/common';

import { CreateAddressingUseCase } from '@/domain/stock/application/use-cases/addressing/create-addressing';
import { DeleteAddressingUseCase } from '@/domain/stock/application/use-cases/addressing/delete-addressing';
import { EditAddressingUseCase } from '@/domain/stock/application/use-cases/addressing/edit-addressing';
import { FetchAddressingsUseCase } from '@/domain/stock/application/use-cases/addressing/fetch-addressings';
import { FindAddressingByIdUseCase } from '@/domain/stock/application/use-cases/addressing/find-addressing-by-id';
import { CreateGroupUseCase } from '@/domain/stock/application/use-cases/group/create-group';
import { DeleteGroupUseCase } from '@/domain/stock/application/use-cases/group/delete-group';
import { EditGroupUseCase } from '@/domain/stock/application/use-cases/group/edit-group';
import { FetchGroupsUseCase } from '@/domain/stock/application/use-cases/group/fetch-groups';
import { FindGroupByIdUseCase } from '@/domain/stock/application/use-cases/group/find-group-by-id';
import { CreateLocationUseCase } from '@/domain/stock/application/use-cases/location/create-location';
import { DeleteLocationUseCase } from '@/domain/stock/application/use-cases/location/delete-location';
import { EditLocationUseCase } from '@/domain/stock/application/use-cases/location/edit-location';
import { FetchLocationsUseCase } from '@/domain/stock/application/use-cases/location/fetch-locations';
import { FindLocationByIdUseCase } from '@/domain/stock/application/use-cases/location/find-location-by-id';
import { CreateMaterialUseCase } from '@/domain/stock/application/use-cases/material/create-material';
import { DeleteMaterialUseCase } from '@/domain/stock/application/use-cases/material/delete-material';
import { EditMaterialUseCase } from '@/domain/stock/application/use-cases/material/edit-material';
import { FetchMaterialsUseCase } from '@/domain/stock/application/use-cases/material/fetch-materials';
import { FindMaterialByIdUseCase } from '@/domain/stock/application/use-cases/material/find-material-by-id';
import { CreatePositionUseCase } from '@/domain/stock/application/use-cases/position/create-position';
import { DeletePositionUseCase } from '@/domain/stock/application/use-cases/position/delete-position';
import { EditPositionUseCase } from '@/domain/stock/application/use-cases/position/edit-position';
import { FetchPositionsUseCase } from '@/domain/stock/application/use-cases/position/fetch-positions';
import { FindPositionByIdUseCase } from '@/domain/stock/application/use-cases/position/find-position-by-id';
import { CreateRowUseCase } from '@/domain/stock/application/use-cases/row/create-row';
import { DeleteRowUseCase } from '@/domain/stock/application/use-cases/row/delete-row';
import { EditRowUseCase } from '@/domain/stock/application/use-cases/row/edit-row';
import { FetchRowsUseCase } from '@/domain/stock/application/use-cases/row/fetch-rows';
import { FindRowByIdUseCase } from '@/domain/stock/application/use-cases/row/find-row-by-id';
import { CreateShelfUseCase } from '@/domain/stock/application/use-cases/shelf/create-shelf';
import { DeleteShelfUseCase } from '@/domain/stock/application/use-cases/shelf/delete-shelf';
import { EditShelfUseCase } from '@/domain/stock/application/use-cases/shelf/edit-shelf';
import { FetchShelfsUseCase } from '@/domain/stock/application/use-cases/shelf/fetch-shelfs';
import { FindShelfByIdUseCase } from '@/domain/stock/application/use-cases/shelf/find-shelf-by-id';
import { CreateSubLocationUseCase } from '@/domain/stock/application/use-cases/sub-location/create-sub-location';
import { DeleteSubLocationUseCase } from '@/domain/stock/application/use-cases/sub-location/delete-sub-location';
import { EditSubLocationUseCase } from '@/domain/stock/application/use-cases/sub-location/edit-sub-location';
import { FetchSubLocationsUseCase } from '@/domain/stock/application/use-cases/sub-location/fetch-sub-locations';
import { FindSubLocationByIdUseCase } from '@/domain/stock/application/use-cases/sub-location/find-sub-location-by-id';
import { AppConfigModule } from '@/infra/config/app.config.module';
import { CryptographyModule } from '@/infra/cryptography/cryptography.module';
import { DatabaseModule } from '@/infra/database/database.module';
import { EnvModule } from '@/infra/env/env.module';

import { CreateAddressingController } from './addressing/create-addressing.controller';
import { DeleteAddressingController } from './addressing/delete-addressing.controller';
import { EditAddressingController } from './addressing/edit-addressing.controller';
import { FetchAddressingsController } from './addressing/fetch-addressings.controller';
import { FindAddressingByIdController } from './addressing/find-addressing-by-id.controller';
import { CreateGroupController } from './group/create-group.controller';
import { DeleteGroupController } from './group/delete-group.controller';
import { EditGroupController } from './group/edit-group.controller';
import { FetchGroupsController } from './group/fetch-groups.controller';
import { FindGroupByIdController } from './group/find-group-by-id.controller';
import { CreateLocationController } from './location/create-location.controller';
import { DeleteLocationController } from './location/delete-location.controller';
import { EditLocationController } from './location/edit-location.controller';
import { FetchLocationsController } from './location/fetch-locations.controller';
import { FindLocationByIdController } from './location/find-location-by-id.controller';
import { CreateMaterialController } from './material/create-material.controller';
import { DeleteMaterialController } from './material/delete-material.controller';
import { EditMaterialController } from './material/edit-material.controller';
import { FetchMaterialsController } from './material/fetch-materials.controller';
import { FindMaterialByIdController } from './material/find-material-by-id.controller';
import { CreatePositionController } from './position/create-position.controller';
import { DeletePositionController } from './position/delete-position.controller';
import { EditPositionController } from './position/edit-position.controller';
import { FetchPositionsController } from './position/fetch-positions.controller';
import { FindPositionByIdController } from './position/find-position-by-id.controller';
import { CreateRowController } from './row/create-row.controller';
import { DeleteRowController } from './row/delete-row.controller';
import { EditRowController } from './row/edit-row.controller';
import { FetchRowsController } from './row/fetch-rows.controller';
import { FindRowByIdController } from './row/find-row-by-id.controller';
import { CreateShelfController } from './shelf/create-shelf.controller';
import { DeleteShelfController } from './shelf/delete-shelf.controller';
import { EditShelfController } from './shelf/edit-shelf.controller';
import { FetchShelfsController } from './shelf/fetch-shelfs.controller';
import { FindShelfByIdController } from './shelf/find-shelf-by-id.controller';
import { CreateSubLocationController } from './sub-location/create-sub-location.controller';
import { DeleteSubLocationController } from './sub-location/delete-sub-location.controller';
import { EditSubLocationController } from './sub-location/edit-sub-location.controller';
import { FetchSubLocationsController } from './sub-location/fetch-sub-locations.controller';
import { FindSubLocationByIdController } from './sub-location/find-sub-location-by-id.controller';

@Module({
  imports: [DatabaseModule, CryptographyModule, AppConfigModule, EnvModule],
  controllers: [
    CreateAddressingController,
    CreateGroupController,
    CreateLocationController,
    CreateMaterialController,
    CreatePositionController,
    CreateRowController,
    CreateShelfController,
    CreateSubLocationController,
    FetchAddressingsController,
    FetchGroupsController,
    FetchLocationsController,
    FetchMaterialsController,
    FetchPositionsController,
    FetchRowsController,
    FetchShelfsController,
    FetchSubLocationsController,
    FindAddressingByIdController,
    FindGroupByIdController,
    FindLocationByIdController,
    FindMaterialByIdController,
    FindPositionByIdController,
    FindRowByIdController,
    FindShelfByIdController,
    FindSubLocationByIdController,
    EditAddressingController,
    EditGroupController,
    EditLocationController,
    EditMaterialController,
    EditPositionController,
    EditRowController,
    EditShelfController,
    EditSubLocationController,
    DeleteAddressingController,
    DeleteGroupController,
    DeleteLocationController,
    DeleteMaterialController,
    DeletePositionController,
    DeleteRowController,
    DeleteShelfController,
    DeleteSubLocationController,
  ],
  providers: [
    CreateAddressingUseCase,
    CreateGroupUseCase,
    CreateLocationUseCase,
    CreateMaterialUseCase,
    CreatePositionUseCase,
    CreateRowUseCase,
    CreateShelfUseCase,
    CreateSubLocationUseCase,
    FetchAddressingsUseCase,
    FetchGroupsUseCase,
    FetchLocationsUseCase,
    FetchMaterialsUseCase,
    FetchPositionsUseCase,
    FetchRowsUseCase,
    FetchShelfsUseCase,
    FetchSubLocationsUseCase,
    FindAddressingByIdUseCase,
    FindGroupByIdUseCase,
    FindLocationByIdUseCase,
    FindMaterialByIdUseCase,
    FindPositionByIdUseCase,
    FindRowByIdUseCase,
    FindShelfByIdUseCase,
    FindSubLocationByIdUseCase,
    EditAddressingUseCase,
    EditGroupUseCase,
    EditLocationUseCase,
    EditMaterialUseCase,
    EditPositionUseCase,
    EditRowUseCase,
    EditShelfUseCase,
    EditSubLocationUseCase,
    DeleteAddressingUseCase,
    DeleteGroupUseCase,
    DeleteLocationUseCase,
    DeleteMaterialUseCase,
    DeletePositionUseCase,
    DeleteRowUseCase,
    DeleteShelfUseCase,
    DeleteSubLocationUseCase,
  ],
})
export class StockModule {}
