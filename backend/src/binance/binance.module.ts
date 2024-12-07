import { Module } from '@nestjs/common'
import { HttpModule } from '@nestjs/axios'

import { BinanceController } from './binance.controller'
import { BinanceService } from './binance.service'

@Module({
	imports: [HttpModule],
	controllers: [BinanceController],
	providers: [BinanceService]
})
export class BinanceModule {}
