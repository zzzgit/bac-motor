import PayoutTable from '../model/settle/PayoutTable'

/**
 * Default payout table.
 */
const defaultPayoutTable: PayoutTable = {
	banco: {
		nocommission: {
			normal: 1,
			six: 0.5,
		},
		traditional: 0.95,
	},
	punto: 1,
	tie: 8,
	superSix: {
		two: 12,
		three: 20,
	},
	pair: {
		BancoPair: 11,
		puntoPair: 11,
		eitherPair: 5,
		perfectPair: {
			either: 25,
			both: 250,
		},
	},
	big: 0.54,
	small: 1.5,
}

export default defaultPayoutTable
