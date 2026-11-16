import { Controller, Get, Patch, Param, Body, UseGuards } from '@nestjs/common';
import { UserService } from './user.service';
import { Roles } from '../user/roles.decorator';
import { RolesGuard } from '../user/roles.guard';
import { AuthGuard } from '@nestjs/passport';

@Controller('users')
@UseGuards(AuthGuard('jwt'), RolesGuard) // Applies RBAC guard
export class UserController {
  constructor(private readonly userService: UserService) {}

  // Moderator: view all users (name & email)
  @Get('moderator/list')
  @Roles('MODERATOR', 'ADMIN') // both moderator & admin can access
  async getUsersForModerator() {
    const users = await this.userService.getAllUsers();

    const filtered = users.filter((u) => u.role !== 'ADMIN');
    // Return only name & email
    return filtered.map((u) => ({
      name: u.name,
      email: u.email,
      role: u.role,
    }));
  }

  // Admin: view all users (name, email, role)
  @Get('admin/list')
  @Roles('ADMIN') // admin only
  async getUsersForAdmin() {
    const admin = await this.userService.getAllUsers();
    const adminfiltered = admin.filter((u) => u.role !== 'ADMIN');

    return adminfiltered.map((u) => ({
      id: u.id,
      name: u.name,
      email: u.email,
      role: u.role,
    }));
  }

  // Admin: update role
  @Patch(':id/role')
  @Roles('ADMIN') // admin only
  async changeUserRole(@Param('id') id: string, @Body('role') role: string) {
    return this.userService.updateUserRole(Number(id), role);
  }
}
