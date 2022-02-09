// eslint-disable-next-line @typescript-eslint/no-type-alias
type PayoutTable ={
	banker: {
		nocommission: {
			normal: number
			six: number
		}
		traditional: number
	}
	player: number
	tie: number
	superSix: {
		two: number
		three: number
	}
	pair: {
		bankerPair: number
		playerPair: number
		eitherPair: number
		perfectPair: {
			either: number
			both: number
		}
	}
	big: number
	small: number
}

export default PayoutTable
