import { Module } from '@nestjs/common';
import { AppController } from './app.controller.js';
import { AppService } from './app.service.js';
import { AuthModule } from './auth/auth.module.js';
import { CircleModule } from './circle/circle.module.js';
import { PrismaModule } from './prisma/prisma.module.js';
import { TransfersModule } from './transfers/transfers.module.js';
import { TransactionsModule } from './transactions/transactions.module.js';
import { UsersModule } from './users/users.module.js';
import { WalletsModule } from './wallets/wallets.module.js';
import { WebhooksModule } from './webhooks/webhooks.module.js';

@Module({
  imports: [
    PrismaModule,
    CircleModule,
    AuthModule,
    UsersModule,
    WalletsModule,
    TransfersModule,
    TransactionsModule,
    WebhooksModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
