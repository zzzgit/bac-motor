import PayoutTable from "../model/settle/PayoutTable"

/**
 * Default payout table.
 */
const defaultPayoutTable:PayoutTable = {
	banco: {
		nocommission: {
			normal: 1,
			six: .5,
		},
		traditional: .95,
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
	big: .54,
	small: 1.5,
}

export default defaultPayoutTable
