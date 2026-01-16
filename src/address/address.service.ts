import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateAddressDto } from './dto/address-create.dto';
import { UpdateAddressDto } from './dto/address-update.dto';
import { Prisma } from '@prisma/client';
import { sanitizeQuery } from 'src/common/sanitizers/query-sanitizers';
import { AddressQueryDto } from './dto/address-query.dto';
import { buildAddressSelectQuery } from './queries/address.query-builder';
import {
  ADDRESS_DEFAULT_SELECT,
  ALLOWED_ADDRESS_FIELDS,
} from './queries/address.default-query';

@Injectable()
export class AddressService {
  constructor(private prisma: PrismaService) {}

  async findAll(userId: string, query?: AddressQueryDto) {
    const fields = query?.fields;
    const sanitizedFields: string[] = sanitizeQuery(
      fields,
      ALLOWED_ADDRESS_FIELDS,
    );

    const select: Prisma.AddressSelect =
      buildAddressSelectQuery(sanitizedFields);

    const where: Prisma.AddressWhereInput = {
      userId,
    };

    if (query?.city) {
      where.city = { contains: query.city };
    }

    if (query?.country) {
      where.country = { contains: query.country };
    }

    if (query?.isDefault !== undefined) {
      where.isDefault = query.isDefault;
    }

    if (query?.search) {
      where.OR = [
        { street: { contains: query.search } },
        { city: { contains: query.search } },
      ];
    }

    const page: number = query?.page ?? 1;
    const limit: number = query?.limit ?? 10;
    const skip: number = (page - 1) * limit;

    const [addresses, total] = await Promise.all([
      this.prisma.address.findMany({
        where,
        select,
        skip,
        take: limit,
        orderBy: [{ isDefault: 'desc' }, { createdAt: 'desc' }],
      }),
      this.prisma.address.count({ where }),
    ]);

    return {
      data: addresses,
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findOne(id: number, userId: string, query?: AddressQueryDto) {
    const fields = query?.fields;
    const sanitizedFields: string[] = sanitizeQuery(
      fields,
      ALLOWED_ADDRESS_FIELDS,
    );

    const select: Prisma.AddressSelect =
      buildAddressSelectQuery(sanitizedFields);

    const address = await this.prisma.address.findUnique({
      where: { id },
      select,
    });

    if (!address) {
      throw new NotFoundException(`Address with ID ${id} not found`);
    }

    if (address.userId !== userId) {
      throw new BadRequestException('Unauthorized to access this address');
    }

    return address;
  }

  async create(createAddressDto: CreateAddressDto, userId: string) {
    if (createAddressDto.isDefault) {
      await this.prisma.address.updateMany({
        where: { userId, isDefault: true },
        data: { isDefault: false },
      });
    }

    return this.prisma.address.create({
      data: {
        ...createAddressDto,
        userId,
        isDefault: createAddressDto.isDefault ?? false,
      },
      select: ADDRESS_DEFAULT_SELECT,
    });
  }

  async update(id: number, userId: string, updateAddressDto: UpdateAddressDto) {
    const address = await this.prisma.address.findUnique({
      where: { id },
    });

    if (!address) {
      throw new NotFoundException(`Address with ID ${id} not found`);
    }

    if (address.userId !== userId) {
      throw new BadRequestException('Unauthorized to update this address');
    }

    if (updateAddressDto.isDefault) {
      await this.prisma.address.updateMany({
        where: { userId, id: { not: id }, isDefault: true },
        data: { isDefault: false },
      });
    }

    return this.prisma.address.update({
      where: { id },
      data: updateAddressDto,
      select: ADDRESS_DEFAULT_SELECT,
    });
  }

  async remove(id: number, userId: string) {
    const address = await this.prisma.address.findUnique({
      where: { id },
    });

    if (!address) {
      throw new NotFoundException(`Address with ID ${id} not found`);
    }

    if (address.userId !== userId) {
      throw new BadRequestException('Unauthorized to delete this address');
    }

    await this.prisma.address.delete({
      where: { id },
    });

    return { message: 'Address deleted successfully' };
  }

  async setDefault(id: number, userId: string) {
    const address = await this.prisma.address.findUnique({
      where: { id },
    });

    if (!address) {
      throw new NotFoundException(`Address with ID ${id} not found`);
    }

    if (address.userId !== userId) {
      throw new BadRequestException('Unauthorized to update this address');
    }

    await this.prisma.address.updateMany({
      where: { userId, isDefault: true },
      data: { isDefault: false },
    });

    return this.prisma.address.update({
      where: { id },
      data: { isDefault: true },
      select: ADDRESS_DEFAULT_SELECT,
    });
  }
}
