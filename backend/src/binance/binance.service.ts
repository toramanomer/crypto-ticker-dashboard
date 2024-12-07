import { Injectable, ServiceUnavailableException } from '@nestjs/common'
import { HttpService } from '@nestjs/axios'
import { lastValueFrom, catchError } from 'rxjs'
import { AxiosError } from 'axios'

@Injectable()
export class BinanceService {
	private readonly BASE_URL = 'https://api.binance.com/api/v3'

	constructor(private readonly httpService: HttpService) {}

	async getTradingPairs() {
		const url = `${this.BASE_URL}/ticker/price`
		const response = await lastValueFrom(
			this.httpService.get(url).pipe(
				catchError((error: AxiosError) => {
					throw new ServiceUnavailableException()
				})
			)
		)

		return response.data.slice(0, 100)
	}
}
