import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Province } from 'src/entities/province.entity';
import { Ward } from 'src/entities/ward.entity';
import { ProvinceDto } from 'src/type/address';
import { Repository } from 'typeorm';

@Injectable()
export class AddressService {
  constructor(
    @InjectRepository(Province)
    private readonly provinceRepository: Repository<Province>,

    @InjectRepository(Ward)
    private readonly wardRepository: Repository<Ward>,
  ) {}

  async getAllProvinces(): Promise<ProvinceDto[]> {
    return await this.provinceRepository.find();
  }

  async getWardsByProvinceId(provinceId: string): Promise<Ward[]> {
    const paddedProvinceId = provinceId.toString().padStart(2, '0');
    return await this.wardRepository.find({
      where: { provinceId: paddedProvinceId },
    });
  }
}
