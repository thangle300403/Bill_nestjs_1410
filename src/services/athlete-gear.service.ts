import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { AthleteGear } from 'src/entities/athlete_gear.entity';
import { formatProducts } from 'src/utils/format-product.util';
import { Repository } from 'typeorm';

@Injectable()
export class AthleteGearService {
  constructor(
    @InjectRepository(AthleteGear)
    private readonly athleteGearRepo: Repository<AthleteGear>,
  ) {}

  async getGearByAthleteName(name: string) {
    const athleteGearList = await this.athleteGearRepo.find({
      where: { athlete_name: name },
      relations: ['product'],
    });

    const formattedItems = formatProducts(
      athleteGearList.map((gear) => gear.product),
    );

    return {
      athleteName: name,
      items: formattedItems,
      totalItem: formattedItems.length,
      pagination: {
        page: '1',
        totalPage: '1',
      },
    };
  }

  async getAllAthletes(): Promise<string[]> {
    const results = await this.athleteGearRepo
      .createQueryBuilder('ag')
      .select('DISTINCT ag.athlete_name', 'athlete_name')
      .getRawMany();
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return, @typescript-eslint/no-unsafe-member-access
    return results.map((row) => row.athlete_name);
  }
}
