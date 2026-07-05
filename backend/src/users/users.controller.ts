import { Controller, Get, Post, Put, Delete, Body, Param } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { UsersService } from './users.service';

@ApiTags('Users')
@ApiBearerAuth()
@Controller('users')
export class UsersController {
  constructor(private usersService: UsersService) {}

  @Get(':companyId')
  @ApiOperation({ summary: 'Get all users in a company' })
  getAll(@Param('companyId') companyId: string) {
    return this.usersService.getAll(companyId);
  }

  @Get('profile/:id')
  @ApiOperation({ summary: 'Get user profile' })
  getProfile(@Param('id') id: string) {
    return this.usersService.getProfile(id);
  }

  @Post(':companyId')
  @ApiOperation({ summary: 'Create new user + employee record' })
  create(@Param('companyId') companyId: string, @Body() body: any) {
    return this.usersService.create(companyId, body);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update user' })
  update(@Param('id') id: string, @Body() body: any) {
    return this.usersService.update(id, body);
  }

  @Put(':id/toggle')
  @ApiOperation({ summary: 'Activate or deactivate user' })
  toggleActive(@Param('id') id: string) {
    return this.usersService.toggleActive(id);
  }
}
