import {
  Controller,
  Post,
  Get,
  Delete,
  Param,
  Query,
  UploadedFile,
  UseInterceptors,
  UseGuards,
  Request,
  ParseIntPipe,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiConsumes,
  ApiBody,
  ApiParam,
  ApiBearerAuth,
  ApiUnauthorizedResponse,
  ApiForbiddenResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
} from '@nestjs/swagger';
import { UploadService } from './upload.service';
import { FilePurpose, EntityType, Role } from '@prisma/client';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { AuthRequest } from '../../common/interfaces/request.interface';
import { UploadResponseDto } from './dto/upload-response.dto';
import { QueryPipe } from '../../common/pipe/query.pipe';
import { UploadQueryDto } from './dto/upload-query.dto';

@ApiTags('Upload')
@Controller('upload')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class UploadController {
  constructor(private readonly uploadService: UploadService) {}

  @Post()
  @UseInterceptors(FileInterceptor('file'))
  @ApiOperation({ summary: 'Upload a file' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
          description: 'File to upload (max 1MB)',
        },
        filePurpose: {
          type: 'string',
          enum: Object.values(FilePurpose),
          description: 'Purpose of the file',
        },
        entityType: {
          type: 'string',
          enum: Object.values(EntityType),
          description: 'Type of entity this file is related to',
        },
        entityId: {
          type: 'string',
          description: 'ID of the related entity',
        },
      },
    },
  })
  @ApiResponse({ type: UploadResponseDto })
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  async upload(
    @UploadedFile() file: Express.Multer.File,
    @Query('filePurpose') filePurpose?: FilePurpose,
    @Query('entityType') entityType?: EntityType,
    @Query('entityId') entityId?: string,
    @Request() req?: AuthRequest,
  ) {
    return this.uploadService.uploadFile(
      file,
      filePurpose,
      entityType,
      entityId,
      req?.user?.sub,
    );
  }

  @Get()
  @Roles(Role.ADMIN, Role.MANAGER)
  @ApiOperation({ summary: 'Get all uploads with filters' })
  @ApiOkResponse({
    description: 'List of uploads retrieved successfully',
    type: [UploadResponseDto],
  })
  @ApiUnauthorizedResponse({ description: 'User is not authenticated' })
  @ApiForbiddenResponse({
    description: 'User does not have sufficient permissions',
  })
  findAll(@Query('query', QueryPipe) query: UploadQueryDto) {
    return this.uploadService.findAll(query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get upload by id' })
  @ApiParam({ name: 'id', description: 'Upload ID' })
  @ApiOkResponse({
    description: 'Upload retrieved successfully',
    type: UploadResponseDto,
  })
  @ApiUnauthorizedResponse({ description: 'User is not authenticated' })
  @ApiNotFoundResponse({ description: 'Upload not found' })
  findOne(
    @Param('id', ParseIntPipe) id: number,
    @Query('query', QueryPipe) query?: UploadQueryDto,
  ) {
    return this.uploadService.findOne(id, query);
  }

  @Delete(':id')
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Delete upload (soft delete)' })
  @ApiParam({ name: 'id', description: 'Upload ID' })
  @ApiOkResponse({
    description: 'Upload deleted successfully',
    schema: {
      type: 'object',
      properties: {
        message: {
          type: 'string',
          example: 'Upload deleted successfully',
        },
      },
    },
  })
  @ApiUnauthorizedResponse({ description: 'User is not authenticated' })
  @ApiForbiddenResponse({
    description: 'User does not have sufficient permissions',
  })
  @ApiNotFoundResponse({ description: 'Upload not found' })
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.uploadService.remove(id);
  }

  @Post(':id/restore')
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Restore deleted upload' })
  @ApiParam({ name: 'id', description: 'Upload ID' })
  @ApiOkResponse({
    description: 'Upload restored successfully',
    type: UploadResponseDto,
  })
  @ApiUnauthorizedResponse({ description: 'User is not authenticated' })
  @ApiForbiddenResponse({
    description: 'User does not have sufficient permissions',
  })
  @ApiNotFoundResponse({ description: 'Upload not found' })
  restore(@Param('id', ParseIntPipe) id: number) {
    return this.uploadService.restore(id);
  }
}
