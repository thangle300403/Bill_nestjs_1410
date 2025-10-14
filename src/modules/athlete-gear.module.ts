import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AthleteGearController } from 'src/controllers/athlete-gear.controller';
import { AthleteGear } from 'src/entities/athlete_gear.entity';
import { AthleteGearService } from 'src/services/athlete-gear.service';

@Module({
  imports: [TypeOrmModule.forFeature([AthleteGear])],
  controllers: [AthleteGearController],
  providers: [AthleteGearService],
})
export class AthleteGearModule {}
