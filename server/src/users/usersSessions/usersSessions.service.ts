import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { UsersSessions } from './usersSessions.model';
import * as crypto from 'crypto';

@Injectable()
export class UsersSessionsService {
  constructor(
    @InjectModel(UsersSessions)
    private userSessionRepository: typeof UsersSessions,
  ) {}

  async createSession(userId: number) {
    const { token } = this.generateToken();
    return await this.userSessionRepository.create({ userId, token });
  }

  async checkUser(dto: { token: string }) {
    return await this.userSessionRepository.findOne({
      where: { ...dto },
      include: { all: true },
    });
  }

  private generateToken() {
    return { token: crypto.randomBytes(16).toString('hex') };
  }
}
