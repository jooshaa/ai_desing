import { Injectable } from '@nestjs/common';
import type { DesignStyleDto } from '@imora/shared-types';

@Injectable()
export class DesignService {
  listStyles(): DesignStyleDto[] {
    return [
      { id: 'modern', name: 'Modern', promptHint: 'clean lines, light oak, matte surfaces' },
      { id: 'classic', name: 'Classic', promptHint: 'warm millwork, soft gold, symmetry' },
      { id: 'minimal', name: 'Minimal', promptHint: 'white walls, hidden storage, few objects' },
    ];
  }
}
