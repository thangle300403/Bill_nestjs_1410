import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Transport } from 'src/entities/transport.entity';
import { Repository } from 'typeorm';

@Injectable()
export class TransportService {
  constructor(
    @InjectRepository(Transport)
    private readonly transportRepository: Repository<Transport>,
  ) {}

  async getShippingFeeByProvinceId(provinceId: number): Promise<number> {
    const transport = await this.transportRepository.findOne({
      where: { provinceId },
    });

    if (!transport) {
      throw new NotFoundException(
        'Không tìm thấy phí vận chuyển cho tỉnh này.',
      );
    }

    return transport.price;
  }
}
