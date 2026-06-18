import { Module } from '@nestjs/common';

import { CreateGroupUseCase } from '@/domain/stock/application/use-cases/group/create-group';
import { DeleteGroupUseCase } from '@/domain/stock/application/use-cases/group/delete-group';
import { EditGroupUseCase } from '@/domain/stock/application/use-cases/group/edit-group';
import { FetchGroupsUseCase } from '@/domain/stock/application/use-cases/group/fetch-groups';
import { FindGroupByIdUseCase } from '@/domain/stock/application/use-cases/group/find-group-by-id';
import { CreateMaterialUseCase } from '@/domain/stock/application/use-cases/material/create-material';
import { DeleteMaterialUseCase } from '@/domain/stock/application/use-cases/material/delete-material';
import { EditMaterialUseCase } from '@/domain/stock/application/use-cases/material/edit-material';
import { FetchMaterialsUseCase } from '@/domain/stock/application/use-cases/material/fetch-materials';
import { FindMaterialByIdUseCase } from '@/domain/stock/application/use-cases/material/find-material-by-id';
import { AppConfigModule } from '@/infra/config/app.config.module';
import { CryptographyModule } from '@/infra/cryptography/cryptography.module';
import { DatabaseModule } from '@/infra/database/database.module';
import { EnvModule } from '@/infra/env/env.module';

import { CreateGroupController } from './group/create-group.controller';
import { DeleteGroupController } from './group/delete-group.controller';
import { EditGroupController } from './group/edit-group.controller';
import { FetchGroupsController } from './group/fetch-groups.controller';
import { FindGroupByIdController } from './group/find-group-by-id.controller';
import { CreateMaterialController } from './material/create-material.controller';
import { DeleteMaterialController } from './material/delete-material.controller';
import { EditMaterialController } from './material/edit-material.controller';
import { FetchMaterialsController } from './material/fetch-materials.controller';
import { FindMaterialByIdController } from './material/find-material-by-id.controller';

@Module({
  imports: [DatabaseModule, CryptographyModule, AppConfigModule, EnvModule],
  controllers: [
    CreateGroupController,
    CreateMaterialController,
    FetchGroupsController,
    FetchMaterialsController,
    FindGroupByIdController,
    FindMaterialByIdController,
    EditGroupController,
    EditMaterialController,
    DeleteGroupController,
    DeleteMaterialController,
  ],
  providers: [
    CreateGroupUseCase,
    CreateMaterialUseCase,
    FetchGroupsUseCase,
    FetchMaterialsUseCase,
    FindGroupByIdUseCase,
    FindMaterialByIdUseCase,
    EditGroupUseCase,
    EditMaterialUseCase,
    DeleteGroupUseCase,
    DeleteMaterialUseCase,
  ],
})
export class StockModule {}
