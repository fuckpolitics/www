import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '@www/common';

@Injectable()
export class AppService {
  private readonly logger = new Logger(AppService.name);

  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async getUser(id: string) {
    this.logger.log(`Getting user with id: ${id}`);
    const user = await this.userRepository.findOne({ where: { id } });
    
    if (!user) {
      throw new NotFoundException(`User with id ${id} not found`);
    }

    return {
      id: user.id,
      name: user.name,
      email: user.email,
      createdAt: user.createdAt,
    };
  }

  async getUserByEmail(email: string) {
    this.logger.log(`Getting user with email: ${email}`);
    const user = await this.userRepository.findOne({ where: { email } });
    
    if (!user) {
      throw new NotFoundException(`User with email ${email} not found`);
    }

    return {
      id: user.id,
      name: user.name,
      email: user.email,
      createdAt: user.createdAt,
    };
  }

  async createUser(data: { name: string; email: string }) {
    this.logger.log(`Creating user: ${JSON.stringify(data)}`);
    
    const user = this.userRepository.create({
      name: data.name,
      email: data.email,
    });

    const savedUser = await this.userRepository.save(user);

    return {
      id: savedUser.id,
      success: true,
      message: 'User created successfully',
    };
  }

  async updateUser(data: { id: string; name?: string; email?: string }) {
    this.logger.log(`Updating user ${data.id}`);
    
    const user = await this.userRepository.findOne({ where: { id: data.id } });
    if (!user) {
      throw new NotFoundException(`User with id ${data.id} not found`);
    }

    if (data.name) user.name = data.name;
    if (data.email) user.email = data.email;

    await this.userRepository.save(user);

    return {
      success: true,
      message: 'User updated successfully',
    };
  }

  async deleteUser(id: string) {
    this.logger.log(`Deleting user ${id}`);
    
    const result = await this.userRepository.delete(id);
    
    if (result.affected === 0) {
      throw new NotFoundException(`User with id ${id} not found`);
    }

    return {
      success: true,
      message: 'User deleted successfully',
    };
  }
}