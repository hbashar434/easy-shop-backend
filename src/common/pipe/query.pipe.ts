import { PipeTransform, Injectable, BadRequestException } from '@nestjs/common';

type QueryObject = Record<string, unknown>;

@Injectable()
export class QueryPipe implements PipeTransform<string, QueryObject> {
  transform(value: string): QueryObject {
    if (!value) {
      return {};
    }

    try {
      const parsed = JSON.parse(value) as unknown;

      if (typeof parsed !== 'object' || parsed === null) {
        throw new BadRequestException('Query parameter must be a JSON object');
      }

      return parsed as QueryObject;
    } catch (e) {
      throw new BadRequestException('Invalid JSON string in query parameter');
    }
  }
}
