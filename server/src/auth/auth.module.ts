import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { PrismaModule } from '../prisma/prisma.module';
import { JwtModule, JwtModuleOptions } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { PassportModule } from '@nestjs/passport';
import { JwtStrategy } from './jwt.startegy';

@Module({
  imports: [
    PrismaModule,

    // Make env readable everywhere
    ConfigModule.forRoot({ isGlobal: true }),

    // Register Passport with jwt strategy
    PassportModule.register({ defaultStrategy: 'jwt' }),

    // Register JWT with dynamic secret
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService): JwtModuleOptions => ({
        secret: configService.get<string>('ACCESS_TOKEN_SECRET') || 'defaultSecret',
        signOptions: {
          expiresIn: '1h',
        },
      }),
    }),
  ],

  controllers: [AuthController],

  providers: [
    AuthService,
    JwtStrategy, // MUST be included
  ],

  exports: [
    AuthService,
    JwtStrategy,
    PassportModule,
  ],
})
export class AuthModule {}



// import { Module } from '@nestjs/common';
// import { AuthService } from './auth.service';
// import { AuthController } from './auth.controller';
// import { PrismaModule } from '../prisma/prisma.module';
// import { JwtModule, JwtModuleOptions } from '@nestjs/jwt';
// import { ConfigService } from '@nestjs/config';

// @Module({
//   imports: [
//     PrismaModule,
//     JwtModule.registerAsync({
//       imports: [],
//       inject: [ConfigService],
//       useFactory: (configService: ConfigService): JwtModuleOptions => ({
//         secret: configService.get<string>('ACCESS_TOKEN_SECRET') || 'defaultSecret',
//         signOptions: { 
//   expiresIn: parseInt(configService.get<string>('ACCESS_TOKEN_EXPIRE_SEC') || '3600', 10),
// },

//       }),
//     }),
//   ],
//   controllers: [AuthController],
//   providers: [AuthService],
// })
// export class AuthModule {}
