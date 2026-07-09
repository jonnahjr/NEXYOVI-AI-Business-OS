import { Injectable, ConflictException, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma/prisma.service';
import { RegisterDto, LoginDto } from './dto/auth.dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwt: JwtService,
  ) {}

  async register(dto: RegisterDto) {
    const existing = await this.prisma.user.findUnique({ where: { email: dto.email } });
    if (existing) throw new ConflictException('Email already registered');

    const slug = dto.companyName.toLowerCase().replace(/\s+/g, '-') + '-' + Date.now();
    const hashed = await bcrypt.hash(dto.password, 12);

    const company = await this.prisma.company.create({
      data: { name: dto.companyName, slug },
    });

    const user = await this.prisma.user.create({
      data: {
        email: dto.email,
        password: hashed,
        firstName: dto.firstName,
        lastName: dto.lastName,
        role: 'ADMIN',
        companyId: company.id,
      },
    });

    const tokens = await this.generateTokens(user.id, user.email, user.role, company.id, company.name);
    return { user: this.sanitize(user), company, ...tokens };
  }

  async login(dto: LoginDto) {
    const user = await this.prisma.user.findUnique({ where: { email: dto.email } });
    if (!user || !user.isActive) throw new UnauthorizedException('Invalid credentials');

    const match = await bcrypt.compare(dto.password, user.password);
    if (!match) throw new UnauthorizedException('Invalid credentials');

    const company = await this.prisma.company.findUnique({ where: { id: user.companyId } });
    const tokens = await this.generateTokens(user.id, user.email, user.role, company?.id ?? '', company?.name ?? '');

    await this.prisma.user.update({
      where: { id: user.id },
      data: { refreshToken: await bcrypt.hash(tokens.refreshToken, 10) },
    });

    return { user: this.sanitize(user), company, ...tokens };
  }

  async logout(userId: string) {
    await this.prisma.user.update({ where: { id: userId }, data: { refreshToken: null } });
    return { message: 'Logged out successfully' };
  }

  private async generateTokens(userId: string, email: string, role: string, companyId = '', companyName = '') {
    const payload = { sub: userId, email, role, companyId, companyName };
    const [accessToken, refreshToken] = await Promise.all([
      this.jwt.signAsync(payload, { secret: process.env.JWT_SECRET || 'nexyovi-secret', expiresIn: '24h' }),
      this.jwt.signAsync(payload, { secret: process.env.JWT_REFRESH_SECRET || 'nexyovi-refresh-secret', expiresIn: '7d' }),
    ]);
    return { accessToken, refreshToken };
  }

  private sanitize(user: any) {
    const { password, refreshToken, ...safe } = user;
    return safe;
  }
}
