import { Controller, Get, Param } from '@nestjs/common';
import { AthleteGearService } from 'src/services/athlete-gear.service';

@Controller('api/v1/athlete-gear')
export class AthleteGearController {
  constructor(private readonly athleteGearService: AthleteGearService) {}

  @Get('players')
  getAthletes() {
    return this.athleteGearService.getAllAthletes();
  }

  @Get(':name')
  async getGear(@Param('name') name: string) {
    const result = await this.athleteGearService.getGearByAthleteName(name);
    return result;
  }
}
