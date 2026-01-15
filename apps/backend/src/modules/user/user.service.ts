import { Injectable } from '@nestjs/common';
import { User, UserDocument } from './schemas/user.schema';
import { UserRepository } from './repositories/user.repository';

@Injectable()
export class UserService {
  constructor(private readonly userRepository: UserRepository) {}

  async findByEmail(email: string): Promise<UserDocument | null> {
    return this.userRepository.findByEmail(email);
  }

  async findById(id: string): Promise<UserDocument | null> {
    return this.userRepository.findById(id);
  }

  async create(userData: Partial<User>): Promise<UserDocument> {
    return this.userRepository.create({
      ...userData,
      email: userData.email?.toLowerCase(),
    });
  }
}
