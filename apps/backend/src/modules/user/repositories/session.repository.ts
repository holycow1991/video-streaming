import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { BaseRepository } from '../../../common/repositories/base.repository';
import { Session, SessionDocument } from '../schemas/session.schema';

@Injectable()
export class SessionRepository extends BaseRepository<Session> {
  constructor(@InjectModel(Session.name) model: Model<Session>) {
    super(model);
  }

  async findByUserAndTokenId(
    userId: string,
    tokenId: string,
  ): Promise<SessionDocument | null> {
    return this.findOne({
      _id: tokenId,
      userId: new Types.ObjectId(userId),
    });
  }

  async deleteByUserId(userId: string): Promise<number> {
    return this.deleteMany({ userId: new Types.ObjectId(userId) });
  }

  async deleteByTokenId(tokenId: string): Promise<boolean> {
    return this.deleteOne({ _id: tokenId });
  }
}
