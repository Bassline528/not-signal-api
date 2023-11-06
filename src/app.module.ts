import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { I18nModule } from 'nestjs-i18n/dist/i18n.module';

import databaseConfig from './config/database.config';
import authConfig from './config/auth.config';
import appConfig from './config/app.config';
// import mailConfig from './config/mail.config';
// import fileConfig from './config/file.config';
// import googleConfig from './config/google.config';
import { UserModule } from './user/user.module';
import { AuthModule } from './auth/auth.module';
import { TypeOrmConfigService } from './database/typeorm-config.services';
import { DataSource, DataSourceOptions } from 'typeorm';
import { RoomModule } from './room/room.module';
import { ChatGateway } from './chat/chat.gateway';
import { ChatModule } from './chat/chat.module';


@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [
        databaseConfig,
        authConfig,
        appConfig,
        // mailConfig,
        // fileConfig,
        // googleConfig,
      ],
      envFilePath: ['.env'],
    }),
    TypeOrmModule.forRootAsync({
      useClass: TypeOrmConfigService,
      dataSourceFactory: async (options: DataSourceOptions) => {
        return new DataSource(options).initialize();
      },
    }),
    UserModule,
    AuthModule,
    RoomModule,
    ChatModule,
  ],
  providers: [ChatGateway],
})
export class AppModule {}
