import { useEffect, useState } from 'react'
import {
	Container,
	createTheme,
	CssBaseline,
	Paper,
	Table,
	TableBody,
	TableCell,
	TableContainer,
	TableHead,
	TableRow,
	ThemeProvider,
	Typography
} from '@mui/material'
import { io } from 'socket.io-client'

const socket = io('http://localhost:3000')

interface TradingPair {
	symbol: string
	lastPrice: string
	priceChangePercent: string
	highPrice: string
	lowPrice: string
	priceChange: string
}

function formatCurrency(value: string): string {
	return new Intl.NumberFormat('en-US', {
		style: 'currency',
		currency: 'USD',
		minimumFractionDigits: 2,
		maximumFractionDigits: 2
	}).format(parseFloat(value))
}

export const App = () => {
	const [pairs, setPairs] = useState<Record<string, TradingPair>>({})

	useEffect(() => {
		fetch('http://localhost:3000/binance/pairs')
			.then(res => res.json())
			.then((data: TradingPair[]) => {
				setPairs(
					data.reduce<typeof pairs>(
						(pairs, pair) => ({ ...pairs, [pair.symbol]: pair }),
						{}
					)
				)
				socket.emit(
					'subscribeToPairs',
					data.map(pair => pair.symbol)
				)
			})

		socket.on('tickerUpdate', update => {
			setPairs(pairs => ({
				...pairs,
				[update.symbol]: {
					...update.symbol,
					...update
				}
			}))
		})

		return () => {
			socket.disconnect()
		}
	}, [])

	return (
		<ThemeProvider
			theme={createTheme({
				palette: {
					mode: 'dark'
				}
			})}
		>
			<CssBaseline />
			<Container maxWidth='lg'>
				<Typography
					variant='h4'
					component='h1'
					gutterBottom
					textAlign='center'
				>
					Crypto Trading Pairs
				</Typography>
				<TableContainer component={Paper} sx={{ overflowX: 'initial' }}>
					<Table stickyHeader>
						<TableHead>
							<TableRow>
								<TableCell>Name</TableCell>
								<TableCell align='right'>Price</TableCell>
								<TableCell align='right'>24h High</TableCell>
								<TableCell align='right'>24h Low</TableCell>
								<TableCell align='right'>24h Change</TableCell>
								<TableCell align='right'>
									24h Change %
								</TableCell>
							</TableRow>
						</TableHead>
						<TableBody>
							{Object.values(pairs).map(pair => {
								return (
									<TableRow
										key={pair.symbol}
										hover
										role='checkbox'
										tabIndex={-1}
									>
										<TableCell>{pair.symbol}</TableCell>
										<TableCell align='right'>
											{formatCurrency(pair.lastPrice)}
										</TableCell>
										<TableCell align='right'>
											{formatCurrency(pair.highPrice)}
										</TableCell>
										<TableCell align='right'>
											{formatCurrency(pair.lowPrice)}
										</TableCell>
										<TableCell
											align='right'
											sx={{
												color:
													(
														parseFloat(
															pair.priceChange
														) >= 0
													) ?
														'success.main'
													:	'error.main'
											}}
										>
											{formatCurrency(pair.priceChange)}
										</TableCell>
										<TableCell
											align='right'
											sx={{
												color:
													(
														parseFloat(
															pair.priceChangePercent
														) >= 0
													) ?
														'success.main'
													:	'error.main'
											}}
										>
											{parseFloat(
												pair.priceChangePercent
											).toFixed(2)}
											%
										</TableCell>
									</TableRow>
								)
							})}
						</TableBody>
					</Table>
				</TableContainer>
			</Container>
		</ThemeProvider>
	)
}
