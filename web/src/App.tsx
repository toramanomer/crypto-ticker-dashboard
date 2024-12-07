import { useEffect, useState } from 'react'
import {
	Container,
	Typography,
	List,
	ListItem,
	ListItemText,
	Paper,
	ThemeProvider,
	CssBaseline,
	createTheme
} from '@mui/material'

interface TradingPair {
	symbol: string
	price: string
}

const darkTheme = createTheme({
	palette: {
		mode: 'dark'
	}
})

export const App = () => {
	const [pairs, setPairs] = useState<TradingPair[]>([])

	useEffect(() => {
		const fetchPairs = async () => {
			try {
				const response = await fetch(
					'http://localhost:3000/binance/pairs'
				)
				const data = await response.json()
				setPairs(data)
			} catch (error) {
				console.error('Error fetching trading pairs:', error)
			}
		}

		fetchPairs()
	}, [])

	return (
		<ThemeProvider theme={darkTheme}>
			<CssBaseline />
			<Container maxWidth='md'>
				<Typography variant='h4' component='h1' gutterBottom>
					Crypto Trading Pairs
				</Typography>
				<Paper elevation={3}>
					<List>
						{pairs.map(pair => (
							<ListItem key={pair.symbol}>
								<ListItemText
									primary={pair.symbol}
									secondary={`Price: ${pair.price}`}
								/>
							</ListItem>
						))}
					</List>
				</Paper>
			</Container>
		</ThemeProvider>
	)
}
