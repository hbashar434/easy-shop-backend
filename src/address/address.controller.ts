import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Query,
  ParseIntPipe,
  Request,
} from '@nestjs/common';
import { AddressService } from './address.service';
import { CreateAddressDto } from './dto/address-create.dto';
import { UpdateAddressDto } from './dto/address-update.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import {
  ApiTags,
  ApiOperation,
  ApiOkResponse,
  ApiUnauthorizedResponse,
  ApiBadRequestResponse,
  ApiNotFoundResponse,
  ApiBearerAuth,
  ApiParam,
} from '@nestjs/swagger';
import { AddressResponseDto } from './dto/address-response.dto';
import { AddressQueryDto } from './dto/address-query.dto';
import { AuthRequest } from '../common/interfaces/request.interface';

@ApiTags('Addresses')
@Controller('addresses')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class AddressController {
  constructor(private readonly addressService: AddressService) {}

  @Get()
  @ApiOperation({ summary: 'Get all addresses for authenticated user' })
  @ApiOkResponse({
    description: 'List of addresses retrieved successfully',
    schema: {
      type: 'object',
      properties: {
        data: {
          type: 'array',
          items: { $ref: '#/components/schemas/AddressResponseDto' },
        },
        meta: {
          type: 'object',
          properties: {
            page: { type: 'number', example: 1 },
            limit: { type: 'number', example: 10 },
            total: { type: 'number', example: 100 },
            totalPages: { type: 'number', example: 10 },
          },
        },
      },
    },
  })
  @ApiUnauthorizedResponse({ description: 'User is not authenticated' })
  @ApiBadRequestResponse({ description: 'Invalid filter parameters' })
  findAll(@Request() req: AuthRequest, @Query() query?: AddressQueryDto) {
    return this.addressService.findAll(req.user.sub, query);
  }

  @Post()
  @ApiOperation({ summary: 'Create a new address' })
  @ApiOkResponse({
    description: 'Address created successfully',
    type: AddressResponseDto,
  })
  @ApiUnauthorizedResponse({ description: 'User is not authenticated' })
  @ApiBadRequestResponse({ description: 'Invalid input data' })
  create(
    @Body() createAddressDto: CreateAddressDto,
    @Request() req: AuthRequest,
  ): Promise<AddressResponseDto> {
    return this.addressService.create(createAddressDto, req.user.sub);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get address by id' })
  @ApiParam({ name: 'id', description: 'Address ID' })
  @ApiOkResponse({
    description: 'Address retrieved successfully',
    type: AddressResponseDto,
  })
  @ApiUnauthorizedResponse({ description: 'User is not authenticated' })
  @ApiBadRequestResponse({ description: 'Unauthorized access' })
  @ApiNotFoundResponse({ description: 'Address not found' })
  findOne(
    @Param('id', ParseIntPipe) id: number,
    @Request() req: AuthRequest,
    @Query() query?: AddressQueryDto,
  ): Promise<AddressResponseDto> {
    return this.addressService.findOne(id, req.user.sub, query);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update address' })
  @ApiParam({ name: 'id', description: 'Address ID' })
  @ApiOkResponse({
    description: 'Address updated successfully',
    type: AddressResponseDto,
  })
  @ApiUnauthorizedResponse({ description: 'User is not authenticated' })
  @ApiBadRequestResponse({
    description: 'Invalid input data or unauthorized',
  })
  @ApiNotFoundResponse({ description: 'Address not found' })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateAddressDto: UpdateAddressDto,
    @Request() req: AuthRequest,
  ): Promise<AddressResponseDto> {
    return this.addressService.update(id, req.user.sub, updateAddressDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete address' })
  @ApiParam({ name: 'id', description: 'Address ID' })
  @ApiOkResponse({
    description: 'Address deleted successfully',
    schema: {
      type: 'object',
      properties: {
        message: {
          type: 'string',
          example: 'Address deleted successfully',
        },
      },
    },
  })
  @ApiUnauthorizedResponse({ description: 'User is not authenticated' })
  @ApiBadRequestResponse({ description: 'Unauthorized to delete this address' })
  @ApiNotFoundResponse({ description: 'Address not found' })
  remove(
    @Param('id', ParseIntPipe) id: number,
    @Request() req: AuthRequest,
  ): Promise<{ message: string }> {
    return this.addressService.remove(id, req.user.sub);
  }

  @Post(':id/set-default')
  @ApiOperation({ summary: 'Set address as default' })
  @ApiParam({ name: 'id', description: 'Address ID' })
  @ApiOkResponse({
    description: 'Address set as default successfully',
    type: AddressResponseDto,
  })
  @ApiUnauthorizedResponse({ description: 'User is not authenticated' })
  @ApiBadRequestResponse({ description: 'Unauthorized to update this address' })
  @ApiNotFoundResponse({ description: 'Address not found' })
  setDefault(
    @Param('id', ParseIntPipe) id: number,
    @Request() req: AuthRequest,
  ): Promise<AddressResponseDto> {
    return this.addressService.setDefault(id, req.user.sub);
  }
}
