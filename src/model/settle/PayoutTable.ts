type PayoutTable = {
	banco: {
		nocommission: {
			normal: number
			six: number
		}
		traditional: number
	}
	punto: number
	tie: number
	superSix: {
		two: number
		three: number
	}
	pair: {
		BancoPair: number
		puntoPair: number
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
