import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { User, UserSchema } from './schemas/user.schema';
import { Session, SessionSchema } from './schemas/session.schema';
import { UserService } from './user.service';
import { UserRepository } from './repositories/user.repository';
import { SessionRepository } from './repositories/session.repository';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: User.name, schema: UserSchema },
      { name: Session.name, schema: SessionSchema },
    ]),
  ],
  providers: [UserService, UserRepository, SessionRepository],
  exports: [UserService, UserRepository, SessionRepository],
})
export class UserModule {}
