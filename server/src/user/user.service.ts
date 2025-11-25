import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Role } from '@prisma/client';

@Injectable()
export class UserService {
  constructor(private prisma: PrismaService) {}

  // Admin: update user role
  async updateUserRole(userId: number, role: string) {
    if (!['USER', 'MODERATOR', 'ADMIN'].includes(role)) {
      throw new BadRequestException('Invalid role');
    }
    return this.prisma.user.update({
      where: { id: userId },
      data: { role: role as Role },
    });
  }

  // Fetch all users
  async getAllUsers() {
    return this.prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
      },
    });
  }
}
